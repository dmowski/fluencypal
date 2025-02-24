import { Button, Stack, Typography } from "@mui/material";
import { useHomework } from "../Homework/useHomework";
import { conversationModeLabel } from "../Conversation/data";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useState } from "react";
import { DashboardCard } from "../uiKit/Card/DashboardCard";

export const HomeworkCard = () => {
  const aiConversation = useAiConversation();
  const homeworkService = useHomework();
  const [limit, setLimit] = useState(1);

  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          Homework
        </Typography>
        {homeworkService.incompleteHomeworks.length === 0 && (
          <>
            <Stack
              sx={{
                alignItems: "flex-start",
                width: "100%",
                gap: "10px",
              }}
            >
              <Typography
                sx={{
                  opacity: 0.7,
                }}
                variant="caption"
              >
                No homework yet. Start any conversation to get homework.
              </Typography>
              <Button
                variant="outlined"
                onClick={() =>
                  aiConversation.startConversation({
                    mode: "talk",
                  })
                }
              >
                Start a conversation
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <Stack sx={{ gap: "30px" }}>
        {homeworkService.incompleteHomeworks
          .filter((_, index) => index < limit)
          .map((homework) => {
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

                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                    marginTop: "5px",
                    width: "100%",
                  }}
                >
                  <Button
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
                  <Button
                    variant="text"
                    onClick={() => {
                      const confirm = window.confirm(
                        "Are you sure you want to skip this homework?"
                      );
                      if (!confirm) return;

                      homeworkService.shipHomework(homework.id);
                    }}
                  >
                    Skip
                  </Button>
                </Stack>
              </Stack>
            );
          })}
      </Stack>
      {homeworkService.incompleteHomeworks.length > limit && (
        <Button
          sx={{
            marginTop: "20px",
          }}
          onClick={() => setLimit(homeworkService.incompleteHomeworks.length)}
        >
          Show all
        </Button>
      )}
    </DashboardCard>
  );
};
