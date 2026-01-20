import { useLingui } from "@lingui/react";
import { Button, Stack, Typography } from "@mui/material";
import { ChevronRight, Telescope } from "lucide-react";
import { ColorIconTextList } from "../Survey/ColorIconTextList";

export const FeatureBlocker = ({
  onLimitedClick,
}: {
  onLimitedClick: () => void;
}) => {
  const { i18n } = useLingui();

  const bgUrl = "/landing/preview/space2.webp";

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        boxShadow:
          "0px 0px 0 1px rgba(206, 200, 239, 0.2), 2px 2px 30px rgba(0, 0, 0, 0.1)",
        background: "rgba(10, 18, 30, 1)",

        width: "100%",
        gap: "25px",
        position: "relative",
        zIndex: 1,
        padding: "30px 25px",
        //overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          gap: "25px",
          alignItems: "center",
          justifyContent: "center",
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
            {i18n._(`Full Access`)}
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
                title: i18n._("Listening practice. You will hear AI responses"),
                iconName: "volume-2",
              },
              {
                title: i18n._("Voice conversations without delays"),
                iconName: "mic",
              },
            ]}
            gap="15px"
            iconSize={"20px"}
          />
        </Stack>
        <Stack
          sx={{
            width: "100%",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <Button
            sx={{
              padding: "10px 20px",
            }}
            onClick={onLimitedClick}
            size="large"
            variant="contained"
            startIcon={<Telescope />}
            endIcon={<ChevronRight />}
          >
            {i18n._(`Get Full Access`)}
          </Button>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          backgroundColor: `#10131a`,
          top: 0,
          left: "0px",
          margin: "0 auto",
          width: "100%",
          borderRadius: "18px",
          overflow: "hidden",
          height: "100%",
          zIndex: -2,
          background: `url('${bgUrl}') no-repeat center center`,
          backgroundSize: "cover",
          opacity: 0.1,
        }}
      />
    </Stack>
  );
};
