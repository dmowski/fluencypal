"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";

type LOCALES = "en" | "ru" | "es";

export function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useLingui();
  const pathname = usePathname();

  const languages: Record<LOCALES, string> = {
    en: `English`,
    ru: `Russian`,
    es: `Spanish`,
  };

  const [locale, setLocale] = useState<LOCALES>(pathname?.split("/")[1] as LOCALES);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as LOCALES;

    const pathNameWithoutLocale = pathname?.split("/")?.slice(2) ?? [];
    const newPath = `/${locale}/${pathNameWithoutLocale.join("/")}`;

    setLocale(locale);
    router.push(newPath);
  }

  return (
    <select value={locale} onChange={handleChange} className="p-2">
      {Object.keys(languages).map((locale) => {
        return (
          <option value={locale} key={locale}>
            {i18n._(languages[locale as keyof typeof languages])}
          </option>
        );
      })}
    </select>
  );
}
