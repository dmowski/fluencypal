import {
  Button,
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
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendTelegramRequest } from "../Telegram/sendTextAiRequest";
import { useSettings } from "../Settings/useSettings";
import dayjs from "dayjs";
import { PaymentLogType } from "@/common/usage";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import { ContactList } from "../Landing/Contact/ContactList";
import { createStripeCheckout } from "./createStripeCheckout";
import { CircleCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { supportedLanguages } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useCurrency } from "../User/useCurrency";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { pricePerHour } from "@/common/ai";
import { TRIAL_DAYS } from "@/common/subscription";

const paymentTypeLabelMap: Record<PaymentLogType, string> = {
  welcome: "Trial balance",
  user: "Payment",
  gift: "Gift",
  "subscription-full-v1": "Subscription (1 month)",
  "trial-days": `Trial (${TRIAL_DAYS} days)`,
};

const isUseStripe = true;

export const PaymentModal = () => {
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

  if (!usage.isShowPaymentModal) return null;

  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      onClose={() => usage.togglePaymentModal(false)}
      width="min(900px, 100vw)"
      padding="min(30px, 10vw)"
    >
      {isShowAmountInput ? (
        <>
          <Stack
            sx={{
              width: "100%",
              gap: "30px",
              alignItems: "flex-start",
            }}
            component={"form"}
            action={"#"}
            onSubmit={(e) => {
              console.log("e", e);
              e.preventDefault();
              clickOnConfirmRequest();
            }}
          >
            <Stack>
              <Typography variant="h4" component="h2">
                {i18n._(`Buy more hours`)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`Let's add some hours to your balance`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: "100%",
                gap: "20px",
                flexDirection: "row",
                "@media (max-width: 600px)": {
                  flexDirection: "column",
                  alignItems: "flex-start",
                },
              }}
            >
              <Stack
                sx={{
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <TextField
                  label={i18n._(`Amount hours to buy`)}
                  value={amountToAdd ? amountToAdd : ""}
                  type="text"
                  onChange={(e) => {
                    if (!e.target.value) {
                      setAmountToAdd(0);
                      return;
                    }
                    const number = parseFloat(e.target.value);
                    if (isNaN(number)) {
                      return;
                    }
                    setAmountToAdd(Math.abs(number) || 0);
                  }}
                />
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  {[1, 2, 5].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setAmountToAdd(amount)}
                      variant={amount == amountToAdd ? "contained" : "outlined"}
                    >
                      {amount}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              <Stack
                sx={{
                  width: "100%",
                  gap: "5px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    paddingBottom: "10px",
                  }}
                >
                  <b>{i18n._(`What one hour means?`)}</b>
                  <br />
                  {i18n._(
                    `You only charged for when AI is actively working: speaking or analyzing your speech.`
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    paddingBottom: "10px",
                  }}
                >
                  <b>{i18n._(`How long will my hours last?`)}</b>
                  <br />
                  {i18n._(
                    `Once purchased, your hours remain available until you use them. There is no expiration.`
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    paddingBottom: "10px",
                  }}
                >
                  <b>{i18n._(`What's included?`)}</b>
                  <br />
                  {i18n._(
                    `Access to all functionalities on app where AI is present: speaking, analyzing, role-plays, new words and runles creator.`
                  )}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              sx={{
                width: "100%",
              }}
            >
              <Divider />
              <Stack
                sx={{
                  padding: "6px 0",
                }}
              >
                <Typography
                  sx={{
                    opacity: 0.9,
                  }}
                >
                  {i18n._(`Price per one AI hour:`)}{" "}
                  <b>{currency.convertUsdToCurrency(pricePerHour)}</b>
                </Typography>

                <Typography variant="h5">
                  {i18n._(`Total:`)}{" "}
                  <b>{currency.convertUsdToCurrency(amountToAdd * pricePerHour)}</b>
                </Typography>
              </Stack>
              <Divider />
            </Stack>

            <Stack>
              <Stack gap={"10px"}>
                {amountToAdd > 400 && (
                  <Typography variant="caption" color="error">
                    {i18n._(
                      `Amount is too large. I appreciate your support, but let's keep it under $400`
                    )}
                  </Typography>
                )}

                <Stack gap={"2px"}>
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
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <Button
                    startIcon={<AssuredWorkloadIcon />}
                    size="large"
                    color="info"
                    type="submit"
                    sx={{
                      padding: "10px 25px",
                    }}
                    disabled={amountToAdd <= 0 || amountToAdd > 400}
                    variant="contained"
                  >
                    {i18n._(`Continue to payment`)} |{" "}
                    {currency.convertUsdToCurrency(amountToAdd * pricePerHour)}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsShowAmountInput(false);
                    }}
                  >
                    {i18n._(`Cancel`)}
                  </Button>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`The Controller of the data entered into the form is Fundacja Rozwoju
                  Przedsiębiorczości "Twój StartUp". The data will be processed in order to provide
                  the service and for marketing purposes – in the case of consent. We would like to
                  inform you about the possibility of withdrawing your consent. For full information
                  on data processing and your rights, see the`)}{" "}
                  <Link target="_blank" href={`${getUrlStart(supportedLang)}privacy`}>
                    {i18n._(`privacy policy`)}
                  </Link>
                  .
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </>
      ) : (
        <>
          <Stack
            sx={{
              width: "100%",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            {isShowConfirmPayments ? (
              <Stack
                sx={{
                  gap: "40px",
                  width: "100%",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingTop: "10px",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  sx={{
                    gap: "30px",
                    alignItems: "flex-start",
                  }}
                >
                  <Stack
                    sx={{
                      maxWidth: "430px",
                      gap: "15px",
                    }}
                  >
                    <Typography variant="h3" component={"span"}>
                      👷
                    </Typography>
                    <Typography>
                      {i18n._(`Hi, my name is Alex, and I'm the creator of this app.`)}
                      <br />
                      {i18n._(`Thank you for using it!`)}
                    </Typography>
                    <Typography>
                      {i18n._(`Currently, I haven't integrated payment services yet. 💔`)}
                    </Typography>
                    <Typography>
                      {i18n._(`I've received your payment request for`)} <b>${amountToAdd}</b>.{" "}
                      <br />
                      {i18n._(`I'll send instructions on how to pay to your email`)} (
                      {auth.userInfo?.email})
                    </Typography>

                    <Typography>{i18n._(`Once again, thank you for using my app!`)} 🙏</Typography>
                  </Stack>

                  <Stack
                    sx={{
                      gap: "10px",
                    }}
                  >
                    <Typography>
                      {i18n._(`If you'd like to contact me directly, here are my contacts:`)}
                    </Typography>
                    <ContactList />
                  </Stack>
                </Stack>

                <Stack
                  sx={{
                    gap: "20px",
                  }}
                >
                  <Stack
                    sx={{
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backgroundColor: `rgba(255, 255, 255, 0.01)`,
                      padding: "20px",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography variant="h3">
                      {convertHoursToHumanFormat(usage.balanceHours)} of AI usage
                    </Typography>
                    <Typography variant="caption">{i18n._(`Current Balance`)}</Typography>
                  </Stack>

                  <Stack
                    sx={{
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backgroundColor: `rgba(255, 255, 255, 0.01)`,
                      padding: "20px",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography
                      variant="body1"
                      component={"span"}
                      sx={{
                        opacity: 0.9,
                      }}
                    >
                      {convertHoursToHumanFormat(usage.usedHours)}
                    </Typography>
                    <Typography variant="caption">{i18n._(`Total used`)}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Stack
                sx={{
                  width: "100%",
                  gap: "30px",
                  alignItems: "flex-start",
                }}
              >
                <Stack>
                  {usage.isSuccessPayment ? (
                    <>
                      <Stack
                        sx={{
                          flexDirection: "row",
                          gap: "10px",
                          color: "#2ecc71",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h4" component="h2">
                          {i18n._(`Success!`)}
                        </Typography>
                        <CircleCheck size={"1.6rem"} />
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        {i18n._(
                          `Your payment was successful, but updates might take a few minutes`
                        )}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" component="h2">
                        {i18n._(`Balance`)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        {isShowConfirmPayments ? "" : i18n._(`Manage your payments and balance`)}
                      </Typography>
                    </>
                  )}
                </Stack>

                <Stack
                  sx={{
                    gap: "20px",
                    width: "100%",
                    alignItems: "flex-start",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Stack>
                      <Typography variant="h3">
                        {convertHoursToHumanFormat(Math.max(0, usage.balanceHours))}
                      </Typography>
                      <Typography variant="caption">
                        {i18n._(`Current Balance of AI usage`)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    onClick={onShowAmountInput}
                    startIcon={<AddCardIcon />}
                    size="large"
                    variant="contained"
                  >
                    {i18n._(`Buy More`)}
                  </Button>
                </Stack>

                {!isShowAmountInput && (
                  <Stack
                    gap={"10px"}
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#c2c2c2",
                      }}
                    >
                      {i18n._(`Total used:`)} <b>{convertHoursToHumanFormat(usage.usedHours)}</b>
                    </Typography>

                    <Stack
                      sx={{
                        gap: "10px",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {i18n._(`Payment history:`)}
                      </Typography>

                      {!usage.paymentLogs && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                          }}
                        >
                          {i18n._(`Loading...`)}
                        </Typography>
                      )}

                      {usage.paymentLogs && usage.paymentLogs.length === 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                          }}
                        >
                          {i18n._(`No payments...`)}
                        </Typography>
                      )}

                      {usage.paymentLogs && (
                        <Stack
                          sx={{
                            width: "100%",
                            gap: "10px",
                          }}
                        >
                          {usage.paymentLogs
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .map((log) => {
                              const humanDate = dayjs(log.createdAt).format("DD MMM YYYY");
                              const humanTime = dayjs(log.createdAt).format("HH:mm");
                              return (
                                <Stack
                                  key={log.id}
                                  sx={{
                                    padding: "10px 15px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "400px",
                                    maxWidth: "100%",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderRadius: "10px",
                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                    "@media (max-width: 320px)": {
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                      gap: "20px",
                                    },
                                  }}
                                >
                                  <Stack>
                                    <Typography variant="h6">
                                      {log.currency.toUpperCase()} {log.amountAdded}
                                    </Typography>
                                    <Typography variant="body2">
                                      {convertHoursToHumanFormat(log.amountOfHours)}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        opacity: 0.7,
                                      }}
                                    >
                                      {paymentTypeLabelMap[log.type]}
                                    </Typography>
                                  </Stack>

                                  <Stack
                                    sx={{
                                      alignItems: "flex-end",
                                      "@media (max-width: 320px)": {
                                        alignItems: "flex-start",
                                      },
                                    }}
                                  >
                                    <Typography variant="caption">{humanTime}</Typography>
                                    <Typography variant="body2">{humanDate}</Typography>
                                    {log.receiptUrl && (
                                      <Link href={log.receiptUrl} target="_blank">
                                        <Typography variant="body2">Receipt</Typography>
                                      </Link>
                                    )}
                                  </Stack>
                                </Stack>
                              );
                            })}
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </>
      )}
    </CustomModal>
  );
};
