import { useLingui } from "@lingui/react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useBattle } from "./useBattle";
import { GameBattle } from "./types";
import { useGame } from "../useGame";
import { GameStatRow } from "../GameStatRow";
import { useAuth } from "@/features/Auth/useAuth";
import { Check, Crown, EyeClosed, HatGlasses, Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useBattleQuestions } from "./useBattleQuestions";
import { RecordUserAudio } from "@/features/Goal/Quiz/RecordUserAudio";
import { useSettings } from "@/features/Settings/useSettings";
import { BATTLE_WIN_POINTS } from "./data";
import { fullLanguageName } from "@/features/Lang/lang";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { ChatSection } from "@/features/Chat/ChatSection";

export const BattleActionModal = ({
  battle,
  onClose,
}: {
  battle: GameBattle;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const battles = useBattle();
  const auth = useAuth();
  const settings = useSettings();
  const lang = settings.languageCode || "en";

  const game = useGame();
  const users = battle.usersIds.sort((a, b) => {
    if (a === battle.authorUserId) return -1;
    if (b === battle.authorUserId) return 1;
    return 0;
  });

  const gameStats = game.stats
    .filter((stat) => users.includes(stat.userId))
    .sort((a, b) => {
      if (battle.winnerUserId) {
        if (a.userId === battle.winnerUserId) return -1;
        if (b.userId === battle.winnerUserId) return 1;
      }

      if (a.userId === battle.authorUserId) return -1;
      if (b.userId === battle.authorUserId) return 1;
      return 0;
    });

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const { questions } = useBattleQuestions();
  const activeQuestion = questions[activeQuestionId || ""];

  const [isShowLastStep, setIsShowLastStep] = useState(false);

  const nextQuestion = () => {
    if (!activeQuestionId) {
      setActiveQuestionId(battle.questionsIds[0]);
      return;
    }

    const isLastQuestion =
      battle.questionsIds.indexOf(activeQuestionId) ===
      battle.questionsIds.length - 1;

    if (isLastQuestion) {
      setIsShowLastStep(true);
      return;
    }

    const currentIndex = battle.questionsIds.indexOf(activeQuestionId);
    const nextIndex = currentIndex + 1;
    const nextQuestionId = battle.questionsIds[nextIndex];
    setActiveQuestionId(nextQuestionId);
  };

  const activeQuestionsAnswer = battle.answers.find(
    (answer) =>
      answer.questionId === activeQuestionId && answer.userId === auth.uid,
  );

  const activeTranscript = activeQuestionsAnswer?.answer || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmitAnswers = async () => {
    setIsSubmitting(true);
    const { isWinnerExists } = await battles.submitAnswers(battle.battleId);
    setIsSubmitting(false);

    if (!isWinnerExists) {
      onClose();
    }
  };

  const isWinnerDeclared = Boolean(battle.winnerUserId);
  const [textAnswer, setTextAnswer] = useState("");
  useEffect(() => {
    setTextAnswer(activeTranscript);
  }, [activeTranscript]);

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "600px",
          }}
        >
          {isWinnerDeclared && (
            <InfoStep
              title={i18n._("Debate ended!")}
              subTitle={i18n._("The winner has been declared.")}
              subComponent={
                <>
                  <Stack
                    sx={{
                      gap: "20px",
                    }}
                  >
                    <Stack
                      sx={{
                        gap: "40px",
                        padding: "20px 0 5px 0",
                      }}
                    >
                      {gameStats.map((stat) => {
                        const isWinner = stat.userId === battle.winnerUserId;
                        return (
                          <Stack
                            key={stat.userId}
                            sx={{
                              gap: "25px",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "12px",
                              backgroundColor: "rgba(255, 255, 255, 0.01)",
                              overflow: "hidden",
                              borderColor: isWinner
                                ? "rgba(20, 111, 214, 1)"
                                : "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Stack
                              sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                                gap: "10px",
                                padding: "15px",
                                backgroundColor: isWinner
                                  ? "rgba(20, 111, 214, 1)"
                                  : "rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "20px",
                                  fontWeight: 600,
                                }}
                              >
                                {isWinner
                                  ? i18n._("Winner!")
                                  : i18n._("Second Place")}
                              </Typography>
                              {isWinner ? (
                                <Crown
                                  color="rgba(255, 255, 255, 1)"
                                  size="24px"
                                />
                              ) : (
                                <HatGlasses
                                  color="rgba(255, 255, 255, 1)"
                                  size="24px"
                                />
                              )}
                            </Stack>

                            <Stack
                              sx={{
                                padding: "0 15px 30px 15px",
                                gap: "40px",
                              }}
                            >
                              <GameStatRow stat={stat} />
                              <Stack
                                sx={{
                                  gap: "50px",
                                  color: "rgba(255, 255, 255, 0.9)",
                                }}
                              >
                                {battle.questionsIds.map((questionId) => {
                                  const question = questions[questionId];
                                  const answerObj = battle.answers.find(
                                    (a) =>
                                      a.questionId === questionId &&
                                      a.userId === stat.userId,
                                  );
                                  return (
                                    <Stack
                                      key={questionId}
                                      sx={{
                                        gap: "15px",
                                      }}
                                    >
                                      <Stack>
                                        <Typography variant="caption">
                                          {question.topic}
                                        </Typography>
                                        <Typography variant="h5">
                                          {question.description}
                                        </Typography>
                                      </Stack>
                                      <Typography
                                        sx={{
                                          fontSize: "18px",
                                        }}
                                      >
                                        {answerObj?.answer || "-"}
                                      </Typography>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>

                    <Stack
                      sx={{
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background:
                          "linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(238, 238, 238, 0.01) 100%)",

                        borderRadius: "12px",
                        overflow: "hidden",
                        gap: "0px",
                        borderColor: "rgba(173, 33, 61, 0.7)",
                      }}
                    >
                      <Stack
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexDirection: "row",
                          gap: "10px",
                          padding: "15px",
                          backgroundColor: "rgba(118, 11, 33, 1)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "rgba(255, 243, 253, 0.8)",
                          }}
                        >
                          {i18n._("AI Decision")}
                        </Typography>

                        <Scale color="rgba(255, 255, 255, 1)" size="24px" />
                      </Stack>

                      <Stack
                        sx={{
                          padding: "15px",

                          color: "rgba(255, 243, 253, 0.8)",
                          "*": {
                            lineHeight: "1.6",
                          },
                        }}
                      >
                        <Markdown>
                          {"\n" +
                            (battle.winnerDescription ||
                              i18n._("No reason provided."))}
                        </Markdown>
                      </Stack>
                    </Stack>

                    <Stack
                      sx={{
                        gap: "10px",
                        paddingTop: "10px",
                        paddingBottom: "20px",
                      }}
                    >
                      <Stack>
                        <Typography variant="h6">
                          {i18n._(`Comments:`)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          {i18n._(`You can discuss the battle here.`)}
                        </Typography>
                      </Stack>
                      <ChatSection
                        placeholder={i18n._("How the battle went?")}
                        contextForAiAnalysis=""
                      />
                    </Stack>
                  </Stack>
                </>
              }
              actionButtonTitle={i18n._("Close")}
              actionButtonEndIcon={<Check />}
              width={"600px"}
              onClick={onClose}
            />
          )}

          {!isWinnerDeclared && isShowLastStep && (
            <InfoStep
              title={
                isSubmitting
                  ? i18n._("Processing answers...")
                  : i18n._("Almost there!")
              }
              subTitle={
                isSubmitting
                  ? i18n._(
                      "You have answered all the questions. Submitting your answers now... Don't close this window.",
                    )
                  : i18n._(
                      "You have completed all the questions. Submit your answers now and wait for the results.",
                    )
              }
              actionButtonTitle={i18n._("Submit Answers")}
              actionButtonEndIcon={<Check />}
              listItems={[]}
              width={"600px"}
              disabled={isSubmitting}
              onClick={onSubmitAnswers}
            />
          )}

          {!isWinnerDeclared &&
            !isShowLastStep &&
            activeQuestion &&
            activeQuestionId && (
              <Stack>
                <RecordUserAudio
                  title={activeQuestion.description}
                  subTitle={activeQuestion.topic}
                  listItems={[
                    {
                      title: i18n._("Use your learning language ({lang})", {
                        lang: fullLanguageName[lang],
                      }),
                      iconName: "languages",
                    },
                    {
                      title: i18n._(
                        "Your goal is not to be perfect, but to surpass your opponent.",
                      ),
                      iconName: "rocket",
                    },
                    {
                      title: i18n._(
                        "The answer should not take more than 300 words. ~2 minutes.",
                      ),
                      iconName: "timer",
                    },
                  ]}
                  transcript={activeTranscript}
                  minWords={30}
                  maxWords={300}
                  subTitleComponent={<></>}
                  nextStep={nextQuestion}
                  updateTranscript={async (combinedTranscript) => {
                    console.log("combinedTranscript", combinedTranscript);
                    await battles.updateAnswerTranscription({
                      battleId: battle.battleId,
                      questionId: activeQuestionId,
                      transcription: combinedTranscript,
                    });
                  }}
                />
                <Stack
                  sx={{
                    width: "100%",
                    gap: "15px",
                    padding: "20px 10px 0 10px",
                    display: "none",
                  }}
                >
                  <Typography variant="caption">
                    {i18n._("You can use text to answer if you prefer.")}
                  </Typography>
                  <TextField
                    label={i18n._("Your answer")}
                    placeholder={i18n._("Type your answer here...")}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    multiline
                    minRows={3}
                  />
                  <Button
                    onClick={async () => {
                      await battles.updateAnswerTranscription({
                        battleId: battle.battleId,
                        questionId: activeQuestionId,
                        transcription: textAnswer,
                      });
                    }}
                    variant="text"
                    disabled={
                      textAnswer === activeTranscript ||
                      textAnswer.trim().length === 0
                    }
                  >
                    {i18n._("Add Text Answer")}
                  </Button>
                </Stack>
              </Stack>
            )}

          {!isWinnerDeclared && !isShowLastStep && !activeQuestionId && (
            <InfoStep
              title={i18n._("Debate started!")}
              subTitle={i18n._("Let's see who has the best arguments.")}
              actionButtonTitle={i18n._("Next")}
              width={"600px"}
              listItems={[
                {
                  title: i18n._("The winner earns {points} game points!", {
                    points: BATTLE_WIN_POINTS,
                  }),
                  iconName: "coins",
                },
                {
                  title: i18n._(
                    "Your answers will be visible to your opponent after you submit them.",
                  ),
                  iconName: "eye",
                },
                {
                  title: i18n._(
                    "AI will evaluate answers and determine the winner.",
                  ),
                  iconName: "crown",
                },
              ]}
              subComponent={
                <>
                  <Stack
                    sx={{
                      gap: "10px",
                      padding: "20px 0 5px 0",
                    }}
                  >
                    {gameStats.map((stat) => (
                      <GameStatRow stat={stat} key={stat.userId} />
                    ))}
                  </Stack>
                </>
              }
              onClick={nextQuestion}
            />
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
