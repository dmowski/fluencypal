import { HeaderComponentStatic } from "@/features/Header/HeaderComponentStatic";
import { HeaderButton, HeaderLink, HeaderUI } from "@/features/Header/HeaderUI";
import { SupportedLanguage } from "@/features/Lang/lang";
import { I18n } from "@lingui/core";
import { Suspense } from "react";

export interface HeaderProps {
  links: HeaderLink[];
  buttons: HeaderButton[];
  logoHref: string;
  lang: SupportedLanguage;
  i18n: I18n;
}

/** Interview Landing Header */
export const InterviewHeader = ({ lang, links, buttons, logoHref }: HeaderProps) => {
  return (
    <Suspense>
      <HeaderUI
        transparentOnTop={true}
        lang={lang}
        links={links}
        buttons={buttons}
        logoHref={logoHref}
      />
    </Suspense>
  );
};
