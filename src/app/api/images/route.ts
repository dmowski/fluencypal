import { generateImageBuffer } from "./generateImage";
import { resizeImage } from "./resizeImage";
import { uploadImage } from "./uploadImage";

export async function GET(request: Request) {
  const queryParams = new URL(request.url).searchParams;
  const description = queryParams.get("description");
  const fileName = queryParams.get("fileName");
  if (!description) {
    return Response.json(
      { error: "Description parameter is required" },
      { status: 400 },
    );
  }

  console.log("Generating image for description:", description);
  const generateImage = await generateImageBuffer(description);
  console.log("Image generated successfully, resizing...");

  const resizedImage = await resizeImage(generateImage, 1024, "webp");
  console.log("Image resized successfully, uploading...");
  const imageUrl = await uploadImage({
    imageBuffer: resizedImage,
    extension: "webp",
    name: fileName + ".webp" || `image-${Date.now()}.webp`,
  });

  return Response.json({ description, imageUrl });
}
