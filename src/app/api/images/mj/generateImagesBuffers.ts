import { Midjourney } from "midjourney";
import { splitImageTo4 } from "./splitImageTo4";

export const generateImagesBuffers = async (
  client: Midjourney,
  prompt: string
): Promise<Buffer[]> => {
  return new Promise<Buffer[]>(async (resolve) => {
    const timeout = setTimeout(() => {
      console.log("Image generation timed out");
      resolve([]);
    }, 4 * 60_000);

    const Imagine = await client.Imagine(prompt.trim(), (uri: string, progress: string) => {
      console.log(`image generating:`, progress);
    });

    if (!Imagine || !Imagine.id) {
      console.log("No message");
      clearTimeout(timeout);
      return resolve([]);
    }
    console.log("Before splitting image");
    const buffers = await splitImageTo4(Imagine.uri);
    clearTimeout(timeout);

    return resolve(buffers);
  });
};
