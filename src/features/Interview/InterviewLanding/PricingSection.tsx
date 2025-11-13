"use client";
import { useLingui } from "@lingui/react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

export const PricingSection = () => {
  const { i18n } = useLingui();

  const plans = [
    {
      name: i18n._(`1-Week Sprint`),
      price: "$30",
      label: i18n._(`⚡ In a hurry? Perfect for last-minute interviews`),
      description: i18n._(
        `Get fast, intensive preparation. Fix your top weaknesses in just 7 days.`
      ),
      features: [
        i18n._(`7 days full access`),
        i18n._(`Daily AI mock interviews`),
        i18n._(`Instant feedback on answers`),
        i18n._(`Personalized scripts for HR & behavioral questions`),
      ],
      color: "#9333ea",
      recommended: false,
    },
    {
      name: i18n._(`Monthly Plan`),
      price: "$60",
      label: i18n._(`⭐ Best for most job seekers`),
      priceAnchor: i18n._(`Only $2/day`),
      description: i18n._(
        `Consistent improvement with structured interview coaching and personalized practice.`
      ),
      features: [
        i18n._(`Full access to all simulations`),
        i18n._(`Unlimited answer reviews`),
        i18n._(`CV-based answer optimization`),
        i18n._(`Confidence score tracking`),
        i18n._(`Salary negotiation preparation`),
      ],
      color: "#f59e0b",
      recommended: true,
    },
    {
      name: i18n._(`4-Month Plan`),
      price: "$90",
      label: i18n._(`💼 For long job searches & career growth`),
      description: i18n._(
        `For people preparing for multiple roles, relocating, switching careers, or targeting senior jobs.`
      ),
      features: [
        i18n._(`4 months full access`),
        i18n._(`Long-term interview strategy`),
        i18n._(`Deep skill development`),
        i18n._(`Role-specific answer templates`),
        i18n._(`Priority feedback queue`),
      ],
      color: "#10b981",
      recommended: false,
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
            mb: 2,
            color: "white",
          }}
        >
          {i18n._(`Choose your plan`)}
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={plan.recommended ? 8 : 2}
                sx={{
                  p: 4,
                  height: "100%",
                  bgcolor: "#1a202c",
                  border: plan.recommended
                    ? `2px solid ${plan.color}`
                    : "1px solid #2d3748",
                  borderRadius: 2,
                  position: "relative",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                }}
              >
                {plan.recommended && (
                  <Chip
                    label={i18n._(`Recommended`)}
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      bgcolor: plan.color,
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                )}

                <Typography
                  variant="body2"
                  sx={{
                    color: plan.color,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {plan.label}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 1, color: "white" }}
                >
                  {plan.name}
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, mb: 1, color: plan.color }}
                >
                  {plan.price}
                </Typography>

                {plan.priceAnchor && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#a0aec0", mb: 2, fontStyle: "italic" }}
                  >
                    {plan.priceAnchor}
                  </Typography>
                )}

                <Typography variant="body2" sx={{ mb: 3, color: "#cbd5e0" }}>
                  {plan.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {plan.features.map((feature, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                    >
                      <Typography sx={{ mr: 1, color: plan.color }}>
                        ✓
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#e2e8f0" }}>{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    bgcolor: plan.color,
                    color: "white",
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: plan.color,
                      opacity: 0.9,
                    },
                  }}
                >
                  {i18n._(`Start ${plan.name} — ${plan.price}`)}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
