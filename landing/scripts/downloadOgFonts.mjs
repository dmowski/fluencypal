import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const names = readFileSync(path.join(root, 'src/features/LearnLanding/names.ts'), 'utf8');
const phrases = readFileSync(path.join(root, 'src/features/LearnLanding/phrases.ts'), 'utf8');

const block = (src, key) => {
  const start = src.indexOf(`\n  ${key}: {`);
  const end = src.indexOf('\n  },', start);
  return src.slice(start, end);
};

const families = {
  zh: 'Noto Sans SC',
  ja: 'Noto Sans JP',
  ko: 'Noto Sans KR',
};
const files = {
  zh: 'NotoSansSC-700.ttf',
  ja: 'NotoSansJP-700.ttf',
  ko: 'NotoSansKR-700.ttf',
};

const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko';

for (const ui of ['zh', 'ja', 'ko']) {
  const text = [...new Set(block(names, ui) + block(phrases, ui))].join('');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(families[ui])}:wght@700&text=${encodeURIComponent(text)}`;
  const css = await fetch(url, { headers: { 'User-Agent': userAgent } }).then((response) =>
    response.text(),
  );
  const fontUrl = css.match(/https:\/\/[^)]+/)?.[0];
  if (!fontUrl) {
    console.error(css);
    throw new Error(`No font url for ${ui}`);
  }
  const bytes = Buffer.from(await fetch(fontUrl).then((response) => response.arrayBuffer()));
  const out = path.join(root, 'src/features/LearnLanding/fonts', files[ui]);
  writeFileSync(out, bytes);
  console.log(ui, bytes.length, fontUrl.slice(0, 80));
}
