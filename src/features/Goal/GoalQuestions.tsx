"use client";

import {
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import {
  Button,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC, JSX, useEffect, useMemo, useState } from "react";
import { buttonStyle, subTitleFontStyle } from "../Landing/landingSettings";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, GraduationCap, Mic } from "lucide-react";
import { LangSelector } from "../Lang/LangSelector";
import { lightTheme } from "../uiKit/theme";
import { ThemeProvider } from "@mui/material/styles";
import { getUrlStart } from "../Lang/getUrlStart";
import { sendCreateGoalRequest } from "@/app/api/goal/goalRequests";
import { useIsWebView } from "../Auth/useIsWebView";
import * as Sentry from "@sentry/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import SignalStrengthIcon from "./SignalStrengthIcon";
import { GradingProgressBar } from "../Dashboard/BrainCard";
import { sleep } from "@/libs/sleep";
import { useGoalQuizForm } from "./useGoalQuizForm";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import { uniq } from "@/libs/uniq";
import { fullLanguages } from "@/libs/languages";
import LanguageAutocomplete from "../Lang/LanguageAutocomplete";
import { useLanguageGroup } from "./useLanguageGroup";

const TermsComponent = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        padding: "10px 0 0 2px",
        flexDirection: "row",
        gap: "10px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "0px",
          opacity: 0.9,
          flexDirection: "row",
        }}
      >
        <Typography variant="caption">
          {i18n._(`By submitting this form, you agree to our:`)}
          <br />
          <Link href={`${getUrlStart(lang)}privacy`} target="_blank">
            {i18n._(`Privacy Policy`)}
          </Link>{" "}
          {i18n._("and")}{" "}
          <Link href={`${getUrlStart(lang)}terms`} target="_blank">
            {i18n._(`Terms of Use`)}
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};

interface StepInfo {
  title: string;
  content: JSX.Element;
  subTitle: string;
}

interface GoalQuestionsComponentProps {
  lang: SupportedLanguage;
  titleComponent: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  defaultLang?: SupportedLanguage;
  showTerms: boolean;
}
const GoalQuestionsComponent: React.FC<GoalQuestionsComponentProps> = ({
  lang,
  titleComponent,
  defaultLang,
  showTerms,
}) => {
  const { i18n } = useLingui();

  const { data, updateData, isQuizDataLoading } = useGoalQuizForm({
    description: "",
    minPerDay: 10,
    languageToLearn: defaultLang || "en",
    nativeLanguage: null,
    level: "A2",
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const stepFromUrl = searchParams.get("step") || "0";
  const step = parseInt(stepFromUrl, 10) || 0;

  const updateStep = (newStep: number) => {
    const updatedUrl = new URL(window.location.href);
    updatedUrl.searchParams.set("step", newStep.toString());
    const newUrl = updatedUrl.toString();

    router.push(newUrl);
  };

  const { inWebView } = useIsWebView();

  const [showDescriptionError, setShowDescriptionError] = useState<boolean>(false);

  const [goalId, setGoalId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateNativeLang = (value: string) => {
    updateData({
      nativeLanguage: value,
    });

    const isSupportedLanguage = supportedLanguagesToLearn.find(
      (supportedLang) => supportedLang === value
    );

    if (isSupportedLanguage) {
      const newPath = `${getUrlStart(value)}quiz`;
      console.log("updateNativeLang");
      router.push(newPath);
    }
  };

  const updateDescription = (value: string) => {
    updateData({
      description: value,
    });
    setShowDescriptionError(false);
  };

  const onSubmit = async () => {
    if (!data.description || data.description.length < 100) {
      setShowDescriptionError(true);
      return;
    }

    setIsLoading(true);
    scrollTop();

    try {
      const requestResult = await sendCreateGoalRequest({
        description: data.description,
        languageToLearn: data.languageToLearn,
        level: data.level || "A2",
        minPerDaySelected: data.minPerDay,
        nativeLanguageCode: data.nativeLanguage || "en",
      });
      setIsLoading(false);
      setIsSubmitted(true);
      setGoalId(requestResult.id);

      const url = new URL(window.location.href);
      url.searchParams.set("goalId", requestResult.id);
      window.history.pushState({}, "", url.toString());
      updateStep(0);
    } catch (error) {
      alert(i18n._(`Something went wrong. Please try again`));
      setIsLoading(false);
      setIsSubmitted(false);
      setGoalId(null);
      throw error;
    }
  };

  const levelsMap: Record<string, string> = {
    A1: i18n._("I'm a beginner"),
    A2: i18n._("I know a few simple words"),
    B1: i18n._("I can maintain a simple conversation"),
    B2: i18n._("I can discuss various topics"),
    C1: i18n._("I can discuss most topics in detail"),
  };

  const levels = Object.keys(levelsMap) as string[];

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const onNext = () => {
    if (step < maxSteps - 1) {
      updateStep(step + 1);
      sleep(40).then(() => {
        scrollTop();
      });
    }
  };

  useEffect(() => {
    const isWindows = typeof window !== "undefined";
    if (!isWindows) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const goalId = searchParams.get("goalId");
    if (goalId) {
      setGoalId(goalId);
      setIsSubmitted(true);
    }
  }, []);

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  //alert("Done. Link copied to clipboard!");
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      setIsCopied(true);
    } catch (err) {
      alert(i18n._("Failed to copy text. Please try again."));
      const errString = `Failed to copy text: ${err}`;

      console.error("Failed to copy text: ", err);
      Sentry.captureException(errString);
    }
  };

  const recorder = useAudioRecorder({
    languageCode: data.nativeLanguage || data.languageToLearn || "en",
    getAuthToken: async () => "",
    isFree: true,
    isGame: false,
  });

  useEffect(() => {
    if (recorder.isRecording || !recorder.transcription) {
      return;
    }

    updateData({
      description: data.description + " " + recorder.transcription,
    });
  }, [recorder.transcription]);

  const langTranslations: Record<SupportedLanguage, string> = {
    en: i18n.t("English"),
    es: i18n.t("Spanish"),
    zh: i18n.t("Chinese"),
    fr: i18n.t("French"),
    de: i18n.t("German"),
    ja: i18n.t("Japanese"),
    ko: i18n.t("Korean"),
    ar: i18n.t("Arabic"),
    pt: i18n.t("Portuguese"),

    it: i18n.t("Italian"),
    pl: i18n.t("Polish"),
    ru: i18n.t("Russian"),

    uk: i18n.t("Ukrainian"),
    id: i18n.t("Indonesian"),
    ms: i18n.t("Malay"),
    th: i18n.t("Thai"),
    tr: i18n.t("Turkish"),
    vi: i18n.t("Vietnamese"),
    da: i18n.t("Danish"),
    no: i18n.t("Norwegian"),
    sv: i18n.t("Swedish"),
    be: i18n.t("Belarusian"),
  };

  const minsPerDayOptions: Record<number, [string, string]> = {
    3: [i18n._("3 minutes per day"), i18n._("Easy")],
    10: [i18n._("10 minutes per day"), i18n._("Good")],
    15: [i18n._("15 minutes per day"), i18n._("Serious")],
    20: [i18n._("20 minutes per day"), i18n._("Intensive")],
  };

  const languagesToRecord = uniq([data.nativeLanguage, data.languageToLearn].filter(Boolean));
  const languagesTitles = languagesToRecord
    .map(
      (lang) =>
        fullLanguages.find((langDefinition) => langDefinition.code === lang)?.nativeName || lang
    )
    .join(", ")
    .trim();

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  useEffect(() => {
    if (data.nativeLanguage || isQuizDataLoading) {
      return;
    }
    const firstSystemLanguage = languageGroups.find((lang) => lang.isSystemLanguage);
    if (firstSystemLanguage) {
      updateNativeLang(firstSystemLanguage.code);
    }
  }, [languageGroups, isQuizDataLoading]);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return;
    }

    if (!languageGroups.length) {
      return;
    }

    const systemLanguages = languageGroups.filter((lang) => lang.isSystemLanguage);
    if (!systemLanguages.length) {
      return;
    }

    const isPageLanguageIsSystemLanguage = systemLanguages.some(
      (systemLang) => systemLang.code === lang
    );
    if (isPageLanguageIsSystemLanguage) {
      return;
    }

    const supportedLanguageFromSystemLanguages = systemLanguages.find((systemLang) =>
      supportedLanguages.includes(systemLang.code as SupportedLanguage)
    );

    if (!supportedLanguageFromSystemLanguages) {
      return;
    }

    const newPageLang =
      supportedLanguages.find(
        (supportedLang) => supportedLang === supportedLanguageFromSystemLanguages.code
      ) || lang;

    if (newPageLang === lang) {
      return;
    }

    const newPath = `${getUrlStart(newPageLang)}quiz`;
    router.push(newPath);
  }, [languageGroups]);

  const selectedNativeLanguage = useMemo(
    () => languageGroups.find((lang) => lang.code === data.nativeLanguage),
    [data.nativeLanguage, languageGroups]
  );

  const steps: StepInfo[] = [
    {
      title: i18n._(`I want to learn...`),
      subTitle: i18n._(``),
      content: (
        <Stack
          sx={{
            width: "300px",
            paddingTop: "20px",
          }}
        >
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
              value={data.languageToLearn}
              availableList={supportedLanguagesToLearn}
              onChange={(lang) => {
                updateData({
                  languageToLearn: lang,
                });
              }}
            />
          </Stack>

          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "10px",
              paddingTop: "40px",
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
                {i18n._(`My native language`)}
              </Typography>
            </Stack>
            <LanguageAutocomplete
              options={languageGroups}
              value={selectedNativeLanguage || null}
              onChange={(langCode) => updateNativeLang(langCode)}
            />
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading || isQuizDataLoading || !data.nativeLanguage}
              endIcon={<ArrowRight />}
              onClick={onNext}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Next")}
            </Button>
          </Stack>
        </Stack>
      ),
    },
    {
      title: i18n._(`How well do you know`) + " " + `${langTranslations[data.languageToLearn]}?`,
      subTitle: "",
      content: (
        <Stack
          sx={{
            maxWidth: "400px",
            paddingTop: "20px",
          }}
        >
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
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {levels.map((item, index) => {
                const isSelected = data.level === item;
                const fullLabel = levelsMap[item];
                return (
                  <Stack
                    key={item}
                    sx={{
                      borderRadius: "5px",
                      flexDirection: "row",
                      border: isSelected ? "1px solid #00AEEF" : "1px solid rgba(0, 0, 0, 0.1)",
                      backgroundColor: isSelected ? "rgba(0, 174, 239, 0.1)" : "transparent",
                      alignItems: "center",
                      gap: "15px",
                      textAlign: "left",
                      width: "100%",
                      padding: "10px 25px 10px 15px",
                      cursor: "pointer",
                      color: "#111",
                    }}
                    component={"button"}
                    onClick={() => {
                      updateData({
                        level: item,
                      });
                    }}
                    color={isSelected ? "info" : "default"}
                  >
                    <SignalStrengthIcon level={index} />
                    <Typography>{fullLabel}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight />}
              onClick={onNext}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Next")}
            </Button>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`Describe what you want to achieve, and AI will build a custom plan.`),
      subTitle: i18n._(`More info means better results.`),

      content: (
        <Stack
          sx={{
            width: "700px",
            maxWidth: "100%",
            paddingTop: "0px",
          }}
        >
          <Typography variant="caption">
            {i18n._(`Write at least 100 characters for a sharper plan`)}
          </Typography>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight />}
              onClick={() => {
                onNext();
              }}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Let's go")}
            </Button>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`About your goal`),
      subTitle: i18n._(`Write at least 100 characters for a sharper plan`),

      content: (
        <Stack
          sx={{
            width: "700px",
            maxWidth: "100%",
            paddingTop: "20px",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <TextField
              sx={{
                width: "100%",
              }}
              slotProps={{
                input: {
                  sx: {
                    padding: "15px 15px",
                    borderRadius: recorder.isAbleToRecord ? "5px 5px 0 0" : "5px",
                  },
                },
              }}
              multiline
              minRows={4}
              placeholder={i18n._(
                "I want to learn English to travel. And I want to understand movies and songs."
              )}
              variant="outlined"
              error={showDescriptionError}
              value={data.description}
              onChange={(e) => {
                updateDescription(e.target.value);
              }}
            />

            {recorder.isAbleToRecord && (
              <Button
                variant="outlined"
                sx={{
                  marginTop: "-11px",
                  width: "100%",
                  borderRadius: "0 0 5px 5px",
                  textTransform: "none",
                  backgroundColor: isLoading || recorder.isTranscribing ? "#c2c2c2" : "#222245",
                  color: "#fff",
                  fontWeight: 400,
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: "52px",
                  flexWrap: "wrap",
                }}
                disabled={isLoading || recorder.isTranscribing}
                onClick={() =>
                  recorder.isRecording ? recorder.stopRecording() : recorder.startRecording()
                }
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Mic size={"18px"} />
                  <Typography
                    sx={{
                      fontWeight: 500,
                    }}
                    variant="body2"
                  >
                    {recorder.isTranscribing
                      ? i18n._(`Transcribing...`)
                      : recorder.isRecording
                        ? i18n._(`Stop recording`)
                        : i18n._(`Record`) + ` ` + (languagesTitles ? `(${languagesTitles})` : "")}
                  </Typography>
                </Stack>

                {recorder.visualizerComponent}
              </Button>
            )}

            <Stack
              sx={{
                width: "100%",
                paddingRight: "4px",
                flexDirection: "row",
                gap: "10px",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                color={showDescriptionError ? "error" : "text"}
              ></Typography>
              <Typography
                variant="caption"
                align="right"
                sx={{
                  minWidth: "70px",
                }}
              >
                {data.description.length || 0} / 100
              </Typography>
            </Stack>
          </Stack>
          {recorder.error && (
            <Stack
              sx={{
                width: "100%",
                paddingTop: "10px",
              }}
            >
              <Typography variant="caption" color="error">
                {recorder.error}
              </Typography>
            </Stack>
          )}

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight />}
              disabled={isLoading || !data.description || data.description.length < 100}
              onClick={() => {
                recorder.stopRecording();
                onNext();
              }}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Continue")}
            </Button>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`Let's decide at what pace we will study!`),
      subTitle: "",
      content: (
        <Stack
          sx={{
            width: "700px",
            maxWidth: "100%",
            paddingTop: "20px",
            alignItems: "flex-start",
            "@media (max-width: 900px)": {
              position: "fixed",
              width: "calc(100% - 20px)",
              padding: "15px 10px",
              bottom: "0px",
              left: "0px",
              right: "0px",
              backgroundColor: "rgba(255, 255, 255, 0.73)",
            },
          }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth
            endIcon={<ArrowRight />}
            onClick={onNext}
            sx={{
              ...buttonStyle,
            }}
          >
            {i18n._("Continue")}
          </Button>
        </Stack>
      ),
    },

    {
      title: i18n._(`What is our daily goal?`),
      subTitle: "",
      content: (
        <Stack
          sx={{
            maxWidth: "400px",
            paddingTop: "20px",
          }}
        >
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
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {Object.keys(minsPerDayOptions).map((item, index) => {
                const optionValue = parseInt(item);
                const labels = minsPerDayOptions[optionValue];
                const fullLabel = labels[0];
                const shortLabel = labels[1];
                const isSelected = data.minPerDay === optionValue;
                return (
                  <Stack
                    key={item}
                    sx={{
                      borderRadius: "5px",
                      flexDirection: "row",
                      border: isSelected ? "1px solid #00AEEF" : "1px solid rgba(0, 0, 0, 0.1)",
                      backgroundColor: isSelected ? "rgba(0, 174, 239, 0.1)" : "transparent",
                      alignItems: "center",
                      gap: "30px",
                      textAlign: "left",
                      width: "100%",
                      padding: "10px 15px",
                      cursor: "pointer",
                      justifyContent: "space-between",
                    }}
                    component={"button"}
                    onClick={() => {
                      updateData({
                        minPerDay: optionValue,
                      });
                    }}
                    color={isSelected ? "info" : "default"}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {fullLabel}
                    </Typography>
                    <Typography variant="caption">{shortLabel}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight />}
              onClick={onNext}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Next")}
            </Button>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`So, in the first week you will learn:`),
      subTitle: "",
      content: (
        <Stack
          sx={{
            maxWidth: "400px",
            paddingTop: "20px",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "10px",
              paddingTop: "20px",
            }}
          >
            <Typography variant="h6" align="left">
              {i18n._(`New words:`)} <b>{data.minPerDay * 6}</b>
            </Typography>
            <Typography variant="h6" align="left">
              {i18n._(`Rules:`)} <b>{0.5 * 6}</b>
            </Typography>
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight />}
              onClick={onNext}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Next")}
            </Button>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`This is what you can achieve in 3 months!`),
      subTitle: "",
      content: (
        <Stack
          sx={{
            maxWidth: "400px",
            paddingTop: "20px",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "30px",
              paddingTop: "20px",
            }}
          >
            <Stack>
              <Typography variant="h6" align="left">
                {i18n._(`Confident Communication`)}
              </Typography>
              <Typography>{i18n._(`Practice speaking and listening without stress`)}</Typography>
            </Stack>

            <Stack>
              <Typography variant="h6" align="left">
                {i18n._(`Expanded Vocabulary`)}
              </Typography>
              <Typography>{i18n._(`Frequently used words and useful phrases`)}</Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              gap: "5px",
              "@media (max-width: 900px)": {
                position: "fixed",
                width: "calc(100% - 20px)",
                padding: "15px 10px",
                bottom: "0px",
                left: "0px",
                right: "0px",
                backgroundColor: "rgba(255, 255, 255, 0.73)",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<Check />}
              onClick={onSubmit}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Create a plan")}
            </Button>
            {showTerms && <TermsComponent lang={lang} />}
          </Stack>
        </Stack>
      ),
    },
  ];

  const maxSteps = steps.length;
  const progress = (step + 1) / maxSteps;
  const currentStep = steps[step] || steps[0];

  const navigateToMainPage = () => {
    const newPath = `${getUrlStart(lang)}`;
    router.push(newPath);
  };

  const goalPartUrl = `${getUrlStart(lang)}practice/?goalId=${goalId}`;
  const goalUrl = `https://www.fluencypal.com${goalPartUrl}`;

  return (
    <Stack sx={{}}>
      {!isLoading && !isSubmitted && (
        <Stack
          sx={{
            width: "100%",
            padding: "0 0 5px 0px",
            boxSizing: "border-box",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
            marginLeft: "-10px",
          }}
        >
          <IconButton
            onClick={() => {
              const currentStep = step || 0;
              if (currentStep > 0) {
                updateStep(currentStep - 1);
                scrollTop();
              } else {
                navigateToMainPage();
              }
            }}
          >
            <ArrowLeft />
          </IconButton>

          <Stack
            sx={{
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.07)",
              borderRadius: "25px",
            }}
          >
            <GradingProgressBar height={"12px"} value={Math.max(0, progress * 100 - 20)} label="" />
          </Stack>
        </Stack>
      )}

      <Stack
        sx={{
          width: "100%",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <Typography
          align="left"
          variant="h2"
          component={titleComponent}
          sx={{
            fontWeight: 700,
            color: "#121214",
            "@media (max-width: 1300px)": {
              fontSize: "4rem",
            },
            "@media (max-width: 900px)": {
              fontSize: "3rem",
            },
            "@media (max-width: 700px)": {
              fontSize: "2rem",
            },
          }}
        >
          {isSubmitted ? i18n._("Submitted") : currentStep.title}
        </Typography>

        <Typography
          align="left"
          variant="body1"
          sx={{
            maxWidth: "700px",
            ...subTitleFontStyle,
          }}
        >
          {isSubmitted ? i18n._("Your plan is being processed with AI") : currentStep.subTitle}
        </Typography>

        {isLoading && (
          <Stack
            sx={{
              padding: "10px 0 0 0",
            }}
          >
            <CircularProgress />
          </Stack>
        )}

        {isSubmitted && goalId && (
          <Stack>
            {inWebView ? (
              <Stack
                sx={{
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <TextField value={goalUrl} />
                <Button
                  color={isCopied ? "success" : "primary"}
                  startIcon={isCopied ? <Check size="16px" /> : <Copy size="16px" />}
                  variant="contained"
                  size="large"
                  onClick={() => copyToClipboard(goalUrl)}
                >
                  {isCopied ? i18n._("Copied") : i18n._("Copy link")}
                </Button>
              </Stack>
            ) : (
              <>
                <Button
                  variant="contained"
                  href={goalPartUrl}
                  sx={{
                    ...buttonStyle,
                  }}
                  endIcon={<ExternalLink size={"18px"} />}
                >
                  {i18n._("Open a plan")}
                </Button>
              </>
            )}
          </Stack>
        )}

        {!isLoading && !isSubmitted && <>{currentStep.content}</>}
      </Stack>
    </Stack>
  );
};

export const GoalQuestions: FC<GoalQuestionsComponentProps> = ({
  lang,
  titleComponent,
  defaultLang,
  showTerms,
}) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <GoalQuestionsComponent
        lang={lang}
        showTerms={showTerms}
        titleComponent={titleComponent}
        defaultLang={defaultLang}
      />
    </ThemeProvider>
  );
};
