import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';
import { BookChapterNavigationItem } from '../../model/types';
import { buildImageAspectRatioMap } from './imageUtils';
import { parseEpubOnClient } from './parseEpub';

export { MAX_EPUB_FILE_SIZE } from './constants';
export { validateEpubFile } from './validateEpubFile';

export interface EpubImportPayload {
  text: string;
  title: string;
  subtitle: string;
  author: string;
  chapters: BookChapterNavigationItem[];
  imageDataUrlByHref: Record<string, string>;
  imageAspectRatioByHref: Record<string, number>;
}

export interface EpubImportProgressUpdate {
  progress: number;
  message: string;
}

export const convertEpubFile = async ({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (update: EpubImportProgressUpdate) => void;
}): Promise<EpubImportPayload> => {
  onProgress?.({ progress: 10, message: 'Reading EPUB...' });
  onProgress?.({ progress: 35, message: 'Converting EPUB to markdown...' });

  const parsed = await parseEpubOnClient(file);
  const markdown = parsed.markdown.trim();

  if (!markdown) {
    throw new Error('Could not extract text from this EPUB.');
  }

  const metadata = parsed.metadata;

  onProgress?.({ progress: 75, message: 'Parsing metadata with AI...' });

  const aiResponse = await sendConvertDocToTextRequest({
    textPreview: markdown.slice(0, 1200),
  });

  const finalMetadata = aiResponse.metadata
    ? {
        title: aiResponse.metadata.title.trim() || metadata.title,
        subtitle: aiResponse.metadata.subtitle.trim() || metadata.subtitle,
        author: aiResponse.metadata.author.trim() || metadata.author,
      }
    : metadata;

  const imageDataUrlByHref = parsed.imageDataUrlByHref;

  onProgress?.({
    progress: 92,
    message: 'Extracting embedded images...',
  });

  const imageAspectRatioByHref = await buildImageAspectRatioMap(imageDataUrlByHref);

  return {
    text: markdown,
    title: finalMetadata.title || 'Untitled',
    subtitle: finalMetadata.subtitle || 'Information not available',
    author: finalMetadata.author || 'Unknown Author',
    chapters: parsed.chapters,
    imageDataUrlByHref,
    imageAspectRatioByHref,
  };
};
