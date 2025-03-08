import { IconButton, Stack, Typography } from "@mui/material";
import { useAiConversation } from "./useAiConversation";
import { useEffect, useMemo, useState } from "react";
import { uniq } from "@/libs/uniq";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export const AliasGamePanel = () => {
  const aiConversation = useAiConversation();
  const wordsUserToDescribe = useMemo(() => {
    return aiConversation.gameWords?.wordsUserToDescribe?.map((w) => w.toLowerCase().trim()) || [];
  }, [aiConversation.gameWords?.wordsUserToDescribe]);

  const wordsAiToDescribe = useMemo(() => {
    return aiConversation.gameWords?.wordsAiToDescribe.map((w) => w.toLowerCase().trim()) || [];
  }, [aiConversation.gameWords?.wordsAiToDescribe]);

  const [describedByUserWords, setDescribedByUserWords] = useState<string[]>([]);
  const [describedByAiWords, setDescribedByAiWords] = useState<string[]>([]);
  const [usersMarkedWords, setUsersMarkedWords] = useState<Record<string, boolean | undefined>>({});

  const isWordIsInChatHistory = (word: string) => {
    const lowerCaseWord = word.toLowerCase().trim();

    const conversation = aiConversation.conversation;
    const wordFoundResult = conversation.find((message) => {
      const chatMessage = message.text || "";
      const lowerCaseMessage = chatMessage.toLowerCase();
      const isFound = lowerCaseMessage.indexOf(lowerCaseWord) > -1;
      return isFound;
    });

    return !!wordFoundResult;
  };

  const checkConversations = () => {
    const lastMessage = aiConversation.conversation[aiConversation.conversation.length - 1];
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
  }, [aiConversation.conversation]);

  return (
    <Stack
      sx={{
        gap: "20px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "4px",
        padding: "10px",
      }}
    >
      <Stack
        sx={{
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            opacity: 0.9,
          }}
        >
          To describe:
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            flexWrap: "wrap",
          }}
        >
          {aiConversation.gameWords?.wordsUserToDescribe.map((word, index, list) => {
            const trimWord = word.trim().toLowerCase();
            const isDescribed = describedByUserWords.includes(trimWord);
            const isMarkedByUser = usersMarkedWords[trimWord] === true;
            const isUnmarkedByUser = usersMarkedWords[trimWord] === false;

            const isDone = (isDescribed && !isUnmarkedByUser) || isMarkedByUser;

            const isLast = index === list.length - 1;
            return (
              <Typography
                variant="h4"
                className="decor-text"
                key={index}
                sx={{
                  textDecoration: isDone ? "line-through" : "none",
                  opacity: isDone ? 0.3 : 1,
                  borderRadius: "4px",
                  padding: "2px 10px 2px 0px",
                  textTransform: "capitalize",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    setUsersMarkedWords((prev) => ({
                      ...prev,
                      [trimWord]: !prev[trimWord],
                    }));
                  }}
                >
                  {isDone ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" />
                  )}
                </IconButton>
                {trimWord}
                {isLast ? "" : ","}
              </Typography>
            );
          })}
        </Stack>
      </Stack>

      <Stack
        sx={{
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            opacity: 0.9,
          }}
        >
          To guess:
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            flexWrap: "wrap",
          }}
        >
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
                {isGuessed ? word : Array(word.length).fill("*").join("")}
                {isLast ? "" : ","}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
