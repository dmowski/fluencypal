"use client";

import { useMemo, useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import {
  availableOnLabelMap,
  fullEnglishLanguageName,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { getUrlStart } from "./getUrlStart";
import { Globe, GraduationCap, Rabbit } from "lucide-react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLocalStorage } from "react-use";
import { parseLangFromUrl } from "./parseLangFromUrl";
import { LangSelector } from "./LangSelector";
import LanguageAutocomplete from "./LanguageAutocomplete";
import { useLanguageGroup } from "../Goal/useLanguageGroup";
import { useUrlParam } from "../Url/useUrlParam";

interface LanguageSwitcherProps {
  size?: "small" | "large" | "button";
  isAuth?: boolean;

  langToLearn?: SupportedLanguage;
  setLanguageToLearn?: (lang: SupportedLanguage) => void;

  nativeLang?: string;
  setNativeLanguage?: (lang: string) => void;

  setPageLanguage?: (lang: SupportedLanguage) => void;
}
export function LanguageSwitcher({
  size,
  isAuth,
  langToLearn,
  setLanguageToLearn,
  setPageLanguage,
  setNativeLanguage,
  nativeLang,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { i18n } = useLingui();
  const [isShowModal, setIsShowModal] = useUrlParam("lang-selection");
  const [isLoading, setIsLoading] = useState(false);
  const [isSawLangSelector, setIsSawLangSelector] = useLocalStorage<boolean>(
    "isUserSawLangSelector",
    false
  );

  const pageLang = useMemo(() => parseLangFromUrl(pathname), [pathname]);
  const [locale, setLocale] = useState<SupportedLanguage>(pageLang);
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const updatePageLanguage = (newLang: SupportedLanguage) => {
    setIsLoading(true);
    const sliceNumber = locale !== "en" ? 2 : pathname.startsWith("/en") ? 2 : 1;

    const pathNameWithoutLocale = pathname?.split("/")?.slice(sliceNumber) ?? [];

    const query = new URLSearchParams(window.location.search).toString();

    const newPath = `${getUrlStart(newLang)}${pathNameWithoutLocale.join("/")}${
      query ? `?${query}` : ""
    }`;
    router.push(newPath);
    setPageLanguage?.(newLang);

    setLocale(locale);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const systemLangs = useMemo(() => getUserLangCode(), []);

  const isCurrentPageLangIsSystem = systemLangs.length && systemLangs.includes(supportedLang);
  const supportedLangCodeLabel =
    systemLangs.length && !isCurrentPageLangIsSystem && !isAuth && !isSawLangSelector
      ? availableOnLabelMap[systemLangs[0]]
      : "";

  const onOpenModal = () => {
    if (!isSawLangSelector) {
      setIsSawLangSelector(true);
    }

    setIsShowModal(true);
  };

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const selectedNativeLanguage = useMemo(
    () => languageGroups.find((lang) => lang.code === nativeLang),
    [languageGroups, nativeLang]
  );

  return (
    <Stack sx={{}}>
      {supportedLangCodeLabel ? (
        <Button
          onClick={onOpenModal}
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
        <>
          {size === "button" ? (
            <>
              <Button
                sx={{
                  color: "#fff",
                }}
                onClick={onOpenModal}
                startIcon={<Globe size="20px" />}
              >
                <Typography
                  sx={{
                    textTransform: "none",
                  }}
                >
                  {fullEnglishLanguageName[langToLearn || "en"]}
                </Typography>
              </Button>
            </>
          ) : (
            <IconButton onClick={onOpenModal} title="Select language" aria-label="Select language">
              <Globe
                size={size == "small" ? "18px" : "22px"}
                style={{
                  opacity: 0.8,
                }}
              />
            </IconButton>
          )}
        </>
      )}

      <CustomModal isOpen={isShowModal} onClose={() => setIsShowModal(false)}>
        <Stack
          sx={{
            width: "100%",
            maxWidth: "600px",
            gap: "30px",
            boxSizing: "border-box",
          }}
        >
          <Typography variant="h5" component="h2" align="center">
            {i18n._(`Languages`)}
          </Typography>
          <Stack
            sx={{
              width: "100%",
              gap: "46px",
              opacity: isLoading ? 0.2 : 1,
            }}
          >
            <Stack
              gap={"30px"}
              sx={{
                maxWidth: "600px",
                minWidth: "250px",
              }}
            >
              {isAuth && setLanguageToLearn && langToLearn && (
                <Stack
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    gap: "10px",
                    paddingTop: "20px",
                  }}
                >
                  <Stack
                    sx={{
                      alignItems: "center",
                      flexDirection: "row",
                      gap: "10px",
                      paddingLeft: "3px",
                    }}
                  >
                    <Typography
                      variant="h3"
                      align="left"
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        lineHeight: "1.1",
                      }}
                    >
                      {i18n._(`Language to Learn`)}
                    </Typography>
                    <GraduationCap size={"18px"} />
                  </Stack>
                  <LangSelector
                    value={langToLearn}
                    availableList={supportedLanguagesToLearn}
                    onChange={(newLang) => setLanguageToLearn(newLang)}
                  />
                </Stack>
              )}

              {isAuth && setNativeLanguage && nativeLang && (
                <Stack
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    gap: "10px",
                    paddingTop: "20px",
                  }}
                >
                  <Stack
                    sx={{
                      alignItems: "center",
                      flexDirection: "row",
                      gap: "10px",
                      paddingLeft: "3px",
                    }}
                  >
                    <Typography
                      variant="h3"
                      align="left"
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        lineHeight: "1.1",
                      }}
                    >
                      {i18n._(`Native Language`)}
                    </Typography>
                  </Stack>

                  <LanguageAutocomplete
                    options={languageGroups}
                    value={selectedNativeLanguage || null}
                    onChange={(langCode) => {
                      if (langCode) {
                        setNativeLanguage(langCode);
                      }
                    }}
                  />
                </Stack>
              )}

              <Stack
                sx={{
                  width: "100%",
                  alignItems: "flex-start",
                  gap: "10px",
                  paddingTop: "20px",
                }}
              >
                <Stack
                  sx={{
                    alignItems: "center",
                    flexDirection: "row",
                    gap: "10px",
                    paddingLeft: "3px",
                  }}
                >
                  <Typography
                    variant="h3"
                    align="left"
                    sx={{
                      fontWeight: 500,
                      fontSize: "1rem",
                      boxSizing: "border-box",
                      lineHeight: "1.1",
                    }}
                  >
                    {i18n._(`Page Language`)}
                  </Typography>
                </Stack>
                <LangSelector
                  value={pageLang || "en"}
                  onChange={(newLang) => updatePageLanguage(newLang)}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CustomModal>
    </Stack>
  );
}
