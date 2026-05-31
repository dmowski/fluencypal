'use client';

import { Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { BookOpen, Globe } from 'lucide-react';
import {
  SupportedLanguage,
  fullEnglishLanguageName,
  supportedLanguages,
} from '@/features/Lang/lang';

interface BlogEditorHeaderProps {
  enTitle: string;
  isPublished: boolean;
  activeLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
}

export const BlogEditorHeader = ({
  enTitle,
  isPublished,
  activeLang,
  onLangChange,
}: BlogEditorHeaderProps) => (
  <Stack
    sx={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
    }}
  >
    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
      <BookOpen size="20px" />
      <Typography variant="h6">{enTitle || 'Untitled Blog Post'}</Typography>
      {isPublished && <Chip label="Published" color="success" size="small" />}
    </Stack>

    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
      <Globe size="16px" />
      <Select
        size="small"
        value={activeLang}
        onChange={(e) => onLangChange(e.target.value as SupportedLanguage)}
        sx={{ minWidth: '160px' }}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem key={lang} value={lang}>
            {fullEnglishLanguageName[lang]} ({lang})
          </MenuItem>
        ))}
      </Select>
    </Stack>
  </Stack>
);
