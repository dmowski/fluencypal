import { setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/common/lang";
import { db } from "../Firebase/db";
import { ChatMessage, Conversation, ConversationMode } from "@/common/conversation";

export const useChatHistory = () => {
  const auth = useAuth();
  const userId = auth.uid;

  const getConversationDoc = (conversationId: string) => {
    const docRef = db.documents.conversation(userId, conversationId);

    if (!docRef) {
      throw new Error("❌ Conversation ID and userId is required");
    }

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

  const createConversation = async ({
    conversationId,
    language,
    mode,
  }: {
    conversationId: string;
    language: SupportedLanguage;
    mode: ConversationMode;
  }) => {
    const conversationDoc = getConversationDoc(conversationId);
    const conversationInfo: Conversation = {
      id: conversationId,
      messagesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      language,
      mode,
    };

    await setDoc(conversationDoc, conversationInfo);
  };

  return {
    createConversation,
    setMessages,
  };
};
