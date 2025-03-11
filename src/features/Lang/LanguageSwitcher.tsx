"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { FormControl, MenuItem, Select } from "@mui/material";
import { fullEnglishLanguageName, SupportedLanguage, supportedLanguages } from "@/common/lang";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const [locale, setLocale] = useState<SupportedLanguage>(
    pathname?.split("/")[1] as SupportedLanguage
  );
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  function handleChange(newLang: SupportedLanguage) {
    const pathNameWithoutLocale = pathname?.split("/")?.slice(2) ?? [];
    const newPath = `/${newLang}/${pathNameWithoutLocale.join("/")}`;
    setLocale(locale);
    router.push(newPath);
  }

  return (
    <FormControl sx={{ minWidth: 120 }} size="small">
      <Select
        value={supportedLang}
        label=""
        onChange={(newLangEvent) => {
          const newLang = newLangEvent.target.value;
          const newSupportedLang = supportedLanguages.find((l: string) => l === newLang) || "en";
          handleChange(newSupportedLang);
        }}
      >
        {supportedLanguages.map((lang) => {
          return (
            <MenuItem key={lang} value={lang}>
              {fullEnglishLanguageName[lang]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
