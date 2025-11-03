import { Button, Stack, Typography } from "@mui/material";

import {
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../landingSettings";
import { CtaBlock } from "../ctaBlock";
import { Footer } from "../Footer";
import { FirstEnterButton } from "../FirstEnterButton";
import { FaqItem } from "../FAQ/FaqItem";
import { PriceCard } from "./PriceCard";
import { ContactList } from "../Contact/ContactList";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Gift,
  HandCoins,
  Mic,
  BookType,
  ChartNoAxesCombined,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Speech,
  UsersRound,
  Gamepad2,
  Blocks,
  Gem,
  ShieldQuestionMark,
} from "lucide-react";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { CurrencyToDisplay, PriceDisplay } from "./PriceDisplay";
import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { PRICE_PER_MONTH_USD } from "@/common/subscription";

interface PricePageProps {
  lang: SupportedLanguage;
}
export const PricePage = ({ lang }: PricePageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{}}>
      <HeaderStatic lang={lang} />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `rgba(255, 255, 255, 0.99)`,
            paddingTop: "100px",
            color: "#000",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              padding: "70px 0 70px 0",
            }}
          >
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
                {i18n._("Price")}
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(`From mistakes and hesitation to confident conversations`)}
              </Typography>
            </Stack>

            <FirstEnterButton
              getStartedTitle={i18n._(`Get Started`)}
              practiceLink={`${getUrlStart(lang)}quiz`}
              openMyPracticeLinkTitle={i18n._(`Open`)}
            />
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
                gridTemplateColumns: "1fr 1fr",
                "@media (max-width: 1000px)": {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "40px",
                },
              }}
            >
              <PriceCard
                title={i18n._("Full Access")}
                subTitle={i18n._("For learners who want flexibility")}
                price={
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      variant="h2"
                      component={"span"}
                      sx={{
                        fontWeight: 600,
                        fontSize: "3rem",
                      }}
                    >
                      <PriceDisplay amountInUsd={PRICE_PER_MONTH_USD} />
                    </Typography>

                    <Stack sx={{}}>
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                        }}
                      >
                        <CurrencyToDisplay />
                      </Typography>
                      <Typography variant="caption">/ {i18n._("month")}</Typography>
                    </Stack>
                  </Stack>
                }
                priceSubDescription={i18n._("Learn at full speed with full access")}
                listTitle={i18n._("Everything in Free, plus:")}
                isLightButton
                listItems={[
                  {
                    title: i18n._("Full AI tutor access"),
                    tooltip: i18n._("Get unlimited access to AI-powered language practice"),
                    icon: Sparkles,
                  },
                  {
                    title: i18n._("Role-play scenarios"),
                    tooltip: i18n._(
                      "Engage in real-life conversations like job interviews or ordering food"
                    ),
                    icon: UsersRound,
                  },
                  {
                    title: i18n._("Conversation practice"),
                    tooltip: i18n._("Improve fluency with interactive chat sessions"),
                    icon: Speech,
                  },
                  {
                    title: i18n._("Progress tracking"),
                    tooltip: i18n._("See your improvements and track your learning journey"),
                    icon: ChartNoAxesCombined,
                  },
                  {
                    title: i18n._("New Words"),
                    tooltip: i18n._("Get new words and phrases in context"),
                    icon: BookType,
                  },
                  {
                    title: i18n._("New Grammar Rules"),
                    tooltip: i18n._("By practicing, you will get personal grammar rules from AI"),
                    icon: GraduationCap,
                  },
                  {
                    title: i18n._("Advanced Personalization"),
                    tooltip: i18n._(
                      "With time, AI will adapt to your learning style and it will be more personalized"
                    ),
                    icon: Lightbulb,
                  },
                ]}
                buttonTitle={i18n._("Start")}
                buttonLink={`${getUrlStart(lang)}quiz`}
              />
              <PriceCard
                title={i18n._("Advanced")}
                subTitle={i18n._("Frequent users who need more value")}
                price={
                  <Stack
                    sx={{
                      justifyContent: "flex-end",
                      height: "57px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component={"span"}
                      sx={{
                        fontWeight: 700,
                        opacity: 0.8,
                        fontSize: "1.6rem",
                        lineHeight: "1.15",
                      }}
                    >
                      {i18n._("Contact for pricing")}
                    </Typography>
                  </Stack>
                }
                priceSubDescription={i18n._("Frequent users who need more value")}
                listTitle={i18n._("What I can do for you:")}
                listItems={[
                  {
                    title: i18n._("Custom features"),
                    tooltip: i18n._("Tailor AI interactions to fit your needs"),
                    icon: Blocks,
                  },
                  {
                    title: i18n._("Discounted AI Usage"),
                    tooltip: i18n._("Get cheaper AI hours for bulk use"),
                    icon: Gem,
                  },
                ]}
                buttonTitle={i18n._("Contact me", undefined, {
                  comment: "Button title for contact me for advance pricing",
                })}
                isLightButton
                buttonLink={`${getUrlStart(lang)}contacts`}
              />
            </Stack>
          </Stack>

          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              backgroundColor: `#0a121e`,
            }}
          >
            <Stack
              sx={{
                gap: "40px",
                maxWidth: maxContentWidth,
                width: "100%",
                boxSizing: "border-box",
                alignItems: "center",
                padding: "80px 20px 100px 20px",
              }}
            >
              <Stack
                sx={{
                  alignItems: "center",
                  boxSizing: "border-box",
                  gap: "20px",
                }}
              >
                <Typography
                  align="center"
                  variant="h3"
                  component={"h2"}
                  sx={{
                    ...titleFontStyle,
                    color: "#fff",
                  }}
                >
                  {i18n._("FAQ")}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  width: "100%",
                  gap: "0px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "15px",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                  flexDirection: "column",
                  maxWidth: "800px",
                }}
              >
                <FaqItem
                  info={{
                    question: i18n.t(`What’s included in my subscription?`),
                    answer: (
                      <Typography>
                        {i18n.t(
                          `Real-time AI speaking practice, scenario role-plays, listening drills, grammar and vocabulary exercises, personalized feedback, and progress analytics.`
                        )}
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: i18n.t(`Can I cancel anytime?`),
                    answer: (
                      <Typography>
                        {i18n.t(
                          `Yes. You can cancel from your account settings at any time. You’ll keep access until the end of the current billing period.`
                        )}
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: i18n.t(`Do you offer refunds?`),
                    answer: (
                      <Typography>
                        {i18n.t(
                          `We don’t issue partial refunds for unused time. After canceling, your subscription remains active until the period ends.`
                        )}
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: i18n.t(`Will my learning progress be saved if I cancel?`),
                    answer: (
                      <Typography>
                        {i18n.t(
                          `Yes. Your history, achievements, and personalized settings are tied to your account and remain available when you return.`
                        )}
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: i18n._("Can I buy credits in bulk?"),
                    answer: (
                      <Stack gap={"20px"}>
                        <Typography>
                          {i18n._(
                            "Yes! We offer discounts when purchasing larger credit packages. Just contact me before you buy and I'll give you a discount."
                          )}
                        </Typography>
                        <Stack
                          gap={"10px"}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Typography>{i18n._("Contacts:")}</Typography>
                          <ContactList />
                        </Stack>
                      </Stack>
                    ),
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock
          title={i18n._(`Start Your Journey to Fluent Conversations Now`)}
          actionButtonTitle={i18n._(`Get Started`)}
          actionButtonLink={`${getUrlStart(lang)}quiz`}
        />
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
