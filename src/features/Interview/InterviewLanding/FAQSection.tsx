"use client";
import { useLingui } from "@lingui/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";

export const FAQSection = () => {
  const { i18n } = useLingui();

  const faqs = [
    {
      question: i18n._(`Do I need experience to use this?`),
      answer: i18n._(
        `No, our platform works for all experience levels — from entry-level to senior positions. The AI adapts to your background and provides personalized feedback.`
      ),
    },
    {
      question: i18n._(
        `Does it help for HR, behavioral, or technical interviews?`
      ),
      answer: i18n._(
        `Yes! We cover HR questions, behavioral interviews, and general interview preparation. The platform helps you structure answers and build confidence regardless of the interview type.`
      ),
    },
    {
      question: i18n._(`Will I really get personalized feedback?`),
      answer: i18n._(
        `Absolutely. Our AI analyzes your specific answers, CV, and target role to provide tailored feedback on structure, clarity, confidence, and impact.`
      ),
    },
    {
      question: i18n._(`How fast can I improve?`),
      answer: i18n._(
        `Most users see noticeable improvement within the first week. With consistent practice, you'll develop stronger answers and more confidence quickly.`
      ),
    },
    {
      question: i18n._(`Can I cancel anytime?`),
      answer: i18n._(
        `Yes, you can cancel your subscription at any time. No long-term commitments required.`
      ),
    },
  ];

  return (
    <Box sx={{ py: 10, bgcolor: "#1a202c" }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 6,
            color: "white",
          }}
        >
          {i18n._(`Frequently Asked Questions`)}
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            elevation={0}
            sx={{
              mb: 2,
              bgcolor: "#2d3748",
              border: "1px solid #4a5568",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{
                "& .MuiAccordionSummary-content": {
                  my: 2,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: "#cbd5e0" }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};
