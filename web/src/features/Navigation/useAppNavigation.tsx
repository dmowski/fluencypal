'use client';

import { createContext, useContext, ReactNode, JSX } from 'react';
import { PageType } from './types';
import { useUrlState } from '../Url/useUrlState';
import { useSearchParams } from 'next/navigation';

interface AppNavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  isLoading: boolean;
  pageUrl: (page: PageType) => string;
}

const AppNavigationContext = createContext<AppNavigationContextType | null>(null);

function useProvideAppNavigation(): AppNavigationContextType {
  const [internalValue, setValue, isLoading] = useUrlState<PageType>('page', 'home', true);
  const searchParams = useSearchParams();

  const pageUrl = (page: PageType) => {
    const searchParamsNew = new URLSearchParams(searchParams?.toString() || '');
    searchParamsNew.set('page', page);
    return `${window.location.pathname}?${searchParamsNew.toString()}`;
  };

  return {
    currentPage: internalValue,
    setCurrentPage: setValue,
    pageUrl,
    isLoading,
  };
}

export function AppNavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAppNavigation();
  return <AppNavigationContext.Provider value={hook}>{children}</AppNavigationContext.Provider>;
}

export const useAppNavigation = (): AppNavigationContextType => {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within a AppNavigationProvider');
  }
  return context;
};
