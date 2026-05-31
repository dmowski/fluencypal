'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { Globe, Loader } from 'lucide-react';
import { RichTextEditor } from '@/features/Chat/RichTextEditor';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { BlogVersionDoc } from './types';
import { useEffect, useRef, useState } from 'react';
import { UploadImageButton } from '@/features/Game/UploadImageButton';

interface BlogEditorFormProps {
  draft: BlogVersionDoc;
  activeLang: SupportedLanguage;
  isBusy: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isTranslating: boolean;
  isPublished: boolean;
  categoryTitle: string | null;
  onOpenCategoryPicker: () => void;
  onImagePreviewUrlChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSubTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onKeywordsChange: (value: string[]) => void;
  onSave: () => void;
  onPublish: () => void;
  onTranslateToCurrent: () => void;
  onTranslateToAll: () => void;
}

export const BlogEditorForm = ({
  draft,
  activeLang,
  isBusy,
  isSaving,
  isPublishing,
  isTranslating,
  isPublished,
  categoryTitle,
  onOpenCategoryPicker,
  onImagePreviewUrlChange,
  onTitleChange,
  onSubTitleChange,
  onContentChange,
  onKeywordsChange,
  onSave,
  onPublish,
  onTranslateToCurrent,
  onTranslateToAll,
}: BlogEditorFormProps) => {
  const titleValue = draft.title[activeLang];
  const subTitleValue = draft.subTitle[activeLang];
  const contentValue = draft.content[activeLang];

  // Local raw string so the user can type commas freely.
  // Sync with the parent value whenever the language changes or the parent
  // overwrites (e.g. after translation). We use a ref to track "last synced"
  // so we do not override in-progress edits.
  const [keywordsRaw, setKeywordsRaw] = useState(() => draft.keywords[activeLang].join(', '));
  const lastSyncedRef = useRef(draft.keywords[activeLang].join(', '));

  useEffect(() => {
    const canonical = draft.keywords[activeLang].join(', ');
    if (canonical !== lastSyncedRef.current) {
      lastSyncedRef.current = canonical;
      setKeywordsRaw(canonical);
    }
  }, [activeLang, draft.keywords]);

  const commitKeywords = (raw: string) => {
    const parsed = raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    lastSyncedRef.current = parsed.join(', ');
    onKeywordsChange(parsed);
  };

  return (
    <Stack gap="16px">
      {/* Language-agnostic metadata */}
      <Stack gap="12px">
        <Stack gap="8px">
          <Stack sx={{ flexDirection: 'row', alignItems: 'flex-end', gap: '12px' }}>
            <TextField
              label="Image Preview URL"
              value={draft.imagePreviewUrl}
              onChange={(e) => onImagePreviewUrlChange(e.target.value)}
              fullWidth
              size="small"
            />
            <UploadImageButton type="icon" onNewUploadUrl={(url) => onImagePreviewUrlChange(url)} />
          </Stack>
          {draft.imagePreviewUrl && (
            <img
              src={draft.imagePreviewUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '240px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}
        </Stack>
        <Stack gap="18px">
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Category
          </Typography>
          {draft.categoryId ? (
            <Stack
              gap="12px"
              sx={{
                width: '100%',
                flexDirection: 'row',
                gap: '8px',
              }}
            >
              <TextField label="Category ID" value={draft.categoryId} size="small" disabled />
              {categoryTitle && (
                <TextField
                  label="Category title (English)"
                  value={categoryTitle}
                  size="small"
                  disabled
                />
              )}
              <Button variant="outlined" onClick={onOpenCategoryPicker} disabled={isBusy}>
                Change category
              </Button>
            </Stack>
          ) : (
            <Button variant="outlined" onClick={onOpenCategoryPicker} disabled={isBusy}>
              Select category
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Per-language fields */}
      <Stack gap="12px">
        <TextField
          label={'Title (' + activeLang + ')'}
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label={'Subtitle (' + activeLang + ')'}
          value={subTitleValue}
          onChange={(e) => onSubTitleChange(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label={'Keywords (' + activeLang + ') — comma separated'}
          value={keywordsRaw}
          onChange={(e) => setKeywordsRaw(e.target.value)}
          onBlur={(e) => commitKeywords(e.target.value)}
          fullWidth
          size="small"
        />
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Content ({activeLang})
        </Typography>
        <RichTextEditor value={contentValue} onChange={onContentChange} />
      </Stack>

      {/* Actions */}
      <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '10px', paddingTop: '10px' }}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isBusy}
          startIcon={isSaving ? <Loader size="14px" /> : undefined}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={onPublish}
          disabled={isBusy}
          startIcon={isPublishing ? <Loader size="14px" /> : undefined}
        >
          {isPublishing ? 'Publishing...' : isPublished ? 'Re-publish' : 'Publish'}
        </Button>

        {activeLang !== 'en' && (
          <Button
            variant="outlined"
            onClick={onTranslateToCurrent}
            disabled={isBusy}
            startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
          >
            {isTranslating
              ? 'Translating...'
              : 'Translate to ' + fullEnglishLanguageName[activeLang]}
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={onTranslateToAll}
          disabled={isBusy}
          startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
        >
          {isTranslating ? 'Translating...' : 'Translate to all languages'}
        </Button>
      </Stack>
    </Stack>
  );
};
