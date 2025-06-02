import { imageDescriptions } from "@/features/Game/ImagesServer";
import { generateImageBuffer } from "../generateImage";
import { resizeImage } from "../resizeImage";
import { uploadImage } from "../uploadImage";

const isImageGenerated = async (url: string): Promise<boolean> => {
  const fetchResult = await fetch(url);
  const contentType = fetchResult.headers.get("Content-Type");
  const isImage = contentType?.startsWith("image/") || false;
  return isImage;
};

export async function GET(request: Request) {
  let generatedImages = await Promise.all(
    imageDescriptions.map(async (image) => {
      const isGenerated = await isImageGenerated(image.url);
      return {
        ...image,
        isGenerated,
      };
    })
  );

  const nonGeneratedImages = generatedImages.filter((image) => !image.isGenerated);

  await Promise.all(
    nonGeneratedImages.map(async (nonGeneratedImage) => {
      const generateImage = await generateImageBuffer(nonGeneratedImage.fullImageDescription);
      const resizedImage = await resizeImage(generateImage, 1024, "webp");
      await uploadImage({
        imageBuffer: resizedImage,
        extension: "webp",
        name: nonGeneratedImage.id + ".webp" || `image-${Date.now()}.webp`,
      });
      nonGeneratedImage.isGenerated = true;
    })
  );

  return Response.json({ description: "hello", generatedImages });
}
