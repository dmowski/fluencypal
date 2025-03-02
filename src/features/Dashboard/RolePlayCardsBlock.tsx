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
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              gap: "40px",
            },
          }}
        >
          {rolePlayScenarios
            .filter((_, index) => !isLimited || index < 4)
            .map((scenario, index) => {
              return (
                <GradientCard
                  key={index}
                  padding="22px"
                  strokeWidth="2px"
                  startColor={"rgba(255, 255, 255, 0.09)"}
                  endColor={"rgba(255, 255, 255, 0.09)"}
                  backgroundColor={"rgba(10, 18, 30, 0.2)"}
                >
                  <Stack
                    sx={{
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    <Stack>
                      <Typography>{scenario.title}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        {scenario.subTitle}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          aiConversation.startConversation({
                            mode: "rolePlay",
                            rolePlayScenario: scenario,
                          });
                        }}
                      >
                        Start
                      </Button>
                    </Stack>
                  </Stack>
                </GradientCard>
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
