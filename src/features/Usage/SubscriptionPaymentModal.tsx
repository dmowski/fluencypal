import { Button, Checkbox, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useUsage } from "./useUsage";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { createStripeCheckout } from "./createStripeCheckout";

import { usePathname } from "next/navigation";
import { supportedLanguages } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useCurrency } from "../User/useCurrency";
import { buttonStyle } from "../Landing/landingSettings";
import { PRICE_PER_MONTH_USD } from "@/common/subscription";
import { sentPaymentTgMessage } from "./sentTgMessage";
import dayjs from "dayjs";
import { ContactList } from "../Landing/Contact/ContactList";
import { FeatureList } from "../Landing/Price/FeatureList";

export const SubscriptionPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();

  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);

  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const pricePerMonthInCurrency = Math.round(currency.rate * PRICE_PER_MONTH_USD * 10) / 10;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = () => {
    containerRef.current?.parentElement?.scrollTo(0, 0);
  };

  const [isRedirecting, setIsRedirecting] = useState(false);
  const clickOnConfirmRequest = async () => {
    try {
      const token = await auth.getToken();
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
        token: token,
      });
      if (!checkoutInfo.sessionUrl) {
        console.log("checkoutInfo", checkoutInfo);
        setIsRedirecting(false);
        notifications.show("Error creating payment session", {
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
      notifications.show("Error during payment process", {
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
    scrollTop();
    setIsShowConfirmPayments(true);

    sentPaymentTgMessage({
      message: "Event: Press on Pay Button",
      email: auth?.userInfo?.email || "unknownEmail",
      token: await auth.getToken(),
    });
  };

  const isActiveSubscription = usage.isFullAccess;
  const isTrial = !usage.paymentLogs?.find((log) => log.type === "user" || "subscription-full-v1");
  const activeTill = usage.activeSubscriptionTill
    ? `${dayjs(usage.activeSubscriptionTill).format("DD MMM")} (in ${dayjs(usage.activeSubscriptionTill).fromNow(true)})`
    : null;

  if (!usage.isShowPaymentModal) return null;
  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      onClose={() => {
        if (isShowConfirmPayments) {
          setIsShowConfirmPayments(false);
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
        {isShowConfirmPayments ? (
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
                disabled={isRedirecting}
                size="large"
                type="submit"
              >
                Pay and Subscribe
              </Button>
            </Stack>
            <FeatureList />
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
                  {isActiveSubscription && isTrial && activeTill && (
                    <>
                      Your trial ended until <b>{activeTill}</b>
                    </>
                  )}

                  {isActiveSubscription && !isTrial && activeTill && (
                    <>
                      Your subscription is active until <b>{activeTill || "-"}</b>
                    </>
                  )}

                  {isActiveSubscription && !isTrial && !activeTill && (
                    <>
                      You have <b>{usage.balanceHours.toFixed(1)}</b> AI hours left in your balance.
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
                    <Typography variant="h6">Full Access</Typography>
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
                          Active
                        </Typography>
                      </Stack>
                    )}
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
                    disabled={!!activeTill}
                    sx={{
                      ...buttonStyle,
                      padding: "10px 70px",
                      color: activeTill ? "#c2c2c2" : "#000",
                      backgroundColor: activeTill ? "rgba(255, 255, 255, 0.1)" : "#05acff",
                    }}
                    variant="contained"
                    size="large"
                    onClick={showConfirmPage}
                  >
                    {activeTill ? i18n._(`Active`) : i18n._(`Get Full Access`)}
                  </Button>

                  <FeatureList />
                </Stack>
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                  gap: "10px",
                  maxWidth: "350px",
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
