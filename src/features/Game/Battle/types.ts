export interface GameBattle {
  battleId: string;

  usersIds: string[];
  approvedUsersIds: string[];
  rejectedUsersIds: string[];

  createdAtIso: string;
}

export interface BattleQuestion {
  topic: string;
  description: string;
}
