import { Button, Stack, Typography } from "@mui/material";
import { maxLandingWidth, subTitleFontSize } from "./landingSettings";
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
              fontWeight: 700,
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
              fontSize: subTitleFontSize,
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
              gap: "10px",
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
              //.filter((scenario) => scenario.id !== "custom" && scenario.id !== "at-the-grocery-store")
              .map((scenario, index) => {
                return (
                  <Stack
                    component={"a"}
                    href={`/practice?role-play=${scenario.id}`}
                    key={index}
                    sx={{
                      position: "relative",
                      backgroundColor: "#222",
                      border: "none",
                      alignItems: "flex-start",
                      minHeight: "300px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      overflow: "hidden",
                      textAlign: "left",
                      padding: "0px",
                      boxSizing: "border-box",
                      color: "#fff",
                      textDecoration: "none",
                      ":hover": {
                        ".role-play-image": {
                          opacity: 0.8,
                        },
                      },
                    }}
                  >
                    <Stack
                      sx={{
                        gap: "16px",
                        height: "100%",
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                        width: "100%",
                        position: "relative",
                        zIndex: 1,
                        boxSizing: "border-box",
                      }}
                    >
                      <Stack
                        sx={{
                          padding: "20px",
                          boxSizing: "border-box",
                          width: "100%",
                          paddingTop: "30px",
                          background:
                            "linear-gradient(180deg, rgba(12, 12, 14, 0) 0%,  rgba(12, 12, 14, 0.3) 100%)",
                        }}
                      >
                        <Typography
                          variant="h5"
                          component={"h3"}
                          sx={{
                            fontWeight: "990",
                            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                            textTransform: "uppercase",
                          }}
                        >
                          {scenario.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            opacity: 0.9,
                            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {scenario.subTitle}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      className="role-play-image"
                      sx={{
                        backgroundImage: `url(${scenario.imageSrc})`,
                        width: "100%",
                        height: "100%",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        //borderRadius: "10px",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                      }}
                    ></Stack>
                  </Stack>
                );
              })}
          </Stack>
          <Stack
            sx={{
              alignItems: "center",
              color: "#000",
              paddingTop: "30px",
              gap: "20px",
            }}
          >
            <Typography variant="h6" component={"p"}>
              Don’t see what you’re looking for?
            </Typography>

            <Button
              size="large"
              sx={{
                padding: "15px 30px",
              }}
              href="/practice"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Build your own scenario
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
