import { ReactNode } from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  BetweenHorizontalStart,
  Bird,
  BookType,
  GraduationCap,
  Lightbulb,
  PencilRuler,
  ScrollText,
  Sparkles,
  Speech,
  UsersRound,
} from "lucide-react";
import { AuthWallBasic } from "./AuthWallBasic";
import { getUrlStart } from "../Lang/getUrlStart";

export const AuthWall = ({
  children,
  signInTitle,
  singInSubTitle,
  featuresTitle,
  featuresSubTitle,
}: {
  children: ReactNode;
  signInTitle?: ReactNode;
  singInSubTitle?: ReactNode;
  featuresTitle?: ReactNode;
  featuresSubTitle?: ReactNode;
}) => {
  const { i18n } = useLingui();
  return (
    <AuthWallBasic
      featuresTitle={featuresTitle || <Trans>What you get with FluencyPal</Trans>}
      featuresSubTitle={featuresSubTitle || <Trans>Your AI speaking partner</Trans>}
      featuresList={[
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
      authTitle={signInTitle || <Trans>Let's create an account</Trans>}
      authSubTitle={singInSubTitle || <Trans>So you can keep your progress</Trans>}
      authList={[
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
    >
      {children}
    </AuthWallBasic>
  );
};
