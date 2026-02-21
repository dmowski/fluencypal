import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

export type BootPaths = {
  workspaceRoot: string;
  loadedDataDir: string;
  processedDataDir: string;
};

export async function ensureRuntimeFolders(cwd = process.cwd()): Promise<BootPaths> {
  const workspaceRoot = resolve(cwd);
  const loadedDataDir = resolve(workspaceRoot, "loadedData");
  const processedDataDir = resolve(workspaceRoot, "processedData");

  await mkdir(loadedDataDir, { recursive: true });
  await mkdir(processedDataDir, { recursive: true });

  return {
    workspaceRoot,
    loadedDataDir,
    processedDataDir,
  };
}
