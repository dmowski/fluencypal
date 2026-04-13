import { TurnState } from '../types';

export const calculateTurnScore = (turn: TurnState): number => {
  return turn.correctCount - turn.skipCount;
};

export const calculatePlayerScore = (playerId: string, turns: TurnState[]): number => {
  return turns
    .filter((turn) => turn.playerId === playerId)
    .reduce((total, turn) => total + calculateTurnScore(turn), 0);
};

export const calculateTeamScore = (teamId: string, turns: TurnState[]): number => {
  return turns
    .filter((turn) => turn.teamId === teamId)
    .reduce((total, turn) => total + calculateTurnScore(turn), 0);
};
