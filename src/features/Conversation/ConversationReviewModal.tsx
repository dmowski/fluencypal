import { Stack, Typography, Button, Badge } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useLingui } from "@lingui/react";
import { ChevronRight, Users } from "lucide-react";
import { PositionChanged } from "../Game/PositionChanged";
import { useChatList } from "../Chat/useChatList";

export const ConversationReviewModal = ({
  setIsShowAnalyzeConversationModal,
  conversationAnalysisResult,
  closeConversation,
  setIsConversationContinueAfterAnalyze,
  pointsEarned,
  openCommunityPage,
}: {
  setIsShowAnalyzeConversationModal: (value: boolean) => void;
  conversationAnalysisResult: string | null;
  closeConversation: () => void;
  setIsConversationContinueAfterAnalyze: (value: boolean) => void;
  pointsEarned: number;
  openCommunityPage: () => void;
}) => {
  const { i18n } = useLingui();

  const chatList = useChatList();
  const unreadMessagesCount = chatList.unreadCountGlobal;

  return (
    <CustomModal isOpen={true} onClose={() => setIsShowAnalyzeConversationModal(false)}>
      <Stack
        sx={{
          gap: "30px",
          width: "100dvw",
          alignItems: "center",
          paddingBottom: "40px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "600px",
            gap: "30px",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              gap: "10px",
            }}
          >
            <Typography
              sx={{
                paddingLeft: "10px",
                fontWeight: 700,
              }}
              variant="h4"
              component={"h2"}
            >
              {i18n._("Lesson Review")}
            </Typography>
            {conversationAnalysisResult ? (
              <Stack
                sx={{
                  gap: "15px",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <Markdown>{conversationAnalysisResult}</Markdown>
              </Stack>
            ) : (
              <Stack
                sx={{
                  gap: "15px",
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <Stack>
                  <Typography variant="h6">{i18n._(`What was great:`)}</Typography>
                  <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                </Stack>

                <Stack>
                  <Typography variant="h6">{i18n._(`Areas to improve:`)}</Typography>
                  <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                </Stack>

                <Stack>
                  <Typography variant="body1">{i18n._(`Language level:`)}</Typography>
                  <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>

          <Stack
            sx={{
              padding: "15px 15px 15px 15px",
              border: "1px solid rgba(97, 149, 255, 0.4)",
              borderRadius: "10px",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h6">{i18n._(`Leaderboard`)}</Typography>
            {pointsEarned && (
              <Typography>
                {i18n._(`Points earned: {pointsEarned}. Keep practicing to improve your score!`, {
                  pointsEarned,
                })}
              </Typography>
            )}
            <PositionChanged />
          </Stack>

          <Stack
            gap="10px"
            sx={{
              padding: "0 10px",
              boxSizing: "border-box",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <Button
              onClick={() => closeConversation()}
              variant="contained"
              color="info"
              size="large"
              endIcon={<ChevronRight />}
              disabled={!conversationAnalysisResult}
            >
              {i18n._(`Start new lesson`)}
            </Button>

            <Badge
              color="error"
              badgeContent={conversationAnalysisResult ? unreadMessagesCount | 0 : 0}
            >
              <Button
                disabled={!conversationAnalysisResult}
                onClick={() => {
                  setIsShowAnalyzeConversationModal(false);
                  setIsConversationContinueAfterAnalyze(true);
                  openCommunityPage();
                }}
                endIcon={<Users size={"16px"} />}
                variant="outlined"
                size="large"
                color="info"
              >
                {i18n._(`Join community chat`)}
              </Button>
            </Badge>

            <Button
              disabled={!conversationAnalysisResult}
              onClick={() => {
                setIsShowAnalyzeConversationModal(false);
                setIsConversationContinueAfterAnalyze(true);
              }}
              variant="outlined"
              size="large"
              color="info"
            >
              {i18n._(`Continue conversation`)}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
