import { ChatSection } from "./ChatSection";
import { ChatProvider } from "./useChat";

export const ChatPage = () => {
  return (
    <ChatProvider
      metadata={{
        space: "global",
        allowedUserIds: null,
        isPrivate: false,
      }}
    >
      <ChatSection />
    </ChatProvider>
  );
};
