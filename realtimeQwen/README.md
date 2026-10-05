# Realtime Qwen

Local voice client for `qwen-audio-3.0-realtime-flash`. The browser talks to Alibaba over WebRTC. This process only exchanges the SDP offer so the API key stays on your machine.

## Run

```bash
cd realtimeQwen
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5190 in Chrome.

## API key

1. Create a Model Studio API key: https://www.alibabacloud.com/help/en/model-studio/get-api-key
2. Use an **international (Singapore)** key with the default endpoint `https://maas.qwencloudapi.com/api/v1/webrtc/realtime`. Beijing keys need `QWEN_REGION=beijing` and, for a workspace endpoint, `QWEN_WEBRTC_URL`.
3. Turn on billing. Realtime calls fail until the account can be charged.
4. Put the key in `realtimeQwen/.env` as `DASHSCOPE_API_KEY` and restart `pnpm dev`.

Do not commit `.env`.

## What the call measures

Response latency is the time from the end of your speech (local mic level) to the first assistant audio that arrives on the WebRTC track.

Interruption latency is the time from your local speech start, while Qwen is audible, until playback gain is set to zero. Use headphones so speaker echo does not trip that path.

Token totals add every `response.done` usage object. That matches per-turn billing, including context resent on later turns. Prices are in `pricing.json` (USD per 1M tokens, Model Studio list prices as of 2026-09-28). On audio turns, output text tokens are not billed.

The table at 5, 10, 20, 30, and 60 minutes is there to see whether cost per minute rises as the conversation gets longer. The model only keeps about 50 turns or 300 seconds of audio in context; older audio is dropped. The WebRTC call is not cut off by that cap.

## Checks

```bash
pnpm test
pnpm lint
```
