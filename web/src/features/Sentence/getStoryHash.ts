import { getHash } from '@/libs/hash';
import { Story } from './types';

export const getStoryHash = (data: Story) => {
  const dataToHash = [data.title, data.textEn, data.subtitle].join('|');
  return getHash(dataToHash);
};
