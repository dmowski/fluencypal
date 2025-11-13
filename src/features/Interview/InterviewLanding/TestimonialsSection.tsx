"use client";
import { useLingui } from "@lingui/react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";

export const TestimonialsSection = () => {
  const { i18n } = useLingui();

  const testimonials = [
    {
      quote: i18n._(`I finally got 3 offers after months of silence.`),
      author: "Sarah M.",
    },
    {
      quote: i18n._(
        `I was confident and clear — FluencyPal prepared me better than any coach.`
      ),
      author: "James L.",
    },
    {
      quote: i18n._(
        `It helped me answer HR and behavioral questions without panic.`
      ),
      author: "Maria K.",
    },
  ];

  return (
    <Box sx={{ py: 10, bgcolor: "#1a202c" }}>
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
          {i18n._(`Real people. Real job offers.`)}
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderLeft: "4px solid #667eea",
                  bgcolor: "#2d3748",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    mb: 2,
                    color: "#e2e8f0",
                  }}
                >
                  "{testimonial.quote}"
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#667eea" }}
                >
                  — {testimonial.author}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
