import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useBooks } from './useBooks';
import { convertEpubFile, validateEpubFile } from '../utils/epubImport';
import { Book } from '../model/types';
import { downloadOriginalFileBlob } from '../server/readerStorage';
import { getDownloadFileName } from '../utils/epubFileName';

const resolveBookFile = async (book: Book): Promise<File | null> => {
  if (book.convertedFiles.epub) {
    const result = await downloadOriginalFileBlob(book.convertedFiles.epub);
    if (!result) return null;
    return new File([result.blob], getDownloadFileName(result.fileName), {
      type: result.blob.type || 'application/epub+zip',
    });
  }
  if (book.epubFile) {
    return book.epubFile;
  }
  return null;
};

export const useReimportEpub = () => {
  const i18n = useLingui();
  const books = useBooks();

  const [isReimporting, setIsReimporting] = useState(false);
  const [reimportProgress, setReimportProgress] = useState(0);
  const [reimportMessage, setReimportMessage] = useState('');
  const [reimportError, setReimportError] = useState('');

  /** Returns true if the book has a stored file and can be re-imported without a file picker. */
  const canReimportAutomatically = (book: Book) =>
    Boolean(book.convertedFiles.epub || book.epubFile);

  const reimportBook = async (book: Book) => {
    try {
      setIsReimporting(true);
      setReimportError('');
      setReimportProgress(5);
      setReimportMessage(i18n._('Resolving file...'));

      const file = await resolveBookFile(book);
      if (!file) {
        setReimportError(i18n._('No original file found for this book.'));
        setReimportProgress(0);
        setReimportMessage('');
        return;
      }

      const validationError = validateEpubFile(file);
      if (validationError) {
        setReimportError(validationError);
        setReimportProgress(0);
        setReimportMessage('');
        return;
      }

      const parsedBook = await convertEpubFile({
        file,
        onProgress: ({ progress, message }) => {
          setReimportProgress(progress);
          setReimportMessage(message);
        },
      });

      setReimportProgress(98);
      setReimportMessage(i18n._('Saving book...'));

      books.reimportBook(book.id, {
        title: parsedBook.title,
        subTitle: parsedBook.subtitle,
        author: parsedBook.author,
        text: parsedBook.text,
        chapters: parsedBook.chapters,
        imagesByHref: parsedBook.imageDataUrlByHref,
        imageAspectRatioByHref: parsedBook.imageAspectRatioByHref,
        epubFile: file,
        epubParserVersion: parsedBook.epubParserVersion,
      });

      setReimportProgress(100);
      setReimportMessage(i18n._('Book updated.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n._('Failed to re-import EPUB.');
      setReimportError(message);
      setReimportProgress(0);
      setReimportMessage('');
    } finally {
      setIsReimporting(false);
    }
  };

  /** Fallback: re-import from a manually selected file (when no stored file is available). */
  const reimportEpubFile = async (bookId: string, file: File) => {
    const validationError = validateEpubFile(file);
    if (validationError) {
      setReimportError(validationError);
      setReimportProgress(0);
      setReimportMessage('');
      return;
    }

    try {
      setIsReimporting(true);
      setReimportError('');

      const parsedBook = await convertEpubFile({
        file,
        onProgress: ({ progress, message }) => {
          setReimportProgress(progress);
          setReimportMessage(message);
        },
      });

      setReimportProgress(98);
      setReimportMessage(i18n._('Saving book...'));

      books.reimportBook(bookId, {
        title: parsedBook.title,
        subTitle: parsedBook.subtitle,
        author: parsedBook.author,
        text: parsedBook.text,
        chapters: parsedBook.chapters,
        imagesByHref: parsedBook.imageDataUrlByHref,
        imageAspectRatioByHref: parsedBook.imageAspectRatioByHref,
        epubFile: file,
        epubParserVersion: parsedBook.epubParserVersion,
      });

      setReimportProgress(100);
      setReimportMessage(i18n._('Book updated.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n._('Failed to re-import EPUB.');
      setReimportError(message);
      setReimportProgress(0);
      setReimportMessage('');
    } finally {
      setIsReimporting(false);
    }
  };

  return {
    isReimporting,
    reimportProgress,
    reimportMessage,
    reimportError,
    canReimportAutomatically,
    reimportBook,
    reimportEpubFile,
  };
};
