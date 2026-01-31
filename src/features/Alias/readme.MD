## Alias Game Web App (English Learning)

### E2E tests

/e2e/alias.spec.ts
npx playwright test e2e/alias.spec.ts --reporter=line

### Implementation Plan

src/features/Alias/implementationPlan.md

### Overview

Create a responsive web application for playing an **Alias-style word explanation game in English**.
The game is designed for **desktop and mobile browsers** and is played in a **pass-the-phone** format (players are physically together, one device).

The app should be **SPA-like (single-page application)** with smooth transitions between steps.

---

### Core Game Concept

Alias is a word guessing game:

- One player (the **describer**) sees a word on the screen.
- They must explain the word **in English**, without saying the word itself.
- Other players guess **out loud**.
- When guessed correctly, the describer taps **“Correct”** and moves on.
- The phone is passed to the next player or team after the turn.

---

### Game Setup Flow

1. **Mode Selection**
   - Player chooses:
     - **Free-for-all** (each player scores individually)
     - **Teams** (players grouped into teams)

2. **Players Setup**
   - Number of players: **2–20**
   - Players can enter **custom names**
   - In team mode, players are assigned to teams

3. **Language Level**
   - User selects English difficulty:
     - **Simple**
     - **Advanced**

   - Difficulty affects word complexity and phrase length

4. **Categories**
   - Words are organized into **categories**
   - Each category has its own word list
   - Each category supports **Simple / Advanced** levels
   - User can select one or multiple categories before starting

5. **Round Settings**
   - User selects:
     - **Turn type**
       - Timed round (e.g. 30 / 60 / 90 seconds)
       - OR fixed number of words per turn

     - **Number of rounds**

   - Win condition: **best total score after N rounds**

---

### Gameplay Rules

- During a turn:
  - The screen shows **one word at a time** to the describer
  - Other players guess verbally (not in the app)

- Buttons:
  - **Correct** → +1 point
  - **Skip** → −1 point

- Unlimited skips allowed
- Previously skipped words may reappear later
- No hints or forbidden words (classic Alias rules)

---

### Turn Flow

1. Start turn
2. Show current player / team
3. Display word card
4. Timer runs (if timed mode)
5. Player taps:
   - **Correct**
   - **Skip**

6. Next word appears automatically
7. When time / word limit ends:
   - Turn summary shown
   - Phone is passed to next player or team

---

### Scoring

- +1 point for each correct guess
- −1 point for each skipped word
- Scores tracked:
  - Per player (free-for-all)
  - Per team (team mode)

---

### End of Game

- After all rounds are completed:
  - Show **final scoreboard**
  - Highlight winner (player or team)
  - Option to:
    - Restart game
    - Change settings
    - Start a new game

---

### UI / UX Notes

- Clean, minimal UI
- Large buttons (mobile-friendly)
- High-contrast word cards
- Clear indication of:
  - Current player / team
  - Remaining time or words
  - Current score

- Smooth transitions, no page reloads
- No login, no persistence required

---

### Technical Constraints

- Web-based
- Responsive (desktop + mobile)
- SPA-like behavior
- No external services required

---

## Architecture & Project Organization

For detailed information about file structure, module responsibilities, and data flow:

👉 **See [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)**

Key sections:

- Directory overview
- Core module responsibilities (Context, Hooks, Utilities, Components)
- Component reference tables
- Data flow architecture
- Screen flow diagram
- Module communication patterns
- Guidelines for adding new features
