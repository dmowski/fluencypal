/**
 * Firebase Emulator Configuration for Development
 *
 * This module provides utilities for connecting to the Firebase Emulator Suite
 * during local development.
 *
 * Usage:
 * 1. Start the emulator with: pnpm run dev:firebase-emulator
 * 2. In your code, call connectToEmulator() before initializing Firebase
 */

import { connectAuthEmulator, getAuth, Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, Firestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage, FirebaseStorage } from 'firebase/storage';

const EMULATOR_CONFIG = {
  auth: {
    host: 'localhost',
    port: 9099,
  },
  firestore: {
    host: 'localhost',
    port: 8080,
  },
  storage: {
    host: 'localhost',
    port: 9199,
  },
};

let emulatorConnected = false;

/**
 * Connect to Firebase Emulators
 * Call this before using any Firebase services in development
 *
 * @example
 * import { connectToEmulator } from '@/libs/firebaseEmulator';
 * import { initializeApp } from 'firebase/app';
 *
 * const app = initializeApp(firebaseConfig);
 *
 * if (process.env.NODE_ENV === 'development') {
 *   connectToEmulator(app);
 * }
 */
export const connectToEmulator = (app: any) => {
  if (emulatorConnected) {
    console.log('ℹ️ Firebase Emulator already connected');
    return;
  }

  try {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Disable warnings about using the emulator
    if (typeof window === 'undefined') {
      // Server-side
      process.env.FIREBASE_AUTH_EMULATOR_HOST = `${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`;
    }

    // Connect emulators
    connectAuthEmulator(auth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
      disableWarnings: true,
    });

    connectFirestoreEmulator(db, EMULATOR_CONFIG.firestore.host, EMULATOR_CONFIG.firestore.port);

    connectStorageEmulator(storage, EMULATOR_CONFIG.storage.host, EMULATOR_CONFIG.storage.port);

    emulatorConnected = true;

    console.log('✅ Firebase Emulator connected:');
    console.log(`   Auth: http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`);
    console.log(
      `   Firestore: http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`,
    );
    console.log(
      `   Storage: http://${EMULATOR_CONFIG.storage.host}:${EMULATOR_CONFIG.storage.port}`,
    );
    console.log(`   UI: http://localhost:4000`);
  } catch (error) {
    console.error('Failed to connect to Firebase Emulator:', error);
  }
};

export const getEmulatorConfig = () => EMULATOR_CONFIG;

export const isEmulatorConnected = () => emulatorConnected;
