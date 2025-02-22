import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useWords } from "../Words/useWords";
import { ChevronLeft, GraduationCap } from "lucide-react";

export const WordsToLearn: React.FC = () => {
  const aiConversation = useAiConversation();
  const words = useWords();

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
      <Typography
        sx={{
          opacity: 0.7,
        }}
        variant="caption"
      >
        New words to practice.
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
            gap: "0px 10px",
            flexWrap: "wrap",
            boxSizing: "border-box",
          }}
        >
          <Typography className="decor-text" variant="h4" align="center">
            {words.wordsToLearn.join(", ")}
          </Typography>
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
              });
              words.removeWordsToLearn();
            }}
            size="large"
            variant="contained"
            startIcon={<GraduationCap size={"34px"} />}
          >
            Start practice
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
              Back
            </Button>
            <Tooltip title="Generate new words">
              <Button variant="text" onClick={() => words.getNewWordsToLearn()}>
                I know all of them
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
