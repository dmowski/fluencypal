'use client';

import { useMemo } from 'react';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { categoryInUseErrorMessage, findBlogIdsUsingCategory } from './blogCategoryUsage';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { useTextAi } from '@/features/Ai/useTextAi';
import { BlogCategoryDocument } from './types';
import { translateCategoryTitleToAllLanguages } from './translateCategoryTitle';

const normalizeCategoryId = (raw: string): string => raw.trim();

export interface SaveBlogCategoryInput {
  id: string;
  titleEn: string;
}

export interface DeleteBlogCategoryOptions {
  /** Skip this blog when checking whether the category is still referenced. */
  excludeBlogId?: string;
}

export interface UseBlogCategoriesResult {
  categories: BlogCategoryDocument[];
  isLoading: boolean;
  getCategoryById: (categoryId: string) => BlogCategoryDocument | undefined;
  createCategory: (input: SaveBlogCategoryInput) => Promise<BlogCategoryDocument>;
  updateCategory: (input: SaveBlogCategoryInput) => Promise<BlogCategoryDocument>;
  deleteCategory: (categoryId: string, options?: DeleteBlogCategoryOptions) => Promise<void>;
}

export const useBlogCategories = (): UseBlogCategoriesResult => {
  const ai = useTextAi();
  const categoriesCollection = db.collections.blogCategories();
  const [categoriesData, isLoading] = useCollectionData(categoriesCollection);

  const categories = useMemo(
    () =>
      (categoriesData ?? [])
        .slice()
        .sort((a, b) => a.title.en.localeCompare(b.title.en)),
    [categoriesData],
  );

  const existingIds = useMemo(
    () => new Set(categories.map((c) => c.id)),
    [categories],
  );

  const getCategoryById = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  const translateTitle = (titleEn: string) =>
    translateCategoryTitleToAllLanguages(titleEn, (params) => ai.generate(params));

  const writeCategory = async (
    id: string,
    title: BlogCategoryDocument['title'],
  ): Promise<BlogCategoryDocument> => {
    const now = new Date().toISOString();
    const category: BlogCategoryDocument = { id, title, updatedAtIso: now };

    const parentRef = db.documents.blogMetadataCategory();
    if (parentRef) {
      await setDoc(parentRef, { updatedAtIso: now }, { merge: true });
    }

    const categoryRef = doc(categoriesCollection, id);
    await setDoc(categoryRef, category);

    return category;
  };

  const createCategory = async ({
    id: rawId,
    titleEn,
  }: SaveBlogCategoryInput): Promise<BlogCategoryDocument> => {
    const id = normalizeCategoryId(rawId);
    const trimmed = titleEn.trim();
    if (!id) {
      throw new Error('Category ID is required');
    }
    if (!trimmed) {
      throw new Error('Category title is required');
    }
    if (existingIds.has(id)) {
      throw new Error(`Category ID "${id}" already exists`);
    }

    const title = await translateTitle(trimmed);
    return writeCategory(id, title);
  };

  const updateCategory = async ({
    id: rawId,
    titleEn,
  }: SaveBlogCategoryInput): Promise<BlogCategoryDocument> => {
    const id = normalizeCategoryId(rawId);
    const trimmed = titleEn.trim();
    if (!id) {
      throw new Error('Category ID is required');
    }
    if (!trimmed) {
      throw new Error('Category title is required');
    }
    if (!existingIds.has(id)) {
      throw new Error(`Category ID "${id}" not found`);
    }

    const title = await translateTitle(trimmed);
    return writeCategory(id, title);
  };

  const deleteCategory = async (
    rawId: string,
    options?: DeleteBlogCategoryOptions,
  ): Promise<void> => {
    const id = normalizeCategoryId(rawId);
    if (!id) {
      throw new Error('Category ID is required');
    }
    if (!existingIds.has(id)) {
      throw new Error(`Category ID "${id}" not found`);
    }

    const usedByBlogIds = await findBlogIdsUsingCategory(id, options?.excludeBlogId);
    if (usedByBlogIds.length > 0) {
      throw new Error(categoryInUseErrorMessage(usedByBlogIds));
    }

    const categoryRef = doc(categoriesCollection, id);
    await deleteDoc(categoryRef);

    const now = new Date().toISOString();
    const parentRef = db.documents.blogMetadataCategory();
    if (parentRef) {
      await setDoc(parentRef, { updatedAtIso: now }, { merge: true });
    }
  };

  return {
    categories,
    isLoading,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
