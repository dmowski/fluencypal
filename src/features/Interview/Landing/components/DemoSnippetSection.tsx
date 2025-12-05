import { Stack, Typography, Button, Box } from "@mui/material";
import { H2, SubTitle } from "./Typography";
import { DemoSnippetItem } from "../../types";

export interface DemoSnippetSectionProps {
  id: string;
  title: string;
  subTitle: string;
  demoItems: DemoSnippetItem[];
  buttonTitle?: string;
  buttonHref?: string;
}

/** Interview Landing – Demo Snippet (Sample Feedback) */
export const DemoSnippetSection = (props: DemoSnippetSectionProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          width: "100%",
          gap: "32px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            textAlign: "center",
          }}
        >
          <H2>{props.title}</H2>
          <SubTitle>{props.subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: "32px",
            marginTop: "24px",
          }}
        >
          {props.demoItems.map((item, index) => (
            <Stack
              key={index}
              sx={{
                gap: "20px",
                padding: "30px 20px 24px 20px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.0))",
                "@media (max-width: 600px)": {
                  borderRadius: "12px",
                },
              }}
            >
              <Stack
                sx={{
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                }}
              >
                <Stack
                  sx={{
                    gap: "6px",
                    padding: "12px 16px",
                    borderRadius: "12px 12px 12px 2px",
                    backgroundColor: "rgba(33,98,166,0.15)",
                    border: "1px solid rgba(33,98,166,0.35)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    Question
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                    {item.question}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  alignSelf: "flex-end",
                  maxWidth: "85%",
                }}
              >
                <Stack
                  sx={{
                    gap: "6px",
                    padding: "12px 16px",
                    borderRadius: "12px 12px 2px 12px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      letterSpacing: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    Candidate's answer
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.5, opacity: 0.95 }}>
                    {item.userAnswerShort}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  alignSelf: "flex-start",
                  maxWidth: "100%",
                }}
              >
                <Stack
                  sx={{
                    padding: "12px 16px",
                    borderRadius: "12px 12px 12px 2px",
                    backgroundColor: "rgba(33,98,166,0.15)",
                    border: "1px solid rgba(33,98,166,0.35)",
                    gap: "6px",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    AI feedback
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {item.feedback}
                  </Typography>
                </Stack>
              </Stack>
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
                marginTop: "8px",
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
