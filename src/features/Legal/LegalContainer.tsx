import { Button, ButtonGroup, Link, Stack, Typography } from "@mui/material";

interface LegalContainerProps {
  children: React.ReactNode;
  page: "privacy" | "terms";
}

export const LegalContainer = ({ children, page }: LegalContainerProps) => {
  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "80px",
        gap: "30px",
      }}
    >
      <ButtonGroup>
        <Button variant={page === "terms" ? "contained" : "outlined"} href="/terms">
          Terms of Use
        </Button>
        <Button variant={page === "privacy" ? "contained" : "outlined"} href="/privacy">
          Privacy Policy
        </Button>
      </ButtonGroup>
      <Stack
        sx={{
          gap: "10px",
          maxWidth: "900px",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          padding: "20px",
          border: "1px solid #000",
          borderRadius: "5px",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "center",
            width: "100%",
            gap: "20px",
          }}
        ></Stack>
        {children}
      </Stack>
    </Stack>
  );
};
