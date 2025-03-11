"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
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
    <Stack
      sx={{
        "@media (max-width: 600px)": {
          display: "none",
        },
      }}
    >
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="page-lang-label-selector">Page language</InputLabel>
        <Select
          value={supportedLang}
          labelId="page-lang-label-selector"
          id="page-lang-label"
          label="UI Language"
          sx={{ color: "white" }}
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
    </Stack>
  );
}
