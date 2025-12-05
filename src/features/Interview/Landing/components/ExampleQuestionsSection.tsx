import { Button, Stack, Typography } from "@mui/material";
import { Question } from "../../types";
import { TechChip } from "./TechChip";
import { H2, SubTitle } from "./Typography";

export interface ExampleQuestionsProps {
  id: string;
  title: string;
  subTitle: string;
  questions: Question[];
  buttonTitle?: string;
  buttonHref?: string;
}

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
          maxWidth: "1300px",
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
          <H2>{props.title}</H2>
          <SubTitle>{props.subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: "30px",
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
                gap: "10px",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="body1"
                sx={{ marginTop: "4px", fontSize: "18px", lineHeight: 1.5 }}
              >
                {question.question}
              </Typography>

              <Stack
                sx={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "25px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "15px 0 0 4px",
                }}
              >
                {question.techItems.map((item, itemIndex) => (
                  <Stack
                    key={itemIndex}
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "11px",
                    }}
                  >
                    {item.logoUrl && (
                      <img
                        src={item.logoUrl}
                        alt={item.label}
                        style={{ width: "20px", height: "auto" }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.8,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
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
