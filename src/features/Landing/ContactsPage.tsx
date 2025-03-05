import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Link, Stack, Typography } from "@mui/material";

import { maxContentWidth, subTitleFontStyle } from "./landingSettings";
import { Header } from "../Header/Header";
import { Footer } from "./Footer";
import { InstagramIcon, MailIcon } from "lucide-react";

export const ContactsPage = () => {
  return (
    <Stack sx={{}}>
      <Header />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />

        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            paddingTop: "100px",
            color: "#000",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,
              padding: "100px 20px 30px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <Typography
                align="left"
                variant="h2"
                component={"h1"}
                sx={{
                  fontWeight: 700,
                  "@media (max-width: 1300px)": {
                    fontSize: "4rem",
                  },
                  "@media (max-width: 900px)": {
                    fontSize: "3rem",
                  },
                  "@media (max-width: 700px)": {
                    fontSize: "2rem",
                  },
                }}
              >
                Contacts
              </Typography>
              <Typography
                align="left"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                Feel free to reach out to me with any questions or feedback. I'm always happy to
                help!
              </Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,
              padding: "0px 20px 100px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              gap={"10px"}
              sx={{
                width: "100%",
                color: "#1f74be",
              }}
            >
              <Stack gap={"10px"}>
                <Stack
                  sx={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <MailIcon />
                  <Typography>
                    <Link
                      href="mailto:dmowski.alex@gmail.com"
                      sx={{
                        color: "#1f74be",
                      }}
                    >
                      dmowski.alex@gmail.com
                    </Link>
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <InstagramIcon />
                  <Typography>
                    <Link
                      sx={{
                        color: "#1f74be",
                      }}
                      href="https://www.instagram.com/dmowskii/"
                      target="_blank"
                    >
                      dmowskii
                    </Link>
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </div>
      <Footer />
    </Stack>
  );
};
