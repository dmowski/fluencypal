"use client";
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  Typography,
} from "@mui/material";
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
import { PRICE_PER_DAY_USD, PRICE_PER_MONTH_USD } from "@/common/subscription";
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
import { SubscriptionWaiter } from "./SubscriptionWaiter";
import { CRYPTO_MONTHLY_PRICE_TON } from "../Telegram/cryptoPrice";
import { useSettings } from "../Settings/useSettings";
import { StripeCreateCheckoutRequest } from "@/common/requests";
import { sleep } from "@/libs/sleep";

const isTelegramApp = isTMA();
const allowCryptoFlag = true;

const devEmails = ["dmowski.alex@gmail.com"];

const WalletButton = ({
  onShowWaiter,
  onPressPay,
}: {
  onShowWaiter: () => void;
  onPressPay: () => void;
}) => {
  const wallet = useTonWallet();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const payWithTon = async () => {
    if (!wallet) {
      return;
    }

    setIsLoading(true);

    try {
      onPressPay();
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
      onShowWaiter();
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

      {wallet && (
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
  const settings = useSettings();
  const appMode = settings.appMode;

  const [allowCrypto, setAllowCrypto] = useState(allowCryptoFlag);

  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);
  const [isTelegramPaymentOptions, setIsTelegramPaymentOptions] = useState(false);
  const [isPriceInStars, setIsPriceInStars] = useState(false);

  const [isShowWaiting, setIsShowWaiting] = useState(false);
  const [initActiveTill, setInitActiveTill] = useState<string>("");

  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = () => {
    containerRef.current?.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
  };

  const showWaiter = () => {
    setIsShowWaiting(true);
    setIsShowConfirmPayments(false);
    setIsTelegramPaymentOptions(false);
    scrollTop();
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
        setInitActiveTill(usage.activeSubscriptionTill || "");
        const result = await invoice.open(checkoutInfo.invoice_link, "url");
        console.log("invoice.open - result", result);
        if (result === "paid") {
          await sentPaymentTgMessage({
            message: "Event: Payment successful",
            email: auth?.userInfo?.email || "unknownEmail",
            token: await auth.getToken(),
          });
          showWaiter();
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

  const [duration, setDuration] = useState<"day" | "week" | "month">("day");

  const durationPriceUsd =
    duration === "month"
      ? PRICE_PER_MONTH_USD
      : duration === "day"
        ? PRICE_PER_DAY_USD
        : PRICE_PER_DAY_USD * 7;

  const priceInCurrency = Math.round(currency.rate * durationPriceUsd * 10) / 10;

  const clickOnConfirmRequestStripe = async () => {
    const token = await auth.getToken();

    try {
      const dataToCheckout: StripeCreateCheckoutRequest = {
        userId: auth.uid,
        months: duration === "month" ? 1 : 0,
        days: duration === "week" ? 7 : duration === "day" ? 1 : 0,
        languageCode: supportedLang,
        currency: currency.currency,
      };

      setIsRedirecting(true);

      const checkoutInfo = await createStripeCheckout(dataToCheckout, token);
      await sentPaymentTgMessage({
        message: "Event: Redirect to stripe",
        email: auth?.userInfo?.email || "unknownEmail",
        token,
      });
      if (!checkoutInfo.sessionUrl) {
        setIsRedirecting(false);
        notifications.show(
          i18n._("Error creating payment session. Notification sent to support. Try again later."),
          {
            severity: "error",
          }
        );

        console.error("checkoutInfo", checkoutInfo);

        await sentPaymentTgMessage({
          message: "Error during payment process",
          email: auth?.userInfo?.email || "unknownEmail",
          token: await auth.getToken(),
        });

        await sleep(300);

        await sentPaymentTgMessage({
          message: "Error during payment process" + checkoutInfo.error,
          email: auth?.userInfo?.email || "unknownEmail",
          token: await auth.getToken(),
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
    const isDevEmail = auth?.userInfo?.email?.includes("dmowski");
    if (isDevEmail) {
      return;
    }

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
    ? `${dayjs(usage.activeSubscriptionTill).format("DD MMMM")}`
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
        {isShowWaiting ? (
          <SubscriptionWaiter
            initActiveTill={initActiveTill}
            onClose={() => {
              openMainSubscriptionPage();
              setIsShowWaiting(false);
            }}
          />
        ) : isTelegramApp && isTelegramPaymentOptions ? (
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

                <Typography variant="caption">
                  {`${TELEGRAM_MONTHLY_PRICE_START} Stars`} <br />
                </Typography>

                {currency.currency !== "USD" && allowCrypto && (
                  <Typography variant="caption">{CRYPTO_MONTHLY_PRICE_TON} TON</Typography>
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

                    <WalletButton
                      onPressPay={() => setInitActiveTill(usage.activeSubscriptionTill || "")}
                      onShowWaiter={() => showWaiter()}
                    />
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
                {duration === "month"
                  ? i18n._(`Subscription for 1 month | Full access`)
                  : duration === "week"
                    ? i18n._(`Subscription for 1 week | Full access`)
                    : i18n._(`Subscription for 1 day | Full access`)}
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
                    {i18n._(`Total:`)}{" "}
                    {isTelegramApp ? (
                      <>
                        <b>{CRYPTO_MONTHLY_PRICE_TON} TON</b> | or{" "}
                        <b>{TELEGRAM_MONTHLY_PRICE_START} Stars</b>
                      </>
                    ) : (
                      <b>{currency.convertUsdToCurrency(durationPriceUsd)}</b>
                    )}
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
            <FeatureList appMode={appMode} />
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
                  {i18n._(`Full Access`)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                  align="center"
                >
                  {!isActiveSubscription && <>{i18n._(`You do not have full access.`)}</>}

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
                    <Stack sx={{ gap: "20px" }}>
                      <Stack
                        sx={{
                          width: "100%",
                        }}
                      >
                        <ButtonGroup
                          aria-label="Basic button group"
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Button
                            fullWidth
                            variant={duration === "day" ? "contained" : "outlined"}
                            onClick={() => setDuration("day")}
                          >
                            {i18n._("Day")}
                          </Button>
                          <Button
                            fullWidth
                            variant={duration === "week" ? "contained" : "outlined"}
                            onClick={() => setDuration("week")}
                          >
                            {i18n._("Week")}
                          </Button>
                          <Button
                            fullWidth
                            variant={duration === "month" ? "contained" : "outlined"}
                            onClick={() => setDuration("month")}
                          >
                            {i18n._("Month")}
                          </Button>
                        </ButtonGroup>
                      </Stack>

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
                          {priceInCurrency}
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
                          <Typography variant="caption">
                            {duration === "month"
                              ? i18n._("month")
                              : duration === "week"
                                ? i18n._("week")
                                : i18n._("day")}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  )}

                  <Typography variant="body1">
                    {i18n._("Get confidence with AI support")}
                  </Typography>
                  <Stack
                    sx={{
                      gap: "5px",
                    }}
                  >
                    {!activeTill && (
                      <Button
                        color="info"
                        disabled={!!activeTill}
                        variant="contained"
                        size="large"
                        onClick={showConfirmPage}
                      >
                        {activeTill
                          ? i18n._(`Active till {activeTill}`, { activeTill: activeTill })
                          : i18n._(`Get Full Access`)}
                      </Button>
                    )}

                    {activeTill && (
                      <Typography
                        variant="body2"
                        align="left"
                        sx={{
                          color: "#00CFFF",
                        }}
                      >
                        {i18n._(`Active till {activeTill}`, { activeTill: activeTill })}
                      </Typography>
                    )}

                    {activeTill && (
                      <Button
                        color="info"
                        variant="outlined"
                        size="large"
                        onClick={showConfirmPage}
                      >
                        {i18n._(`Buy More`)}
                      </Button>
                    )}

                    {activeTill && (
                      <Typography
                        variant="body2"
                        align="left"
                        sx={{
                          opacity: 0.7,
                          paddingBottom: "10px",
                        }}
                      >
                        {i18n._(
                          `You can renew your subscription any time before it expires to avoid
                          interruption of service.`
                        )}
                      </Typography>
                    )}
                  </Stack>
                  <FeatureList appMode={appMode} />
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
