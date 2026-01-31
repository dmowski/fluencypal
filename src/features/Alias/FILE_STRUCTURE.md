# Alias Game - File Structure & Module Responsibilities

## Directory Overview

```
src/features/Alias/
├── components/          # UI components and screens
├── context/             # React Context for state management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and game logic
├── data/                # Game data (word categories)
├── types.ts             # TypeScript type definitions
├── AliasPage.tsx        # Main page router component
├── implementationPlan.md # Detailed implementation phases
└── readme.MD            # This file
```

## Core Modules & Responsibilities

### Context Layer (`context/GameContext.tsx`)

**Purpose**: Global game state management

**Responsibilities**:
- Maintains centralized game state (settings, rounds, players, scores)
- Provides reducer-based state mutations
- Handles all game action dispatches

**Key Actions**: 
- Game initialization and reset
- Turn/round progression
- Word action recording (correct/skip)
- Round completion detection
- Screen navigation

---

### Hooks (`hooks/useGameState.ts`)

**Purpose**: Simplified interface to game state and mutations

**Responsibilities**:
- Wraps context access with custom logic
- Provides helper functions for common operations
- Calculates derived data (scores, current player, winners)
- Word management (next word selection, state updates)

**Key Functions**:
- `startGame()`, `startRound()`, `startTurn()` - Game initialization
- `endTurn()`, `endRound()`, `endGame()` - Game progression
- `isRoundComplete()`, `incrementRound()` - Round logic
- `getScores()`, `getWinner()`, `getCurrentPlayer()` - Getters
- `recordCorrect()`, `recordSkip()` - Word action handling

---

### Utilities (`utils/`)

#### **gameEngine.ts**
**Purpose**: Core game logic and word management

**Responsibilities**:
- Build initial word pool from categories by difficulty
- Pick next word (avoiding repeats from current session)
- Manage skipped words (can reappear later)
- Track word usage across turns

**Key Functions**:
- `buildInitialWordPool(categories, settings)` - Initialize word list
- `pickNextWord(available, used, skipped)` - Select next word strategically
- `appendWordUsage()` - Update word tracking after action

#### **wordManager.ts**
**Purpose**: Word filtering and retrieval

**Responsibilities**:
- Filter words by difficulty (simple/advanced)
- Retrieve words from specific categories
- Validate word availability

#### **scoreCalculator.ts**
**Purpose**: Score calculation and ranking

**Responsibilities**:
- Calculate player/team scores based on turn results
- Determine winners
- Generate leaderboards

---

### Data (`data/categories.ts`)

**Purpose**: Word database and category definitions

**Responsibilities**:
- Store all word categories with simple/advanced word lists
- Provide category metadata (names, descriptions)

**Available Categories**: Animals, Food, Sports, Technology, Travel, Nature, Professions, Home

---

### Types (`types.ts`)

**Purpose**: TypeScript type definitions

**Responsibilities**:
- Define game data structures (Player, Team, GameSettings, TurnState, etc.)
- Define game screens (GameScreen union type)
- Define game actions and enums
- Provide initial state templates

---

### Components (`components/`)

#### Screen Components (Game Screens)

| Component | Purpose | Key Responsibility |
|-----------|---------|-------------------|
| `ModeSelection.tsx` | Mode picker | Allow user to choose free-for-all or teams |
| `PlayersSetup.tsx` | Player configuration | Add/edit players, assign to teams |
| `LanguageLevel.tsx` | Difficulty selection | Choose simple or advanced words |
| `CategorySelection.tsx` | Word category picker | Select one or multiple categories |
| `RoundSettings.tsx` | Round configuration | Set turn type (timed/fixed) and round count |
| `TurnStart.tsx` | Turn intro screen | Show current player/team and scores |
| `GamePlay.tsx` | Main gameplay | Display words, handle correct/skip actions, manage timer |
| `TurnSummary.tsx` | Turn results | Show scores, word list, handle round progression |
| `Scoreboard.tsx` | Live standings | Display ranked scores, current player highlight |
| `GameEnd.tsx` | Final results | Announce winner, show final standings & statistics |

#### UI Components

| Component | Purpose |
|-----------|---------|
| `WordCard.tsx` | Large word display |
| `GameControls.tsx` | Correct/Skip buttons |
| `Timer.tsx` | Countdown display for timed mode |
| `WordCounter.tsx` | Progress display for fixed-words mode |
| `CategoryCard.tsx` | Category selection card |

#### Main Router

| Component | Purpose |
|-----------|---------|
| `AliasPage.tsx` | Main app container, routes to correct screen based on game state |

---

### Tests

| File | Type | Coverage |
|------|------|----------|
| `GameContext.test.tsx` | Unit | Redux-like reducer logic, round progression |
| `GamePlay.test.tsx` | Unit | Timer behavior, word countdown consistency |
| `gameEngine.test.tsx` | Unit | Word selection, skipped word management |
| `e2e/alias.spec.ts` | E2E | Full gameplay flows, UI interactions, round advancement |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Game Context (GameContext.tsx)                          │
│ - Global state (settings, rounds, players, scores)      │
│ - Reducer for state mutations                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ useGameState Hook (hooks/useGameState.ts)               │
│ - Wraps context                                         │
│ - Provides helper functions                             │
│ - Calculates derived data                               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Components (components/*.tsx)                           │
│ - Read state via hook                                   │
│ - Dispatch actions via hook                             │
│ - Re-render on state changes                            │
└─────────────────────────────────────────────────────────┘
```

---

## Game State Structure

```typescript
{
  screen: GameScreen,                    // Current screen
  settings: GameSettings | null,         // Game configuration
  currentRound: number,                  // Current round (1-based)
  currentTurnIndex: number,              // Turn counter within round
  rounds: RoundState[],                  // Completed/active rounds
  availableWords: string[],              // Words available for game
  usedWords: string[],                   // Words used in round
  skippedWords: string[],                // Words skipped (may reappear)
  isGameActive: boolean,                 // Game in progress flag
  winner: string | null,                 // Winner ID (if game ended)
}
```

---

## Screen Flow Diagram

```
Mode Selection
    ↓
Players Setup
    ↓
Language Level
    ↓
Category Selection
    ↓
Round Settings
    ↓
Turn Start ──→ View Scoreboard
    ↓
Game Play
    ↓
Turn Summary ──→ View Scoreboard
    ↓
[Round Complete?]
    ├─ Yes → Increment Round → Turn Start
    └─ No → Turn Start (next player)
    ↓
[All Rounds Done?]
    ├─ Yes → Game End
    └─ No → Continue Round Loop
    ↓
Game End
    ↓
[Play Again / New Game → Mode Selection]
```

---

## Module Communication Patterns

**Component to State**: 
- Components call hooks → hooks dispatch actions to context

**State to Component**: 
- Context provides updated state → React re-renders components with new props

**Utility Functions**: 
- Components call utility functions for complex logic (word picking, scoring)

**Type Safety**: 
- All data flows through TypeScript interfaces ensuring compile-time type checking

---

## Adding New Features

### New Game Setting
1. Add to `GameSettings` type in `types.ts`
2. Update `initialGameSettings` in `types.ts`
3. Add to reducer cases in `GameContext.tsx` if state-related

### New Game Screen
1. Create component in `components/`
2. Add screen type to `GameScreen` union in `types.ts`
3. Add case to screen router in `AliasPage.tsx`
4. Connect to game flow via `setScreen()` hook

### New Game Logic
1. Add utility function to `utils/` if complex
2. Call from hook or component as needed
3. Add unit tests for logic

### New Game Action
1. Add action type to `GameAction` union in `GameContext.tsx`
2. Add case to reducer in `GameContext.tsx`
3. Create hook function if needed in `useGameState.ts`
4. Add tests for action and reducer case

### Tests
1. Unit tests for business logic (reducers, utilities)
2. E2E tests for UI flows and user interactions
3. Test edge cases (round progression, game end conditions)

---

## Key Design Principles

1. **Separation of Concerns**: Logic separated into utils, state, and UI layers
2. **Type Safety**: Comprehensive TypeScript types prevent bugs at compile time
3. **Immutable Updates**: All state changes through immutable reducer patterns
4. **Testability**: Pure functions in utils and reducers are easy to test
5. **Reusability**: Utilities and hooks can be used across multiple components
6. **Scalability**: Easy to add new screens, logic, or game features
