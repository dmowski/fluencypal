"use client";
import { Button, Stack, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";

import { ReactNode, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";

interface PlanCardProps {
  title: string;
  subTitle: string;
  details: string;
  description: string;
  onClick: () => void;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
  progressPercent?: number;
  delayToShow: number;
  isDone: boolean;
  isActive?: boolean;
  isLast?: boolean;
}

export const PlanCard = ({
  title,
  subTitle,
  description,
  progressPercent,
  onClick,
  startColor,
  endColor,
  bgColor,
  icon,
  details,
  isDone,
  delayToShow,
  isActive,
  isLast,
}: PlanCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { i18n } = useLingui();

  return (
    <>
      {showModal && (
        <CustomModal isOpen={true} onClose={() => setShowModal(false)} padding="40px 20px">
          <Stack
            sx={{
              alignItems: "center",
              width: "100%",

              img: {
                borderRadius: "100px",
                width: "100px",
                height: "100px",
              },
            }}
          >
            {icon}
          </Stack>
          <Stack
            sx={{
              gap: "10px",
              width: "100%",
            }}
          >
            <Stack>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  color: `rgba(255, 255, 255, 0.5)`,
                }}
              >
                {subTitle}
              </Typography>
              <Typography variant="h4" align="center" component="h2" className="decor-text">
                {title}
              </Typography>
              <Typography sx={{ paddingTop: "20px" }} align="center" variant="caption">
                {description}
              </Typography>
            </Stack>

            <Button
              sx={{
                margin: "15px 0px",
              }}
              onClick={() => {
                setShowModal(false);
                onClick();
              }}
              variant="contained"
              color="info"
              size="large"
            >
              {i18n._(`Start lesson`)}
            </Button>
            <Typography
              align="center"
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Send 6 messages to complete`)}
            </Typography>
          </Stack>
        </CustomModal>
      )}

      <Stack
        onClick={() => {
          setShowModal(true);
        }}
        component={"button"}
        sx={{
          backgroundColor: isActive ? "rgba(13, 220, 196, 0.1)" : "transparent",
          textDecoration: "none",
          padding: "15px",
          display: "grid",
          gridTemplateColumns: isActive ? "max-content 1fr max-content" : "max-content 1fr",
          gap: "20px",
          borderRadius: "16px",

          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(255, 255, 255, 0.0)",
          maxWidth: "700px",
          position: "relative",

          cursor: "pointer",

          opacity: 0,
          transition: "transform 0.3s ease",
          transform: "scale(1)",
          animation: `fadeInOpacity  1.6s ease ${delayToShow}ms forwards`,

          userSelect: "text",
          color: "#fff",
        }}
      >
        <Stack
          sx={{
            padding: "5px",
            borderRadius: "100px",
            boxShadow:
              isDone || isActive
                ? "0px 0px 0 2px rgba(13, 220, 196, 0.9)"
                : "0px 0px 0 2px rgba(13, 220, 196, 0.3)",
            boxSizing: "border-box",
            width: "max-content",
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "2px",
              borderRadius: "0px",
              "--height": `49px`,
              bottom: "calc(-2px - var(--height))",
              height: "var(--height)",
              backgroundColor:
                isDone || isActive ? "rgba(13, 220, 196, 0.9)" : "rgba(13, 220, 196, 0.3)",
              position: "absolute",
              display: isLast ? "none" : "block",

              left: "calc(50% - 1px)",
              zIndex: 2,
            }}
          ></Stack>
          <Stack
            sx={{
              boxSizing: "border-box",
              padding: "10px 5px 0px 5px",
              width: "max-content",
              bottom: "0px",
              right: "0px",
              zIndex: 2,
              position: "relative",
              overflow: "hidden",

              borderRadius: "100px",

              ".avatar": {
                transition: "all 0.4s ease",
                opacity: 1,
                img: {
                  width: "50px",
                  height: "50px",
                  "@media (max-width: 450px)": {
                    width: "35px",
                    height: "35px",
                  },
                },
              },
            }}
          >
            <Stack
              sx={{
                position: "relative",
                zIndex: 2,
                top: "0px",
                left: "0px",
                opacity: isActive || isDone ? 1 : 0.3,
              }}
            >
              {icon}
            </Stack>

            <Stack
              sx={{
                backgroundColor: startColor,
                width: "320px",
                height: "120px",
                borderRadius: "40px",
                filter: "blur(50px)",

                position: "absolute",
                top: "-40px",
                left: "-20px",
                zIndex: 1,
                opacity: isActive || isDone ? 0.9 : 0.3,
              }}
            ></Stack>

            {(isActive || isDone) && (
              <>
                <Stack
                  sx={{
                    backgroundColor: endColor,
                    width: "320px",
                    height: "120px",
                    borderRadius: "40px",
                    filter: "blur(80px)",

                    position: "absolute",
                    bottom: "-40px",
                    right: "-20px",
                    zIndex: 1,
                    opacity: 0.9,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    backgroundColor: bgColor,
                    width: "100%",
                    height: "100%",

                    position: "absolute",
                    bottom: "0px",
                    left: "0px",
                    zIndex: 0,
                    opacity: 0.1,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    backgroundColor: "rgba(10, 18, 30, 1)",
                    width: "100%",
                    height: "100%",

                    position: "absolute",
                    bottom: "0px",
                    left: "0px",
                    zIndex: -1,
                    opacity: 1,
                  }}
                ></Stack>
              </>
            )}
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            maxWidth: "90%",
          }}
        >
          <Typography
            align="left"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              color: isActive || isDone ? `rgba(67, 244, 223, 0.9)` : `rgba(67, 244, 223, 0.3)`,
            }}
          >
            {subTitle}
          </Typography>

          <Typography
            align="left"
            sx={{
              fontWeight: 500,
              fontSize: "1.2rem",
              position: "relative",
              zIndex: 2,
              opacity: isActive || isDone ? 1 : 0.6,

              "@media (max-width: 450px)": {
                fontSize: "0.8rem",
              },
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Stack
          sx={{
            borderRadius: "50%",
            display: isActive ? "flex" : "none",
            background: "linear-gradient(45deg,rgb(13, 220, 196) 0%,rgba(13, 180, 236, 0.59) 100%)",
            height: "45px",
            width: "45px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChevronRight size={"25px"} />
        </Stack>
      </Stack>
    </>
  );
};
