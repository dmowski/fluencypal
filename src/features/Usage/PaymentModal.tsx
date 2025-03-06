import { Button, Link, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useUsage } from "./useUsage";
import { useNotifications } from "@toolpad/core/useNotifications";
import AddCardIcon from "@mui/icons-material/AddCard";
import { useState } from "react";
import MailIcon from "@mui/icons-material/Mail";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useAuth } from "../Auth/useAuth";
import { sendTelegramRequest } from "../Telegram/sendTextAiRequest";
import { useSettings } from "../Settings/useSettings";
import dayjs from "dayjs";
import { PaymentLogType } from "@/common/usage";

const paymentTypeLabelMap: Record<PaymentLogType, string> = {
  welcome: "Trial balance",
  user: "Payment",
  gift: "Gift",
};

export const PaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const settings = useSettings();
  const devEmails = ["dmowski.alex@gmail.com"];
  const isDev = auth.userInfo?.email && devEmails.includes(auth.userInfo.email);
  const notifications = useNotifications();
  const [isShowPayments, setIsShowPayments] = useState(false);

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

  const clickOnByMore = async () => {
    setIsShowPayments(true);
    const email = auth?.userInfo?.email || "";

    const devEmails = ["dmowski.alex@gmail.com"];
    const isDevEmail = devEmails.includes(email);
    if (isDevEmail) {
      return;
    }

    sendTelegramRequest({
      message: "Event: User clicked on Buy More",
      userEmail: email,
      languageCode: settings.languageCode || "en",
    });
  };

  if (!usage.isShowPaymentModal) return null;

  return (
    <CustomModal
      isOpen={true}
      onClose={() => usage.setIsShowPaymentModal(false)}
      width="min(900px, 97vw)"
    >
      <Stack
        sx={{
          width: "100%",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        <Stack>
          <Typography variant="h4" component="h2">
            Balance
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            Manage your payments and balance
          </Typography>
        </Stack>
        {isShowPayments ? (
          <Stack
            sx={{
              gap: "40px",
              width: "100%",
              flexDirection: "row",
              flexWrap: "wrap",
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
                <Typography>Hi, my name is Alex. Thank you for using my app!</Typography>
                <Typography>Currently, I haven’t integrated payment services yet. 💔</Typography>
                <Typography>
                  If you’d like to add more money to your balance, please contact me via{" "}
                  <Link href="https://www.instagram.com/dmowskii/" target="_blank">
                    Instagram
                  </Link>{" "}
                  or email, and I’ll provide instructions on how to do it.
                </Typography>
              </Stack>

              <Stack
                sx={{
                  gap: "10px",
                }}
              >
                <Stack
                  sx={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <MailIcon
                    sx={{
                      width: "25px",
                      height: "25px",
                    }}
                  />
                  <Typography>
                    <Link href="mailto:dmowski.alex@gmail.com">dmowski.alex@gmail.com</Link>
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  <InstagramIcon
                    sx={{
                      width: "25px",
                      height: "25px",
                    }}
                  />
                  <Typography>
                    <Link href="https://www.instagram.com/dmowskii/" target="_blank">
                      @dmowskii
                    </Link>
                  </Typography>
                </Stack>
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
            <Stack
              sx={{
                gap: "20px",
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
                onClick={clickOnByMore}
                startIcon={<AddCardIcon />}
                size="large"
                variant="contained"
              >
                Buy More
              </Button>
            </Stack>

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
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
