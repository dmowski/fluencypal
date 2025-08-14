import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useUsage } from "./useUsage";
import { useNotifications } from "@toolpad/core/useNotifications";
import AddCardIcon from "@mui/icons-material/AddCard";
import { ForwardRefExoticComponent, RefAttributes, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendTelegramRequest } from "../Telegram/sendTextAiRequest";
import { useSettings } from "../Settings/useSettings";
import dayjs from "dayjs";
import { PaymentLogType } from "@/common/usage";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import { ContactList } from "../Landing/Contact/ContactList";
import { createStripeCheckout } from "./createStripeCheckout";
import {
  BookType,
  ChartNoAxesCombined,
  CircleCheck,
  GraduationCap,
  Lightbulb,
  LucideProps,
  Sparkles,
  Speech,
  Telescope,
  UsersRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { supportedLanguages } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useCurrency } from "../User/useCurrency";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { pricePerHour } from "@/common/ai";
import { buttonStyle } from "../Landing/landingSettings";
import { PRICE_PER_MONTH_USD } from "@/common/subscription";

const paymentTypeLabelMap: Record<PaymentLogType, string> = {
  welcome: "Trial balance",
  user: "Payment",
  gift: "Gift",
  "subscription-full-v1": "Subscription (1 month)",
  "trial-days": "Trial (5 days)",
};

const isUseStripe = true;

export const SubscriptionPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const settings = useSettings();
  const devEmails = ["dmowski.alex@gmail.com"];
  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState(1);
  const [isShowAmountInput, setIsShowAmountInput] = useState(false);

  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const pricePerMonthInCurrency = Math.round(currency.rate * PRICE_PER_MONTH_USD * 10) / 10;

  const sentTgMessage = async (message: string) => {
    const email = auth?.userInfo?.email || "";
    if (!email) {
      sendTelegramRequest(
        {
          message: "Event: Payments. Someone trying to do with money, but no email",
        },
        await auth.getToken()
      );
    }

    const isDevEmail = devEmails.includes(email);
    if (isDevEmail) {
      return;
    }

    sendTelegramRequest(
      {
        message: message,
      },
      await auth.getToken()
    );
  };

  const clickOnConfirmRequest = async () => {
    alert("ok");

    if (isUseStripe) {
      const checkoutInfo = await createStripeCheckout(
        {
          userId: auth.uid,
          amountOfHours: amountToAdd,
          languageCode: supportedLang,
          currency: currency.currency,
        },
        await auth.getToken()
      );
      if (!checkoutInfo.sessionUrl) {
        console.log("checkoutInfo", checkoutInfo);
        notifications.show("Error creating payment session", {
          severity: "error",
        });
        return;
      } else {
        window.location.href = checkoutInfo.sessionUrl;
      }
    } else {
      setIsShowConfirmPayments(true);
      sentTgMessage(`Event: User confirmed payment: $${amountToAdd}`);
      setIsShowAmountInput(false);
    }
  };

  const onShowAmountInput = () => {
    sentTgMessage("Event: Press on Pay Button");
    setIsShowAmountInput(true);
  };

  interface ListItem {
    title: string;
    tooltip: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  }

  const listItems: ListItem[] = [
    {
      title: i18n._("Full AI tutor access"),
      tooltip: i18n._("Get unlimited access to AI-powered language practice"),
      icon: Sparkles,
    },
    {
      title: i18n._("Role-play scenarios"),
      tooltip: i18n._("Engage in real-life conversations like job interviews or ordering food"),
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
  ];

  const [isShowConfirmation, setIsShowConfirmation] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = () => {
    containerRef.current?.parentElement?.scrollTo(0, 0);
  };

  if (!usage.isShowPaymentModal) return null;
  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      onClose={() => {
        if (isShowConfirmation) {
          setIsShowConfirmation(false);
          scrollTop();
          return;
        }
        usage.togglePaymentModal(false);
      }}
      width="100dvw"
      padding="0"
      maxHeight="100dvh"
    >
      <Stack
        sx={{
          alignItems: "center",
          minHeight: "100dvh",
          height: "100%",
          width: "100%",
        }}
        ref={containerRef}
      >
        {isShowConfirmation ? (
          <Stack
            sx={{
              maxWidth: "700px",
              width: "100%",
              padding: "40px 10px",
              boxSizing: "border-box",
              gap: "40px",
              alignItems: "center",
            }}
          >
            <Stack
              sx={{
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                }}
                variant="h4"
              >
                Confirm payment
              </Typography>

              <Typography
                sx={{
                  width: "100%",
                  opacity: 0.7,
                }}
              >
                Subscription for 1 month | Full access
              </Typography>
            </Stack>

            <Stack
              sx={{
                gap: "20px",
              }}
              component={"form"}
              action={"#"}
              onSubmit={(e) => {
                console.log("e", e);
                e.preventDefault();
                clickOnConfirmRequest();
              }}
            >
              <Stack gap={"12px"}>
                <FormControlLabel
                  required
                  sx={{
                    ".MuiFormControlLabel-asterisk": {
                      color: "#f24",
                    },
                  }}
                  checked={looseRightChecked}
                  onChange={(e) => setLooseRightChecked(!looseRightChecked)}
                  control={<Checkbox />}
                  label={
                    <Typography variant="caption">
                      {i18n._(`I want the service to be provided immediately and I acknowledge that as soon
                        as the Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" provides the
                        service, I will lose the right to terminate the contract.`)}
                    </Typography>
                  }
                />
                <FormControlLabel
                  required
                  sx={{
                    ".MuiFormControlLabel-asterisk": {
                      color: "#f24",
                    },
                  }}
                  checked={isTermsChecked}
                  onChange={(e) => setIsTermsChecked(!isTermsChecked)}
                  control={<Checkbox />}
                  label={
                    <Typography variant="caption">
                      {i18n._(`I accept the`)}{" "}
                      <Link target="_blank" href={`${getUrlStart(supportedLang)}terms`}>
                        {i18n._(`Terms and Conditions`)}
                      </Link>{" "}
                      {i18n._(`of the Website operated by Fundacja Rozwoju Przedsiębiorczości "Twój
                        StartUp" with its registered office in Warsaw.`)}
                    </Typography>
                  }
                />

                <FormControlLabel
                  sx={{
                    ".MuiFormControlLabel-asterisk": {
                      color: "#f24",
                    },
                  }}
                  checked={isMarketingChecked}
                  onChange={(e) => setIsMarketingChecked(!isMarketingChecked)}
                  control={<Checkbox />}
                  label={
                    <Typography variant="caption">
                      {i18n._(`I want to receive commercial and marketing content`)}
                    </Typography>
                  }
                />
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    padding: "6px 0",
                  }}
                >
                  <Typography variant="h5">
                    {i18n._(`Total:`)} <b>{currency.convertUsdToCurrency(PRICE_PER_MONTH_USD)}</b>
                  </Typography>
                </Stack>
              </Stack>
              <Button
                sx={{
                  ...buttonStyle,
                  padding: "10px 70px",
                  color: "#000",
                  backgroundColor: "#05acff",
                }}
                variant="contained"
                size="large"
                type="submit"
                onClick={() => {}}
              >
                Pay and Subscribe
              </Button>
            </Stack>
            <Stack
              sx={{
                gap: "18px",
                paddingTop: "10px",
                paddingBottom: "40px",
                width: "100%",
              }}
            >
              {listItems.map((item, index) => (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: "row",
                    gap: "15px",
                    alignItems: "center",
                  }}
                >
                  <item.icon
                    style={{
                      opacity: 0.7,
                    }}
                    size={18}
                  />
                  <Typography variant="body2">{item.title}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : (
          <>
            <Stack
              sx={{
                maxWidth: "500px",
                width: "100%",
                padding: "40px 10px",
                boxSizing: "border-box",
                gap: "40px",
                alignItems: "center",
              }}
            >
              <Stack
                sx={{
                  gap: "5px",
                }}
              >
                <Typography align="center" variant="h4">
                  Upgrade your plan
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                  align="center"
                >
                  Your trial ended in <b>5 days</b>
                </Typography>
              </Stack>

              <Stack
                sx={{
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "#212121",
                  maxWidth: "400px",
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    padding: "24px",
                    gap: "20px",
                  }}
                >
                  <Typography variant="h6">Full Access</Typography>

                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 500,
                        fontSize: "3.6rem",
                      }}
                    >
                      {pricePerMonthInCurrency}
                    </Typography>
                    <Stack
                      sx={{
                        paddingTop: "18px",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                        }}
                      >
                        {currency.currency} /
                      </Typography>
                      <Typography variant="caption">month</Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="body1">Learn in full speed with full access</Typography>
                  <Button
                    sx={{
                      ...buttonStyle,
                      padding: "10px 70px",
                      color: "#000",
                      backgroundColor: "#05acff",
                    }}
                    variant="contained"
                    size="large"
                    onClick={() => {
                      setIsShowConfirmation(true);
                      scrollTop();
                    }}
                  >
                    Get Full Access
                  </Button>

                  <Stack
                    sx={{
                      gap: "18px",
                      paddingTop: "10px",
                      paddingBottom: "40px",
                    }}
                  >
                    {listItems.map((item, index) => (
                      <Stack
                        key={index}
                        sx={{
                          flexDirection: "row",
                          gap: "15px",
                          alignItems: "center",
                        }}
                      >
                        <item.icon
                          style={{
                            opacity: 0.7,
                          }}
                          size={18}
                        />
                        <Typography variant="body2">{item.title}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
