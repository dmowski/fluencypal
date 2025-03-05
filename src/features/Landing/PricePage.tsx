import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { buttonStyle, maxContentWidth, subTitleFontStyle, titleFontStyle } from "./landingSettings";
import { Header } from "../Header/Header";
import { CtaBlock } from "./ctaBlock";
import { Footer } from "./Footer";
import { FirstEnterButton } from "./FirstEnterButton";
import { Check, Info, InstagramIcon, MailIcon } from "lucide-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FaqItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          component="span"
          variant="h5"
          sx={{
            padding: "10px",
            fontWeight: 600,
            fontSize: "1.4rem",
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: "10px 30px 30px 30px",
        }}
      >
        {answer}
      </AccordionDetails>
    </Accordion>
  );
};

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
            backgroundColor: isLightButton ? "transparent" : "#1f74be",
            color: isLightButton ? "#444" : "#fff",
            borderColor: isLightButton ? "#666" : "#1f74be",
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
                <Check color={"#1f74be"} size={"1.2rem"} strokeWidth={"3px"} />
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
    <Stack sx={{}}>
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
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "30px",
                boxSizing: "border-box",

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
                border: "1px solid rgba(0, 0, 0, 0.1)",
                padding: "15px",
                borderRadius: "4px",
                boxSizing: "border-box",

                overflow: "auto",
                table: {
                  borderCollapse: "collapse",
                  width: "100%",
                  cellpadding: "10",
                  textAlign: "left",
                  minWidth: "420px",
                  cellspacing: "0",

                  th: {
                    padding: "20px 15px 30px 15px",
                    fontWeight: 500,
                  },
                  "tbody td": {
                    padding: "20px 15px",
                  },
                  "thead tr th:first-child": {
                    fontWeight: 400,
                    opacity: 0.7,
                  },
                  "tbody tr:nth-child(odd) td": {
                    backgroundColor: "#f8f8f8",
                  },

                  "tbody tr td:nth-child(even)": {
                    //backgroundColor: "rgba(31, 116, 190, 0.07)",
                  },
                  "tr th:nth-child(even)": {
                    //backgroundColor: "rgba(31, 116, 190, 0.07)",
                  },
                },
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Dark Lang (Pay-as-You-Go)</th>
                    <th>Traditional Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Pay Only for What You Use</strong>
                    </td>
                    <td>✅ Yes</td>
                    <td>❌ No, fixed cost</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Full Access Anytime</strong>
                    </td>
                    <td>✅ Yes</td>
                    <td>✅ Yes</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>No Monthly Fees</strong>
                    </td>
                    <td>✅ Yes</td>
                    <td>❌ No, recurring charge</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pause Anytime</strong>
                    </td>
                    <td>✅ Yes</td>
                    <td>❌ No</td>
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
              Try Dark Lang for Free
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
                  question="Can I try Dark Lang for free?"
                  answer={
                    <Typography>
                      Yes! You start with $5 in free credits to explore all features.
                    </Typography>
                  }
                />

                <FaqItem
                  question="How much do AI conversations cost?"
                  answer={
                    <Typography>
                      The cost is calculated based on duration and AI usage. On average, a full hour
                      costs $5.
                    </Typography>
                  }
                />

                <FaqItem
                  question="Can I buy credits in bulk?"
                  answer={
                    <Stack gap={"20px"}>
                      <Typography>
                        Yes! We offer discounts when purchasing larger credit packages. Just contact
                        me before you buy and I'll give you a discount.
                      </Typography>
                      <Stack
                        gap={"10px"}
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography>Contacts:</Typography>

                        <Stack gap={"10px"}>
                          <Stack
                            sx={{
                              alignItems: "center",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <MailIcon />
                            <Typography>
                              <Link href="mailto:dmowski.alex@gmail.com">
                                dmowski.alex@gmail.com
                              </Link>
                            </Typography>
                          </Stack>

                          <Stack
                            sx={{
                              alignItems: "center",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <InstagramIcon />
                            <Typography>
                              <Link href="https://www.instagram.com/dmowskii/" target="_blank">
                                dmowskii
                              </Link>
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  }
                />

                <FaqItem
                  question="Will my credits expire?"
                  answer={
                    <Typography>
                      No, your credits stay active as long as your account is in good standing.
                    </Typography>
                  }
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock />
      </div>
      <Footer />
    </Stack>
  );
};
