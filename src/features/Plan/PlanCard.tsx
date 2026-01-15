"use client";
import { Stack, Typography } from "@mui/material";
import { Check, ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { useLingui } from "@lingui/react";

interface PlanCardProps {
  title: string;
  subTitle: string;
  details: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  delayToShow: number;
  isDone: boolean;
  isActive?: boolean;
  isLast?: boolean;
  isContinueLabel: boolean;
  viewOnly?: boolean;
  onClick?: () => void;
}

export const PlanCard = ({
  title,
  subTitle,
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
  viewOnly = false,
  onClick,
}: PlanCardProps) => {
  const { i18n } = useLingui();

  const isNextInPlan = !isActive && !isDone;

  return (
    <>
      <Stack
        onClick={() => {
          if (viewOnly) return;
          onClick?.();
        }}
        component={"button"}
        sx={{
          backgroundColor: isActive
            ? "rgba(13, 220, 196, 0.14)"
            : isDone
              ? "rgba(13, 220, 196, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          textDecoration: "none",
          padding: "9px 16px 11px 16px",
          display: "grid",

          gridTemplateColumns: "max-content 1fr max-content",
          gridTemplateRows: "auto",
          gridTemplateAreas: details
            ? `
            'icon title chevron'
            'icon details chevron'
          `
            : `
            'icon title chevron'
            'icon title chevron'
          `,
          gap: "0px 20px",
          borderRadius: "8px",

          alignItems: "center",
          justifyContent: "space-between",
          border:
            !isActive && !isDone
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.0)",
          maxWidth: "700px",
          position: "relative",

          opacity: 0,
          transition: "background 0.3s ease",
          transform: "scale(1)",
          animation: `fadeInOpacity  1.6s ease ${delayToShow}ms forwards`,

          userSelect: "text",
          color: "#fff",

          ...(viewOnly
            ? {}
            : {
                cursor: "pointer",
                ":hover": {
                  backgroundColor: isActive
                    ? "rgba(13, 220, 196, 0.2)"
                    : isDone
                      ? "rgba(13, 220, 196, 0.15)"
                      : "rgba(13, 220, 196, 0.008)",
                  "@media (max-width: 450px)": {
                    backgroundColor: "rgba(13, 220, 196, 0.1)",
                  },
                },
              }),

          "@media (max-width: 500px)": {
            gap: "13px 20px",
            padding: "16px 16px 26px 16px",
            gridTemplateAreas: isActive
              ? `
            'icon title chevron'
            ${details ? "'details details details'" : ""}
          `
              : `
            'icon title title'
            ${details ? "'details details details'" : ""}
          `,
          },
        }}
      >
        <Stack
          sx={{
            width: "2px",
            borderRadius: "0px",
            "--height": `100%`,
            top: "50%",
            left: "49px",
            height: "var(--height)",
            backgroundColor:
              isNextInPlan || isContinueLabel ? "rgba(255, 255, 255, 0)" : "rgba(13, 220, 196, 1)",
            position: "absolute",
            display: isLast ? "none" : "block",

            zIndex: 0,
            "@media (max-width: 500px)": {
              display: "none",
            },
          }}
        ></Stack>

        <Stack
          sx={{
            padding: "4px",
            borderRadius: "100px",
            gridArea: "icon",

            boxShadow: isDone
              ? "0px 0px 0 2px rgba(13, 220, 196, 1)"
              : isActive
                ? "0px 0px 0 2px rgba(13, 220, 196, 1)"
                : "0px 0px 0 1px rgba(255, 255, 255, 0.1)",
            boxSizing: "border-box",
            width: "max-content",
            position: "relative",
            backgroundColor: "#111",
          }}
        >
          {isDone && (
            <Stack
              sx={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                backgroundColor: "rgb(9, 108, 96)",
                boxShadow: "0px 0px 0 2px rgba(13, 220, 196, 1)",
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
            gridArea: "title",

            width: "100%",
            maxWidth: "90%",
          }}
        >
          <Typography
            align="left"
            sx={{
              fontWeight: 600,
              fontSize: "0.82rem",
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
              lineHeight: "1.4rem",
              position: "relative",
              zIndex: 2,
              opacity: isActive || isDone ? 1 : 0.9,
              paddingBottom: "3px",

              "@media (max-width: 450px)": {
                fontSize: "0.8rem",
              },
            }}
          >
            {title}
          </Typography>
        </Stack>

        {details && (
          <Typography
            align="left"
            sx={{
              gridArea: "details",

              fontWeight: 400,
              fontSize: "0.82rem",
              lineHeight: "1.1rem",
              zIndex: 2,
              height: isNextInPlan ? "auto" : "54px",
              paddingBottom: isNextInPlan ? "8px" : 0,
              overflow: "hidden",
              opacity: isActive || isDone ? 0.9 : 0.8,

              "@media (max-width: 500px)": {
                overflow: "hidden",
                height: "auto",
                paddingTop: "10px",
                textOverflow: "ellipsis",
              },
            }}
          >
            {details}
          </Typography>
        )}

        {isActive && (
          <Stack
            sx={{
              borderRadius: "50%",

              gridArea: "chevron",
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
        )}
      </Stack>
    </>
  );
};
