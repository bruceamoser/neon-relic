// ============================================================
// CH-06: Social Conflict
// Source: docs/chapters/06-social-conflict.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("06", "Social Conflict")

Investigation games are social games. Most of what agents do in Neon Relic is talk to people: witnesses who saw something and won't say it, cult members who believe what they're doing is righteous, informants who want to help but are terrified, supervisors who need to believe the cover story. The skill of the agent is reading people and moving them.

Social conflict in Neon Relic uses the *Disposition model* — a lightweight system that tracks where an NPC stands and shifts based on agent actions. It does not require rounds or "social HP." It uses the existing dice pool mechanics and resolves quickly.

#section-rule()

== NPC Disposition

Every NPC who is not immediately cooperative has a *Disposition* — a state describing their current openness to engagement. Disposition exists on a 5-point track:

#nr-table-wide(
  columns: (1fr, 2fr, 4fr),
  [*Score*], [*State*], [*Behaviour*],
  [5], [*Open*], [The NPC wants to help. They volunteer information. No roll needed for basic cooperation.],
  [4], [*Cautious*], [The NPC is willing to talk but holds back. They answer simple questions but hedge on anything sensitive.],
  [3], [*Guarded*], [The NPC is resistant. They answer only what they must. Social rolls are Difficulty 2.],
  [2], [*Hostile*], [The NPC is actively uncooperative. They may lie, deflect, or attempt to end the scene. Social rolls are Difficulty 3.],
  [1], [*Closed*], [The NPC will not engage. They may call for help, alert others, or physically leave. Social rolls are Difficulty 4.],
)

=== Starting Disposition

The DA sets starting Disposition based on the NPC's relationship to the agents and the situation. Suggested defaults:

- *Covenant superior with a legitimate inquiry:* 4 (Cautious)
- *Cooperative civilian eye-witness:* 4 (Cautious) — usually wants to help but scared
- *Rogue cultist in custody:* 2 (Hostile)
- *Paid informant:* 3 (Guarded) if money is involved, 4 if a relationship has been built
- *Hostile faction member:* 1 or 2 (Closed / Hostile) by default
- *Mid-level Compact operative:* 2 (Hostile)

#section-rule()

== Shifting Disposition

Disposition shifts up (toward Open) or down (toward Closed) based on agent actions, NPC reveals, and roll outcomes.

=== Actions that Shift Disposition Up (+1)

- A successful Psychoanalyze roll (treating or reading the NPC)
- A successful Manipulate roll that makes the NPC feel their interests are served
- The agent voluntarily reveals information that helps the NPC (demonstrates good faith)
- The NPC is shown physical evidence that confirms what they suspected
- An agent successfully makes a roll to perform a service for the NPC before asking anything

=== Actions that Shift Disposition Down (−1)

- A failed Manipulate roll (the NPC sees through the attempt)
- The NPC catches an agent in a lie (DA's judgment, or a failed opposed Investigate roll from the NPC)
- An agent makes a physical threat or veiled threat while the NPC's Disposition is 3+
- A successful Psychoanalyze roll by the DA on behalf of the NPC (they read the agents — see NPC Social Defense below)
- An agent reveals information that endangers the NPC or confirms they are a target

=== Disposition Thresholds

- *Disposition 3 or higher:* The NPC will answer direct questions truthfully (though not necessarily fully). No roll required for general cooperation.
- *Disposition 2:* The NPC requires a successful social roll to answer even basic questions. They will lie by default.
- *Disposition 1:* The NPC is done with the scene. They must be brought back to 2 before any social rolls are possible. Physical containment is required for continued interrogation.

#section-rule()

== Social Rolls in Practice

Social rolls use the normal dice pool (Attribute + Skill), difficulty set by current Disposition. You are always rolling against the NPC's *current state*, not their willpower or an abstract resistance.

=== Manipulate (Empathy)

Used to deceive, persuade, bribe, leverage, or appeal to self-interest. Manipulate specifically targets the NPC's *wants and fears* — it works through the gap between what they want the world to be and what it is.

- *On success:* NPC complies with the specific request, AND Disposition shifts +1 (they feel the interaction was productive, even if later they're not sure why).
- *On failure:* Request denied. Disposition shifts −1. The NPC has clocked the attempt.
- *On a pushed failure:* As above, but Disposition shifts −2. The NPC is now certain they are being worked, and they know by whom.

=== Command (Empathy)

Used to assert authority, direct behavior under pressure, or coordinate. Command does not persuade — it *compels through confidence and force of presence*. It works when the NPC is uncertain what to do, when the agents represent a legitimate authority, or when the situation is dangerous enough that someone taking charge feels like relief.

- *Command does not work at Disposition 2 or lower.* An NPC who is already hostile cannot be commanded — you have no authority in their frame.
- *On success:* NPC complies fully for the immediate scene. No Disposition shift.
- *On failure:* NPC fails to comply. No Disposition shift, but the failed authority assertion may have social consequences at the DA's discretion.

=== Psychoanalyze (Empathy)

Used to read, understand, or heal. In social conflict, Psychoanalyze has two modes:

*Reading:* You are trying to understand the NPC's underlying state — what they need, what they fear, what they're not saying.

- On success: DA must reveal one true thing about this NPC's psychological state, motivation, or deception. Disposition is not directly shifted, but the information can be used to inform subsequent Manipulate rolls (advantage: +1 die on the next Manipulate against this NPC if the revealed information is used).

*Stabilizing:* You are treating an NPC's fear, trauma, or distress to make them more communicative.

- On success: Disposition shifts +2 (the NPC feels seen and safe). Difficulty equals the source of distress (supernatural encounter: Difficulty 3; mundane fear: Difficulty 1).
- On failure: Disposition shifts −1 (you probed and made it worse).

#section-rule()

== NPC Social Defense

NPCs can also read agents. A canny NPC may actively attempt to read or manipulate the agents in return. The DA may call for:

- *Opposed Psychoanalyze roll:* DA rolls on behalf of the NPC. On NPC success, Disposition shifts are reversed for that action, OR the NPC identifies a specific agent as the social focal point (they will now direct deflection at that agent).
- *Lie detection:* The DA may roll NPC Wits (no skill) against an agent's Manipulate roll. On NPC success, the deception is detected and Disposition shifts −1 immediately.

These are at DA discretion, not every NPC has this capability. Social defense is for NPCs with relevant training: intelligence operatives, therapists, con artists, experienced detectives.

#section-rule()

== Consequences of Failed Social Scenes

When a social scene ends badly (Disposition reaches 1, or the agents leave having gained nothing), the DA applies one or more consequences:

#nr-table(
  columns: (2fr, 4fr),
  [*Consequence Type*], [*Example*],
  [*Closed source*], [The NPC will not speak to the agents again this mission. The information they held may be inaccessible.],
  [*Alert raised*], [The NPC warns someone — their employer, their family, The Compact. Agents' activities are now known to a new party.],
  [*Physical escalation*], [The scene tips into violence. The NPC or their contacts move against the agents.],
  [*Faction response*], [A rival faction learns that the Covenant is investigating. Their own response begins accelerating.],
  [*Trust erosion*], [A Covenant contact or superior is told about the agents' approach. Standing within the Covenant takes a hit for the current case.],
)

#section-rule()

== Social Pressure and Fear

Social encounters with entities, artifacts, or cult members may cross into supernatural territory. When the content of a conversation triggers a Fear check:

- *Direct supernatural revelation during a Manipulate scene* (the NPC says something that cannot be explained naturally): Fear check, Fear Rating 1 or 2.
- *Psychoanalyze roll on a contaminated NPC* (someone who has long-term artifact exposure): Roll Psychoanalyze as normal. On any failure, the agent picks up a psychic echo — immediate Fear check, Fear Rating 2. On success, the agent gets the information but gains +1 Corruption.

See the Corruption, Fear & Healing chapter for full Fear check rules.

#section-rule()

== Worked Example: Interrogating a Cultist

#example-box([
  *Setup:* The agents have detained Brother Elias — a mid-level member of The Ember Accord cult — in the back of a van. He believes the artifact they recovered is a holy relic and resents being treated as a criminal.

  *Starting Disposition:* 2 (Hostile). He's in zip ties. He's praying under his breath. He won't look at the agents directly.

  *Round 1:* Agent Petra Vasquez attempts Psychoanalyze (Read) — she wants to understand what Elias actually believes before making any demands. The DA sets Difficulty 2 (his Disposition).

  Petra rolls Empathy 3 + Psychoanalyze 2 = 5 dice. Rolls: 6, 4, 3, 2, 1 — one success.

  *DA reveals:* Elias genuinely believes the artifact protected his sister during a cancer diagnosis two years ago. He is not performing faith. He is terrified that if it leaves his possession, she will relapse. He is not lying about any of this.

  *Round 2:* Using that information, Agent Marcus Osei attempts Manipulate. He doesn't argue about the artifact being dangerous — he asks about the sister. Where is she? Is she still safe? The agents can make sure she stays that way.

  Manipulate roll: Empathy 4 + Manipulate 3 = 7 dice. Difficulty 2. Rolls: 6, 6, 5, 3, 2, 1, 1 — two successes (one extra = 1 Stunt Point).

  *Success:* Elias answers the question about the sister (she's in Providence, she's fine). Disposition shifts to 3.

  *Stunt Point spent:* Bought Silence — Elias will not tell the Accord that the agents know about his sister.

  *Round 3:* Disposition is now 3 (Guarded). Direct questions are possible. The agents ask who gave Elias the artifact to begin with.

  Another Manipulate roll at Difficulty 2 (they're now at 3). Marcus rolls: 6, 5, 4, 4, 2, 2, 1 — one success.

  *Elias gives the name:* a fence named Talvez, operating out of a pawn shop on the East Side. He works for several clients. Elias doesn't know who.

  *Outcome:* The scene ends having extracted the key information. Disposition is still 3 — Elias is not exactly cooperative, but he's no longer hostile. The agents have a lead and a lever (the sister) if they need him again.
])
