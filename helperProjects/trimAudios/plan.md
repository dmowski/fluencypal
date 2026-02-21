# trimAudios — implementation plan

## Goal
Build a terminal-first Node.js app (TypeScript + pnpm) that:
1. Loads MP3 files from Firebase Storage into `loadedData/`.
2. Processes files with FFmpeg by trimming initial silence.
3. Writes processed files into `processedData/`.
4. Supports independent commands:
   - `pnpm load`
   - `pnpm process`
   - `pnpm upload`

## Scope (MVP)
- CLI app only (no UI).
- Uses Firebase Admin SDK to read/write Storage objects.
- Uses FFmpeg installed as a dependency (project-local binary) with fallback to system FFmpeg.
- Uses deterministic file mapping from source object path -> local path -> processed path -> destination object path.
- Separate steps can run independently.

## Proposed project structure

```text
trimAudios/
  plan.md
  package.json
  tsconfig.json
  .env.example
  loadedData/
  processedData/
  src/
    index.ts
    commands/
      load.ts
      process.ts
      upload.ts
    core/
      config.ts
      logger.ts
      paths.ts
      firebase.ts
      ffmpeg.ts
      manifest.ts
      io.ts
    types/
      manifest.ts
```

## Runtime and dependencies
- Package manager: `pnpm`
- Runtime: Node.js 20+
- Language: TypeScript
- Core dependencies:
  - `firebase-admin`
  - `dotenv`
  - `p-limit` (bounded concurrency)
  - `ffmpeg-static` (bundled FFmpeg binary)
- Dev dependencies:
  - `typescript`
  - `tsx` (run TS scripts directly)
  - `@types/node`

## Environment/config plan
Use `.env` and validate at startup.

Required variables (MVP):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET` (e.g. `my-project.appspot.com`)
- `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON)

Optional variables:
- `SOURCE_PREFIX` (e.g. `audio/raw/`)
- `DEST_PREFIX` (e.g. `audio/trimmed/`)
- `TRIM_SILENCE_DB` (default `-35dB`)
- `TRIM_SILENCE_DURATION` (default `0.15` seconds)
- `TRIM_MAX_START_SEC` (optional safety cap)
- `CONCURRENCY_LOAD` (default `5`)
- `CONCURRENCY_PROCESS` (default `2`)
- `CONCURRENCY_UPLOAD` (default `5`)

## Command contract

### `pnpm load`
Responsibilities:
- Connect to Firebase Storage bucket.
- List all `.mp3` objects under `SOURCE_PREFIX`.
- Download each file to `loadedData/` preserving relative path.
- Generate manifest file (JSON) with source object + local file path.

Output:
- Files in `loadedData/`
- `loadedData/manifest.json`

Idempotency:
- Skip existing local files unless `--force`.

### `pnpm process`
Responsibilities:
- Read `loadedData/manifest.json` or scan `loadedData/**/*.mp3`.
- Detect and trim leading silence with FFmpeg.
- Save output to mirrored path in `processedData/`.
- Generate `processedData/manifest.json` with source/local/processed mapping.

Output:
- Files in `processedData/`
- `processedData/manifest.json`

Idempotency:
- Skip if processed file already exists unless `--force`.

### `pnpm upload`
Responsibilities:
- Read `processedData/manifest.json`.
- Upload each processed file to bucket under `DEST_PREFIX`.
- Optionally set metadata/content type `audio/mpeg`.
- Produce upload report.

Output:
- Uploaded files in Firebase Storage.
- `processedData/upload-report.json`

Idempotency:
- Skip upload when remote object already exists unless `--force`.

## FFmpeg trimming strategy
Use FFmpeg `silenceremove` for leading silence:

- Filter baseline:
  - `silenceremove=start_periods=1:start_duration={duration}:start_threshold={db}`

Notes:
- This removes only beginning silence.
- Keep output MP3 format for compatibility.
- Preserve sample rate/channels if possible.

## Data model (manifest)
`loadedData/manifest.json` entries:
- `sourceObject`: string
- `loadedPath`: string
- `status`: `loaded | skipped | failed`
- `error?`: string

`processedData/manifest.json` entries:
- `sourceObject`: string
- `loadedPath`: string
- `processedPath`: string
- `status`: `processed | skipped | failed`
- `error?`: string

## Error handling and logs
- Structured per-file result with summary totals.
- Continue-on-error for batch operations (do not abort all on one file).
- Exit code:
  - `0` when all successful or only skipped
  - `1` when any failure occurred

## Security and credentials
- Do not commit service account JSON.
- Add to `.gitignore`:
  - `.env`
  - `loadedData/**`
  - `processedData/**`
  - `*.log`

## Milestones

### Phase 1 — project bootstrap
- Init `package.json`, TypeScript config, and scripts.
- Add dependencies.
- Add folder bootstrap logic (`loadedData`, `processedData`).

### Phase 2 — `load`
- Implement Firebase initialization.
- Implement listing + download.
- Implement `loadedData/manifest.json`.

### Phase 3 — `process`
- Implement FFmpeg wrapper.
- Implement silence trim pipeline.
- Implement `processedData/manifest.json`.

### Phase 4 — `upload`
- Implement upload from processed manifest.
- Implement upload report and summary.

### Phase 5 — hardening
- Add retries for transient network errors.
- Add `--force`, `--dry-run`, and optional include/exclude patterns.
- Improve CLI help text.

## NPM scripts plan
In `package.json`:
- `load`: `tsx src/index.ts load`
- `process`: `tsx src/index.ts process`
- `upload`: `tsx src/index.ts upload`
- `typecheck`: `tsc --noEmit`

## Acceptance criteria (MVP)
- Running `pnpm load` downloads mp3 files to `loadedData/` and creates manifest.
- Running `pnpm process` trims initial silence and writes files to `processedData/`.
- Running `pnpm upload` uploads processed files to destination prefix.
- Each command works independently and can be rerun safely.
- Non-zero exit code if any file fails in a command run.

## Open decisions (to confirm during implementation)
1. Exact source/destination prefixes in bucket.
2. Whether to overwrite remote files by default on upload.
3. Desired default silence threshold and duration tuned for your recordings.
4. Whether to preserve folder hierarchy exactly or flatten names.
