// ============================================================
// CH-14: Director of Agents Guidance
// Source: docs/chapters/14-gm-guidance.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("14", "Director of Agents Guidance")

Running Neon Relic well means understanding what kind of game it is trying to be: an *investigation horror* game where the real terror is not the monster in the vault, but the agents' growing awareness that the Covenant cannot fully protect them from what they're being asked to do.

This chapter gives you the tools to prepare and run individual cases, develop mysteries that hold together under player pressure, and handle the unexpected. Use it as a working reference, not a rulebook.

#section-rule()

= What Makes Neon Relic Work

Before the mechanical tools, three design priorities that should inform every session you run:

+ *Clues are discoverable, not gateable.* Players should never feel stupid for missing something. Every site has multiple paths to the same revelation. The players will find it. Your job is to make the finding feel earned.

+ *The Covenant is not infallible.* Headquarters, the Verdant Codex, and the Division protocols exist in tension with the facts in the field. Let them be wrong sometimes. Let the players be right when the institution isn't.

+ *The artifacts are not neutral.* Every artifact has a trajectory — a direction it pulls the world. Make sure some of that pull lands on the agents. Corruption is not just a penalty; it is the story.

#section-rule()

= Session Zero

Before the first case, run a *Session Zero* — a short scene-setting conversation, not a game session. Cover:

== Tone and Content Agreement

Ask the group:

- *How much body horror is on the table?* (Explicit physical description of injury vs. suggested.)
- *How much psychological horror?* (Creeping dread, invasive thoughts, direct mind-violation?)
- *NPC deaths:* Are named characters who feel important safe, or is everyone at risk?
- *1980s specificity:* How much do players want analog friction (payphones, limited travel, no GPS) to create problems?

== Safety Tools

Recommend one or both:

- *Lines and Veils* — Lines are content never happening, even off-screen. Veils happen but are not described in detail. Ask each player individually.
- *X-Card* — Tapping a card (real or virtual) means the current scene cuts or rewrites, no questions asked.

== Finding the Hooks

Ask each player: *Why is your character Covenant?* The answer should involve something personal — not ideology alone. The Covenant fills a need for them. Knowing what that need is tells you how to make the game hurt in the right ways.

#section-rule()

= The Five-Element Mystery

Every Case File (mission) is built on five elements. You don't need all five fully developed before play — you need the skeleton, then you let the players fill in the rest.

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Element*], [*Question*], [*Design Note*],
  [*Location*], [Where is this happening?], [One specific place — a town, a building, a neighborhood. Not a region. One petrol station on a rural motorway. One hospital. One concert venue. The 1980s setting should feel tactile and era-specific — wherever your campaign is based, the location must have a physical reality your players can picture.],
  [*Artifact*], [What is the sourcebook item?], [The thing that caused events to spiral. Every case has one artifact. Define its *Tier* (1–4), its *apparent property* (what it seems to do), and its *real effect* (what it actually does to the world around it).],
  [*Threat*], [What is the immediate danger?], [The presenting problem: the entity, the cultist cell, the MJ-12 investigation, the cover-up. This is what the Covenant is responding to.],
  [*Rival Faction*], [Who else wants the artifact?], [Even low-stakes cases should have a second party. The Compact, a private collector, a true believer. Rival factions create competing agendas and prevent simple extraction.],
  [*Complication*], [What makes it personal?], [One element that connects to a PC's Dark Secret or Division. If the complication never lands, the case is professional. If it lands, it's personal. Build for personal.],
)

== The Mystery Statement

Write one sentence that describes the full case:

_"A [Tier X artifact] has surfaced in [Location], attracting [Threat]. [Rival Faction] is already present. The complication: [personal element]."_

Example: *"A Tier 2 artifact has surfaced in a shuttered psychiatric hospital outside Palermo, attracting Echoing Remnants that have begun killing the urban explorers who found the site. The Hellfire Consortium has purchased the property and has a crew inside. The complication: one of the explorers is the sister of Agent Castellano's disappeared informant."*

If your mystery statement doesn't fit in one sentence, you have too much. Cut.

#section-rule()

= Clue Web Design

*The Iron Rule:* Every piece of critical information must be findable via *at least three different paths*. If information is available only through one NPC, one physical location, or one specific skill roll, the case will break the moment players miss it.

== How to Build a Clue Web

+ *Identify the critical revelations.* What must the players learn to understand the case? Typically 3–5 things: the artifact's true nature, the faction's plan, the event that started everything, and the solution (or route to containment).

+ *For each critical revelation, write three paths.* One path should reward Investigate/Lore (physical search, forensic analysis, document study). One path should reward social skills (witness, NPC confession, Manipulate). One path should come through action (confrontation reveals the fact in dialogue, or artifact activation reveals the truth).

+ *Allow forward movement from partial information.* Players who know _something is wrong in the basement_ should be able to proceed even if they don't know _exactly what_. Structure facts so that each revelation suggests the next action, even if the players haven't pursued all paths.

== The Dead End Test

Before play, look at each NPC and location and ask: *If this was skipped entirely, would the case still be solvable?* If the answer is "no," you have a single-point-of-failure. Fix it.

== When Players Go Wrong

Players will occasionally pursue a lead that goes nowhere — or miss the lead that was obvious to you. When this happens:

- *Yes, And:* Agree with what they're doing ("Yes, you search the kitchen") and add a connection ("And you find an Ember Accord symbol inside a cabinet — someone was here before you").
- *No, But:* Deny what they hoped for, but give movement ("The file room is locked and you can't get in right now, but you notice someone has been watching this building from across the street").
- *Never:* "Nothing happens. The search turns up nothing." This is the only forbidden outcome. Something always happens, even if it's the wrong thing.

#section-rule()

= Countdown Clocks

Every case has at least one *Countdown Clock* — a track that advances as time passes or key events occur, representing escalating stakes.

== Clock Structure

A Countdown Clock has:

- *A name* (what it represents: "Compact Extraction Team Arrives," "Second Civilian Found Dead," "Artifact Corruption Threshold Reached")
- *4–6 clock stages*, each with a defined event
- *Trigger conditions* that advance the clock one step

== Example Clock

*Clock Name:* The Hospital Burns Down (the Consortium will destroy the evidence — and the Remnants — when they've extracted what they need)

#nr-table(
  columns: (1fr, 3fr, 3fr),
  [*Stage*], [*Event*], [*Advance Trigger*],
  [1], [Consortium team enters the hospital.], [Session begins.],
  [2], [Consortium arcane specialist completes first survey.], [2 real-time hours of in-game activity without confrontation.],
  [3], [Consortium team locates the artifact.], [Players fail to reach artifact site first, OR artifact site is found without contest.],
  [4], [Elimination order issued — the urban explorers are now a liability.], [Players have direct contact with the Consortium.],
  [5], [Fire is set. Building begins to burn. Remnants are released from their anchor into the street.], [Players do not confront the Consortium by end of Day 2.],
  [6], [Hospital collapses. Remnants disperse into the city. Consortium escapes with artifact.], [Case failure.],
)

== Multiple Clocks

High-stakes cases may have two or three simultaneous clocks. Keep them on different timers so players can interrupt one without the others automatically resolving. Multiple clocks also mean that a "successful" case may still end with one clock completing — which is often the more interesting outcome.

#section-rule()

= NPC Motivation Design

Every significant NPC needs three things: a *secret*, a *goal*, and a *connection to the artifact*.

#nr-table(
  columns: (1fr, 4fr),
  [*Component*], [*Design Note*],
  [*Secret*], [Something the NPC is hiding from the agents. Not necessarily sinister — a witness might be hiding that they trespassed, not that they're a cultist. The secret creates the reason they don't just tell the agents everything at the start.],
  [*Goal*], [What the NPC is actively trying to accomplish right now. Not a background motivation — a current action. They are doing something during this case.],
  [*Artifact connection*], [How did this NPC encounter the case's artifact, and what effect has that proximity had on them? Even tangential NPCs should have a small Corruption consequence (nightmares, strange certainty about things they can't know).],
)

== The Motivated NPC Test

Ask: *If the agents were not present, what would this NPC do?* If the answer is nothing — if the NPC only exists as an information dispenser — cut them or give them a clock. NPCs with active agendas create situations. Situation creators make sessions run.

#section-rule()

= Supernatural Entity Behavior

Supernatural entities in Neon Relic do not think the way humans do. Avoid playing them like slow, dangerous people. Use these behavioral templates:

#nr-table(
  columns: (1fr, 4fr),
  [*Entity Type*], [*Behavior Pattern*],
  [*Echoing Remnant*], [Acts on memory, not will. Repeats actions associated with its final emotional state. An Echoing Remnant from a violent event will reenact something about that event — not attack intelligently. Agents who understand the echo can sometimes avoid it entirely.],
  [*Shard Construct*], [Single-directive: protect the artifact. No curiosity, no self-preservation beyond mission, no social engagement. Cannot be persuaded or manipulated. Can be outmaneuvered (if you aren't between the Construct and the artifact, it doesn't care about you).],
  [*Bound Entity*], [Has a will, has a history, has something it wants. Bound Entities can be communicated with through Lore and Psychoanalyze (not Manipulate — they see through human social mechanics). They respond to truth, to acknowledgment of what happened to them. They can be bargained with.],
  [*Manifest Presence*], [A high-tier supernatural intrusion: an entity that has begun to impose its logic on local reality. Does not fight — it _redefines the situation_. Agents trying to act normally in its presence find that normality is no longer available. These entities are solved through removing their anchor (the artifact) or performing a Wayfinder containment ritual, not fought.],
)

#section-rule()

= Improvisation Guidelines

When players go somewhere you didn't prepare:

+ *You don't need to have everything ready.* You need to know the five elements and the clue web. Everything else can be invented.
+ *Names first.* The moment you name an NPC, they become real. Have ten era-appropriate names ready (female and male, surname-friendly for your campaign region in the 1980s).
+ *Establish geography.* "You pull into the parking lot of a strip mall. One end is a closed sporting goods store. The other end is still lit — a late-night laundromat." Specificity creates presence.
+ *Every new location has one strange thing.* Not necessarily supernatural. One thing that's slightly off. This makes the world feel watched, even when nothing is watching.

#section-rule()

= 1980s Investigation Complication Table (D12)

Roll when you need an unexpected complication mid-case, when a scene is going too smoothly, or to generate pre-session texture.

#nr-table(
  columns: (1fr, 4fr),
  [*D12*], [*Complication*],
  [1], [The key witness has already spoken to MJ-12. Their story has been changed. They are now afraid of the agents.],
  [2], [A news crew is covering a tangentially related story. They saw something they shouldn't have. They are currently in their van, developing film.],
  [3], [The physical evidence the team collected has a fingerprint trace that leads to a Covenant asset who should not be connected to this case.],
  [4], [The local police are investigating the same location. They are incompetent but present. Their cruiser is in the way.],
  [5], [A pay phone at a critical location rings as the team arrives. The call is from someone who knows the team's names.],
  [6], [It's raining. This matters: the evidence site is compromised, the getaway is slower, the team's electronics are at risk, visibility is the wrong kind of limited.],
  [7], [A civilian has bonded with the artifact without knowing what it is. They are treating it as a lucky object. It has begun affecting them. They are protective and confused by their protectiveness.],
  [8], [The rival faction's operative is not hostile — they are also following orders and they are also scared. They want to talk. Their faction doesn't know they made contact.],
  [9], [The building's owner is on-site for unrelated maintenance. They are nosy, unhelpful, and will remember the team's faces.],
  [10], [A secondary artifact — unrelated to this case — has been stored in the same facility. It has interacted with the primary artifact. Both are behaving unexpectedly.],
  [11], [The extraction vehicle has been reported stolen. The team's transportation is being tracked by a local detective who has no idea what he's looking for but is very thorough.],
  [12], [The case's solution requires a resource that Stack misclassified three months ago. The item exists; it is in the wrong vault. Getting it takes the rest of the session, minimum.],
)

#section-rule()

= Running Containment Missions

Not every case ends with an artifact activation. Many of the Covenant's most important operations are *containment runs* — missions where success means the artifact was never used, never heard, never seen by an unauthorized party. These cases require different framing than activation-centric play.

== Defining Non-Activation Objectives

Before the session begins, define a concrete containment goal separate from any activation contingency:

#nr-table(
  columns: (2fr, 4fr),
  [*Containment Objective*], [*Example Mission Frame*],
  [*Physical isolation*], [The artifact is in a civilian's vehicle. Recover it before the civilian reaches their destination. Do not let them open the compartment.],
  [*Quarantine and witness management*], [Three people have already been exposed. Contain them, suppress their account of what they saw, and move the artifact before the rival faction arrives.],
  [*Chain-of-custody transfer*], [The artifact must travel from a recovery site to a Keep vault. Every handoff is a risk. The agents must complete the transfer with fewer than three custody breaks.],
  [*Deny use by rival faction*], [A rival faction intends to activate the artifact at a specific time and place. The agents must prevent the conditions for activation — not necessarily seize the artifact themselves.],
)

== Pressure Without Activation

Containment missions still have escalating pressure. Use these tools to maintain tension without triggering the artifact:

- *The emission is already active.* Even before the agents reach the artifact, nearby NPCs may show early Corruption symptoms — confusion, obsessive focus on mundane tasks, sudden certainty about things they cannot know. This makes extraction urgent without requiring activation.

- *The containment profile creates constraints.* If the artifact cannot be exposed to light, the agents must plan their extraction around darkness, covered transport, and power failures. Constraints are interesting problems, not punishment.

- *Rivalry without combat.* A rival faction wants the artifact activated; the agents want it contained. This is a race with a clock, not a firefight. Rival agents may intercept, deceive, or manufacture the activation conditions even as players try to prevent them.

== Measuring Success in Containment Cases

A containment case is resolved when all three of the following are true:

+ *The artifact is inert* — in transit, sealed under its Containment Profile, without activation during the case.
+ *Exposure is controlled* — no uncontained witness has unsuppressed knowledge of the artifact's effects.
+ *Handoff is complete* — the artifact is logged with the Keep under a valid chain of custody.

Partial success is valid. An artifact that was activated once but then contained is a case with a scar — the Decay track advances, but so does the cost.

== DA Tools: Containment Clocks

Containment cases benefit from clocks with *loss conditions linked to exposure*, not elapsed time:

- *The Seal Breaks* — 6-stage: someone discovers the artifact's true nature. Advances when an agent fails a Conceal roll, when an NPC asks the wrong question, or when a rival faction broadcasts the artifact's location.
- *The Protocol Fails* — 4-stage: the containment profile is violated. Advances on each inadvertent activation event (a projector powers on nearby, the bell is jostled, the manifest is touched without gloves). At stage 4, the artifact activates without a roll.
- *The Handoff Window Closes* — A Keep transport is available for a limited time. If the agents do not complete the transfer before the clock expires, the Keep withdraws the vehicle and the artifact must be stored in the field overnight.

#section-rule()

= Cross-References

- Case File structure (8-phase structure, Countdown mechanics): see the Case Files chapter.
- Artifact properties and Tiers: see the Artifacts chapter.
- Rival faction behavior and agendas: see the Rival Factions chapter.
- Entity stat blocks and Fear ratings: see the Bestiary chapter.
- Corruption consequences: see the Corruption, Fear & Healing chapter.
