"use client";
import { Button, Checkbox, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useUsage } from "./useUsage";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { createStripeCheckout } from "./createStripeCheckout";
import { beginCell } from "@ton/core";

import { usePathname } from "next/navigation";
import { supportedLanguages } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useCurrency } from "../User/useCurrency";
import { PRICE_PER_MONTH_USD } from "@/common/subscription";
import { sentPaymentTgMessage } from "./sentTgMessage";
import dayjs from "dayjs";
import { ContactList } from "../Landing/Contact/ContactList";
import { FeatureList } from "../Landing/Price/FeatureList";
import { isTMA, invoice } from "@telegram-apps/sdk-react";
import { sendCreateTelegramInvoiceRequest } from "@/app/api/telegram/createInvoice/sendCreateTelegramInvoiceRequest";
import { TELEGRAM_MONTHLY_PRICE_START } from "../Telegram/starPrices";
import {
  TonConnectButton,
  useTonWallet,
  SendTransactionRequest,
  useTonConnectUI,
  CHAIN,
} from "@tonconnect/ui-react";
import { TgGoldStar } from "../Icon/TgStar";
import { TonIcon } from "../Icon/TonIcon";
import { sendCreateCryptoOrderRequest } from "@/app/api/crypto/createOrder/sendCreateCryptoOrderRequest";
import { sendCheckPaymentRequest } from "@/app/api/crypto/checkPayment/sendCheckPaymentRequest";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTelegramApp = isTMA();
const allowCryptoFlag = true;

const WalletButton = ({ onPaid }: { onPaid: () => void }) => {
  const wallet = useTonWallet();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const [waitingForPayment, setWaitingForPayment] = useState(0);

  const checkPayment = async () => {
    const paymentResult = await sendCheckPaymentRequest(
      {
        userId: auth.uid || "",
      },
      await auth.getToken()
    );

    console.log("CHECK PAYMENT RESULT", paymentResult);

    if (paymentResult.isRecentlyPaid) {
      onPaid();
      setWaitingForPayment(0);
      return;
    }

    await sleep(5000);
    setWaitingForPayment((prev) => prev + 1);
  };

  useEffect(() => {
    if (waitingForPayment === 0) {
      return;
    }

    if (waitingForPayment > 10) {
      console.log("STOP WAITING");
      setWaitingForPayment(0);
    } else {
      checkPayment();
    }
  }, [waitingForPayment]);

  const payWithTon = async () => {
    if (!wallet) {
      return;
    }

    setIsLoading(true);

    try {
      const order = await sendCreateCryptoOrderRequest(
        {
          monthCount: 1,
        },
        await auth.getToken()
      );

      if (order.error) {
        console.log("error during payment", order);
        notifications.show(i18n._("Error creating payment session") + " - " + order.error.message, {
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      const { merchantAddress, amountNano, comment } = order;

      function makeCommentPayloadBase64(comment: string) {
        const cell = beginCell()
          .storeUint(0, 32) // op = 0 for text comment
          .storeStringTail(comment) // UTF-8 text
          .endCell();
        return cell.toBoc().toString("base64");
      }

      if (!merchantAddress || !amountNano || !comment) {
        console.log("error during payment", order);
        notifications.show(i18n._("Error creating payment session"), {
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      const payloadB64 = makeCommentPayloadBase64(comment);

      const validUntil = Math.floor(Date.now() / 1000) + 300; // 5 min
      const tx: SendTransactionRequest = {
        validUntil,
        network: wallet?.account?.chain ?? CHAIN.MAINNET,
        messages: [
          {
            address: merchantAddress,
            amount: amountNano,
            payload: payloadB64,
          },
        ],
      };

      const transactionEvent = await tonConnectUI.sendTransaction(tx);
      console.log("transactionEvent FINISHED", transactionEvent);

      await sleep(500);
      notifications.show(i18n._("Transaction completed. Soon your balance will be updated."), {
        severity: "success",
      });

      await sleep(1200);
      onPaid();
    } catch (e) {
      console.log("CRYPTO ERROR", e);
      notifications.show(i18n._("Error processing payment"), {
        severity: "error",
      });
    }

    setIsLoading(false);
  };

  return (
    <Stack
      sx={{
        alignItems: "center",
        gap: "5px",
        width: "100%",
      }}
    >
      <TonConnectButton />

      {waitingForPayment > 0 && (
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography variant="body2" align="center">
            {i18n._("Waiting for payment...")}
          </Typography>

          <Typography
            variant="caption"
            align="center"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._("Attempt")} {waitingForPayment}
          </Typography>
        </Stack>
      )}

      {wallet && waitingForPayment === 0 && (
        <Button
          variant="outlined"
          color="info"
          disabled={isLoading}
          onClick={payWithTon}
          fullWidth
          size="large"
          startIcon={<TonIcon size="20px" />}
        >
          {isLoading ? i18n._("Loading...") : i18n._("Pay with crypto")}
        </Button>
      )}
    </Stack>
  );
};

export const SubscriptionPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const [allowCrypto, setAllowCrypto] = useState(allowCryptoFlag);

  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);
  const [isTelegramPaymentOptions, setIsTelegramPaymentOptions] = useState(false);
  const [isPriceInStars, setIsPriceInStars] = useState(false);

  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const pricePerMonthInCurrency = Math.round(currency.rate * PRICE_PER_MONTH_USD * 10) / 10;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = () => {
    containerRef.current?.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
  };

  const [isRedirecting, setIsRedirecting] = useState(false);
  const clickOnConfirmRequest = async () => {
    if (isTelegramApp) {
      setIsTelegramPaymentOptions(true);
    } else {
      clickOnConfirmRequestStripe();
    }
  };

  const openMainSubscriptionPage = () => {
    setIsShowConfirmPayments(false);
    setIsTelegramPaymentOptions(false);
    scrollTop();
  };

  const clickOnConfirmRequestTelegramStars = async () => {
    const token = await auth.getToken();

    try {
      setIsRedirecting(true);
      const checkoutInfo = await sendCreateTelegramInvoiceRequest(
        {
          monthCount: 1,
        },
        token
      );
      console.log("checkoutInfo", checkoutInfo);
      if (checkoutInfo.error) {
        console.log("checkoutInfo", checkoutInfo);
        setIsRedirecting(false);
        notifications.show(i18n._("Error creating payment session"), {
          severity: "error",
        });
        return;
      } else if (!checkoutInfo.invoice_link) {
        console.log("checkoutInfo", checkoutInfo);
        setIsRedirecting(false);
        notifications.show(i18n._("Error creating payment session. Try again later."), {
          severity: "error",
        });
        return;
      } else {
        const result = await invoice.open(checkoutInfo.invoice_link, "url");
        console.log("invoice.open - result", result);
        if (result === "paid") {
          await sentPaymentTgMessage({
            message: "Event: Payment successful",
            email: auth?.userInfo?.email || "unknownEmail",
            token: await auth.getToken(),
          });
          notifications.show(i18n._("Payment successful! Thank you."), {
            severity: "success",
          });
          scrollTop();
          setIsShowConfirmPayments(false);
          setIsTelegramPaymentOptions(false);
        } else {
          notifications.show(i18n._("Payment failed! Please try again."), {
            severity: "error",
          });

          scrollTop();
          setIsShowConfirmPayments(false);
          setIsTelegramPaymentOptions(false);
        }
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setIsRedirecting(false);
      notifications.show(i18n._("Error during payment process"), {
        severity: "error",
      });
      await sentPaymentTgMessage({
        message: "Error during payment process: Telegram stars",
        email: auth?.userInfo?.email || "unknownEmail",
        token: await auth.getToken(),
      });
    }
  };

  const clickOnConfirmRequestStripe = async () => {
    const token = await auth.getToken();

    try {
      setIsRedirecting(true);
      const checkoutInfo = await createStripeCheckout(
        {
          userId: auth.uid,
          months: 1,
          languageCode: supportedLang,
          currency: currency.currency,
        },
        token
      );
      await sentPaymentTgMessage({
        message: "Event: Redirect to stripe",
        email: auth?.userInfo?.email || "unknownEmail",
        token,
      });
      if (!checkoutInfo.sessionUrl) {
        console.log("checkoutInfo", checkoutInfo);
        setIsRedirecting(false);
        notifications.show(i18n._("Error creating payment session"), {
          severity: "error",
        });
        return;
      } else {
        setIsRedirecting(false);
        window.location.href = checkoutInfo.sessionUrl;
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setIsRedirecting(false);
      notifications.show(i18n._("Error during payment process"), {
        severity: "error",
      });
      await sentPaymentTgMessage({
        message: "Error during payment process",
        email: auth?.userInfo?.email || "unknownEmail",
        token: await auth.getToken(),
      });
    }
  };

  const showConfirmPage = async () => {
    setIsShowConfirmPayments(true);
    scrollTop();

    if (!isTelegramApp) {
      sentPaymentTgMessage({
        message: "Event: Press on Pay Button",
        email: auth?.userInfo?.email || "unknownEmail",
        token: await auth.getToken(),
      });
    }
  };

  const isActiveSubscription = usage.isFullAccess;
  const isTrial = !usage.paymentLogs?.find((log) => log.type === "user" || "subscription-full-v1");
  const activeTill = usage.activeSubscriptionTill
    ? `${dayjs(usage.activeSubscriptionTill).format("DD MMM")} (in ${dayjs(usage.activeSubscriptionTill).fromNow(true)})`
    : null;

  useEffect(() => {
    const isTelegramApp = isTMA();
    setIsPriceInStars(isTelegramApp);
    setAllowCrypto(allowCryptoFlag && isTelegramApp);
  }, []);

  if (!usage.isShowPaymentModal) return null;
  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      onClose={() => {
        if (isShowConfirmPayments) {
          openMainSubscriptionPage();
          return;
        }
        usage.togglePaymentModal(false);
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "600px",
        }}
        ref={containerRef}
      >
        {isTelegramApp && isTelegramPaymentOptions ? (
          <>
            <Stack
              sx={{
                maxWidth: "600px",
                width: "100%",
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
                  variant="h5"
                  component="h2"
                >
                  {i18n._(`Payment option`)}
                </Typography>

                <Typography
                  sx={{
                    width: "100%",
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`Subscription for 1 month | Full access`)}
                </Typography>

                <Typography variant="body1">
                  <b>{currency.convertUsdToCurrency(PRICE_PER_MONTH_USD)}</b>
                </Typography>
                <Typography variant="caption">
                  {`${TELEGRAM_MONTHLY_PRICE_START} Stars`} <br />
                </Typography>

                {currency.currency !== "USD" && allowCrypto && (
                  <Typography variant="caption">{PRICE_PER_MONTH_USD} USDT</Typography>
                )}
              </Stack>
              <Stack
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  minWidth: "300px",
                }}
              >
                <Button
                  onClick={clickOnConfirmRequestTelegramStars}
                  fullWidth
                  color="info"
                  variant="contained"
                  disabled={isRedirecting}
                  size="large"
                  type="submit"
                  name="submit"
                  startIcon={<TgGoldStar size="25px" />}
                >
                  {i18n._(`Pay with Stars`)}
                </Button>
                {allowCrypto && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        paddingTop: "15px",
                      }}
                    >
                      or crypto
                    </Typography>

                    <WalletButton onPaid={openMainSubscriptionPage} />
                  </>
                )}
              </Stack>
            </Stack>
          </>
        ) : isShowConfirmPayments ? (
          <Stack
            sx={{
              maxWidth: "700px",
              width: "100%",
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
                variant="h5"
                component="h2"
              >
                {i18n._(`Confirm payment`)}
              </Typography>

              <Typography
                sx={{
                  width: "100%",
                  opacity: 0.7,
                }}
              >
                {i18n._(`Subscription for 1 month | Full access`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                gap: "20px",
              }}
              component={"form"}
              action={"#"}
              onSubmit={(e) => {
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
              <Stack
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <Button
                  color="info"
                  fullWidth
                  variant="contained"
                  disabled={isRedirecting}
                  size="large"
                  type="submit"
                  name="submit"
                >
                  {isTelegramApp ? i18n._(`Continue`) : i18n._(`Pay`)}
                </Button>
              </Stack>
            </Stack>
            <FeatureList />
          </Stack>
        ) : (
          <>
            <Stack
              sx={{
                width: "100%",
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
                <Typography align="center" variant="h5" component="h2">
                  {i18n._(`Subscription`)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                  align="center"
                >
                  {!isActiveSubscription && <>{i18n._(`You don't have an active subscription.`)}</>}
                  {isActiveSubscription && isTrial && activeTill && (
                    <>
                      {i18n._(`Your trial ended until`)} <b>{activeTill}</b>
                    </>
                  )}

                  {isActiveSubscription && !isTrial && activeTill && (
                    <>
                      {i18n._(`Your subscription is active until`)} <b>{activeTill || "-"}</b>
                    </>
                  )}

                  {isActiveSubscription && !isTrial && !activeTill && (
                    <>
                      {i18n._(`You have`)} <b>{usage.balanceHours.toFixed(1)}</b>{" "}
                      {i18n._(`AI hours left in your balance.`)}
                    </>
                  )}
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
                  <Stack
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">{i18n._(`Full Access`)}</Typography>
                    {activeTill && (
                      <Stack
                        sx={{
                          padding: "3px 17px",
                          borderRadius: "18px",
                          backgroundColor: "rgba(5, 172, 255, 0.4 )",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ padding: 0, margin: 0, color: "#fff", fontWeight: 600 }}
                        >
                          {i18n._(`Active`)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {isPriceInStars ? (
                    <>
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <TgGoldStar size="3.1rem" />
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 500,
                            fontSize: "3.4rem",
                          }}
                        >
                          {TELEGRAM_MONTHLY_PRICE_START}
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
                            {i18n._(`Stars`)} /
                          </Typography>
                          <Typography variant="caption">{i18n._("month")}</Typography>
                        </Stack>
                      </Stack>
                    </>
                  ) : (
                    <>
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
                          <Typography variant="caption">{i18n._("month")}</Typography>
                        </Stack>
                      </Stack>
                    </>
                  )}

                  <Typography variant="body1">
                    {i18n._("Learn at full speed with full access")}
                  </Typography>
                  <Stack
                    sx={{
                      gap: "5px",
                    }}
                  >
                    <Button
                      color="info"
                      disabled={!!activeTill}
                      variant="contained"
                      size="large"
                      onClick={showConfirmPage}
                    >
                      {activeTill ? i18n._(`Active`) : i18n._(`Get Full Access`)}
                    </Button>

                    {activeTill && (
                      <>
                        <Button color="info" variant="text" size="large" onClick={showConfirmPage}>
                          {i18n._(`Buy More`)}
                        </Button>
                      </>
                    )}
                  </Stack>
                  <FeatureList />
                </Stack>
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                  gap: "10px",
                  maxWidth: "400px",
                }}
              >
                <Typography variant="body1">{i18n._(`Need help?`)}</Typography>
                <ContactList />
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
