import { ref as storageRef, uploadBytes, getBlob } from 'firebase/storage';
import { setDoc } from 'firebase/firestore';
import { storage } from '@/features/Firebase/init';
import { db } from '@/features/Firebase/firebaseDb';
import { READER_BOOK_DOC_SCHEMA_VERSION } from '../server/readerBookDoc';

const CONVERTIBLE_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const CONVERTIBLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_CONVERT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const isConvertibleFile = (file: File): boolean => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return CONVERTIBLE_EXTENSIONS.has(ext) || CONVERTIBLE_MIME_TYPES.has(file.type);
};

export const validateConvertFile = (file: File): string | null => {
  if (!isConvertibleFile(file)) {
    return 'Please select a valid EPUB, PDF, DOC, or DOCX file.';
  }
  if (file.size > MAX_CONVERT_FILE_SIZE) {
    return 'File size must be less than 50 MB.';
  }
  return null;
};

/**
 * Writes a minimal Firestore book stub so that Firebase Storage security rules
 * (which do a cross-service firestore.get() membership check) will allow the
 * client to upload to books/{bookId}/ before the full book data is available.
 */
export const createFirestoreBookStub = async (bookId: string, uid: string): Promise<void> => {
  const docRef = db.documents.readerBook(bookId);
  if (!docRef) return;
  const nowIso = new Date().toISOString();
  await setDoc(docRef, {
    id: bookId,
    title: '',
    subtitle: '',
    author: '',
    ownerUserId: uid,
    userIds: [],
    memberIds: [uid],
    schemaVersion: READER_BOOK_DOC_SCHEMA_VERSION,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
  });
};

/**
 * Uploads a non-epub file to the book's storage folder.
 * Returns the storage path (used as the input to the convert API).
 */
export const uploadConvertTempFile = async ({
  bookId,
  file,
}: {
  bookId: string;
  file: File;
}): Promise<string> => {
  const safeName = file.name.replace(/\s+/g, '_');
  const path = `books/${bookId}/original_${safeName}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file, {
    contentType: file.type || 'application/octet-stream',
  });
  return path;
};

/**
 * Downloads a converted file blob from Firebase Storage and wraps it in a
 * File object so the standard EPUB import pipeline can consume it.
 */
export const downloadConvertResultAsFile = async (
  blobPath: string,
  outputFileName: string,
): Promise<File> => {
  const ref = storageRef(storage, blobPath);
  const blob = await getBlob(ref);
  return new File([blob], outputFileName, { type: 'application/epub+zip' });
};
