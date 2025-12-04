import { Button, Stack, Typography } from "@mui/material";
import { CheckCircle2 } from "lucide-react";

export interface WhoIsThisForSectionProps {
  id: string;
  title: string;
  subTitle: string;
  audienceItems: string[];
  buttonTitle?: string;
  buttonHref?: string;
}

/** Interview Landing – Who This Is For */
export const WhoIsThisForSection = (props: WhoIsThisForSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "900px",
          width: "100%",
          gap: "24px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: "42px",
              "@media (min-width: 900px)": {
                fontSize: "56px",
              },
            }}
          >
            {props.title}
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "18px", maxWidth: "650px" }}>
            {props.subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: "14px",
            marginTop: "26px",
          }}
        >
          {props.audienceItems.map((item, index) => (
            <Stack key={index} direction="row" spacing={1.5} alignItems="center" sx={{}}>
              <CheckCircle2 size={22} color="#4caf50" style={{}} />
              <Typography variant="body1" sx={{ fontSize: "18px", lineHeight: 1.6, opacity: 0.9 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {props.buttonTitle && props.buttonHref && (
          <Stack alignItems="center">
            <Button
              href={props.buttonHref}
              variant="contained"
              size="large"
              color="info"
              sx={{
                marginTop: "32px",
                borderRadius: "48px",
                fontSize: "16px",
              }}
            >
              {props.buttonTitle}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
