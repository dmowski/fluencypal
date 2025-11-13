"use client";
import { useLingui } from "@lingui/react";
import { Box, Container, Grid, Typography } from "@mui/material";

export const HowItWorksSection = () => {
  const { i18n } = useLingui();

  const steps = [
    {
      number: "1",
      title: i18n._(`Real interview simulation`),
      description: i18n._(
        `Practice in real interview conditions — no tutors needed.`
      ),
    },
    {
      number: "2",
      title: i18n._(`AI feedback that matters`),
      description: i18n._(
        `Improve your impact, structure, clarity, and delivery.`
      ),
    },
    {
      number: "3",
      title: i18n._(`Personalized answer scripts`),
      description: i18n._(
        `Based on your CV, experience, and target role.`
      ),
    },
  ];

  return (
    <Box sx={{ py: 10, bgcolor: "#0f1419" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 6,
            color: "white",
          }}
        >
          {i18n._(`Why candidates improve so quickly`)}
        </Typography>

        <Grid container spacing={5}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "#667eea",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 700,
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {step.number}
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 2, color: "white" }}
                >
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#a0aec0" }}>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
