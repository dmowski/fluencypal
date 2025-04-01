import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { GradientCard } from "../uiKit/Card/GradientCard";
import { useWebCam } from "../webCam/useWebCam";

export const BrainCard = () => {
  const aiConversation = useAiConversation();
  const webCam = useWebCam();
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          {i18n._(`Brain`)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          {i18n._(`Transfer knowledge directly to the brain | Only Today`)}
        </Typography>
      </Stack>
      <Stack
        sx={{
          gap: "20px",
          alignItems: "flex-start",
          width: "max-content",
        }}
      >
        <GradientCard
          padding="15px"
          strokeWidth="2px"
          startColor={"#fa8500"}
          endColor={"#05acff"}
          backgroundColor={"rgba(10, 18, 30, 0)"}
        >
          <Button
            variant="contained"
            sx={{
              padding: "20px 100px",
              borderRadius: "16px",
            }}
            startIcon={
              <PsychologyIcon
                sx={{
                  fontSize: "6rem",
                  width: "6rem",
                  height: "6rem",
                }}
              />
            }
          >
            Connect to my brain
          </Button>
        </GradientCard>
      </Stack>
    </DashboardCard>
  );
};
