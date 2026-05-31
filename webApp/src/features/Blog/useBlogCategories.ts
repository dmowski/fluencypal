'use client';

import { useMemo } from 'react';
import { doc, setDoc } from 'firebase/firestore';
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

export interface UseBlogCategoriesResult {
  categories: BlogCategoryDocument[];
  isLoading: boolean;
  getCategoryById: (categoryId: string) => BlogCategoryDocument | undefined;
  createCategory: (input: SaveBlogCategoryInput) => Promise<BlogCategoryDocument>;
  updateCategory: (input: SaveBlogCategoryInput) => Promise<BlogCategoryDocument>;
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

  return {
    categories,
    isLoading,
    getCategoryById,
    createCategory,
    updateCategory,
  };
};
