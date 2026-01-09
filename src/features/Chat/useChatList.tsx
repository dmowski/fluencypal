"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { UserChatMetadata } from "./type";

interface ChatListContextType {
  loading: boolean;
  myChats: UserChatMetadata[];
}

const ChatListContext = createContext<ChatListContextType | null>(null);

function useProvideChatList(): ChatListContextType {
  const auth = useAuth();
  const chatListRef = db.collections.userChatList(auth.uid || "");

  const myChatsQuery = useMemo(() => {
    if (chatListRef === null || !auth.uid) return null;
    return query(chatListRef, where("allowedUserIds", "array-contains", auth.uid));
  }, [chatListRef, auth.uid]);

  const [myChats, myChatsLoading, myChatsError] = useCollectionData(myChatsQuery);

  if (myChatsError) {
    console.error("Error fetching my chats:", myChatsError);
  }

  return {
    loading: myChatsLoading,
    myChats: myChats || [],
  };
}

export function ChatListProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideChatList();

  return <ChatListContext.Provider value={hook}>{children}</ChatListContext.Provider>;
}

export const useChatList = (): ChatListContextType => {
  const context = useContext(ChatListContext);
  if (!context) {
    throw new Error("useChatList must be used within a UsageProvider");
  }
  return context;
};
