"use client";
import {
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  langFlags,
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import {
  ArrowLeft,
  ArrowRight,
  BetweenHorizontalStart,
  Bird,
  BookType,
  ChartNoAxesCombined,
  Check,
  FlagIcon,
  Globe,
  GraduationCap,
  Guitar,
  Lightbulb,
  LucideProps,
  Mic,
  Music,
  OctagonX,
  PencilRuler,
  Plane,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Speech,
  UsersRound,
  X,
} from "lucide-react";
import { LangSelectorFullScreen, LanguageButton } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { QuizProvider, useQuiz } from "./useQuiz";
import { useLanguageGroup } from "../useLanguageGroup";
import {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Trans } from "@lingui/react/macro";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useAuth } from "@/features/Auth/useAuth";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import Google from "@mui/icons-material/Google";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { scrollToLangButton, scrollTopFast } from "@/libs/scroll";
import { sleep } from "@/libs/sleep";

const QuizQuestions = () => {
  const { currentStep, isFirstLoading } = useQuiz();
  const { i18n } = useLingui();

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <ProgressBar />

      {!isFirstLoading && (
        <Stack
          sx={{
            maxWidth: "600px",
            padding: "0 10px",
            width: "100%",
          }}
        >
          {currentStep === "learnLanguage" && <LanguageToLearnSelector />}

          {currentStep === "before_nativeLanguage" && (
            <InfoStep
              imageUrl="/avatar/book.webp"
              message={i18n._(`What language do you speak`)}
              subMessage={i18n._(`So I can translate words for you`)}
              actionButtonTitle={i18n._(`Choose My Language`)}
            />
          )}

          {currentStep === "nativeLanguage" && <NativeLanguageSelector />}

          {currentStep === "before_pageLanguage" && (
            <InfoStep
              message={i18n._(`Choose Site Language`)}
              subMessage={i18n._(`This is text you see on buttons and menus`)}
              imageUrl="/illustrations/ui-schema.png"
            />
          )}

          {currentStep === "pageLanguage" && <PageLanguageSelector />}

          {currentStep === "before_recordAbout" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`We are ready`)}
                subMessage={i18n._(`Let's talk. Tell me  about yourself`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  >
                    <AboutYourselfList />
                  </Stack>
                }
              />
            </AuthWall>
          )}

          {currentStep === "recordAbout" && (
            <AuthWall>
              <RecordUserAudio />
            </AuthWall>
          )}
        </Stack>
      )}
    </Stack>
  );
};

interface ListItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  href?: string;
}

const IconTextList = ({ listItems }: { listItems: ListItem[] }) => {
  return (
    <Stack
      sx={{
        gap: "18px",
        paddingTop: "10px",
        paddingBottom: "10px",
        width: "100%",
      }}
    >
      {listItems.map((item, index) => (
        <Stack
          key={index}
          sx={{
            flexDirection: "row",
            gap: "15px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <item.icon
            style={{
              opacity: 0.7,
            }}
            size={18}
          />
          <Typography
            variant="body2"
            target={item.href ? "_blank" : undefined}
            component={item.href ? Link : "div"}
            href={item.href}
          >
            {item.title}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export const AboutYourselfList: React.FC = () => {
  const { i18n } = useLingui();

  const listItems: ListItem[] = [
    {
      title: i18n._("Hobbies or interests"),
      icon: Guitar,
    },
    {
      title: i18n._("Main goal in learning"),
      icon: GraduationCap,
    },
    {
      title: i18n._("Do you have any travel plans?"),
      icon: Plane,
    },
    {
      title: i18n._("Movies, books, or music"),
      icon: Music,
    },
  ];

  return <IconTextList listItems={listItems} />;
};

const RecordUserAudio = () => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  const { languageToLearn, nextStep } = useQuiz();
  const learningLanguageName = fullLanguageName[languageToLearn];
  const auth = useAuth();

  const [transcript, setTranscript] = useState<string>("");

  const recorder = useAudioRecorder({
    languageCode: languageToLearn || "en",
    getAuthToken: auth.getToken,
    isFree: true,
    isGame: false,
    visualizerComponentWidth: "100%",
  });

  useEffect(() => {
    if (recorder.transcription) {
      const combinedTranscript = [transcript, recorder.transcription].filter(Boolean).join(" ");
      setTranscript(combinedTranscript);
    }
  }, [recorder.transcription]);

  return (
    <Stack
      sx={{
        gap: "0px",
      }}
    >
      <Stack
        sx={{
          gap: "10px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            gap: "15px",
          }}
        >
          <Stack>
            <Typography variant="h6">{i18n._("Tell me about yourself")}</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.8,
              }}
            >
              <Trans>
                Record 2-3 minutes story using <b>{learningLanguageName}</b>
              </Trans>
            </Typography>
          </Stack>
          <Stack>
            <AboutYourselfList />
          </Stack>

          <Stack
            sx={{
              width: "100%",
            }}
          >
            <Typography variant="h6">{i18n._("Your story")}</Typography>

            <Typography
              variant={transcript ? "body2" : "caption"}
              sx={{
                opacity: transcript ? 1 : 0.8,
              }}
              className={recorder.isTranscribing ? `loading-shimmer` : ""}
            >
              {recorder.isTranscribing && i18n._("Processing...")}
              {transcript && transcript}
              {!transcript && !recorder.isTranscribing && "____"}
            </Typography>

            {transcript && !recorder.isTranscribing && (
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingTop: "10px",
                  gap: "10px",
                }}
              >
                <Button
                  variant="outlined"
                  endIcon={<Mic size={"16px"} />}
                  size="small"
                  onClick={recorder.stopRecording}
                >
                  {i18n._("Record more")}
                </Button>
                <IconButton
                  size="small"
                  onClick={() => {
                    setTranscript("");
                  }}
                >
                  <X size={"16px"} />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <FooterButton
        aboveButtonComponent={recorder.visualizerComponent}
        onClick={() => {
          if (transcript) {
            nextStep();
            return;
          }
          if (recorder.isRecording) {
            recorder.stopRecording();
          } else {
            recorder.startRecording();
          }
        }}
        title={
          recorder.isRecording ? i18n._("Done") : transcript ? i18n._("Next") : i18n._("Record")
        }
        color={recorder.isRecording ? "error" : "primary"}
        endIcon={recorder.isRecording ? <Check /> : transcript ? <ArrowRight /> : <Mic />}
      />
    </Stack>
  );
};

export const InfoStep = ({
  message,
  subMessage,
  subComponent,
  imageUrl,
  actionButtonTitle,
  onClick,
  actionButtonStartIcon,
  actionButtonEndIcon,
  aboveButtonComponent,
}: {
  message?: string;
  subMessage?: string;
  subComponent?: ReactNode;
  imageUrl: string;
  actionButtonTitle?: string;
  onClick?: () => void;
  actionButtonStartIcon?: ReactNode;
  actionButtonEndIcon?: ReactNode;
  aboveButtonComponent?: ReactNode;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        gap: "0px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "0 10px",
          minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 190px)`,
          //backgroundColor: "rgba(240, 0, 0, 0.1)",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              width: "190px",
              height: "190px",
            }}
          />
        )}
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "0px",
          }}
        >
          {message && (
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
            >
              {message}
            </Typography>
          )}
          {subMessage && (
            <Typography
              variant="body2"
              align="center"
              sx={{
                opacity: 0.7,
              }}
            >
              {subMessage}
            </Typography>
          )}
          {subComponent}
        </Stack>
      </Stack>

      {onClick ? (
        <FooterButton
          onClick={onClick}
          title={actionButtonTitle || i18n._("Next")}
          endIcon={actionButtonEndIcon}
          startIcon={actionButtonStartIcon}
          aboveButtonComponent={aboveButtonComponent}
        />
      ) : (
        <NextStepButton actionButtonTitle={actionButtonTitle} />
      )}
    </Stack>
  );
};

const NativeLanguageSelector = () => {
  const { i18n } = useLingui();
  const { nativeLanguage, setNativeLanguage, nextStep } = useQuiz();

  const [internalFilterValue, setInternalFilterValue] = useState("");
  const cleanInput = internalFilterValue.trim().toLowerCase();

  const isCorrectNativeLanguageSelected = nativeLanguage;

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const isScrolledRef = useRef(false);

  useEffect(() => {
    if (nativeLanguage && !isScrolledRef.current) {
      console.log("Need to scroll to ", nativeLanguage);
      isScrolledRef.current = true;
      (async () => {
        scrollToLangButton(nativeLanguage);
        await sleep(100);
        scrollToLangButton(nativeLanguage);
      })();
    }
  }, []);

  const filterByInput = ({
    englishName,
    nativeName,
  }: {
    englishName: string;
    nativeName: string;
  }) => {
    if (!cleanInput) {
      return true;
    }

    englishName = englishName.toLowerCase();
    if (englishName.includes(cleanInput)) {
      return true;
    }

    nativeName = nativeName.toLowerCase();
    if (nativeName.includes(cleanInput)) {
      return true;
    }

    return false;
  };

  const filteredLanguageGroup = languageGroups
    .filter(filterByInput)
    .sort((a, b) => a.englishName.localeCompare(b.englishName));

  const { topOffset } = useWindowSizes();
  return (
    <Stack
      sx={{
        gap: "5px",
      }}
    >
      <Stack
        sx={{
          height: `70px`,
        }}
      ></Stack>
      <Stack
        sx={{
          position: "fixed",
          width: "100%",
          top: "0",
          left: 0,
          zIndex: 1,
          backgroundColor: "rgba(10, 18, 30, 1)",
          padding: "20px 0 10px 0",
          paddingTop: `calc(${topOffset} + 65px)`,
          alignItems: "center",
        }}
      >
        <TextField
          value={internalFilterValue}
          onChange={(e) => setInternalFilterValue(e.target.value)}
          fullWidth
          variant="filled"
          label={i18n._("Native language")}
          placeholder={i18n._("")}
          autoComplete="off"
          sx={{
            maxWidth: "calc(min(600px, 100dvw) - 20px)",
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={"18px"} />
                </InputAdornment>
              ),
              endAdornment: internalFilterValue && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setInternalFilterValue("");
                      nativeLanguage && scrollToLangButton(nativeLanguage);
                    }}
                  >
                    <X size={"18px"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Stack
        sx={{
          width: "100%",
          paddingTop: "5px",
          gap: "8px",
        }}
      >
        {filteredLanguageGroup.length === 0 && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._(`No results found`)}
          </Typography>
        )}
        {filteredLanguageGroup.map((option) => {
          const isSelected = option.code === nativeLanguage;
          return (
            <LanguageButton
              onClick={() => setNativeLanguage(option.code)}
              key={option.code}
              label={option.englishName}
              langCode={option.code}
              englishFullName={option.englishName}
              isSystemLang={option.isSystemLanguage}
              fullName={option.nativeName}
              isShowFullName
              isSelected={isSelected}
            />
          );
        })}
      </Stack>
      <NextStepButton disabled={!isCorrectNativeLanguageSelected} />
    </Stack>
  );
};

const PageLanguageSelector = () => {
  const { i18n } = useLingui();
  const { pageLanguage, setPageLanguage } = useQuiz();
  const value = pageLanguage;

  const userCodes = useMemo(() => getUserLangCode(), []);
  const availableList = supportedLanguages;
  const optionsFull = (availableList || supportedLanguages)
    .map((lang: SupportedLanguage) => {
      return {
        label: getLabelFromCode(lang),
        langCode: lang,
        englishFullName: fullEnglishLanguageName[lang] || "",
        isSystemLang: userCodes.includes(lang),
        fullName: fullLanguageName[lang] || "",
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const onChangeLanguage = async (code: string) => {
    const isChanging = pageLanguage !== code;
    if (!isChanging) {
      return;
    }
    if (!code) {
      return;
    }

    const langCode = supportedLanguages.find((lang) => lang === code) || "en";
    setPageLanguage(langCode);
  };
  return (
    <Stack
      sx={{
        gap: "20px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <Globe size={"30px"} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            boxSizing: "border-box",
            lineHeight: "1.1",
          }}
        >
          {i18n._(`Page Language`)}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: "100%",
          gap: "4px",
        }}
      >
        {optionsFull.map((option) => {
          const isSelected = option.langCode === value;
          const flagImageUrl = langFlags[option.langCode];
          return (
            <LanguageButton
              onClick={() => onChangeLanguage(option.langCode)}
              key={option.langCode}
              label={option.label}
              langCode={option.langCode}
              englishFullName={option.englishFullName}
              isSystemLang={option.isSystemLang}
              fullName={option.fullName}
              isSelected={isSelected}
              flagImageUrl={flagImageUrl}
              flagSize="small"
              isShowFullName
            />
          );
        })}
      </Stack>
      <NextStepButton />
    </Stack>
  );
};

const LanguageToLearnSelector = () => {
  const { i18n } = useLingui();
  const { languageToLearn, setLanguageToLearn, isStepLoading, nextStep } = useQuiz();
  return (
    <Stack
      sx={{
        gap: "20px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <GraduationCap size={"30px"} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            boxSizing: "border-box",
            lineHeight: "1.1",
          }}
        >
          {i18n._(`I want to learn...`)}
        </Typography>
      </Stack>

      <LangSelectorFullScreen
        value={languageToLearn}
        availableList={supportedLanguagesToLearn}
        onChange={(lang) => setLanguageToLearn(lang)}
      />
      <NextStepButton />
    </Stack>
  );
};

const ProgressBar = () => {
  const { topOffset } = useWindowSizes();
  const { navigateToMainPage, isCanGoToMainPage, isFirstStep, prevStep, progress } = useQuiz();

  return (
    <>
      <Stack
        sx={{
          display: "block",
          width: "100%",
          minHeight: `calc(${topOffset} + 55px)`,
        }}
      />

      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          zIndex: 2,
          width: "100dvw",
          left: "0",

          padding: "0 0 30px 0",
          top: 0,
          paddingTop: `calc(${topOffset} + 15px)`,
          background: "linear-gradient(to top, rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",

          right: "0px",
        }}
      >
        <Stack
          sx={{
            width: "min(600px, calc(100dvw - 20px))",

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
          }}
        >
          <IconButton
            sx={{
              opacity: isCanGoToMainPage || !isFirstStep ? 1 : 0,
            }}
            onClick={() => {
              if (isFirstStep) {
                isCanGoToMainPage && navigateToMainPage();
              } else {
                prevStep();
              }
            }}
          >
            {isCanGoToMainPage || !isFirstStep ? <ArrowLeft /> : <FlagIcon />}
          </IconButton>

          <Stack
            sx={{
              width: "100%",
              borderRadius: "25px",
            }}
          >
            <GradingProgressBar height={"12px"} value={Math.max(0, progress * 100)} label="" />
          </Stack>

          <Stack
            sx={{
              width: "34px",
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};

const FooterButton = ({
  disabled,
  title,
  onClick,
  startIcon,
  endIcon,
  color,
  aboveButtonComponent,
}: {
  disabled?: boolean;
  title: string;
  onClick: () => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  color?: "primary" | "success" | "error";
  aboveButtonComponent?: ReactNode;
}) => {
  const { bottomOffset } = useWindowSizes();
  return (
    <>
      <Stack
        sx={{
          display: "block",
          width: "100%",
          minHeight: `calc(${bottomOffset} + 95px)`,
        }}
      />

      <Stack
        sx={{
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          width: "100dvw",
          left: "0",

          padding: "30px 0 0 0",
          bottom: 0,
          right: "0px",

          paddingBottom: `calc(${bottomOffset} + 35px)`,
          "@media (max-width: 600px)": {
            paddingBottom: `calc(${bottomOffset} + 15px)`,
          },
        }}
      >
        {aboveButtonComponent && (
          <Stack
            sx={{
              width: "min(590px, calc(100dvw - 0px))",
            }}
          >
            {aboveButtonComponent}
          </Stack>
        )}
        <Button
          onClick={onClick}
          variant="contained"
          color={color || "primary"}
          disabled={disabled}
          size="large"
          sx={{
            width: "min(600px, calc(100dvw - 20px))",
          }}
          fullWidth
          startIcon={startIcon}
          endIcon={endIcon}
        >
          {title}
        </Button>
        <Stack
          sx={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(10, 18, 30, 0.9), rgba(10, 18, 30, 0))",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
          }}
        ></Stack>
      </Stack>
    </>
  );
};

const NextStepButton = ({
  disabled,
  actionButtonTitle,
}: {
  disabled?: boolean;
  actionButtonTitle?: string;
}) => {
  const { i18n } = useLingui();
  const { isStepLoading, nextStep } = useQuiz();

  return (
    <FooterButton
      disabled={disabled}
      onClick={() => {
        !isStepLoading && nextStep();
      }}
      title={actionButtonTitle || i18n._("Next")}
      endIcon={<ArrowRight />}
    />
  );
};

export const AuthWall = ({
  children,
  signInTitle,
  singInSubTitle,
  featuresTitle,
  featuresSubTitle,
}: {
  children: ReactNode;
  signInTitle?: string;
  singInSubTitle?: string;
  featuresTitle?: string;
  featuresSubTitle?: string;
}) => {
  const auth = useAuth();
  const { i18n } = useLingui();

  const isShowAuthWall = !auth.uid && !auth.loading;

  const steps = ["features", "agreement", "auth"];
  const [step, setStep] = useState(steps[0]);
  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }

    if (step === "auth") {
      auth.signInWithGoogle();
    }
  };

  useEffect(() => {
    if (isShowAuthWall) {
      const isWindow = typeof window !== "undefined";
      if (isWindow) {
        scrollTopFast();
      }
    }
  }, [isShowAuthWall]);

  if (!isShowAuthWall) {
    return children;
  }

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
          "--content-max-width": "380px",
          "--content-min-height": "350px",
        }}
      >
        {step === "features" && (
          <InfoStep
            imageUrl="/avatar/bot2.webp"
            actionButtonTitle={i18n._("Next")}
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack sx={{}}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    {featuresTitle ? featuresTitle : <Trans>What you get with FluencyPal</Trans>}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {featuresSubTitle ? featuresSubTitle : <Trans>AI speaking partner</Trans>}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: "max-content",
                    minWidth: "230px",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("Conversation practice with AI"),
                        icon: Speech,
                      },
                      {
                        title: i18n._("Full AI tutor access"),
                        icon: Sparkles,
                      },

                      {
                        title: i18n._("Advanced Personalization"),
                        icon: Lightbulb,
                      },

                      {
                        title: i18n._("New Grammar Rules"),
                        icon: GraduationCap,
                      },
                      {
                        title: i18n._("New Words and Phrases"),
                        icon: BookType,
                      },

                      {
                        title: i18n._("Role-play scenarios"),
                        icon: UsersRound,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}
        {step === "agreement" && (
          <InfoStep
            actionButtonTitle={i18n._("I agree")}
            actionButtonEndIcon={<Check />}
            imageUrl="/avatar/bot1.png"
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack sx={{}}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    <Trans>We will speak freely</Trans>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    <Trans>So we need your agreement with that</Trans>
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    minWidth: "230px",
                    width: "100%",
                    gap: "10px",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("We process your voice using AI"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("Your transcripts are securely stored in our service"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("You can delete your personal data anytime"),
                        icon: ShieldCheck,
                      },

                      {
                        title: i18n._("Privacy Policy"),
                        icon: ScrollText,
                        href: `${getUrlStart("en")}privacy`,
                      },

                      {
                        title: i18n._("Terms of Use"),
                        icon: PencilRuler,
                        href: `${getUrlStart("en")}terms`,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}

        {step === "auth" && (
          <InfoStep
            imageUrl="/avatar/map.webp"
            actionButtonTitle={i18n._("Sign in with Google")}
            actionButtonStartIcon={<Google />}
            subComponent={
              <Stack
                sx={{
                  gap: "20px",
                  alignItems: "flex-start",
                  maxWidth: "var(--content-max-width)",
                  width: "100%",
                  minHeight: "var(--content-min-height)",
                }}
              >
                <Stack>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                    }}
                  >
                    {signInTitle ? signInTitle : <Trans>Let's create an account</Trans>}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {singInSubTitle ? singInSubTitle : <Trans>So you can keep your progress</Trans>}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: "100%",
                    minWidth: "230px",
                  }}
                >
                  <IconTextList
                    listItems={[
                      {
                        title: i18n._("3 days of full access for free"),
                        icon: Sparkles,
                      },

                      {
                        title: i18n._("No credit card required"),
                        icon: Bird,
                      },

                      {
                        title: i18n._("No ads, no spam"),
                        icon: BetweenHorizontalStart,
                      },

                      {
                        title: i18n._("Privacy Policy"),
                        icon: ScrollText,
                        href: `${getUrlStart("en")}privacy`,
                      },

                      {
                        title: i18n._("Terms of Use"),
                        icon: PencilRuler,
                        href: `${getUrlStart("en")}terms`,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            }
            onClick={nextStep}
          />
        )}
      </Stack>
    </Stack>
  );
};

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  return (
    <QuizProvider pageLang={lang} defaultLangToLearn={defaultLangToLearn}>
      <WebViewWall>
        <QuizQuestions />
      </WebViewWall>
    </QuizProvider>
  );
};
