import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';
import { BookChapterNavigationItem } from '../../model/types';
import { buildImageAspectRatioMap } from './imageUtils';
import { parseEpubOnClient } from './parseEpub';
import { EPUB_PARSER_VERSION } from './constants';

export { MAX_EPUB_FILE_SIZE } from './constants';
export { EPUB_PARSER_VERSION } from './constants';
export { validateEpubFile } from './validateEpubFile';

export interface EpubImportPayload {
  text: string;
  title: string;
  subtitle: string;
  author: string;
  chapters: BookChapterNavigationItem[];
  imageDataUrlByHref: Record<string, string>;
  imageAspectRatioByHref: Record<string, number>;
  /** Parser version that produced this payload. */
  epubParserVersion: number;
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

  const previewSlice = markdown.slice(0, 1200);
  console.log('[epubImport] AI metadata request starting', { previewLength: previewSlice.length });
  const aiRequestStart = Date.now();

  const aiResponse = await sendConvertDocToTextRequest({
    textPreview: previewSlice,
  });

  console.log('[epubImport] AI metadata request done', {
    durationMs: Date.now() - aiRequestStart,
    hasMetadata: Boolean(aiResponse.metadata),
    error: aiResponse.error ?? null,
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

  const imageStart = Date.now();
  const imageAspectRatioByHref = await buildImageAspectRatioMap(imageDataUrlByHref);
  console.log('[epubImport] buildImageAspectRatioMap done', {
    durationMs: Date.now() - imageStart,
    imageCount: Object.keys(imageDataUrlByHref).length,
  });

  return {
    text: markdown,
    title: finalMetadata.title || 'Untitled',
    subtitle: finalMetadata.subtitle || 'Information not available',
    author: finalMetadata.author || 'Unknown Author',
    chapters: parsed.chapters,
    imageDataUrlByHref,
    imageAspectRatioByHref,
    epubParserVersion: EPUB_PARSER_VERSION,
  };
};
