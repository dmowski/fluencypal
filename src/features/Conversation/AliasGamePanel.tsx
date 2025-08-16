import { Button, IconButton, Stack, Typography } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useEffect, useMemo, useState } from "react";
import { uniq } from "@/libs/uniq";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import { useTranslate } from "../Translation/useTranslate";
import { Languages } from "lucide-react";
import { useLingui } from "@lingui/react";

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
  const translator = useTranslate();
  const { i18n } = useLingui();
  const [isShowAll, setIsShowAll] = useState(false);
  const showAll = () => setIsShowAll(true);
  const limit = isShowAll ? wordsUserToDescribe.length + 1 : 2;

  return (
    <Stack
      sx={{
        gap: "20px",
        padding: "10px",
        maxWidth: "100dvw",
        overflowX: "auto",
      }}
    >
      {translator.translateModal}
      <Stack sx={{ flexDirection: "row", gap: "10px", alignItems: "center" }}>
        <Typography variant="caption" sx={{ opacity: 1, color: "#edefffff" }}>
          {i18n._(`Your words to describe:`)}
        </Typography>
        <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
          {wordsUserToDescribe
            .filter((_, index) => index < limit)
            .map((word, index, list) => {
              const trimWord = word.trim().toLowerCase();
              const isDescribed = describedByUserWords.includes(trimWord);
              const isMarkedByUser = usersMarkedWords[trimWord] === true;
              const isUnmarkedByUser = usersMarkedWords[trimWord] === false;
              const isDone = (isDescribed && !isUnmarkedByUser) || isMarkedByUser;

              return (
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0px",
                    opacity: isDone ? 0.3 : 1,
                    borderRadius: "4px",
                    padding: "2px 0px 2px 10px",
                    ":hover": {
                      backgroundColor: isDone
                        ? "rgba(255, 255, 70, 0.1)"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  key={index}
                >
                  <Typography
                    key={index}
                    sx={{
                      textDecoration: isDone ? "line-through" : "none",

                      textTransform: "capitalize",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setUsersMarkedWords((prev) => ({
                        ...prev,
                        [trimWord]: !prev[trimWord],
                      }))
                    }
                  >
                    {trimWord}
                  </Typography>
                  <IconButton onClick={() => translator.translateWithModal(trimWord)}>
                    <Languages size={"16px"} color="#eee" />
                  </IconButton>
                </Stack>
              );
            })}

          {!isShowAll && (
            <Button size="small" onClick={showAll} variant="text">
              {i18n._(`More`)}
            </Button>
          )}
        </Stack>
      </Stack>

      {!!describedByAiWords.length && (
        <Stack sx={{ flexDirection: "column", gap: "10px" }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {i18n._(`Guessed words:`)} {describedByAiWords.length}/{wordsAiToDescribe.length}
          </Typography>
          <Stack sx={{ flexDirection: "row", gap: "5px", flexWrap: "wrap" }}>
            {wordsAiToDescribe
              .filter((word) => {
                const trimWord = word.trim().toLowerCase();
                const isGuessed = describedByAiWords.includes(trimWord);
                return isGuessed;
              })
              .map((word, index, arr) => {
                const trimWord = word.trim().toLowerCase();
                const isGuessed = describedByAiWords.includes(trimWord);
                const isLast = index === arr.length - 1;

                return (
                  <Typography
                    variant="h5"
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
      )}
    </Stack>
  );
};
