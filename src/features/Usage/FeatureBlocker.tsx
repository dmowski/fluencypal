import { useLingui } from "@lingui/react";
import { Button, Stack, Typography } from "@mui/material";
import { ChevronRight, Telescope } from "lucide-react";
import { ColorIconTextList } from "../Survey/ColorIconTextList";

export const FeatureBlocker = ({ onLimitedClick }: { onLimitedClick: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        boxShadow: "0px 0px 0 1px rgba(206, 200, 239, 0.2), 3px 3px 30px rgba(0, 0, 0, 0.3)",
        background:
          "linear-gradient(120deg, rgba(255, 255, 255, 0) 0%, rgba(31, 3, 186, 0.03) 100%)",
        padding: "30px 25px",
        width: "100%",
        gap: "25px",
      }}
    >
      <Stack
        sx={{
          gap: "5px",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: "1.7rem",
          }}
        >
          {i18n._(`Full access`)}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
          }}
        >
          {i18n._(`Upgrade your plan to unlock unlimited conversations.`)}
        </Typography>
      </Stack>

      <Stack sx={{ width: "100%" }}>
        <ColorIconTextList
          listItems={[
            {
              title: i18n._("Unlimited AI Conversations"),
              iconName: "star",
            },
            {
              title: i18n._("Instant Grammar Corrections"),
              iconName: "book",
            },
            {
              title: i18n._("Realistic AI voice responses"),
              iconName: "microscope",
            },
          ]}
          gap="15px"
          iconSize={"20px"}
        />
      </Stack>
      <Stack
        sx={{
          width: "100%",
          gap: "10px",
        }}
      >
        <Button
          sx={{
            padding: "10px 20px",
          }}
          onClick={onLimitedClick}
          size="large"
          fullWidth
          variant="contained"
          startIcon={<Telescope />}
          endIcon={<ChevronRight />}
        >
          {i18n._(`Get Full Access`)}
        </Button>
        <Typography variant="caption">
          {i18n._(
            `Hint: You can get full access for free by reaching the top 5 in the game leaderboard!`
          )}
        </Typography>
      </Stack>
    </Stack>
  );
};
