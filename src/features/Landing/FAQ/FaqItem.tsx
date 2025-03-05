import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

export const FaqItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          component="span"
          variant="h5"
          sx={{
            padding: "10px",
            fontWeight: 600,
            fontSize: "1.4rem",
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: "10px 30px 30px 30px",
        }}
      >
        {answer}
      </AccordionDetails>
    </Accordion>
  );
};
