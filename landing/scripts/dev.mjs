#!/usr/bin/env node
/**
 * Start `next dev` after stopping a previous landing dev server.
 * Next.js exits when `.next/dev/lock` is still held by that process.
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landingRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = path.join(landingRoot, '.next', 'dev', 'lock');
const nextBin = path.join(landingRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const psField = (pid, field) => {
  try {
    return execFileSync('ps', ['-o', `${field}=`, '-p', String(pid)], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
};

const commandOf = (pid) => psField(pid, 'command');

const ppidOf = (pid) => {
  const value = Number(psField(pid, 'ppid'));
  return Number.isInteger(value) ? value : 0;
};

const cwdOf = (pid) => {
  try {
    const output = execFileSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const line = output.split('\n').find((entry) => entry.startsWith('n'));
    return line ? line.slice(1) : '';
  } catch {
    return '';
  }
};

const belongsToLandingDev = (pid) => {
  const command = commandOf(pid);
  if (!command) return false;
  const inLanding = cwdOf(pid) === landingRoot || command.includes(landingRoot);
  if (!inLanding) return false;
  if (command.includes('next')) return true;
  return command.includes('pnpm') && command.includes('dev');
};

const protectedPids = () => {
  const pids = new Set();
  let current = process.pid;
  while (current > 1 && !pids.has(current)) {
    pids.add(current);
    current = ppidOf(current);
  }
  return pids;
};

const readLockPid = () => {
  let raw = '';
  try {
    raw = fs.readFileSync(lockPath, 'utf8');
  } catch {
    return undefined;
  }

  try {
    const info = JSON.parse(raw);
    if (Number.isInteger(info.pid) && info.pid > 0) return info.pid;
  } catch {
    // The lock file is still the JSON payload Next writes, but ignore a partial read.
  }

  const match = raw.match(/"pid"\s*:\s*(\d+)/);
  if (!match) return undefined;
  const pid = Number(match[1]);
  return Number.isInteger(pid) && pid > 0 ? pid : undefined;
};

const listNextCliPids = () => {
  let output = '';
  try {
    output = execFileSync('ps', ['-axww', '-o', 'pid=', '-o', 'command='], {
      encoding: 'utf8',
    });
  } catch {
    return [];
  }

  const pids = [];
  for (const line of output.split('\n')) {
    const match = line.trim().match(/^(\d+)\s+(.*)$/);
    if (!match) continue;
    const command = match[2];
    if (
      command.includes(`${landingRoot}/node_modules/`) &&
      command.includes('/next/dist/bin/next')
    ) {
      pids.push(Number(match[1]));
    }
  }
  return pids;
};

const isAncestor = (ancestor, pid) => {
  const seen = new Set();
  let current = ppidOf(pid);
  while (current > 1 && !seen.has(current)) {
    if (current === ancestor) return true;
    seen.add(current);
    current = ppidOf(current);
  }
  return false;
};

const outermostDevProcess = (pid, blocked) => {
  let current = pid;
  let parent = ppidOf(current);
  while (parent > 1 && !blocked.has(parent) && belongsToLandingDev(parent)) {
    current = parent;
    parent = ppidOf(current);
  }
  return current;
};

const childPids = (pid) => {
  try {
    const output = execFileSync('pgrep', ['-P', String(pid)], { encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => Number(line.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);
  } catch {
    return [];
  }
};

const processTree = (pid, blocked, seen = new Set()) => {
  if (seen.has(pid) || blocked.has(pid) || !isAlive(pid)) return [];
  seen.add(pid);
  const descendants = childPids(pid).flatMap((child) => processTree(child, blocked, seen));
  return [...descendants, pid];
};

const signalPids = (pids, signal) => {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch {
      // Already exited.
    }
  }
};

const waitUntilGone = async (pids, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (pids.every((pid) => !isAlive(pid))) return;
    await sleep(50);
  }
};

const findPreviousLandingDevRoots = () => {
  const blocked = protectedPids();
  const candidates = [];
  const lockPid = readLockPid();
  if (lockPid && !blocked.has(lockPid) && isAlive(lockPid) && belongsToLandingDev(lockPid)) {
    candidates.push(lockPid);
  }
  for (const pid of listNextCliPids()) {
    if (!blocked.has(pid) && isAlive(pid)) candidates.push(pid);
  }

  const roots = [...new Set(candidates.map((pid) => outermostDevProcess(pid, blocked)))];
  return roots.filter(
    (root, index) =>
      !roots.some((other, otherIndex) => otherIndex !== index && isAncestor(other, root)),
  );
};

const stopPreviousLandingDev = async () => {
  const blocked = protectedPids();
  const roots = findPreviousLandingDevRoots();
  const pids = [...new Set(roots.flatMap((root) => processTree(root, blocked)))];
  if (pids.length === 0) return;

  console.log(
    `Stopping previous landing dev server (${roots.map((pid) => `pid ${pid}`).join(', ')})`,
  );
  signalPids(pids, 'SIGTERM');
  await waitUntilGone(pids, 3000);

  const remaining = pids.filter((pid) => isAlive(pid));
  if (remaining.length === 0) return;

  signalPids(remaining, 'SIGKILL');
  await waitUntilGone(remaining, 1000);
};

const main = async () => {
  await stopPreviousLandingDev();

  const child = spawn(process.execPath, [nextBin, 'dev', '--turbopack', ...process.argv.slice(2)], {
    cwd: landingRoot,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    process.exit(code ?? (signal ? 1 : 0));
  });
};

const entry = process.argv[1];
if (entry && path.resolve(entry) === fileURLToPath(import.meta.url)) {
  await main();
}
