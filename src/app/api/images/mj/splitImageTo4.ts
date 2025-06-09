import sharp from "sharp";
import { convertImageUrlToBuffer } from "./convertImageUrlToBuffer";

export const splitImageTo4 = async (imageUrl: string): Promise<Buffer[]> => {
  try {
    // Convert image URL to buffer
    const imageBuffer = await convertImageUrlToBuffer(imageUrl);

    // Get metadata to calculate dimensions
    const { width, height } = await sharp(imageBuffer).metadata();

    if (!width || !height) {
      throw new Error("Could not retrieve image dimensions.");
    }

    // Calculate dimensions for splitting
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    // Coordinates for cropping
    const regions = [
      { left: 0, top: 0, width: halfWidth, height: halfHeight }, // Top-left
      { left: halfWidth, top: 0, width: halfWidth, height: halfHeight }, // Top-right
      { left: 0, top: halfHeight, width: halfWidth, height: halfHeight }, // Bottom-left
      { left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight }, // Bottom-right
    ];

    // Process each region
    const pieces = await Promise.all(
      regions.map((region) => sharp(imageBuffer).extract(region).toBuffer())
    );

    return pieces;
  } catch (error) {
    console.error("Error splitting image:", error);
    throw error;
  }
};
