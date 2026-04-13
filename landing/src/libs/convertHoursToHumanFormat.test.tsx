import '@testing-library/jest-dom';
import { convertHoursToHumanFormat } from './convertHoursToHumanFormat';

describe('convertHoursToHumanFormat', () => {
  const testCases = [
    {
      input: 0.1,
      expected: '6min',
    },
    {
      input: 1.5,
      expected: '1h 30min',
    },
    {
      input: 4,
      expected: '4h',
    },
  ];

  for (const { input, expected } of testCases) {
    it(`Convert ${input} to ${expected}`, () => {
      const result = convertHoursToHumanFormat(input);
      expect(result).toEqual(expected);
    });
  }
});
