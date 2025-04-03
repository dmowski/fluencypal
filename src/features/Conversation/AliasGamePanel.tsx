import { IconButton, Stack, Typography } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useEffect, useMemo, useState } from "react";
import { uniq } from "@/libs/uniq";
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

type AliasGamePanelUIProps = {
  wordsUserToDescribe: string[];
  wordsAiToDescribe: string[];
  describedByUserWords: string[];
  describedByAiWords: string[];
  usersMarkedWords: Record<string, boolean | undefined>;
  setUsersMarkedWords: React.Dispatch<React.SetStateAction<Record<string, boolean | undefined>>>;
};

export const AliasGamePanelUI = ({
  wordsUserToDescribe,
  wordsAiToDescribe,
  describedByUserWords,
  describedByAiWords,
  usersMarkedWords,
  setUsersMarkedWords,
}: AliasGamePanelUIProps) => {
  return (
    <Stack
      sx={{
        gap: "20px",
        padding: "10px",
      }}
    >
      {/* Words to Describe */}
      <Stack sx={{ flexDirection: "column", gap: "10px" }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          To describe:
        </Typography>
        <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
          {wordsUserToDescribe.map((word, index, list) => {
            const trimWord = word.trim().toLowerCase();
            const isDescribed = describedByUserWords.includes(trimWord);
            const isMarkedByUser = usersMarkedWords[trimWord] === true;
            const isUnmarkedByUser = usersMarkedWords[trimWord] === false;
            const isDone = (isDescribed && !isUnmarkedByUser) || isMarkedByUser;
            const isLast = index === list.length - 1;

            return (
              <Typography
                key={index}
                sx={{
                  textDecoration: isDone ? "line-through" : "none",
                  opacity: isDone ? 0.3 : 1,
                  borderRadius: "4px",
                  padding: "2px 10px 2px 2px",
                  textTransform: "capitalize",
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: isDone
                      ? "rgba(255, 255, 70, 0.1)"
                      : "rgba(255, 255, 255, 0.1)",
                  },
                }}
                onClick={() =>
                  setUsersMarkedWords((prev) => ({
                    ...prev,
                    [trimWord]: !prev[trimWord],
                  }))
                }
              >
                <IconButton size="small">
                  {isDone ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" />
                  )}
                </IconButton>
                {trimWord}
              </Typography>
            );
          })}
        </Stack>
      </Stack>

      {/* Words to Guess */}
      <Stack sx={{ flexDirection: "column", gap: "10px" }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          To guess:
        </Typography>
        <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
          {wordsAiToDescribe.map((word, index, arr) => {
            const trimWord = word.trim().toLowerCase();
            const isGuessed = describedByAiWords.includes(trimWord);
            const isLast = index === arr.length - 1;

            return (
              <Typography
                variant="h4"
                className="decor-text"
                key={index}
                sx={{
                  opacity: isGuessed ? 1 : 0.3,
                  textTransform: "capitalize",
                }}
              >
                {isGuessed ? word : "*".repeat(word.length)}
                {isLast ? "" : ","}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
