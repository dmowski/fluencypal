'use client';

import { Stack, Typography } from '@mui/material';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SupportedLanguage } from '@/features/Lang/lang';
import { BlogVersionDoc } from './types';

interface BlogEditorPreviewProps {
  draft: BlogVersionDoc;
  activeLang: SupportedLanguage;
}

export const BlogEditorPreview = ({ draft, activeLang }: BlogEditorPreviewProps) => {
  const titleValue = draft.title[activeLang];
  const subTitleValue = draft.subTitle[activeLang];
  const contentValue = draft.content[activeLang];

  return (
    <Stack
      sx={{
        color: '#222',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        gap: '16px',
        minHeight: '100%',
        boxSizing: 'border-box',
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
      <Markdown variant="blog">{contentValue || '_No content yet_'}</Markdown>
    </Stack>
  );
};
