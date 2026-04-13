#!/usr/bin/env node

/**
 * Firebase Emulator Startup Script
 * Starts the Firebase emulator suite for local development
 *
 * Usage: node scripts/start-firebase-emulator.js
 * Or via npm: pnpm run dev:firebase-emulator
 */

const { spawn } = require('child_process');
const path = require('path');

const projectId = 'dark-lang';

console.log('🔥 Starting Firebase Emulator Suite...\n');
console.log(`Project ID: ${projectId}`);
console.log('Emulators starting:');
console.log('  - Authentication Emulator (http://localhost:9099)');
console.log('  - Firestore Emulator (http://localhost:8080)');
console.log('  - Storage Emulator (http://localhost:9199)');
console.log('  - Emulator UI (http://localhost:4000)\n');

// Start Firebase emulator
const firebaseEmulator = spawn('firebase', ['emulators:start', '--project', projectId], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

firebaseEmulator.on('error', (error) => {
  console.error('Failed to start Firebase Emulator:', error.message);
  console.error('\nPlease ensure:');
  console.error('1. Firebase CLI is installed globally: npm install -g firebase-tools');
  console.error('2. You are in the project root directory');
  console.error('3. firebase.json configuration exists\n');
  process.exit(1);
});

firebaseEmulator.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Firebase Emulator exited with code ${code}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down Firebase Emulator...');
  firebaseEmulator.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  firebaseEmulator.kill();
  process.exit(0);
});
