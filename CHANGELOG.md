# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-03-30 to 2026-04-15

**Commits:** [`c6ccac3e...37a223a8`](../../compare/c6ccac3e49f06730b525e1b989c07fba97719892...37a223a8568a7303941f5faf04294589936b30b7)

---

### Added

#### Progress Tracking & AI Language Assessment

- Implement AI-powered progress evaluation: analyze conversations and score fluency, vocabulary, grammar, and confidence (`f8553979`)
- Add `ProgressCard` component for tracking language level on the dashboard (`ece184b0`)
- Add `ProgressStatsProvider` and Firestore schema for storing progress statistics (`8cf01d12`)
- Add `ProgressStatModal` and integrate with `GlobalModals` and `ProgressDashboardCard` (`97b74704`)
- Implement `ProgressChart` with loading state, tooltips, metric labels, and gradient fill (`cedbdf30`, `86c243dc`)
- Implement `ProgressViewChart` with period selection, metric toggle, positive change indicators, and daily gap filling (`825a0478`, `757e7a85`, `ea063365`, `300cd462`)
- Add `assessmentConfidenceSummary`, `sourceText`, and per-skill summary fields to `ProgressStat` (`7b45522e`, `a8bef1cb`, `7b1c29da`)
- Move progress evaluation to backend with chunked conversation processing (`5306e6a8`, `f7397299`, `a4d062f9`)
- Implement `ProgressEvaluationError` class for structured error handling (`48b419ef`)
- Add read/write Firestore security rules for `progressStats` collection (`f98bdb24`)
- Implement `fillDailyGaps` and progress aggregation utilities with unit tests (`825a0478`, `851588d1`)
- Add daily aggregation and smoothing calculations for progress stats (`730ea197`)
- Enable volume toggle in AI conversation context (`0fe29027`)
- Skip active conversations in progress evaluation for accuracy (`01ef8450`)

#### Quiz / Onboarding

- Add `VoiceSpeedSelector` component and integrate into `QuizQuestions` and `TeacherVoiceModal` (`5256dae4`)
- Add `LanguageToLearnShortSelector` component and integrate into `QuizQuestions` (`0c2d174e`)
- Add skip button to `QuizQuestions` for redirecting to practice (`e30476c3`)
- Enhance `NativeLanguageSelector` to separate system and other languages for clearer UI (`d267c670`)

#### Welcome Email System

- Implement welcome email for new user sign-ups with cron job trigger (`08b465c0`, `3d5ad130`)
- Add personalized welcome email content describing app purpose and expectations (`a05246c8`, `46d632b0`)
- Refactor payment confirmation email template to improve attachment section styling (`aa8ea5e3`)

#### Admin Panel

- Implement recent users loading and email functionality in admin panel (`593588c0`)
- Add `getRecentCreatedUsers` function for admin user lookup (`4456686e`)
- Display user country, native language, and last login time in `EmailsAdmin` (`79bdfdf5`, `b258f860`)

#### Global Chat Notifications

- Implement global chat unread count calculation and integrate into `ChatListContext` (`6a76d0a2`)
- Add utility functions for calculating unread messages across all chats (`cc23f632`)
- Enhance `AppNotificationsButton` with chat tab badge, global notification mode, and styling (`78fe6bab`)

#### User Settings & Auth

- Implement user settings initialization API and related types (`e668ffaf`)
- Add `ResetPage` component for user session reset functionality (`cbfaa2cc`)

#### Infrastructure / Project Structure

- Split app into `webApp/` and `landing/` packages; rename projects to `fluency-app` and `fluency-landing` (`78e0b503`, `c29d402c`, `6af6d30f`)
- Remove Firebase from landing app (`bf27ac77`)
- Remove scheduled cron jobs from `vercel.json` in landing (`cdf54fa7`)
- Update `robots.txt` in landing to disallow all web crawlers (`5f7c466a`)
- Add assessment API `maxDuration` and cron schedule in Vercel configuration (`34ff81ef`, `3847ebc2`)

---

### Changed

#### Progress Dashboard

- Refactor `ProgressViewChart` layout for improved metric selection UI and responsiveness (`b84bad35`, `f8510529`)
- Add tooltip with average level and comparison data to `ProgressViewChart` (`2c52f947`)
- Update `ProgressChart` gradient visibility, grid lines, and state overlay styles (`500def8c`, `e78c2286`)
- Add background gradient to `WelcomeScreen2` for improved visual appeal (`1ca225ce`)

#### URL / Navigation (App/Landing Split)

- Update all inter-app links to use `getAppUrlStart` and `getLandingUrlStart` for subdomain consistency (`1a5b9cf8`, `80f4da86`, `51c85aa8`, `90776c08`)
- Replace `LandingPage` with `PracticePage` in RolePlay module and update SEO metadata handling (`7e7bfe8c`, `17e353fa`)

#### Currency / Pricing

- Replace manual currency conversion with `convertPrice` utility across components (`15c62de2`)
- Fix total price calculation and currency formatting to display without decimal places (`c1b94201`, `abbf0fa2`)
- Add currency support validation in `getConversionRate` function (`45d0eb9c`)

#### Payments

- Prevent resetting payment success state when closing modal if no payment occurred (`51939617`)
- Increase delay before resetting payment success state on modal close (`14c92d9f`)

#### FAQ / Landing

- Enhance FAQ answer on progress tracking in `LandingPage` component (`717f96a6`)
- Update FAQ section text and label for clarity (`4bf4c131`)

---

### Fixed

- Fix play state management in `AudioPlayIcon` to handle audio interruptions correctly (`b51f1852`)
- Fix `AvatarCard` voice toggle: deselect correctly when playing voice (`cc3d28b3`)
- Fix `AudioPlayIcon` positioning in `AvatarCard` (`6c760497`)
- Fix Chinese translation references in `SubscriptionPaymentModal` (`c7baa89c`)
- Fix Instagram image URL in email template configuration (`01e484a0`)

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
