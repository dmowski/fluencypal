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
import { WELCOME_BONUS } from "@/common/usage";
import { SupportedLanguage } from "@/common/lang";

interface PricePageProps {
  lang: SupportedLanguage;
}
export const PricePage = ({ lang }: PricePageProps) => {
  return (
    <Stack sx={{}}>
      <Header mode="landing" />
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
              <img src="./logo_dark.svg" alt="logo" width="200px" height="42px" />
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

            <FirstEnterButton
              openDashboardTitle={`Open Dashboard`}
              getStartedTitle={`Get Started Free`}
              viewPricingTitle={`View Pricing`}
              noCreditCardNeededTitle={`No Credit Card Needed`}
              pricingLink={`/${lang}/pricing`}
              practiceLink={`/${lang}/practice`}
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
                subTitle={`Trying ${APP_NAME} risk-free`}
                price={"Free"}
                priceDescription={`$${WELCOME_BONUS} free credit`}
                listTitle={"Features:"}
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
                price={`$${WELCOME_BONUS}`}
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
                listTitle={"What I can do for you:"}
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
                buttonLink={"/contacts"}
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
                How {APP_NAME} Pricing Works
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
                    Start Free
                  </Typography>
                  <Typography variant="body2" align="center">
                    Start Free – Get ${WELCOME_BONUS} in credits when you sign up.
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
                    Use as You Go
                  </Typography>
                  <Typography variant="body2" align="center">
                    Each AI conversation session consumes credits based on duration and complexity.
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
                    Refill Anytime
                  </Typography>
                  <Typography variant="body2" align="center">
                    Add more credits whenever you need them.
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
                Why Pay-as-You-Go is Better Than Subscriptions
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
                        <span className="other-cell-head-text">Traditional Subscription</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Typography className="title">Pay Only for What You Use</Typography>
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
                        <Typography align="center">No, fixed cost</Typography>
                      </Stack>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography className="title">Full Access Anytime</Typography>
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
                      <Typography className="title">No Monthly Fees</Typography>
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
                        <Typography align="center">No, recurring charge</Typography>
                      </Stack>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Typography className="title">Pause Anytime</Typography>
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
              href="/practice"
            >
              Try {APP_NAME} for Free
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
                  Pricing FAQs
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
                    question: `Can I try ${APP_NAME} for free?`,
                    answer: (
                      <Typography>
                        Yes! You start with ${WELCOME_BONUS} in free credits to explore all
                        features.
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: "How much do AI conversations cost?",
                    answer: (
                      <Typography>
                        The cost is calculated based on duration and AI usage. On average, a full
                        hour costs ${WELCOME_BONUS}.
                      </Typography>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: "Can I buy credits in bulk?",
                    answer: (
                      <Stack gap={"20px"}>
                        <Typography>
                          Yes! We offer discounts when purchasing larger credit packages. Just
                          contact me before you buy and I'll give you a discount.
                        </Typography>
                        <Stack
                          gap={"10px"}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Typography>Contacts:</Typography>
                          <ContactList />
                        </Stack>
                      </Stack>
                    ),
                  }}
                />

                <FaqItem
                  info={{
                    question: "Will my credits expire?",
                    answer: (
                      <Typography>
                        No, your credits stay active as long as your account is in good standing.
                      </Typography>
                    ),
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock
          title="Start Your Journey to Fluent Conversations Now"
          actionButtonTitle="Get Started Free"
          actionButtonLink={`/${lang}/practice`}
        />
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
