import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useEffect, useMemo, useState } from "react";
import { dailyQuestions } from "./dailyQuestions";
import dayjs from "dayjs";
import { IconTextList, RecordUserAudioAnswer } from "@/features/Goal/Quiz/QuizPage2";
import { ArrowRight, Check, Eye, EyeOff, Lightbulb, Mic } from "lucide-react";
import { getWordsCount } from "@/libs/words";
import { useAuth } from "@/features/Auth/useAuth";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useSettings } from "@/features/Settings/useSettings";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/features/Firebase/firebaseDb";
import { DailyQuestionAnswer } from "./types";
import { and, doc, or, orderBy, query, setDoc, where } from "firebase/firestore";
import { useGame } from "../useGame";

export const DailyQuestionBadge = () => {
  const { i18n } = useLingui();
  const todayIsoDate = dayjs().format("YYYY-MM-DD");
  const todaysQuestion = dailyQuestions[todayIsoDate];
  const questionId = todaysQuestion?.id;
  const game = useGame();

  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf("day").diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const peopleAnswered = 3;
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
  const allAnswersData = useMemo(
    () => allAnswers?.docs.map((doc) => doc.data()) || [],
    [allAnswers]
  );
  const myAnswer = allAnswers?.docs.find((answer) => {
    const answerData = answer.data();
    return answerData.authorUserId === userId && answerData.questionId === questionId;
  });
  const myAnswerData = myAnswer?.data() || null;
  const transcript = myAnswer?.data().transcript || "";
  const answerDocId = myAnswer?.id;

  const updateTranscript = (newTranscript: string) => {
    if (!myAnswer || !answerDocId || !myAnswerData) {
      createAnswer(newTranscript);
      return;
    }
    updateTranscriptInDb({ newTranscript, isPublished: false }, myAnswerData, answerDocId);
  };

  const updateTranscriptInDb = async (
    { newTranscript, isPublished }: { newTranscript: string; isPublished: boolean },
    myAnswerData: DailyQuestionAnswer,
    documentId: string
  ) => {
    if (!collectionRef || !documentId)
      throw new Error("❌ collectionRef is not defined | updateTranscriptInDb");

    const docRef = doc(collectionRef, documentId);
    const updatedDate: DailyQuestionAnswer = {
      ...myAnswerData,
      transcript: newTranscript,
      updatedAtIso: new Date().toISOString(),
      isPublished: isPublished,
    };
    await setDoc(docRef, updatedDate, { merge: true });
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
    languageCode: settings.languageCode || "en",
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

  const minWords = 30;
  const wordsCount = getWordsCount(transcript || "");
  const isNeedMoreRecording = !transcript || wordsCount < minWords;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsStartAnswering(!isStartAnswering);
  };

  const nextStep = () => {};

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
        borderRadius: "8px",
        width: "100%",
        height: "auto",
        cursor: isStartAnswering ? "initial" : "pointer",

        /*
        background: isStartAnswering
          ? "linear-gradient(170deg, rgba(30, 1, 1, 1) 10%, rgba(20, 12, 12, 1) 100%)"
          : "linear-gradient(170deg, #731923ff 10%, #a12e36 100%)",
        */
        background: isStartAnswering ? "rgba(115, 25, 35, 0.2)" : "rgba(115, 25, 35, 1)",
        boxShadow: isStartAnswering
          ? "0px 0px 0px 1px rgba(255, 255, 255, 0.2)"
          : "0px 0px 0px 1px rgba(255, 255, 255, 0.2)",
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
              {i18n._("Today’s Question")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "#faae98",
            }}
          >
            <Trans>{hoursLeft}h left</Trans>
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
              <Stack
                sx={{
                  display: "flex",
                }}
              >
                <IconTextList
                  listItems={todaysQuestion.hints.map((h) => ({ title: h, icon: Lightbulb }))}
                />
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
                />

                <Stack
                  sx={{
                    "@media (max-width:600px)": {
                      position: "sticky",
                      bottom: "86px",
                      boxShadow: "0px -4px 18px 0px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {isNeedMoreRecording && recorder.visualizerComponent}
                  <Button
                    disabled={
                      (recorder.isRecording && wordsCount >= minWords) || recorder.isTranscribing
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
                    size="large"
                    variant="contained"
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
                  >
                    {recorder.isRecording && wordsCount < minWords
                      ? i18n._("Done")
                      : transcript && wordsCount >= minWords
                        ? i18n._("Next")
                        : i18n._("Record")}
                  </Button>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  paddingTop: "30px",
                  gap: "10px",
                }}
              >
                <Typography>{i18n._("Answers")}</Typography>
                {allAnswers?.docs.map((answerDocument, index) => {
                  const answer = answerDocument.data();
                  const answerDocId = answerDocument.id;
                  const isMyAnswer = answer.authorUserId === userId;
                  return (
                    <Stack
                      key={index}
                      sx={{
                        gap: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        padding: "18px 18px",
                        borderRadius: "8px",
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Stack
                          sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Stack
                            sx={{
                              ".avatar": { width: "40px", height: "40px", borderRadius: "50%" },
                            }}
                          >
                            <img
                              className="avatar"
                              src={game.gameAvatars?.[answer.authorUserId]}
                              alt="User Avatar"
                            />
                          </Stack>
                          <Stack>
                            <Typography key={index} variant="body2" sx={{ fontWeight: 600 }}>
                              {game.userNames?.[answer.authorUserId] || "Unknown User"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(answer.updatedAtIso).fromNow()}
                            </Typography>
                          </Stack>
                        </Stack>
                        {isMyAnswer && (
                          <Stack
                            sx={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Typography variant="caption">
                              {i18n._("This is your answer")}
                            </Typography>
                            <Stack
                              sx={{
                                backgroundColor: answer.isPublished
                                  ? "#4caf50"
                                  : "rgba(255, 255, 255, 0.2)",
                                padding: "2px 10px",
                                borderRadius: "6px",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {answer.isPublished ? (
                                <Eye size={"12px"} />
                              ) : (
                                <EyeOff size={"12px"} />
                              )}
                              <Typography
                                variant="caption"
                                sx={{
                                  textTransform: "uppercase",
                                }}
                              >
                                {answer.isPublished ? i18n._("published") : i18n._("not published")}{" "}
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                      <Typography variant="body2">{answer.transcript}</Typography>
                      <Stack
                        sx={{
                          flexDirection: "row",
                        }}
                      >
                        {isMyAnswer && (
                          <>
                            <Button
                              startIcon={
                                answer.isPublished ? (
                                  <EyeOff size={"15px"} />
                                ) : (
                                  <Eye size={"15px"} />
                                )
                              }
                              onClick={() => {
                                updateTranscriptInDb(
                                  {
                                    newTranscript: answer.transcript,
                                    isPublished: !answer.isPublished,
                                  },
                                  answer,
                                  answerDocId
                                );
                              }}
                              variant={answer.isPublished ? "outlined" : "contained"}
                            >
                              {answer.isPublished
                                ? i18n._("Unpublish")
                                : i18n._("Publish an answer")}
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
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
            <Trans>
              {peopleAnswered} people answered already — see what they said & share yours
            </Trans>
          </Typography>
        )}

        <Stack
          sx={{
            paddingTop: "15px",
            width: "max-content",
          }}
        >
          {!isStartAnswering && (
            <Button
              onClick={onClick}
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#fff",
              }}
            >
              {i18n._("Answer Now")}
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
