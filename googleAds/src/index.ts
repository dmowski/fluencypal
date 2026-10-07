import { GoogleAdsApiError } from './errors.js';
import {
  runAccounts,
  runAuth,
  runCreateAd,
  runCreateSearch,
  runDoctor,
  runHistory,
  runNote,
  runSetup,
  runState,
  runStatusChange,
} from './run.js';

const usage = `Google Ads CLI for FluencyPal.

  pnpm ads doctor [--offline]
  pnpm ads setup
  pnpm ads auth
  pnpm ads accounts
  pnpm ads state [--customer ID] [--login-customer ID] [--include-removed]
  pnpm ads history [--customer ID] [--days 7|14|30]
  pnpm ads note --text "what we decided"
  pnpm ads create-ad --ad-group ID --final-url URL --headline TEXT --headline TEXT --headline TEXT --description TEXT --description TEXT [--status paused] [--confirm|--validate]
  pnpm ads create-search --name NAME --daily-budget 20 --final-url URL --headline TEXT --headline TEXT --headline TEXT --description TEXT --description TEXT [--keyword PHRASE:text] [--status paused] [--confirm|--validate]
  pnpm ads pause|enable|remove --resource campaign|ad-group|ad --id ID [--ad-group ID] [--confirm|--validate]

Mutations print the request and do nothing until --confirm. New ads and campaigns default to paused.
Google change history covers 30 days. Changes made here are appended to history/operations.jsonl.
`;

async function main(): Promise<void> {
  const [command, ...argv] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(usage);
    return;
  }

  if (command === 'doctor') return runDoctor(argv);
  if (command === 'setup') return runSetup();
  if (command === 'auth') return runAuth();
  if (command === 'accounts') return runAccounts();
  if (command === 'state') return runState(argv);
  if (command === 'history') return runHistory(argv);
  if (command === 'note') return runNote(argv);
  if (command === 'create-ad') return runCreateAd(argv);
  if (command === 'create-search') return runCreateSearch(argv);
  if (command === 'pause' || command === 'stop') return runStatusChange('pause', argv);
  if (command === 'enable') return runStatusChange('enable', argv);
  if (command === 'remove') return runStatusChange('remove', argv);

  console.error(`Unknown command "${command}".`);
  console.error(usage);
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  if (error instanceof GoogleAdsApiError) {
    console.error(error.message);
    if (error.requestId) console.error(`request-id: ${error.requestId}`);
    if (error.hint) console.error(error.hint);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
