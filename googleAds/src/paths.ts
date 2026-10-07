import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export const paths = {
  root: packageRoot,
  envFile: join(packageRoot, '.env'),
  secretsDir: join(packageRoot, '.secrets'),
  oauthFile: join(packageRoot, '.secrets', 'oauth.json'),
  clientSecretFile: join(packageRoot, '.secrets', 'client_secret.json'),
  serviceAccountFile: join(packageRoot, '.secrets', 'service-account.json'),
  journalFile: join(packageRoot, 'history', 'operations.jsonl'),
  snapshotsDir: join(packageRoot, 'snapshots'),
};
