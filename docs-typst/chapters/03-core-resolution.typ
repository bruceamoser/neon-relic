// ============================================================
// CH-03: Core Resolution Mechanics
// Source: docs/chapters/03-core-resolution.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("03", "Core Resolution Mechanics")

The foundation of Project Neon Relic relies on the classic *dice-pool variant* of the Year Zero Engine, originally pioneered in _Mutant: Year Zero_ and expanded in _Forbidden Lands_ and _Alien_. While the step-dice variant utilized in _Blade Runner_ and _Twilight: 2000_ offers nuance, the dice-pool system is fundamentally better suited for visually representing escalating tension and resource attrition — key themes in analog horror.

= The Anatomy of the Dice Pool

The core philosophy of the Year Zero Engine is that *rolling dice should only occur when the narrative outcome is uncertain and the consequences of failure are dramatic*. When a player character (PC) attempts a risky action, they construct a dice pool consisting of three distinct elements:

#nr-table(
  columns: (2fr, 1fr, 3fr, 1fr),
  [*Dice Type*], [*Color*], [*Source*], [*Typical Range*],
  [*Attribute Dice*], [White], [Character's innate biological capability], [1–5],
  [*Skill Dice*], [Green], [Character's trained proficiency], [0–5],
  [*Gear Dice*], [Black], [Mechanical bonus from tools/weapons], [0–3],
)

To achieve a basic success, the player must roll at least one *6* across the entire dice pool. Multiple sixes are surplus successes that can be spent on *stunts* — extra narrative or mechanical benefits such as:

- Completing an action significantly faster
- Uncovering secondary hidden clues during an investigation
- Assisting an ally with their next roll
- Inflicting critical, debilitating injuries during combat

The elegance of this system lies in its speed; it produces immediate, decisive results by entirely removing post-roll arithmetic or target-number calculations.

= The Push Mechanic and Attrition

The primary driver of suspense and narrative tension is the *Push* mechanic. If an initial roll yields no sixes (a failure), or if the player desperately needs additional successes for stunts, they may choose to *push* the roll — picking up and re-rolling all dice that do not currently display a 6.

However, pushing represents the character exerting maximum physical, mental, or material effort, and it comes with severe risks:

- You immediately gain *+1 Corruption*.

#design-note([
  *Design note:* Corruption is the only push cost. There is no separate "Stress" track, no optional complication table. The Corruption system handles all forms of mental and supernatural pressure through a single unified resource — see the Corruption, Fear & Healing chapter for the full rules.
])

The analog nature of 1980s technology perfectly complements this mechanical attrition. Pushing a gear-assisted roll might degrade the item — short-circuiting alkaline batteries or jamming mechanisms — effectively reducing its inherent bonus until it can be repaired during downtime.

#section-rule()

= Opposed Rolls

When two characters are directly working against each other — a guard watching for intruders while an agent tries to slip past, a witness resisting an interrogation, two agents in a grapple — a *standard roll is not sufficient*. Both sides have active stakes in the outcome. Use an *Opposed Roll*.

== Procedure

+ Both characters construct their dice pools normally (Attribute + Skill + Gear).
+ Both roll simultaneously.
+ Count the number of *6s* each side rolled — these are their *successes*.
+ The side with more successes wins.

== Tie-Breaking

#design-note([
  *Design Decision:* In Neon Relic, ties are resolved *in favor of the player character*. If a PC is involved in an opposed roll, a tie is a player win — regardless of who initiated the action.

  *Rationale:* The active-party rule punishes players whenever a hostile NPC takes the initiative. Corruption costs and the asymmetric difficulty of the Corruption track already provide consistent pressure. Giving NPCs tie wins would compound that pressure without interesting dramatic benefit. This aligns with _Alien RPG_ and the general YZE design principle of player-favorable resolution.

  *Edge cases:*
  - _PC vs. NPC:_ The PC wins, regardless of who initiated.
  - _NPC vs. NPC:_ Equal nonzero successes = no change; both zero = no change.
  - _PC vs. PC:_ The DA rules in context; no mechanical default applies.
])

If both sides roll zero successes, the outcome is *no change* — the situation remains unresolved, and the DA should advance the fiction in a direction that applies pressure (the confrontation escalates, time runs out, a third party notices, etc.). The acting character does *not* gain Corruption from a zero-zero tie.

== Common Opposed Pairings

The following pairings arise most frequently in play. Either side may push their roll as normal, gaining +1 Corruption.

#nr-table(
  columns: (2fr, 2fr, 3fr),
  [*Active Roll*], [*Opposing Roll*], [*Situation*],
  [Sneak (AGI)], [Investigate (WIT)], [Agent moves silently past a watchful guard or suspicious bystander],
  [Manipulate (EMP)], [Psychoanalyze (EMP)], [Convincing a witness — the target is actively trying to spot the lie],
  [Command (EMP)], [Manipulate (EMP)], [Asserting authority vs. someone talking their way out from under it],
  [Force (STR)], [Endure (STR)], [Trying to physically overpower or restrain another character],
  [Brawl (STR)], [Brawl (STR)], [Contested grapple, disarm, or shove],
  [Sleight of Hand (AGI)], [Investigate (WIT)], [Planting or pocketing an item without being noticed],
  [Sneak (AGI)], [Investigate (WIT)], [Tailing a target without being made],
  [Tech (WIT)], [Tech (WIT)], [Counter-hacking: both parties on the same BBS or mainframe simultaneously],
)

#callout-block("NOTE", [
  *Mismatched skills are allowed.* If a situation calls for it, the DA may permit any logical pairing. The table above is guidance, not a hard constraint.
])

== Pushed Opposed Rolls

Either or both sides may push their roll (gaining +1 Corruption each). Pushes are declared *before* comparing results. If both sides push and the result is still a tie, apply the standard tie-breaking rule: the PC wins if a PC is involved.

#section-rule()

= Helping

Agents operating as a team can be more effective than any individual. When one agent attempts a roll and an ally is present and capable, that ally may *help*.

== Who May Help

An ally may help if *both* of the following are true:

- They are present in the scene (Engaged or Close range — same room, same vehicle, actively coordinating).
- They have a *rating of at least 1* in the relevant skill, *or* they can provide a plausible narrative justification for how their own skill set contributes (DA approval).

== The Helping Bonus

- Each helper adds *+1 die* to the active character's dice pool.
- A maximum of *2 helpers* may assist on any single roll.
- The helping dice are *Skill Dice* (green) — they can produce successes but are not pushed separately.

#callout-block("NOTE", [
  *Maximum pool size:* With 2 helpers, a character's pool can be up to +2 dice above their normal maximum. This represents peak team coordination — beyond this, too many cooks.
])

== Helping and Corruption

- If the active character *pushes* the roll, helpers are *not* penalized — they lent their dice to the initial roll, not the push.
- Helpers do *not* gain Corruption when the active character pushes.

== Helping in Combat

Helping during combat requires a *slow action* from the helper. A helper who assists a slow action during a combat round cannot take any other slow action that round.

#section-rule()

= Group Rolls

Some situations call for the *entire team to attempt the same action simultaneously* — crossing a dark chasm, navigating a treacherous building undetected before the guards change, deciphering a large number of documents before the contact leaves.

== Procedure

+ Each character rolls their individual dice pool for the relevant skill.
+ Count how many characters *succeed* (rolled at least one 6).
+ Compare against the *Group Success Threshold* set by the DA:

#nr-table(
  columns: (1fr, 3fr),
  [*Threshold*], [*When to Use*],
  [*All succeed*], [The action requires total team performance — a single failure has consequences (e.g., stealth approach; one noise ruins it for everyone)],
  [*Majority succeed*], [Most of the team needs to make it (e.g., climbing a fence before a gate locks)],
  [*At least one succeeds*], [The team needs one person to pull it off; others can assist if needed],
)

== Group Roll Failure

If the group fails to meet the threshold:

- The DA applies consequences to *all who failed*, not as individual failures but as a shared narrative setback.
- Individual characters who succeeded are not penalized — they did their part.
- Characters who failed *may push* as normal (gaining +1 Corruption each), independently.

#callout-block("NOTE", [
  *Group rolls and Corruption:* Each character manages their own Corruption on a group roll independently. A group roll gone wrong — four agents all pushing, all gaining +1 Corruption — creates the kind of compounding pressure that makes the Corruption system matter.
])

#section-rule()

= Worked Examples

== Opposed Roll: The Tail Job

#example-box([
  *Situation:* Agent Petra Vasquez (Recovery) is tailing a suspected Compact operative through a crowded airport. The operative gets a feeling he's being watched and starts scanning the crowd.

  - *Petra rolls:* Sneak (AGI 4 + Sneak 3) = 7 dice. Rolls: 6, 5, 3, 3, 2, 1, 1 → *1 success*.
  - *Operative rolls:* Investigate (WIT 3 + Investigate 2) = 5 dice. Rolls: 4, 4, 3, 2, 1 → *0 successes*.
  - *Result:* Petra wins — she stays undetected and follows him to his contact.

  If Petra had rolled 0 successes and the operative also rolled 0, the tail continues but something shifts — maybe Petra loses him in the crowd, or the operative ducks into a bathroom and the DA advances the clock.
])

== Opposed Roll with Push: The Interrogation

#example-box([
  *Situation:* Wayfinder Agent Reyes is interrogating a frightened historian who knows where the artifact is. The historian desperately doesn't want to cooperate.

  - *Reyes rolls:* Manipulate (EMP 4 + Manipulate 2) = 6 dice. Rolls: 5, 4, 4, 3, 2, 1 → *0 successes*.
  - Reyes decides to *push* (gains +1 Corruption, now at 1). Re-rolls all 5 non-6 dice: 6, 6, 3, 2, 1 → *2 successes*.
  - *Historian rolls:* Psychoanalyze (EMP 3 + Psychoanalyze 1) = 4 dice. Rolls: 6, 4, 3, 2 → *1 success*.
  - *Result:* Reyes wins (2 vs 1). The historian cracks. The extra success can be spent on a stunt — perhaps he volunteers more than just the location.
])

== Helping: Cracking a Locked File Cabinet

#example-box([
  *Situation:* Stack agent Kowalski is picking a government-grade lock. Sleight of Hand 2 (AGI 3 + skill 2 = 5 dice). Keep agent Osei has Sleight of Hand 1 and offers to hold the flashlight steady and narrate the tumblers. DA approves.

  - Osei adds +1 die. Kowalski rolls *6 dice* total instead of 5.
  - Result: 6, 6, 5, 3, 2, 1 → 2 successes. The lock opens, and the extra success means it opens fast — no time lost.
])

== Group Roll: The Silent Entry

#example-box([
  *Situation:* Four agents must all enter a research facility quietly before a guard completes his patrol. DA sets threshold: *all succeed* (failure means the guard hears movement).

  - Petra (Sneak 3, AGI 4): 7 dice → 6, 4, 3, 2, 1, 1, 1 → *1 success* ✓
  - Reyes (Sneak 1, AGI 2): 3 dice → 5, 4, 2 → *0 successes* ✗
  - Osei (Sneak 0, EMP 3): 3 attribute dice → 6, 3, 1 → *1 success* ✓
  - Kowalski (Sneak 2, AGI 4): 6 dice → 6, 6, 3, 2, 1, 1 → *2 successes* ✓

  Reyes failed. Threshold not met. The DA rules the guard hears something from Reyes' direction and starts to turn. *Reyes pushes* (gains +1 Corruption): re-rolls 3 dice → 6, 4, 2 → *1 success*. The group just barely makes it — but Reyes is now at 1 Corruption and the tension meter has ticked up.
])
