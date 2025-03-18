import {
  Button,
  Checkbox,
  FormControlLabel,
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
import { supportedLanguages } from "@/common/lang";
import { useLingui } from "@lingui/react";
import { getUrlStart } from "../Lang/getUrlStart";

const paymentTypeLabelMap: Record<PaymentLogType, string> = {
  welcome: "Trial balance",
  user: "Payment",
  gift: "Gift",
};

const isUseStripe = true;

export const PaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();
  const devEmails = ["dmowski.alex@gmail.com"];
  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState(2);
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
          userEmail: "unknown email",
          languageCode: settings.languageCode || "en",
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
        userEmail: email,
        languageCode: settings.languageCode || "en",
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
      isOpen={true}
      onClose={() => usage.togglePaymentModal(false)}
      width="min(900px, 97vw)"
    >
      {isShowAmountInput ? (
        <>
          <Stack
            sx={{
              width: "100%",
              gap: "30px",
              alignItems: "flex-start",
            }}
          >
            <Stack>
              <Typography variant="h4" component="h2">
                {i18n._(`Process payments`)}
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

            <Typography>
              Price per one hour: <b>PLN 24</b>
            </Typography>

            <Stack
              sx={{
                flexDirection: "row",
                gap: "20px",
                alignItems: "center",
                "@media (max-width: 600px)": {
                  flexDirection: "column",
                  gap: "10px",
                  paddingBottom: "10px",
                },
              }}
            >
              <TextField
                label="Amount to add"
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
                {[2, 5, 10, 20].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setAmountToAdd(amount)}
                    variant={amount == amountToAdd ? "contained" : "outlined"}
                  >
                    {amount} hours
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Stack>
              <Typography variant="h6">
                Total: <b>PLN {amountToAdd * 24}</b>
              </Typography>

              <Stack gap={"10px"}>
                {amountToAdd > 400 && (
                  <Typography variant="caption" color="error">
                    {i18n._(
                      `Amount is too large. I appreciate your support, but let's keep it under $400`
                    )}
                  </Typography>
                )}

                <Stack gap={"10px"}>
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
                        I want the service to be provided immediately and I acknowledge that as soon
                        as the Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" provides the
                        service, I will lose the right to terminate the contract.
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
                        I accept the{" "}
                        <Link target="_blank" href={`${getUrlStart(supportedLang)}terms`}>
                          Terms and Conditions
                        </Link>{" "}
                        of the Website operated by Fundacja Rozwoju Przedsiębiorczości "Twój
                        StartUp" with its registered office in Warsaw.
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
                    onClick={clickOnConfirmRequest}
                    startIcon={<AssuredWorkloadIcon />}
                    size="large"
                    disabled={
                      amountToAdd <= 0 || amountToAdd > 400 || !looseRightChecked || !isTermsChecked
                    }
                    variant="contained"
                  >
                    {`Continue to payment | PLN ${amountToAdd * 24}`}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsShowAmountInput(false);
                    }}
                  >
                    {i18n._(`Cancel`)}
                  </Button>
                </Stack>
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
                      {new Intl.NumberFormat().format(usage.balance)} hours of AI usage
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
                      ${new Intl.NumberFormat().format(usage.usedBalance)}
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
                        {i18n._(`Your payment was successful`)}
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
                        {new Intl.NumberFormat().format(usage.balance)} Hours
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
                      {i18n._(`Total used hours:`)}{" "}
                      <b>{new Intl.NumberFormat().format(usage.usedBalance)}</b>
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
                                    <Typography variant="h6">${log.amountAdded}</Typography>
                                    <Typography variant="body2">
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
