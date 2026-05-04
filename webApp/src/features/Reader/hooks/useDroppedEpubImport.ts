import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useBooks } from './useBooks';
import { convertEpubFile, validateEpubFile } from '../utils/epubImport';

export const useDroppedEpubImport = () => {
  const i18n = useLingui();
  const books = useBooks();

  const [isImportingDroppedFile, setIsImportingDroppedFile] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');

  const importDroppedFile = async (file: File) => {
    const validationError = validateEpubFile(file, (message) => i18n._(message));
    if (validationError) {
      setImportError(validationError);
      setImportProgress(0);
      setImportMessage('');
      return;
    }

    try {
      setIsImportingDroppedFile(true);
      setImportError('');

      const parsedBook = await convertEpubFile({
        file,
        translate: (message) => i18n._(message),
        onProgress: ({ progress, message }) => {
          setImportProgress(progress);
          setImportMessage(message);
        },
      });

      setImportProgress(98);
      setImportMessage(i18n._('Saving book...'));

      await books.addBook({
        title: parsedBook.title,
        subTitle: parsedBook.subtitle,
        author: parsedBook.author,
        text: parsedBook.text,
        chapters: parsedBook.chapters,
        imagesByHref: parsedBook.imageDataUrlByHref,
        imageAspectRatioByHref: parsedBook.imageAspectRatioByHref,
      });

      setImportProgress(100);
      setImportMessage(i18n._('Book saved.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n._('Failed to convert EPUB.');
      setImportError(message);
      setImportProgress(0);
      setImportMessage('');
    } finally {
      setIsImportingDroppedFile(false);
    }
  };

  return {
    isImportingDroppedFile,
    importProgress,
    importMessage,
    importError,
    importDroppedFile,
  };
};
