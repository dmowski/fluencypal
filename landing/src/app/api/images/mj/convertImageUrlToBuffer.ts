export const convertImageUrlToBuffer = async (imageUrl: string): Promise<Buffer> => {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
