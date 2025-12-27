import { Button, Stack } from "@mui/material";
import { Theme, themeMap } from "../Case/Landing/components/theme";
import { H2, PageLabel, SubTitle } from "../Case/Landing/components/Typography";
import { MoveRight } from "lucide-react";
import { QuizAnimation } from "../uiKit/Animations/QuizAnimation";

export interface CardData {
  videoUrl?: string;
  imageUrl?: string;
  quizAnimation?: string;

  bgColor: string;

  title: string;
  titleColor: string;
  titleBgColor: string;

  subTitle: string;
  subTitleColor: string;

  footerButton?: React.ReactNode;
}

export interface HowItWorksProps {
  label: string;
  title: string;
  subTitle: string;

  buttonTitle: string;
  buttonHref: string;

  theme: Theme;
  id: string;

  cards: CardData[];
}

export const HowItWorks = (props: HowItWorksProps) => {
  const colors = themeMap[props.theme];

  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        backgroundColor: colors.sectionBgColor,
        color: colors.textColor,
        alignItems: "center",
        width: "100%",
        gap: "90px",
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
            padding: "0 12px 0 10px",
            "*": {
              textAlign: "center",
            },
          }}
        >
          <PageLabel>{props.label}</PageLabel>
          <H2>{props.title}</H2>
          <SubTitle>{props.subTitle}</SubTitle>
        </Stack>
      </Stack>

      <Stack sx={{ gap: "100px", "@media (max-width: 900px)": { gap: "20px", padding: "0 15px" } }}>
        {props.cards.map((card, index) => {
          return (
            <Stack
              key={index}
              sx={{
                width: "100%",
                maxWidth: "560px",
                minHeight: "650px",

                //overflow: "hidden",
                boxShadow: "0 1px 42px rgba(0, 0, 0, 0.71)",
                backgroundColor: card.bgColor,
                position: "sticky",
                justifyContent: "space-between",
                top: `${100 + index * 30}px`,
                "--radius": "40px",
                "--horizontal-padding": "40px",
                "--top-padding": "60px",
                borderRadius: "var(--radius)",
                "@media (max-width: 900px)": {
                  minHeight: "auto",
                  top: `${72 + index * 30}px`,
                  "--radius": "20px",
                  "--top-padding": "20px",
                  "--horizontal-padding": "12px",
                },
              }}
            >
              <Stack
                sx={{
                  padding: "20px",
                  gap: "10px",
                }}
              >
                <Stack
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: card.titleColor,
                    backgroundColor: card.titleBgColor,
                    alignSelf: "flex-start",
                    padding: "3px 5px",
                    margin:
                      "var(--top-padding) var(--horizontal-padding) 0 var(--horizontal-padding)",
                  }}
                >
                  {card.title}
                </Stack>

                <Stack
                  sx={{
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: "24px",
                    color: card.subTitleColor,
                    margin: "0px var(--horizontal-padding) 0 var(--horizontal-padding)",
                  }}
                >
                  {card.subTitle}
                </Stack>
              </Stack>

              <Stack
                sx={{
                  overflow: "hidden",
                  borderRadius: "0 0 var(--radius) var(--radius)",
                  position: "relative",
                }}
              >
                {card.videoUrl && (
                  <Stack
                    component={"video"}
                    src={card.videoUrl}
                    autoPlay
                    loop
                    muted
                    controls={false}
                    playsInline
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      position: "relative",
                      top: "3px",
                      marginTop: "30px",
                    }}
                  />
                )}

                {card.imageUrl && (
                  <Stack
                    component={"img"}
                    src={card.imageUrl}
                    alt=""
                    sx={{
                      width: "100%",
                      position: "relative",
                      top: "3px",
                      marginTop: "30px",
                    }}
                  />
                )}

                {card.quizAnimation && (
                  <Stack
                    sx={{
                      borderRadius: "0 0 var(--radius) var(--radius)",
                      overflow: "hidden",
                      marginTop: "30px",
                    }}
                  >
                    <QuizAnimation />
                  </Stack>
                )}

                {!!card.footerButton && card.footerButton}
              </Stack>
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
          padding: "14px 45px 14px 48px",
          borderRadius: "48px",
          fontSize: "18px",
        }}
        endIcon={<MoveRight />}
      >
        {props.buttonTitle}
      </Button>
    </Stack>
  );
};
