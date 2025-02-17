import { Button, ButtonGroup, Link, Stack, Typography } from "@mui/material";

interface LegalContainerProps {
  children: React.ReactNode;
  page: "privacy" | "terms";
}

export const LegalContainer = ({ children, page }: LegalContainerProps) => {
  const switcher = (
    <ButtonGroup
      sx={{
        position: "relative",
        zIndex: 9999999,
      }}
    >
      <Button variant={page === "terms" ? "contained" : "outlined"} href="/terms">
        Terms of Use
      </Button>
      <Button variant={page === "privacy" ? "contained" : "outlined"} href="/privacy">
        Privacy Policy
      </Button>
    </ButtonGroup>
  );
  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0 60px 0",
        gap: "30px",
      }}
    >
      {switcher}
      <Stack
        sx={{
          gap: "10px",
          maxWidth: "900px",
          backgroundColor: "rgba(22, 22, 23, 0.8)",
          padding: "20px 20px 40px 20px",
          border: "1px solid #000",
          borderRadius: "5px",
          width: "100%",
          position: "relative",
          zIndex: 9999999,
        }}
      >
        {children}
      </Stack>
      {switcher}
    </Stack>
  );
};
