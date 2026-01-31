# Alias Game Implementation Plan

## Overview

Building a responsive web-based Alias word guessing game for English learning. The game is played in a pass-the-phone format with SPA-like behavior.

---

## Implementation Phases

### Phase 1: Project Setup & Basic Routing ✓

**Goal:** Set up the basic page structure and routing

**Tasks:**

- [x] Create `/alias` route in Next.js app router
- [x] Create basic AliasPage component with 'use client'
- [x] Set up basic layout and structure

**E2E Tests:**

- ✓ Verify `/alias` page renders successfully
- ✓ Verify page has correct HTML lang attribute

**Status:** COMPLETED

---

### Phase 2: Game State Management & Data Models ✓

**Goal:** Create TypeScript interfaces, enums, and state management structure

**Tasks:**

- [x] Define TypeScript interfaces:
  - `GameMode` (free-for-all | teams)
  - `Player` (id, name, team?)
  - `Team` (id, name, players, score)
  - `Category` (id, name, words: {simple, advanced})
  - `TurnType` (timed | fixed-words)
  - `GameSettings` (all configuration)
  - `GameState` (current game status)
  - `TurnState` (current turn data)
- [x] Create word lists for categories:
  - 8 categories created (Animals, Food, Sports, Technology, Travel, Nature, Professions, Home)
  - Each with 50 simple words and 50 advanced words
  - Helper functions for category access

- [x] Set up React Context or state management:
  - GameContext for global game state with reducer pattern
  - Comprehensive action types and reducer logic
  - Hooks for state access and mutations

**Files Created:**

- ✓ `src/features/Alias/types.ts`
- ✓ `src/features/Alias/data/categories.ts`
- ✓ `src/features/Alias/context/GameContext.tsx`
- ✓ `src/features/Alias/hooks/useGameState.ts`

**E2E Tests:**

- ✓ Existing E2E tests still passing (verified game didn't break)

**Status:** COMPLETED

---

### Phase 3: Mode Selection Screen ✓

**Goal:** Allow users to choose between Free-for-all and Teams mode

**Tasks:**

- [x] Create ModeSelection component
- [x] Add two large buttons: "Free-for-all" and "Teams"
- [x] Update game state when mode is selected
- [x] Navigate to Players Setup on selection
- [x] Responsive design for mobile and desktop
- [x] Add icons and descriptions for each mode
- [x] Touch-friendly button sizes (verified in tests)

**Files Created:**

- ✓ `src/features/Alias/components/ModeSelection.tsx`
- ✓ `src/features/Alias/components/PlayersSetup.tsx` (placeholder)
- ✓ Updated `src/features/Alias/AliasPage.tsx` with screen routing

**E2E Tests:**

- ✓ Verify mode selection screen displays both options
- ✓ Click "Free-for-all" button and verify navigation
- ✓ Click "Teams" button and verify navigation
- ✓ Verify button text and descriptions
- ✓ Verify responsive design on mobile viewport (375x667)
- ✓ Verify touch-friendly button sizes (>44px)

**Status:** COMPLETED

---

### Phase 4: Players Setup Screen

**Goal:** Allow users to add 2-20 players with custom names

**Tasks:**

- [x] Create PlayersSetup component
- [x] Add player input fields (dynamic, 2-20 players)
- [x] Validate minimum 2 players
- [x] Generate default names (Player 1, Player 2, etc.)
- [x] Allow custom name editing
- [x] Add/remove player functionality
- [x] For Teams mode: assign players to teams
- [x] "Continue" button (disabled until valid)
- [x] "Back" button to mode selection

**Files Created:**

- `src/features/Alias/components/PlayersSetup.tsx`
- Updated `src/features/Alias/hooks/useGameState.ts` to initialize settings
- Updated `e2e/alias.spec.ts` with players setup tests

**E2E Tests:**

- ✓ Verify default 2 players are shown
- ✓ Add a player and see it appear
- ✓ Remove button disabled when only 2 players
- ✓ For teams mode: verify team assignment UI
- ✓ Verify navigation from mode selection to players setup

**Status:** COMPLETED

---

### Phase 5: Language Level Selection

**Goal:** Allow users to choose difficulty level

**Tasks:**

- [x] Create LanguageLevel component
- [x] Two buttons: "Simple" and "Advanced"
- [x] Display description of each level
- [x] Update game settings with selection
- [x] Back/Continue navigation

**Files Created:**

- `src/features/Alias/components/LanguageLevel.tsx`
- `src/features/Alias/components/CategorySelection.tsx` (placeholder)
- Updated `src/features/Alias/AliasPage.tsx` to include new screens
- Updated `e2e/alias.spec.ts` with language level tests

**E2E Tests:**

- ✓ Verify both difficulty options are displayed
- ✓ Select "Simple" and verify selection state
- ✓ Select "Advanced" and verify selection state
- ✓ Verify back/continue navigation to category selection

**Status:** COMPLETED

---

### Phase 6: Category Selection

**Goal:** Allow users to select word categories

**Tasks:**

- [x] Create CategorySelection component
- [x] Display all available categories
- [x] Allow multiple category selection
- [x] Require at least one category selected
- [x] Show preview/description of each category
- [x] "Select All" / "Deselect All" options
- [x] Back/Continue navigation

**Files Created:**

- `src/features/Alias/components/CategorySelection.tsx`
- `src/features/Alias/components/CategoryCard.tsx`
- `src/features/Alias/components/RoundSettings.tsx` (placeholder)
- Updated `src/features/Alias/AliasPage.tsx` for round settings navigation
- Updated `e2e/alias.spec.ts` with category selection tests

**E2E Tests:**

- ✓ Verify all categories are displayed
- ✓ Verify "Select All" functionality
- ✓ Verify "Deselect All" functionality
- ✓ Continue is disabled when no categories selected
- ✓ Verify navigation to round settings

**Status:** COMPLETED

---

### Phase 7: Round Settings

**Goal:** Configure turn type and number of rounds

**Tasks:**

- [x] Create RoundSettings component
- [x] Turn type selection:
  - Timed rounds (30s, 60s, 90s options)
  - OR Fixed words (5, 10, 15 words options)
- [x] Number of rounds selection (1-10)
- [x] Display summary of settings
- [x] Back/Start Game navigation

**Files Created:**

- `src/features/Alias/components/RoundSettings.tsx`
- `src/features/Alias/components/TurnStart.tsx` (placeholder)
- Updated `src/features/Alias/AliasPage.tsx` for turn-start routing
- Updated `e2e/alias.spec.ts` with round settings tests

**E2E Tests:**

- ✓ Select timed round mode with different durations
- ✓ Select fixed words mode with different counts
- ✓ Change number of rounds
- ✓ Verify "Start Game" navigates to turn start

**Status:** COMPLETED

---

### Phase 8: Game Engine & Word Logic

**Goal:** Implement core game logic and word management

**Tasks:**

- [x] Create game engine utilities:
  - Word shuffling from selected categories
  - Filter words by difficulty level
  - Track shown/skipped words
  - Prevent immediate word repetition
  - Allow skipped words to reappear later
- [x] Round management helpers
- [x] Scoring logic helpers

**Files Created:**

- `src/features/Alias/utils/gameEngine.ts`
- `src/features/Alias/utils/wordManager.ts`
- `src/features/Alias/utils/scoreCalculator.ts`
- Updated `src/features/Alias/hooks/useGameState.ts` to use utilities

**E2E Tests:**

- No direct E2E tests (covered through gameplay flows)
- Unit tests recommended for game logic

**Status:** COMPLETED

---

### Phase 9: Turn Start Screen

**Goal:** Display whose turn it is before starting

**Tasks:**

- [x] Create TurnStart component
- [x] Display current player/team name
- [x] Show current round number
- [x] Show current scores
- [x] "Start Turn" button (big, easy to tap)
- [x] Ready screen before showing words

**Files Created:**

- `src/features/Alias/components/TurnStart.tsx`
- `src/features/Alias/components/GamePlay.tsx` (placeholder)
- Updated `src/features/Alias/components/RoundSettings.tsx` to start game
- Updated `src/features/Alias/AliasPage.tsx` to route gameplay
- Updated `e2e/alias.spec.ts` with turn start tests

**E2E Tests:**

- ✓ Verify correct player name is displayed
- ✓ Verify round info is shown
- ✓ Click "Start Turn" navigates to gameplay placeholder

**Status:** COMPLETED

---

### Phase 10: Word Display & Gameplay

**Goal:** Core gameplay - showing words and handling correct/skip

**Tasks:**

- [x] Create WordCard component:
  - Large, readable word display
  - High contrast design
  - Word changes on action
- [x] Create GameControls component:
  - "Correct" button (green, +1)
  - "Skip" button (red/orange, -1)
  - Large, touch-friendly buttons
- [x] Timer component (for timed mode):
  - Countdown display
  - Auto-end turn when time expires
- [x] Word counter (for fixed words mode):
  - Show progress (e.g., "3/10")
  - Auto-end turn when count reached
- [x] Turn state management:
  - Track current word
  - Handle correct/skip actions
  - Update scores in real-time
  - Load next word instantly

**Files Created:**

- `src/features/Alias/components/WordCard.tsx`
- `src/features/Alias/components/GameControls.tsx`
- `src/features/Alias/components/Timer.tsx`
- `src/features/Alias/components/WordCounter.tsx`
- `src/features/Alias/components/GamePlay.tsx`
- Updated `src/features/Alias/hooks/useGameState.ts` to prevent word repeats
- Updated `e2e/alias.spec.ts` with gameplay tests
- `src/features/Alias/components/WordCounter.tsx`
- `src/features/Alias/components/GamePlay.tsx`

**E2E Tests:**

- ✓ Verify word is displayed on screen
- ✓ Correct/Skip buttons are visible
- ✓ Verify timer is shown for timed mode
- ✓ Verify word counter is shown for fixed-words mode
- ✓ Correct/Skip triggers word change

**Status:** COMPLETED

---

### Phase 11: Turn Summary Screen ✓

**Goal:** Show results after each turn ends

**Tasks:**

- [x] Create TurnSummary component
- [x] Display:
  - Player/team name
  - Words guessed correctly (count)
  - Words skipped (count)
  - Net score for this turn
  - Updated total scores
- [x] List correct words (expandable/collapsible)
- [x] "Next Player" or "Next Turn" button
- [x] Auto-advance after delay (optional)

**Files Created:**

- `src/features/Alias/components/TurnSummary.tsx`

**E2E Tests:**

- ✓ Complete a turn and verify summary displays
- ✓ Verify correct word count is accurate
- ✓ Verify skip count is accurate
- ✓ Verify score calculations are correct
- ✓ Click "Next Turn" and verify next player/team is shown
- ✓ Verify total scores are updated correctly

**Bug Fixes:**

- ✓ Fixed timer jumping back to 60s (changed dependency from `turn` to `turn?.startTime`)

**Status:** COMPLETED

---

### Phase 12: Scoreboard Display

**Goal:** Show current standings during the game

**Tasks:**

- [ ] Create Scoreboard component
- [ ] Display all players/teams with scores
- [ ] Highlight current player/team
- [ ] Sort by score (optional)
- [ ] Show round progress
- [ ] Accessible from turn summary or as overlay

**Files to Create:**

- `src/features/Alias/components/Scoreboard.tsx`

**E2E Tests:**

- Verify all players/teams are listed
- Verify scores are displayed correctly
- Verify current player is highlighted
- Verify sorting (if implemented)

---

### Phase 13: Game End & Winner Screen

**Goal:** Show final results and declare winner

**Tasks:**

- [ ] Create GameEnd component
- [ ] Display:
  - Final scoreboard
  - Winner announcement (player/team)
  - Celebration animation/confetti (optional)
  - Game statistics (total words, accuracy, etc.)
- [ ] Action buttons:
  - "Play Again" (same settings)
  - "New Game" (back to mode selection)
  - "Change Settings" (back to settings screens)

**Files to Create:**

- `src/features/Alias/components/GameEnd.tsx`
- `src/features/Alias/components/WinnerDisplay.tsx`

**E2E Tests:**

- Play full game to completion
- Verify winner is declared correctly
- Verify final scores are accurate
- Click "Play Again" and verify new game starts with same settings
- Click "New Game" and verify return to mode selection
- Verify all game stats are displayed

---

### Phase 14: Navigation & Game Flow

**Goal:** Implement smooth transitions between all screens

**Tasks:**

- [ ] Create main game flow controller
- [ ] Implement screen transitions:
  - Mode Selection → Players Setup
  - Players Setup → Language Level
  - Language Level → Categories
  - Categories → Round Settings
  - Round Settings → Game Start
  - Game Loop (Turn Start → Gameplay → Turn Summary)
  - Final Round → Game End
- [ ] Add progress indicator/breadcrumbs
- [ ] Implement back navigation where appropriate
- [ ] Add "Quit Game" option with confirmation
- [ ] Prevent accidental page refresh (warn user)

**Files to Create:**

- `src/features/Alias/components/GameFlow.tsx`
- `src/features/Alias/components/ProgressIndicator.tsx`
- `src/features/Alias/hooks/useGameFlow.ts`

**E2E Tests:**

- Navigate through entire setup flow
- Verify back buttons work correctly
- Start game and complete full game cycle
- Test quit game functionality
- Verify screen transitions are smooth
- Test browser back/forward buttons behavior

---

### Phase 15: Responsive Design & Mobile Optimization

**Goal:** Ensure excellent UX on all devices

**Tasks:**

- [ ] Mobile-first responsive design
- [ ] Touch-friendly button sizes (min 44x44px)
- [ ] Optimize layouts for:
  - Mobile portrait (320px - 480px)
  - Mobile landscape
  - Tablet (768px - 1024px)
  - Desktop (1024px+)
- [ ] Prevent screen sleep during gameplay
- [ ] Add viewport meta tags
- [ ] Test on various devices
- [ ] Ensure text readability on all screens

**E2E Tests:**

- Test on mobile viewport (375x667)
- Test on tablet viewport (768x1024)
- Test on desktop viewport (1920x1080)
- Verify all buttons are accessible
- Verify text is readable on all sizes

---

### Phase 16: Sound Effects & Audio (Optional)

**Goal:** Add audio feedback for better UX

**Tasks:**

- [ ] Add sound effects:
  - Correct answer sound
  - Skip sound
  - Timer warning sound
  - Turn end sound
  - Winner celebration sound
- [ ] Mute/unmute toggle
- [ ] Respect user's device settings
- [ ] Preload audio files

**Files to Create:**

- `src/features/Alias/components/AudioControls.tsx`
- `src/features/Alias/hooks/useAudio.ts`

**E2E Tests:**

- Toggle sound on/off
- Verify sounds play (if testable)
- Verify mute state persists

---

### Phase 17: Accessibility & Polish

**Goal:** Make the game accessible and polished

**Tasks:**

- [ ] Add ARIA labels
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Color contrast compliance (WCAG AA)
- [ ] Screen reader support
- [ ] Error handling and validation messages
- [ ] Loading states
- [ ] Smooth animations and transitions
- [ ] Add help/instructions modal

**Files to Create:**

- `src/features/Alias/components/Instructions.tsx`
- `src/features/Alias/components/HelpModal.tsx`

**E2E Tests:**

- Navigate using keyboard only
- Verify ARIA labels are present
- Test color contrast
- Verify help/instructions are accessible

---

### Phase 18: Testing & Bug Fixes

**Goal:** Comprehensive testing and bug resolution

**Tasks:**

- [ ] Complete E2E test coverage for all flows
- [ ] Test edge cases:
  - Minimum players (2)
  - Maximum players (20)
  - Single round
  - Multiple rounds
  - All categories selected
  - Single category
  - Rapid button clicking
  - Browser refresh during game
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Fix identified bugs

**E2E Tests:**

- Full game flow with 2 players
- Full game flow with 20 players
- Full game flow with teams
- Test all category combinations
- Test all timing options
- Rapid clicking stress test
- Browser refresh handling

---

## Development Guidelines

### Code Organization

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use 'use client' for interactive components
- Keep components small and focused
- Separate business logic from UI

### Styling

- Use Material-UI components (@mui/material)
- Follow existing project patterns
- Ensure responsive design
- High contrast for readability

### Testing Strategy

- Run E2E tests after each phase
- Add regression tests before moving to next phase
- Update E2E tests as features evolve
- Test on multiple browsers (Chrome, Safari, Firefox)

### Performance

- Optimize word list loading
- Minimize re-renders
- Use React.memo where appropriate
- Lazy load components if needed

---

## Success Criteria

✅ All E2E tests passing
✅ Game playable on mobile and desktop
✅ Smooth transitions, no page reloads
✅ Accurate scoring and game logic
✅ Responsive design working on all screen sizes
✅ Code is maintainable and well-documented
✅ No critical bugs or edge case failures

---

## Current Status: Phase 11 Complete ✓

**Completed Phases:**

- ✓ Phase 1: Project Setup & Basic Routing
- ✓ Phase 2: Game State Management & Data Models
- ✓ Phase 3: Mode Selection Screen
- ✓ Phase 4: Players Setup Screen
- ✓ Phase 5: Language Level Selection
- ✓ Phase 6: Category Selection
- ✓ Phase 7: Round Settings
- ✓ Phase 8: Game Engine & Word Logic
- ✓ Phase 9: Turn Start Screen
- ✓ Phase 10: Word Display & Gameplay
- ✓ Phase 11: Turn Summary Screen

**Next Step:** Phase 12 - Scoreboard Display
