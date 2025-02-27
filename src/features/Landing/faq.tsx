import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Galaxy from "../uiKit/Animations/Galaxy";

export const Faq = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "120px 0 140px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        //backgroundColor: `rgb(100, 100, 100)`,
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

        {/* FAQ Accordion Items */}
        <Stack
          sx={{
            flexDirection: "column",
            gap: "20px",
            alignItems: "stretch",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                What is Dark Lang?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Dark Lang is an AI-powered platform where you can practice natural conversations in
                multiple languages—like English, Spanish, or French—with a patient and knowledgeable
                virtual tutor named Bruno.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                How does usage-based pricing work?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                You start with a free balance. Each conversation (text or voice) uses tokens, which
                deduct from your balance in real time. You can top up credits whenever you need
                more.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                Is there a free trial?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes! We offer a small free balance so you can explore the platform and see if it’s
                right for you before purchasing more credits.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4-content"
              id="panel4-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                Can I practice languages other than English?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Absolutely. Bruno supports multiple languages, adapting to your choice and level.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel5-content"
              id="panel5-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                What learning modes are available?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel6-content"
              id="panel6-header"
            >
              <Typography
                component="span"
                variant="h5"
                sx={{
                  padding: "10px",
                  fontWeight: 450,
                }}
              >
                How do daily tasks help me improve?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Daily tasks provide new vocabulary and grammar rules, which are reinforced during
                your next conversation. This consistent practice accelerates your language growth.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>
    </Stack>
  );
};
