# Voice E2E fixtures

Real speech WAV files used by `pnpm test:e2e:voice` and `pnpm test:e2e:voice:browser`.

Generate (requires `OPENAI_API_KEY` in `realtime/.env`):

```bash
cd realtime
pnpm e2e:fixtures:voice
```

Files:

- `hello-24k-mono.wav` — API/WebSocket PCM streaming (24 kHz mono PCM16)
- `hello-48k-mono.wav` — Chromium `--use-file-for-fake-audio-capture`
- `silence-24k-mono.wav` — short silence (programmatic)
- `loud-interrupt-24k-mono.wav` — barge-in phrase (VC-07, optional)

Do not commit `.tmp/` (MP3 intermediates).
