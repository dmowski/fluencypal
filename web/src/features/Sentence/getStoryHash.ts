import { getHash } from '@/libs/hash';
import { Story } from './types';
import { SupportedLanguage } from '../Lang/lang';

export const getStoryHash = (data: Story, languageToLean: SupportedLanguage) => {
  const dataHash = [data.title, data.textEn, data.subtitle || '']
    .filter(Boolean)
    .map((str) => getHash(str))
    .join('|');
  return dataHash + '_' + languageToLean;
};
