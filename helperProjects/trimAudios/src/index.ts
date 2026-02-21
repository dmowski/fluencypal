import "dotenv/config";

import { ensureRuntimeFolders } from "./core/bootstrap.js";
import { runCheck } from "./commands/check.js";
import { runLoad } from "./commands/load.js";
import { runProcess } from "./commands/process.js";
import { runUpload } from "./commands/upload.js";

type Command = "load" | "process" | "upload" | "check";

function parseCommand(value: string | undefined): Command | null {
  if (value === "load" || value === "process" || value === "upload" || value === "check") {
    return value;
  }

  return null;
}

async function main(): Promise<void> {
  const command = parseCommand(process.argv[2]);

  if (!command) {
    console.error("Unknown or missing command. Use one of: load, process, upload, check");
    process.exitCode = 1;
    return;
  }

  if (command === "check") {
    await runCheck();
    return;
  }

  const paths = await ensureRuntimeFolders();
  console.log(`[bootstrap] loadedData: ${paths.loadedDataDir}`);
  console.log(`[bootstrap] processedData: ${paths.processedDataDir}`);

  if (command === "load") {
    await runLoad();
    return;
  }

  if (command === "process") {
    await runProcess();
    return;
  }

  await runUpload();
}

main().catch((error: unknown) => {
  console.error("Fatal error", error);
  process.exit(1);
});
