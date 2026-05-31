'use client';

import { useState } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { Loader } from 'lucide-react';
import { BlogDocMeta } from './types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useBlogDraft } from './useBlogDraft';
import { BlogEditorHeader } from './BlogEditorHeader';
import { BlogEditorForm } from './BlogEditorForm';
import { BlogEditorPreview } from './BlogEditorPreview';

interface BlogEditorModalProps {
  blog: BlogDocMeta;
  onClose: () => void;
  onUpdate: (meta: Partial<BlogDocMeta>) => Promise<void>;
}

export const BlogEditorModal = ({ blog, onClose, onUpdate }: BlogEditorModalProps) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');

  const {
    localDraft,
    setLocalDraft,
    isLoadingDraft,
    isSaving,
    isPublishing,
    isTranslating,
    setLangField,
    saveDraft,
    publishDraft,
    handleTranslateToCurrentLang,
    handleTranslateToAllLanguages,
  } = useBlogDraft(blog, onUpdate);

  const isPublished = Boolean(blog.publishedVersion);
  const isBusy = isSaving || isPublishing || isTranslating;

  return (
    <CustomModal onClose={onClose} isOpen={true}>
      <Stack sx={{ width: '100%', maxWidth: '900px', gap: '20px' }}>
        <BlogEditorHeader
          enTitle={localDraft.title['en']}
          isPublished={isPublished}
          activeLang={activeLang}
          onLangChange={setActiveLang}
        />

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as 'edit' | 'preview')}>
          <Tab label="Edit" value="edit" />
          <Tab label="Preview" value="preview" />
        </Tabs>

        {isLoadingDraft ? (
          <Stack sx={{ alignItems: 'center', padding: '40px' }}>
            <Loader size="24px" />
          </Stack>
        ) : (
          <>
            {activeTab === 'edit' && (
              <BlogEditorForm
                draft={localDraft}
                activeLang={activeLang}
                isBusy={isBusy}
                isSaving={isSaving}
                isPublishing={isPublishing}
                isTranslating={isTranslating}
                isPublished={isPublished}
                onImagePreviewUrlChange={(v) =>
                  setLocalDraft((prev) => ({ ...prev, imagePreviewUrl: v }))
                }
                onCategoryIdChange={(v) => setLocalDraft((prev) => ({ ...prev, categoryId: v }))}
                onTitleChange={(v) => setLangField('title', v, activeLang)}
                onSubTitleChange={(v) => setLangField('subTitle', v, activeLang)}
                onContentChange={(v) => setLangField('content', v, activeLang)}
                onKeywordsChange={(v) => setLangField('keywords', v, activeLang)}
                onSave={() => saveDraft()}
                onPublish={publishDraft}
                onTranslateToCurrent={() => handleTranslateToCurrentLang(activeLang)}
                onTranslateToAll={handleTranslateToAllLanguages}
              />
            )}

            {activeTab === 'preview' && (
              <BlogEditorPreview draft={localDraft} activeLang={activeLang} />
            )}
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
