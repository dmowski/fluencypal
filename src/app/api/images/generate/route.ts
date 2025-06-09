import {
  convertNameIntoId,
  getImagePublicUrl,
  openAiImageDescriptions,
  paintingVersionDescriptions,
} from "@/features/Game/ImagesDescriptions";
import { generateImageBuffer } from "../generateImage";
import { resizeImage } from "../resizeImage";
import { uploadImage } from "../uploadImage";
import { getClient } from "../mj/getClient";
import { generateImagesBuffers } from "../mj/generateImagesBuffers";

const isImageGenerated = async (url: string): Promise<boolean> => {
  const fetchResult = await fetch(url);
  const contentType = fetchResult.headers.get("Content-Type");
  const isImage = contentType?.startsWith("image/") || false;
  return isImage;
};

export async function GET(request: Request) {
  const useOpenAi = false;
  if (useOpenAi) {
    let generatedImages = await Promise.all(
      openAiImageDescriptions.map(async (image) => {
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
    return Response.json({ generatedImages });
  } else {
    let generatedImages = await Promise.all(
      paintingVersionDescriptions.map(async (image) => {
        const name = convertNameIntoId(image.shortDescription);
        const url = getImagePublicUrl(name, "0");
        const isGenerated = await isImageGenerated(url);
        return {
          ...image,
          isGenerated,
          url,
        };
      })
    );

    const nonGeneratedImages = generatedImages.filter((image) => !image.isGenerated);
    console.log("nonGeneratedImages", nonGeneratedImages);
    const resizedImages: string[] = [];

    if (nonGeneratedImages.length > 0) {
      const mjClient = await getClient();

      for (const nonGeneratedImage of nonGeneratedImages) {
        const prompt =
          nonGeneratedImage.shortDescription + ". " + nonGeneratedImage.fullImageDescription;
        console.log("-------------------------------");
        console.log(prompt);
        const results = await generateImagesBuffers(mjClient, prompt);

        const tempResizedImages = await Promise.all(
          results.map(async (imageBuffer, index) => {
            const resizedImage = await resizeImage(imageBuffer, 1024, "webp");
            const id = convertNameIntoId(nonGeneratedImage.shortDescription);
            const name = id + "_" + index + ".webp" || `image-${Date.now()}.webp`;
            console.log("name", name);
            return await uploadImage({
              imageBuffer: resizedImage,
              extension: "webp",
              name: name,
            });
          })
        );
        resizedImages.push(...tempResizedImages);
      }
      return Response.json({ resizedImages });
    } else {
      console.log("All images are already generated");
      return Response.json({ generatedImages });
    }
  }
}
