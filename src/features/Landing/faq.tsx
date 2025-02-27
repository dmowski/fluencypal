import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

const FaqItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          component="span"
          variant="h5"
          sx={{
            padding: "10px",
            fontWeight: 450,
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{answer}</AccordionDetails>
    </Accordion>
  );
};

export const Faq = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "120px 0 140px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(0, 0, 0, 0)`,
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
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              fontWeight: 700,
            }}
          >
            FAQ
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "column",
            gap: "0px",
            alignItems: "stretch",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <FaqItem
            question="What is Dark Lang?"
            answer={
              <Typography>
                Dark Lang is an AI-powered platform where you can practice natural conversations in
                multiple languages—like English, Spanish, or French—with a patient and knowledgeable
                virtual tutor named Bruno.
              </Typography>
            }
          />

          <FaqItem
            question="How does usage-based pricing work?"
            answer={
              <Typography>
                You start with a free balance. Each conversation (text or voice) uses tokens, which
                deduct from your balance in real time. You can top up credits whenever you need
                more.
              </Typography>
            }
          />

          <FaqItem
            question="Is there a free trial?"
            answer={
              <Typography>
                Yes! We offer a small free balance so you can explore the platform and see if it’s
                right for you before purchasing more credits.
              </Typography>
            }
          />

          <FaqItem
            question="Can I practice languages other than English?"
            answer={
              <Typography>
                Absolutely. Bruno supports multiple languages, adapting to your choice and level.
              </Typography>
            }
          />

          <FaqItem
            question="What learning modes are available?"
            answer={
              <Typography component="div">
                <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                  <li>
                    <strong>Casual Conversation:</strong> Practice fluency without constant
                    corrections.
                  </li>
                  <li>
                    <strong>Talk & Correct:</strong> Receive detailed grammar and vocabulary
                    corrections.
                  </li>
                  <li>
                    <strong>Beginner:</strong> Slower, simpler conversations with extra guidance.
                  </li>
                </ul>
              </Typography>
            }
          />

          <FaqItem
            question="How do daily tasks help me improve?"
            answer={
              <Typography>
                Daily tasks provide new vocabulary and grammar rules, which are reinforced during
                your next conversation. This consistent practice accelerates your language growth.
              </Typography>
            }
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
