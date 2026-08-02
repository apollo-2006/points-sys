# points-sys

**SEASON 1 · BATTLE FOR THE TOP**

A two-player points economy for real life. Workouts, sleep, studying and chores earn points, slipping loses them, and whoever is ahead holds the top of the leaderboard until the other one takes it back. Two people, one shared score, live-synced between phones.

The entire app is a single `index.html` file. No build step, no bundler, no framework. The only dependencies are the Firebase ES modules, imported straight from the CDN at runtime.

## Why

Habit apps are solitaire. The thing that actually moves the needle is someone else watching the scoreboard. So the design goal was never "track habits" but "make the other person visibly ahead of you," and everything else follows from that: shared state instead of per-user state, a single leaderboard, penalties that are real subtractions rather than a missed checkmark.

## How it works

### State

All state lives in one Firestore document, `apex_tracker/state`. Both clients subscribe with `onSnapshot`, so any claim, penalty or edit propagates to the other device immediately. Writes go through a single `saveState()` that pushes the whole document with `setDoc`.

The one sharp edge is the echo loop: rendering a remote snapshot must not trigger a write back. An `applyingRemote` flag is raised while a snapshot is being merged and rendered, and `saveState()` returns early while it is set.

`mergeState()` merges incoming data over a fresh `defaultState()` rather than replacing it outright, so a document written by an older version of the app never leaves a field undefined.

### Points economy

- **Daily habits** worth 1,000 to 2,500 points each, some with prerequisites (you cannot claim "woke up on time" without "got out of bed"). Claims are counted per day via a `{date, n}` pair, so the daily counter resets on its own without a cron job.
- **Quests**, tracked separately per person.
- **Achievements** for bigger one-off wins.
- **Penalties**, which are negative deltas applied through the exact same code path as a claim.
- **Shop**, where points are redeemed for real rewards. Some items have a fixed cost, some are flexible, some are priceless and cost nothing.

Everything above can be extended at runtime: custom habits, quests, penalties and shop items are stored in state, and built-in entries can be hidden rather than deleted so the defaults stay intact.

### Tiers

Four repeating tiers of 15,000 points: White, Blue, Purple, Gold. Tier name, color, level and progress bar are all derived arithmetically from the raw score, so there is no ladder table to maintain and the ranks keep cycling forever instead of capping out.

### History and undo

Every point change appends `{ts, party, delta, reason, key}` to a history log, newest first, capped at 400 entries. The log doubles as the undo stack: undoing a claim finds the most recent entry matching that party and key, reverses the delta, and splices the entry out. No separate undo bookkeeping exists.

### Boards

Drag-and-drop sticky notes, grouped into named sections with optional caps. Each note carries its own color and its own to-do list, and each to-do can be worth points, so completing one scores directly into the economy. Note positions are stored as percentages of the canvas rather than pixels, so a board laid out on a laptop still reads correctly on a phone.

### Bets

Either side can stake points on an outcome, mark it weekly to have it recur, and settle it later. Settlement moves the stake and writes to history. Reverting a bet cleans up its orphaned history entries.

## Setup

1. Create a Firebase project and enable **Firestore** and **Email/Password authentication**.
2. Create a user account for each player under Authentication.
3. Open `index.html`, find the `firebaseConfig` block near the top of the `<script>` tag, and paste in your project's config. Until you do, the page renders a setup notice instead of the app.
4. Set Firestore rules so only signed-in users can read and write the state document:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /apex_tracker/state {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. Open the file in a browser, or serve it from any static host.

## Stack

Vanilla HTML, CSS and JavaScript. Firebase Firestore for shared state, Firebase Auth for the login gate. No dependencies beyond that.
