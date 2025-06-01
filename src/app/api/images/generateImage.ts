import OpenAI from "openai";

export const generateImageBuffer = async (description: string): Promise<Buffer<ArrayBuffer>> => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt: description,
    size: "1024x1024",
  });

  // Save the image to a file
  const image_base64 = result?.data?.[0].b64_json;
  if (!image_base64) {
    throw new Error("Image generation failed, no base64 data returned");
  }
  const image_bytes = Buffer.from(image_base64, "base64");
  return image_bytes;
};
