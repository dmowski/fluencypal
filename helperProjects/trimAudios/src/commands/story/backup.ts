import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Story } from "./types.js";

export const STORIES_BACKUP_DIR = "storiesBackup";

function buildTimestampForFileName(date: Date): string {
  return date.toISOString().replace(/[:]/g, "-").replace(/\./g, "-");
}

export async function backupStoriesSnapshot(baseDir: string, stories: Story[]): Promise<string> {
  const backupDir = resolve(baseDir, STORIES_BACKUP_DIR);
  await mkdir(backupDir, { recursive: true });

  const now = new Date();
  const timestamp = buildTimestampForFileName(now);
  const fileName = `stories-${timestamp}.json`;
  const backupPath = resolve(backupDir, fileName);

  await writeFile(
    backupPath,
    JSON.stringify(
      {
        createdAtIso: now.toISOString(),
        total: stories.length,
        stories,
      },
      null,
      2,
    ),
    "utf-8",
  );

  return backupPath;
}
