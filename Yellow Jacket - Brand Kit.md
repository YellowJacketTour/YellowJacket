Brand Kit  
\*\*Yellow Jacket Tour – v35 (2026.04.26-v35)\*\*    
\*\*Handoff Document for Design / Marketing Production Team\*\*

\#\# Brand Positioning Summary  
Yellow Jacket Tour is a hybrid heads-up Texas Hold’em × golf-scoring tournament game. Every hole is one poker hand whose final hand category maps to a tightly bounded golf score (−5 Hole-in-One to \+2 Double Bogey). Wagered “honey” (agreed-total pot) is normalized by round length and subtracted from the scorecard, producing golf-realistic 18- to 72-hole totals organized into WSOP-style satellite ladders feeding a prestige Main Event.

It is built for two distinct but related audiences: competitive card-game players who crave sharp skill expression (\*\*Yellow Jacket Tour\*\*) and casual/social golfers or poker hobbyists who want a golf-realistic hybrid feel (\*\*Bumblebee League\*\*). What makes it distinct is the \*\*v32 two-variant design split\*\*—identical core engine, different decisive-showdown loser scoring—plus the unprecedented “agreed-total” wagering mechanic, themed golf jargon (Tea Box, The Cup), and the lore-rich “honey / sting / hive” register that treats poker aggression as a yellow jacket’s bluff. Champions literally “wear the Yellow Jacket.” The game ships as a single-file browser app (index.html v35) with no backend, designed for instant play, simulation, and print-ready rulebooks.

\#\# Color Palette  
Production CSS values from \`:root\` and \`\[data-theme="sunday"\]\` (verified in index.html \`\<style\>\` block).

\*\*Primary Light Theme (default “Clubhouse” mode)\*\*  
\- \`--cream: \#F5F1E8\` — primary background  
\- \`--green: \#006747\` — structural headings, fairway green  
\- \`--gold: \#C9A857\` — accents, CTAs, “Yellow Jacket” highlights  
\- \`--honey: \#FFC107\` — high-emphasis pot indicators (use sparingly)  
\- \`--honey-soft: \#FFE082\` — tints  
\- \`--fairway: \#6D7066\` — secondary text

\*\*Functional\*\*  
\- \`--bg-dark: \#0B5544\` (sidebar/toasts)  
\- \`--chart-pos: \#B85A3A\` (above-par/loss)  
\- \`--chart-neg: \#1E7A4E\` (below-par/win)  
\- \`--text-accent-pink: \#8E3A5F\` (Masters-pink callouts)

\*\*Dark Theme (“Sunday Mode”)\*\*  
\- \`--bg-app: \#0A2A1B\`, \`--bg-surface: \#143E2B\`  
\- \`--text-heading: \#E8CF92\` (warm gold)

\*\*Hierarchy & Usage Rules\*\*  
\- Headings & structure → \`--green\` / \`--text-heading\`  
\- CTAs, highlights, trophy marks → \`--gold\`  
\- Honey-pot emphasis → \`--honey\` (sparingly)  
\- Money charts use v33 polarity (positive \= green, negative \= red)  
\- Maintain WCAG AA contrast (already satisfied in production CSS).

\#\# Typography System  
\- \*\*Headings:\*\* Georgia serif (h1–h3) — old-school golf-club lineage. Small-caps \+ \`letter-spacing: 0.7px\` \+ uppercase for section labels.  
\- \*\*Body & UI:\*\* System stack \`-apple-system, Segoe UI, ...\` (\`.ui-sans\` class).  
\- \*\*Monospace:\*\* SF Mono / Menlo / Consolas (\`.mono\` class) for scores and data.  
\- \*\*Pairings:\*\* Georgia headings \+ system sans body \= classic golf-program elegance.

\#\# Voice & Tone Guidelines  
Adopt the lore-rich “honey / sting / hive” register from the Rulebook (§13.3):

\> “Every wager pours a drop of honey into the pot. Win the hand and the honey is yours; tie and it carries forward, sweetening the next pot. A bluff is a sting: a yellow jacket’s feint that dares the opponent to stay. … Bumble bees gather quietly; yellow jackets sting to claim the hive.”

\*\*Do\*\*    
\- Use “the sting,” “pouring honey,” “carry the pot forward,” “wear the Yellow Jacket.”    
\- Layer golf-tour formality on top.

\*\*Don’t\*\*    
\- Use classic gambling slang (“pot,” “chips,” “blinds”).    
\- Overuse cutesy bee puns — keep them structural.

\#\# Jargon Vocabulary  
\*\*Themed Street Names\*\* (use everywhere):

| Poker term     | YJ term       | Meaning                              |  
|----------------|---------------|--------------------------------------|  
| Pre-flop      | \*\*Tea Box\*\*   | First betting round                 |  
| Flop          | \*\*Drive\*\*     | Second betting round                |  
| Turn          | \*\*Hazard\*\*    | Third betting round                 |  
| River         | \*\*Putt\*\*      | Final betting round                 |  
| Showdown      | \*\*The Cup\*\*   | Cards revealed                      |

\*\*When to use:\*\* All player-facing copy, UI, rulebooks, and marketing. Never revert to classic poker terms except in technical footnotes.

\#\# Logo & Icon Language  
\- \*\*Mascot:\*\* “Buzz” — friendly anthropomorphic yellow jacket (see SVG in index.html header). Use approachable style for Bumblebee League, crisp/heraldic for Yellow Jacket Tour.  
\- \*\*Motif:\*\* Hexagonal honeycomb pattern (gold/cream in light theme, warm gold in dark).  
\- \*\*Trophy/Ribbon:\*\* Gold trophy for championships; ribbon variant for 3-year champion exemption badges.

\#\# Sample Marketing Copy  
\*\*Twitter-length tagline:\*\*    
“Poker on a scorecard. Honey in the pot. One sting at a time. Yellow Jacket Tour — where the hive decides the champion.”

\*\*100-word product description:\*\*    
Yellow Jacket Tour turns every heads-up Texas Hold’em hand into a golf hole. Deal, bet an agreed total of honey, reach The Cup, and your hand category becomes a bounded golf score (−5 to \+2). Win the honey and it subtracts from your scorecard at round’s end. Two variants share the same engine: competitive Yellow Jacket (loser posts \+1 bogey) or casual Bumblebee League (loser scores their own hand). From weekly Regulars to the prestige Main Event, champions wear the Yellow Jacket.

\*\*250-word landing-page hero:\*\*    
The game that marries the sting of poker with the soul of golf. Every hole is one heads-up hand. The pot is always exactly the most recently agreed total of honey. Mandatory 2-honey opener. Progressive stroke caps. Ties carry the entire pot forward. At showdown your hand maps to a real golf score. In Yellow Jacket the loser posts \+1; in Bumblebee the loser scores their actual hand. Honey is normalized by round length and subtracted from the scorecard. Play brackets or 72-hole aggregate. Win a Major and earn a 3-year exemption. The Main Event champion wears the Yellow Jacket — literally. Two games. One hive. Choose your sting.

\#\# Variant Identity Differentiation  
\*\*Shared family:\*\* Same Buzz mascot, honeycomb motif, gold/cream/green palette, Georgia typography, themed jargon.

\*\*Yellow Jacket Tour (competitive):\*\* Heraldic yellow jacket silhouette, sharper gold accents, prestige tone.    
\*\*Bumblebee League (casual):\*\* Friendlier Buzz, softer honey tints, social/golf-club tone.

\#\# Audience Positioning Summary  
\- \*\*Primary:\*\* Competitive online card-game players    
\- \*\*Secondary:\*\* Golf fans curious about poker-adjacent design    
\- \*\*Tertiary:\*\* Poker fans interested in WSOP-flavored hybrids  

\#\# Five Suggested Taglines  
1\. \*\*Primary (competitive):\*\* “One sting decides the hive. Wear the Yellow Jacket.”    
2\. \*\*Secondary (golf):\*\* “Poker hands on a golf scorecard. Honey in the pot. Par is just the beginning.”    
3\. \*\*Tertiary (poker):\*\* “No blinds. No antes. Just agreed honey and a scorecard. Welcome to the Tour.”    
4\. \*\*Bumblebee League:\*\* “Gather quietly. Score your own hand. The hive rewards every flight.”    
5\. \*\*Cross-audience:\*\* “Heads-up poker. Golf scoring. Two variants. One champion’s jacket.”

\*\*End of Brand Kit\*\* — production-ready.  
