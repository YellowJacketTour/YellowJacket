\# Deliverable 4 · Complete Game Manual / Player Codex

\*\*Yellow Jacket Tour\*\*    
\*\*Player Codex & Rulebook\*\*    
\*\*Version v35 · 2026.04.26-v35\*\*    
\*\*Canonical build: index.html (single-file browser app)\*\*  

\*\*Printed Edition Ready\*\*    
This manual is designed to be printed and bound. Pages are numbered for easy reference. Every rule is stated explicitly and unambiguously. Terms appear in \*\*bold\*\* on first use and are collected in the Glossary.

\#\# How to Use This Manual  
Read Chapters 1–3 first if you have never played. They explain the game from zero knowledge.    
Experienced poker players may skim to Chapter 2 (the two variants), Chapter 5 (honey-pot layer), and Chapter 9 (strategy primer).    
Keep the Quick Reference Card (Appendix B) laminated at the table.    
Use the Glossary and Appendices for lookup during play.    
All rules are current for v35. Earlier versions are obsolete.

\#\# Table of Contents  
\- Chapter 1: What is Yellow Jacket Tour?    
\- Chapter 2: The Two Variants — Yellow Jacket vs. Bumblebee    
\- Chapter 3: A Hole, Step by Step    
\- Chapter 4: Hand Categories and Golf Scores    
\- Chapter 5: The Honey-Pot Layer    
\- Chapter 6: How a Round is Scored    
\- Chapter 7: Tournament Tiers    
\- Chapter 8: The Satellite Ladder    
\- Chapter 9: Strategy Primer    
\- Chapter 10: Lore of the Hive    
\- Glossary    
\- Appendix A: Probability Reference    
\- Appendix B: Quick Reference Card (laminatable single-page summary)    
\- Appendix C: Variant Comparison Cheat Sheet  

\#\# Chapter 1: What is Yellow Jacket Tour?  
Yellow Jacket Tour is a hybrid heads-up Texas Hold’em × golf scoring tournament game. Every “hole” is one complete heads-up poker hand. The final hand category at showdown is converted into a bounded golf score ranging from −5 (hole-in-one) to \+2 (double bogey). Wagered “honey” (the agreed-total pot) is accumulated across the round, divided by the number of holes played, and subtracted from your total scorecard. The lowest net score wins the hole, the match, the event, and ultimately the right to wear the Yellow Jacket.

The game is played in two named variants that share every rule except one: how the loser of a decisive showdown scores their golf stroke (brief §2.4). Tournament structure mirrors both the WSOP (satellite ladders, prestige Main Event) and the PGA Tour (regular weekly events, majors, 72-hole finals, champion exemptions). All play happens inside a single browser file—no installation, no backend, instant multiplayer or solo simulation.

\#\# Chapter 2: The Two Variants — Yellow Jacket vs. Bumblebee  
Yellow Jacket Tour ships as two distinct but closely related games. They use the identical per-hole engine, honey-pot rules, stroke caps, fold rule, tied-hole carry, divisor, tournament formats, and field selection. The \*\*only\*\* difference is decisive-showdown loser scoring (brief §2.4(a); code: \`CurrentLoserBogey\` / \`setLoserBogey\` \~line 1267).

| Variant              | Decisive-showdown loser scores          | Target audience          | Typical 72-hole champion score | Skill expression |  
|----------------------|-----------------------------------------|--------------------------|--------------------------------|------------------|  
| \*\*Yellow Jacket\*\* (default, competitive) | Fixed \*\*+1 bogey\*\* (regardless of hand) | Competitive tour players | \+12 to \+28                    | Sharper          |  
| \*\*Bumblebee\*\* (casual league)            | Own hand’s golf value (−5 to \+2)       | Social / golf fans      | −10 to −18                    | Golf-realistic   |

\*\*Folds and tied showdowns are identical in both variants.\*\*    
Choose your variant before starting any event or simulation. The choice is permanent for that session but can be changed between events. In the app, \`cfg.gameVariant\` is set to \`'yellowjacket'\` or \`'bumblebee'\` and automatically resolves \`loserBogey\`.

\*\*Yellow Jacket\*\* rewards precise pot-control and fold discipline. Every non-winning resolution costs exactly \+1, mirroring the fold penalty.    
\*\*Bumblebee\*\* preserves the “your hand always counts” texture familiar to golfers—even a strong losing hand can post a birdie or par.

\#\# Chapter 3: A Hole, Step by Step  
A single hole is played exactly as follows (expanded from brief §14.1; engine: \`playHole\` \~line 2305).

1\. \*\*Setup\*\*    
   Both players begin the hole with a fresh scorecard entry (starts at 0\) and their honey ledger. The hole opens with a \*\*mandatory pot of 2 honey\*\*. Both players are equally committed—no blinds, no antes, no positional disadvantage.

2\. \*\*Tea Box (preflop)\*\*    
   Two private cards are dealt to each player.    
   First-to-act may \*\*check\*\* or \*\*bet to N\*\* (propose new agreed total N, where N must be ≤ current street cap).    
   In Regular events (stroke cap \= 6\) the Tea Box cap is 2, so preflop is always forced check-check. In Majors (cap \= 10\) limited preflop action is possible.

3\. \*\*Drive (flop)\*\* — three community cards revealed.    
   Street cap unlocks to 50% of event cap. Betting, raising, calling, checking, and folding are all available.

4\. \*\*Hazard (turn)\*\* — fourth community card.    
   Street cap unlocks to 75%.

5\. \*\*Putt (river)\*\* — fifth and final community card.    
   Full stroke cap is available.

6\. \*\*The Cup (showdown)\*\* — if both players reach this point:    
   \- \*\*Decisive showdown\*\* (different hand values): Winner scores own golf value and takes the agreedTotal honey. Loser scoring depends on variant (see Chapter 2).    
   \- \*\*Tied showdown\*\* (identical hand values): Both score 0 (par). The entire agreedTotal rolls forward as the mandatory opener for the \*\*next\*\* hole in the same match.    
   \- \*\*Fold\*\* (any street): Folder posts \+1 bogey and loses the \*\*previously agreed total\*\* (not the unaccepted proposal). Non-folder posts 0 (par) and takes the previously agreed total as honey credit. The fold rule is uniform across all streets.

The hole is now complete. Scorecard and honey ledger update immediately. Play continues to the next hole.

\#\# Chapter 4: Hand Categories and Golf Scores  
Every 7-card hand is mapped to a golf score using the following table (\`golfScoreFromHandValue\` \~line 1643). Premium kicker buckets provide extra granularity inside categories (brief §2.1 and §4.4).

| Hand Category                  | Standard Score | Premium Kicker Bucket                          | Probability at Showdown |  
|--------------------------------|----------------|------------------------------------------------|-------------------------|  
| Royal / Straight Flush         | −5             | −5                                             | 0.031%                 |  
| Four of a Kind                 | −4             | −4                                             | 0.168%                 |  
| Full House                     | −2             | −3 (trips J or higher)                         | 2.60%                  |  
| Flush                          | −1             | −2 (T-high or higher)                          | 3.03%                  |  
| Straight                       | −1             | −2 (9-high or higher)                          | 4.62%                  |  
| Three of a Kind                | −1             | −1                                             | 4.83%                  |  
| Two Pair                       | 0              | −1 (top pair J or higher)                      | 23.5%                  |  
| One Pair                       | \+1             | 0 (pair TT or higher)                          | 43.0%                  |  
| High Card (no pair)            | \+2             | \+1 (J-high or higher)                          | 17.4%                  |

Range is strictly bounded −5 to \+2 by design. Modal showdown is One Pair (\~43%).

\#\# Chapter 5: The Honey-Pot Layer  
\*\*Agreed-total wagering\*\* (brief §2.2; NOT matched chips)    
\- Mandatory opener \= 2 honey.    
\- Bet or raise \= propose a \*\*new total\*\* (the amount \*is\* the new pot).    
\- Call \= accept the current proposal; pot becomes exactly that number.    
\- The pot is always the most recently agreed total.  

\*\*Stroke caps\*\* (brief §2.3; \`streetCapFor\` \~line 1930\)    
Progressive unlock: Tea Box 25%, Drive 50%, Hazard 75%, Putt 100% of event cap. Regulars \= 6 honey cap (preflop usually locked). Majors \= 10 honey cap.

\*\*Tied-hole carry\*\* (brief §2.4(b))    
Entire pot rolls forward. Can compound across multiple consecutive ties.

\*\*Fold resolution\*\* (brief §2.4(c))    
Uniform rule: folder \+1 bogey \+ loses previously agreed total; non-folder 0 \+ gains previously agreed total.

\#\# Chapter 6: How a Round is Scored  
Final round score formula (brief §2.5; \`honeyDivisorFor\` \~line 1327):    
\*\*finalRoundScore \= totalGolfScorecard − (netHoney / divisor)\*\*  

Divisor depends on round length:    
\- 72 holes → divisor 72    
\- 18 holes → divisor 18    
\- 9 holes → divisor 9    
\- 1 hole → divisor 1  

Lower score wins. Honey is the skilled adjustment layer; the scorecard remains dominant.

\*\*Worked example\*\* (18-hole match, brief §14.3):    
Player A: totalGolfScorecard \= −12, netHoney \= \+25 → −12 − (25/18) \= −13.39    
Player B: totalGolfScorecard \= −7, netHoney \= −25 → −7 − (−25/18) \= −5.61    
Player A wins the match.

\#\# Chapter 7: Tournament Tiers  
| Tier     | Field Size | Buy-in   | Format                              | What’s at stake                     |  
|----------|------------|----------|-------------------------------------|-------------------------------------|  
| Regular  | 2,048     | $100    | Bracket or Aggregate                | Cash \+ ranking points               |  
| Major    | 1,024     | $1,000  | Bracket or Aggregate                | Cash \+ ranking \+ 3-year exemption \+ Main satellite seat (top 512\) |  
| Main Event | 128     | $10,000 | 72-hole final                       | Cash \+ the Yellow Jacket (prestige) |

Field selection mixes merit, exemptions, and open qualifiers (brief §2.7).

\#\# Chapter 8: The Satellite Ladder  
Main Event field (128 players) is 30% direct entry (exemptions first, then top season points) and 70% via satellite ladder:    
Regular → Major → progressive satellite tiers → Main seat.    
Winning any Major grants 3-year champion exemption to future Majors (window renews on each new win).

\#\# Chapter 9: Strategy Primer  
\*\*Core principle:\*\* The modal showdown is One Pair (\~43%). Honey (not raw hand strength) is the primary differentiator. Build pots when ahead; keep them small when behind.

\*\*Pot-control\*\* — Most important skill.    
\*\*Fold discipline\*\* — Rare under optimal play (foldOpt ≈ 0.05), but critical on large late-street pots.    
\*\*Carry-pot management\*\* — With ties, sometimes bet small to preserve the carry for the next hole.    
\*\*Stroke-cap escalation\*\* — Regulars reward river mastery; Majors require multi-street planning.    
\*\*Variant-specific notes:\*\* Yellow Jacket rewards tighter fold equity; Bumblebee rewards calling with decent drawing hands because even losses can score well.

\#\# Chapter 10: Lore of the Hive  
Every wager pours a drop of honey into the pot. Win the hand and the honey is yours; tie and it carries forward, sweetening the next pot. A bluff is a sting: a yellow jacket’s feint that dares the opponent to stay. A successful sting takes the honey untouched. A called sting draws blood from your own stack. Bumble bees gather quietly; yellow jackets sting to claim the hive.

Win the Main Event in any season and you wear the Yellow Jacket — the highest honor on the Tour.

\#\# Glossary  
\*\*Agreed total\*\* — The current pot size; always exactly the most recently accepted proposal.    
\*\*Bogey Loss\*\* — Yellow Jacket variant loser scoring (+1 fixed).    
\*\*Bumblebee\*\* — Casual variant (Honored Loss).    
\*\*Carry pot\*\* — Full agreed total that rolls to the next hole on a tie.    
\*\*Champion exemption\*\* — 3-year free entry to Majors after a Major win.    
\*\*The Cup\*\* — Showdown.    
\*\*Decisive showdown\*\* — Different hand values at The Cup.    
\*\*Drive / Hazard / Putt / Tea Box\*\* — Themed street names.    
\*\*Fold rule\*\* — Uniform \+1 bogey for folder.    
\*\*Honey\*\* — Wagered side-quantity.    
\*\*Honey divisor\*\* — Round-length normalizer (1/9/18/72).    
\*\*Honored Loss\*\* — Bumblebee variant (own hand score).    
\*\*The Jacket\*\* — Championship mark.    
\*\*Mandatory pot\*\* — Opening 2 honey.    
\*\*Stroke cap\*\* — Maximum agreed total per event.    
\*\*The Sting\*\* — A successful bluff.    
\*\*Yellow Jacket\*\* — Competitive default variant.

\#\# Appendix A: Probability Reference  
(Verbatim tables from brief §4.1–4.4 — preflop, flop, turn/river odds, final hand distribution at showdown.)

\#\# Appendix B: Quick Reference Card (single-page, laminatable)  
\*\*One-Page Summary\*\*    
\- Mandatory 2 honey opener    
\- Bet \= propose new total    
\- Call \= accept    
\- Fold \= \+1 bogey \+ lose previous total    
\- Yellow Jacket: loser always \+1    
\- Bumblebee: loser scores own hand    
\- Score \= Σ golf − (net honey / holes)    
\- Lower wins  

(Street names, hand→score table, caps, and variant icons fit on one landscape page.)

\#\# Appendix C: Variant Comparison Cheat Sheet  
\*\*Yellow Jacket Tour\*\* (default) vs \*\*Bumblebee League\*\* (side-by-side table covering loser scoring, champion regime, skill feel, recommended for whom.)  
