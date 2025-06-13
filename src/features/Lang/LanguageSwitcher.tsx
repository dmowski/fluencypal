"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { Button, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  availableOnLabelMap,
  fullEnglishLanguageName,
  fullLanguageName,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { getUrlStart } from "./getUrlStart";
import { Globe, GraduationCap, Rabbit } from "lucide-react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { ClickCard } from "../Dashboard/ClickCard";
import { useLocalStorage } from "react-use";
import { parseLangFromUrl } from "./parseLangFromUrl";
import PersonIcon from "@mui/icons-material/Person";

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

interface LanguageSwitcherProps {
  size?: "small" | "large" | "button";
  isAuth: boolean;
  langToLearn?: SupportedLanguage;
  setLanguageToLearn: (lang: SupportedLanguage) => void;
}
export function LanguageSwitcher({
  size,
  isAuth,
  langToLearn,
  setLanguageToLearn,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { i18n } = useLingui();
  const [activeTab, setActiveTab] = useState<"page" | "learn">("page");
  const [isShowModal, setIsShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSawLangSelector, setIsSawLangSelector] = useLocalStorage<boolean>(
    "isUserSawLangSelector",
    false
  );

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
      setLanguageToLearn(newLang);
    }
  }

  const selectedLangCode = activeTab === "page" ? supportedLang : langToLearn;

  const systemLangs = getUserLangCode();
  const otherLangs = supportedLanguages.filter((lang) => !systemLangs.includes(lang));

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

      <CustomModal
        isOpen={isShowModal}
        onClose={() => setIsShowModal(false)}
        width="900px"
        padding="40px min(40px, 5vw) 40px min(35px, 4.5vw)"
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

          {!isAuth && activeTab === "learn" ? (
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

                <Button variant="contained" href={`${getUrlStart(supportedLang)}practice`}>
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
                {systemLangs.length > 0 && (
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
                )}
                <Stack gap={"10px"}>
                  <Typography variant="body2" component="h3">
                    {systemLangs.length > 0 ? i18n._(`Other languages:`) : ""}
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
