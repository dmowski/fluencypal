import { Button, Stack, Typography } from "@mui/material";

import {
  APP_NAME,
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../landingSettings";
import { Header } from "../../Header/Header";
import { CtaBlock } from "../ctaBlock";
import { Footer } from "../Footer";
import { FirstEnterButton } from "../FirstEnterButton";
import { FaqItem } from "../FAQ/FaqItem";
import { PriceCard } from "./PriceCard";
import { ContactList } from "../Contact/ContactList";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import { Gift, HandCoins, Mic } from "lucide-react";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";

interface PricePageProps {
  lang: SupportedLanguage;
}
export const PricePage = ({ lang }: PricePageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{}}>
      <Header mode="landing" lang={lang} />
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
                transform: "scale(1.4)",
              }}
            >
              <img src="/logo_dark.svg" alt="logo" width="200px" height="42px" />
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
                {i18n._("Flexible Pricing for Every Learner")}
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(
                  `Pay only for what you use—no subscriptions, no hidden fees. Start free and upgrade as needed.`
                )}
              </Typography>
            </Stack>

            <FirstEnterButton
              openDashboardTitle={i18n._(`Open Dashboard`)}
              getStartedTitle={i18n._(`Get Started Free`)}
              viewPricingTitle={i18n._(`View Pricing`)}
              noCreditCardNeededTitle={i18n._(`No Credit Card Needed`)}
              pricingLink={`${getUrlStart(lang)}pricing`}
              practiceLink={`${getUrlStart(lang)}practice`}
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
            <Typography
              variant="h6"
              align="center"
              component={"h2"}
              sx={{
                ...titleFontStyle,
              }}
            >
              {i18n._("Choose a Plan That Works for You")}
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
                title={i18n._("Free Trial")}
                subTitle={i18n.t(`Trying FluencyPal risk-free`)}
                price={i18n._("PLN 0")}
                priceDescription={i18n._(
                  `One hour of active AI speaking is free, then Pay as You Go`
                )}
                listTitle={i18n._("Features:")}
                listItems={[
                  {
                    title: i18n._("Full AI tutor access"),
                    tooltip: i18n._("Get unlimited access to AI-powered language practice"),
                  },
                  {
                    title: i18n._("Role-play scenarios"),
                    tooltip: i18n._(
                      "Engage in real-life conversations like job interviews or ordering food"
                    ),
                  },
                  {
                    title: i18n._("Conversation practice"),
                    tooltip: i18n._("Improve fluency with interactive chat sessions"),
                  },
                  {
                    title: i18n._("Progress tracking"),
                    tooltip: i18n._("See your improvements and track your learning journey"),
                  },
                  {
                    title: i18n._("New Words"),
                    tooltip: i18n._("Get new words and phrases in context"),
                  },
                  {
                    title: i18n._("New Grammar Rules"),
                    tooltip: i18n._("By practicing, you will get personal grammar rules from AI"),
                  },
                ]}
                buttonTitle={i18n._("Get started")}
                buttonLink={`${getUrlStart(lang)}practice`}
              />
              <PriceCard
                title={i18n._("Pay-as-You-Go")}
                subTitle={i18n._("For learners who want flexibility")}
                price={i18n._(`PLN 24`)}
                priceDescription={i18n._("Per Hour of AI Usage")}
                priceSubDescription={i18n._(
                  "You only pay when AI is speaking or analyzing your speech, not when you're thinking or typing."
                )}
                listTitle={i18n._("Everything in Free Trial, plus:")}
                listItems={[
                  {
                    title: i18n._("Pay per session"),
                    tooltip: i18n._("Only pay for the time you use, no subscriptions required"),
                  },
                  {
                    title: i18n._("Track usage & progress"),
                    tooltip: i18n._("Monitor your AI conversation history and improvements"),
                  },
                  {
                    title: i18n._("Advanced Personalization"),
                    tooltip: i18n._(
                      "With time, AI will adapt to your learning style and it will be more personalized"
                    ),
                  },
                ]}
                buttonTitle={i18n._("Start with Trial")}
                buttonLink={`${getUrlStart(lang)}practice`}
              />
              <PriceCard
                title={i18n._("Advanced")}
                subTitle={i18n._("Frequent users who need more value")}
                price={i18n._("Contact for pricing")}
                priceDescription={""}
                listTitle={i18n._("What I can do for you:")}
                listItems={[
                  {
                    title: i18n._("Create custom features"),
                    tooltip: i18n._("Tailor AI interactions to fit your needs"),
                  },
                  {
                    title: i18n._("Platform Integration"),
                    tooltip: i18n._("API access for schools and businesses"),
                  },
                  {
                    title: i18n._("Discounted AI Usage"),
                    tooltip: i18n._("Get cheaper AI hours for bulk use"),
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
              gap: "60px",
              maxWidth: maxContentWidth,
              boxSizing: "border-box",
              alignItems: "center",
              padding: "80px 20px 100px 20px",
              "@media (max-width: 700px)": {
                paddingTop: "0px",
              },
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "20px",
                width: "100%",
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
                {i18n.t(`How FluencyPal Pricing Works`)}
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
                {i18n._(`Our AI tutor runs on a simple credit system—you only pay for the time and resources
                you actually use.`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 100px 1fr 100px  1fr",
                gap: "30px",
                boxSizing: "border-box",

                "@media (max-width: 900px)": {
                  gridTemplateColumns: "1fr 1fr 1fr",
                },

                "@media (max-width: 700px)": {
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                },
              }}
            >
              <Stack
                sx={{
                  padding: "15px",
                  borderRadius: "3px",
                  alignItems: "center",
                  gap: "30px",
                }}
              >
                <Gift size={"3rem"} strokeWidth={"1px"} />
                <Stack>
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i18n._(`Start Free`)}
                  </Typography>
                  <Typography variant="body2" align="center">
                    {i18n._(`Start Free – Get 5 in credits when you sign up.`)}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  paddingTop: "30px",
                  width: "100%",
                  "@media (max-width: 900px)": {
                    display: "none",
                  },
                }}
              >
                <img
                  src="/arrow.jpg"
                  alt=""
                  style={{
                    width: "100%",
                  }}
                />
              </Stack>

              <Stack
                sx={{
                  padding: "15px",
                  borderRadius: "3px",
                  alignItems: "center",
                  gap: "30px",
                }}
              >
                <Mic size={"3rem"} strokeWidth={"1px"} />
                <Stack>
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i18n._("Use as You Go")}
                  </Typography>
                  <Typography variant="body2" align="center">
                    {i18n._(
                      "Each AI conversation session consumes credits based on duration and complexity."
                    )}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  paddingTop: "30px",
                  width: "100%",
                  "@media (max-width: 900px)": {
                    display: "none",
                  },
                }}
              >
                <img
                  src="/arrow.jpg"
                  alt=""
                  style={{
                    width: "100%",
                    transform: "scaleY(-1)",
                  }}
                />
              </Stack>

              <Stack
                sx={{
                  padding: "15px",
                  borderRadius: "3px",
                  alignItems: "center",
                  gap: "30px",
                }}
              >
                <HandCoins size={"3rem"} strokeWidth={"1px"} />
                <Stack>
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i18n._("Refill Anytime")}
                  </Typography>
                  <Typography variant="body2" align="center">
                    {i18n._("Add more credits whenever you need them.")}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            sx={{
              gap: "40px",
              maxWidth: maxContentWidth,
              width: "100%",
              boxSizing: "border-box",
              alignItems: "center",
              padding: "80px 20px 100px 20px",
              "@media (max-width: 700px)": {
                display: "none",
              },
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
                  color: "#000",
                }}
              >
                {i18n._("Why Pay-as-You-Go is Better Than Subscriptions")}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: "100%",
                gap: "30px",
                borderRadius: "4px",
                boxSizing: "border-box",

                overflowX: "auto",
                paddingTop: "100px",
                table: {
                  borderCollapse: "collapse",
                  width: "100%",
                  textAlign: "left",
                  minWidth: "420px",
                  cellspacing: "0",

                  ".other-cell-head": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    fontWeight: 400,
                    height: "80px",
                    ".other-cell-head-text": {
                      width: "100px",
                      height: "80px",
                      color: "#fff",
                      textAlign: "center",
                      backgroundColor: "rgba(10, 30, 18, 0.9)",
                      border: "1px solid rgba(0, 0, 0, 2)",
                      borderRadius: "24px",
                      padding: "10px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      top: "-50px",
                    },
                  },

                  ".lang-cell, .lang-cell-head": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "300px",
                    boxSizing: "border-box",
                    "@media (max-width: 700px)": {
                      minWidth: "300px",
                    },
                  },

                  ".lang-cell": {
                    height: "10px",
                    padding: "45px 10px",
                    border: "1px solid rgba(10, 18, 30, 0.4)",
                    borderBottom: "none",
                    borderTop: "none",
                  },
                  ".lang-cell--last": {
                    borderBottom: "1px solid rgba(10, 18, 30, 0.4)",
                    borderRadius: " 0 0 24px 24px",
                  },
                  ".lang-cell-head": {
                    height: "80px",
                    padding: "20px 10px",
                    border: "1px solid rgba(10, 18, 30, 0.4)",
                    borderBottom: "none",
                    borderRadius: "24px 24px 0 0",
                  },
                  ".title": {
                    paddingLeft: "20px",
                    "@media (max-width: 900px)": {
                      maxWidth: "120px",
                    },
                  },

                  ".logo": {
                    width: "100px",
                    height: "80px",
                    backgroundColor: "rgba(10, 18, 30, 1)",
                    border: "1px solid rgba(0, 0, 0, 2)",
                    borderRadius: "24px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    top: "-50px",
                    img: {
                      width: "100%",
                      height: "auto",
                    },
                  },

                  "td:first-child,td:last-child": {
                    fontWeight: 200,
                    minWidth: "280px",
                    "@media (max-width: 1000px)": {
                      minWidth: "250px",
                    },
                    "@media (max-width: 900px)": {
                      minWidth: "140px",
                    },
                  },
                  "tbody tr:nth-child(odd) td": {
                    backgroundColor: "#f8f8f8",
                  },
                },
              }}
            >
              <table cellSpacing="0" cellPadding="0">
                <thead>
                  <tr>
                    <th></th>
                    <th>
                      <div className="lang-cell-head">
                        <div className="logo">
                          <img src="/logo.svg" alt="Logo" />
                        </div>
                      </div>
                    </th>
                    <th>
                      <div className="other-cell-head">
                        <span className="other-cell-head-text">
                          {i18n._("Traditional Subscription")}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Typography className="title">
                        {i18n._("Pay Only for What You Use")}
                      </Typography>
                    </td>
                    <td>
                      <span className="lang-cell">
                        <VerifiedIcon
                          sx={{
                            color: "#05acff",
                            fontSize: "2rem",
                          }}
                        />
                      </span>
                    </td>
                    <td>
                      <Stack
                        sx={{
                          alignItems: "center",
                          gap: "5px",
                          padding: "15px 0",
                        }}
                      >
                        <CancelIcon
                          sx={{
                            fontSize: "2rem",
                            color: "#777",
                          }}
                        />
                        <Typography align="center">{i18n._("No, fixed cost")}</Typography>
                      </Stack>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography className="title">{i18n._("Full Access Anytime")}</Typography>
                    </td>
                    <td>
                      <span className="lang-cell">
                        <VerifiedIcon
                          sx={{
                            color: "#05acff",
                            fontSize: "2rem",
                          }}
                        />
                      </span>
                    </td>
                    <td>
                      <Stack
                        sx={{
                          alignItems: "center",
                          gap: "5px",
                          padding: "15px 0",
                        }}
                      >
                        <VerifiedIcon
                          sx={{
                            color: "#05acff",
                            fontSize: "2rem",
                          }}
                        />
                      </Stack>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography className="title">{i18n._("No Monthly Fees")}</Typography>
                    </td>
                    <td>
                      <span className="lang-cell">
                        <VerifiedIcon
                          sx={{
                            color: "#05acff",
                            fontSize: "2rem",
                          }}
                        />
                      </span>
                    </td>
                    <td>
                      <Stack
                        sx={{
                          alignItems: "center",
                          gap: "5px",
                          padding: "15px 0",
                        }}
                      >
                        <CancelIcon
                          sx={{
                            fontSize: "2rem",
                            color: "#777",
                          }}
                        />
                        <Typography align="center">{i18n._("No, recurring charge")}</Typography>
                      </Stack>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography className="title">{i18n._("Pause Anytime")}</Typography>
                    </td>
                    <td>
                      <span className="lang-cell lang-cell--last">
                        <VerifiedIcon
                          sx={{
                            color: "#05acff",
                            fontSize: "2rem",
                          }}
                        />
                      </span>
                    </td>
                    <td>
                      <Stack
                        sx={{
                          alignItems: "center",
                          gap: "5px",
                          padding: "15px 0",
                        }}
                      >
                        <CancelIcon
                          sx={{
                            fontSize: "2rem",
                            color: "#777",
                          }}
                        />
                      </Stack>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Stack>
            <Button
              sx={{
                ...buttonStyle,
              }}
              href={`${getUrlStart(lang)}practice`}
            >
              {i18n.t(`Try FluencyPal for Free`)}
            </Button>
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
                    question: i18n.t(`Can I try FluencyPal for free?`),
                    answer: (
                      <Typography>
                        {i18n.t(
                          `Yes! You start with one free hour of conversation with AI to explore all features.`
                        )}
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: i18n._("How much do AI conversations cost?"),
                    answer: (
                      <Typography>
                        {i18n._(
                          `The cost is calculated based on duration and AI usage. On average, a full hour costs $5.`
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

                <FaqItem
                  info={{
                    question: i18n._("Will my credits expire?"),
                    answer: (
                      <Typography>
                        {i18n._(
                          "No, your credits stay active as long as your account is in good standing."
                        )}
                      </Typography>
                    ),
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock
          title={i18n._(`Start Your Journey to Fluent Conversations Now`)}
          actionButtonTitle={i18n._(`Get Started Free`)}
          actionButtonLink={`${getUrlStart(lang)}practice`}
        />
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
