import sharp from 'sharp';

interface ResizeImageOptions {
  buffer: Buffer;
  maxSizePx: number;
}

interface ResizeImageResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

export const resizeImage = async ({
  buffer,
  maxSizePx,
}: ResizeImageOptions): Promise<ResizeImageResult> => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Check if resizing is needed
    if (width <= maxSizePx && height <= maxSizePx) {
      return {
        success: true,
        buffer,
      };
    }

    // Calculate new dimensions maintaining aspect ratio
    let newWidth = width;
    let newHeight = height;

    if (width > height) {
      newWidth = maxSizePx;
      newHeight = Math.round((height / width) * maxSizePx);
    } else {
      newHeight = maxSizePx;
      newWidth = Math.round((width / height) * maxSizePx);
    }

    // Resize the image
    const resizedBuffer = await image
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      buffer: resizedBuffer,
    };
  } catch (error) {
    console.error('Error resizing image:', error);
    return {
      success: false,
      error: 'Failed to resize image',
    };
  }
};
