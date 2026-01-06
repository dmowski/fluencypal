import { Stack, Typography, Button } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useLingui } from "@lingui/react";

export const ConversationReviewModal = ({
  setIsShowAnalyzeConversationModal,
  conversationAnalysisResult,
  closeConversation,
  setIsConversationContinueAfterAnalyze,
}: {
  setIsShowAnalyzeConversationModal: (value: boolean) => void;
  conversationAnalysisResult: string | null;
  closeConversation: () => void;
  setIsConversationContinueAfterAnalyze: (value: boolean) => void;
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
                paddingBottom: "20px",
              }}
              align="center"
              variant="h5"
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
            gap="10px"
            sx={{
              alignItems: "center",
              padding: "0 10px",
              boxSizing: "border-box",
            }}
          >
            <Button
              disabled={!conversationAnalysisResult}
              onClick={() => {
                setIsShowAnalyzeConversationModal(false);
                setIsConversationContinueAfterAnalyze(true);
              }}
              variant="text"
            >
              {i18n._(`Continue conversation`)}
            </Button>

            <Button
              fullWidth
              onClick={() => closeConversation()}
              variant="contained"
              color="info"
              size="large"
              disabled={!conversationAnalysisResult}
            >
              {i18n._(`Start new lesson`)}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
