import { Button, Stack, Typography } from "@mui/material";
import { subTitleFontStyle, titleFontStyle } from "./landingSettings";
import { VideoSwitcher } from "./VideoSwitcher";

interface IntroVideoDemoProps {
  title: string;
  subTitle: string;
}
export const IntroVideoDemo = ({ title, subTitle }: IntroVideoDemoProps) => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "100px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        color: "#000",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "890px",
            gap: "20px",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              ...titleFontStyle,
            }}
          >
            {title}
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "900px",
              ...subTitleFontStyle,
            }}
          >
            {subTitle}
          </Typography>
        </Stack>

        <VideoSwitcher />

        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            color: "rgb(43 35 88)",
          }}
        >
          <Button
            sx={{
              padding: "15px 80px",
              borderWidth: "2px",
              boxShadow: "none",
              borderRadius: "50px",
            }}
            variant="outlined"
            size="large"
            color="inherit"
            href={"/practice"}
          >
            {"Get started free"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
