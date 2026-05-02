import { ReaderUiSettings } from '../model/types';

const textAlign = 'justify';
const fontFamily = 'serif';

export function isFitInPage({
  paragraphs,
  settings,
}: {
  paragraphs: string[];
  settings: ReaderUiSettings;
}): boolean {
  return false;
}
