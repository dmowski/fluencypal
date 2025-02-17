import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";

export const SignInForm = () => {
  const auth = useAuth();
  return (
    <StarContainer>
      <Typography variant="h5">Sign In</Typography>
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
      </Stack>
    </StarContainer>
  );
};
