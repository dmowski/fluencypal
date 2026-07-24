'use client';

import { useState } from 'react';
import { convertEpubFile } from '@/features/Reader/utils/epubImport';
import { Typography } from '@mui/material';

interface TestBook {
  id: string;
  label: string;
  publicPath: string;
}

interface ParseState {
  isParsing: boolean;
  error: string;
  output: string;
}

const TEST_BOOKS: TestBook[] = [
  {
    id: 'pride-and-prejudice',
    label: 'Pride and Prejudice',
    publicPath: '/Reader/pride_and_prejudice.epub',
  },
  {
    id: 'supercommunicators',
    label: 'Supercommunicators',
    publicPath: '/Reader/supercommunicators.epub',
  },
  {
    id: 'ziarno-prawdy',
    label: 'Ziarno Prawdy',
    publicPath: '/Reader/ziarno_prawdy.epub',
  },
  {
    id: 'secret-of-chimneys',
    label: 'The Secret of Chimneys',
    publicPath: '/Reader/the_secret_of_chimneys.epub',
  },
  {
    id: 'how-minds-change',
    label: 'How Minds Change',
    publicPath: '/Reader/how_minds_change.epub',
  },
];

const createInitialStates = (): Record<string, ParseState> =>
  TEST_BOOKS.reduce<Record<string, ParseState>>((acc, book) => {
    acc[book.id] = {
      isParsing: false,
      error: '',
      output: '',
    };
    return acc;
  }, {});

export const TestImportModule = () => {
  const [states, setStates] = useState<Record<string, ParseState>>(createInitialStates);

  const parseBook = async (book: TestBook) => {
    setStates((prev) => ({
      ...prev,
      [book.id]: {
        ...prev[book.id],
        isParsing: true,
        error: '',
      },
    }));

    try {
      const response = await fetch(book.publicPath);
      if (!response.ok) {
        throw new Error(`Failed to download EPUB: ${response.status}`);
      }

      const epubBlob = await response.blob();
      const fileName = book.publicPath.split('/').pop() || `${book.id}.epub`;
      const epubFile = new File([epubBlob], fileName, {
        type: 'application/epub+zip',
      });

      const result = await convertEpubFile({ file: epubFile });
      const output = [
        `TITLE: ${result.title}`,
        `SUBTITLE: ${result.subtitle}`,
        `AUTHOR: ${result.author}`,
        `CHAPTERS: ${result.chapters.length}`,
        `IMAGES: ${Object.keys(result.imageDataUrlByHref).length}`,
        '',
        result.text,
      ].join('\n');

      setStates((prev) => ({
        ...prev,
        [book.id]: {
          isParsing: false,
          error: '',
          output,
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parse error';
      setStates((prev) => ({
        ...prev,
        [book.id]: {
          ...prev[book.id],
          isParsing: false,
          error: message,
        },
      }));
    }
  };

  return (
    <main
      data-testid="epub-import-test-page"
      style={{ padding: 24, display: 'grid', gap: 20, color: '#222', background: '#f9f9f9' }}
    >
      <Typography variant="h1">EPUB Import Test Page</Typography>
      <Typography variant="body1">
        Use this page to manually verify EPUB to markdown conversion output.
      </Typography>

      {TEST_BOOKS.map((book) => {
        const state = states[book.id];

        return (
          <section
            key={book.id}
            data-testid={`epub-import-book-${book.id}`}
            style={{
              display: 'grid',
              gap: 10,
              border: '1px solid #d8d8d8',
              borderRadius: 8,
              padding: 12,
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{book.label}</strong>
                <div>{book.publicPath}</div>
              </div>

              <button
                type="button"
                data-testid={`epub-import-parse-${book.id}`}
                onClick={() => parseBook(book)}
                disabled={state.isParsing}
              >
                {state.isParsing ? 'Parsing...' : 'Parse'}
              </button>
            </div>

            {state.error ? (
              <div data-testid={`epub-import-error-${book.id}`} style={{ color: '#b00020' }}>
                {state.error}
              </div>
            ) : null}

            <textarea
              data-testid={`epub-import-output-${book.id}`}
              readOnly
              value={state.output}
              placeholder="Parsed markdown output will appear here"
              style={{ width: '100%', minHeight: 260, resize: 'vertical' }}
            />
          </section>
        );
      })}
    </main>
  );
};
