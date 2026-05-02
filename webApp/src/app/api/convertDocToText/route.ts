import { parseEpub } from 'epub2md';
import markdownToTxt from 'markdown-to-txt';
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
    const markdown = markdownSections.join('\n\n');

    let text = markdownToTxt(markdown).trim();

    if (!text) {
      const rawHtml = parsed.sections
        .map((section) => section.htmlString || '')
        .map((value) => value.trim())
        .filter(Boolean)
        .join('\n\n');
      text = markdownToTxt(rawHtml.replace(/<[^>]*>/g, ' ')).trim();
    }

    if (!text) {
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

    const previewText = text.slice(0, METADATA_PREVIEW_CHARS).trim();
    if (previewText) {
      try {
        const parsedMetadata = await parseStrictJson({
          json: (
            await generateTextWithAi({
              systemMessage: [
                'You extract book metadata from text snippets.',
                'Return strict JSON with keys: title, subtitle, author.',
                'If subtitle is missing, return an empty string for subtitle.',
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
      text,
      metadata,
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
