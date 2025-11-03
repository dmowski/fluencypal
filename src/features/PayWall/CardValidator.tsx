import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { Trans } from "@lingui/react/macro";
import { CreditCard } from "lucide-react";
import { useUsage } from "../Usage/useUsage";
import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { SetupIntentRequest, SetupIntentResponse } from "@/app/api/payment/type";
import { useAuth } from "../Auth/useAuth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
function SetupForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrMsg(null);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin + window.location.pathname}`,
        },
      });
      if (error) setErrMsg(error.message ?? "Verification failed");
      // If no error -> success path; rely on webhook to flip the flag.
      // Optionally start a short polling loop here to refresh settings.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack sx={{ gap: "10px" }}>
        <PaymentElement />
        <Button variant="contained" type="submit" disabled={!stripe || !elements || submitting}>
          {submitting ? <CircularProgress size={18} /> : "Verify card"}
        </Button>
        {errMsg && (
          <Typography variant="caption" color="error">
            {errMsg}
          </Typography>
        )}
      </Stack>
    </form>
  );
}
function VerifyCard({ clientSecret }: { clientSecret: string }) {
  const options = useMemo(() => ({ clientSecret /*, locale: 'en' */ }), [clientSecret]);
  if (!clientSecret) return null;
  return (
    <Stack sx={{ backgroundColor: "#fff", width: "100%", p: "20px", borderRadius: "10px" }}>
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

export const CardValidator = () => {
  const settings = useSettings();
  const usage = useUsage();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const isDev = settings.userSettings?.email.includes("dmowski");

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

  if (isLoadingSettings || isCreditCardConfirmed || usage.isFullAccess || !isDev) return <></>;
  return (
    <Stack
      sx={{
        position: "fixed",
        backgroundColor: "rgba(12, 12, 12, 0.6)",
        backdropFilter: "blur(32px)",
        top: "0px",
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        alignItems: "center",
        justifyContent: "center",
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

        {isShowForm && clientSecret && <VerifyCard clientSecret={clientSecret} />}

        {!isShowForm && !isLoading && (
          <>
            <Stack
              sx={{
                gap: "5px",
              }}
            >
              <Typography variant="h3">
                <Trans>Credit Card Confirmation Required</Trans>
              </Typography>
              <Typography variant="body2">
                <Trans>
                  Your credit card is not confirmed. Please confirm your credit card to access all
                  features.
                </Trans>
              </Typography>
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
                startIcon={<CreditCard />}
                color="primary"
                onClick={() => {
                  onStartValidation();
                }}
              >
                <Trans>Confirm Credit Card</Trans>
              </Button>

              <Typography variant="caption">No charge will be made</Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
};
