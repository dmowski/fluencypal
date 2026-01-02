import { useLingui } from "@lingui/react";
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useBattle } from "./useBattle";
import { GameBattle } from "./types";
import { useGame } from "../useGame";
import { GameStatRow } from "../GameStatRow";
import dayjs from "dayjs";
import { useAuth } from "@/features/Auth/useAuth";
import {
  Badge,
  BadgeCheck,
  CircleEllipsis,
  Crown,
  HatGlasses,
  Mic,
  SquareCheckBig,
  Swords,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";
import { BattleActionModal } from "./BattleActionModal";

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

  const updatedAgo = dayjs(battle.updatedAtIso).fromNow();
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
              {i18n._("Debate Game")}
            </Typography>
          </Stack>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
              color: "rgba(120, 120, 120, 1)",
            }}
          >
            <Typography variant="body2">{updatedAgo}</Typography>
            <Swords size={"14px"} />
          </Stack>
        </Stack>
        {!isAcceptedByMe && (
          <Stack>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              {i18n._("{userName} challenges you to a debate!", {
                userName: game.userNames?.[battle.authorUserId] || i18n._("-"),
              })}
            </Typography>
          </Stack>
        )}

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
                  <>
                    <Stack
                      sx={{
                        background: isWinner
                          ? "linear-gradient(135deg, rgba(52, 133, 255, 1) 0%, rgba(18, 76, 163, 1) 100%)"
                          : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "50%",
                        padding: "12px",
                      }}
                    >
                      {isWinner ? (
                        <Crown color="rgba(255, 255, 255, 1)" size="21px" />
                      ) : (
                        <HatGlasses color="rgba(90, 90, 90, 1)" size="21px" />
                      )}
                    </Stack>
                  </>
                ) : (
                  <>
                    {isAcceptedByAll ? (
                      <>
                        {isAnswerSubmitted ? (
                          <SquareCheckBig color="rgba(96, 165, 250, 1)" />
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
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
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
                        openBattle();
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
                  <>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<Crown />}
                      onClick={openBattle}
                    >
                      {i18n._("Open results")}
                    </Button>

                    <Button color="info" onClick={() => battles.closeBattle(battle.battleId)}>
                      {i18n._("Close")}
                    </Button>
                  </>
                )}

                {isSubmittedByMe && !battle.winnerUserId && (
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {i18n._("You have submitted your answers. Waiting for others...")}
                  </Typography>
                )}
              </Stack>
              <IconButton onClick={(e) => setIsShowMenu(e.currentTarget)} size="small">
                <CircleEllipsis
                  size={"20px"}
                  style={{
                    opacity: 0.7,
                  }}
                />
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
                  //disabled={isAcceptedByAll}
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
                    <Typography>{i18n._("Remove")}</Typography>
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
