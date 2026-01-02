# Memory Matching Game

A browser-based Memory Matching Game built with HTML, CSS, and JavaScript. Flip two cards at a time, find matching pairs, and try to finish with fewer attempts and a faster time.

## What I Built
- A grid-based game board with face-down cards
- A smooth card flip animation using CSS transforms and transitions
- Game logic that allows flipping two cards at a time, then checks for a match
- Match behavior:
  - If the cards match, they stay revealed
  - If they do not match, they flip back after a short delay
- Score tracking:
  - Attempts counter
  - Timer for how long the run takes
- A reset option that restarts the game and reshuffles the cards
- Responsive layout so the board adapts to different screen sizes

## Tech Used
- HTML for the page structure and game board container
- CSS for layout, styling, and the flip animation
- JavaScript for shuffling, click handling, matching logic, scoring, and reset behavior

## How to Run
### Option 1: Open directly
Open `index.html` in your browser.

### Option 2: Use a local server (recommended)
If you have Node.js installed, run this from the project folder:

```bash
npx http-server

Then open the local URL printed in the terminal.

Note: If changes are not showing up, hard refresh the page (or clear cache) so the browser loads the newest CSS/JS files.

How to Play
   1. Click a card to flip it.

   2. Click a second card to flip it.

   3. If the two cards match, they stay face up.

   4. If they do not match, they flip back down.

   5. Keep going until all pairs are matched.

   6. Try to minimize attempts and finish as fast as possible.

Folder Structure
.
├── index.html
├── readme.md
├── css/
│   └── styles.css
└── scripts/
    └── script.js

Implementation Notes (High Level)
   I generate a set of paired card values, then shuffle them at the start of each game.

   I track the current two flipped cards and temporarily lock input while evaluating a pair.

   Attempts increment when the second card is flipped (one attempt equals one pair check).

   The timer starts when the game begins and stops when all matches are found.

   Reset rebuilds the board state, reshuffles the cards, and clears attempts and time.

Possible Improvements
   Difficulty modes (4x4, 6x6, custom board sizes)

   Best score tracking using localStorage

   Keyboard support and stronger accessibility labels

   Sound effects and a win animation