import { ReactNode, useEffect, useState } from "react";
import Google from "@mui/icons-material/Google";
import { Stack, TextField, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { ArrowLeft, ArrowRight, Check, Loader, Mail } from "lucide-react";
import { scrollTopFast } from "@/libs/scroll";
import { InfoStep } from "../Survey/InfoStep";
import { ListItem } from "../Survey/IconTextList";
import { getUrlStart } from "../Lang/getUrlStart";
import { useAuth } from "./useAuth";

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface AuthWallBasicProps {
  children: ReactNode;
  featuresTitle: string;
  featuresSubTitle: string;
  featuresList: ListItem[];
  authTitle: string;
  authSubTitle: string;
  authList: ListItem[];
  featuresImageUrl?: string;
  agreementImageUrl?: string;
  authImageUrl?: string;
  width?: string;
}

export const AuthWallBasic = ({
  children,
  featuresTitle,
  featuresSubTitle,
  featuresList,
  authTitle,
  authSubTitle,
  authList,
  featuresImageUrl,
  agreementImageUrl,
  authImageUrl,
  width,
}: AuthWallBasicProps) => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const isShowAuthWall = !auth.uid && !auth.loading;

  const [isValidEmailError, setIsValidEmailError] = useState(false);
  const [emailSignInError, setEmailSignInError] = useState("");
  const [isEmailSignInLoading, setIsEmailSignInLoading] = useState(false);

  const [email, setEmail] = useState("");

  const isValidEmailAddress = isValidEmail(email);

  useEffect(() => {
    if (isValidEmailError && isValidEmailAddress) {
      setIsValidEmailError(false);
    }
  }, [email, isValidEmailAddress, isValidEmailError]);

  const steps = ["features", "agreement", "auth", "email", "email-send"] as const;
  const [step, setStep] = useState<(typeof steps)[number]>(steps[0]);

  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const signInWithEmail = async () => {
    if (!isValidEmailAddress) {
      setIsValidEmailError(true);
      return;
    }
    setEmailSignInError("");
    setIsEmailSignInLoading(true);
    const signInResult = await auth.signInWithEmail(email);
    setIsEmailSignInLoading(false);
    if (!signInResult.isDone) {
      setEmailSignInError(signInResult.error || "Unknown error");
      return;
    }

    setStep("email-send");
  };

  useEffect(() => {
    if (isShowAuthWall) {
      const isWindow = typeof window !== "undefined";
      if (isWindow) {
        scrollTopFast();
      }
    }
  }, [isShowAuthWall]);

  if (!isShowAuthWall) {
    return children;
  }

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          maxWidth: width || "600px",
          width: "100%",
        }}
      >
        {step === "email-send" && (
          <InfoStep
            title={i18n._("Check your email")}
            subTitle={i18n._(
              "We sent a sign-in link to your email. Please check your inbox and click the link to sign in."
            )}
            subComponent={
              <Stack
                sx={{
                  paddingTop: "20px",
                }}
              >
                <Typography>
                  {i18n._("Invite Link Sent to:")} <b>{email}</b>
                </Typography>

                <Typography sx={{}}>
                  {i18n._("Check your spam folder if you don't see the email.")}
                </Typography>
              </Stack>
            }
            onClick={() => setStep("email")}
            actionButtonTitle={i18n._("Send email again")}
            actionButtonEndIcon={<Mail />}
            width={width}
          />
        )}

        {step === "email" && (
          <InfoStep
            actionButtonTitle={
              isEmailSignInLoading ? i18n._("Sending...") : i18n._("Send me sign-in link")
            }
            title={i18n._("Sign in with email")}
            subTitle={i18n._("Enter your email to get a sign-in link")}
            subComponent={
              <Stack
                sx={{
                  paddingTop: "20px",
                }}
              >
                <TextField
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  label={i18n._("Email")}
                  type="email"
                  error={isValidEmailError || emailSignInError !== ""}
                  helperText={
                    isValidEmailError
                      ? i18n._("Please enter a valid email address")
                      : emailSignInError
                  }
                />
              </Stack>
            }
            onClick={signInWithEmail}
            disabled={isValidEmailError || isEmailSignInLoading}
            width={width}
          />
        )}

        {step === "features" && (
          <InfoStep
            imageUrl={featuresImageUrl}
            actionButtonTitle={i18n._("Next")}
            title={featuresTitle}
            subTitle={featuresSubTitle}
            listItems={featuresList}
            onClick={nextStep}
            width={width}
          />
        )}

        {step === "agreement" && (
          <InfoStep
            actionButtonTitle={i18n._("I agree")}
            actionButtonEndIcon={<Check />}
            imageUrl={agreementImageUrl}
            width={width}
            title={i18n._("We will speak freely")}
            subTitle={i18n._("So we need your agreement with that")}
            listItems={[
              {
                title: i18n._("We process your voice using AI"),
                iconName: "shield-check",
              },
              {
                title: i18n._("Your transcripts are securely stored in our service"),
                iconName: "shield-check",
              },
              {
                title: i18n._("You can delete your personal data anytime"),
                iconName: "shield-check",
              },
              {
                title: i18n._("We use cookies to enhance your experience"),
                iconName: "cookie",
              },
              {
                title: i18n._("Privacy Policy"),
                iconName: "scroll-text",
                href: `${getUrlStart("en")}privacy`,
              },
              {
                title: i18n._("Terms of Use"),
                iconName: "pencil-ruler",
                href: `${getUrlStart("en")}terms`,
              },
            ]}
            onClick={nextStep}
          />
        )}

        {step === "auth" && (
          <InfoStep
            imageUrl={authImageUrl}
            width={width}
            title={authTitle}
            subTitle={authSubTitle}
            actionButtonTitle={i18n._("Sign in with Google")}
            actionButtonStartIcon={<Google />}
            listItems={authList}
            onClick={() => auth.signInWithGoogle()}
            secondButtonTitle={i18n._("Sign in with email")}
            onSecondButtonClick={nextStep}
            secondButtonStartIcon={<Mail />}
            secondButtonEndIcon={<ArrowRight />}
          />
        )}
      </Stack>
    </Stack>
  );
};
