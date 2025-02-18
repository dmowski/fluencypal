import { Button, Divider, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";

export const SignInForm = () => {
  const auth = useAuth();
  return (
    <StarContainer minHeight="100vh" paddingBottom="160px">
      <Stack
        sx={{
          alignItems: "center",
        }}
      >
        <Typography variant="h2">Sign In</Typography>
      </Stack>
      <Stack
        sx={{
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => auth.signInWithGoogle()}
          startIcon={<GoogleIcon />}
        >
          Continue with google
        </Button>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Link href="/privacy">
            <Typography variant="caption">Privacy Policy</Typography>
          </Link>
          <Link href="/terms">
            <Typography variant="caption">Terms of Use</Typography>
          </Link>
        </Stack>

        <Stack
          sx={{
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <Typography variant="body2">1 hour of communication with AI teacher is free</Typography>
          <Typography variant="body2">Then pay for hours as you needed</Typography>
        </Stack>
      </Stack>
    </StarContainer>
  );
};
