import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppNavigation } from "../../Navigation/useAppNavigation";
import { dailyQuestions } from "./dailyQuestions";
import dayjs from "dayjs";
import { IconTextList, RecordUserAudioAnswer } from "@/features/Goal/Quiz/QuizPage2";
import { ArrowRight, Check, Lightbulb, Mic } from "lucide-react";
import { getWordsCount } from "@/libs/words";
import { useAuth } from "@/features/Auth/useAuth";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useSettings } from "@/features/Settings/useSettings";

export const DailyQuestionBadge = () => {
  const { i18n } = useLingui();
  const appNavigation = useAppNavigation();
  const urlToNavigate = appNavigation.pageUrl("game");
  const todayIsoDate = dayjs().format("YYYY-MM-DD");
  const todaysQuestion = dailyQuestions[todayIsoDate];
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf("day").diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const peopleAnswered = 3;
  const [isStartAnswering, setIsStartAnswering] = useState(false);

  const auth = useAuth();
  const settings = useSettings();
  const [transcript, updateTranscript] = useState("");

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
