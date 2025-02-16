import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { firestore } from "../Firebase/init";
import { ChatMessage } from "./types";
import { SupportedLanguage } from "@/common/lang";

interface Conversation {
  id: string;
  messagesCount: number;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  language: SupportedLanguage;
}

export const useChatHistory = () => {
  const auth = useAuth();
  const userId = auth.uid;

  const getConversationDoc = (conversationId: string) => {
    if (!userId) {
      throw new Error("❌ User ID is required");
    }

    if (!conversationId) {
      throw new Error("❌ Conversation ID is required");
    }

    const docRef = doc(
      firestore,
      `users/${userId}/conversations/${conversationId}`
    ) as DocumentReference<Conversation>;

    return docRef;
  };

  const setMessages = async (conversationId: string, messages: ChatMessage[]) => {
    const conversationDoc = getConversationDoc(conversationId);
    await setDoc(
      conversationDoc,
      {
        messages,
        messagesCount: messages.length,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  const createConversation = async (conversationId: string, language: SupportedLanguage) => {
    const conversationDoc = getConversationDoc(conversationId);
    const conversationInfo: Conversation = {
      id: conversationId,
      messagesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      language,
    };

    await setDoc(conversationDoc, conversationInfo);
  };

  return { createConversation, setMessages };
};
