"use client";

import { useState } from "react";
import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
} from "@/common/lang";
import { getUrlStart } from "./getUrlStart";
import { LangSelector } from "./LangSelector";
import { Globe, GraduationCap, Rabbit } from "lucide-react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useSettings } from "../Settings/useSettings";
import { ClickCard } from "../Dashboard/ClickCard";
import { SelectGroupItem } from "../uiKit/SuggestInput/SuggestInput";
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

  const [locale, setLocale] = useState<SupportedLanguage>(parseLangFromUrl(pathname));
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  function handleChange(newLang: SupportedLanguage) {
    if (activeTab === "page") {
      const sliceNumber = locale !== "en" ? 2 : pathname.startsWith("/en") ? 2 : 1;

      const pathNameWithoutLocale = pathname?.split("/")?.slice(sliceNumber) ?? [];
      const newPath = `${getUrlStart(newLang)}${pathNameWithoutLocale.join("/")}`;
      setLocale(locale);
      router.push(newPath);
    } else {
      settings.setLanguage(newLang);
    }
  }

  const selectedLangCode = activeTab === "page" ? supportedLang : settings.languageCode;

  const systemLangs = getUserLangCode();
  const otherLangs = supportedLanguages.filter((lang) => !systemLangs.includes(lang));

  return (
    <Stack sx={{}}>
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
          }}
        >
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
            <Tab icon={<Globe />} iconPosition="start" label={"Page"} value={"page"} />
            <Tab
              icon={<GraduationCap />}
              iconPosition="start"
              label={"Language To Learn"}
              value={"learn"}
            />
          </Tabs>

          {!auth.isAuthorized && activeTab === "learn" ? (
            <Stack
              sx={{
                gap: "26px",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "570px",
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
                  variant="body2"
                  align="center"
                  component="h3"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`To learn a language, please sign in`)}
                </Typography>
                <Button variant="contained" href="/practice">
                  {i18n._(`Sign in`)}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack gap={"30px"}>
                <Stack gap={"10px"}>
                  <Typography variant="body2" component="h3">
                    {i18n._(`System languages:`)}
                  </Typography>
                  <Stack
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      gap: "16px",
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
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      gap: "16px",
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
