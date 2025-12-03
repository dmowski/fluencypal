import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { Button, Stack, Typography } from "@mui/material";

export interface InfoCard {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

export interface InfoCardsProps {
  title: string;
  subtitle: string;
  buttonTitle: string;
  buttonHref: string;
  cards: InfoCard[];
}

interface IconColor {
  iconColor: string;
  bgColor: string;
  borderColor?: string;
}

const iconColors: IconColor[] = [
  {
    iconColor: "#1d88f3ff",
    bgColor: "rgba(25, 118, 210, 0.3)",
    borderColor: "rgba(25, 118, 210, 0.5)",
  },
  {
    iconColor: "#c020dcff",
    bgColor: "rgba(156, 39, 176, 0.3)",
    borderColor: "rgba(156, 39, 176, 0.5)",
  },
  {
    iconColor: "#ff9800",
    bgColor: "rgba(255, 152, 0, 0.3)",
    borderColor: "rgba(255, 152, 0, 0.5)",
  },
  {
    iconColor: "#4caf50",
    bgColor: "rgba(76, 175, 80, 0.3)",
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
];

/** Interview Landing Info Cards */
export const InfoCards = (props: InfoCardsProps) => {
  return (
    <Stack
      sx={{
        padding: "200px 0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1400px",
          width: "100%",
          gap: "15px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 400,
              fontSize: "36px",
            }}
          >
            {props.title}
          </Typography>

          <Typography variant="body1" align="center" sx={{ opacity: 0.8 }}>
            {props.subtitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: `1fr 1fr 1fr 1fr`,
            gap: "30px",
            paddingTop: "30px",
            width: "100%",
          }}
        >
          {props.cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Stack
                key={index}
                sx={{
                  padding: "40px 30px 40px 30px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  gap: "30px",
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.01)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",

                  justifyContent: "space-between",
                }}
              >
                <Stack
                  sx={{
                    gap: "5px",
                  }}
                >
                  <Stack
                    sx={{
                      borderRadius: "9px",
                      backgroundColor: iconColors[index].bgColor,
                      width: "54px",
                      height: "54px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${iconColors[index].borderColor ?? "transparent"}`,
                      boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <Icon size={24} color={iconColors[index].iconColor} />
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{
                      marginTop: "12px",
                      marginBottom: "8px",
                      fontSize: "18px",
                      fontWeight: 400,
                    }}
                  >
                    {card.title}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#fff", opacity: 0.7 }}>
                  {card.description}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Button
          href={props.buttonHref}
          variant="contained"
          size="large"
          color="info"
          sx={{
            marginTop: "32px",
            borderRadius: "48px",
            fontSize: "16px",
          }}
        >
          {props.buttonTitle}
        </Button>
      </Stack>
    </Stack>
  );
};
