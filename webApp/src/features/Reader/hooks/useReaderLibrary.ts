import { ReaderLibraryCategory } from '../model/library';
import categoriesData from '../data/categories.json';

export const useReaderLibrary = () => {
  return {
    categories: categoriesData as ReaderLibraryCategory[],
    isLoading: false,
    error: '',
  };
};
