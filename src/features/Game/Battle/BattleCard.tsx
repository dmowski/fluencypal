import { useLingui } from "@lingui/react";
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useBattle } from "./useBattle";
import { GameBattle } from "./types";
import { useGame } from "../useGame";
import { GameStatRow } from "../GameStatRow";
import dayjs from "dayjs";
import { useAuth } from "@/features/Auth/useAuth";
import { Badge, BadgeCheck, CircleEllipsis, Crown, Mic, Swords, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useBattleQuestions } from "./useBattleQuestions";
import { RecordUserAudio } from "@/features/Goal/Quiz/RecordUserAudio";
import { useSettings } from "@/features/Settings/useSettings";
import { BATTLE_WIN_POINTS } from "./data";

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

  const gameStats = game.stats.filter((stat) => users.includes(stat.userId));

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
      battle.questionsIds.indexOf(activeQuestionId) === battle.questionsIds.length - 1;

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
    (answer) => answer.questionId === activeQuestionId && answer.userId === auth.uid
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
                        gap: "80px",
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
                            }}
                          >
                            <Stack
                              key={stat.userId}
                              sx={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <GameStatRow stat={stat} />
                              <Stack
                                sx={{
                                  width: "30px",
                                  height: "30px",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {isWinner ? (
                                  <Crown color="gold" />
                                ) : (
                                  <X color="rgba(255, 255, 255, 0.5)" />
                                )}
                              </Stack>
                            </Stack>
                            <Stack
                              sx={{
                                gap: "50px",
                              }}
                            >
                              {battle.questionsIds.map((questionId) => {
                                const question = questions[questionId];
                                const answerObj = battle.answers.find(
                                  (a) => a.questionId === questionId && a.userId === stat.userId
                                );
                                return (
                                  <Stack
                                    key={questionId}
                                    sx={{
                                      gap: "15px",
                                    }}
                                  >
                                    <Stack>
                                      <Typography variant="caption">{question.topic}</Typography>
                                      <Typography variant="h5">{question.description}</Typography>
                                    </Stack>
                                    <Typography>{answerObj?.answer || "-"}</Typography>
                                  </Stack>
                                );
                              })}
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>

                    <Stack
                      sx={{
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        padding: "15px",
                        borderRadius: "10px",
                      }}
                    >
                      <Typography>
                        {battle.winnerDescription || i18n._("No reason provided.")}
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              }
              actionButtonTitle={i18n._("Close")}
              width={"600px"}
              onClick={onClose}
            />
          )}

          {!isWinnerDeclared && isShowLastStep && (
            <InfoStep
              title={i18n._("Debate completed!")}
              subTitle={i18n._("You have completed all the questions.")}
              actionButtonTitle={i18n._("Submit Answers")}
              width={"600px"}
              disabled={isSubmitting}
              onClick={onSubmitAnswers}
            />
          )}

          {!isWinnerDeclared && !isShowLastStep && activeQuestion && activeQuestionId && (
            <Stack>
              <RecordUserAudio
                title={activeQuestion.topic}
                subTitle={activeQuestion.description}
                listItems={[]}
                transcript={activeTranscript}
                minWords={30}
                lang={lang}
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
                  gap: "10px",
                }}
              >
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
                  variant="outlined"
                >
                  Submit
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
                    "Your answers will be visible to your opponent after you submit them."
                  ),
                  iconName: "eye",
                },
                {
                  title: i18n._("AI will evaluate answers and determine the winner."),
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

export const BattleCard = ({ battle }: { battle: GameBattle }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const battles = useBattle();
  const game = useGame();
  const users = battle.usersIds.sort((a, b) => {
    if (a === battle.authorUserId) return -1;
    if (b === battle.authorUserId) return 1;
    return 0;
  });

  const gameStats = game.stats.filter((stat) => users.includes(stat.userId));

  const createdAgo = dayjs(battle.createdAtIso).fromNow();
  const isMyBattle = battle.usersIds.includes(auth.uid || "");
  const isAcceptedByMe = battle.approvedUsersIds.includes(auth.uid || "");
  const isAcceptedByAll = battle.approvedUsersIds.length === battle.usersIds.length;

  const [isShowMenu, setIsShowMenu] = useState<null | HTMLElement>(null);

  const [isActiveModal, setIsActiveModal] = useState(false);
  const openBattle = () => {
    setIsActiveModal(true);
  };

  const isSubmittedByMe = battle.submittedUsersIds.includes(auth.uid || "");

  return (
    <Stack
      sx={{
        padding: "21px 20px 24px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "8px",
        width: "100%",
        height: "auto",

        background: "rgba(22, 25, 35, 1)",
        boxShadow: "0px 0px 0px 1px rgba(255, 255, 255, 0.2)",
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
      {isActiveModal && (
        <BattleActionModal battle={battle} onClose={() => setIsActiveModal(false)} />
      )}
      <Stack
        sx={{
          width: "100%",
          gap: "20px",
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
              {i18n._("Debate")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            {createdAgo}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: "10px",
          }}
        >
          {gameStats.map((stat) => {
            const isAccepted = battle.approvedUsersIds.includes(stat.userId);
            const isAnswerSubmitted = battle.submittedUsersIds.includes(stat.userId);
            const isWinnerDeclared = Boolean(battle.winnerUserId);
            const isWinner = stat.userId === battle.winnerUserId;
            return (
              <Stack
                key={stat.userId}
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <GameStatRow stat={stat} />
                {isWinnerDeclared ? (
                  <>{isWinner ? <Crown color="gold" /> : <X color="rgba(255, 255, 255, 0.1)" />}</>
                ) : (
                  <>
                    {isAcceptedByAll ? (
                      <>
                        {isAnswerSubmitted ? (
                          <Mic color="rgba(96, 165, 250, 1)" />
                        ) : (
                          <Mic color="rgba(90, 90, 90, 1)" />
                        )}
                      </>
                    ) : (
                      <>
                        {isAccepted ? (
                          <BadgeCheck color="rgba(96, 165, 250, 1)" />
                        ) : (
                          <Badge color="rgba(255, 255, 255, 0.7)" />
                        )}
                      </>
                    )}
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {isMyBattle && (
            <>
              {!isAcceptedByMe && (
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<Swords />}
                    onClick={() => {
                      battles.acceptBattle(battle.battleId);
                    }}
                  >
                    {i18n._("Accept")}
                  </Button>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {i18n._("Winner gets {points} points", { points: battle.betPoints })}
                  </Typography>
                </Stack>
              )}

              {isAcceptedByMe && !isAcceptedByAll && (
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  {i18n._("Waiting for other players to accept...")}
                </Typography>
              )}

              {isAcceptedByAll && !isSubmittedByMe && !battle.winnerUserId && (
                <Button variant="contained" color="info" startIcon={<Mic />} onClick={openBattle}>
                  {i18n._("Start Debate")}
                </Button>
              )}

              {battle.winnerUserId && (
                <Button variant="text" color="info" startIcon={<Crown />} onClick={openBattle}>
                  {i18n._("Open results")}
                </Button>
              )}

              {isSubmittedByMe && (
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  {i18n._("You have submitted your answers. Waiting for others...")}
                </Typography>
              )}

              <IconButton onClick={(e) => setIsShowMenu(e.currentTarget)} size="small">
                <CircleEllipsis size={"16px"} />
              </IconButton>
              <Menu
                anchorEl={isShowMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                open={Boolean(isShowMenu)}
                onClose={() => setIsShowMenu(null)}
              >
                <MenuItem
                  sx={{}}
                  onClick={() => {
                    const isConfirm = confirm(
                      i18n._("Are you sure you want to reject this battle?")
                    );
                    if (isConfirm) battles.deleteBattle(battle.battleId);
                  }}
                >
                  <ListItemIcon>
                    <Trash />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography>{i18n._("Remove debate")}</Typography>
                  </ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
