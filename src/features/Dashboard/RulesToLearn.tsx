import { Button, Stack, Typography } from "@mui/material";
import { useAiConversation } from "../Conversation/useAiConversation";
import { BookOpenText, ChevronLeft } from "lucide-react";
import { useRules } from "../Rules/useRules";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";
import { useSettings } from "../Settings/useSettings";

export const RulesToLearn: React.FC = () => {
  const aiConversation = useAiConversation();
  const rules = useRules();
  const translator = useTranslate();
  const { i18n } = useLingui();
  const settings = useSettings();

  return (
    <Stack
      sx={{
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 10px 10px 10px",
        boxSizing: "border-box",
      }}
    >
      {translator.translateModal}
      <Typography
        sx={{
          maxWidth: "700px",
          width: "100%",
          paddingBottom: "20px",
          marginLeft: "-6px",
        }}
        variant="h2"
        className="decor-text"
      >
        {i18n._(`New rule to practice.`)}
      </Typography>
      <Stack
        sx={{
          gap: "40px",
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
          <Markdown
            variant="conversation"
            onWordClick={(word, element) => {
              translator.translateWithModal(word, element);
            }}
          >
            {rules.rule}
          </Markdown>
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
                goal: rules.goal,
                conversationMode: settings.conversationMode,
              });
              rules.removeRule();
            }}
            size="large"
            variant="contained"
            startIcon={<BookOpenText size={"34px"} />}
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
              onClick={() => rules.removeRule()}
              startIcon={<ChevronLeft size={"18px"} />}
              variant="text"
            >
              {i18n._(`Back`)}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
