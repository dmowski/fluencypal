"use client";
import { Button, Stack, Typography } from "@mui/material";
import { LangSelector } from "../Lang/LangSelector";
import { useSettings } from "../Settings/useSettings";
import { useLingui } from "@lingui/react";
import { useEffect, useState } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import {
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useRouter, useSearchParams } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";

export const SelectLanguage: React.FC<{ pageLang: SupportedLanguage }> = ({ pageLang }) => {
  const settings = useSettings();
  const searchParams = useSearchParams();
  const langToLearnUrl = searchParams.get("learn");
  const langToLearn =
    supportedLanguages.find(
      (lang) => lang.toLowerCase() === langToLearnUrl?.trim().toLowerCase()
    ) || "en";

  const [myLang, setMyLang] = useState<SupportedLanguage | null>(pageLang);
  useEffect(() => {
    setMyLang(pageLang);
  }, [pageLang]);

  const { i18n } = useLingui();
  const router = useRouter();

  const onConfirm = async () => {
    await settings.setLanguage(langToLearn || "en");
    deleteLearnLangParam();
  };

  async function deleteLearnLangParam() {
    const query = new URLSearchParams(window.location.search);
    query.delete("learn");
    const queryString = query.toString();
    router.push(`${getUrlStart(myLang || "en")}practice${queryString ? `?${queryString}` : ``}`, {
      scroll: false,
    });
  }

  async function handleChangeLearnLang(newLang: SupportedLanguage) {
    const query = new URLSearchParams(window.location.search);

    if (newLang !== "en") {
      query.set("learn", newLang);
    } else {
      query.delete("learn");
    }
    const queryString = query.toString();

    router.push(`${getUrlStart(myLang || "en")}practice${queryString ? `?${queryString}` : ``}`, {
      scroll: false,
    });
  }

  async function handleChangeMyLang(newLang: SupportedLanguage) {
    const pathParts = location.pathname?.split("/") || [];

    const pathNameWithoutLocale = pathParts
      .filter((part) => !supportedLanguages.includes(part as SupportedLanguage))
      .filter(Boolean);

    const query = new URLSearchParams(window.location.search).toString();
    const newPath = `${getUrlStart(newLang)}${pathNameWithoutLocale.join("/")}${
      query ? `?${query}` : ""
    }`;
    router.push(newPath);
    setMyLang(newLang);
  }

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          paddingTop: "120px",
          boxSizing: "border-box",
          padding: "120px 20px 0 20px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "850px",
            width: "100%",
            alignItems: "flex-start",
            gap: "60px",
          }}
        >
          <Stack
            sx={{
              alignItems: "flex-start",
              gap: "2px",
              width: "100%",
            }}
          >
            <Typography
              align="left"
              sx={{
                textTransform: "uppercase",
                fontWeight: 350,
                opacity: 0.9,
                paddingLeft: "2px",
              }}
            >
              {i18n._(`Almost there!`)}
            </Typography>
            <Typography
              variant="h3"
              align="left"
              sx={{
                fontWeight: 900,
                fontSize: "2.6rem",
                boxSizing: "border-box",
                lineHeight: "1.1",
                "@media (max-width: 600px)": {
                  fontSize: "2.1rem",
                },
              }}
            >
              {i18n._(`Select languages`)}
            </Typography>
          </Stack>
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "40px",
              minWidth: "min(400px, 90dvw)",
            }}
          >
            <Stack
              sx={{
                alignItems: "flex-start",
                width: "100%",
                gap: "30px",
                flexDirection: "column",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  alignItems: "flex-start",
                  gap: "5px",
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
                  <GraduationCap size={"18px"} />
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
                    {i18n._(`Learn`)}
                  </Typography>
                </Stack>
                <LangSelector
                  value={langToLearn || "en"}
                  availableList={supportedLanguagesToLearn}
                  onChange={(lang) => handleChangeLearnLang(lang)}
                />
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                  alignItems: "flex-start",
                  gap: "5px",
                }}
              >
                <Typography
                  variant="h3"
                  align="center"
                  sx={{
                    fontWeight: 500,
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    lineHeight: "1.1",
                    paddingLeft: "3px",
                  }}
                >
                  {i18n._(`My`)}
                </Typography>
                <LangSelector
                  value={myLang || "en"}
                  onChange={(lang) => handleChangeMyLang(lang)}
                />
              </Stack>
            </Stack>

            <Button
              sx={{
                padding: "15px 50px",
                width: "100%",
                boxSizing: "border-box",
              }}
              endIcon={<ArrowRight />}
              onClick={onConfirm}
              size="large"
              color="info"
              variant="contained"
            >
              Continue
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
