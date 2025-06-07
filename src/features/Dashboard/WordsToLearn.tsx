import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useWords } from "../Words/useWords";
import { ChevronLeft, GraduationCap, Languages } from "lucide-react";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";

export const WordsToLearn: React.FC = () => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const { i18n } = useLingui();
  const translator = useTranslate();

  return (
    <Stack
      sx={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {translator.translateModal}

      <Typography
        sx={{
          opacity: 0.7,
        }}
        variant="caption"
      >
        {i18n._(`New words to practice.`)}
      </Typography>
      <Stack
        sx={{
          gap: "40px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          sx={{
            maxWidth: "700px",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0px 12px",
            flexWrap: "wrap",
            boxSizing: "border-box",
          }}
        >
          {words.wordsToLearn.map((word, index) => {
            const isLastWord = index === words.wordsToLearn.length - 1;
            return (
              <Typography
                key={index}
                className="decor-text"
                variant="h4"
                align="center"
                sx={{
                  borderBottom: "1px dashed transparent",
                  ":hover": {
                    cursor: "pointer",
                    borderBottom: "1px dashed #fff",
                  },
                }}
                onClick={async () => {
                  await translator.translateWithModal(word);
                }}
              >
                {word}
                <Languages
                  size={"16px"}
                  style={{
                    paddingLeft: "8px",
                    paddingRight: "2px",
                    opacity: 0.6,
                  }}
                />
                {!isLastWord ? "" : ""}
              </Typography>
            );
          })}
        </Stack>
        <Stack
          sx={{
            gap: "40px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <Button
            onClick={async () => {
              await aiConversation.startConversation({
                mode: "words",
                wordsToLearn: words.wordsToLearn,
                goal: words.goal,
              });
              words.removeWordsToLearn();
            }}
            size="large"
            variant="contained"
            startIcon={<GraduationCap size={"34px"} />}
          >
            {i18n._(`Start practice`)}
          </Button>
          <Stack
            sx={{
              gap: "10px",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={() => words.removeWordsToLearn()}
              startIcon={<ChevronLeft size={"18px"} />}
              variant="text"
            >
              {i18n._(`Back`)}
            </Button>
            <Tooltip title="Generate new words">
              <Button
                variant="text"
                onClick={() => words.getNewWordsToLearn(words.goal || undefined)}
              >
                {i18n._(`I know all of them`)}
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
