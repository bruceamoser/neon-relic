// ============================================================
// CH-07: Health, Damage & Armor
// Source: docs/chapters/07-health-damage-armor.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("07", "Health, Damage, and Armor")

In the Year Zero Engine, characters do not possess a traditional, escalating pool of "Hit Points." Instead, your *four core Attributes directly serve as your health pools*.

== Damage Types

Every source of damage specifies its type and target attribute. The attack defines the damage, not the defender.

#nr-table(
  columns: (2fr, 2fr, 4fr),
  [*Damage Type*], [*Target*], [*Sources*],
  [*Physical*], [*Strength* (violence, toxins, falls) or *Agility* (exhaustion, prolonged exertion)], [Weapons, environmental hazards, physical traps, mundane combat.],
  [*Mental*], [*Wits* (terror, confusion, psychic assault) or *Empathy* (grief, guilt, emotional manipulation)], [Failed Fear checks (Wits only), supernatural abilities, psychological attacks, social betrayal.],
  [*Corruption*], [*Corruption track* directly], [Pushing rolls, activating Division Talents, occult exposure, artifact activation/feedback, specific creature attacks.],
)

=== Damage Type Rules

+ *The source specifies the damage type and target attribute.* The defender does not choose.
+ *Combination attacks* are possible: a supernatural creature might deal Physical (STR) + Corruption damage in the same attack. Both are applied.
+ *Weapon stat blocks* list: Damage value, Damage Type, Target Attribute. Example: _Knife — Damage 2, Physical (STR)_.
+ *Creature stat blocks* list damage per attack. Example: _Shadow Tendril — Damage 2, Mental (WIT) + 1 Corruption_.
+ *Broken state* triggers when any attribute reaches 0. Physical Broken (STR/AGI = 0) → Physical Critical Injury table. Mental Broken (WIT/EMP = 0) → Mental Critical Injury table.

=== What Determines STR vs AGI / WIT vs EMP

- *Physical attacks* default to *STR* unless the source is specifically about exhaustion, fatigue, or overexertion (then AGI).
- *Mental attacks* default to *WIT* unless the source is specifically emotional, social, or empathic (then EMP).
- The DA does not adjudicate this per-attack. The weapon, creature, or event definition states the target.

#section-rule()

== The Broken State

If any Attribute is reduced to *0*, your character becomes *Broken*:

- The character is immediately *incapacitated*.
- They must roll on a *Critical Injury table*, which can result in lethal consequences or permanent maiming depending on the severity of the attack.

#section-rule()

== Death and Dying

Being *Broken* is not the same as being dead. Death is a separate, subsequent event — probabilistic, not automatic — that occurs if a Broken character does not receive care in time.

=== The Three States

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*State*], [*Status*], [*What It Means*],
  [*Broken / Unconscious*], [Any Attribute = 0. Critical Injury rolled.], [Character is incapacitated. They can still be saved.],
  [*Dying*], [Broken with a Death Check Critical Injury (result marked †) that has not yet been resolved, or was survived but the underlying injury is active (Bleeding, Gutted).], [The window for stabilization is closing. An untreated Dying character will die.],
  [*Dead*], [Death Check rolled and failed, OR a specific instant-death result triggered, OR Dying window expires without treatment.], [The character is gone.],
)

=== The Death Check

A *Death Check* is a single d6 roll. It is required whenever a Critical Injury is marked with *†*.

- Roll one d6.
- *1–2:* The character dies.
- *3–6:* The character survives — the Critical Injury still applies and must be treated, but they cling to life.

*Medical Training Talent (Keep):* An ally with Medical Training may spend a Slow Action to make a *Heal (WIT) roll (Difficulty 2)* before the Death Check is rolled. On success: the dying character rolls d6+2 instead of d6 (death only on 1, and only if the Heal roll succeeded). On failure: no change; Death Check proceeds normally.

=== The Stabilization Window

A Broken character who has rolled a Death-Check result (†) has a limited window in which an ally can stabilize them before death becomes inevitable:

- *Within the same scene:* An ally may attempt to stabilize the Dying character (see First Aid below).
- *End of scene without treatment:* The character must roll their Death Check unmodified. No ally assistance.
- *Instant Death exceptions:* Critical Injury result 66 (DOA) requires an immediate Death Check — there is no window. The Heal roll to influence it must be attempted within the same round (not the same scene).

=== First Aid: Stabilizing a Dying Character

To stabilize a Dying ally during the stabilization window:

- *Skill:* Heal (WIT)
- *Action:* Slow Action
- *Requirements:* A First Aid Kit must be present. Without one, the roll is made at −2 dice.
- *Difficulty:* 2 (normal), 3 (if Gutted or Arterial Strike), 4 (if DOA attempted mid-round)
- *On success:* The Dying state is resolved. The Critical Injury remains. The character is Broken/Unconscious but no longer dying. They need rest and proper medical care, but they will live.
- *On failure:* Stabilization attempt failed. The character may try again if time permits (same scene). Each failed attempt reduces the character's current Strength by 1 (the effort causes further distress).

=== Instant Death

Two Critical Injury results bypass the Death Check entirely:

- *Result 66 (DOA) with automatic failure:* This death check cannot succeed — there is no roll. If the Heal roll (Difficulty 4, same round) is not made in time, the character dies. There are no further attempts.
- *Results 55/46 — mental death:* Mental Death Checks work the same way; success or failure has the same probability (d6, 1–2 = retirement). These represent permanent catatonia, not physical death — but the character is retired from play regardless.

#design-note([
  *Instant physical death (result 66)* is rare and requires an enormous attack to reach the worst end of the D66 table. It represents an overwhelmingly lethal event. Most character deaths will come from failed Death Checks, not from this result.
])

=== Character Death and Continuity

When a character dies:

+ *Gear returns to Stack.* Division equipment, the Division Signature Item, and all Covenant-issued gear are logged and returned at the end of the Case File.
+ *Covenant notification.* The character is officially listed as *Fallen in the Line of Duty*. The circumstances are filed — truthfully or not, at the surviving team's discretion.
+ *Dark Secrets.* A dead character's Dark Secrets may surface posthumously. If an NPC knew the secret, the DA may still play that complication forward with remaining PCs.
+ *Character replacement.* A new character enters play at the start of the next Case File. They begin with the same XP total as the lowest-XP surviving member of the team (minimum starting values). They arrive as a new Covenant recruitment — briefed, equipped, and nervous.
+ *Legacy.* The deceased character's player chooses one lasting effect: a significant item the new character carries (with DA permission), an NPC connection inherited, or a reputation within the Covenant that precedes them.

=== Corruption Death vs. Physical Death

Physical death and Corruption-threshold death are distinct retirement paths:

- *Physical death:* Any Attribute at 0 → Critical Injury → possible Death Check failure. The character dies with their body intact enough for others to note.
- *Corruption death:* Corruption exceeds `10 + Empathy` → permanent catatonia. The character exists but is unreachable — institutionalized, catatonic, or simply lost. Technically still alive, but gone from play.

#callout-block("NOTE", [
  Corruption death is in many ways worse. Physical death is clean. Corruption death means your colleagues have to keep making decisions about someone they knew, who is now a stranger in a hospital bed.
])

#section-rule()

== Critical Injuries

When a character is *Broken* (any Attribute reduced to 0), they immediately roll on the appropriate Critical Injury table. The table used depends on *what type of damage Broke them*:

- *Physical (Strength = 0):* Roll on the Physical Critical Injury table.
- *Exhaustion (Agility = 0):* Roll on the Physical Critical Injury table (the body has failed).
- *Mental (Wits = 0):* Roll on the Mental & Emotional Critical Injury table.
- *Emotional (Empathy = 0):* Roll on the Mental & Emotional Critical Injury table.

=== How to Roll D66

Roll two d6. The first die is the *tens digit*, the second is the *units digit*. A result of 3 on the first die and 4 on the second = *34*.

=== Death Checks

Some results are marked *†* (Death Check). When you roll one, roll a single d6:

- On a *1–2:* Your character dies.
- On a *3–6:* You survive — barely. The Critical Injury still applies.

A character with *Medical Training* (Keep talent) may spend a Slow Action making a *Heal (WIT)* roll (Difficulty 2) to give a dying ally *+2 to their death check die* before it's rolled (effectively making death only on a 1).

#section-rule()

=== Physical Critical Injury Table (D66)

Roll when Broken by *Strength or Agility* damage.

#nr-table(
  columns: (1fr, 2fr, 4fr, 3fr),
  [*D66*], [*Injury*], [*Mechanical Effect*], [*Healing*],
  [11], [*Wind Knocked Out*], [No actions next turn; Strength returns to 1.], [Recovers automatically end of scene.],
  [12], [*Bad Fall*], [Agility reduced by 1 permanently.], [Requires Keep medical facility (downtime).],
  [13], [*Bloody Nose*], [−1 die on Investigate rolls until treated.], [First Aid Kit (Difficulty 1) restores.],
  [14], [*Cracked Ribs*], [−1 die on all Force rolls; any violent action costs 1 additional Strength.], [Bed rest (1 downtime phase).],
  [15], [*Sprained Wrist*], [Cannot use two-handed weapons. −1 die on all AGI rolls.], [Splint + 1 downtime phase.],
  [16], [*Grazed*], [Strength returns to 1. Scar remains (cosmetic).], [No treatment needed.],
  [21], [*Concussion*], [Wits reduced by 1 until treated. Disorientation: must succeed on Wits roll (Diff 1) to use Slow Actions.], [Heal roll + 24 hours rest.],
  [22], [*Shoulder Dislocation*], [Dominant arm useless. −2 dice on all STR rolls.], [Heal check (Difficulty 2); 1 downtime phase.],
  [23], [*Torn Knee*], [Movement costs double (2 Fast Actions per zone instead of 1).], [Surgery (Keep facility) + 1 downtime phase.],
  [24], [*Ringing Ears*], [−1 die on all WIT-based rolls for rest of session.], [No treatment needed — fades by next session.],
  [25], [*Fractured Hand*], [−2 dice on all AGI rolls. Cannot wield weapons requiring grip.], [Splint + 2 downtime phases.],
  [26], [*Severe Bruising*], [−1 Strength maximum until healed (cannot be healed above 3).], [Heal roll (Difficulty 2) + 1 downtime phase.],
  [31], [*Deep Laceration*], [Bleeds 1 Strength per round until treated (First Aid, Difficulty 1).], [Bandaging stops bleed; full recovery = 1 downtime.],
  [32], [*Fractured Arm*], [Non-dominant arm: useless. Dominant arm: −2 dice STR.], [Cast + 2 downtime phases.],
  [33], [*Broken Nose (Insight)*], [*+1 die on Intimidate rolls forever* (you look dangerous now). Defect: cosmetic disfiguration.], [No mechanical healing needed.],
  [34], [*Shattered Kneecap*], [Movement speed halved permanently (1 zone costs Slow Action). Surgery can restore.], [Keep surgical facility + 2 downtime phases.],
  [35], [*Punctured Lung*], [−2 dice on all STR and AGI rolls. Strenuous action triggers Endure roll (Difficulty 2) or collapse.], [Heal roll (Difficulty 3) + 2 downtime phases.],
  [36], [*Blinding Strike*], [One eye damaged: −1 die on all ranged attack and Investigate rolls permanently. Insight: *+1 die on Empathy rolls* (you understand fragility now).], [Cannot be fully healed; monocle/patch acquired (CL 1).],
  [41], [*Severed Tendon*], [Permanently −1 Agility.], [Keep surgical facility restores −1 penalty only.],
  [42], [*Trauma Shock*], [Frozen for 1d6 rounds. No actions possible. Strength returns to 1 after unfreezing.], [Recovers on its own; stimulants (Fast Action) end it immediately.],
  [43], [*Broken Vertebra*], [Agility reduced by 2. Risk of paralysis: any further STR/AGI damage to 0 triggers death check without rolling.], [Keep surgical facility (requires 2 downtime phases, Difficulty 3 Heal check).],
  [44], [*Organ Damage*], [Strength maximum reduced by 2 permanently.], [Keep surgical facility can restore 1 point.],
  [45], [*Severed Ear*], [Permanent −1 die on Investigate rolls. Insight: *+1 die on Empathy rolls* (you listen more carefully now).], [Cosmetic only; scar remains.],
  [46 †], [*Gutted*], [Bleeding: lose 1 Strength per round. Death check after 3 rounds if untreated. Heal (Difficulty 3) stops bleeding.], [Emergency surgery (Keep facility) required; 2 downtime phases.],
  [51], [*Broken Jaw*], [Cannot speak coherently. Cannot use Manipulate or Command skills until treated.], [Surgical wire (Keep) + 1 downtime phase.],
  [52], [*Nerve Damage*], [Permanently −1 Agility. Occasional muscle spasms: on any die roll of all 1s, drop what you're holding.], [Cannot be healed.],
  [53], [*Severe Burns*], [−2 dice on all STR/AGI actions. Unbandaged burns: lose 1 Strength per scene from infection.], [Keep medical facility; 2 downtime phases.],
  [54], [*Spinal Injury*], [Agility reduced to 1 until treated. No running (cannot move two zones).], [Keep surgical facility (Difficulty 4); 3 downtime phases.],
  [55 †], [*Arm Blown Off*], [Dominant arm severed. Death check. Surviving: permanently one-armed. All two-handed weapons require improvised rig or aid.], [Cannot regrow. Prosthetic possible (CL 5).],
  [56 †], [*Skull Fracture*], [Death check. Surviving: Wits permanently reduced by 1. Severe headaches: −1 die on Investigate for 1 month.], [Keep facility; 1 downtime phase after survival.],
  [61 †], [*Chest Shot*], [Death check. Surviving: Strength maximum reduced by 1 permanently.], [Emergency surgery (Keep facility required immediately).],
  [62 †], [*Leg Blown Off*], [Death check. Surviving: movement reduced to 1 zone per Slow Action, permanently.], [Cannot regrow. Prosthetic possible (CL 5).],
  [63 †], [*Multiple Wounds*], [Death check. Surviving: roll twice more on this table (ignoring further †).], [As per rolled injuries.],
  [64 †], [*Arterial Strike*], [Bleeding 2 Strength per round. Death check must be made within 2 rounds or automatic death.], [Tourniquet (Fast Action, CL 1) buys 1 extra round; Heal (Difficulty 4) fully stabilizes.],
  [65 †], [*Head Shot*], [Death check. Surviving: permanently remove 1 from Wits AND Empathy. Insight: *+2 dice on Psychoanalyze forever* (near-death clarity).], [Cannot be healed. Persistent migraines (permanent).],
  [66 †], [*DOA*], [Automatic death check (no bonus). Surviving: character is clinically dead for 1d6 rounds before revival. All Attributes return to 1. Permanent: +3 Corruption, Empathy −1.], [See Corruption chapter.],
)

#section-rule()

=== Mental & Emotional Critical Injury Table (D66)

Roll when Broken by *Wits or Empathy* damage. Mental criticals always gain Corruption — the occult has left its mark.

#callout-block("NOTE", [
  *All mental criticals:* Gain *+1 Corruption* upon rolling this table, in addition to any listed in the individual result.
])

#nr-table(
  columns: (1fr, 2fr, 4fr, 3fr),
  [*D66*], [*Injury*], [*Mechanical Effect*], [*Recovery*],
  [11], [*Shaken*], [−1 die on all WIT and EMP rolls until end of scene. Wits or Empathy returns to 1.], [Rest or reassurance (Empathy roll, Difficulty 1).],
  [12], [*Distracted*], [Cannot push rolls until end of scene (mind can't sustain the effort).], [Ends automatically with scene change.],
  [13], [*Tremors*], [Fine motor control impaired: −1 die on Sleight of Hand and Firearms this session.], [No treatment needed — fades by next session.],
  [14], [*Dissociation*], [Character acts on autopilot: DA narrates their next turn's actions.], [Psychoanalyze check (Difficulty 1) by ally to snap them out early.],
  [15], [*Paranoid Flash*], [Character immediately acts on the nearest perceived threat (DA chooses target — may be an ally).], [Psychoanalyze (Difficulty 1) ends it; 1 Empathy cost to the treating ally.],
  [16], [*Acute Anxiety*], [All Difficulty ratings increase by 1 for rest of scene.], [Scene change ends it automatically.],
  [21], [*Night Terrors*], [Between sessions: character does not benefit from sleep-based recovery. Agility Broken recovery is halved.], [Psychoanalyze session (downtime, Difficulty 2) clears it.],
  [22], [*Intrusive Visions*], [−1 die on Investigate whenever concentration is needed (DA's discretion).], [Psychoanalyze session (downtime, Difficulty 2).],
  [23], [*Fugue State*], [Miss one scene entirely (treated as absent). Character wanders or freezes; ally must spend a Slow Action per round to keep them moving.], [Psychoanalyze (Difficulty 2) by an ally to restore presence.],
  [24], [*Emotional Numbing*], [Empathy reduced by 1 until treated. Cannot Manipulate others — no connection is felt.], [Downtime scene of roleplay connection + Psychoanalyze (Difficulty 2).],
  [25], [*Hypervigilance (Insight)*], [*Permanently: +1 die on Investigate rolls* (always watching). Permanent: −1 die on Empathy-based social rolls (you don't trust anyone).], [No recovery needed — rewired.],
  [26], [*Compulsion*], [Character develops a specific compulsion (DA and player define together). Each scene, must make Wits roll (Difficulty 1) or act on compulsion before other actions.], [Psychoanalyze campaign (3 downtime phases, Difficulty 3) to suppress.],
  [31], [*Sensory Flashback*], [Triggered by a DA-defined stimulus (a smell, a sound). When triggered: lose Fast Action that round as flashback fires.], [Psychoanalyze campaign (2 downtime phases, Difficulty 2).],
  [32], [*Social Withdrawal*], [−2 dice on all Empathy-based rolls. Character refuses social complexity.], [Downtime social scene (roleplay) + Psychoanalyze (Difficulty 2).],
  [33], [*Survivor Guilt*], [If any ally takes damage within the scene, character suffers 1 Empathy damage (involuntary).], [Psychoanalyze (Difficulty 2) + meaningful roleplay scene.],
  [34], [*Paranoid Ideation*], [Character believes a specific NPC or faction is surveilling them (DA chooses). Act on it: +1 die on Sneak actions. Suffer it: −1 die on Empathy rolls involving the believed threat.], [Psychoanalyze campaign (2 downtime phases).],
  [35], [*Dissociative Identity Trigger*], [+1 Corruption (additional). DA introduces an alternate behavioral state — twice per session, at dramatic moments, rolls a d6: 1–2 = alternate state this scene.], [Psychoanalyze campaign (3 downtime phases, Difficulty 3).],
  [36], [*Rage Episodes*], [When Empathy falls below 2, character must succeed on Wits roll (Difficulty 2) or attack nearest person (ally or foe).], [Psychoanalyze campaign (2 downtime phases, Difficulty 3).],
  [41], [*Artifact Corruption (Insight)*], [+2 Corruption (additional). Permanent: *+1 die on all artifact interaction rolls* (you opened a channel). Permanent: −1 Empathy.], [Cannot be recovered — this is the artifact's mark.],
  [42], [*Phobia*], [New phobia defined (DA and player): when triggered, automatic Fear check at Fear Rating 3.], [Psychoanalyze campaign (3 downtime phases, Difficulty 3) reduces to Fear Rating 1.],
  [43], [*Waking Hallucinations*], [Wits reduced by 1 permanently. Once per session, character perceives a supernatural intrusion that may or may not be real (DA only knows).], [Keep's Empathy specialist can reduce severity; Wits loss is permanent.],
  [44], [*Emotional Bleed*], [Permanently −1 Empathy. All social skill rolls suffer −1 die for the remainder of the campaign.], [Cannot be healed.],
  [45], [*Fracture Point*], [Corruption threshold reduced by 2 permanently. Max Corruption = `8 + Empathy` instead of `10 + Empathy`.], [Cannot be reversed.],
  [46 †], [*Catatonic Episode*], [Death check (mind — failure = permanent catatonia, character retirement). Surviving: Wits and Empathy each reduced by 1. +2 Corruption immediately.], [Intensive Psychoanalyze (Difficulty 4, Keep facility) over 2 downtime phases to stabilize.],
  [51], [*Obsessive Documentation*], [Character must document everything. Insight: *+2 dice on Investigate* when reviewing notes from current mission. Compulsion: −1 die on social rolls (distracted).], [Psychoanalyze campaign (3 downtime phases) to reduce compulsion; Insight remains.],
  [52], [*Broken Empathy*], [Permanently −2 Empathy. All social skills lose 2 dice.], [Cannot be healed — the connection is severed.],
  [53], [*Artifact Imprint*], [+3 Corruption (additional). Character begins hearing the artifact that Broke them. DA may use this as a plot hook.], [Containment ritual can suppress the call but not eliminate the imprint.],
  [54], [*Veil Burn*], [+2 Corruption. Wits permanently −1. Insight: *+1 die on all artifact detection rolls* (you can feel them now).], [Cannot be healed — the Veil has scorched your perception permanently.],
  [55 †], [*Shattered Will*], [Death check (mind). Surviving: Wits and Empathy max permanently reduced by 1 each. +2 Corruption. Cannot push rolls for remainder of campaign arc until psychological breakthrough (DA milestone).], [Keep Psychoanalyze program (4 downtime phases, Difficulty 4).],
  [56 †], [*Cosmic Revelation*], [Death check (mind). Surviving: character learns something true and terrible. +3 Corruption, −2 Empathy permanently. Insight: *+2 dice on all Lore-type rolls forever*. DA defines the revelation.], [Cannot be unlearned. Roleplay is mandatory.],
  [61], [*Memory Dissolution*], [Permanently −1 Wits. Character loses one specific skill memory (DA chooses a skill at rank 1–2; it drops to 0).], [Cannot recover lost skill without retraining (requires downtime advancement).],
  [62], [*Identity Crisis*], [Character's Division Allegiance wavers. For 1 campaign arc, they cannot use their Division Talent.], [Major roleplay scene with Covenant superior + Psychoanalyze (Difficulty 3).],
  [63], [*Veil Madness*], [+4 Corruption immediately. Roll on this table *again* (ignore result 63 on reroll).], [As per second roll result.],
  [64 †], [*Prophetic Fugue*], [Death check (mind). Surviving: +3 Corruption. Character enters a trance broadcasting the Covenant's location to hostile artifact entities until a Wayfinder performs a Shielding ritual.], [Ritual seals the broadcast; Corruption remains.],
  [65 †], [*Ego Death*], [Death check (mind). Surviving: character personality fundamentally alters. Player rewrites one Drive and one aspect of their biography. +3 Corruption. Insight: *+2 dice on all Empathy rolls* (dissolution breeds radical compassion).], [Cannot be undone. Roleplay the new self.],
  [66 †], [*Unraveling*], [Automatic mind death check (no bonus). Surviving: +4 Corruption, −1 to every Attribute permanently, character retires at end of current mission. Final scene before retirement should be played.], [Retirement is farewell — play it well.],
)

#section-rule()

== Armor Mechanics

To survive lethal encounters, agents utilize armor (such as concealed Kevlar vests or tactical riot gear):

+ When you suffer physical damage, roll a number of *Gear Dice* equal to the item's *Armor Rating*.
+ Every *6* rolled absorbs *1 point* of incoming damage before it reduces your Strength.
+ *Degradation:* If you roll any *1s* on an armor save, the Armor Rating is permanently reduced by 1 until repaired by Stack during downtime.
