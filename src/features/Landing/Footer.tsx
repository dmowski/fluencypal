import { Link, Stack, Typography } from "@mui/material";
import { maxLandingWidth } from "./landingSettings";

export const Footer = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 50px 0",
        //backgroundColor: "#070f1a",
        backgroundColor: `#0a121e`,
        //backgroundColor: `rgba(10, 18, 30, 1)`,
        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
        marginTop: "0px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          padding: "0 10px",

          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",
          maxWidth: maxLandingWidth,
          position: "relative",
          zIndex: 9999,
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
            gap: "70px",
          },
        }}
      >
        <Stack
          sx={{
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "10px",
            a: {
              fontWeight: 500,
              color: "#fff",
              textUnderlineOffset: "3px",
              textDecorationColor: "#fff",
            },
          }}
        >
          <Link href="/scenarios" variant="body1">
            Role-Play
          </Link>
          <Link href="/contacts" variant="body1">
            Contacts
          </Link>
          <Link href="/pricing" variant="body1">
            Pricing
          </Link>
        </Stack>

        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <img
            src="./logo.svg"
            alt="Online English Learning"
            width="80px"
            height="37px"
            style={{
              opacity: 0.92,
            }}
          />
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
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Link
              href="/terms"
              variant="body1"
              sx={{
                color: "#fff",
              }}
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              variant="body1"
              sx={{
                color: "#fff",
              }}
            >
              Privacy Policy
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
