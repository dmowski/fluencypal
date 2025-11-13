"use client";
import { useLingui } from "@lingui/react";
import { Box, Container, Typography } from "@mui/material";

export const SocialProofSection = () => {
  const { i18n } = useLingui();

  const proofs = [
    { label: i18n._(`92% reported improved performance`), icon: "📈" },
    {
      label: i18n._(`Used by candidates interviewing at top companies`),
      icon: "🏢",
    },
    { label: i18n._(`4.8★ rating`), icon: "⭐" },
  ];

  return (
    <Box sx={{ py: 4, bgcolor: "#1a202c" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {proofs.map((proof, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                maxWidth: 300,
              }}
            >
              <Typography sx={{ fontSize: "2rem" }}>{proof.icon}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "white" }}>
                {proof.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
