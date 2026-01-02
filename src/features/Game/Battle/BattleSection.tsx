import { Button, Stack } from "@mui/material";
import { useBattle } from "./useBattle";
import { IS_BATTLE_FEATURE_ENABLED } from "./data";
import { BattleCard } from "./BattleCard";
import { useState } from "react";
import { useLingui } from "@lingui/react";
import { ArrowDown, ChevronDown } from "lucide-react";
import { useAuth } from "@/features/Auth/useAuth";

const defaultLimit = 1;
export const BattleSection = () => {
  const battles = useBattle();
  const { i18n } = useLingui();
  const auth = useAuth();
  const userId = auth.uid;

  const [isLimited, setIsLimited] = useState(true);

  const actualBattles = battles.battles.filter((battle) =>
    userId ? battle.usersIds.includes(userId) : false
  );

  if (actualBattles.length === 0) return null;
  if (!IS_BATTLE_FEATURE_ENABLED) return null;

  const battlesToShow = actualBattles
    .filter((battle) => {
      if (!isLimited) {
        return true;
      }
      return !battle.hiddenByUsersIds?.includes(userId);
    })
    .slice(0, defaultLimit);

  console.log("actualBattles", actualBattles.length, defaultLimit, {
    battlesToShow,
    actualBattles,
  });
  const isNeedToShowMoreButton = battlesToShow.length < actualBattles.length;
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

      {isNeedToShowMoreButton && (
        <Button onClick={() => setIsLimited(false)} endIcon={<ChevronDown />}>
          {battlesToShow.length === 0 ? i18n._(`Show Debates`) : i18n._(`Show More Debates`)}
        </Button>
      )}
    </Stack>
  );
};
