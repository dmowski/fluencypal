import { ReactNode } from "react";
import { useLingui } from "@lingui/react";
import { AuthWallBasic } from "./AuthWallBasic";
import { getUrlStart } from "../Lang/getUrlStart";

export const AuthWall = ({
  children,
  signInTitle,
  singInSubTitle,
  featuresTitle,
  featuresSubTitle,
  width,
}: {
  children: ReactNode;
  signInTitle?: string;
  singInSubTitle?: string;
  featuresTitle?: string;
  featuresSubTitle?: string;
  width?: string;
}) => {
  const { i18n } = useLingui();
  return (
    <AuthWallBasic
      width={width}
      featuresTitle={featuresTitle || i18n._("What you get with FluencyPal")}
      featuresSubTitle={featuresSubTitle || i18n._("Your AI speaking partner")}
      featuresList={[
        {
          title: i18n._("Daily conversations without fear of judgment"),
          iconName: "speech",
        },
        {
          title: i18n._("Corrections when you get stuck"),
          iconName: "sparkles",
        },
        {
          title: i18n._("Grammar corrections to boost your confidence"),
          iconName: "graduation-cap",
        },
        {
          title: i18n._("Community support to keep you motivated"),
          iconName: "users-round",
        },
      ]}
      authTitle={signInTitle || i18n._("Let's create an account")}
      authSubTitle={singInSubTitle || i18n._("So you can keep your progress")}
      authList={[
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
