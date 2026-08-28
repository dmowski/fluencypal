import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const webAppRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_ID = 'dark-lang';

const unquote = (value) => {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const parseEnvFile = (filePath) => {
  const env = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    env[line.slice(0, eq).trim()] = unquote(line.slice(eq + 1));
  }
  return env;
};

export const loadWebAppEnv = () => {
  const merged = {};
  for (const fileName of ['.env', '.env.local']) {
    const filePath = path.join(webAppRoot, fileName);
    if (!fs.existsSync(filePath)) continue;
    Object.assign(merged, parseEnvFile(filePath));
  }
  return merged;
};

export const readServiceAccount = () => {
  const env = loadWebAppEnv();
  const raw = env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS;
  if (!raw) {
    throw new Error('FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS is missing in webApp/.env');
  }
  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    private_key:
      typeof parsed.private_key === 'string'
        ? parsed.private_key.replace(/\\n/g, '\n')
        : parsed.private_key,
  };
};

export const withServiceAccountFile = async (fn) => {
  const serviceAccount = readServiceAccount();
  const tempFile = path.join(os.tmpdir(), `fluencypal-firebase-sa-${process.pid}.json`);
  fs.writeFileSync(tempFile, JSON.stringify(serviceAccount), { mode: 0o600 });
  try {
    return await fn(tempFile, serviceAccount);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
};

export const resolveFirebaseCli = () => {
  const local = spawnSync('firebase', ['--version'], { encoding: 'utf8' });
  if (local.status === 0) {
    return { command: 'firebase', prefix: [] };
  }
  return { command: 'npx', prefix: ['--yes', 'firebase-tools'] };
};

export { PROJECT_ID, webAppRoot };
