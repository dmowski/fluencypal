import { Stack, Typography, Button } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { ChevronRight } from "lucide-react";
import { PositionChanged } from "../Game/PositionChanged";
import { ConversationResult } from "../Plan/types";

export const ConversationReviewModal = ({
  setIsShowAnalyzeConversationModal,
  conversationAnalysisResult,
  closeConversation,
  setIsConversationContinueAfterAnalyze,
  pointsEarned,
  openCommunityPage,
}: {
  setIsShowAnalyzeConversationModal: (value: boolean) => void;
  conversationAnalysisResult: ConversationResult | null;
  closeConversation: () => void;
  setIsConversationContinueAfterAnalyze: (value: boolean) => void;
  pointsEarned: number;
  openCommunityPage: () => void;
}) => {
  const { i18n } = useLingui();

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
            <Stack
              sx={{
                gap: "15px",
                padding: "0 10px",
                boxSizing: "border-box",
              }}
            >
              <Stack>
                <Typography variant="h6">{i18n._(`Summary:`)}</Typography>
                <Typography className={!conversationAnalysisResult ? "loading-shimmer" : ""}>
                  {conversationAnalysisResult?.shortSummaryOfLesson || "..."}
                </Typography>
              </Stack>

              <Stack>
                <Typography variant="h6">{i18n._(`What was great:`)}</Typography>
                <Typography className={!conversationAnalysisResult ? "loading-shimmer" : ""}>
                  {conversationAnalysisResult?.whatUserDidWell || "..."}
                </Typography>
              </Stack>

              <Stack>
                <Typography variant="h6">{i18n._(`What can be improved:`)}</Typography>
                <Typography className={!conversationAnalysisResult ? "loading-shimmer" : ""}>
                  {conversationAnalysisResult?.whatUserCanImprove || "..."}
                </Typography>
              </Stack>

              <Stack>
                <Typography variant="h6">{i18n._(`What to focus on next time:`)}</Typography>
                <Typography className={!conversationAnalysisResult ? "loading-shimmer" : ""}>
                  {conversationAnalysisResult?.whatToFocusOnNextTime || "..."}
                </Typography>
              </Stack>
            </Stack>
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
              {i18n._(`Next Lesson`)}
            </Button>

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
