"use client";
import { useLingui } from "@lingui/react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

export const ReadinessTestSection = () => {
  const { i18n } = useLingui();

  const benefits = [
    i18n._(`Interview Score (confidence, structure, presence)`),
    i18n._(`Your top weaknesses`),
    i18n._(`Personalized interview answers`),
    i18n._(`A plan tailored to your role & experience`),
  ];

  return (
    <Box sx={{ py: 10, bgcolor: "#1a202c" }}>
      <Container maxWidth="md">
        <Stack>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "white",
            }}
          >
            {i18n._(`Take the Interview Readiness Test`)}
          </Typography>

          <Typography variant="h6" sx={{ textAlign: "center", mb: 4, color: "#cbd5e0" }}>
            {i18n._(`In 2 minutes, you'll get:`)}
          </Typography>
        </Stack>

        <Box sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: "#667eea",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "white" }}>
                {benefit}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#667eea",
              color: "white",
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#5568d3",
              },
            }}
          >
            {i18n._(`Start the test`)}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
