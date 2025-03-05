import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Button, Link, Stack, Tooltip, Typography } from "@mui/material";

import rolePlayScenarios from "@/features/RolePlay/rolePlayData";
import { buttonStyle, maxContentWidth, subTitleFontStyle, titleFontStyle } from "./landingSettings";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { fullEnglishLanguageName, supportedLanguages } from "@/common/lang";
import { Header } from "../Header/Header";
import { CtaBlock } from "./ctaBlock";
import { Footer } from "./Footer";
import { FirstEnterButton } from "./FirstEnterButton";
import { Check, Info } from "lucide-react";

interface PriceCardProps {
  title: string;
  subTitle: string;
  price: string;
  priceDescription: string;

  listTitle: string;
  listItems: {
    title: string;
    tooltip?: string;
  }[];
  buttonTitle: string;
  buttonLink: string;
  isLightButton?: boolean;
}
const PriceCard: React.FC<PriceCardProps> = ({
  title,
  subTitle,
  price,
  priceDescription,
  listTitle,
  listItems,
  buttonTitle,
  buttonLink,
  isLightButton,
}) => {
  return (
    <Stack
      sx={{
        border: `1px solid rgba(0, 0, 0, 0.2)`,
        padding: "25px",
        gap: "20px",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: "3px",
        width: "100%",
        maxWidth: "90vw",
        transition: "box-shadow 0.1s",
        ":hover": {
          border: `1px solid rgba(0, 0, 0, 0.4)`,
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Stack
        sx={{
          height: "100px",
          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "20px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.5rem",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
          }}
        >
          {subTitle}
        </Typography>
      </Stack>

      <Stack
        sx={{
          height: "100px",
          gap: "5px",
          "@media (max-width: 1000px)": {
            height: "auto",
            paddingBottom: "15px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.5rem",
          }}
        >
          {price}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.2rem",
            fontWeight: 350,
            opacity: 0.8,
          }}
        >
          {priceDescription}
        </Typography>
      </Stack>

      <Stack
        sx={{
          height: "auto",
          "@media (max-width: 1000px)": {
            alignItems: "flex-start",
          },
        }}
      >
        <Button
          href={buttonLink}
          sx={{
            ...buttonStyle,
            backgroundColor: isLightButton ? "transparent" : "#4da9f8",
            color: isLightButton ? "#444" : "#fff",
            borderColor: isLightButton ? "#666" : "#4da9f8",
            borderWidth: "1px",
            //borderRadius: "4px",
          }}
          variant={isLightButton ? "outlined" : "contained"}
        >
          {buttonTitle}
        </Button>
      </Stack>

      <Stack gap={"12px"}>
        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          {listTitle}
        </Typography>

        <Stack gap="10px">
          {listItems.map((item) => {
            return (
              <Stack
                key={item.title}
                sx={{
                  flexDirection: "row",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <Check color={"#4da9f8"} size={"1.2rem"} strokeWidth={"3px"} />
                <Typography>{item.title}</Typography>
                {item.tooltip && (
                  <>
                    <Tooltip title={item.tooltip} arrow color="primary">
                      <Info size={"16px"} color="#111" />
                    </Tooltip>
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const PricePage = () => {
  return (
    <>
      <Header />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />

        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            paddingTop: "100px",
            color: "#000",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              padding: "120px 0 90px 0",
            }}
          >
            <Stack
              sx={{
                filter: "invert(1)",
                transform: "scale(1.4)",
              }}
            >
              <img src="./logo.svg" alt="Dark lang logo" width="90px" height="42px" />
            </Stack>
            <Stack
              sx={{
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Typography
                align="center"
                variant="h2"
                component={"h1"}
                sx={{
                  fontWeight: 700,
                  "@media (max-width: 1300px)": {
                    fontSize: "4rem",
                  },
                  "@media (max-width: 900px)": {
                    fontSize: "3rem",
                  },
                  "@media (max-width: 700px)": {
                    fontSize: "2rem",
                  },
                }}
              >
                Flexible Pricing for Every Learner
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                Pay only for what you use—no subscriptions, no hidden fees. Start free and upgrade
                as needed.
              </Typography>
            </Stack>

            <FirstEnterButton />
          </Stack>

          <Stack
            sx={{
              maxWidth: maxContentWidth,
              width: "100%",
              padding: "0px 20px 100px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              component={"h2"}
              sx={{
                ...titleFontStyle,
              }}
            >
              Choose a Plan That Works for You
            </Typography>

            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                height: "100%",
                display: "grid",
                width: "100%",
                boxSizing: "border-box",
                gridTemplateColumns: "1fr 1fr 1fr",
                "@media (max-width: 1000px)": {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "40px",
                },
              }}
            >
              <PriceCard
                title={"Free Trial"}
                subTitle={"Trying Dark Lang risk-free"}
                price={"Free"}
                priceDescription={"$5 free credit"}
                listTitle={"Features"}
                listItems={[
                  {
                    title: "Full AI tutor access",
                    tooltip: "Get unlimited access to AI-powered language practice",
                  },
                  {
                    title: "Role-play scenarios",
                    tooltip:
                      "Engage in real-life conversations like job interviews or ordering food",
                  },
                  {
                    title: "Conversation practice",
                    tooltip: "Improve fluency with interactive chat sessions",
                  },
                ]}
                buttonTitle={"Get started"}
                buttonLink={"/practice"}
              />
              <PriceCard
                title={"Pay-as-You-Go"}
                subTitle={"Regular learners who want full control"}
                price={"$5"}
                priceDescription={"Per AI Hour"}
                listTitle={"Everything in Free Trial, plus:"}
                listItems={[
                  {
                    title: "Pay per session",
                    tooltip: "Only pay for the time you use, no subscriptions required",
                  },
                  {
                    title: "Track usage & progress",
                    tooltip: "Monitor your AI conversation history and improvements",
                  },
                ]}
                buttonTitle={"Start with Free Credit"}
                buttonLink={"/practice"}
              />
              <PriceCard
                title={"Advanced"}
                subTitle={"Frequent users who need more value"}
                price={"Contact for pricing"}
                priceDescription={""}
                listTitle={"What I can do for you"}
                listItems={[
                  {
                    title: "Create custom features",
                    tooltip: "Tailor AI interactions to fit your needs",
                  },
                  {
                    title: "Platform Integration",
                    tooltip: "API access for schools and businesses",
                  },
                  {
                    title: "Discounted AI Usage",
                    tooltip: "Get cheaper AI hours for bulk use",
                  },
                ]}
                buttonTitle={"Contact me"}
                isLightButton
                buttonLink={"/practice"}
              />
            </Stack>
          </Stack>

          <Stack
            sx={{
              gap: "60px",
              maxWidth: maxContentWidth,
              boxSizing: "border-box",
              alignItems: "center",
              padding: "80px 20px 100px 20px",
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "20px",
              }}
            >
              <Typography
                align="center"
                variant="h3"
                component={"h2"}
                sx={{
                  ...titleFontStyle,
                  color: "#000",
                }}
              >
                How Dark Lang Pricing Works
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: "810px",
                  color: "#000",
                  ...subTitleFontStyle,
                }}
              >
                Our AI tutor runs on a simple credit system—you only pay for the time and resources
                you actually use.
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: "100%",
                flexDirection: "row",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "30px",
                "@media (max-width: 700px)": {
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                },
              }}
            >
              <Stack
                sx={{
                  border: `1px solid rgba(0, 0, 0, 0.1)`,
                  padding: "15px",
                  borderRadius: "3px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                  }}
                >
                  Start Free
                </Typography>
                <Typography variant="body2">
                  Start Free – Get $5 in credits when you sign up.
                </Typography>
              </Stack>

              <Stack
                sx={{
                  border: `1px solid rgba(0, 0, 0, 0.1)`,
                  padding: "15px",
                  borderRadius: "3px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                  }}
                >
                  Use as You Go
                </Typography>
                <Typography variant="body2">
                  Each AI conversation session consumes credits based on duration and complexity.
                </Typography>
              </Stack>
              <Stack
                sx={{
                  border: `1px solid rgba(0, 0, 0, 0.1)`,
                  padding: "15px",
                  borderRadius: "3px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.2rem",
                  }}
                >
                  Refill Anytime
                </Typography>
                <Typography variant="body2">Add more credits whenever you need them.</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock />
      </div>
      <Footer />
    </>
  );
};
