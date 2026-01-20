import { ReactNode } from "react";
import { useLingui } from "@lingui/react";
import { AuthWallBasic } from "./AuthWallBasic";
import { getUrlStart } from "../Lang/getUrlStart";

export const InterviewAuthWall = ({
  children,
  width,
}: {
  children: ReactNode;
  width?: string;
}) => {
  const { i18n } = useLingui();
  return (
    <AuthWallBasic
      width={width}
      featuresTitle={i18n._("What you get with FluencyPal")}
      featuresSubTitle={i18n._("Your job interview preparation partner")}
      featuresList={[
        {
          title: i18n._("Daily interview without fear of judgment"),
          iconName: "speech",
        },
        {
          title: i18n._("Corrections when you get stuck"),
          iconName: "sparkles",
        },
        {
          title: i18n._("Personalized plan tailored to your goals"),
          iconName: "lightbulb",
        },
        {
          title: i18n._("Hints to boost your confidence"),
          iconName: "graduation-cap",
        },
        {
          title: i18n._("Practice STAR method answers"),
          iconName: "users-round",
        },
      ]}
      authTitle={i18n._("Let's create an account")}
      authSubTitle={i18n._("So you can keep your progress")}
      authList={[
        {
          title: i18n._("No ads, no spam"),
          iconName: "between-horizontal-start",
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
    >
      {children}
    </AuthWallBasic>
  );
};
