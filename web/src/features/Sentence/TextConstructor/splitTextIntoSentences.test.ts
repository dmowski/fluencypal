import '@testing-library/jest-dom';
import { splitTextIntoSentences } from './splitTextIntoSentences';

describe('splitTextIntoSentences', () => {
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
