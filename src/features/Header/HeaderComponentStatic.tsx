"use client";
import { BookMarked, Gem, MessageCircleQuestion, Rss } from "lucide-react";
import { SupportedLanguage } from "@/features/Lang/lang";
import { HeaderUI } from "./HeaderUI";

export interface HeaderStaticProps {
  lang: SupportedLanguage;
  practiceTitle: string;
  rolePlayTitle: string;
  contactsTitle: string;
  priceTitle: string;
  signInTitle: string;
  balanceTitle: string;
  needHelpTitle: string;
  logOutTitle: string;
  blogTitle: string;
  transparentOnTop?: boolean;
}
export function HeaderComponentStatic({
  lang,
  rolePlayTitle,
  contactsTitle,
  priceTitle,
  signInTitle,
  blogTitle,
  transparentOnTop,
}: HeaderStaticProps) {
  return (
    <HeaderUI
      transparentOnTop={transparentOnTop}
      lang={lang}
      links={[
        {
          title: rolePlayTitle,
          href: "scenarios",
          icon: BookMarked,
        },
        {
          title: contactsTitle,
          href: "contacts",
          icon: MessageCircleQuestion,
        },
        {
          title: blogTitle,
          href: "blog",
          icon: Rss,
        },
        {
          title: priceTitle,
          href: "pricing",
          icon: Gem,
        },
      ]}
      buttons={[
        {
          title: signInTitle,
          href: "practice",
          isSolid: true,
        },
      ]}
      logoHref={"/"}
    />
  );
}
