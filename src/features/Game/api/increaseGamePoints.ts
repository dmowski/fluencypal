import { BATTLE_WIN_POINTS } from "../Battle/data";
import { IncreaseGamePointsRequest, IncreaseGamePointsResponse } from "../types";
import { increaseUserPoints } from "./statsResources";

export const increaseGamePoints = async (
  props: IncreaseGamePointsRequest
): Promise<IncreaseGamePointsResponse> => {
  if (props.battle?.winnerUserId) {
    await increaseUserPoints({
      userId: props.battle.winnerUserId,
      points: BATTLE_WIN_POINTS,
      gameAchievement: "topic_to_discuss",
    });
  }
  if (props.chatMessage && props.chatUserId) {
    await increaseUserPoints({
      userId: props.chatUserId,
      points: 5,
      gameAchievement: "chat_message",
    });
  }

  return {
    isDone: true,
  };
};
