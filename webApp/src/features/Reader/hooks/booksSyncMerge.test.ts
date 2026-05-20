import { Book, createEmptyConvertedFilesPathMap } from '../model/types';
import { mergeRemoteBookIntoLocal } from './booksSyncMerge';

const baseLocal: Book = {
  id: 'b1',
  title: 'Local Title',
  subtitle: 'Local Sub',
  author: 'Local Author',
  paragraphs: [['hello']],
  convertedFiles: createEmptyConvertedFilesPathMap(),
};

const emptyConvertedFiles = () => createEmptyConvertedFilesPathMap();

describe('mergeRemoteBookIntoLocal', () => {
  it('returns null when remote has no newer fields', () => {
    const result = mergeRemoteBookIntoLocal(baseLocal, {
      id: 'b1',
      title: 'Local Title',
      subtitle: 'Local Sub',
      author: 'Local Author',
      convertedFiles: { epub: '', pdf: null, docx: null },
      schemaVersion: 1,
      createdAtIso: '2024-01-01T00:00:00.000Z',
      updatedAtIso: '2024-01-01T00:00:00.000Z',
    });

    expect(result).toBeNull();
  });

  it('adopts newer remote core fields based on dataUpdatedAtIso', () => {
    const local: Book = { ...baseLocal, dataUpdatedAtIso: '2024-01-01T00:00:00.000Z' };
    const result = mergeRemoteBookIntoLocal(local, {
      id: 'b1',
      title: 'Remote Title',
      subtitle: 'Remote Sub',
      author: 'Remote Author',
      dataUpdatedAtIso: '2025-01-01T00:00:00.000Z',
      convertedFiles: { epub: '', pdf: null, docx: null },
      schemaVersion: 1,
      createdAtIso: '2024-01-01T00:00:00.000Z',
      updatedAtIso: '2025-01-01T00:00:00.000Z',
    });

    expect(result?.title).toBe('Remote Title');
    expect(result?.author).toBe('Remote Author');
    expect(result?.dataUpdatedAtIso).toBe('2025-01-01T00:00:00.000Z');
    // Paragraphs always preserved from local (Storage holds them).
    expect(result?.paragraphs).toEqual([['hello']]);
  });

  it('keeps older local highlights when remote is older', () => {
    const local: Book = {
      ...baseLocal,
      highlights: [{ paragraphIndex: 0, startIndex: 0, endIndex: 5, color: '#fff', note: '' }],
      highlightsUpdatedAtIso: '2025-06-01T00:00:00.000Z',
    };
    const result = mergeRemoteBookIntoLocal(local, {
      id: 'b1',
      title: local.title,
      subtitle: local.subtitle,
      author: local.author,
      highlights: [],
      highlightsUpdatedAtIso: '2024-01-01T00:00:00.000Z',
      convertedFiles: { epub: '', pdf: null, docx: null },
      schemaVersion: 1,
      createdAtIso: '2024-01-01T00:00:00.000Z',
      updatedAtIso: '2025-06-01T00:00:00.000Z',
    });

    expect(result).toBeNull();
  });

  it('replaces highlights when remote highlightsUpdatedAtIso is newer', () => {
    const local: Book = {
      ...baseLocal,
      highlights: [],
      highlightsUpdatedAtIso: '2024-01-01T00:00:00.000Z',
    };
    const remoteHighlights = [
      { paragraphIndex: 1, startIndex: 0, endIndex: 3, color: '#ff0', note: '' },
    ];
    const result = mergeRemoteBookIntoLocal(local, {
      id: 'b1',
      title: local.title,
      subtitle: local.subtitle,
      author: local.author,
      highlights: remoteHighlights,
      highlightsUpdatedAtIso: '2025-06-01T00:00:00.000Z',
      convertedFiles: { epub: '', pdf: null, docx: null },
      schemaVersion: 1,
      createdAtIso: '2024-01-01T00:00:00.000Z',
      updatedAtIso: '2025-06-01T00:00:00.000Z',
    });

    expect(result?.highlights).toEqual(remoteHighlights);
    expect(result?.highlightsUpdatedAtIso).toBe('2025-06-01T00:00:00.000Z');
  });

  it('does NOT sync reading position (local-only, absent from remote schema)', () => {
    // Local book has a reading position; remote doc has no such fields (they
    // were removed from ReaderBookDoc — see BookLocalProgress in types.ts).
    const local: Book = {
      ...baseLocal,
      activePageIndex: 7,
      readingPositionUpdatedAtIso: '2024-01-01T00:00:00.000Z',
    };
    const result = mergeRemoteBookIntoLocal(local, {
      id: 'b1',
      title: local.title,
      subtitle: local.subtitle,
      author: local.author,
      convertedFiles: { epub: '', pdf: null, docx: null },
      schemaVersion: 1,
      createdAtIso: '2024-01-01T00:00:00.000Z',
      updatedAtIso: '2025-06-01T00:00:00.000Z',
    });

    // No remotely-driven fields changed — result is null (no merge needed).
    expect(result).toBeNull();
  });
});
