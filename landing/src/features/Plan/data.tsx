import { PlanElementMode } from './types';

export const modeCardProps: Record<
  PlanElementMode,
  { startColor: string; endColor: string; bgColor: string; imgUrl: string[] }
> = {
  conversation: {
    startColor: '#03a665',
    endColor: '#3B82F6',
    bgColor: '#A3E635',
    imgUrl: ['/avatar/girl.webp'],
  },
  play: {
    startColor: '#4F46E5',
    endColor: '#086787',
    bgColor: '#990000',
    imgUrl: ['/avatar/talk3.webp', '/avatar/talk2.webp'],
  },
  words: {
    startColor: '#0276c4',
    endColor: '#086787',
    bgColor: '#5EEAD4',
    imgUrl: ['/avatar/words.webp', '/avatar/words2.webp'],
  },
  rule: {
    startColor: '#9d43a3',
    endColor: '#086787',
    bgColor: '#990000',
    imgUrl: ['/avatar/book.webp'],
  },
};

export interface CardColor {
  startColor: string;
  endColor: string;
  bgColor: string;
}

export const cardColors: CardColor[] = [
  {
    startColor: '#3CA6A6',
    endColor: '#4D9DE0',
    bgColor: '#419BBF',
  },
  {
    startColor: '#1e3c72',
    endColor: '#2a5298',
    bgColor: '#234b85',
  },
  {
    startColor: '#42275a',
    endColor: '#734b6d',
    bgColor: '#5e3f61',
  },
  {
    startColor: '#FF9A8B',
    endColor: '#203a43',
    bgColor: '#1a2f37',
  },
  {
    startColor: '#134e5e',
    endColor: '#71b280',
    bgColor: '#3d7868',
  },
  {
    startColor: '#485563',
    endColor: '#29323c',
    bgColor: '#3a434c',
  },
  {
    startColor: '#360033',
    endColor: '#0b8793',
    bgColor: '#276175',
  },
  {
    startColor: '#23074d',
    endColor: '#cc5333',
    bgColor: '#752f3e',
  },
  {
    startColor: '#232526',
    endColor: '#414345',
    bgColor: '#343637',
  },
  {
    startColor: '#283c86',
    endColor: '#45a247',
    bgColor: '#3a7b5e',
  },
];
