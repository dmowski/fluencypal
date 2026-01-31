#!/usr/bin/env node

/**
 * Development Server with Firebase Emulator
 * 
 * This script starts the Firebase Emulator Suite and waits for it to be ready,
 * then starts the Next.js development server.
 * 
 * Usage: node scripts/dev-with-emulator.js
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');

const EMULATOR_UI_PORT = 4000;
const EMULATOR_HUB_PORT = 4400;
const READY_TIMEOUT = 60000; // 60 seconds

/**
 * Check if emulator is ready by making HTTP requests
 */
function checkEmulatorReady() {
  return new Promise((resolve) => {
    const check = () => {
      http
        .get(`http://localhost:${EMULATOR_UI_PORT}/`, (res) => {
          if (res.statusCode === 200) {
            console.log('✅ Firebase Emulator is ready!\n');
            resolve(true);
          } else {
            setTimeout(check, 500);
          }
        })
        .on('error', () => {
          setTimeout(check, 500);
        });
    };
    check();
  });
}

/**
 * Wait for emulator to be ready with timeout
 */
async function waitForEmulator() {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Emulator did not start within timeout period'));
    }, READY_TIMEOUT);

    checkEmulatorReady().then(() => {
      clearTimeout(timeoutId);
      resolve();
    });
  });
}

/**
 * Start emulator
 */
function startEmulator() {
  console.log('🔥 Starting Firebase Emulator...\n');

  return new Promise((resolve, reject) => {
    const emulator = spawn('firebase', ['emulators:start', '--project', 'dark-lang'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });

    emulator.on('error', (error) => {
      console.error('Failed to start Firebase Emulator:', error.message);
      reject(error);
    });

    // Don't wait for emulator to exit, just wait for it to start
    setTimeout(() => {
      resolve(emulator);
    }, 1000);
  });
}

/**
 * Start Next.js dev server
 */
function startDevServer() {
  console.log('\n🚀 Starting Next.js dev server...\n');

  const dev = spawn('next', ['dev', '--turbopack'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  dev.on('error', (error) => {
    console.error('Failed to start dev server:', error.message);
    process.exit(1);
  });

  return dev;
}

/**
 * Main function
 */
async function main() {
  let emulatorProcess = null;
  let devProcess = null;

  try {
    // Start emulator
    emulatorProcess = await startEmulator();

    // Wait for emulator to be ready
    console.log('⏳ Waiting for Firebase Emulator to be ready...\n');
    await waitForEmulator();

    // Start dev server
    devProcess = startDevServer();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n⏹️  Shutting down...');
      if (devProcess) devProcess.kill();
      if (emulatorProcess) emulatorProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      if (devProcess) devProcess.kill();
      if (emulatorProcess) emulatorProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (emulatorProcess) emulatorProcess.kill();
    if (devProcess) devProcess.kill();
    process.exit(1);
  }
}

main();
