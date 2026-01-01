export interface GameBattleAnswer {
  userId: string;
  questionId: string;

  answer: string;

  updatedAtIso: string;
}

export interface GameBattle {
  battleId: string;

  authorUserId: string;
  usersIds: string[];

  approvedUsersIds: string[];
  rejectedUsersIds: string[];

  createdAtIso: string;

  betPoints: number;

  questionsIds: string[];

  answers: GameBattleAnswer[];
  submittedUsersIds: string[];

  winnerUserId: string | null;
}

// client side only
export interface BattleQuestion {
  topic: string;
  description: string;
}
