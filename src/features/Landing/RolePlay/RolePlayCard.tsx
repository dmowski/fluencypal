import { Stack, Typography } from "@mui/material";
import { RolePlayInstruction } from "../../RolePlay/types";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface RolePlayCardProps {
  scenario: RolePlayInstruction;
  variant?: "default" | "highlight";
  height?: string;
}

export const RolePlayCard: React.FC<RolePlayCardProps> = ({ scenario, height, variant }) => {
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
        height: height || "370px",
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        textAlign: "left",
        padding: "0px",
        boxSizing: "border-box",
        textDecoration: "none",
        ".role-play-image video": {
          opacity: 0,
        },

        ":hover": {
          //opacity: 0.8,
          border: "1px solid rgba(0, 0, 0, 0.3)",
          ".role-play-image": {
            backgroundImage:
              variant === "highlight" && scenario.videoSrc ? "" : `url(${scenario.imageSrc})`,

            video: {
              opacity: 1,
            },
          },
        },
      }}
    >
      <Stack
        className="role-play-image"
        sx={{
          backgroundImage: `url(${scenario.imageSrc})`,
          width: "100%",
          height: "230px",
          minHeight: "230px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        {variant === "highlight" && scenario.videoSrc && (
          <video
            src={scenario.videoSrc}
            loop
            autoPlay
            muted={true}
            playsInline
            style={{
              width: "100%",
              backgroundColor: "rgba(10, 18, 30, 1)",
              height: "230px",
              objectFit: "cover",
            }}
          />
        )}
      </Stack>

      <Stack
        sx={{
          padding: "20px 20px 30px 20px",
          boxSizing: "border-box",
          width: "100%",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Stack>
          {variant === "highlight" && (
            <Typography
              variant="body2"
              sx={{
                color: "#777",
                textTransform: "uppercase",
                paddingBottom: "10px",
              }}
            >
              {scenario.category}
            </Typography>
          )}
          <Typography
            variant={variant === "highlight" ? "h5" : "h6"}
            component={"h3"}
            sx={{
              fontWeight: 600,
              color: "#121214",
            }}
          >
            {scenario.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              paddingTop: variant === "highlight" ? "10px" : "0px",
              fontSize: variant === "highlight" ? "1.1rem" : "1rem",
            }}
          >
            {variant === "highlight" ? scenario.landingHighlight : scenario.subTitle}
          </Typography>
        </Stack>
        {variant === "highlight" && (
          <>
            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "row",
                gap: "10px",
                padding: "40px 0 10px 0",
              }}
            >
              <Typography
                sx={{
                  textDecoration: "underline",
                  textUnderlineOffset: "8px",
                  fontWeight: 550,
                }}
                className="link-text"
              >
                Try {scenario.title}
              </Typography>
              <ArrowForwardIcon
                className="link-icon"
                sx={{
                  position: "relative",
                  left: "0px",
                  fontSize: "20px",
                  transition: "left 0.3s",
                }}
              />
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
};
