"use client";
import { useLingui } from "@lingui/react";
import { Box, Button, Container, Typography } from "@mui/material";

export const FinalCTASection = () => {
  const { i18n } = useLingui();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        color: "white",
        py: 10,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: "white",
            }}
          >
            {i18n._(
              `Ready to perform better and get more job offers?`
            )}
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#667eea",
              color: "white",
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#5568d3",
              },
            }}
          >
            {i18n._(`Start Your Interview Test →`)}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
