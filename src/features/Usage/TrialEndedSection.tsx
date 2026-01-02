import { useLingui } from "@lingui/react";
import { Button, Stack, Typography } from "@mui/material";
import { ChevronRight, Telescope } from "lucide-react";

export const TrialEndedSection = ({ onLimitedClick }: { onLimitedClick?: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: "center",

        justifyContent: "center",
        borderRadius: "8px",
        boxShadow: "0px 0px 0 1px rgba(206, 200, 239, 0.2), 3px 3px 30px rgba(0, 0, 0, 0.3)",

        background:
          "linear-gradient(120deg, rgba(255, 255, 255, 0) 0%, rgba(47, 17, 216, 0.03) 100%)",
        padding: "30px 25px",
        maxWidth: "480px",
        gap: "25px",
      }}
    >
      <Stack
        sx={{
          gap: "5px",
        }}
      >
        <Typography
          align="center"
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: "1.4rem",
          }}
        >
          {i18n._(`Full access needed`)}
        </Typography>

        <Typography
          align="center"
          variant="body2"
          sx={{
            opacity: 0.7,
          }}
        >
          {i18n._(`Upgrade your plan to access this feature and unlock unlimited conversations.`)}
        </Typography>
      </Stack>

      <Button
        sx={{
          padding: "10px 20px",
        }}
        onClick={() => {
          onLimitedClick && onLimitedClick();
        }}
        size="large"
        variant="contained"
        color="info"
        startIcon={<Telescope />}
        endIcon={<ChevronRight />}
      >
        {i18n._(`Get Full Access`)}
      </Button>
    </Stack>
  );
};
