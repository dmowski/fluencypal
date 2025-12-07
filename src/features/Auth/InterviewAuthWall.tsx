import { ReactNode } from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  BetweenHorizontalStart,
  Bird,
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

export const InterviewAuthWall = ({ children }: { children: ReactNode }) => {
  const { i18n } = useLingui();
  return (
    <AuthWallBasic
      featuresTitle={<Trans>What you get with FluencyPal</Trans>}
      featuresSubTitle={<Trans>Your job interview preparation partner</Trans>}
      featuresList={[
        {
          title: i18n._("Daily interview without fear of judgment"),
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
          title: i18n._("Hints to boost your confidence"),
          icon: GraduationCap,
        },
        {
          title: i18n._("Practice STAR method answers"),
          icon: UsersRound,
        },
      ]}
      featuresImageUrl="https://i.imgur.com/KJmVRrl.jpeg"
      agreementImageUrl="https://cdn-useast1.kapwing.com/static/templates/epic-handshake-meme-template-regular-5ac4b47b.webp"
      authImageUrl="https://cdn-icons-png.flaticon.com/512/8345/8345328.png"
      authTitle={<Trans>Let's create an account</Trans>}
      authSubTitle={<Trans>So you can keep your progress</Trans>}
      authList={[
        {
          title: i18n._("Credit card is required for verification only"),
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
