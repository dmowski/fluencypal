import { imageDescriptions } from '@/features/Game/ImagesDescriptions';
const defaultSize = 700;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const size = parseInt(searchParams.get('size') || `${defaultSize}`);
  const maxWidth = Math.min(size, defaultSize); // Ensure max width is no more than 500px

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Image Previews</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .image-container { margin-bottom: 30px; }
          img { max-width: ${maxWidth}px; height: auto; display: block; margin-bottom: 5px; }
          p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Image Previews (${imageDescriptions.length})</h1>
        ${imageDescriptions
          .reverse()
          .map(
            (img) => `
          <div class="image-container">
            <img src="${img.url || '/placeholder-image.jpg'}" alt="${img.shortDescription}" />
            <p>${img.shortDescription}</p>
            <p><small>${img.fullImageDescription}</small></p>
          </div>
        `,
          )
          .join('')}
      </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
