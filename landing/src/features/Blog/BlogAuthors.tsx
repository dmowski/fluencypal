import { Stack, Typography } from '@mui/material';
import { getI18nInstance } from '@/appRouterI18n';
import { BlogAuthor } from './types';

const authorRoleLabel = (role: BlogAuthor['role'], i18n: { _: (s: string) => string }): string =>
  role === 'coAuthor' ? i18n._('Co-Author') : i18n._('Author');

export const formatBlogAuthorLine = (
  author: BlogAuthor,
  i18n: { _: (s: string) => string },
): string => {
  const note = author.note?.trim();
  const line = `${authorRoleLabel(author.role, i18n)}: ${author.name}`;
  return note ? `${line} (${note})` : line;
};

interface BlogAuthorsProps {
  authors?: BlogAuthor[];
  lang: string;
}

export const BlogAuthors = ({ authors, lang }: BlogAuthorsProps) => {
  const i18n = getI18nInstance(lang);
  const visible = (authors ?? []).filter((author) => author.name.trim());
  if (visible.length === 0) return null;

  return (
    <Stack>
      {visible.map((author, index) => (
        <Typography key={`${author.role}-${author.name}-${index}`} sx={{ color: '#666' }}>
          {formatBlogAuthorLine(author, i18n)}
        </Typography>
      ))}
    </Stack>
  );
};
