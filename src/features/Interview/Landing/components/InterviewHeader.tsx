"use client";
import { HeaderUI } from "@/features/Header/HeaderUI";
import { HeaderLink } from "@/features/Header/types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { BadgeQuestionMark, Gem, Pickaxe, Send } from "lucide-react";

export interface HeaderProps {
  lang: SupportedLanguage;
  startTrialHref: string;
  pageUrl: string;
}

/** Interview Landing Header */
export function InterviewHeader({ lang, startTrialHref, pageUrl }: HeaderProps) {
  const { i18n } = useLingui();

  return (
    <HeaderUI
      transparentOnTop={true}
      lang={lang}
      links={[
        {
          title: i18n._("How it Works"),
          icon: Pickaxe,
          href: pageUrl + "#steps",
        },
        {
          title: i18n._("Price"),
          icon: Gem,
          href: pageUrl + "#price",
        },

        {
          title: i18n._("FAQ"),
          icon: BadgeQuestionMark,
          href: pageUrl + "#faq",
        },
      ]}
      buttons={[
        {
          title: i18n._("Start Free Trial"),
          href: startTrialHref,
          isSolid: true,
        },
      ]}
      logoHref={pageUrl}
    />
  );
}
