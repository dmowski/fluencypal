"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { fullEnglishLanguageName, SupportedLanguage, supportedLanguages } from "@/common/lang";
import { getUrlStart } from "./getUrlStart";

const parseLangFromUrl = (pathname: string) => {
  const potentialLang = pathname?.split("/")[1].trim();
  const supportedLang = supportedLanguages.find((l) => l === potentialLang) || "en";
  return supportedLang;
};
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useLingui();

  const [locale, setLocale] = useState<SupportedLanguage>(parseLangFromUrl(pathname));
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  function handleChange(newLang: SupportedLanguage) {
    const sliceNumber = locale !== "en" ? 2 : pathname.startsWith("/en") ? 2 : 1;

    const pathNameWithoutLocale = pathname?.split("/")?.slice(sliceNumber) ?? [];
    const newPath = `${getUrlStart(newLang)}${pathNameWithoutLocale.join("/")}`;
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
        <InputLabel id="page-lang-label-selector">{i18n._(`Page language`)}</InputLabel>
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
