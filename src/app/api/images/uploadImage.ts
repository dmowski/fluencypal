import { getBucket } from "../config/firebase";

export const uploadImage = async ({
  extension,
  imageBuffer,
  name,
}: {
  imageBuffer: Buffer<ArrayBufferLike>;
  name?: string;
  extension: "webp" | "jpeg" | "png";
}): Promise<string> => {
  const bucket = getBucket();
  const randomName = Date.now().toString(10);
  const finalName = name || `${randomName}.min.${extension}`;
  const filePath = `images/${finalName}`;
  const file = bucket.file(filePath);
  await file.save(imageBuffer);
  await file.makePublic();
  return file.publicUrl();
};
