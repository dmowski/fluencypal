import { ReaderUiSettings } from '../model/types';

const textAlign = 'justify';
const fontFamily = 'serif';

export function isFitInPage({
  text,
  settings,
}: {
  text: string;
  settings: ReaderUiSettings;
}): boolean {
  console.log(text, settings);
  return false;
}
