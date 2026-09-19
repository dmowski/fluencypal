import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import {
  LETTER_OR_NUMBER_CHAR_REGEX,
  compileUnicodeRegex,
  matchLetterOrNumberRuns,
} from './unicodeRegex';

const SRC_ROOT = path.join(__dirname, '..');

const collectTsFiles = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
};

const hasLookbehindAssertion = (source: string): boolean => {
  const namedGroupStart = '(?<';
  return source.includes(`${namedGroupStart}=`) || source.includes(`${namedGroupStart}!`);
};

const hasUnicodePropertyRegexLiteral = (source: string): boolean => {
  const withoutStringForm = source.replaceAll('\\\\p{', '');
  return withoutStringForm.includes('\\p{');
};

describe('compileUnicodeRegex', () => {
  it('matches letters and digits the same way a Unicode property class would', () => {
    expect(LETTER_OR_NUMBER_CHAR_REGEX.test('é')).toBe(true);
    expect(LETTER_OR_NUMBER_CHAR_REGEX.test('校')).toBe(true);
    expect(LETTER_OR_NUMBER_CHAR_REGEX.test('7')).toBe(true);
    expect(LETTER_OR_NUMBER_CHAR_REGEX.test(',')).toBe(false);
    expect(matchLetterOrNumberRuns('“crítico123,”')).toEqual(['crítico123']);
  });

  it('compiles flags without creating a regex literal in this module', () => {
    const regex = compileUnicodeRegex('^a+$', 'i');
    expect(regex.test('AAA')).toBe(true);
  });
});

describe('Safari 15.4-16.3 regex source guard', () => {
  it('does not use lookbehind or Unicode-property regex literals in app source', () => {
    const thisFile = path.normalize(__filename);
    const violations: string[] = [];

    for (const filePath of collectTsFiles(SRC_ROOT)) {
      if (path.normalize(filePath) === thisFile) continue;
      const source = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(SRC_ROOT, filePath);
      if (hasLookbehindAssertion(source)) {
        violations.push(`${relativePath}: lookbehind assertion`);
      }
      if (hasUnicodePropertyRegexLiteral(source)) {
        violations.push(`${relativePath}: Unicode-property regex literal`);
      }
    }

    expect(violations).toEqual([]);
  });
});
