import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useBooks } from './useBooks';
import { convertEpubFile } from '../utils/epubImport';
import {
  uploadConvertTempFile,
  downloadConvertResultAsFile,
  createFirestoreBookStub,
} from '../utils/convertUpload';
import { sendConvertBookRequest } from '../api/convertBookRequest';

const generateBookId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useNonEpubImport = ({
  getToken,
  uid,
}: {
  getToken: () => Promise<string>;
  uid: string;
}) => {
  const i18n = useLingui();
  const books = useBooks();

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');

  const importNonEpubFile = async (file: File) => {
    try {
      setIsImporting(true);
      setImportError('');
      setImportProgress(5);
      setImportMessage(i18n._('Preparing…'));

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

      // 1. Pre-generate the book ID and create a minimal Firestore stub so
      //    Firebase Storage security rules allow writing to books/{bookId}/.
      const bookId = generateBookId();
      await createFirestoreBookStub(bookId, uid);

      setImportProgress(10);
      setImportMessage(i18n._('Uploading file…'));

      // 2. Upload the original file directly into the book's storage folder.
      const storagePath = await uploadConvertTempFile({ bookId, file });

      setImportProgress(20);
      setImportMessage(i18n._('Converting to EPUB…'));

      // 3. Send path to server-side converter.
      const { epubBlobPath } = await sendConvertBookRequest({
        storagePath,
        fileName: file.name,
        bookId,
        getToken,
      });

      setImportProgress(60);
      setImportMessage(i18n._('Downloading converted file…'));

      // 4. Download the converted EPUB.
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const epubFile = await downloadConvertResultAsFile(epubBlobPath, `${baseName}.epub`);

      setImportProgress(70);
      setImportMessage(i18n._('Processing book…'));

      // 5. Parse the EPUB using the standard pipeline.
      const parsedBook = await convertEpubFile({
        file: epubFile,
        onProgress: ({ progress, message }) => {
          setImportProgress(70 + Math.round(progress * 0.25));
          setImportMessage(message);
        },
      });

      setImportProgress(96);
      setImportMessage(i18n._('Saving book…'));

      // 6. Persist the book. Files are already in Firebase Storage via
      //    convertedFiles — do not pass originalFile to avoid double-upload
      //    by the sync layer.
      const convertedFiles: Record<string, string> = {
        [ext]: storagePath,
        epub: epubBlobPath,
      };

      await books.addBook({
        bookId,
        title: parsedBook.title,
        subTitle: parsedBook.subtitle,
        author: parsedBook.author,
        text: parsedBook.text,
        convertedFiles,
        chapters: parsedBook.chapters,
        imagesByHref: parsedBook.imageDataUrlByHref,
        imageAspectRatioByHref: parsedBook.imageAspectRatioByHref,
      });

      setImportProgress(100);
      setImportMessage(i18n._('Book saved.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n._('Failed to convert file.');
      setImportError(message);
      setImportProgress(0);
      setImportMessage('');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importProgress,
    importMessage,
    importError,
    importNonEpubFile,
  };
};
