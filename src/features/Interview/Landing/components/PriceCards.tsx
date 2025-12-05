import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { Button, Stack, Typography } from "@mui/material";
import { CircleCheck } from "lucide-react";
import { H2, SubTitle } from "./Typography";

export interface Price {
  id: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  badge?: string;
  badgeIcon?: string;
  label: string;
  priceUsd: number;
  priceLabel?: string;
  description: string;
  points: string[];
  buttonTitle: string;
  isHighlighted?: boolean;
}

export interface PriceCardsProps {
  title: string;
  subTitle: string;
  footerText?: string;
  prices: Price[];
  quizLink: string;
  id: string;
}

const iconConfigs = [
  {
    iconColor: "#c3a9ffff",
    bgColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  {
    iconColor: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.2)",
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  {
    iconColor: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
];

/** Interview Landing Price Cards */
export const PriceCards = ({
  title,
  subTitle,
  footerText,
  prices,
  quizLink,
  id,
}: PriceCardsProps) => {
  return (
    <Stack
      id={id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          width: "100%",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          <H2>{title}</H2>
          <SubTitle>{subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "30px",
            width: "100%",
            "@media (max-width: 1024px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {prices.map((price, index) => {
            const Icon = price.icon;
            const config = iconConfigs[index % iconConfigs.length];

            return (
              <Stack
                key={index}
                sx={{
                  padding: "40px 30px 40px 30px",
                  border: price.isHighlighted
                    ? "1px solid #29b6f6"
                    : "1px solid rgba(255, 255, 255, 0.04)",
                  gap: "24px",
                  width: "100%",
                  borderRadius: "16px",
                  boxShadow: price.isHighlighted
                    ? "0px 8px 24px rgba(59, 130, 246, 0.15)"
                    : "0px 4px 12px rgba(0, 0, 0, 0.01)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  justifyContent: "space-between",
                }}
              >
                <Stack sx={{ gap: "16px" }}>
                  <Stack sx={{ gap: "8px" }}>
                    <Typography
                      variant="h5"
                      component={"h3"}
                      sx={{
                        fontSize: "18px",
                        fontWeight: 500,
                      }}
                    >
                      {price.label}
                    </Typography>

                    <Stack direction="row" sx={{ alignItems: "baseline", gap: "8px" }}>
                      <Typography
                        variant="h3"
                        component={"span"}
                        sx={{
                          fontSize: "52px",
                          fontWeight: 500,
                        }}
                      >
                        ${price.priceUsd}
                      </Typography>
                      {price.priceLabel && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "14px",
                            opacity: 0.7,
                          }}
                        >
                          {price.priceLabel}
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "16px",
                        lineHeight: 1.6,
                        opacity: 0.9,
                        minHeight: "48px",
                      }}
                    >
                      {price.description}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack sx={{ gap: "22px" }}>
                  <Stack sx={{ gap: "12px" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        opacity: 0.9,
                        paddingTop: "10px",
                      }}
                    >
                      Includes:
                    </Typography>

                    <Stack sx={{ gap: "10px" }}>
                      {price.points.map((point, pointIndex) => (
                        <Stack
                          key={pointIndex}
                          direction="row"
                          sx={{
                            gap: "10px",
                            alignItems: "flex-start",
                          }}
                        >
                          <CircleCheck
                            size={22}
                            color={price.isHighlighted ? "#29b6f6" : "#fff"}
                            strokeWidth={2}
                            style={{ flexShrink: 0, marginTop: "2px" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              lineHeight: 1.5,
                              opacity: 0.9,
                            }}
                          >
                            {point}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>

                  <Button
                    href={quizLink}
                    variant={price.isHighlighted ? "contained" : "outlined"}
                    color={price.isHighlighted ? "info" : "inherit"}
                    size="large"
                    sx={{
                      marginTop: "8px",
                      borderRadius: "48px",
                      fontSize: "16px",
                      fontWeight: 600,
                      textTransform: "none",
                      padding: "12px 24px",
                      //backgroundColor: price.isHighlighted ? "#266ddfff" : "transparent",
                      //borderColor: price.isHighlighted ? "#266ddfff" : "rgba(255, 255, 255, 0.2)",
                      //color: "#fff",
                      "&:hover": {
                        //backgroundColor: price.isHighlighted
                        //</Stack>  ? "#1150d7ff"
                        //                          : "rgba(255, 255, 255, 0.05)",
                        //                      borderColor: price.isHighlighted ? "#2563eb" : "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    {price.buttonTitle}
                  </Button>
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        {footerText && (
          <Typography
            variant="body2"
            align="center"
            sx={{
              marginTop: "32px",
              opacity: 0.6,
              fontSize: "14px",
            }}
          >
            {footerText}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
