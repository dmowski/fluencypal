import { Button, Card, Stack, Typography } from "@mui/material";
import { useHomework } from "./useHomework";
import { conversationModeLabel } from "./data";
import { Markdown } from "../Markdown/Markdown";
import { useAiConversation } from "./useAiConversation";

export const Homework = () => {
  const aiConversation = useAiConversation();
  const homework = useHomework();
  return (
    <Card
      sx={{
        width: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        boxSizing: "border-box",
        borderRadius: "16px",
      }}
    >
      <Stack>
        <Typography variant="h4">Homework</Typography>
        {homework.incompleteHomeworks.length === 0 && (
          <Typography
            sx={{
              opacity: 0.7,
            }}
            variant="caption"
          >
            No homework yet
          </Typography>
        )}
      </Stack>

      <Stack sx={{ gap: "30px" }}>
        {homework.incompleteHomeworks.map((homework) => {
          return (
            <Stack
              key={homework.conversationId}
              sx={{
                alignItems: "flex-start",
              }}
            >
              <Typography>{conversationModeLabel[homework.mode]}</Typography>

              <Typography
                variant="caption"
                sx={{
                  opacity: 0.5,
                }}
              >
                {new Date(homework.createdAt).toLocaleDateString()}
              </Typography>
              <Stack sx={{ opacity: 0.9 }}>
                <Markdown size="small">{homework.homework}</Markdown>
              </Stack>

              <Button
                sx={{
                  marginTop: "5px",
                }}
                variant="outlined"
                onClick={() => {
                  aiConversation.startConversation({
                    mode: homework.mode,
                    homework,
                  });
                }}
              >
                Continue
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};
