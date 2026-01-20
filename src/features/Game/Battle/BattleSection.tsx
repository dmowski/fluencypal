import { Button, Stack } from "@mui/material";
import { useBattle } from "./useBattle";
import { BattleCard } from "./BattleCard";
import { useState } from "react";
import { useLingui } from "@lingui/react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/features/Auth/useAuth";
import { ChatProvider } from "@/features/Chat/useChat";

const defaultLimit = 1;

export const BattleSection = () => {
  const battles = useBattle();
  const { i18n } = useLingui();
  const auth = useAuth();
  const userId = auth.uid;

  const [isLimited, setIsLimited] = useState(true);

  const actualBattles = battles.battles
    .filter((battle) => {
      const isMyBattle = userId ? battle.usersIds.includes(userId) : false;
      return isMyBattle;
      //return true;
    })
    .sort((a, b) => {
      return b.updatedAtIso.localeCompare(a.updatedAtIso);
    });

  const battlesToShow = actualBattles
    .filter(
      (battle) => !isLimited || !battle.hiddenByUsersIds?.includes(userId),
    )
    .filter((battle, index) => !isLimited || index < defaultLimit)
    .sort((a, b) => {
      const isAHidden = a.hiddenByUsersIds?.includes(userId) ? 1 : 0;
      const isBHidden = b.hiddenByUsersIds?.includes(userId) ? 1 : 0;
      const aUpdated = a.updatedAtIso;
      const bUpdated = b.updatedAtIso;

      if (isAHidden !== isBHidden) {
        return isAHidden - isBHidden;
      }

      return bUpdated.localeCompare(aUpdated);
    });

  const isNeedToShowMoreButton = battlesToShow.length < actualBattles.length;

  if (actualBattles.length === 0) return null;
  return (
    <Stack
      sx={{
        gap: "5px",
        width: "100%",
        paddingBottom: "20px",
      }}
    >
      <Stack
        sx={{
          gap: "30px",
        }}
      >
        {battlesToShow.map((battle) => (
          <Stack key={battle.battleId}>
            <ChatProvider
              metadata={{
                spaceId: `battle_${battle.battleId}`,
                allowedUserIds: battle.usersIds,
                debateId: battle.battleId,
                isPrivate: true,
                type: "debate",
              }}
            >
              <BattleCard battle={battle} />
            </ChatProvider>
          </Stack>
        ))}
      </Stack>

      {isNeedToShowMoreButton && (
        <Button onClick={() => setIsLimited(false)} endIcon={<ChevronDown />}>
          {battlesToShow.length === 0
            ? i18n._(`Show Debates`)
            : i18n._(`Show More`)}
        </Button>
      )}
    </Stack>
  );
};
