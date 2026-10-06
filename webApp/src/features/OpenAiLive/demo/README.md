# Public speaking demo

`/demo` and `/[lang]/demo` are the ad destinations in **webApp**. English is the initial language; visitors can choose another supported language. Firebase creates a guest identity, but no registration or payment is required. The demo uses the same GPT-Live model, Marin voice, WebRTC transport, and call UI as the product.

The browser requests the microphone on Start only, after consent. The server reserves one trial per Firebase UID in a Firestore transaction, with at most three starts per network per UTC day and 100 starts globally per UTC day. `OPEN_AI_LIVE_DEMO_DAILY_LIMIT` overrides the global cap; set it to `0` to stop new demos. Failed/ambiguous provider starts consume their reservation to prevent retry-based spending. This is a session admission cap, not an exact USD spending cap. Delegated responses are limited to 256 output tokens.

The server attaches a GPT-Live sideband before releasing the SDP answer. Browser data-channel permissions only allow mute, unmute, and close; the browser cannot update delegation or append instructions. A server-generated ready timestamp starts three minutes, with a separate 30-second setup allowance. Repeated ready requests cannot extend the trial. The sideband sends the greeting, a wrap-up at 30 seconds remaining, and `session.close` at the deadline. A separate absolute watchdog covers slow database reads; dropped sidebands are reattached for closure. The browser also stops audio locally when its timer expires or the user leaves/cancels.

The sideband saves actual transcripts to `users/{uid}/conversations/{sessionId}` with mode `open-ai-live` and source `demo`. It asks the teacher to offer a grounded correction or positive observation near the end; it does not invent a proficiency score. `/demo` reloads the transcript from the authenticated user's record. Account linking keeps the guest UID. The selected language is saved if the user has no existing language preference. Existing-account sign-in uses the established auth behavior; it does not copy demo history between accounts.

## Hosting

The route uses Next.js `after()` with `maxDuration = 300` and requires a host supporting a five-minute background request lifetime and outbound WebSockets (the current Vercel deployment). The network limiter uses Vercel's overwritten `x-vercel-forwarded-for` header. Local emulator requests share the `local` network bucket. Other production hosts must supply an equivalent trusted network identifier before launching ads.

The cap limits automated abuse but is not a CAPTCHA. Configure deployment WAF/bot protection for `/api/openAiLive/demo` before scaling campaigns. A process crash or provider outage can prevent confirmed closure; failures surface in server error reporting. Do not treat a browser timer or serverless background task as a provider-enforced billing ceiling.

## Verification

- `pnpm lint`
- `pnpm exec jest src/features/OpenAiLive --runInBand --watchman=false`
- `pnpm test:e2e e2e/demo.spec.ts`
- Full `pnpm test:e2e` per the webApp guide.

Browser tests simulate WebRTC/provider events: consent, countdown, warning, cutoff, signup, microphone denial, and repeat visits. Server unit tests cover admission limits, deadline policy, control-socket failure and provider closure. No real paid GPT-Live call is made by these tests.

Official control protocol: https://developers.openai.com/api/reference/resources/live/sideband-websocket

### Local verification (2026-10-05)

- TypeScript check passed.
- 20 focused OpenAI Live unit tests passed.
- Nine demo e2e tests passed (including mobile, language cards, locale routing, consent focus, microphone denial, and quota rejection).
- Full e2e: 98/99 passed; the voice-chat playback timeout passed in the subsequent isolated run (all eight demo + voice-chat tests passed).
- Full unit suite: 979/982 passed initially. The network-dependent image check passed with network access; unrelated Safari-regex and quiz-voice tests still fail in unchanged files.
- Browser component suite ran: 113/131 tests passed, with screenshot mismatches/timeouts and an unrelated QuizDailyQuestion `process is not defined` import failure. Baselines were not updated.
- Opened `/demo` in the in-app browser and checked rendering and console errors. Real GPT-Live audio/provider access and production deployment were not exercised, per the feature's no-real-call verification rule.

### Entry-screen polish

The first screen presents EN, ES, FR and DE cards, with English selected by default. More opens the full language list. The start action is fixed at the bottom with safe-area spacing and reserved page space. It is enabled on first paint, while the status request finishes in the background. The first tap checks the age and terms agreement and starts microphone access. Locale routes share the same component and preserve their locale in quiz/practice navigation.

Latest checks: typecheck, the dialog keyboard-focus browser test, and all nine demo e2e tests passed. The full e2e run passed 102/103; the unrelated reader PDF sign-in modal check timed out.
