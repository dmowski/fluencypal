import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import { splitTextIntoSentences } from './splitTextIntoSentences';

describe('splitTextIntoSentences', () => {
  it('does not use lookbehind so Safari 15.4–16.3 can parse the module', () => {
    const source = fs.readFileSync(path.join(__dirname, 'splitTextIntoSentences.ts'), 'utf8');
    expect(source).not.toMatch(/\(\?<=/);
    expect(source).not.toMatch(/\(\?<!/);
  });
  it('splits provided example into two full sentences without standalone punctuation token', () => {
    const text =
      'In a quiet corner of a great city, there was a library unlike any other. Inside, there was a magnificent ceiling painted with beautiful images.';

    const result = splitTextIntoSentences(text);

    expect(result).toEqual([
      'In a quiet corner of a great city, there was a library unlike any other.',
      'Inside, there was a magnificent ceiling painted with beautiful images.',
    ]);
  });

  it('handles mixed punctuation and extra spaces', () => {
    const result = splitTextIntoSentences('Hello world!   Are you ready? Yes, I am.');

    expect(result).toEqual(['Hello world!', 'Are you ready?', 'Yes, I am.']);
  });

  it('returns empty array for blank text', () => {
    expect(splitTextIntoSentences('   ')).toEqual([]);
  });

  it('splits Japanese sentences without requiring spaces', () => {
    const result = splitTextIntoSentences('今日は晴れです。明日も晴れです。');

    expect(result).toEqual(['今日は晴れです。', '明日も晴れです。']);
  });

  it('splits Chinese and Arabic punctuation correctly', () => {
    const mixedText = '我每天去学校。你呢？أنا أذهب إلى المدرسة كل يوم؟هذا رائع!';
    const result = splitTextIntoSentences(mixedText);

    expect(result).toEqual([
      '我每天去学校。',
      '你呢？',
      'أنا أذهب إلى المدرسة كل يوم؟',
      'هذا رائع!',
    ]);
  });

  it('splits Thai sentences without requiring spaces after punctuation', () => {
    const result = splitTextIntoSentences('ฉันไปโรงเรียนทุกวัน.คุณล่ะ?ฉันสบายดี!');

    expect(result).toEqual(['ฉันไปโรงเรียนทุกวัน.', 'คุณล่ะ?', 'ฉันสบายดี!']);
  });

  it('supports sentence splitting across all supported app language scripts', () => {
    const text =
      'I learn every day. Aprendo cada día. 我每天学习。 J’apprends chaque jour. Ich lerne jeden Tag. 私は毎日勉強します。 나는 매일 공부한다. أنا أتعلم كل يوم؟ Eu aprendo todos os dias. Imparo ogni giorno. Uczę się codziennie. Я учусь каждый день. Я навчаюся щодня. Saya belajar setiap hari. Saya belajar setiap hari. ฉันเรียนทุกวัน. Her gün öğreniyorum. Tôi học mỗi ngày. Jeg lærer hver dag. Jeg lærer hver dag. Jag lär mig varje dag. Я вучуся кожны дзень.';

    const result = splitTextIntoSentences(text);

    expect(result.length).toBe(22);
    expect(result.every((sentence) => sentence.trim().length > 0)).toBe(true);
  });

  it('handles long multiline Polish story with quotes and does not create punctuation-only entries', () => {
    const text = `Na skraju pustyni, młody mężczyzna o imieniu Piotr stał w swojej tunice. Miał w sobie coś niezwykłego - odwaga i ciekawość świata. Piotr patrzył na horyzont, gdzie dwa świecące słońca powoli schodziły za linię piasku.

„Jak to możliwe?” myślał Piotr. Nigdy wcześniej nie widział dwóch słońc. Jeden dzień tak, ale dwa? To była dla niego zagadka.

Podziwiał pustynię, która zmieniała kolory od złotego do czerwonego. Każde z leżących przed nim słońc wydawało się opowiadać własną historię. Pierwsze słońce było jasne, pełne energii i życia. Drugie słońce zaś było delikatniejsze, sprawiało wrażenie starszego i spokojniejszego.

Piotr wiedział, że musi dowiedzieć się więcej o tym tajemniczym miejscu. Ludzie mówili, że gdzieś tam, w dalekim krańcu pustyni, stoi starożytne miasto z ukrytymi tajemnicami. To właśnie tam Piotr postanowił się udać.

Z każdą chwilą słońca były coraz niżej, a pustynia zapadała w chłodny mrok. Piotr poczuł dreszcz, ale pełen determinacji ruszył naprzód. Jego podróż dopiero się zaczynała, a dwa słońca towarzyszyły mu jeszcze przez chwilę, dając nadzieję na niezwykłą przygodę."`;

    const result = splitTextIntoSentences(text);

    const expectedSentences = [
      'Na skraju pustyni, młody mężczyzna o imieniu Piotr stał w swojej tunice.',
      'Miał w sobie coś niezwykłego - odwaga i ciekawość świata.',
      'Piotr patrzył na horyzont, gdzie dwa świecące słońca powoli schodziły za linię piasku.',
      '„Jak to możliwe?” myślał Piotr.',
      'Nigdy wcześniej nie widział dwóch słońc.',
      'Jeden dzień tak, ale dwa?',
      'To była dla niego zagadka.',
      'Podziwiał pustynię, która zmieniała kolory od złotego do czerwonego.',
      'Każde z leżących przed nim słońc wydawało się opowiadać własną historię.',
      'Pierwsze słońce było jasne, pełne energii i życia.',
      'Drugie słońce zaś było delikatniejsze, sprawiało wrażenie starszego i spokojniejszego.',
      'Piotr wiedział, że musi dowiedzieć się więcej o tym tajemniczym miejscu.',
      'Ludzie mówili, że gdzieś tam, w dalekim krańcu pustyni, stoi starożytne miasto z ukrytymi tajemnicami.',
      'To właśnie tam Piotr postanowił się udać.',
      'Z każdą chwilą słońca były coraz niżej, a pustynia zapadała w chłodny mrok.',
      'Piotr poczuł dreszcz, ale pełen determinacji ruszył naprzód.',
      'Jego podróż dopiero się zaczynała, a dwa słońca towarzyszyły mu jeszcze przez chwilę, dając nadzieję na niezwykłą przygodę."',
    ];

    expect(result).toEqual(expectedSentences);
    expect(result).not.toContain('.');
    expect(result.every((sentence) => sentence.trim().length > 0)).toBe(true);
  });
});
