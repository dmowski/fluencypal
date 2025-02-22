import { Button, Stack, Typography } from "@mui/material";
import { useAiConversation } from "../Conversation/useAiConversation";
import { BookOpenText, ChevronLeft } from "lucide-react";
import { useRules } from "../Rules/useRules";
import { Markdown } from "../Markdown/Markdown";

export const RulesToLearn: React.FC = () => {
  const aiConversation = useAiConversation();
  const rules = useRules();

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
        New rule to practice.
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
          <Markdown>{rules.rule}</Markdown>
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
                mode: "rule",
                ruleToLearn: rules.rule,
              });
            }}
            size="large"
            variant="contained"
            startIcon={<BookOpenText size={"34px"} />}
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
              onClick={() => rules.removeRule()}
              startIcon={<ChevronLeft size={"18px"} />}
              variant="text"
            >
              Back
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
