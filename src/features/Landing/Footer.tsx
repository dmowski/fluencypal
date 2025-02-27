import { Link, Stack, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 50px 0",
        backgroundColor: "#070f1a",
        borderTop: "4px solid rgba(14, 14, 15, 1)",
        marginTop: "0px",
        position: "relative",
        zIndex: 9999,
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "0 30px",
          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",
          maxWidth: "1100px",
          position: "relative",
          zIndex: 9999,
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        <Stack
          sx={{
            gap: "10px",
          }}
        >
          <img
            src="./logo.svg"
            alt="Online English Learning"
            style={{
              height: "auto",
              width: "80px",
              opacity: 0.92,
            }}
          />
        </Stack>
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <Link href="/privacy" variant="body1">
            Privacy Policy
          </Link>
          <Link href="/terms" variant="body1">
            Terms of Service
          </Link>
        </Stack>
        <Stack
          sx={{
            alignItems: "flex-end",
            justifyContent: "center",
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <Typography variant="body1">Dark Lang</Typography>
          <Typography variant="body1">© 2025</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
