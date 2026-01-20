import { CHAT_MESSAGE_POINTS } from "@/features/Chat/data";
import { BATTLE_WIN_POINTS } from "../Battle/data";
import {
  IncreaseGamePointsRequest,
  IncreaseGamePointsResponse,
} from "../types";
import { increaseUserPoints } from "./statsResources";

export const increaseGamePoints = async (
  props: IncreaseGamePointsRequest,
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
      points: CHAT_MESSAGE_POINTS,
      gameAchievement: "chat_message",
    });
  }

  if (
    props.aiConversationId &&
    props.aiConversationUserId &&
    props.aiConversationPoints
  ) {
    await increaseUserPoints({
      userId: props.aiConversationUserId || "",
      points: props.aiConversationPoints,
      gameAchievement: "ai_conversation",
    });
  }

  return {
    isDone: true,
  };
};
