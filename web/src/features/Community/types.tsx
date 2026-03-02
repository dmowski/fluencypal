export type CommunityPage =
  | 'chat'
  | 'game'
  | 'dm'
  | 'debates'
  | 'daily-questions'
  | 'tech-support'
  | 'leaderboards';

export interface CommunitySpace {
  id: string;
  title: string;
  description: string;
}
