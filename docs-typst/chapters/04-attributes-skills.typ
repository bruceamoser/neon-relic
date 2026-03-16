// ============================================================
// CH-04: Attributes and Skills
// Source: docs/chapters/04-attributes-skills.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("04", "Attributes and Skills")

Characters are defined by *four core attributes*, representing their fundamental physical and mental foundations. In Project Neon Relic, these traditional YZE attributes are updated to fit the modern, investigative tone of an occult thriller:

#nr-table(
  columns: (1fr, 4fr),
  [*Attribute*], [*Description*],
  [*Strength*], [Physical power, raw endurance, and fortitude against physical trauma.],
  [*Agility*], [Gross and fine motor skills, physical reflexes, balance, and precision.],
  [*Wits*], [Sensory perception, formal education, memory recall, and deductive reasoning.],
  [*Empathy*], [Raw charisma, social intuition, ability to read human behavior, and emotional resilience against psychological horror.],
)

= The Twelve Core Skills

The twelve core skills are mapped to these four attributes, tailored to support urban exploration, analog hacking, and occult research:

#nr-table(
  columns: (1fr, 1fr, 4fr),
  [*Attribute*], [*Skill*], [*Application in the 1980s Occult Setting*],
  [*Strength*], [Force], [Breaking down sealed bunker doors, forcing open containment chambers.],
  [*Strength*], [Brawl], [Hand-to-hand combat with cultists, wrestling cursed objects from hostile hands.],
  [*Strength*], [Endure], [Resisting the physical toll of harsh environments, toxic substances, or sustained injury.],
  [*Agility*], [Sneak], [Infiltrating corporate research facilities, bypassing analog security systems.],
  [*Agility*], [Sleight of Hand], [Picking locks, pocketing small artifacts, disarming mechanical traps.],
  [*Agility*], [Firearms], [Utilizing period-accurate weaponry (.38 revolvers, pump-action shotguns).],
  [*Wits*], [Investigate], [Searching crime scenes for anomalous evidence, analyzing forensic data.],
  [*Wits*], [Tech], [Operating 1980s mainframes, hacking BBS networks, repairing analog equipment.],
  [*Wits*], [Lore], [Decoding ancient occult texts, identifying mythological creatures and artifact origins.],
  [*Empathy*], [Manipulate], [Bribing informants, deceiving rivals, leveraging secrets.],
  [*Empathy*], [Command], [Directing panicked civilians, coordinating team actions under fire.],
  [*Empathy*], [Psychoanalyze], [Reading psychological states, detecting deception through behavior, stabilizing traumatized witnesses.],
)

#callout-block("NOTE", [
  *Division Key Skill:* During character creation, each Division designates one Key Skill with a starting cap of *4* instead of the standard maximum of 3. See the Character Creation chapter for details.
])

#section-rule()

= Skill Stunts

When you roll more 6s than the *minimum needed to succeed*, each extra 6 is a *Stunt Point*. You may spend Stunt Points to achieve effects beyond simple success.

== Stunt Economy

- *1 extra 6 = 1 Stunt Point.*
- You must succeed first (at least one 6 to meet the Difficulty), then extras are stunt points.
- Stunt Points must be spent immediately — they do not carry between rolls.
- You may split stunt points across multiple effects if both are available on the same skill.
- On a *pushed roll*, stunt points still apply from the new result.

#callout-block("NOTE", [
  *Cross-reference:* Combat stunts — spending stunt points during an attack roll — are defined in the Combat chapter. The stunt economy is the same.
])

== Generic Stunts (Any Skill)

The following stunts may be purchased on *any* successful skill roll:

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Faster*], [Accomplish the action in half the expected time. No narrative explanation needed — you just find the short path.],
  [1], [*Quieter*], [Accomplish the action without leaving a detectable trace. The DA cannot use evidence of this action as a future complication.],
  [1], [*Precise*], [Your result is exactly as intended — no collateral effects, no ambiguity, no partial outcomes.],
  [1], [*Aid*], [Your success automatically assists an ally's next related roll this scene. They gain +1 die on it.],
  [2], [*Extended Effect*], [The outcome of your action lasts an additional scene or at least one hour longer than it otherwise would.],
  [2], [*Additional Target*], [Your action's results apply to one additional target in the same zone (the DA determines relevance).],
)

#section-rule()

== Strength Skills

=== Force

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Controlled Break*], [You force open the door/lock/container without damaging the contents or triggering adjacent mechanisms. Finesse in violence.],
  [1], [*Intimidating Display*], [Your feat of strength is visibly dramatic. One NPC present must make a Fear check (Fear Rating 1) or immediately comply with your next simple demand.],
  [2], [*Clear the Room*], [A shove, flip, or sweep clears all loose objects from the zone simultaneously (useful for destroying a cultist's ritual setup, or just making a scene).],
)

=== Brawl

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Stay Down*], [Target cannot stand up until the start of your next turn (they must spend a Slow Action to rise but simply cannot).],
  [1], [*Weapon Strike*], [You've slapped or struck their weapon arm. Target suffers −1 die on all attack rolls until the end of the round.],
  [2], [*Neck Crank*], [Target is Grappled (see Combat chapter) without requiring a separate maneuver roll. Counts as two stunts with one action.],
)

=== Endure

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Grind Through*], [You complete the physical task despite having failed an earlier linked roll this scene (you were already exhausted but push through anyway).],
  [1], [*Inspire*], [Your visible physical resilience gives allies heart. One ally in the scene recovers 1 point of Agility.],
  [2], [*Unfazed*], [You succeed and take no Agility damage from whatever environmental or physical threat triggered the roll (extreme cold, sleep deprivation, toxic air).],
)

#section-rule()

== Agility Skills

=== Sneak

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Shadow Step*], [You can take one additional move action as part of the same turn/scene phase without breaking your stealth. You haven't just crept in — you've repositioned perfectly.],
  [1], [*Identify Exit*], [As you infiltrate, you map the fastest withdrawal route. You have +2 dice on any Sneak roll to leave this location later this scene.],
  [2], [*Ghost Pass*], [Your passage leaves zero physical trace (no footprints, disturbed dust, or thermal record). Cannot be tracked from this location.],
)

=== Sleight of Hand

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Undetected*], [The target of your pick-pocket, lift, or plant does not notice the action even after the immediate scene ends. They will assume the item was misplaced, not taken.],
  [1], [*Speed Lock*], [You open a lock in seconds. No time resource is consumed; the DA cannot use the time you spent as a complication.],
  [2], [*Perfect Plant*], [You plant an item on a target in a way that will implicate them credibly. Subsequent investigation will find the planted item and treat it as the target's possession.],
)

=== Firearms

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Aimed Shot*], [The shot hits exactly the intended location (specific limb, lock, cable, tire). DA treats the result as precision even at range.],
  [1], [*Suppression*], [Target is pinned behind cover until start of your next turn. They cannot move zones or fire back without losing their cover bonus.],
  [2], [*Warning Shot*], [You visibly miss by design, close enough to be terrifying. Target immediately makes a Wits roll (Difficulty 2) or drops to ground and stays there for 1 round. No ammo die roll required.],
)

#section-rule()

== Wits Skills

=== Investigate

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Pattern Lock*], [You not only find the evidence — you identify why it matters. The DA must tell you one piece of context about the object's history or origin.],
  [1], [*Clock It*], [You determine precisely when an event occurred (within the hour, or narrowed to a 30-minute window). Time is often as revealing as the event.],
  [2], [*Hidden Compartment*], [You find something the scene intended to conceal — a room the blueprints don't show, a file folder in a false wall, a trapdoor. DA must reveal one hidden element they had established but not yet disclosed.],
)

=== Tech

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Trace*], [Successfully accessing a system also identifies who else accessed it recently — one account or one physical terminal is revealed.],
  [1], [*Improvised Repair*], [The item you're repairing also gets a temporary improvement: a degraded weapon gets +1 Gear die this session; a damaged radio broadcasts on a sealed channel.],
  [2], [*Ghost Session*], [Your access to a system leaves no log entry. No one can prove you were there.],
)

=== Lore

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Deep Context*], [Your knowledge is not just what this thing is — you know what it was used for. DA provides one historical or ritual context detail beyond what would normally be available.],
  [1], [*Weakness Identified*], [Your lore grants you tactical information: an entity type's vulnerability, an artifact's known failure condition, a ritual's interruption point. +1 die on the next relevant roll.],
  [2], [*Primary Source*], [You recall a specific source — a text, a case file, a person — that would contain detailed operational information about this entity or artifact. The DA must confirm the source exists and tell you how to find it.],
)

#section-rule()

== Empathy Skills

=== Manipulate

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Bought Silence*], [The target doesn't just comply — they will not mention this conversation to anyone for at least 24 hours. Your leverage persists.],
  [1], [*Read the Room*], [Beyond this individual, you gauge how the wider group or faction feels about the situation. The DA tells you one faction-level attitude or intention.],
  [2], [*Turned Asset*], [On an already-successful Manipulate, the target now actively wants to help you beyond the scope of your request. They will volunteer additional information or assistance once this session.],
)

=== Command

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Rally*], [One Broken ally in the scene immediately acts on their next turn as if they had recovered — they can take their full action once before the impairment resumes.],
  [1], [*Coordinated Action*], [Your directive enables two allies to act simultaneously on their initiative cards (they share the same slot this round only).],
  [2], [*Hold the Line*], [All allies who can hear you gain +1 die on their next roll this round. The effect of strong leadership under pressure.],
)

=== Psychoanalyze

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Cost*], [*Stunt*], [*Effect*],
  [1], [*Pressure Point*], [You've identified something this person fears or desperately needs. The DA must reveal one personal vulnerability, driving motivation, or exploitable need.],
  [1], [*Decompress*], [The person you're treating recovers 1 additional Wits or Empathy point beyond the normal healing (max to their normal maximum).],
  [2], [*Full Read*], [You have comprehensively understood this person's psychological state. For the rest of the scene, you may treat all Psychoanalyze rolls against them as Difficulty 0 — you know them now.],
)

#section-rule()

= General Talents

General Talents are cross-Division abilities available to any agent regardless of Division affiliation. They are acquired through advancement (cost: 1 Advancement Point each) and represent learned tradecraft, personal discipline, and survivor instincts.

#nr-table(
  columns: (2fr, 1fr, 2fr, 1fr, 4fr),
  [*Talent*], [*Type*], [*Prerequisites*], [*Tag*], [*Effect*],
  [*Hair Trigger*], [Once per combat], [AGI 3+], [_(Initiative)_], [After initiative cards are revealed but before the first action, discard your card and draw a new one, keeping the new result.],
  [*Tactical Override*], [Fast Action], [EMP 3+, Command 2+], [_(Initiative)_], [Once per round, swap one ally's initiative card with the next hostile participant directly above them in the order. If no hostile is directly above the chosen ally, this talent has no valid target this round.],
)

#callout-block("NOTE", [
  *Edge case — Tactical Override:* "Directly above" means the next hostile in turn order, not spatial proximity. Cannot swap with another PC — the participant directly above must be hostile.
])
