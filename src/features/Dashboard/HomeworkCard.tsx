import { Button, Stack, Typography } from "@mui/material";
import { useHomework } from "../Homework/useHomework";
import { conversationModeLabel } from "../Conversation/data";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useState } from "react";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { PackageOpen } from "lucide-react";

export const HomeworkCard = () => {
  const aiConversation = useAiConversation();
  const homeworkService = useHomework();
  const [limit, setLimit] = useState(1);

  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" align="left" className="decor-title">
          Homework
        </Typography>
        {homeworkService.incompleteHomeworks.length === 0 && (
          <>
            <Stack
              sx={{
                alignItems: "center",
                width: "100%",
                gap: "10px",
                paddingTop: "15px",
                marginBottom: "-50px",
              }}
            >
              <Stack
                sx={{
                  borderRadius: "50%",
                  padding: "20px",
                  backgroundColor: "rgba(240, 240, 240, 0.04)",

                  justifyContent: "center",
                }}
              >
                <PackageOpen size={"70px"} strokeWidth={"0.7px"} color="rgba(140, 140, 140, 1)" />
              </Stack>
              <Stack>
                <Typography
                  align="center"
                  sx={{
                    opacity: 0.9,
                    fontWeight: 700,
                  }}
                  variant="body1"
                >
                  No homework assigned yet.
                </Typography>
                <Typography
                  align="center"
                  sx={{
                    opacity: 0.7,
                  }}
                  variant="caption"
                >
                  Start a conversation to get one.
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                onClick={() =>
                  aiConversation.startConversation({
                    mode: "talk",
                  })
                }
              >
                Start & Get Homework
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
