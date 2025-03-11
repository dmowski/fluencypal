import { Header } from "@/features/Header/Header";
import { maxLandingWidth } from "@/features/Landing/landingSettings";
import { Link, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <div>
      <Header mode="landing" lang="en" />
      <Stack
        sx={{
          alignItems: "center",
          paddingTop: "120px",
        }}
      >
        <Stack
          sx={{
            maxWidth: maxLandingWidth,
            width: "100%",
          }}
        >
          <Typography variant="h1">Not Found</Typography>
          <p>Could not find requested resource</p>
          <Link href="/">Return Home</Link>
        </Stack>
      </Stack>
    </div>
  );
}
