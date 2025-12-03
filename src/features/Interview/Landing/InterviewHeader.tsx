"use client";
import { HeaderUI } from "@/features/Header/HeaderUI";
import { HeaderLink } from "@/features/Header/types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { BadgeQuestionMark, Gem, Pickaxe, Send } from "lucide-react";

export interface HeaderProps {
  lang: SupportedLanguage;
  interviewId: string;
}

/** Interview Landing Header */
export function InterviewHeader({ lang, interviewId }: HeaderProps) {
  const page = "interview/" + interviewId;
  const pageUrl = getUrlStart(lang) + page;
  const { i18n } = useLingui();

  return (
    <HeaderUI
      transparentOnTop={true}
      lang={lang}
      links={[
        {
          title: i18n._("How it works"),
          icon: Pickaxe,
          href: page + "#how-it-works",
        },
        {
          title: i18n._("Contacts"),
          icon: Send,
          href: page + "#contacts",
        },
        {
          title: i18n._("Price"),
          icon: Gem,
          href: page + "#price",
        },

        {
          title: i18n._("FAQ"),
          icon: BadgeQuestionMark,
          href: page + "#faq",
        },
      ]}
      buttons={[
        {
          title: i18n._("Start Free Trial"),
          href: page + "#start-free-trial",
          isSolid: true,
        },
      ]}
      logoHref={pageUrl}
    />
  );
}
