import { Button, Link, Stack, Typography } from "@mui/material";
import {
  buttonStyle,
  maxLandingWidth,
  subTitleFontSize,
  subTitleFontStyle,
  titleFontStyle,
} from "./landingSettings";
import rolePlayScenarios from "../RolePlay/rolePlayData";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const RolePlayDemo = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "50px 0 120px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              ...titleFontStyle,
              color: "#000",
            }}
          >
            Role-Play Scenarios: Real-Life Conversation Practice
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              color: "#000",
              ...subTitleFontStyle,
            }}
          >
            Enhance your speaking skills with immersive, hands-on scenarios for everyday situations.
          </Typography>
        </Stack>
        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Stack
            sx={{
              gap: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              "@media (max-width: 1100px)": {
                gridTemplateColumns: "1fr 1fr",
              },
              "@media (max-width: 850px)": {
                gridTemplateColumns: "1fr",
                gap: "15px",
              },
            }}
          >
            {rolePlayScenarios
              .filter((scenario, index) => index < 3)
              .map((scenario, index) => {
                return (
                  <Stack
                    component={"a"}
                    href={`/practice?role-play=${scenario.id}`}
                    key={index}
                    sx={{
                      position: "relative",
                      backgroundColor: "rgba(0, 0, 10, 0.03)",
                      color: "#111",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      alignItems: "flex-start",
                      minHeight: "300px",
                      cursor: "pointer",
                      borderRadius: "15px",
                      overflow: "hidden",
                      textAlign: "left",
                      padding: "0px",
                      boxSizing: "border-box",
                      textDecoration: "none",
                      ":hover": {
                        opacity: 0.8,
                      },
                    }}
                  >
                    <Stack
                      className="role-play-image"
                      sx={{
                        backgroundImage: `url(${scenario.imageSrc})`,
                        width: "100%",
                        height: "200px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                      }}
                    ></Stack>
                    <Stack
                      sx={{
                        padding: "20px 20px 30px 20px",
                        boxSizing: "border-box",
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="h6"
                        component={"h3"}
                        sx={{
                          color: "#121214",
                        }}
                      >
                        {scenario.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#666",
                        }}
                      >
                        {scenario.subTitle}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
          </Stack>
          <Stack
            sx={{
              alignItems: "center",
              color: "#000",
              paddingTop: "30px",
              gap: "50px",
            }}
          >
            <Button
              size="large"
              sx={{
                ...buttonStyle,
              }}
              href="/practice"
              color="info"
              variant="contained"
            >
              Explore all scenarios
            </Button>
            <Stack
              sx={{
                alignItems: "center",
                gap: "0px",
              }}
            >
              <Typography
                variant="h6"
                component={"p"}
                sx={{
                  fontWeight: 320,
                }}
              >
                Don’t see what you’re looking for?
              </Typography>

              <Link
                sx={{
                  color: "#000",
                  textDecoration: "none",
                  padding: "10px 20px",
                }}
                href="/practice"
              >
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flexDirection: "row",
                    gap: "5px",
                  }}
                >
                  <Typography
                    sx={{
                      textDecoration: "underline",
                      textUnderlineOffset: "8px",
                      fontWeight: 500,
                    }}
                    variant="h6"
                    component={"span"}
                    className="link-text"
                  >
                    Build your own scenario
                  </Typography>
                  <ArrowForwardIcon
                    className="link-icon"
                    sx={{
                      position: "relative",
                      left: "0px",
                      fontSize: "16px",
                      transition: "left 0.3s",
                    }}
                  />
                </Stack>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
