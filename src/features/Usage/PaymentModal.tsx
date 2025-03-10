import { Button, Stack, TextField, Typography } from "@mui/material";
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
import { loadStripe } from "@stripe/stripe-js";
import { createStripeCheckout } from "./createStripeCheckout";
import { CircleCheck } from "lucide-react";

const paymentTypeLabelMap: Record<PaymentLogType, string> = {
  welcome: "Trial balance",
  user: "Payment",
  gift: "Gift",
};
const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  "pk_test_51PZnYNB2n0dZhsW05q6aRcPve6gKpJ2vAB72pjJjL7m7w0CbmV2Kp2zXkJNPFH9eczsgPq7Pm0cpo0IaIG6Fm2bE00eyshvI2h";

const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const PaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const settings = useSettings();
  const devEmails = ["dmowski.alex@gmail.co2m"];
  const isDev = auth.userInfo?.email && devEmails.includes(auth.userInfo.email);
  const notifications = useNotifications();
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState(5);
  const [isShowAmountInput, setIsShowAmountInput] = useState(false);

  const devModePayments = () => {
    const amount = prompt("Enter amount to update", "10");
    if (!amount) {
      return;
    }

    usage.addBalance(parseFloat(amount), "user");
    notifications.show(`Added $${amount} to your balance`, {
      severity: "success",
      autoHideDuration: 7000,
    });
  };

  const sentTgMessage = (message: string) => {
    const email = auth?.userInfo?.email || "";
    if (!email) {
      sendTelegramRequest({
        message: "Event: Payments. Someone trying to do with money, but no email",
        userEmail: "unknown email",
        languageCode: settings.languageCode || "en",
      });
    }

    const isDevEmail = devEmails.includes(email);
    if (isDevEmail) {
      return;
    }

    sendTelegramRequest({
      message: message,
      userEmail: email,
      languageCode: settings.languageCode || "en",
    });
  };

  const isUseStripe = true;
  const clickOnConfirmRequest = async () => {
    if (isUseStripe) {
      const checkoutInfo = await createStripeCheckout({
        userId: auth.uid,
        amount: amountToAdd,
      });
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
                Process payments
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                Let's add some money to your balance
              </Typography>
            </Stack>

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
                label="Amount to pay"
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
                {[5, 10, 20].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setAmountToAdd(amount)}
                    variant={amount == amountToAdd ? "contained" : "outlined"}
                  >
                    ${amount}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Stack gap={"5px"}>
              {amountToAdd > 400 && (
                <Typography variant="caption" color="error">
                  Amount is too large. I appreciate your support, but let's keep it under $400
                </Typography>
              )}
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
                  disabled={amountToAdd <= 0 || amountToAdd > 400}
                  variant="contained"
                >
                  {`Pay $${amountToAdd}`}
                </Button>
                <Button
                  onClick={() => {
                    setIsShowAmountInput(false);
                  }}
                >
                  Cancel
                </Button>
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
                      Hi, my name is Alex, and I'm the creator of this app.
                      <br />
                      Thank you for using it!
                    </Typography>
                    <Typography>
                      Currently, I haven't integrated payment services yet. 💔
                    </Typography>
                    <Typography>
                      I've received your payment request for <b>${amountToAdd}</b>. <br />
                      I'll send instructions on how to pay to your email ({auth.userInfo?.email})
                    </Typography>

                    <Typography>Once again, thank you for using my app! 🙏</Typography>
                  </Stack>

                  <Stack
                    sx={{
                      gap: "10px",
                    }}
                  >
                    <Typography>
                      If you'd like to contact me directly, here are my details:
                    </Typography>
                    <ContactList />
                  </Stack>
                  {isDev && (
                    <Button variant="contained" onClick={devModePayments}>
                      pay
                    </Button>
                  )}
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
                      ${new Intl.NumberFormat().format(usage.balance)}
                    </Typography>
                    <Typography variant="caption">Current Balance</Typography>
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
                    <Typography variant="caption">Total used</Typography>
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
                          Success!
                        </Typography>
                        <CircleCheck size={"1.6rem"} />
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        Your payment was successful
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" component="h2">
                        Balance
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                        }}
                      >
                        {isShowConfirmPayments ? "" : "Manage your payments and balance"}
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
                        ${new Intl.NumberFormat().format(usage.balance)}
                      </Typography>
                      <Typography variant="caption">Current Balance</Typography>
                    </Stack>
                  </Stack>

                  <Button
                    onClick={onShowAmountInput}
                    startIcon={<AddCardIcon />}
                    size="large"
                    variant="contained"
                  >
                    {"Buy More"}
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
                      Total used: <b>${new Intl.NumberFormat().format(usage.usedBalance)}</b>{" "}
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
                        Payment history:
                      </Typography>

                      {!usage.paymentLogs && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                          }}
                        >
                          Loading...
                        </Typography>
                      )}

                      {usage.paymentLogs && usage.paymentLogs.length === 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                          }}
                        >
                          No payments...
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
