import { Stack, Typography, Button, Box } from "@mui/material";

export interface DemoSnippetItem {
  label: string;
  question: string;
  userAnswerShort: string;
  feedback: string;
}

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
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1200px",
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

          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "18px", maxWidth: "700px" }}>
            {props.subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {props.demoItems.map((item, index) => (
            <Stack
              key={index}
              sx={{
                padding: "22px 22px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                gap: "14px",
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontSize: "11px", letterSpacing: 1.2, opacity: 0.8 }}
              >
                {item.label}
              </Typography>

              <Stack
                sx={{
                  gap: "8px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "12px" }}>
                  Interview question
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "4px", fontSize: "18px" }}>
                  {item.question}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  gap: "6px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "12px" }}>
                  Candidate’s short answer
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginTop: "4px", fontSize: "18px", opacity: 0.9 }}
                >
                  {item.userAnswerShort}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(25,118,210,0.12)",
                  border: "1px solid rgba(25,118,210,0.4)",
                  gap: "6px",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "12px" }}>
                  AI feedback (what to improve)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginTop: "4px", fontSize: "18px", lineHeight: 1.6 }}
                >
                  {item.feedback}
                </Typography>
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
