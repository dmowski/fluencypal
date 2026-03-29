# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-03-22 to 2026-03-29

**Commits:** [`d6c63dbc...e1f74bb0`](../../compare/d6c63dbcc537386df0db51139e58f199d884d23d...e1f74bb0eae519c29b99355d47dc0d2770f807f0)

---

### Added

#### Realtime Transcription

- Implement realtime transcription feature with UI components and API integration (`97b14e3e`)
- Enhance realtime transcription with language and mode selection options (`fd216293`)
- Update realtime transcription mode to `native` and integrate with interactive quiz (`d649839f`)
- Add real-time transcription feature to `InteractiveExample` component (`05c33cd9`)
- Implement `stopOthers` functionality in `useRealtimeTranscript` for better transcript management (`0059f40c`)

#### Reading Progress Tracking

- Implement `getReadingProgress` function with unit tests (`9f198b30`)
- Add reading progress tracking to `InteractiveExample` with live completion percentage (`8f949bcd`)
- Add `PulseDot` component for visual listening feedback in `InteractiveExample` and `TranscriptTest` (`e45772e5`)
- Add unit tests for `getReadingProgress`: edge cases, Chinese text, Arabic text (`15aa9c34`, `f15a1a09`)
- Enhance reading progress: apostrophe normalization, leading coverage count, word inventory coverage (`8aa6e3c9`, `b1eb71b3`, `289583da`)

#### Grammar Improvement Feature

- Integrate Grammar Improvement: add `GrammarImprovementProvider` and modal components (`69d4a965`)
- Add `grammar-improvement` task type and update related components (`0cda87b7`)
- Enhance `GrammarImprovementModal`: track completed examples and enforce completion before unlocking AI practice (`0a81534e`)
- Add completion indicators and logging to `GrammarImprovementModal` and `InteractiveExample` (`96e93ca4`)

#### Currency Conversion

- Add currency conversion API with typed request/response (`4bba2220`)
- Implement caching for currency conversion rates: `getCachedRate` and `saveRateToCache` (`5236e9a6`)
- Add `getConversionRate` function to fetch live currency rates (`17e7cfdf`)
- Add Sentry error tracking for currency conversion failures in `useCurrency` hook (`f3002094`)
- Implement `getSupportedCurrency` utility for currency validation (`bedb683e`)

#### Daily Questions Notifications

- Add `totalDailyQuestionsUnreadMessagesCount` to `ChatListContext` and update notification logic (`9a77e3a7`)
- Add `allMessagesIdsAuthorsMap` to `UserChatMetadata` and update `useProvideChat` logic (`126b8c2c`)
- Add localization and empty state handling to `DailyQuestionNotificationsList` (`5f5ebc4a`)
- Create `useDailyQuestion` hook and update related components (`7fd41d5d`)

#### Experimental / Dashboard

- Add experimental dashboard features and support for new realtime AI model (`8f9a433a`)
- Add experimental dashboard features and update access control (`524f9880`)

---

### Changed

#### UI / Interactive Example

- Enhance audio playback: add optional `onEnd` callback to `playPotentialSpeakUrl` and fix recording state management (`04ab0510`)
- Add responsive styling for `Stack` component in `InteractiveExample` (`c07b3855`)
- Enhance responsive styling for `StoreButton` and `StoreCardRowItem` components (`714e028e`)
- Fix `InteractiveExample`: trigger completion callback only when both quiz and reading are complete (`27570207`)

#### Daily Questions

- Refactor `DailyQuestionFullCard` to extract `getDailyQuestionPrefix` for readability (`067aa3e4`)
- Refactor `useChatList` to filter daily questions by language-specific prefix (`36b94f3e`)
- Refactor `DailyQuestionFullCard` to use settings for dynamic space ID and handle loading state (`703deb42`)
- Update `AppNotificationsButton`: rename header from "Inbox" to "Notifications" (`29690bed`)

#### Audio

- Set audio volume to `1` when starting quiz in `StoriesModal` (`89c98ea1`)
- Add audio unlock check in cache and preload word audio functions (`04672012`)

#### Transcript Handling

- Refactor transcript handling: unify state management and streamline logic (`3c9fe7a2`)
- Refactor transcript merging: implement `mergeTranscriptText` and `mergeTranscriptParts` (`cee69639`)
- Enhance native transcript handling: add error recovery and streamline state sync (`3a81581b`)

#### Currency

- Validate currency inputs and update API endpoint for fetching conversion rates (`cde7248b`)
- Remove debug logging from `getCurrencyRateRequest` (`19cb51bd`)
- Fix currency conversion rate fetching: ensure currency code is uppercase (`1578eb84`)
- Comment out unsupported currency `cdf` (`2bdccead`)

#### Store / Price UI

- Refactor `StoreCard` structure: extract `CardItemIcon` and `StoreButton` components (`d6c63dbc`)
- Remove `PriceContact` component from `BalanceContent` and `SubscriptionPaymentModal` (`a4b5a724`)
- Remove unused imports and clean up `Stack` component in `PricePage` (`6ea6dd98`)

#### Support & Chat

- Refactor chat and support features: add support page toggle and update messaging (`6a41fecc`)

---

### Removed

- Hide "Community Spaces" feature (`76d4dff0`)
- Hide "Debates" feature (`235ec852`)
- Remove `QuestionComment` component and related Firestore references (`2b30652d`)
- Remove `PriceContact` component from payment UI (`a4b5a724`)

---

### Fixed

- Fix `InteractiveExample`: completion callback fires only when both quiz and reading are done (`27570207`)
- Fix currency conversion: uppercase currency code before fetching rates (`1578eb84`)
- Add sleep function to delay user settings retrieval in `useProvideSettings` (race condition fix) (`1cb3623c`)
- Add Sentry error tracking for JSON parsing failures in `useTextAi` (`1e7b4d89`)

---

### Security

- Wrap `TestPage` with `AuthWall` for improved access control (`516247bb`)
- Add Sentry error tracking for user settings creation in Firestore (`115bfb08`)
- Add Sentry tracking for currency conversion failures (`f3002094`)

---

### Infrastructure

- Move `LICENSE` and `SECURITY` policy files to root (`826ef8ed`)
- Rename `drop` script to `dropStorage`; add `clean` step to `run-all` script (`08c9dffa`)
- Add `restore-libs` script to `package.json` for `ffmpeg-static` installation (`6c9ae01a`)
- Add `jsonrepair` dependency and integrate JSON repair in `useTextAi` (`0daa94dd`)
- Refactor date formatting in `UserCard` and `useDailyTasks` to use ISO string format (`5e3a6248`)
