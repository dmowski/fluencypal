'use client';

import { Stack, Typography } from '@mui/material';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SupportedLanguage } from '@/features/Lang/lang';
import { formatBlogAuthorLine, sanitizeBlogAuthors } from './blogAuthors';
import { BlogVersionDoc } from './types';

interface BlogEditorPreviewProps {
  draft: BlogVersionDoc;
  activeLang: SupportedLanguage;
}

export const BlogEditorPreview = ({ draft, activeLang }: BlogEditorPreviewProps) => {
  const titleValue = draft.title[activeLang];
  const subTitleValue = draft.subTitle[activeLang];
  const contentValue = draft.content[activeLang];
  const authors = sanitizeBlogAuthors(draft.authors);

  return (
    <Stack
      sx={{
        color: '#222',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        gap: '16px',
        boxSizing: 'border-box',
        height: 'max-content',
      }}
    >
      {draft.imagePreviewUrl && (
        <Stack sx={{ maxHeight: '400px', overflow: 'hidden', borderRadius: '8px' }}>
          <img
            src={draft.imagePreviewUrl}
            alt={titleValue}
            style={{ width: '100%', objectFit: 'cover' }}
          />
        </Stack>
      )}
      <Typography variant="h4" sx={{ color: '#000', fontWeight: 700 }}>
        {titleValue || 'Untitled'}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#666' }}>
        {subTitleValue}
      </Typography>
      {authors.length > 0 && (
        <Stack gap="2px">
          {authors.map((author, index) => (
            <Typography
              key={`${author.role}-${author.name}-${index}`}
              variant="body2"
              sx={{ color: '#555' }}
            >
              {formatBlogAuthorLine(author)}
            </Typography>
          ))}
        </Stack>
      )}
      <Markdown variant="blog">{contentValue || '_No content yet_'}</Markdown>
    </Stack>
  );
};
