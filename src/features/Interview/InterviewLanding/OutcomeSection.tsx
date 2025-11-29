"use client";
import { useLingui } from "@lingui/react";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";

export const OutcomeSection = () => {
  const { i18n } = useLingui();

  const outcomes = [
    {
      title: i18n._(`Strong, structured answers`),
      description: i18n._(`Stop rambling or guessing. You'll know exactly what to say.`),
      icon: "💬",
    },
    {
      title: i18n._(`Confidence & presence`),
      description: i18n._(`Perform calmly under pressure and make a strong first impression.`),
      icon: "💪",
    },
    {
      title: i18n._(`More interview invites`),
      description: i18n._(`Better preparation = better interviews = more callbacks.`),
      icon: "📧",
    },
    {
      title: i18n._(`Higher salary opportunities`),
      description: i18n._(`A strong interview performance increases negotiating power.`),
      icon: "💰",
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
          {i18n._(`What you will achieve`)}
        </Typography>

        <Grid container spacing={4}>
          {outcomes.map((outcome, index) => (
            <Grid key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "#1a202c",
                  border: "1px solid #2d3748",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(102,126,234,0.3)",
                    transform: "translateY(-4px)",
                    borderColor: "#667eea",
                  },
                }}
              >
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>{outcome.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: "white" }}>
                  {outcome.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#a0aec0" }}>
                  {outcome.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            variant="text"
            size="large"
            sx={{
              color: "#667eea",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {i18n._(`Start your Interview Test →`)}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
