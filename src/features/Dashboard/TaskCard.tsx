import { UserTaskType } from "@/common/userTask";
import { GradientCard } from "../uiKit/Card/GradientCard";
import { Stack } from "@mui/material";
import { Badge, BadgeCheck } from "lucide-react";
import { JSX } from "react";

interface TaskCardProps {
  isDone: boolean;
  children: JSX.Element | JSX.Element[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ isDone, children }) => {
  return (
    <GradientCard
      startColor={isDone ? "#fa8500" : "rgba(255, 255, 255, 0.09)"}
      endColor={isDone ? "#05acff" : "rgba(255, 255, 255, 0.09)"}
      backgroundColor={isDone ? "rgba(10, 18, 30, 1)" : "rgba(10, 18, 30, 0.2)"}
    >
      <Stack
        sx={{
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
        >
          {isDone ? <BadgeCheck color="#fa8500" size={"20px"} /> : null}
        </Stack>
        {children}
      </Stack>
    </GradientCard>
  );
};
