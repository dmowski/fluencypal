import { Button, Stack, Typography } from "@mui/material";

export interface ExampleQuestionsProps {
  id: string;
  title: string;
  subTitle: string;
  questions: string[];
  buttonTitle?: string;
  buttonHref?: string;
}

/** Interview Landing – Example Questions */
export const ExampleQuestionsSection = (props: ExampleQuestionsProps) => {
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
          maxWidth: "1400px",
          width: "100%",
          gap: "24px",
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
              sm: "1fr 1fr",
            },
            gap: "16px",
            marginTop: "32px",
          }}
        >
          {props.questions.map((question, index) => (
            <Stack
              key={index}
              sx={{
                padding: "16px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ opacity: 0.7, fontSize: "11px", letterSpacing: 1 }}
              >
                Question {index + 1}
              </Typography>
              <Typography
                variant="body1"
                sx={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.5 }}
              >
                {question}
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
