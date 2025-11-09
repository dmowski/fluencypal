import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useLingui } from "@lingui/react";
import { scrollTopFast } from "@/libs/scroll";
import { Stack, Typography } from "@mui/material";
import { Trans } from "@lingui/react/macro";
import {
  BetweenHorizontalStart,
  Bird,
  BookType,
  Check,
  Cookie,
  GraduationCap,
  Lightbulb,
  PencilRuler,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Speech,
  UsersRound,
} from "lucide-react";
import { getUrlStart } from "../Lang/getUrlStart";
import Google from "@mui/icons-material/Google";
import { InfoStep } from "../Survey/InfoStep";
import { IconTextList } from "../Survey/IconTextList";

export const AuthWall = ({
  children,
  signInTitle,
  singInSubTitle,
  featuresTitle,
  featuresSubTitle,
}: {
  children: ReactNode;
  signInTitle?: string;
  singInSubTitle?: string;
  featuresTitle?: string;
  featuresSubTitle?: string;
}) => {
  const auth = useAuth();
  const { i18n } = useLingui();

  const isShowAuthWall = !auth.uid && !auth.loading;

  const steps = ["features", "agreement", "auth"];
  const [step, setStep] = useState(steps[0]);
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
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
          "--content-max-width": "380px",
          "--content-min-height": "350px",
        }}
      >
        {step === "features" && (
          <InfoStep
            imageUrl="/avatar/bot2.webp"
            actionButtonTitle={i18n._("Next")}
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack sx={{}}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    {featuresTitle ? featuresTitle : <Trans>What you get with FluencyPal</Trans>}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {featuresSubTitle ? featuresSubTitle : <Trans>Your AI speaking partner</Trans>}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: "max-content",
                    minWidth: "230px",
                    maxWidth: "100%",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("Daily conversations without fear of judgment"),
                        icon: Speech,
                      },
                      {
                        title: i18n._("Corrections when you get stuck"),
                        icon: Sparkles,
                      },

                      {
                        title: i18n._("Personalized plan tailored to your goals"),
                        icon: Lightbulb,
                      },

                      {
                        title: i18n._("Grammar corrections to boost your confidence"),
                        icon: GraduationCap,
                      },
                      {
                        title: i18n._("Learn useful words so you never go blank mid-sentence"),
                        icon: BookType,
                      },

                      {
                        title: i18n._("Practice real-life situations in advance"),
                        icon: UsersRound,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}
        {step === "agreement" && (
          <InfoStep
            actionButtonTitle={i18n._("I agree")}
            actionButtonEndIcon={<Check />}
            imageUrl="/avatar/bot1.png"
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack sx={{}}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    <Trans>We will speak freely</Trans>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    <Trans>So we need your agreement with that</Trans>
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    minWidth: "230px",
                    width: "100%",
                    gap: "10px",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("We process your voice using AI"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("Your transcripts are securely stored in our service"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("You can delete your personal data anytime"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("We use cookies to enhance your experience"),
                        icon: Cookie,
                      },

                      {
                        title: i18n._("Privacy Policy"),
                        icon: ScrollText,
                        href: `${getUrlStart("en")}privacy`,
                      },

                      {
                        title: i18n._("Terms of Use"),
                        icon: PencilRuler,
                        href: `${getUrlStart("en")}terms`,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}

        {step === "auth" && (
          <InfoStep
            imageUrl="/avatar/map.webp"
            actionButtonTitle={i18n._("Sign in with Google")}
            actionButtonStartIcon={<Google />}
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    {signInTitle ? signInTitle : <Trans>Let's create an account</Trans>}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {singInSubTitle ? singInSubTitle : <Trans>So you can keep your progress</Trans>}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: "100%",
                    minWidth: "230px",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("Credit card is required"),
                        icon: Bird,
                      },

                      {
                        title: i18n._("No ads, no spam"),
                        icon: BetweenHorizontalStart,
                      },

                      {
                        title: i18n._("Privacy Policy"),
                        icon: ScrollText,
                        href: `${getUrlStart("en")}privacy`,
                      },

                      {
                        title: i18n._("Terms of Use"),
                        icon: PencilRuler,
                        href: `${getUrlStart("en")}terms`,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}
      </Stack>
    </Stack>
  );
};
