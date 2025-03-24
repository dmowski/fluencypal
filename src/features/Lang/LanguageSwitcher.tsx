"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { Button, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  fullEnglishLanguageName,
  fullLanguageName,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
} from "@/common/lang";
import { getUrlStart } from "./getUrlStart";
import { Globe, GraduationCap, Rabbit } from "lucide-react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useSettings } from "../Settings/useSettings";
import { ClickCard } from "../Dashboard/ClickCard";
import { useAuth } from "../Auth/useAuth";

const LanguageCard = ({
  lang,
  onClick,
  selected,
}: {
  lang: SupportedLanguage;
  onClick: () => void;
  selected: boolean;
}) => {
  return (
    <ClickCard
      isDone={selected}
      title={fullEnglishLanguageName[lang]}
      subTitle={fullLanguageName[lang]}
      onStart={onClick}
    />
  );
};

const availableOnLabelMap: Record<SupportedLanguage, string> = {
  ru: "Доступно на русском",
  en: "Available in English",
  es: "Disponible en español",
  fr: "Disponible en français",
  de: "Verfügbar auf Deutsch",
  it: "Disponibile in italiano",
  pt: "Disponível em português",
  ja: "日本語で利用可能",
  ko: "한국어로 이용 가능",
  zh: "中文可用",
  ar: "متوفر باللغة العربية",
  tr: "Türkçe mevcut",
  pl: "Dostępne w języku polskim",
  uk: "Доступно на українській",
  id: "Tersedia dalam bahasa Indonesia",
  ms: "Tersedia dalam Bahasa Melayu",
  th: "มีให้บริการในภาษาไทย",
  vi: "Có sẵn bằng tiếng Việt",
  da: "Tilgængelig på dansk",
  nb: "Tilgjengelig på norsk",
  sv: "Tillgänglig på svenska",
};

const parseLangFromUrl = (pathname: string) => {
  const potentialLang = pathname?.split("/")[1].trim();
  const supportedLang = supportedLanguages.find((l) => l === potentialLang) || "en";
  return supportedLang;
};
export function LanguageSwitcher() {
  const router = useRouter();
  const auth = useAuth();
  const pathname = usePathname();

  const settings = useSettings();
  const { i18n } = useLingui();
  const [activeTab, setActiveTab] = useState<"page" | "learn">("page");
  const [isShowModal, setIsShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [locale, setLocale] = useState<SupportedLanguage>(parseLangFromUrl(pathname));
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  async function handleChange(newLang: SupportedLanguage) {
    if (activeTab === "page") {
      setIsLoading(true);
      const sliceNumber = locale !== "en" ? 2 : pathname.startsWith("/en") ? 2 : 1;

      const pathNameWithoutLocale = pathname?.split("/")?.slice(sliceNumber) ?? [];

      const query = new URLSearchParams(window.location.search).toString();

      const newPath = `${getUrlStart(newLang)}${pathNameWithoutLocale.join("/")}${
        query ? `?${query}` : ""
      }`;
      router.push(newPath);

      setLocale(locale);

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } else {
      settings.setLanguage(newLang);
    }
  }

  const selectedLangCode = activeTab === "page" ? supportedLang : settings.languageCode;

  const systemLangs = getUserLangCode();
  const otherLangs = supportedLanguages.filter((lang) => !systemLangs.includes(lang));

  const isCurrentPageLangIsSystem = systemLangs.length && systemLangs.includes(supportedLang);
  const supportedLangCodeLabel =
    systemLangs.length && !isCurrentPageLangIsSystem && !auth.isAuthorized
      ? availableOnLabelMap[systemLangs[0]]
      : "";

  return (
    <Stack sx={{}}>
      {supportedLangCodeLabel ? (
        <Button
          onClick={() => setIsShowModal(!isShowModal)}
          sx={{
            fontSize: "0.8rem",
            textAlign: "end",
            lineHeight: "1.2",

            textTransform: "none",
            color: "#fff",
            fontWeight: 400,
          }}
          endIcon={
            <Globe
              style={{
                opacity: 0.8,
              }}
            />
          }
        >
          {supportedLangCodeLabel}
        </Button>
      ) : (
        <IconButton
          onClick={() => setIsShowModal(!isShowModal)}
          title="Select language"
          aria-label="Select language"
        >
          <Globe
            style={{
              opacity: 0.8,
            }}
          />
        </IconButton>
      )}

      <CustomModal
        isOpen={isShowModal}
        onClose={() => {
          setIsShowModal(false);
        }}
        width="900px"
      >
        <Stack>
          <Typography variant="h4" component="h2">
            {i18n._(`Languages`)}
          </Typography>
        </Stack>
        <Stack
          sx={{
            width: "100%",
            gap: "46px",
            opacity: isLoading ? 0.2 : 1,
          }}
        >
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
            <Tab icon={<Globe />} iconPosition="start" label={i18n._(`Page`)} value={"page"} />
            <Tab
              icon={<GraduationCap />}
              iconPosition="start"
              label={i18n._(`For Learning`)}
              value={"learn"}
            />
          </Tabs>

          {!auth.isAuthorized && activeTab === "learn" ? (
            <Stack
              sx={{
                gap: "26px",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100svh - 270px)",
              }}
            >
              <Stack
                sx={{
                  padding: "30px",
                  borderRadius: "70px",
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                }}
              >
                <Rabbit
                  size={"60px"}
                  strokeWidth={"1px"}
                  style={{
                    opacity: 0.7,
                  }}
                />
              </Stack>
              <Stack
                sx={{
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  component="h3"
                  sx={{
                    opacity: 0.8,
                  }}
                >
                  {i18n._(`To learn a language, please sign in`)}
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  component="p"
                  sx={{
                    opacity: 0.8,
                    maxWidth: "700px",
                  }}
                >
                  {supportedLanguages.map((lang) => `${fullEnglishLanguageName[lang]}`).join(", ")}
                </Typography>

                <Button variant="contained" href="/practice">
                  {i18n._(`Sign in`)}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack
                gap={"30px"}
                sx={{
                  height: "calc(100svh - 270px)",
                }}
              >
                <Stack gap={"10px"}>
                  <Typography variant="body2" component="h3">
                    {i18n._(`Suggested for you:`)}
                  </Typography>
                  <Stack
                    sx={{
                      display: "grid",
                      gap: "16px",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      "@media (max-width: 800px)": {
                        gridTemplateColumns: "1fr 1fr 1fr",
                      },
                      "@media (max-width: 600px)": {
                        gridTemplateColumns: "1fr 1fr",
                      },
                      "@media (max-width: 500px)": {
                        gridTemplateColumns: "1fr",
                      },
                    }}
                  >
                    {systemLangs.map((option, index) => {
                      return (
                        <LanguageCard
                          key={index}
                          lang={option}
                          onClick={() => handleChange(option)}
                          selected={option === selectedLangCode}
                        />
                      );
                    })}
                  </Stack>
                </Stack>
                <Stack gap={"10px"}>
                  <Typography variant="body2" component="h3">
                    {i18n._(`Other languages:`)}
                  </Typography>
                  <Stack
                    sx={{
                      display: "grid",
                      gap: "16px",

                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      "@media (max-width: 800px)": {
                        gridTemplateColumns: "1fr 1fr 1fr",
                      },
                      "@media (max-width: 600px)": {
                        gridTemplateColumns: "1fr 1fr",
                      },
                      "@media (max-width: 500px)": {
                        gridTemplateColumns: "1fr",
                      },
                    }}
                  >
                    {otherLangs.map((option, index) => {
                      return (
                        <LanguageCard
                          key={index}
                          lang={option}
                          onClick={() => handleChange(option)}
                          selected={option === selectedLangCode}
                        />
                      );
                    })}
                  </Stack>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </CustomModal>
    </Stack>
  );
}
