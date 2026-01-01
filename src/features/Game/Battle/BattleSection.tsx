import { Stack } from "@mui/material";
import { useBattle } from "./useBattle";
import { IS_BATTLE_FEATURE_ENABLED } from "./data";
import { BattleCard } from "./BattleCard";

export const BattleSection = ({ userId }: { userId?: string }) => {
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
        <BattleCard key={battle.battleId} battle={battle} />
      ))}
    </Stack>
  );
};
