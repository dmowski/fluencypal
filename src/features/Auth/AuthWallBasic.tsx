import { ReactNode, useEffect, useState } from "react";
import Google from "@mui/icons-material/Google";
import { Stack } from "@mui/material";
import { useLingui } from "@lingui/react";
import { Check } from "lucide-react";
import { scrollTopFast } from "@/libs/scroll";
import { InfoStep } from "../Survey/InfoStep";
import { ListItem } from "../Survey/IconTextList";
import { getUrlStart } from "../Lang/getUrlStart";
import { useAuth } from "./useAuth";

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

  const steps = ["features", "agreement", "auth"] as const;
  const [step, setStep] = useState<(typeof steps)[number]>(steps[0]);

  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }

    if (step === "auth") {
      auth.signInWithGoogle();
    }
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
        {step === "features" && (
          <InfoStep
            imageUrl={featuresImageUrl}
            actionButtonTitle={i18n._("Next")}
            message={featuresTitle}
            subMessage={featuresSubTitle}
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
            message={i18n._("We will speak freely")}
            subMessage={i18n._("So we need your agreement with that")}
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
            message={authTitle}
            subMessage={authSubTitle}
            actionButtonTitle={i18n._("Sign in with Google")}
            actionButtonStartIcon={<Google />}
            listItems={authList}
            onClick={nextStep}
          />
        )}
      </Stack>
    </Stack>
  );
};
