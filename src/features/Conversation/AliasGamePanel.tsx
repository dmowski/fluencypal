import { useEffect, useMemo, useState } from "react";
import { uniq } from "@/libs/uniq";
import { AliasGamePanelUI } from "./AliasGamePanelUI";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";

interface AliasGamePanelProps {
  conversation: ChatMessage[];
  gameWords: GuessGameStat | null;
}

export const AliasGamePanel: React.FC<AliasGamePanelProps> = ({ conversation, gameWords }) => {
  const wordsUserToDescribe = useMemo(() => {
    return gameWords?.wordsUserToDescribe?.map((w) => w.toLowerCase().trim()) || [];
  }, [gameWords?.wordsUserToDescribe]);

  const wordsAiToDescribe = useMemo(() => {
    return gameWords?.wordsAiToDescribe.map((w) => w.toLowerCase().trim()) || [];
  }, [gameWords?.wordsAiToDescribe]);

  const [describedByUserWords, setDescribedByUserWords] = useState<string[]>([]);
  const [describedByAiWords, setDescribedByAiWords] = useState<string[]>([]);
  const [usersMarkedWords, setUsersMarkedWords] = useState<Record<string, boolean | undefined>>({});

  const isWordIsInChatHistory = (word: string) => {
    const lowerCaseWord = word.toLowerCase().trim();

    const wordFoundResult = conversation.find((message) => {
      const chatMessage = message.text || "";
      const lowerCaseMessage = chatMessage.toLowerCase();
      const isFound = lowerCaseMessage.indexOf(lowerCaseWord) > -1;
      return isFound;
    });

    return !!wordFoundResult;
  };

  const checkConversations = () => {
    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage) {
      return;
    }

    const newDescribedByUserWords = wordsUserToDescribe
      .filter((word) => isWordIsInChatHistory(word))
      .map((word) => word.toLowerCase());
    const newDescribedByAiWords = wordsAiToDescribe
      .filter((word) => isWordIsInChatHistory(word))
      .map((word) => word.toLowerCase());

    setDescribedByUserWords(uniq([...describedByUserWords, ...newDescribedByUserWords]));
    setDescribedByAiWords(uniq([...describedByAiWords, ...newDescribedByAiWords]));
  };

  useEffect(() => {
    checkConversations();
  }, [conversation]);

  return (
    <AliasGamePanelUI
      wordsUserToDescribe={gameWords?.wordsUserToDescribe || []}
      wordsAiToDescribe={wordsAiToDescribe}
      describedByUserWords={describedByUserWords}
      describedByAiWords={describedByAiWords}
      usersMarkedWords={usersMarkedWords}
      setUsersMarkedWords={setUsersMarkedWords}
    />
  );
};
