'use client';
import { createContext, useContext, ReactNode, JSX } from 'react';

interface NameHookContextType {
  loading: boolean;
}

const NameHookContext = createContext<NameHookContextType | null>(null);

function useProvideNameHook(): NameHookContextType {
  return {
    loading: false,
  };
}

export function NameHookProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideNameHook();
  return <NameHookContext.Provider value={hook}>{children}</NameHookContext.Provider>;
}

export const useNameHook = (): NameHookContextType => {
  const context = useContext(NameHookContext);
  if (!context) {
    throw new Error('useNameHook must be used within a NameHookProvider');
  }
  return context;
};
