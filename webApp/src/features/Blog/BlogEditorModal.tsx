'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
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
  onRenameId: (newId: string) => Promise<void>;
}

export const BlogEditorModal = ({ blog, onClose, onUpdate, onRenameId }: BlogEditorModalProps) => {
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const {
    localDraft,
    setLocalDraft,
    isLoadingDraft,
    isSaving,
    isPublishing,
    isUnpublishing,
    isTranslating,
    setLangField,
    saveDraft,
    publishDraft,
    unpublishDraft,
    handleTranslateToCurrentLang,
    handleTranslateToAllLanguages,
    handleTranslateToCurrentLangWithGoogle,
    handleTranslateToAllLanguagesWithGoogle,
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
  const isBusy = isSaving || isPublishing || isUnpublishing || isTranslating;
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
    <CustomModal onClose={onClose} isOpen={true} desktopPadding="0" mobilePadding="0">
      <Stack
        sx={{
          width: '100%',
          height: '100dvh',
          maxHeight: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Stack
          sx={{
            flexShrink: 0,
            padding: { xs: '16px 48px 16px 16px', sm: '16px 56px 16px 24px' },
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <BlogEditorHeader
            enTitle={localDraft.title['en']}
            isPublished={isPublished}
            activeLang={activeLang}
            onLangChange={setActiveLang}
          />
        </Stack>

        {isLoadingDraft ? (
          <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="24px" />
          </Stack>
        ) : (
          <Stack
            sx={{
              flex: 1,
              flexDirection: 'row',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Stack
              sx={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                overflow: 'auto',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                padding: { xs: '16px', sm: '24px' },
                boxSizing: 'border-box',
              }}
            >
              <BlogEditorForm
                draft={localDraft}
                blogId={blog.id}
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
                onUnpublish={unpublishDraft}
                isUnpublishing={isUnpublishing}
                onTranslateToCurrent={() => handleTranslateToCurrentLang(activeLang)}
                onTranslateToAll={handleTranslateToAllLanguages}
                onTranslateToCurrentWithGoogle={() =>
                  handleTranslateToCurrentLangWithGoogle(activeLang)
                }
                onTranslateToAllWithGoogle={handleTranslateToAllLanguagesWithGoogle}
                onRenameId={onRenameId}
              />
            </Stack>

            <Stack
              sx={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                overflow: 'auto',
                padding: { xs: '16px', sm: '24px' },
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <BlogEditorPreview draft={localDraft} activeLang={activeLang} />
            </Stack>
          </Stack>
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
