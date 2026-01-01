import { useLingui } from "@lingui/react";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useBattle } from "./useBattle";
import { GameBattle } from "./types";
import { useGame } from "../useGame";
import { GameStatRow } from "../GameStatRow";
import dayjs from "dayjs";
import { useAuth } from "@/features/Auth/useAuth";
import { Badge, BadgeCheck, Mic, Swords, Trash } from "lucide-react";
import { IS_BATTLE_FEATURE_ENABLED } from "./data";

export const BattleRow = ({ battle }: { battle: GameBattle }) => {
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

              {isAcceptedByAll && (
                <Button variant="contained" color="info" startIcon={<Mic />} onClick={() => {}}>
                  {i18n._("Start Debate")}
                </Button>
              )}
              <IconButton
                onClick={() => {
                  const isConfirm = confirm(i18n._("Are you sure you want to reject this battle?"));
                  if (isConfirm) battles.deleteBattle(battle.battleId);
                }}
                color="error"
                size="small"
              >
                <Trash size={"16px"} />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const BattleCard = ({ userId }: { userId?: string }) => {
  const { i18n } = useLingui();
  const battles = useBattle();

  const battlesToShow = battles.battles.filter((battle) => {
    if (userId) {
      return battle.usersIds.includes(userId);
    }
    return true;
  });

  if (battlesToShow.length === 0) return null;
  if (!IS_BATTLE_FEATURE_ENABLED) return null;
  return (
    <Stack
      sx={{
        gap: "20px",
        width: "100%",
      }}
    >
      {battlesToShow.map((battle) => (
        <BattleRow key={battle.battleId} battle={battle} />
      ))}
    </Stack>
  );
};
