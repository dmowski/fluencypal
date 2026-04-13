'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type UrlStateMap = Record<string, unknown>;

interface UrlStateContextType {
  urlStateMap: UrlStateMap;
  setUrlState: (paramName: string, value: unknown) => void;
}

const UrlStateContext = createContext<UrlStateContextType | undefined>(undefined);

export const UrlStateProvider = ({ children }: { children: ReactNode }) => {
  const [urlStateMap, setUrlStateMap] = useState<UrlStateMap>({});

  const setUrlState = (paramName: string, value: unknown) => {
    setUrlStateMap((prev) => ({ ...prev, [paramName]: value }));
  };

  return (
    <UrlStateContext.Provider value={{ urlStateMap, setUrlState }}>
      {children}
    </UrlStateContext.Provider>
  );
};

export const useUrlStateContext = () => {
  const context = useContext(UrlStateContext);
  if (!context) {
    throw new Error('useUrlStateContext must be used within UrlStateProvider');
  }
  return context;
};
