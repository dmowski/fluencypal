import OpenAI from 'openai';

interface IWantResponse {
  resultMarkdown?: string;
  error?: string;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;

  if (!openAIKey) {
    const response: IWantResponse = {
      error: 'OPENAI_API_KEY is not set',
    };
    return Response.json(response, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      const response: IWantResponse = {
        error: 'File not found',
      };
      return Response.json(response, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      const response: IWantResponse = {
        error: 'Only image files are supported',
      };
      return Response.json(response, { status: 400 });
    }

    const maxAllowedFileBytes = 12 * 1024 * 1024;
    if (file.size > maxAllowedFileBytes) {
      const response: IWantResponse = {
        error: 'Image is too large. Please use a file up to 12MB.',
      };
      return Response.json(response, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const client = new OpenAI({
      apiKey: openAIKey,
    });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a playful assistant. Analyze the uploaded photo and infer what the person likely wants or needs right now.

Return a short markdown response with: title and description of one practical need.

Keep it light and kind.

Short description should be written from the first person perspective, as if the person in the photo is describing their own feelings and needs.

Response format:
## I Just want {ONE_WORD_TITLE}

{SHORT_DESCRIPTION_FROM_FIRST_PERSON}

`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What do I want or need based on this photo?',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const output = completion.choices[0]?.message?.content?.trim();

    const response: IWantResponse = {
      resultMarkdown: output || 'No info',
    };

    return Response.json(response);
  } catch (error) {
    console.error('iWant route error', error);
    const response: IWantResponse = {
      error: 'Failed to process your photo. Please try again.',
    };
    return Response.json(response, { status: 500 });
  }
}
