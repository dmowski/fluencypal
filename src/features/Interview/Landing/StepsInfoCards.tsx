import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { Stack, Typography } from "@mui/material";

export interface StepInfoCard {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  title: string;
  description: string;
}

export interface InfoCardsProps {
  title: string;
  subtitle: string;
  cards: StepInfoCard[];
}

interface IconColor {
  iconColor: string;
  bgColor: string;
  borderColor?: string;
}

const iconColors: IconColor[] = [
  {
    iconColor: "#fff",
    bgColor: "rgba(29, 136, 243, 1)",
    borderColor: "rgba(25, 118, 210, 0.5)",
  },
  {
    iconColor: "#fff",
    bgColor: "#4caf50",
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
  {
    iconColor: "#fff",
    bgColor: "#c020dcff",
    borderColor: "rgba(156, 39, 176, 0.5)",
  },
  {
    iconColor: "#fff",
    bgColor: "#ff9800",
    borderColor: "rgba(255, 152, 0, 0.5)",
  },
];

/** Interview Landing Step Info Cards */
export const StepInfoCards = (props: InfoCardsProps) => {
  return (
    <Stack
      sx={{
        padding: "0",
        alignItems: "center",
        "@media (max-width: 600px)": {
          paddingTop: "100px",
        },
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1200px",
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
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              fontSize: "86px",
            }}
          >
            {props.title}
          </Typography>

          <Typography variant="body1" align="center" sx={{ opacity: 0.8, fontSize: "20px" }}>
            {props.subtitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${props.cards.length}, 1fr)`,
            gap: "40px",
            paddingTop: "50px",
            width: "100%",
          }}
        >
          {props.cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Stack
                key={index}
                sx={{
                  padding: "30px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  gap: "10px",
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
                    <Icon size={32} color={iconColors[index].iconColor} />
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{
                      marginTop: "12px",
                      opacity: 0.7,
                    }}
                  >
                    {card.label}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      marginBottom: "8px",
                      fontSize: "20px",
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
      </Stack>
    </Stack>
  );
};
