'use client';

import { Button, MenuItem, Select, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Globe, Loader, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/features/Chat/RichTextEditor';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { blogAuthorRoleLabel, makeEmptyAuthor } from './blogAuthors';
import { BlogAuthor, BlogAuthorRole, BlogVersionDoc } from './types';
import { useEffect, useRef, useState } from 'react';
import { UploadImageButton } from '@/features/Game/UploadImageButton';

interface BlogEditorFormProps {
  draft: BlogVersionDoc;
  blogId: string;
  activeLang: SupportedLanguage;
  isBusy: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isTranslating: boolean;
  isPublished: boolean;
  categoryTitle: string | null;
  onOpenCategoryPicker: () => void;
  onAuthorsChange: (authors: BlogAuthor[]) => void;
  onImagePreviewUrlChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSubTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onKeywordsChange: (value: string[]) => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  isUnpublishing: boolean;
  onTranslateToCurrent: () => void;
  onTranslateToAll: () => void;
  onTranslateToCurrentWithGoogle: () => void;
  onTranslateToAllWithGoogle: () => void;
  onRenameId: (newId: string) => Promise<void>;
}

export const BlogEditorForm = ({
  draft,
  blogId,
  activeLang,
  isBusy,
  isSaving,
  isPublishing,
  isTranslating,
  isPublished,
  categoryTitle,
  onOpenCategoryPicker,
  onAuthorsChange,
  onImagePreviewUrlChange,
  onTitleChange,
  onSubTitleChange,
  onContentChange,
  onKeywordsChange,
  onSave,
  onPublish,
  onUnpublish,
  isUnpublishing,
  onTranslateToCurrent,
  onTranslateToAll,
  onTranslateToCurrentWithGoogle,
  onTranslateToAllWithGoogle,
  onRenameId,
}: BlogEditorFormProps) => {
  const titleValue = draft.title[activeLang];
  const subTitleValue = draft.subTitle[activeLang];
  const contentValue = draft.content[activeLang];
  const authors = draft.authors ?? [];

  const [idDraft, setIdDraft] = useState(blogId);
  const [isRenamingId, setIsRenamingId] = useState(false);
  const [contentEditorTab, setContentEditorTab] = useState<'rich' | 'text'>('rich');

  const handleRenameId = async () => {
    const trimmed = idDraft.trim();
    if (!trimmed || trimmed === blogId) {
      setIdDraft(blogId);
      return;
    }
    setIsRenamingId(true);
    try {
      await onRenameId(trimmed);
    } finally {
      setIsRenamingId(false);
    }
  };
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
        {/* Blog ID (used as the public URL slug) */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'flex-end', gap: '8px' }}>
          <TextField
            label="Blog ID (URL slug)"
            value={idDraft}
            onChange={(e) => setIdDraft(e.target.value)}
            size="small"
            fullWidth
            helperText="Used in the public URL. Renaming copies all data to the new ID."
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleRenameId}
            disabled={isRenamingId || idDraft.trim() === blogId}
            sx={{ flexShrink: 0, height: '40px' }}
          >
            {isRenamingId ? 'Renaming…' : 'Rename'}
          </Button>
        </Stack>
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
        <Stack gap="8px">
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Authors
          </Typography>
          {authors.map((author, index) => (
            <Stack
              key={index}
              sx={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Select
                size="small"
                value={author.role}
                onChange={(e) =>
                  onAuthorsChange(
                    authors.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, role: e.target.value as BlogAuthorRole }
                        : item,
                    ),
                  )
                }
                sx={{ minWidth: '140px' }}
              >
                <MenuItem value="author">{blogAuthorRoleLabel.author}</MenuItem>
                <MenuItem value="coAuthor">{blogAuthorRoleLabel.coAuthor}</MenuItem>
              </Select>
              <TextField
                label="Name"
                value={author.name}
                onChange={(e) =>
                  onAuthorsChange(
                    authors.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, name: e.target.value } : item,
                    ),
                  )
                }
                size="small"
                sx={{ flex: 1, minWidth: '160px' }}
              />
              <TextField
                label="Note (optional)"
                value={author.note ?? ''}
                onChange={(e) =>
                  onAuthorsChange(
                    authors.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, note: e.target.value } : item,
                    ),
                  )
                }
                size="small"
                placeholder="Grammar correction and editing"
                sx={{ flex: 1, minWidth: '200px' }}
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() =>
                  onAuthorsChange(authors.filter((_, itemIndex) => itemIndex !== index))
                }
                aria-label="Remove author"
                sx={{ minWidth: '40px', height: '40px' }}
              >
                <Trash2 size="14px" />
              </Button>
            </Stack>
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const nextRole = authors.some((item) => item.role === 'author')
                ? 'coAuthor'
                : 'author';
              onAuthorsChange([...authors, makeEmptyAuthor(nextRole)]);
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add author
          </Button>
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
        <Tabs
          value={contentEditorTab}
          onChange={(_, value) => setContentEditorTab(value as 'rich' | 'text')}
          sx={{ minHeight: '36px' }}
        >
          <Tab label="Rich editor" value="rich" sx={{ minHeight: '36px', py: 0 }} />
          <Tab label="Text" value="text" sx={{ minHeight: '36px', py: 0 }} />
        </Tabs>
        {contentEditorTab === 'rich' ? (
          <RichTextEditor
            value={contentValue}
            onChange={onContentChange}
            reloadKey={`${activeLang}-rich`}
          />
        ) : (
          <TextField
            value={contentValue}
            onChange={(e) => onContentChange(e.target.value)}
            multiline
            minRows={20}
            fullWidth
            placeholder="Markdown content"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '14px',
                alignItems: 'flex-start',
              },
            }}
          />
        )}
      </Stack>

      {/* Actions */}
      <Stack
        sx={{
          flexDirection: 'row',
          position: 'sticky',
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 0',
        }}
      >
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

        {isPublished && (
          <Button
            variant="outlined"
            color="error"
            onClick={onUnpublish}
            disabled={isBusy}
            startIcon={isUnpublishing ? <Loader size="14px" /> : undefined}
          >
            {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
          </Button>
        )}

        {activeLang !== 'en' && (
          <Button
            variant="outlined"
            onClick={onTranslateToCurrent}
            disabled={isBusy}
            startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
          >
            {isTranslating
              ? 'Translating...'
              : 'Translate to ' + fullEnglishLanguageName[activeLang] + ' (OpenAI)'}
          </Button>
        )}

        {activeLang !== 'en' && (
          <Button
            variant="outlined"
            onClick={onTranslateToCurrentWithGoogle}
            disabled={isBusy}
            startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
          >
            {isTranslating
              ? 'Translating...'
              : 'Translate to ' + fullEnglishLanguageName[activeLang] + ' (Google)'}
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={onTranslateToAll}
          disabled={isBusy}
          startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
        >
          {isTranslating ? 'Translating...' : 'Translate all (OpenAI)'}
        </Button>

        <Button
          variant="outlined"
          onClick={onTranslateToAllWithGoogle}
          disabled={isBusy}
          startIcon={isTranslating ? <Loader size="14px" /> : <Globe size="14px" />}
        >
          {isTranslating ? 'Translating...' : 'Translate all (Google)'}
        </Button>
      </Stack>
    </Stack>
  );
};
