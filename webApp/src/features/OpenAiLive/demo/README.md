# Public speaking demo

`/demo` and `/[lang]/demo` are the ad destinations. English is selected first. Visitors can choose another language. No account or payment is required.

Start asks for the microphone only after the age and terms agreement. The button is enabled on first paint. The call lasts three minutes. A visitor gets one trial. Set `OPEN_AI_LIVE_DEMO_DAILY_LIMIT` to `0` to stop new demos.

After the call, the only next step opens the practice dashboard in the page language. The transcript stays on the page.

## Verification

- `pnpm lint`
- `pnpm exec jest src/features/OpenAiLive --runInBand --watchman=false`
- `pnpm test:e2e e2e/demo.spec.ts`

Do not start a real call to check the UI.
