"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { Button, Chip, CircularProgress, Link, Stack, TextField, Typography } from "@mui/material";
import { FC, JSX, useEffect, useState } from "react";
import { buttonStyle, subTitleFontStyle } from "../Landing/landingSettings";
import { ArrowRight, Check, Copy, ExternalLink, GraduationCap } from "lucide-react";
import { LangSelector } from "../Lang/LangSelector";
import { lightTheme } from "../uiKit/theme";
import { ThemeProvider } from "@mui/material/styles";
import { getUrlStart } from "../Lang/getUrlStart";
import { sendCreateGoalRequest } from "@/app/api/goal/goalRequests";
import { useIsWebView } from "../Auth/useIsWebView";
import * as Sentry from "@sentry/nextjs";

interface StepInfo {
  title: string;
  content: JSX.Element;
  subTitle: string;
}

interface GoalQuestionsComponentProps {
  lang: SupportedLanguage;
  showTerms: boolean;
  langLearnPlanLabels: Record<SupportedLanguage, string>;
  titleComponent: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  defaultLang?: SupportedLanguage;
}
const GoalQuestionsComponent: React.FC<GoalQuestionsComponentProps> = ({
  lang,
  titleComponent,
  langLearnPlanLabels,
  showTerms,
  defaultLang,
}) => {
  const { i18n } = useLingui();
  const [languageToLearn, setLanguageToLearn] = useState<SupportedLanguage>(defaultLang || "en");
  const title = langLearnPlanLabels[languageToLearn];

  const { inWebView } = useIsWebView();

  const [level, setLevel] = useState<string>("A2");
  const [description, setDescription] = useState<string>("");
  const [showDescriptionError, setShowDescriptionError] = useState<boolean>(false);

  const [goalId, setGoalId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateDescription = (value: string) => {
    setDescription(value);
    setShowDescriptionError(false);
  };

  const onSubmit = async () => {
    if (description.length < 100) {
      setShowDescriptionError(true);
      return;
    }

    setIsLoading(true);
    scrollTop();

    try {
      const requestResult = await sendCreateGoalRequest({
        description: description,
        languageToLearn: languageToLearn,
        level: level,
      });
      setIsLoading(false);
      setIsSubmitted(true);
      setGoalId(requestResult.id);

      const url = new URL(window.location.href);
      url.searchParams.set("goalId", requestResult.id);
      window.history.pushState({}, "", url.toString());
      setStep(0);
    } catch (error) {
      alert(i18n._(`Something went wrong. Please try again`));
      setIsLoading(false);
      setIsSubmitted(false);
      setGoalId(null);
      throw error;
    }
  };

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2", "Fluent"];

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const [step, setStep] = useState(0);
  const onNext = () => {
    if (step < maxSteps - 1) {
      setStep(step + 1);
      scrollTop();
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
      Sentry.captureException(err);
      console.error("Failed to copy text: ", err);
    }
  };

  const steps: StepInfo[] = [
    {
      title: title,
      subTitle: i18n._(
        `Create your personalized plan and start your journey towards achieving your goals.`
      ),
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
            <LangSelector value={languageToLearn} onChange={(lang) => setLanguageToLearn(lang)} />
          </Stack>

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
                {i18n._(`Your Current Level`)}
              </Typography>
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {levels.map((item) => {
                const isSelected = level === item;
                return (
                  <Chip
                    label={item}
                    key={item}
                    sx={{
                      borderRadius: "5px",
                      padding: "0 5px",
                    }}
                    onClick={() => setLevel(item)}
                    color={isSelected ? "info" : "default"}
                    icon={isSelected ? <Check size={"14px"} /> : undefined}
                  />
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
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              onClick={onNext}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Next")}
            </Button>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.5,
                maxWidth: "100px",
              }}
              align="right"
            >
              {i18n._("Step 1 of 2")}
            </Typography>
          </Stack>
        </Stack>
      ),
    },

    {
      title: i18n._(`Details`),
      subTitle: i18n._(
        `Provide more info about you and what you need to improve in your language skills. And AI will create a personalized plan for you. More info - better plan.`
      ),
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
                {i18n._(`About your goal`)}
              </Typography>
            </Stack>
            <TextField
              sx={{
                width: "100%",
              }}
              slotProps={{
                input: {
                  sx: {
                    padding: "15px 15px",
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
              value={description}
              onChange={(e) => updateDescription(e.target.value)}
            />
            <Stack
              sx={{
                width: "100%",
                paddingRight: "4px",
                flexDirection: "row",
                gap: "10px",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="caption" color={showDescriptionError ? "error" : "text"}>
                {showDescriptionError ? "‼️" : "💡"}{" "}
                {i18n._(`Write at least 100 characters for a sharper plan`)}
              </Typography>
              <Typography
                variant="caption"
                align="right"
                sx={{
                  minWidth: "70px",
                }}
              >
                {description.length} / 100
              </Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              padding: "50px 0 0 0",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<Check />}
              onClick={onSubmit}
              sx={{
                ...buttonStyle,
              }}
            >
              {i18n._("Submit")}
            </Button>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.5,
              }}
            >
              {i18n._("Step 2 of 2")}
            </Typography>
          </Stack>
          {showTerms && (
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
          )}
        </Stack>
      ),
    },
  ];

  const maxSteps = steps.length;
  const currentStep = steps[step] || steps[0];

  const goalPartUrl = `${getUrlStart(lang)}practice/?goalId=${goalId}`;
  const goalUrl = `https://www.fluencypal.com${goalPartUrl}`;

  return (
    <Stack
      sx={{
        backgroundColor: "transparent",
      }}
    >
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
  showTerms,
  langLearnPlanLabels,
  titleComponent,
  defaultLang,
}) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <GoalQuestionsComponent
        lang={lang}
        showTerms={showTerms}
        langLearnPlanLabels={langLearnPlanLabels}
        titleComponent={titleComponent}
        defaultLang={defaultLang}
      />
    </ThemeProvider>
  );
};
