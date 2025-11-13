"use client";
import { useLingui } from "@lingui/react";
import { Box, Button, Container, Typography } from "@mui/material";

export const HeroSection = () => {
  const { i18n } = useLingui();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        color: "white",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              mb: 3,
              color: "white",
            }}
          >
            {i18n._(`Get more job offers with interview answers that stand out.`)}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              mb: 5,
              color: "#e2e8f0",
              fontWeight: 400,
            }}
          >
            {i18n._(
              `AI-powered interview simulation that analyzes your answers, fixes your weaknesses, and helps you perform like a top candidate.`
            )}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#667eea",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#5568d3",
                },
              }}
            >
              {i18n._(`👉 Start Your Interview Test (2 min)`)}
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {i18n._(`See how it works`)}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 6,
              p: 3,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
              {i18n._(`Your Interview Score: 68%`)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e0", mt: 1 }}>
              {i18n._(`Confidence, Structure, Clarity`)}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
