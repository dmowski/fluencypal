import { Stack, Typography } from "@mui/material";
import { RolePlayInstruction } from "./types";
import { useLingui } from "@lingui/react";

interface RolePlayCardProps {
  scenario: RolePlayInstruction;
  onClick: () => void;
}

export const RolePlayCardApp = ({ scenario, onClick }: RolePlayCardProps) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        position: "relative",
        backgroundColor: "#222",
        border: "none",
        alignItems: "flex-start",

        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        textAlign: "left",
        padding: "20px 20px 20px 20px",
        boxSizing: "border-box",
        color: "#fff",
        transition: "transform 0.3s ease",
        ":hover": {
          transform: "scale(1.02)",
          ".role-play-image": {
            transform: "scale(1.02)",
            //height: "calc(100% - 80px)",
          },
          ".role-play-button": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
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
          justifyContent: "flex-start",
          width: "100%",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        <Stack
          sx={{
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack gap="3px">
            <Typography
              sx={{
                fontWeight: 300,
                opacity: 0.8,
                textTransform: "uppercase",
              }}
            >
              {scenario.category.categoryTitle}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                opacity: 0.9,
                textTransform: "uppercase",
                fontSize: "1.2rem",
              }}
            >
              {scenario.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                maxWidth: "40%",
                padding: "0px 0 30px 0",
              }}
            >
              {scenario.subTitle}
            </Typography>
          </Stack>

          <Stack
            className="role-play-button"
            sx={{
              padding: "10px 34px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              width: "fit-content",
              marginTop: "10px",
            }}
          >
            <Typography>{i18n._("Start")}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "100%",
          filter: "blur(40px) brightness(0.7) contrast(0.9)",
          transform: "scale(1.2) ",
          opacity: 0.7,
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

      <Stack
        className="role-play-image"
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "40%",
          opacity: 0.8,
          height: "calc(100% - 90px)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          //borderRadius: "10px",
          position: "absolute",
          right: "30px",
          borderRadius: "16px 16px 0 0",
          bottom: 0,
          zIndex: 0,
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s ease",
          "@media (max-width: 600px)": {
            width: "40%",
            height: "calc(100% - 100px)",
          },
        }}
      ></Stack>
    </Stack>
  );
};
