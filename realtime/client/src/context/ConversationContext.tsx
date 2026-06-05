import { createContext, useContext, type ReactNode } from 'react';
import { useConversation } from '../hooks/useConversation.js';

export type ConversationContextValue = ReturnType<typeof useConversation>;

const ConversationContext = createContext<ConversationContextValue | null>(null);

type ConversationProviderProps = {
  signedIn: boolean;
  children: ReactNode;
};

export const ConversationProvider = ({ signedIn, children }: ConversationProviderProps) => {
  const value = useConversation(signedIn);
  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

export const useConversationContext = (): ConversationContextValue => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within ConversationProvider');
  }
  return context;
};
