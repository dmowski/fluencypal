import sharp from "sharp";

export const resizeImage = async (
  imageBuffer: Buffer<ArrayBuffer>,
  size: number,
  extension: "webp" | "jpeg" | "png"
): Promise<Buffer<ArrayBufferLike>> => {
  const processedImage = sharp(imageBuffer).resize(size).toFormat(extension);
  const smallImage = await processedImage.toBuffer();
  return smallImage;
};
