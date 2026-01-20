import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

export interface FaqItemInfo {
  question: string;
  answer: React.ReactNode;
}
export const FaqItem = (info: { info: FaqItemInfo }) => {
  const { question, answer } = info.info;
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
