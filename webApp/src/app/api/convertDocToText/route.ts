import { ConvertDocToTextResponse } from './types';
import { parseStrictJson } from '@/features/Ai/jsonParser';
import { generateTextWithAi } from '@/app/api/ai/generateTextWithAi';
import { z } from 'zod';

const bookMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  author: z.string(),
});

const metadataInputSchema = z.object({
  textPreview: z.string().trim().min(1).max(8_000),
});

export const maxDuration = 60;

export async function POST(request: Request) {
  const requestStart = Date.now();

  try {
    console.info('[convertDocToText] request started', {
      method: request.method,
      contentType: request.headers.get('content-type') || null,
      contentLength: request.headers.get('content-length') || null,
    });

    console.info('[convertDocToText] parsing metadata request body');
    const payload = metadataInputSchema.safeParse(await request.json());
    if (!payload.success) {
      console.warn('[convertDocToText] validation failed: invalid payload shape', {
        issues: payload.error.issues,
      });
      const response: ConvertDocToTextResponse = {
        error: 'Invalid metadata request payload.',
      };
      return Response.json(response, { status: 400 });
    }

    const previewText = payload.data.textPreview;

    console.info('[convertDocToText] extracting metadata with AI', {
      previewChars: previewText.length,
    });

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

    const metadata = {
      title: parsedMetadata.title.trim(),
      subtitle: parsedMetadata.subtitle.trim(),
      author: parsedMetadata.author.trim(),
    };

    console.info('[convertDocToText] metadata extracted', {
      hasTitle: Boolean(metadata.title),
      hasSubtitle: Boolean(metadata.subtitle),
      hasAuthor: Boolean(metadata.author),
    });

    const response: ConvertDocToTextResponse = {
      metadata,
    };

    console.info('[convertDocToText] request succeeded', {
      durationMs: Date.now() - requestStart,
      previewChars: previewText.length,
    });

    return Response.json(response);
  } catch (error) {
    console.error('[convertDocToText] route error', {
      durationMs: Date.now() - requestStart,
      error,
    });
    const response: ConvertDocToTextResponse = {
      error: 'Failed to convert EPUB to text. Please try another file.',
    };
    return Response.json(response, { status: 500 });
  }
}
