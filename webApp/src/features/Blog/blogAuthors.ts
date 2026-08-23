import { BlogAuthor, BlogAuthorRole } from './types';

export const blogAuthorRoleLabel: Record<BlogAuthorRole, string> = {
  author: 'Author',
  coAuthor: 'Co-Author',
};

export const makeEmptyAuthor = (role: BlogAuthorRole = 'author'): BlogAuthor => ({
  role,
  name: '',
  note: '',
});

export const sanitizeBlogAuthors = (authors: BlogAuthor[] | undefined): BlogAuthor[] =>
  (authors ?? [])
    .map((author) => {
      const note = author.note?.trim();
      return {
        role: author.role === 'coAuthor' ? ('coAuthor' as const) : ('author' as const),
        name: author.name.trim(),
        ...(note ? { note } : {}),
      };
    })
    .filter((author) => author.name.length > 0);

export const formatBlogAuthorLine = (author: BlogAuthor, roleLabel?: string): string => {
  const label =
    roleLabel ?? blogAuthorRoleLabel[author.role === 'coAuthor' ? 'coAuthor' : 'author'];
  const note = author.note?.trim();
  return note ? `${label}: ${author.name} (${note})` : `${label}: ${author.name}`;
};
