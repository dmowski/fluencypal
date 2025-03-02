import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Baby, Mic, TrendingUp } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import rolePlayScenarios from "../Conversation/rolePlay";
import { GradientCard } from "../uiKit/Card/GradientCard";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export const RolePlayCardsBlock = () => {
  const aiConversation = useAiConversation();
  const [isLimited, setIsLimited] = useState(true);
  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          Role Play
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Play a role and talk to the AI
        </Typography>
      </Stack>
      <Stack gap={"10px"}>
        <Stack
          sx={{
            gap: "3px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr ",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              gap: "15px",
            },
          }}
        >
          {rolePlayScenarios
            .filter((_, index) => !isLimited || index < 4)
            .map((scenario, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    position: "relative",
                    backgroundColor: "#222",
                    border: "none",
                    alignItems: "flex-start",
                    minHeight: "360px",

                    cursor: "pointer",
                    borderRadius: "0px",
                    overflow: "hidden",
                    textAlign: "left",
                    padding: "0px",
                    boxSizing: "border-box",
                    color: "#fff",
                    boxShadow: "0px 0px 0 1px rgba(0, 0, 0, 1)",
                    ":hover": {
                      ".role-play-image": {
                        opacity: 0.8,
                      },
                    },
                  }}
                  component={"button"}
                  onClick={() => {
                    aiConversation.startConversation({
                      mode: "rolePlay",
                      rolePlayScenario: scenario,
                    });
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
                        variant="h6"
                        sx={{
                          fontWeight: "500",
                          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.7)",
                        }}
                      >
                        {scenario.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          textShadow: "1px 1px 4px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        {scenario.subTitle}
                      </Typography>
                    </Stack>
                  </Stack>
                  {scenario.imageSrc && (
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
                  )}
                </Stack>
              );
            })}
        </Stack>
        <Button
          startIcon={isLimited ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          onClick={() => setIsLimited(!isLimited)}
        >
          {isLimited ? "Show more" : "Show less"}
        </Button>
      </Stack>
    </DashboardCard>
  );
};
