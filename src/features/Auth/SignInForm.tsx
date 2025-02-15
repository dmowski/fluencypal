import { Button, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";

export const SignInForm = () => {
  const auth = useAuth();
  return (
    <StarContainer>
      <Typography variant="h5">Sign In</Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => auth.signInWithGoogle()}
        startIcon={<GoogleIcon />}
      >
        Continue with google
      </Button>
    </StarContainer>
  );
};
