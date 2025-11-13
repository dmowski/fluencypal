"use client";
import { useLingui } from "@lingui/react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

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
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 3,
            color: "white",
          }}
        >
          {i18n._(`Take the Interview Readiness Test`)}
        </Typography>

        <Typography
          variant="h6"
          sx={{ textAlign: "center", mb: 4, color: "#cbd5e0" }}
        >
          {i18n._(`In 2 minutes, you'll get:`)}
        </Typography>

        <Box sx={{ mb: 4 }}>
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

        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            bgcolor: "#2d3748",
            border: "1px solid #4a5568",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "white" }}>
            {i18n._(`Your Interview Score`)}
          </Typography>
          <Box
            sx={{
              filter: "blur(8px)",
              opacity: 0.5,
              userSelect: "none",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, color: "#e2e8f0" }}>
              {i18n._(`Top weaknesses:`)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
              • {i18n._(`Structure and clarity`)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
              • {i18n._(`Answer depth`)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
              • {i18n._(`Confidence delivery`)}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
