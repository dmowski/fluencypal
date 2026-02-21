# Firebase Emulator Setup Guide

This guide explains how to set up and use the Firebase Emulator Suite for local development.

## Prerequisites

1. **Firebase CLI** - Install globally:

   ```bash
   npm install -g firebase-tools
   ```

2. **Java Runtime** - Firebase emulators require Java 11 or later
   ```bash
   # Check your Java version
   java -version
   ```

## Quick Start

### 1. Start the Emulator

```bash
pnpm run dev:firebase-emulator
```

This will start the complete Firebase Emulator Suite with:

- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### 2. Connect Your App

Import the emulator connection utility in your app initialization:

```typescript
import { connectToEmulator } from '@/libs/firebaseEmulator';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/common/firebaseConfig';

const app = initializeApp(firebaseConfig);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  connectToEmulator(app);
}
```

### 3. Use the Emulator UI

Visit http://localhost:4000 to access the web UI where you can:

- View and manage Firestore data
- Monitor authentication events
- Inspect storage buckets
- View emulator logs

## Configuration Files

- **`firebase.json`** - Emulator configuration
- **`.firebaserc`** - Firebase project settings
- **`src/libs/firebaseEmulator.ts`** - Node.js utility for connecting to emulators

## Common Tasks

### Export Emulator Data

```bash
firebase emulators:export ./emulator-data
```

### Import Emulator Data

```bash
firebase emulators:start --import=./emulator-data
```

### Clear Emulator Data

Simply restart the emulator - data is not persistent by default unless you export it.

## Troubleshooting

### "Java is not installed or not in PATH"

Install Java 11 or later:

- macOS: `brew install openjdk@11`
- Ubuntu/Debian: `sudo apt-get install default-jre`
- Windows: Download from https://adoptopenjdk.net/

### "Port already in use"

If ports are already in use, modify `firebase.json` to use different ports.

### "Cannot connect to emulator"

1. Ensure the emulator is running (`pnpm run dev:firebase-emulator`)
2. Check that `connectToEmulator()` is called before using Firebase services
3. Verify ports are accessible (check firewall settings)

## Environment Variables

For server-side code, set:

```bash
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

This is automatically set by the `connectToEmulator()` function for client-side code.

## Stopping the Emulator

Press `Ctrl+C` in the terminal running the emulator.

## Additional Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
