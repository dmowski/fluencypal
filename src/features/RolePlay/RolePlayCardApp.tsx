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
        "@media (max-width: 600px)": {
          padding: "0px",
        },
      }}
      component={"button"}
      onClick={() => onClick()}
    >
      <Stack
        className="role-play-image"
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "calc(50% - 15px)",
          opacity: 1,
          height: "calc(100% - 0px)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          right: "0",
          borderRadius: "0",
          bottom: "0",
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s ease",
          zIndex: 1,
          "@media (max-width: 600px)": {
            position: "relative",
            width: "100%",
            height: "200px",

            marginBottom: "20px",
            //width: "40%",
            //height: "calc(100% - 100px)",
          },
        }}
      ></Stack>

      <Stack
        sx={{
          gap: "16px",
          height: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",

          padding: "20px",

          maxWidth: "calc(50% - 0px)",
          "@media (max-width: 600px)": {
            height: "max-content",
            maxWidth: "100%",
            width: "100%",
            padding: "0px 20px 20px 20px",

            justifyContent: "flex-start",
          },
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
            {scenario.shortTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
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
          }}
        >
          <Typography>{i18n._("Start")}</Typography>
        </Stack>
      </Stack>
      <Stack
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "100%",
          filter: "blur(70px) brightness(0.5) contrast(0.9)",
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
    </Stack>
  );
};
