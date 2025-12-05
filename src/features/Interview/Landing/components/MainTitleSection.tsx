import { Button, Stack, Typography } from "@mui/material";
import { H1 } from "./Typography";

export interface MainTitleSectionProps {
  label: string;
  title: string;
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
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
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
          }}
        >
          {props.label}
        </Typography>
        <H1>{props.title}</H1>
        <Typography
          variant="body1"
          align="center"
          sx={{
            fontWeight: 400,
            fontSize: "24px",
            maxWidth: "800px",
            "@media (max-width: 600px)": {
              fontSize: "18px",
            },
          }}
        >
          {props.subTitle}
        </Typography>

        <Button
          href={props.buttonHref}
          variant="contained"
          size="large"
          color="info"
          sx={{
            marginTop: "32px",
            padding: "14px 32px",
            borderRadius: "48px",
            fontSize: "18px",
          }}
        >
          {props.buttonTitle}
        </Button>
      </Stack>
    </Stack>
  );
};
