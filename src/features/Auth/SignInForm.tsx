import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";

export const SignInForm = () => {
  const auth = useAuth();
  return (
    <StarContainer minHeight="100vh" paddingBottom="0px">
      <Stack
        sx={{
          alignItems: "center",
        }}
      >
        <Typography variant="h3">Sign In</Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Get free lesson
        </Typography>
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
      </Stack>
    </StarContainer>
  );
};
