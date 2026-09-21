import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.join(__dirname, '../../..');

const CLIENT_RETRY_HELPERS = [
  'features/Ai/sendTextAiRequest.tsx',
  'app/api/ai/chat/clientSendAiChatRequest.tsx',
];

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

const OPENAI_IMPORT = /from ['"]openai(?:\/[^'"]*)?['"]/;
const OPEN_AI_ERRORS_IMPORT = /from ['"][^'"]*\/openAiErrors['"]/;

describe('OpenAI SDK client bundle guard', () => {
  it('keeps retry helpers free of openai so Safari 15.4–16.3 can parse quiz/practice', () => {
    for (const relativePath of CLIENT_RETRY_HELPERS) {
      const source = fs.readFileSync(path.join(SRC_ROOT, relativePath), 'utf8');
      expect({ relativePath, hasOpenAi: OPENAI_IMPORT.test(source) }).toEqual({
        relativePath,
        hasOpenAi: false,
      });
      expect({ relativePath, hasOpenAiErrors: OPEN_AI_ERRORS_IMPORT.test(source) }).toEqual({
        relativePath,
        hasOpenAiErrors: false,
      });
    }
  });

  it('does not import the OpenAI SDK from use client modules', () => {
    const violations: string[] = [];

    for (const filePath of collectTsFiles(SRC_ROOT)) {
      const source = fs.readFileSync(filePath, 'utf8');
      if (!source.includes("'use client'") && !source.includes('"use client"')) continue;
      if (!OPENAI_IMPORT.test(source) && !OPEN_AI_ERRORS_IMPORT.test(source)) continue;
      violations.push(path.relative(SRC_ROOT, filePath));
    }

    expect(violations).toEqual([]);
  });
});
