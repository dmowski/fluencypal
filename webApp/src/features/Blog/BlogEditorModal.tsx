'use client';

import { useState } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { Loader } from 'lucide-react';
import { BlogDocMeta } from './types';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useBlogDraft } from './useBlogDraft';
import { useBlogCategories } from './useBlogCategories';
import { BlogEditorHeader } from './BlogEditorHeader';
import { BlogEditorForm } from './BlogEditorForm';
import { BlogEditorPreview } from './BlogEditorPreview';
import { BlogCategoryModal } from './BlogCategoryModal';

interface BlogEditorModalProps {
  blog: BlogDocMeta;
  onClose: () => void;
  onUpdate: (meta: Partial<BlogDocMeta>) => Promise<void>;
}

export const BlogEditorModal = ({ blog, onClose, onUpdate }: BlogEditorModalProps) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

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

  const {
    categories,
    isLoading: isLoadingCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useBlogCategories();

  const isPublished = Boolean(blog.publishedVersion);
  const isBusy = isSaving || isPublishing || isTranslating;
  const selectedCategory = localDraft.categoryId
    ? getCategoryById(localDraft.categoryId)
    : undefined;
  const categoryTitle = selectedCategory?.title.en ?? null;

  const assignCategory = async (categoryId: string) => {
    const updated = { ...localDraft, categoryId };
    setLocalDraft(updated);
    await saveDraft(updated);
    setIsCategoryModalOpen(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    void assignCategory(categoryId);
  };

  const handleCreateCategory = async (input: { id: string; titleEn: string }) => {
    setIsSavingCategory(true);
    try {
      const category = await createCategory(input);
      await assignCategory(category.id);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleUpdateCategory = async (input: { id: string; titleEn: string }) => {
    setIsSavingCategory(true);
    try {
      await updateCategory(input);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setIsSavingCategory(true);
    try {
      await deleteCategory(categoryId, { excludeBlogId: blog.id });
      if (localDraft.categoryId === categoryId) {
        const updated = { ...localDraft, categoryId: '' };
        setLocalDraft(updated);
        await saveDraft(updated);
      }
    } finally {
      setIsSavingCategory(false);
    }
  };

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
                categoryTitle={categoryTitle}
                onOpenCategoryPicker={() => setIsCategoryModalOpen(true)}
                onImagePreviewUrlChange={(v) =>
                  setLocalDraft((prev) => ({ ...prev, imagePreviewUrl: v }))
                }
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

      {isCategoryModalOpen && (
        <BlogCategoryModal
          categories={categories}
          isLoading={isLoadingCategories}
          isSaving={isSavingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSelect={handleSelectCategory}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </CustomModal>
  );
};
