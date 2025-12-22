import { Button, Stack, Typography } from "@mui/material";
import { H1, H1SubTitle } from "./Typography";
import { MoveRight } from "lucide-react";

export interface MainTitleSectionProps {
  label: string;
  title: string;
  bgImageUrl?: string;
  subTitle: string;
  buttonHref: string;
  buttonTitle: string;
}

/** Interview Landing Main Title Section */
export const MainTitleSection = (props: MainTitleSectionProps) => {
  return (
    <Stack
      sx={{
        paddingTop: "200px",
        paddingBottom: "150px",

        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
        position: "relative",
      }}
    >
      {props.bgImageUrl && (
        <Stack
          component="img"
          src={props.bgImageUrl}
          alt="Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            opacity: 0.9,
          }}
        />
      )}
      <Stack
        sx={{
          maxWidth: "1300px",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
          "@media (max-width: 600px)": {
            alignItems: "flex-start",
          },
        }}
      >
        <Typography
          component={"p"}
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: "18px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "28px",
            padding: "6px 42px",
            marginBottom: "10px",
            "@media (max-width: 600px)": {
              width: "max-content",
              textAlign: "left",
              padding: "6px 12px",
              borderRadius: "10px",
            },
          }}
        >
          {props.label}
        </Typography>
        <H1>{props.title}</H1>
        <H1SubTitle>{props.subTitle}</H1SubTitle>

        <Button
          href={props.buttonHref}
          variant="contained"
          size="large"
          color="info"
          sx={{
            marginTop: "32px",
            padding: "14px 45px 14px 48px",
            borderRadius: "48px",
            fontSize: "18px",
          }}
          endIcon={<MoveRight />}
        >
          {props.buttonTitle}
        </Button>
      </Stack>
    </Stack>
  );
};
