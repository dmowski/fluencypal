import fs from 'fs';
import gettextParser from 'gettext-parser';
import OpenAI from 'openai';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined. Please set it in .env.tool file');
}

const openAi = new OpenAI({ apiKey: OPENAI_API_KEY });
const TRANSLATE_MODEL = 'gpt-4o';

const localesFolder = './src/locales';
const languages = [
  { path: `${localesFolder}/ru.po`, language: 'Russian' },
  { path: `${localesFolder}/es.po`, language: 'Spanish' },
  { path: `${localesFolder}/en.po`, language: 'English' },
  { path: `${localesFolder}/de.po`, language: 'German' },
  { path: `${localesFolder}/pl.po`, language: 'Polish' },
  { path: `${localesFolder}/uk.po`, language: 'Ukrainian' },
  { path: `${localesFolder}/fr.po`, language: 'French' },
  { path: `${localesFolder}/ar.po`, language: 'Arabic' },
  { path: `${localesFolder}/id.po`, language: 'Indonesian' },
  { path: `${localesFolder}/it.po`, language: 'Italian' },
  { path: `${localesFolder}/ja.po`, language: 'Japanese' },
  { path: `${localesFolder}/ko.po`, language: 'Korean' },
  { path: `${localesFolder}/ms.po`, language: 'Malay' },
  { path: `${localesFolder}/pt.po`, language: 'Portuguese' },
  { path: `${localesFolder}/th.po`, language: 'Thai' },
  { path: `${localesFolder}/tr.po`, language: 'Turkish' },
  { path: `${localesFolder}/vi.po`, language: 'Vietnamese' },
  { path: `${localesFolder}/zh.po`, language: 'Chinese' },
  { path: `${localesFolder}/da.po`, language: 'Danish' },
  { path: `${localesFolder}/no.po`, language: 'Norwegian' },
  { path: `${localesFolder}/sv.po`, language: 'Swedish' },
  { path: `${localesFolder}/be.po`, language: 'Belarusian' },
];

const translateBlock = async (blockText, lang) => {
  const prompt = [
    `You're a Translation Tool for FluencyPal, an AI English teacher landing page.`,
    `Translate the input into the ${lang} language.`,
    `Ensure high-quality, natural ${lang} — not word-for-word.`,
    `This product teaches English. For grammar lessons:`,
    `translate explanations, headings, and instructions into ${lang};`,
    `keep English example sentences, quoted speech, and bolded grammar forms exactly as written;`,
    `keep English names of forms (Present Perfect, Past Simple, gerund, infinitive, a/an/the, If I were, If I had). You may add a short ${lang} gloss in parentheses on first mention of a form name.`,
    `Keep headings short: do not expand a heading into a paragraph.`,
    `Disambiguate short English: Right/Correct = grammatically correct (not direction); a period = a duration of time (not punctuation); Second/Third = second/third conditional (not ranking or seconds).`,
    `Keep markdown, tables, links, and URLs unchanged. Do not translate FluencyPal.`,
    `Return the translation in the same format as the original.`,
    `Do not add or modify meaning. Do not wrap the result in code fences.`,
    `Preserve all newline breaks (\\n symbols) exactly as they appear in the input.`,
  ].join(' ');

  const chatCompletion = await openAi.chat.completions.create({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: blockText },
    ],
    model: TRANSLATE_MODEL,
  });

  let result = chatCompletion.choices[0].message.content;

  result = result?.startsWith('```') ? result.slice(3) : result || '';
  result = result.endsWith('```') ? result.slice(0, -3) : result;

  return result || blockText;
};

async function translate(text, lang) {
  const translatedText = await translateBlock(text, lang);
  return translatedText;
}

async function processTranslations(poData, lang) {
  const translations = poData.translations;
  const translationPromises = [];

  for (const context in translations) {
    for (const key in translations[context]) {
      const entry = translations[context][key];
      if (!entry.msgstr[0]) {
        translationPromises.push(
          translate(entry.msgid, lang).then((translatedText) => {
            entry.msgstr[0] = translatedText; // Update with AI translation
          }),
        );
      }
    }
  }

  await Promise.all(translationPromises);
}

function sortTranslation(poData) {
  const translations = poData.translations;

  for (const context in translations) {
    const keys = Object.keys(translations[context]);
    const sortedKeys = keys.sort((a, b) => {
      const msgidA = translations[context][a].msgid.toLowerCase();
      const msgidB = translations[context][b].msgid.toLowerCase();
      if (msgidA < msgidB) return -1;
      if (msgidA > msgidB) return 1;
      return 0;
    });

    const sortedTranslations = {};
    for (const key of sortedKeys) {
      sortedTranslations[key] = translations[context][key];
    }
    poData.translations[context] = sortedTranslations;
  }
}

const processLang = async (lang, path) => {
  const sourceContent = await readFileAsync(path, {
    encoding: 'utf-8',
  });
  const po = gettextParser.po.parse(sourceContent);
  await processTranslations(po, lang);
  sortTranslation(po);
  const updatedPo = gettextParser.po.compile(po);
  await writeFileAsync(path, updatedPo, { encoding: 'utf-8' });
};

const main = async () => {
  for (const { language, path } of languages) {
    console.log(`Processing: ${language}`);
    await processLang(language, path);
  }
};

main();
