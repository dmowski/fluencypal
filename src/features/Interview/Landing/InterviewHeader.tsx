"use client";
import { HeaderLink, HeaderUI } from "@/features/Header/HeaderUI";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { Pickaxe } from "lucide-react";

export interface HeaderProps {
  lang: SupportedLanguage;
  interviewId: string;
}

/** Interview Landing Header */
export function InterviewHeader({ lang, interviewId }: HeaderProps) {
  const page = "interview/" + interviewId;
  const pageUrl = getUrlStart(lang) + page;
  const { i18n } = useLingui();

  const links: HeaderLink[] = [
    {
      title: i18n._("How it works"),
      icon: Pickaxe,
      href: page + "#how-it-works",
    },
  ];

  return (
    <HeaderUI transparentOnTop={true} lang={lang} links={links} buttons={[]} logoHref={pageUrl} />
  );
}
