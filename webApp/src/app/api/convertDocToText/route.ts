import { parseEpub } from 'epub2md';
import { ConvertDocToTextResponse } from './types';
import { parseStrictJson } from '@/features/Ai/jsonParser';
import { generateTextWithAi } from '@/app/api/ai/generateTextWithAi';
import { z } from 'zod';

const bookMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  author: z.string(),
});

const METADATA_PREVIEW_CHARS = 700;

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

const getImageMimeType = (href: string): string | null => {
  const lowerHref = href.toLowerCase();
  const matchedExtension = Object.keys(IMAGE_EXT_TO_MIME).find((ext) => lowerHref.endsWith(ext));
  if (!matchedExtension) return null;
  return IMAGE_EXT_TO_MIME[matchedExtension];
};

const extractImageDataUrlByHref = async (parsed: unknown): Promise<Record<string, string>> => {
  const imageDataUrlByHref: Record<string, string> = {};
  const parsedRecord = parsed as {
    structure?: {
      opf?: {
        manifest?: {
          manifest?: Array<{ href?: string }>;
        };
      };
    };
    sections?: Array<{
      _getFile?: (href: string) => Promise<{ asNodeBuffer?: () => Buffer }>;
    }>;
  };

  const getFile = parsedRecord.sections?.[0]?._getFile;
  const manifestItems = parsedRecord.structure?.opf?.manifest?.manifest ?? [];

  if (!getFile || !manifestItems.length) {
    return imageDataUrlByHref;
  }

  for (const item of manifestItems) {
    const href = item.href?.trim();
    if (!href) continue;

    const mimeType = getImageMimeType(href);
    if (!mimeType) continue;

    const normalizedHref = normalizeImageHref(href);
    if (!normalizedHref || imageDataUrlByHref[normalizedHref]) continue;

    try {
      const file = await getFile(href);
      const buffer = file?.asNodeBuffer?.();
      if (!buffer || buffer.length === 0) continue;
      imageDataUrlByHref[normalizedHref] = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (fileError) {
      console.error('EPUB image extraction error', { href, fileError });
    }
  }

  return imageDataUrlByHref;
};

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      const response: ConvertDocToTextResponse = {
        error: 'File not found',
      };
      return Response.json(response, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isEpubType =
      file.type === 'application/epub+zip' ||
      fileName.endsWith('.epub') ||
      file.type === 'application/octet-stream';

    if (!isEpubType) {
      const response: ConvertDocToTextResponse = {
        error: 'Only EPUB files are supported',
      };
      return Response.json(response, { status: 400 });
    }

    const maxAllowedFileBytes = 50 * 1024 * 1024;
    if (file.size > maxAllowedFileBytes) {
      const response: ConvertDocToTextResponse = {
        error: 'EPUB file is too large. Please use a file up to 50MB.',
      };
      return Response.json(response, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const parsed = await parseEpub(Buffer.from(arrayBuffer), {
      type: 'buffer',
      expand: true,
    });

    const markdownSections = parsed.sections
      .map((section) => section.toMarkdown())
      .map((value) => value.trim())
      .filter(Boolean);
    const markdown = markdownSections
      .join('\n\n')
      .split(`<?xml version='1.0' encoding='utf-8'?>`)
      .join('\n');
    const imageDataUrlByHref = await extractImageDataUrlByHref(parsed);

    if (!markdown) {
      const response: ConvertDocToTextResponse = {
        error: 'Could not extract text from this EPUB.',
      };
      return Response.json(response, { status: 422 });
    }

    let metadata = {
      title: '',
      subtitle: '',
      author: '',
    };

    const previewText = markdown.slice(0, METADATA_PREVIEW_CHARS).trim();
    if (previewText) {
      try {
        const parsedMetadata = await parseStrictJson({
          json: (
            await generateTextWithAi({
              systemMessage: [
                'You extract book metadata from text snippets.',
                'Return strict JSON with keys: title, subtitle, author.',
                'If subtitle is explicitly present in the text, use it.',
                'If subtitle is not explicitly present, generate one subtitle line based on the text.',
                'Generated subtitle must be 6 to 10 words.',
                'Subtitle language must match the book text language.',
                'Subtitle must be plain text in one line without quotes or punctuation at the ends.',
                'If author is missing, return an empty string for author.',
                'Return only JSON.',
              ].join('\n'),
              userMessage: previewText,
              model: 'gpt-4o',
            })
          ).output,
          schema: bookMetadataSchema,
          generate: async ({ systemMessage, userMessage, model }) => {
            const { output } = await generateTextWithAi({
              systemMessage,
              userMessage,
              model,
            });
            return output || '';
          },
          languageCode: 'en',
        });

        metadata = {
          title: parsedMetadata.title.trim(),
          subtitle: parsedMetadata.subtitle.trim(),
          author: parsedMetadata.author.trim(),
        };
      } catch (metadataError) {
        console.error('Book metadata extraction error', metadataError);
      }
    }

    const response: ConvertDocToTextResponse = {
      markdown,
      metadata,
      imageDataUrlByHref,
    };

    return Response.json(response);
  } catch (error) {
    console.error('convertDocToText route error', error);
    const response: ConvertDocToTextResponse = {
      error: 'Failed to convert EPUB to text. Please try another file.',
    };
    return Response.json(response, { status: 500 });
  }
}
