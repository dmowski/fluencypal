"use client";

import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { useLingui } from "@lingui/react";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useUsage } from "../Usage/useUsage";
import { useEffect, useMemo, useState } from "react";
import { loadStripe, StripeElementLocale, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { SetupIntentRequest, SetupIntentResponse } from "@/app/api/payment/type";
import { useAuth } from "../Auth/useAuth";
import dayjs from "dayjs";
import { IconTextList } from "../Survey/IconTextList";
import { isTMA } from "@telegram-apps/sdk-react";
import { stripeLocaleMap, SupportedLanguage } from "../Lang/lang";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useAnalytics } from "../Analytics/useAnalytics";
import { InfoStep } from "../Survey/InfoStep";
import { InterviewQuizButton } from "../Goal/Quiz/InterviewQuizButton";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SetupForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const { i18n } = useLingui();
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
      if (result.error) setErrMsg(result.error.message ?? i18n._("Verification failed"));
      console.log("result onSubmit Card Verification", result);

      if (result.setupIntent?.status === "succeeded") {
        console.log("Card verification succeeded");
        setIsSuccess(true);
      }
      // If no error -> success path; rely on webhook to flip the flag.
      // Optionally start a short polling loop here to refresh settings.
      analytics.confirmGtag();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack sx={{ gap: "10px", height: "max-content" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 660,
            lineHeight: "1.2",
          }}
        >
          {i18n._("Confirm your card")}
        </Typography>
        <PaymentElement
          options={{
            terms: {
              card: "never",
            },
          }}
        />
        <Typography
          sx={{
            color: "#555",
            fontWeight: 500,
          }}
        >
          {i18n._(
            "FluencyPal will not charge your card without your explicit consent. A small temporary authorization hold may appear on your statement, which will be released by your bank within a few days."
          )}
        </Typography>

        {errMsg && (
          <Typography variant="caption" color="error">
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
              : i18n._("Verify card")
          }
          disabled={!stripe || !elements || submitting || isSuccess}
        />
      </Stack>
    </form>
  );
}
function VerifyCard({ clientSecret, lang }: { clientSecret: string; lang: SupportedLanguage }) {
  const locale: StripeElementLocale = stripeLocaleMap[lang];
  const options: StripeElementsOptions = useMemo(() => ({ clientSecret, locale }), [clientSecret]);

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

const createSetupIntentRequest = async (
  req: SetupIntentRequest,
  authToken: string
): Promise<SetupIntentResponse> => {
  const response = await fetch("/api/payment/createSetupIntent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error("Failed to create setup intent");
  }

  return response.json();
};

export const CardValidator = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const usage = useUsage();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isTg, setIsTg] = useState(false);

  useEffect(() => {
    const isTelegramApp = isTMA();
    setIsTg(isTelegramApp);
  }, []);

  const onStartValidation = async () => {
    setIsLoading(true);
    try {
      const authToken = await auth.getToken();
      const { clientSecret } = await createSetupIntentRequest({}, authToken);
      setClientSecret(clientSecret);
      setIsShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };
  if (isCreditCardConfirmed || isLoadingSettings || isTg) return <></>;
  const createdAtIso = settings.userSettings?.createdAtIso;
  const daysFromCreation = createdAtIso ? dayjs().diff(dayjs(createdAtIso), "day") : null;
  const isNewUser = !createdAtIso || (daysFromCreation !== null && daysFromCreation < 5);
  if (usage.isFullAccess && !isNewUser) return <></>;
  return (
    <CustomModal isOpen={true}>
      <Stack
        sx={{
          alignItems: "center",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            maxWidth: "720px",
            width: "100%",
            alignItems: "flex-start",
            gap: "30px",
            padding: "20px 20px",
          }}
        >
          {isLoading && <CircularProgress />}
          {isShowForm && clientSecret && <VerifyCard lang={lang} clientSecret={clientSecret} />}
          {!isShowForm && !isLoading && (
            <>
              <Stack
                sx={{
                  gap: "25px",
                }}
              >
                <Stack>
                  <Typography variant="h3">{i18n._("Credit Card Check")}</Typography>
                  <Typography variant="body2">
                    {i18n._("Please confirm your credit card to access all features.")}
                  </Typography>
                </Stack>
                <Stack>
                  <IconTextList
                    gap="10px"
                    listItems={[
                      {
                        iconName: "sparkles",
                        title: i18n._("You will get 3 days of full access for free"),
                      },
                      {
                        iconName: "piggy-bank",
                        title: i18n._("No automatic payment after the trial"),
                      },
                      {
                        iconName: "shield-check",
                        title: i18n._("No charge will be made"),
                      },
                    ]}
                  />
                </Stack>
              </Stack>

              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  color="info"
                  startIcon={<CreditCard />}
                  onClick={() => onStartValidation()}
                >
                  {i18n._("Confirm Credit Card")}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};

export const CardValidatorQuiz = ({
  lang,
  onNextStep,
}: {
  lang: SupportedLanguage;
  onNextStep: () => void;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isVerificationStarted, setIsVerificationStarted] = useState(false);

  const onStartValidation = async () => {
    setIsLoading(true);
    setIsVerificationStarted(true);
    try {
      const authToken = await auth.getToken();
      const { clientSecret } = await createSetupIntentRequest({}, authToken);
      setClientSecret(clientSecret);
      setIsShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCreditCardConfirmed && isVerificationStarted) {
      setTimeout(() => {
        onNextStep();
      }, 100);
    }
  }, [isCreditCardConfirmed]);

  if (isLoadingSettings) return null;

  if (isCreditCardConfirmed)
    return (
      <InfoStep
        title={i18n._("Credit Card Already Confirmed")}
        subTitle={i18n._(
          "Your credit card has already been confirmed. You can proceed to the next step."
        )}
        onClick={() => onNextStep()}
      />
    );

  if (!isShowForm && !isLoading) {
    return (
      <InfoStep
        title={i18n._("Unlock full interview preparation")}
        subTitle={i18n._(
          "Get 2 days of full access to all features. Practice real interviews, get AI feedback, and see your full analysis. We use a card to prevent abuse and give you uninterrupted access to all features."
        )}
        actionButtonTitle={i18n._("Continue to free access")}
        width={"700px"}
        listItems={[
          {
            iconName: "shield-check",
            title: i18n._("No charge during trial"),
            iconColor: "rgb(96, 165, 250)",
          },
          {
            iconName: "shield-check",
            title: i18n._("No automatic payment"),
            iconColor: "rgb(96, 165, 250)",
          },
        ]}
        onClick={onStartValidation}
        actionButtonEndIcon={<ArrowRight />}
      />
    );
  }
  return (
    <Stack
      sx={{
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          maxWidth: "720px",
          width: "100%",
          alignItems: "flex-start",
          gap: "30px",
          padding: "20px 20px",
        }}
      >
        {isLoading && <CircularProgress />}
        {isShowForm && clientSecret && <VerifyCard lang={lang} clientSecret={clientSecret} />}
      </Stack>
    </Stack>
  );
};
