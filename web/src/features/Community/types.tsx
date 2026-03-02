export type CommunityPage =
  | 'chat'
  | 'game'
  | 'dm'
  | 'debates'
  | 'daily-questions'
  | 'tech-support'
  | 'leaderboards';

export interface Room {
  id: string;
  title: string;
  description: string;
}
