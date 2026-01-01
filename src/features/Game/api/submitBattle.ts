import { BATTLE_WIN_POINTS } from "../Battle/data";
import { SubmitBattleRequest, SubmitBattleResponse } from "../types";
import { increaseUserPoints } from "./statsResources";

export const submitBattle = async ({
  battle,
}: SubmitBattleRequest): Promise<SubmitBattleResponse> => {
  if (!battle.winnerUserId) {
    return {
      isDone: true,
    };
  }

  await increaseUserPoints({
    userId: battle.winnerUserId,
    points: BATTLE_WIN_POINTS,
    questionType: "topic_to_discuss",
  });

  return {
    isDone: true,
  };
};
