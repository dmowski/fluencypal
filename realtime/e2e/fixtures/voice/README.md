# Voice E2E fixtures

## Primary recording (your voice)

Place user recordings here (silence → speech → silence):

- **`whats-your-name.wav`**
- **`case-2.wav`**

Then normalize for browser tests:

```bash
cd realtime
pnpm e2e:fixtures:normalize   # writes whats-your-name-48k-mono.wav (needs ffmpeg)
```

- `whats-your-name.wav` — API e2e streams this in real time over WebSocket
- `whats-your-name-48k-mono.wav` — Playwright Chrome fake microphone

## Optional TTS fixtures

```bash
pnpm e2e:fixtures:voice   # hello / silence / loud-interrupt (needs OPENAI_API_KEY)
```

Do not commit `.tmp/` (MP3 intermediates).
