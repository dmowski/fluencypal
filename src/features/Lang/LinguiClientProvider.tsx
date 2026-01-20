"use client";

import { I18nProvider } from "@lingui/react";
import { type Messages, setupI18n } from "@lingui/core";
import { useState } from "react";
import { supportedLanguages } from "@/features/Lang/lang";
import { initDayJsLocale } from "./dayJsLang";

type Props = {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: Messages;
};

export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
}: Props) {
  const supportedLang =
    supportedLanguages.find((l) => l === initialLocale) || "en";
  const [i18n] = useState(() => {
    initDayJsLocale(supportedLang);
    return setupI18n({
      locale: supportedLang,
      messages: { [supportedLang]: initialMessages },
    });
  });
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
