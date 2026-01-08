import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useEffect, useMemo, useState } from "react";
import { dailyQuestions } from "./dailyQuestions";
import dayjs from "dayjs";
import { Check, ChevronRight, Languages, Mic, Sparkles } from "lucide-react";
import { getWordsCount } from "@/libs/words";
import { useAuth } from "@/features/Auth/useAuth";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useSettings } from "@/features/Settings/useSettings";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/features/Firebase/firebaseDb";
import { DailyQuestionAnswer } from "./types";
import { and, doc, or, orderBy, query, setDoc, where } from "firebase/firestore";
import { useTranslate } from "@/features/Translation/useTranslate";
import { QuestionComment } from "./QuestionComment";
import { sendTelegramRequest } from "@/features/Telegram/sendTextAiRequest";
import { useCorrections } from "@/features/Corrections/useCorrections";
import { RecordUserAudioAnswer } from "@/features/Survey/RecordUserAudioAnswer";
import { ColorIconTextList } from "@/features/Survey/ColorIconTextList";

export const DailyQuestionBadge = () => {
  const { i18n } = useLingui();
  const todayIsoDate = dayjs().format("YYYY-MM-DD");
  const todaysQuestion = dailyQuestions[todayIsoDate];
  const questionId = todaysQuestion?.id;

  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf("day").diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  const [isStartAnswering, setIsStartAnswering] = useState(false);

  const auth = useAuth();
  const userId = auth.uid;
  const settings = useSettings();

  const collectionRef = db.collections.dailyQuestionsAnswers(userId);
  const queryRef = useMemo(() => {
    if (!collectionRef || !settings.languageCode || !userId) return null;
    return query(
      collectionRef,
      and(
        where("answerLanguage", "==", settings.languageCode),
        or(where("isPublished", "==", true), where("authorUserId", "==", userId))
      ),
      orderBy("updatedAtIso", "desc")
    );
  }, [collectionRef, settings.languageCode, userId]);

  const [allAnswers] = useCollection(queryRef);

  const myAnswer = allAnswers?.docs.find((answer) => {
    const answerData = answer.data();
    return answerData.authorUserId === userId && answerData.questionId === questionId;
  });
  const myAnswerData = myAnswer?.data() || null;
  const transcript = myAnswer?.data().transcript || "";
  const answerDocId = myAnswer?.id;
  const isCurrentAnswerIsPublished = myAnswerData?.isPublished || false;

  const updateTranscript = (newTranscript: string) => {
    if (!myAnswer || !answerDocId || !myAnswerData) {
      createAnswer(newTranscript);
      return;
    }
    const updates: Partial<DailyQuestionAnswer> = {
      transcript: newTranscript,
    };

    updateTranscriptInDb({ ...updates, isPublished: false }, myAnswerData, answerDocId);
  };

  const updateTranscriptInDb = async (
    updates: Partial<DailyQuestionAnswer>,
    myAnswerData: DailyQuestionAnswer,
    documentId: string
  ) => {
    if (!collectionRef || !documentId)
      throw new Error("❌ collectionRef is not defined | updateTranscriptInDb");

    const docRef = doc(collectionRef, documentId);
    const updatedFullDate: DailyQuestionAnswer = {
      ...myAnswerData,
      ...updates,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(docRef, updatedFullDate, { merge: true });
  };

  const createAnswer = async (newTranscript: string) => {
    if (!collectionRef || !questionId || !userId)
      throw new Error("❌ collectionRef is not defined | createAnswer");

    const newData: DailyQuestionAnswer = {
      authorUserId: userId,
      questionId: questionId,
      answerLanguage: settings.languageCode || "en",
      transcript: newTranscript,
      isPublished: false,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(doc(collectionRef), newData);
  };

  const recorder = useAudioRecorder({
    visualizerComponentWidth: "100%",
  });

  useEffect(() => {
    if (recorder.transcription) {
      updateTranscript(recorder.transcription);
    }
  }, [recorder.transcription]);

  const clearTranscript = () => {
    if (transcript) {
      updateTranscript("");
    }
  };

  const minWords = 30;
  const wordsCount = getWordsCount(transcript || "");

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsStartAnswering(!isStartAnswering);
  };

  const publishAnswer = async () => {
    if (!myAnswerData || !answerDocId) {
      return;
    }

    await updateTranscriptInDb(
      {
        transcript,
        isPublished: true,
      },
      myAnswerData,
      answerDocId
    );

    sendTelegramRequest(
      {
        message: `New daily question answer published:\n\n${transcript}\n\n ---\n\nQuestion: ${todaysQuestion.title}`,
      },
      await auth.getToken()
    );
  };

  const thisQuestionAnswers = useMemo(() => {
    if (!allAnswers) return [];
    return allAnswers.docs.filter((answer) => answer.data().questionId === questionId);
  }, [allAnswers, questionId]);
  const peopleAnswered = thisQuestionAnswers.length;
  const isIamAnsweredThisQuestion = Boolean(
    thisQuestionAnswers.find(
      (answer) => answer.data().authorUserId === userId && answer.data().isPublished
    )
  );
  const correction = useCorrections();
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const aiSuggestion = myAnswerData?.aiSuggestion?.correctedMessage || "";
  const aiSuggestionRate = myAnswerData?.aiSuggestion?.rate || null;

  const analyzeAnswer = async () => {
    if (
      !transcript ||
      !myAnswerData ||
      !answerDocId ||
      myAnswerData?.aiSuggestion?.sourceMessage === transcript
    ) {
      return;
    }

    setIsLoadingAiSuggestion(true);
    console.log("Analyzing answer for daily question...");
    const suggestion = await correction.analyzeDailyQuestionAnswerMessage({
      question: todaysQuestion,
      userAnswer: transcript,
    });

    await updateTranscriptInDb(
      {
        aiSuggestion: {
          rate: suggestion.rate || null,
          sourceMessage: transcript,
          correctedMessage: suggestion.suggestedMessage,
        },
      },
      myAnswerData,
      answerDocId
    );
    setIsLoadingAiSuggestion(false);
  };

  useEffect(() => {
    if (!transcript) return;
    analyzeAnswer();
  }, [transcript]);

  const translation = useTranslate();
  if (!todaysQuestion) {
    return null;
  }
  return (
    <Stack
      onClick={isStartAnswering ? undefined : onClick}
      key={todayIsoDate}
      sx={{
        padding: "21px 20px 24px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "15px",
        width: "100%",
        height: "auto",
        cursor: isStartAnswering ? "initial" : "pointer",

        background: isStartAnswering ? "rgba(115, 25, 35, 0.2)" : "rgba(115, 25, 35, 0.31)",
        boxShadow: isStartAnswering
          ? "0px 0px 0px 1px rgba(255, 255, 255, 0.2)"
          : "0px 0px 0px 1px rgba(255, 255, 255, 0.031)",
        flexDirection: "row",
        transition: "all 0.3s ease",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        minHeight: "120px",
        gridTemplateColumns: "1fr",
      }}
    >
      <Stack
        sx={{
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            color: "#feb985ff",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <img
              src="/icons/flame-icon.svg"
              style={{ width: 20, height: 20, position: "relative", top: "-2px", left: "-1px" }}
            />
            <Typography
              variant="body2"
              sx={{
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {i18n._("Daily Question")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "#faae98",
            }}
          >
            {hoursLeft}h left
          </Typography>
        </Stack>

        <Typography
          sx={{
            paddingTop: "10px",
            fontSize: "1.7rem",
            fontWeight: 560,
            lineHeight: 1.2,
            "@media (max-width:600px)": {
              fontSize: "1.5rem",
            },
          }}
        >
          {todaysQuestion.title}
        </Typography>

        {isStartAnswering ? (
          <Stack>
            <Typography
              sx={{
                paddingTop: "5px",
                fontSize: "0.9rem",
                fontWeight: 350,
                lineHeight: 1.2,
                color: "#fff",
                opacity: 0.96,
              }}
            >
              {todaysQuestion.description}
            </Typography>
            <Stack
              sx={{
                gap: "0px",
                paddingTop: "20px",
              }}
            >
              {!isCurrentAnswerIsPublished && (
                <>
                  <Stack
                    sx={{
                      gap: "10px",
                    }}
                  >
                    <ColorIconTextList
                      listItems={todaysQuestion.hints.map((hint) => ({
                        title: hint,
                        iconName: "lightbulb",
                      }))}
                      iconSize={"20px"}
                      gap="10px"
                    />
                    {translation.translateModal}
                    <Stack
                      sx={{
                        flexDirection: "row",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        onClick={(e) => {
                          const hintText = [todaysQuestion.description, ...todaysQuestion.hints]
                            .map((h) => `* ${h}`)
                            .join("\n")
                            .trim();
                          const fullText = `${todaysQuestion.title || ""}\n\n${hintText}`.trim();

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
                  <Stack
                    sx={{
                      paddingTop: "15px",
                      gap: "20px",
                    }}
                  >
                    <RecordUserAudioAnswer
                      transcript={transcript}
                      minWords={minWords}
                      isLoading={false}
                      isTranscribing={recorder.isTranscribing}
                      visualizerComponent={recorder.visualizerComponent}
                      isRecording={recorder.isRecording}
                      stopRecording={recorder.stopRecording}
                      startRecording={recorder.startRecording}
                      clearTranscript={clearTranscript}
                      error={recorder.error}
                    />

                    {transcript && (
                      <Stack
                        sx={{
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "12px 12px 15px 10px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          gap: "12px",
                        }}
                      >
                        <Stack
                          sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {(aiSuggestionRate || 0) >= 8 && (
                            <Stack
                              sx={{
                                padding: "7px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(76, 175, 80, 0.9)",
                              }}
                            >
                              <Sparkles color="#fff" size={"14px"} />
                            </Stack>
                          )}
                          <Typography
                            variant="body1"
                            sx={{
                              opacity: 0.8,
                            }}
                            className={isLoadingAiSuggestion ? "loading-shimmer" : ""}
                          >
                            <b>{i18n._("Analysis")}</b>:{" "}
                            {isLoadingAiSuggestion
                              ? "Loading..."
                              : aiSuggestionRate && `${aiSuggestionRate || 0}/10`}
                            {aiSuggestionRate && <> {aiSuggestionRate >= 8 && i18n._("Great!")}</>}
                          </Typography>
                        </Stack>

                        {(aiSuggestionRate || 0) < 8 && (
                          <Stack
                            sx={{
                              gap: "8px",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                opacity: 0.8,
                              }}
                              className={isLoadingAiSuggestion ? "loading-shimmer" : ""}
                            >
                              <b>{i18n._("Suggestion")}</b>:{" "}
                              {aiSuggestion ||
                                (transcript
                                  ? i18n._("Suggestion is loading...")
                                  : i18n._("Record your answer to see AI suggestion"))}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    )}

                    <Stack
                      sx={{
                        gap: "5px",
                      }}
                    >
                      <Button
                        disabled={wordsCount <= minWords || recorder.isRecording}
                        onClick={publishAnswer}
                        size="large"
                        variant="contained"
                        color={"primary"}
                        endIcon={<Check />}
                      >
                        {i18n._("Publish")}
                      </Button>
                      <Typography align="center" variant="caption" color="text.secondary">
                        {i18n._(`To see others answers, you need to publish yours.`)}
                      </Typography>
                      <Button
                        sx={{
                          marginTop: "30px",
                        }}
                        onClick={() => {
                          setIsStartAnswering(false);
                          if (recorder.isRecording) {
                            recorder.cancelRecording();
                          }
                        }}
                      >
                        {i18n._("Close")}
                      </Button>
                    </Stack>
                  </Stack>
                </>
              )}

              {isCurrentAnswerIsPublished && (
                <Stack
                  sx={{
                    gap: "10px",
                  }}
                >
                  {thisQuestionAnswers.map((answerDocument, index) => {
                    const answer = answerDocument.data();
                    const answerDocId = answerDocument.id;
                    return (
                      <QuestionComment
                        answerDocId={answerDocId}
                        key={index}
                        answer={answer}
                        togglePublish={() => {
                          updateTranscriptInDb(
                            {
                              transcript: answer.transcript,
                              isPublished: !answer.isPublished,
                            },
                            answer,
                            answerDocId
                          );
                        }}
                      />
                    );
                  })}

                  <Stack
                    sx={{
                      gap: "10px",
                      paddingTop: "40px",
                      width: "100%",
                    }}
                  >
                    <Typography variant="h6">{i18n._("Previous questions")}</Typography>

                    {Object.entries(dailyQuestions)
                      .filter(([date]) => date < todayIsoDate)
                      .slice(-3)
                      .map(([date, question]) => {
                        const questionDate = dayjs(date).format("MMM D");
                        const answersForThisQuestion =
                          allAnswers?.docs.filter(
                            (answer) =>
                              answer.data().questionId === question.id && answer.data().isPublished
                          ) || [];
                        if (answersForThisQuestion.length === 0) return <Stack key={date} />;
                        return (
                          <Stack
                            key={date}
                            sx={{
                              width: "100%",
                              gap: "10px",
                            }}
                          >
                            <Typography sx={{}} variant="body2">
                              {question.title}
                            </Typography>

                            {answersForThisQuestion.length > 0 && (
                              <Stack
                                sx={{
                                  gap: "6px",
                                  width: "100%",
                                }}
                              >
                                {answersForThisQuestion.map((answerDocument, index) => {
                                  const answer = answerDocument.data();
                                  const answerDocId = answerDocument.id;
                                  return (
                                    <QuestionComment
                                      answerDocId={answerDocId}
                                      key={index}
                                      answer={answer}
                                      togglePublish={() => {
                                        updateTranscriptInDb(
                                          {
                                            transcript: answer.transcript,
                                            isPublished: !answer.isPublished,
                                          },
                                          answer,
                                          answerDocId
                                        );
                                      }}
                                    />
                                  );
                                })}
                              </Stack>
                            )}
                          </Stack>
                        );
                      })}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        ) : (
          <Typography
            sx={{
              paddingTop: "5px",
              fontSize: "0.9rem",
              fontWeight: 350,
              lineHeight: 1.2,
              color: "#fff",
              opacity: 0.96,
            }}
          >
            {peopleAnswered === 1
              ? i18n._(
                  "One person has already answered - check out the answer and share your thoughts."
                )
              : peopleAnswered > 0
                ? i18n._(
                    "{peopleAnswered} people have already answered - see what they said and share your thoughts.",
                    { peopleAnswered }
                  )
                : i18n._("Be the first to respond and share your thoughts.")}
          </Typography>
        )}

        {!isStartAnswering && (
          <Stack
            sx={{
              paddingTop: "25px",
              width: "max-content",
              flexDirection: "row",
              gap: "10px",
            }}
          >
            <Button
              onClick={onClick}
              variant="outlined"
              endIcon={
                isIamAnsweredThisQuestion ? <Check size={"18px"} /> : <ChevronRight size={"18px"} />
              }
              sx={{
                color: "#fff",
                borderColor: "#fff",
              }}
            >
              {isIamAnsweredThisQuestion ? i18n._("See Answers") : i18n._("Open")}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
