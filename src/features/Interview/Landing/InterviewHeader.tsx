import { HeaderComponentStatic } from "@/features/Header/HeaderComponentStatic";
import { SupportedLanguage } from "@/features/Lang/lang";
import { I18n } from "@lingui/core";
import { Suspense } from "react";

export interface HeaderLink {
  title: string;
  href: string;
}

export interface HeaderButtons {
  title: string;
  href: string;
  isSolid: boolean;
}

export interface HeaderProps {
  logoHref: string;
  links: HeaderLink[];
  buttons: HeaderButtons[];
  lang: SupportedLanguage;
  i18n: I18n;
}

/** Interview Landing Header */
export const InterviewHeader = ({ lang, i18n }: HeaderProps) => {
  return (
    <Suspense>
      <HeaderComponentStatic
        lang={lang}
        practiceTitle={i18n._(`Practice`)}
        rolePlayTitle={i18n._(`Role-Plays`)}
        contactsTitle={i18n._(`Contacts`)}
        priceTitle={i18n._(`Price`)}
        signInTitle={i18n._(`Sign In`)}
        balanceTitle={i18n._(`Balance`)}
        needHelpTitle={i18n._(`Need Help?`)}
        logOutTitle={i18n._(`Log Out`)}
        blogTitle={i18n._(`Blog`)}
        transparentOnTop={true}
      />
    </Suspense>
  );
};
