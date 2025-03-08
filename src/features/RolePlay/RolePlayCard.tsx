import { Stack, Typography } from "@mui/material";
import { RolePlayInstruction } from "./types";

interface RolePlayCardProps {
  scenario: RolePlayInstruction;
  onClick: () => void;
  hardHeight: string;
}

export const RolePlayCard = ({ scenario, onClick, hardHeight }: RolePlayCardProps) => {
  return (
    <Stack
      sx={{
        position: "relative",
        backgroundColor: "#222",
        border: "none",
        alignItems: "flex-start",
        minHeight: hardHeight,

        cursor: "pointer",
        borderRadius: "5px",
        overflow: "hidden",
        textAlign: "left",
        padding: "0px",
        boxSizing: "border-box",
        color: "#fff",
        ":hover": {
          ".role-play-image": {
            opacity: 0.8,
          },
        },
      }}
      component={"button"}
      onClick={() => onClick()}
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
            sx={{
              fontWeight: "800",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.4)",
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
};
