import { Stack, Typography } from "@mui/material";
import { RolePlayInstruction } from "../../RolePlay/types";

interface RolePlayCardProps {
  scenario: RolePlayInstruction;
}

export const RolePlayCard: React.FC<RolePlayCardProps> = ({ scenario }) => {
  return (
    <Stack
      component={"a"}
      href={`/scenarios/${scenario.id}`}
      sx={{
        position: "relative",
        backgroundColor: "rgba(0, 0, 10, 0.01)",
        color: "#111",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "calc(100vw - 30px)",
        alignItems: "flex-start",
        height: "370px",
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        textAlign: "left",
        padding: "0px",
        boxSizing: "border-box",
        textDecoration: "none",

        ":hover": {
          //opacity: 0.8,
          border: "1px solid rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Stack
        className="role-play-image"
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "100%",
          height: "230px",
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
};
