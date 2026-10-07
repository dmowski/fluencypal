import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LearnPageLocale } from './targets';

const fontDir = path.join(process.cwd(), 'src/features/LearnLanding/fonts');

const fileCache = new Map<string, Promise<ArrayBuffer>>();

const loadFontFile = (fileName: string): Promise<ArrayBuffer> => {
  const cached = fileCache.get(fileName);
  if (cached) return cached;

  const pending = readFile(path.join(fontDir, fileName)).then((buffer) => {
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(buffer);
    return copy.buffer;
  });
  fileCache.set(fileName, pending);
  return pending;
};

const asFont = async (fileName: string, name: string) => ({
  name,
  data: await loadFontFile(fileName),
  weight: 700 as const,
  style: 'normal' as const,
});

const latinFiles = [
  'NotoSans-latin-700.ttf',
  'NotoSans-latin-ext-700.ttf',
  'NotoSans-cyrillic-700.ttf',
  'NotoSans-vietnamese-700.ttf',
];

/** Separate family names so Satori does not download a fallback font for missing glyphs. */
const extraFont: Partial<Record<LearnPageLocale, { file: string; name: string }>> = {
  ar: { file: 'NotoSansArabic-700-ttf.ttf', name: 'Noto Arabic' },
  th: { file: 'NotoSansThai-700.ttf', name: 'Noto Thai' },
  ja: { file: 'NotoSansJP-700.ttf', name: 'Noto JP' },
  ko: { file: 'NotoSansKR-700.ttf', name: 'Noto KR' },
  zh: { file: 'NotoSansSC-700.ttf', name: 'Noto SC' },
};

export const ogFontFamily = (ui: LearnPageLocale): string => {
  const extra = extraFont[ui];
  return extra ? `${extra.name}, Noto Sans` : 'Noto Sans';
};

export const loadOgFonts = async (ui: LearnPageLocale) => {
  const latin = await Promise.all(latinFiles.map((fileName) => asFont(fileName, 'Noto Sans')));
  const extra = extraFont[ui];
  if (!extra) return latin;
  return [...latin, await asFont(extra.file, extra.name)];
};
