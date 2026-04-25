# Yellow Jacket Tour

Single-file HTML build of the Yellow Jacket Tour — the World Series of Golf-Poker. Heads-up Texas Hold'em on a golf scorecard, with a 100-year tournament simulator and full WSOP-style economics. Runs entirely client-side. No install, no server, no accounts.

## What it is

A hybrid card game and tournament simulator built around a single scoring law called **Stroke-Honey**:

- Hand category sets a bounded golf score per hole (Royal Flush −5 down to weak High Card +2).
- Wagered strokes form a **honey pot** — the side pot that the hole winner claims as a credit subtracting from their round score.
- Tied holes carry the honey pot forward, sweetening the next decisive hole.
- Lower round total wins, just like real golf. Champions average slightly above par; deep below-par finishes are legendary by design.

The same engine powers both gameplay (you sit at a table) and simulation (a 30,000-player population plays out 100-year careers across majors, regulars, and the WSOP-style annual Main Event).

## How to play

Open `index.html`. The sidebar gives you three game modes plus the simulator:

- **Single Player** — Heads-up vs a Yellow Jacket AI. Pick a tier (Beginner · Casual · Pro · Elite), match length (9 / 18 / 36 / 72 holes), and stroke cap. The AI uses the same threshold-coupled honey-EV decision logic as the simulator pool.
- **Multiplayer · Hot-Seat** — Two humans, one device. Pass the laptop hole-by-hole; cards hide behind a cover overlay between turns.
- **Multiplayer · Share-Link** — Chess-by-mail style. Make your move, copy the encoded URL, send it to your opponent. They load the link, play their turn, send back. Each state carries a checksum so tampering is detectable.

Each visitor's career, simulator runs, and saved games persist in their own browser via localStorage. Nothing syncs across devices.

## What's inside

- **Live game table** with golf-themed street names: Tea Box → Drive → Hazard → Putt → The Cup
- **Simulator** — run 1 to 100 seasons over a pool of up to 100,000 players, with configurable buy-ins, sponsor purses ($0–$100B per event), satellite/qualifier mechanics, and full economic modeling
- **Tour structure** — 4 majors + N regulars + 1 Main per season, single-elim brackets, 72-hole finals, sudden-death playoffs
- **Major-as-satellite** mechanic — top finishers in each major earn free Main Event seats (WSOP economics)
- **Run Registry** — every simulation snapshot saved with full config + metrics for side-by-side comparison
- **Yellow Jacket Inc · Foundation Ledger** — career-cumulative house economics (rake collected, prize pool paid, ITM rate, ROI by skill tier)
- **Detailed analytics** — skill→wins curve, bracket conversion by tier, champion score distribution, head-to-head matrix, profit distribution, action rates by street
- **CSV export** with live config snapshot for reproducible audits
- **Rulebook tab** with complete scoring formulas, tournament rules, and lore
- **Buzz's Coach Corner** — strategy tips, FAQs, legendary moments

## Live demo

Once published via GitHub Pages, anyone can play in their browser:

`https://<your-username>.github.io/<repo-name>/`

Each visitor gets their own independent save state in their own browser. Career runs don't sync between devices.

## Publish on GitHub Pages

1. Open your Yellow Jacket repo on github.com.
2. Click **Add file → Upload files**.
3. Drag `index.html` into the upload area.
4. Commit message: `Initial Yellow Jacket Tour build` → **Commit changes**.
5. Go to **Settings → Pages**.
6. Under **Build and deployment → Source**, choose **Deploy from a branch**.
7. Set **Branch: main**, folder **/ (root)** → **Save**.
8. Wait ~60 seconds. The Pages URL appears at the top.

## Updating

When the build changes, replace `index.html` in the repo (web upload or `git push`). Pages redeploys automatically within ~60 seconds. Hard-refresh the live URL (Ctrl+Shift+R / Cmd+Shift+R) so your browser picks up the new HTML instead of cached.

## Play locally

If you'd rather not publish: double-click `index.html`. It opens in your default browser and runs entirely from the local filesystem. Save state is browser-local; no server required.
