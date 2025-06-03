"use client";
import { Button, Stack, Typography } from "@mui/material";
import { Check, ChevronRight } from "lucide-react";

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
  isContinueLabel: boolean;
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
  isContinueLabel,
}: PlanCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { i18n } = useLingui();

  return (
    <>
      {showModal && (
        <CustomModal
          isOpen={true}
          onClose={() => setShowModal(false)}
          padding="40px 20px"
          width="min(400px, 100vw)"
        >
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
              alignItems: "center",
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
                width: "100%",
                padding: "10px 20px",
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
          backgroundColor: isActive ? "rgba(13, 220, 196, 0.1)" : "rgba(13, 220, 196, 0.06)",
          textDecoration: "none",
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns:
            isActive || isDone ? "max-content 1fr max-content" : "max-content 1fr",
          gap: "20px",
          borderRadius: "16px",

          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(255, 255, 255, 0.0)",
          maxWidth: "700px",
          position: "relative",

          cursor: "pointer",

          opacity: 0,
          transition: "background 0.3s ease",
          transform: "scale(1)",
          animation: `fadeInOpacity  1.6s ease ${delayToShow}ms forwards`,

          userSelect: "text",
          color: "#fff",
          ":hover": {
            backgroundColor: isActive ? "rgba(13, 220, 196, 0.2)" : "rgba(13, 220, 196, 0.15)",
            "@media (max-width: 450px)": {
              backgroundColor: isActive ? "rgba(13, 220, 196, 0.1)" : "rgba(13, 220, 196, 0.02)",
            },
          },
        }}
      >
        <Stack
          sx={{
            padding: "5px",
            borderRadius: "100px",
            boxShadow:
              isDone || isActive
                ? "0px 0px 0 2px rgba(13, 220, 196, 0.9)"
                : "0px 0px 0 2px rgba(13, 220, 196, 0.7)",
            boxSizing: "border-box",
            width: "max-content",
            position: "relative",
          }}
        >
          {isDone && (
            <Stack
              sx={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                backgroundColor: "rgb(9, 108, 96)",
                boxShadow: "0px 0px 0 2px rgba(13, 220, 196, 0.9)",
                width: "20px",
                height: "20px",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 20000,
              }}
            >
              <Check size={"12px"} strokeWidth={"3px"} />
            </Stack>
          )}
          {isContinueLabel && (
            <Stack
              sx={{
                position: "absolute",
                top: "-20px",
                left: "0",
                right: "0",
                margin: "auto",

                //boxShadow: "0px 0px 0 2px rgba(13, 220, 196, 0.9)",
                width: "100%",

                boxSizing: "border-box",
                padding: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 20000,
              }}
            >
              <Typography
                sx={{
                  backgroundColor: "rgb(9, 108, 96)",
                  padding: "2px 5px",
                  borderRadius: "5px",
                }}
                variant="caption"
              >
                {i18n._("Continue")}
              </Typography>
              <Stack
                sx={{
                  position: "absolute",
                  bottom: "-4px",
                  margin: "auto",
                  left: "0px",
                  right: "0px",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "rgb(9, 108, 96)",
                  borderRadius: "1px",
                  transform: "rotate(45deg)",
                  zIndex: -2,
                }}
              ></Stack>
            </Stack>
          )}
          <Stack
            sx={{
              width: "2px",
              borderRadius: "0px",
              "--height": `72px`,
              bottom: "calc(-2px - var(--height))",
              height: "var(--height)",
              backgroundColor:
                isDone || isActive ? "rgba(13, 220, 196, 0.9)" : "rgba(13, 220, 196, 0.6)",
              position: "absolute",
              display: isLast ? "none" : "block",

              left: "calc(50% - 1px)",
              zIndex: 2,
              "@media (max-width: 500px)": {
                display: "none",
              },
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
                opacity: isActive || isDone ? 1 : 0.95,
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
                opacity: isActive || isDone ? 0.9 : 0.8,
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
              color: isActive || isDone ? `rgba(67, 244, 223, 0.9)` : `rgba(67, 244, 223, 0.5)`,
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
              opacity: isActive || isDone ? 1 : 0.9,

              "@media (max-width: 450px)": {
                fontSize: "0.8rem",
              },
            }}
          >
            {title}
          </Typography>

          <Typography
            align="left"
            sx={{
              fontWeight: 400,
              fontSize: "0.8rem",
              zIndex: 2,
              height: "52px",
              opacity: isActive || isDone ? 0.9 : 0.7,

              "@media (max-width: 500px)": {
                fontSize: "0.7rem",
                overflow: "hidden",
                height: "auto",
                paddingTop: "10px",
                textOverflow: "ellipsis",
              },
            }}
          >
            {details}
          </Typography>
        </Stack>

        <Stack
          sx={{
            borderRadius: "50%",
            display: isActive ? "flex" : "none",
            background: isActive
              ? "linear-gradient(45deg,rgb(13, 220, 196) 0%,rgba(13, 180, 236, 0.59) 100%)"
              : "",
            height: "45px",
            width: "45px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isActive ? <ChevronRight size={"25px"} /> : <Check />}
        </Stack>
      </Stack>
    </>
  );
};
