import { Button, Stack, Typography } from "@mui/material";
import { H2, SubTitle } from "./Typography";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export interface InfoCard {
  iconName?: IconName;
  imageUrl?: string;
  title: string;
  description: string;
}

export interface InfoCardsProps {
  title: string;
  subTitle: string;
  buttonTitle?: string;
  buttonHref?: string;
  cards: InfoCard[];
  id: string;
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
      id={props.id}
      sx={{
        padding: "150px 0",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",

        alignItems: "center",
        "@media (max-width: 600px)": {
          padding: "90px 0 50px 0",
        },
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
          }}
        >
          <H2>{props.title}</H2>
          <SubTitle>{props.subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${props.cards.length}, 1fr)`,
            gap: "30px",
            paddingTop: "50px",
            width: "100%",
            "@media (max-width: 1000px)": {
              gridTemplateColumns: "1fr 1fr",
              paddingTop: "20px",
            },

            "@media (max-width: 700px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {props.cards.map((card, index) => {
            return (
              <Stack
                key={index}
                sx={{
                  //padding: "40px 30px 40px 30px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  gap: "15px",
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.01)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  "@media (max-width: 600px)": {
                    gap: "5px",
                  },
                }}
              >
                <Stack
                  sx={{
                    gap: "5px",
                  }}
                >
                  {card.imageUrl && (
                    <Stack
                      sx={{
                        width: "100%",
                        borderTopLeftRadius: "11px",
                        borderTopRightRadius: "11px",
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        component="img"
                        src={card.imageUrl}
                        sx={{
                          width: "100%",
                          objectFit: "cover",
                          maxHeight: "270px",
                          transition: "transform 0.3s ease-in-out",
                          transform: "scale(1.3)",
                          ":hover": {
                            transform: "scale(1)",
                          },
                        }}
                      />
                    </Stack>
                  )}
                  {card.iconName && (
                    <Stack
                      sx={{
                        borderRadius: "9px",
                        backgroundColor: iconColors[index].bgColor,
                        width: "54px",
                        height: "54px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "40px 30px 0px 30px",
                        border: `1px solid ${iconColors[index].borderColor ?? "transparent"}`,
                        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <DynamicIcon
                        name={card.iconName}
                        size={24}
                        color={iconColors[index].iconColor}
                      />
                    </Stack>
                  )}

                  <Typography
                    variant="body1"
                    component={"h3"}
                    sx={{
                      marginTop: "12px",
                      fontSize: "20px",
                      fontWeight: 400,
                      padding: "0 30px",
                      "@media (max-width: 600px)": {
                        padding: "0 10px",
                      },
                    }}
                  >
                    {card.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#fff",
                    opacity: 0.7,
                    padding: "0 30px 40px 30px",
                    "@media (max-width: 600px)": {
                      padding: "0 10px 30px 10px",
                    },
                  }}
                >
                  {card.description}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        {props.buttonTitle && props.buttonHref && (
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
        )}
      </Stack>
    </Stack>
  );
};
