import { Book, createEmptyConvertedFilesPathMap } from '../../model/types';
import { buildLocalSignature, buildSharingSignature } from './signature';

const baseBook = (): Book => ({
  id: 'book-1',
  title: 'Title',
  subtitle: 'Sub',
  author: 'Author',
  paragraphs: [],
  activePageIndex: 1,
  convertedFiles: createEmptyConvertedFilesPathMap(),
});

describe('buildSharingSignature', () => {
  it('changes when userIds change', () => {
    const before = buildSharingSignature(baseBook());
    const after = buildSharingSignature({ ...baseBook(), userIds: ['user-b'] });
    expect(before).not.toBe(after);
  });

  it('is order-independent for userIds', () => {
    const a = buildSharingSignature({ ...baseBook(), userIds: ['b', 'a'] });
    const b = buildSharingSignature({ ...baseBook(), userIds: ['a', 'b'] });
    expect(a).toBe(b);
  });

  it('is included in the full local signature', () => {
    const book = { ...baseBook(), userIds: ['collab'], memberEmails: { collab: 'c@example.com' } };
    const full = JSON.parse(buildLocalSignature(book)) as Record<string, unknown>;
    const sharing = JSON.parse(buildSharingSignature(book)) as Record<string, unknown>;
    expect(full.userIds).toEqual(sharing.userIds);
    expect(full.memberEmails).toEqual(sharing.memberEmails);
  });
});
