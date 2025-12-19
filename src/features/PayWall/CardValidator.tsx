"use client";

import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useMemo, useState } from "react";
import { loadStripe, StripeElementLocale, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useAuth } from "../Auth/useAuth";
import { stripeLocaleMap, SupportedLanguage } from "../Lang/lang";
import { useAnalytics } from "../Analytics/useAnalytics";
import { InterviewQuizButton } from "../Goal/Quiz/InterviewQuizButton";
import { sendFeedbackMessageRequest } from "@/app/api/telegram/sendFeedbackMessageRequest";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SetupForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const { i18n } = useLingui();
  const auth = useAuth();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const analytics = useAnalytics();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrMsg(null);
    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin + window.location.pathname}`,
        },
      });
      if (result.error) {
        setErrMsg(result.error.message ?? i18n._("Verification failed"));
      }
      console.log("result onSubmit Card Verification", result);

      if (result.setupIntent?.status === "succeeded") {
        console.log("Card verification succeeded");
        setIsSuccess(true);
        // If no error -> success path; rely on webhook to flip the flag.
        // Optionally start a short polling loop here to refresh settings.
        analytics.confirmGtag();

        await sendFeedbackMessageRequest(
          {
            message:
              "✅ Card verified via SetupIntent in client for user: " +
              (auth.userInfo?.email || auth.uid),
          },
          await auth.getToken()
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack sx={{ gap: "20px", height: "max-content" }}>
        <Stack>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 660,
              lineHeight: "1.2",
            }}
          >
            {i18n._("Confirm your payment method")}
          </Typography>
          <Typography sx={{}}>
            {i18n._("FluencyPal won’t charge you during the trial.")}
            <br />
            {i18n._(
              "Your card is used only to activate secure access and will not be billed unless you decide to continue."
            )}
          </Typography>
        </Stack>
        <Stack>
          <PaymentElement
            options={{
              terms: {
                card: "never",
              },
            }}
          />

          <Typography variant="caption" sx={{ paddingTop: "5px", opacity: 0.9 }}>
            {i18n._(
              "A small temporary authorization may appear on your statement and will be released automatically by your bank."
            )}{" "}
            {i18n._("By continuing, you agree to our")}{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {i18n._("Terms of Service")}
            </a>{" "}
            {i18n._("and")}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {i18n._("Privacy Policy")}
            </a>
            .
          </Typography>
        </Stack>

        {errMsg && (
          <Typography variant="body2" color="error">
            {errMsg}
          </Typography>
        )}

        <InterviewQuizButton
          type="submit"
          color={"primary"}
          title={
            submitting
              ? i18n._("Verifying...")
              : isSuccess
              ? i18n._("Card verified. Loading...")
              : i18n._("Continue")
          }
          disabled={!stripe || !elements || submitting || isSuccess}
        />
      </Stack>
    </form>
  );
}

export function VerifyCard({
  clientSecret,
  lang,
}: {
  clientSecret: string;
  lang: SupportedLanguage;
}) {
  const locale: StripeElementLocale = stripeLocaleMap[lang];
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      locale,
      appearance: {
        theme: "night",
        variables: {
          //colorPrimary: "#fff",
          //colorBackground: "#171717",
          //colorText: "#ffffff",
          //colorDanger: "#cb4b57",
          //fontFamily: "system-ui, sans-serif",
          //spacingUnit: "4px",
          //borderRadius: "8px",
          //gridRowSpacing: "30px",
        },
      },
    }),
    [clientSecret]
  );

  if (!clientSecret) return null;
  return (
    <Stack sx={{ width: "100%" }}>
      <Elements
        key={clientSecret} // ensures fresh mount on new secret
        options={options}
        stripe={stripePromise}
      >
        <SetupForm clientSecret={clientSecret} />
      </Elements>
    </Stack>
  );
}
