import { Button, Stack, Typography } from "@mui/material";

export const Price = () => {
  const startColor = "#fa8500";
  const endColor = "#05acff";
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",

        marginTop: "30px",
        position: "relative",
        zIndex: 1,
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <Stack
        sx={{
          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "550px",
          borderRadius: "18px",
          position: "relative",
          zIndex: 9999,
          backgroundColor: "rgba(7, 15, 26, 0.9)",
          padding: "50px 30px 90px 30px",
          borderTop: "1px solid rgba(0, 0, 0, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "18px",
            padding: "7px",
            background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            zIndex: -1,
          },
        }}
      >
        <Typography variant="h2" align="center">
          Price
        </Typography>
        <Stack>
          <Typography align="center">Pay as you go</Typography>
          <Typography align="center" variant="body2">
            First lesson is free, then you can buy as many hours as want
          </Typography>
        </Stack>

        <Stack>
          <Typography align="center" variant="h4">
            $5
          </Typography>
          <Typography align="center" variant="caption">
            For an hour lesson
          </Typography>
        </Stack>

        <Stack>
          <Button variant="contained" size="large" href="/practice">
            Start for free
          </Button>
          <Typography
            align="center"
            variant="caption"
            sx={{
              opacity: 0.9,
            }}
          >
            No card required
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
