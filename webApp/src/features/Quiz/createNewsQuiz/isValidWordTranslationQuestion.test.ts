import { isValidWordTranslationQuestion } from './isValidWordTranslationQuestion';

describe('isValidWordTranslationQuestion', () => {
  const baseOptions = [
    { id: 'opt-0', label: 'podstawowy' },
    { id: 'opt-1', label: 'świadomość' },
    { id: 'opt-2', label: 'świadomy' },
    { id: 'opt-3', label: 'wezwanie' },
  ];

  it('rejects native-to-target questions where promptText matches an option', () => {
    expect(
      isValidWordTranslationQuestion({
        promptText: 'świadomość',
        direction: 'native-to-target',
        options: baseOptions,
      }),
    ).toBe(false);
  });

  it('accepts questions where promptText differs from every option', () => {
    expect(
      isValidWordTranslationQuestion({
        promptText: 'сознание',
        direction: 'native-to-target',
        options: baseOptions,
      }),
    ).toBe(true);
  });

  it('rejects empty promptText', () => {
    expect(
      isValidWordTranslationQuestion({
        promptText: '   ',
        direction: 'target-to-native',
        options: baseOptions,
      }),
    ).toBe(false);
  });
});
