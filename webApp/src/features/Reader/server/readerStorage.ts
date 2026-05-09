import { deleteObject, getBlob, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '@/features/Firebase/init';
import { BookParagraph } from '../model/types';
import { gzipDecodeBytes, gzipEncodeText, supportsGzipCodec } from './gzipCodec';

export const buildParagraphsBlobPath = (userId: string, bookId: string): string =>
  `users/${userId}/reader/${bookId}/paragraphs.json.gz`;

export const buildOriginalFileBlobPath = (
  userId: string,
  bookId: string,
  fileName: string,
): string => `users/${userId}/reader/${bookId}/${encodeURIComponent(fileName)}`;

export const uploadParagraphsBlob = async ({
  userId,
  bookId,
  paragraphs,
}: {
  userId: string;
  bookId: string;
  paragraphs: BookParagraph[];
}): Promise<{ path: string; size: number }> => {
  const path = buildParagraphsBlobPath(userId, bookId);
  const encoded = await gzipEncodeText(JSON.stringify(paragraphs));
  const ref = storageRef(storage, path);
  await uploadBytes(ref, encoded, {
    contentType: 'application/json',
    contentEncoding: supportsGzipCodec() ? 'gzip' : undefined,
  });
  return { path, size: encoded.byteLength };
};

export const downloadParagraphsBlob = async ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}): Promise<BookParagraph[] | null> => {
  const path = buildParagraphsBlobPath(userId, bookId);
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
  userId,
  bookId,
  file,
}: {
  userId: string;
  bookId: string;
  file: File;
}): Promise<string> => {
  const path = buildOriginalFileBlobPath(userId, bookId, file.name);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file, { contentType: file.type || 'application/octet-stream' });
  return path;
};

export const deleteBookBlob = async (path: string): Promise<void> => {
  try {
    await deleteObject(storageRef(storage, path));
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') return;
    throw error;
  }
};
