import { deleteObject, getBlob, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '@/features/Firebase/init';
import { BookParagraph } from '../model/types';
import { gzipDecodeBytes, gzipEncodeText, supportsGzipCodec } from './gzipCodec';

export const buildParagraphsBlobPath = (bookId: string): string =>
  `books/${bookId}/paragraphs.json.gz`;

export const buildOriginalFileBlobPath = (bookId: string, fileName: string): string =>
  `books/${bookId}/${encodeURIComponent(fileName)}`;

export const uploadParagraphsBlob = async ({
  bookId,
  paragraphs,
}: {
  bookId: string;
  paragraphs: BookParagraph[];
}): Promise<{ path: string; size: number }> => {
  const path = buildParagraphsBlobPath(bookId);
  const encoded = await gzipEncodeText(JSON.stringify(paragraphs));
  const ref = storageRef(storage, path);
  await uploadBytes(ref, encoded, {
    contentType: 'application/json',
    contentEncoding: supportsGzipCodec() ? 'gzip' : undefined,
  });
  return { path, size: encoded.byteLength };
};

export const downloadParagraphsBlob = async ({
  bookId,
}: {
  bookId: string;
}): Promise<BookParagraph[] | null> => {
  const path = buildParagraphsBlobPath(bookId);
  const ref = storageRef(storage, path);
  try {
    const blob = await getBlob(ref);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const text = await gzipDecodeBytes(bytes);
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as BookParagraph[]) : null;
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') return null;
    throw error;
  }
};

export const uploadOriginalFileBlob = async ({
  bookId,
  file,
}: {
  bookId: string;
  file: File;
}): Promise<string> => {
  const path = buildOriginalFileBlobPath(bookId, file.name);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file, { contentType: file.type || 'application/octet-stream' });
  return path;
};

export const downloadOriginalFileBlob = async (
  blobPath: string,
): Promise<{ blob: Blob; fileName: string } | null> => {
  const ref = storageRef(storage, blobPath);
  try {
    const blob = await getBlob(ref);
    const lastSegment = blobPath.split('/').pop() ?? 'book.epub';
    let fileName = lastSegment;
    try {
      fileName = decodeURIComponent(lastSegment);
    } catch {
      fileName = lastSegment;
    }
    return { blob, fileName };
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') return null;
    throw error;
  }
};

export const deleteBookBlob = async (path: string): Promise<void> => {
  try {
    await deleteObject(storageRef(storage, path));
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') return;
    throw error;
  }
};
