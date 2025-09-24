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
  Check,
  FlagIcon,
  Globe,
  Goal,
  GraduationCap,
  Guitar,
  Languages,
  LucideProps,
  Mic,
  Music,
  Plane,
  Search,
  Trash,
  X,
} from "lucide-react";
import { LangSelectorFullScreen, LanguageButton } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { MIN_WORDS_FOR_ANSWER, QuizProvider, useQuiz } from "./useQuiz";
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
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { scrollToLangButton, scrollTopFast } from "@/libs/scroll";
import { sleep } from "@/libs/sleep";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { useTranslate } from "@/features/Translation/useTranslate";
import { QuizSurvey2FollowUpQuestion } from "./types";
import { PlanCard } from "@/features/Plan/PlanCard";
import { PlanElementMode } from "@/features/Plan/types";
import { cardColors, modeCardProps } from "@/features/Plan/data";
import { useRouter } from "next/navigation";
import { getWordsCount } from "@/libs/words";
import { useTgNavigation } from "@/features/Telegram/useTgNavigation";
import { AuthWall } from "@/features/Auth/AuthWall";

const QuizQuestions = () => {
  const {
    currentStep,
    isFirstLoading,
    survey,
    nativeLanguage,
    updateSurvey,
    languageToLearn,
    isFollowUpGenerating,
    isGoalQuestionGenerating,
  } = useQuiz();
  const { i18n } = useLingui();

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const learningLanguageName = fullLanguageName[languageToLearn].toLocaleLowerCase();
  const nativeLanguageName =
    languageGroups.find((g) => g.languageCode === nativeLanguage)?.nativeName || "";

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
              actionButtonTitle={i18n._(`Set My Language`)}
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
              <RecordUserAudio
                title={i18n._("Tell me about yourself")}
                subTitle={
                  languageToLearn === nativeLanguage ? (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b>
                    </Trans>
                  ) : (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b> or{" "}
                      <b>{nativeLanguageName}</b>
                    </Trans>
                  )
                }
                subTitleComponent={<AboutYourselfList />}
                transcript={survey?.aboutUserTranscription || ""}
                minWords={MIN_WORDS_FOR_ANSWER}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserTranscription: combinedTranscript,
                    },
                    "recordAbout UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_recordAboutFollowUp" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Wow, that was awesome!`)}
                subMessage={i18n._(`Let's continue, I have a question for you!`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
              />
            </AuthWall>
          )}

          {currentStep === "recordAboutFollowUp" && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.aboutUserFollowUpQuestion || null}
                transcript={survey?.aboutUserFollowUpTranscription || ""}
                loading={isFollowUpGenerating}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserFollowUpTranscription: combinedTranscript,
                    },
                    "recordAboutFollowUp UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_recordAboutFollowUp2" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Before the training plan...`)}
                subMessage={i18n._(`Let's talk about your goals a bit more`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
              />
            </AuthWall>
          )}

          {currentStep === "recordAboutFollowUp2" && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.goalFollowUpQuestion || null}
                transcript={survey?.goalUserTranscription || ""}
                loading={isGoalQuestionGenerating}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      goalUserTranscription: combinedTranscript,
                    },
                    "recordAboutFollowUp2 UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_goalReview" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Now, we ready to create your learning plan`)}
                subMessage={i18n._(`It might take up to a minute`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
              />
            </AuthWall>
          )}

          {currentStep === "goalReview" && (
            <AuthWall>
              <GoalReview />
            </AuthWall>
          )}
        </Stack>
      )}
    </Stack>
  );
};

const GoalReview = ({}) => {
  const { i18n } = useLingui();
  const sizes = useWindowSizes();
  const quiz = useQuiz();
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const confirmPlan = async () => {
    setRedirecting(true);
    try {
      await quiz.confirmPlan();
      const url = `${getUrlStart(quiz.pageLanguage)}practice`;
      console.log("url", url);
      router.push(url);
    } catch (e) {
      alert(i18n._("Error creating plan. Please try again."));
    }
    await sleep(4000);
    setRedirecting(false);
  };

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };

  const isLoading = quiz.isGoalGenerating || quiz.survey?.goalData === null;

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
          //justifyContent: "center",
          gap: "10px",
          padding: "0 10px",
          minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 190px)`,
          //backgroundColor: "rgba(240, 0, 0, 0.1)",
        }}
      >
        <img
          src={"/avatar/map.webp"}
          style={{
            width: "190px",
            height: "190px",
          }}
        />
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "30px",
          }}
        >
          <Stack>
            <Typography
              variant="caption"
              align="center"
              sx={{
                opacity: 0.7,
                textTransform: "uppercase",
              }}
            >
              {i18n._(`Your plan for learning`)}
            </Typography>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
              className={isLoading ? "loading-shimmer" : ""}
            >
              {isLoading ? i18n._("Loading..") : quiz.survey?.goalData?.title}
            </Typography>
          </Stack>
          <Stack
            sx={{
              width: "100%",
            }}
          >
            {isLoading ? (
              <>
                <LoadingShapes sizes={["100px", "100px", "100px", "100px", "100px", "100px"]} />
              </>
            ) : (
              <Stack
                sx={{
                  gap: "15px",
                }}
              >
                {quiz.survey?.goalData?.elements.map((planElement, index, sortedElements) => {
                  const cardInfo = modeCardProps[planElement.mode];
                  const colorIndex = index % cardColors.length;
                  const cardColor = cardColors[colorIndex];
                  const elementsWithSameMode =
                    sortedElements.filter((element) => element.mode === planElement.mode) || [];
                  const currentElementIndex = elementsWithSameMode.findIndex(
                    (element) => element.id === planElement.id
                  );

                  const imageVariants = cardInfo.imgUrl;
                  const imageIndex = currentElementIndex % imageVariants.length;
                  const imageUrl = imageVariants[imageIndex];
                  return (
                    <Stack key={index} sx={{}}>
                      <PlanCard
                        id={planElement.id}
                        key={planElement.id}
                        delayToShow={index * 80}
                        title={planElement.title}
                        subTitle={modeLabels[planElement.mode]}
                        description={planElement.description}
                        details={planElement.details}
                        isDone={false}
                        isActive={false}
                        isContinueLabel={false}
                        onClick={() => {}}
                        viewOnly
                        startColor={cardColor.startColor}
                        progressPercent={Math.min((planElement.startCount || 0) * 10, 100)}
                        endColor={cardColor.endColor}
                        bgColor={cardColor.bgColor}
                        isLast={index === sortedElements.length - 1}
                        icon={
                          <Stack>
                            <Stack className="avatar">
                              <img src={imageUrl} alt="" />
                            </Stack>
                          </Stack>
                        }
                        actionLabel={i18n._(`Start`)}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <FooterButton
        disabled={redirecting || isLoading}
        onClick={confirmPlan}
        title={redirecting ? i18n._("Loading...") : i18n._("Start Learning")}
        endIcon={<ArrowRight />}
      />
    </Stack>
  );
};

const RecordAboutFollowUp = ({
  question,
  transcript,
  updateTranscript,
  loading,
}: {
  question: QuizSurvey2FollowUpQuestion | null;
  transcript: string;
  updateTranscript: (transcript: string) => Promise<void>;
  loading: boolean;
}) => {
  const { i18n } = useLingui();
  const translation = useTranslate();

  return (
    <RecordUserAudio
      title={loading ? i18n._("Loading...") : question?.title || i18n._("Loading...")}
      isLoading={!question?.title || loading}
      subTitle={question?.subtitle || ""}
      subTitleComponent={
        <>
          {question?.title && !loading ? (
            <>
              {translation.translateModal}
              <Stack
                sx={{
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <Markdown
                  onWordClick={(word, element) => {
                    translation.translateWithModal(word, element);
                  }}
                  variant="conversation"
                >
                  {question?.description || "..."}
                </Markdown>
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={(e) => {
                      const fullText =
                        `${question?.title || ""}\n\n${question?.description || ""}`.trim();
                      translation.translateWithModal(fullText, e.currentTarget);
                    }}
                    size="small"
                    startIcon={<Languages size={"14px"} />}
                    variant="text"
                  >
                    Translate
                  </Button>
                </Stack>
              </Stack>
            </>
          ) : (
            <Stack
              sx={{
                gap: "10px",
              }}
            >
              <LoadingShapes sizes={["40px", "100px"]} />
            </Stack>
          )}
        </>
      }
      transcript={transcript || ""}
      minWords={MIN_WORDS_FOR_ANSWER}
      updateTranscript={updateTranscript}
    />
  );
};

const LoadingShapes = ({ sizes }: { sizes: string[] }) => {
  return (
    <Stack
      sx={{
        gap: "10px",
      }}
    >
      {sizes.map((size, index) => (
        <Stack
          key={index}
          className="loading-shimmer-shape"
          sx={{
            minHeight: size,
            borderRadius: "6px",
          }}
        />
      ))}
    </Stack>
  );
};

interface ListItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  href?: string;
}

export const IconTextList = ({ listItems }: { listItems: ListItem[] }) => {
  return (
    <Stack
      sx={{
        gap: "18px",
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

export const RecordUserAudioAnswer = ({
  transcript,
  minWords,
  isLoading,
  isTranscribing,
  visualizerComponent,
  isRecording,
  stopRecording,
  startRecording,
  clearTranscript,
}: {
  transcript: string;
  minWords: number;
  isLoading?: boolean;
  isTranscribing: boolean;
  visualizerComponent: ReactNode;
  isRecording: boolean;
  stopRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
  clearTranscript: () => void;
}) => {
  const { i18n } = useLingui();
  const wordsCount = getWordsCount(transcript || "");
  const isNeedMoreRecording = !transcript || wordsCount < minWords;
  return (
    <Stack
      sx={{
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 12px 15px 10px",
        borderRadius: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        opacity: isLoading ? 0.4 : 1,
      }}
      className={isLoading ? "loading-shimmer-shape" : ""}
    >
      <Stack
        sx={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          paddingBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
          }}
        >
          {i18n._("Your answer")}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: wordsCount === 0 ? "inherit" : wordsCount < minWords ? "#FFA500" : "#4CAF50",
          }}
        >
          {wordsCount > 0 ? (
            <>
              {wordsCount} / <b>{minWords}</b>
            </>
          ) : (
            <></>
          )}
        </Typography>
      </Stack>

      <Typography
        variant={transcript ? "body2" : "caption"}
        sx={{
          opacity: transcript ? 1 : 0.8,
        }}
        className={isTranscribing ? `loading-shimmer` : ""}
      >
        {transcript && transcript}

        {isTranscribing && " " + i18n._("Processing...")}
      </Typography>

      {!transcript && !isTranscribing && (
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            //color: "#888",
            paddingBottom: "10px",
          }}
        >
          <Goal size={"39px"} color="#999" strokeWidth={"2px"} />
          <Typography variant="h6" align="center" sx={{}}>
            <Trans>
              Goal: at least <b>{minWords}</b> words
            </Trans>
          </Typography>
        </Stack>
      )}

      {transcript && !isTranscribing && (
        <Stack>
          {!isNeedMoreRecording && visualizerComponent}
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              gap: "10px",
            }}
          >
            {wordsCount >= minWords && (
              <Button
                variant={isNeedMoreRecording ? "contained" : "outlined"}
                endIcon={isRecording ? <Check /> : <Mic size={"16px"} />}
                size="small"
                color={isRecording ? "error" : "primary"}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
              >
                {isRecording ? i18n._("Done") : i18n._("Record more")}
              </Button>
            )}
            <IconButton size="small" onClick={clearTranscript}>
              <Trash size={"16px"} />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const RecordUserAudio = ({
  transcript,
  minWords,
  updateTranscript,
  title,
  subTitle,
  subTitleComponent,
  isLoading,
}: {
  transcript: string;
  minWords: number;
  updateTranscript: (transcript: string) => Promise<void>;
  title: string;
  subTitle: string | ReactNode;
  subTitleComponent: ReactNode;
  isLoading?: boolean;
}) => {
  const { i18n } = useLingui();
  const { languageToLearn, nextStep } = useQuiz();

  const auth = useAuth();

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
      updateTranscript(combinedTranscript);
    }
  }, [recorder.transcription]);

  const clearTranscript = () => {
    if (transcript) {
      updateTranscript("");
    }
  };

  const wordsCount = getWordsCount(transcript || "");
  const isNeedMoreRecording = !transcript || wordsCount < minWords;

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
            <Typography variant="h6" className={isLoading ? "loading-shimmer" : ""}>
              {title}
            </Typography>
            <Typography
              variant="caption"
              className={isLoading ? "loading-shimmer" : ""}
              sx={{
                opacity: 0.8,
              }}
            >
              {subTitle}
            </Typography>
          </Stack>
          <Stack>{subTitleComponent}</Stack>
          <RecordUserAudioAnswer
            transcript={transcript}
            minWords={minWords}
            isLoading={isLoading}
            isTranscribing={recorder.isTranscribing}
            visualizerComponent={recorder.visualizerComponent}
            isRecording={recorder.isRecording}
            stopRecording={recorder.stopRecording}
            startRecording={recorder.startRecording}
            clearTranscript={clearTranscript}
          />
        </Stack>
      </Stack>

      <FooterButton
        aboveButtonComponent={isNeedMoreRecording && recorder.visualizerComponent}
        disabled={
          isLoading || (recorder.isRecording && wordsCount >= minWords) || recorder.isTranscribing
        }
        onClick={async () => {
          if (transcript && wordsCount >= minWords) {
            if (recorder.isRecording) {
              await recorder.stopRecording();
            }
            nextStep();
            return;
          }

          if (recorder.isRecording) {
            recorder.stopRecording();
            return;
          }

          recorder.startRecording();
        }}
        title={
          recorder.isRecording && wordsCount < minWords
            ? i18n._("Done")
            : transcript && wordsCount >= minWords
              ? i18n._("Next")
              : i18n._("Record")
        }
        color={
          recorder.isRecording && wordsCount < minWords
            ? "error"
            : wordsCount > minWords
              ? "success"
              : "primary"
        }
        endIcon={
          recorder.isRecording && wordsCount < minWords ? (
            <Check />
          ) : transcript && wordsCount >= minWords ? (
            <ArrowRight />
          ) : (
            <Mic />
          )
        }
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
          placeholder={""}
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
          const isSelected = option.languageCode === nativeLanguage;
          return (
            <LanguageButton
              onClick={() => setNativeLanguage(option.languageCode)}
              key={option.languageCode}
              label={option.englishName}
              langCode={option.languageCode}
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
  const { languageToLearn, setLanguageToLearn } = useQuiz();
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

  const tgNavigation = useTgNavigation();

  useEffect(() => {
    const off = tgNavigation.addBackHandler(prevStep);
    return off;
  }, [prevStep]);

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
          background: "linear-gradient(to top, rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",
          position: "fixed",
          width: "100dvw",
          left: "0",
          top: 0,
          padding: "0 0 50px 0",
          paddingTop: `calc(${topOffset} + 15px)`,
          zIndex: 2,
          pointerEvents: "none",
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
          top: 0,

          padding: "0 0 0px 0",

          paddingTop: `calc(${topOffset} + 15px)`,

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
