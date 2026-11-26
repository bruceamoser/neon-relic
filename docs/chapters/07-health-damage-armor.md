# Health, Damage, and Armor {#chapter-health}

In the Year Zero Engine, characters do not possess a traditional, escalating pool of "Hit Points." Instead, your **four core Attributes directly serve as your health pools**.

## Damage Types {#07-damage-types}

Every source of damage specifies its type and target attribute. The attack defines the damage, not the defender.

| Damage Type | Target | Sources |
| ------------------------ | ------------------------ | ------------------------------------------------ |
| **Physical** | **Strength** (violence, toxins, falls) or **Agility** (exhaustion, prolonged exertion) | Weapons, environmental hazards, physical traps, mundane combat |
| **Mental** | **Wits** (terror, confusion, psychic assault) or **Empathy** (grief, guilt, emotional manipulation) | Supernatural abilities, psychological attacks, social betrayal |
| **Corruption** | **Corruption track** directly | Pushing rolls, activating Division Talents, occult exposure, artifact activation/feedback, specific creature attacks |

### Damage Type Rules {#07-damage-type-rules}

1. **The source specifies the damage type and target attribute.** The defender does not choose.
1. **Combination attacks** are possible: a supernatural creature might deal Physical (STR) + Corruption damage in the same attack. Both are applied.
1. **Weapon stat blocks** list Damage, Type, and Target Attribute. In the equipment table ([Equipment](#chapter-equipment)) the format is: Gear Bonus | Damage | Type | Range. Example: _Knife: Gear Bonus +1, Damage 2, Physical (STR), Range: Engaged._ See [Bestiary](#chapter-bestiary) for creature stat block format.
1. **Creature stat blocks** list damage per attack. Example: _Shadow Tendril: Damage 2, Mental (WIT) + 1 Corruption_.
1. **Broken state** triggers when any attribute reaches 0, as before. Physical Broken (STR/AGI = 0) → Physical Critical Injury table. Mental Broken (WIT/EMP = 0) → Mental Critical Injury table.

> **Note on Corruption:** Corruption is listed above for completeness, but it functions differently from Physical and Mental damage. Physical and Mental damage reduce Attribute pools. Corruption adds to a separate Corruption track. It cannot be absorbed by armor, and its healing follows different rules (see [Corruption and Healing](#chapter-corruption)). When an attack deals both Physical damage and Corruption, resolve each type independently.

### What Determines STR vs AGI / WIT vs EMP {#07-what-determines-str-vs-agi-wit-vs-emp}

- **Physical attacks** default to **STR** unless the source is specifically about exhaustion, fatigue, or overexertion (then AGI).
- **Mental attacks** default to **WIT** unless the source is specifically emotional, social, or empathic (then EMP).
- The DA does not adjudicate this per-attack. The weapon, creature, or event definition states the target.

## The Broken State {#07-the-broken-state}

If any Attribute is reduced to **0**, your character becomes **Broken**:

- The character is immediately **incapacitated**: they collapse where they stand.
    - They **cannot take actions** (Slow, Fast, or Reactive) and cannot push rolls.
    - They **cannot move under their own power**. An ally may drag or carry them at half speed (1 zone per Slow Action).
    - They **can speak briefly**. A few words per round. Enough for last words or calling for help.
    - They **can perceive their surroundings** but cannot take meaningful action.
    - They **may still make Wits or Empathy rolls** if directly targeted (the DA decides when a passive mental roll is appropriate).
- They must roll on a **Critical Injury table**, which can result in lethal consequences or permanent maiming depending on the severity of the attack.

### Simultaneous Injury Resolution {#07-simultaneous-injury-resolution}

When multiple end-states trigger from a single sequence of events, resolve them in this order:

1. **Physical damage resolves first.** Apply all damage, check for Broken state, roll Critical Injury if applicable.
1. **Death Check resolves second.** If the Critical Injury requires a Death Check (†), resolve it immediately. If the character dies, they are dead. No further checks apply.
1. **Corruption threshold resolves third.** After all physical injury effects are complete, check whether any Corruption gained during the sequence (from Critical Injury results, Corruption Bursts from witnessing an ally's Critical Injury (see [Corruption and Healing](#chapter-corruption) for Burst rules) or other sources) has pushed the character over their Corruption threshold. If so, the character enters catatonia.

> **Corruption timing:** Corruption gained from Mental Critical Injury results (the +1 base and any additional listed amounts) is accumulated but **not** checked against the Corruption threshold until Step 3. Accumulate all Corruption from the entire sequence, then check the threshold once at the end.

This means a character can survive being shot only to have their mind break from the trauma of the experience. It also means a character who fails their Death Check is simply dead. The Corruption is rendered moot. The physical world moves faster than the psyche unravels.

## Death and Dying {#07-death-and-dying}

Being **Broken** is not the same as being dead. A Broken character can die if care arrives too late.

::: wide
### The Three States {#07-the-three-states}

| State | Status | What It Means |
| ------------ | ------------------------ | ------------------------------------------------ |
| **Broken / Unconscious** | Any Attribute = 0. Critical Injury rolled. | Character is incapacitated. They can still be saved. |
| **Dying** | Broken with a Death Check Critical Injury (result marked †), and the Death Check has not yet been resolved, or was survived but the underlying injury is active (Bleeding, Gutted). | The window for stabilization is closing. An untreated Dying character will die. |
| **Dead** | Death Check rolled and failed, OR a specific instant-death result triggered, OR Dying window expires without treatment. | The character is gone. |
:::

### The Death Check {#07-the-death-check}

A **Death Check** is a single d6 roll. It is required whenever a Critical Injury is marked with **†**.

- Roll one d6.
- **1–2:** The character dies.
- **3–6:** The character survives. The Critical Injury still applies and must be treated, but they cling to life.

**Medical Training Talent (Keep):** An ally with Medical Training may spend a Slow Action to make a **Heal (EMP) roll (Difficulty 2)** before the Death Check is rolled. On success: the dying character rolls d6+1 instead of d6 (death only on a natural 1, result 2 on the table). On failure: no change; Death Check proceeds normally.

### The Stabilization Window {#07-the-stabilization-window}

A Broken character who has rolled a Death-Check result (†) has a limited window in which an ally can stabilize them before death becomes inevitable:

- **Within the same scene:** An ally may attempt to stabilize the Dying character (see First Aid below).
- **End of scene without treatment:** The character must roll their Death Check unmodified. No ally assistance.
- **Extreme Critical Injury exceptions:** Critical Injury result **66 (DOA)** requires an immediate Death Check. There is no window. The Heal roll to make the check possible (Difficulty 4) must be attempted within the same round (not the same scene). See **Extreme Critical Injuries** below.

### First Aid: Stabilizing a Dying Character {#07-first-aid-stabilizing-a-dying-character}

To stabilize a Dying ally during the stabilization window:

- **Skill:** Heal (EMP)
- **Action:** Slow Action
- **Requirements:** A First Aid Kit (+1 Gear Bonus to Heal, Resource Die d10. See [Equipment](#chapter-equipment)) must be present and not exhausted. Without one, the Heal roll is made at −2 dice: −1 from the missing Gear Bonus, and −1 additional penalty for improvising without supplies.
- **Difficulty:** 2 (normal), 3 (if Gutted or Arterial Strike), 4 (if DOA attempted mid-round)
- **On success:** The Dying state is resolved. The Critical Injury remains. The character is Broken/Unconscious but no longer dying. They need rest and proper medical care, but they will live.
- **On failure:** Stabilization attempt failed. The character may try again if time permits (same scene). Each failed attempt reduces the **treating agent's** current Strength by 1 (the desperate effort physically exhausts the healer). The Broken character's attribute is already at 0 and cannot go lower.

### Extreme Critical Injuries {#07-extreme-critical-injuries}

Some Critical Injury results carry extreme conditions that change how the Death Check works:

- **Result 66 (DOA):** Without immediate intervention, death is automatic: **no Death Check is rolled**. An ally may attempt a Heal roll (Difficulty 4, same round only) to make a Death Check possible. If the Heal succeeds, the character makes a Death Check with **no bonus** (plain d6; the Medical Training +1 does not apply here. The Heal action's entire effort went into keeping the patient alive long enough to roll). If no ally attempts the Heal this round (or the Heal fails), the character dies. There are no further attempts. Surviving: see the Critical Injury table result 66.
- **Result 55 (Shattered Will), 46 (Catatonic Episode), mental death:** These require a mental Death Check (mind, not body). The check uses the same procedure (d6, 1–2 = failure). Failure = permanent catatonia, character retirement. These are not physical death. The character is retired from play but may remain as an NPC.

> **Design note:** Result 66 (DOA) is rare. It requires an overwhelmingly lethal physical event to reach the worst end of the D66 table. Most character deaths will come from failed Death Checks, not from this result.

### Character Death and Continuity {#07-character-death-and-continuity}

When a character dies:

1. **Gear returns to Stack.** Division equipment, the Division Signature Item (Verdant Codex, Warden's Bracer, etc.), and all Covenant-issued gear are logged and returned at the end of the Case File.
1. **Covenant notification.** The character is officially listed as **Fallen in the Line of Duty**. The circumstances are filed, truthfully or not, at the surviving team's discretion.
1. **Character replacement.** A new character enters play at the start of the next Case File. They begin with the same **Total XP** as the lowest-Total-XP surviving member of the team, with **Spent XP reset to 0**. The new agent allocates their own purchases (minimum: the character creation baseline values as defined in [Character Creation](#chapter-character-creation)). If a character dies **mid-Case-File**, the DA may introduce the replacement at a narratively appropriate moment in the same mission. A Covenant backup team, a local contact activated as emergency support, or a specialist from HQ. See [Advancement](#chapter-advancement) for the three-track XP model and spending rules.
1. **Legacy.** The deceased character's player chooses one lasting effect: a significant item the new character carries (with DA permission), an NPC connection inherited, or a reputation within the Covenant that precedes them.

### Corruption Death vs. Physical Death {#07-corruption-death-vs-physical-death}

Physical death and Corruption-threshold death are distinct retirement paths:

- **Physical death:** Any Attribute at 0 → Critical Injury → possible Death Check failure. The character dies with their body intact enough for others to note.
- **Corruption death:** Corruption **exceeds** (strictly greater than) `10 + Empathy` → permanent catatonia. The character exists but is unreachable, institutionalized, catatonic, or simply lost. Technically still alive, but gone from play.

> **Permanent Empathy loss and threshold interaction:** Several Mental Critical Injuries permanently reduce Empathy. If an Empathy reduction causes the Corruption threshold to drop to or **below** the character's current Corruption total, the character does **not** immediately enter catatonia, catatonia only triggers when Corruption **exceeds** the threshold. But the character is at critical risk: any further Corruption gain of any amount will trigger catatonia instantly.

> Corruption death is in many ways worse. Physical death is clean. Corruption death means your colleagues have to keep making decisions about someone they knew, who is now a stranger in a hospital bed.

## Critical Injuries {#07-critical-injuries}

When a character is **Broken** (any Attribute reduced to 0), they immediately roll on the appropriate Critical Injury table. The table used depends on **what type of damage Broke them**:

- **Physical (Strength = 0):** Roll on the Physical Critical Injury table.
- **Hobbling (Agility = 0):** Roll on the Physical Critical Injury table (the body has failed). The DA should **reinterpret results for hobbling context**. A 'Head Shot' becomes a stroke or aneurysm; an 'Arterial Strike' becomes a cardiovascular crisis; 'Arm Blown Off' represents total muscular collapse. The mechanical effect of the rolled result is unchanged. Only the narrative framing adapts.
- **Mental (Wits = 0):** Roll on the Mental & Emotional Critical Injury table.
- **Emotional (Empathy = 0):** Roll on the Mental & Emotional Critical Injury table.

### How to Roll D66 {#07-how-to-roll-d66}

Roll two d6. The first die is the **tens digit**, the second is the **units digit**. A result of 3 on the first die and 4 on the second = **34**.

### Death Checks {#07-death-checks}

Some results are marked **†** (Death Check). When you roll one, roll a single d6:

- On a **1–2:** Your character dies.
- On a **3–6:** You survive, barely. The Critical Injury still applies.

A character with **Medical Training** (Keep talent) may spend a Slow Action making a **Heal (EMP)** roll (Difficulty 2) to give a dying ally **+1 to their death check die** before it's rolled (effectively making death only on a natural 1, result 2 on the table).

### Critical Injury Severity Categories {#07-critical-injury-severity-categories}

Critical Injuries are categorized by severity:

- **Non-lethal** (no † marker): Serious but not immediately life-threatening. Can be treated during downtime at Keep medical facilities ([Headquarters](#chapter-headquarters)).
- **Lethal** (marked with †): Requires a Death Check. Emergency field stabilization is required before downtime treatment.
- **Permanent** (listed as 'Cannot be healed'): Even Keep facilities cannot clear these injuries. They represent lasting change.

The canonical term is **non-lethal** (not 'non-fatal'). Both this chapter and Chapter 12 use non-lethal consistently.

### Insight: Permanent Bonuses from Critical Injuries {#07-insight-permanent-bonuses-from-critical-injuries}

Some Critical Injury results grant an **Insight**. A permanent mechanical bonus representing hard-won understanding. Insights are shown in _italic_ in the tables.

- Insights **cannot be removed**, even if the underlying injury is treated or cosmetically corrected.
- Insights from **different injuries stack** (two separate Empathy Insights = +2 dice total).
- Record each Insight on your character sheet with its source injury.
- Insights reflect genuine trauma. They **cannot be deliberately sought**. If the DA determines a character is intentionally provoking injury to acquire an Insight, the Critical Injury is applied without the Insight bonus. A character cannot gain the same Insight twice.

### Broken Attribute Restoration {#07-broken-attribute-restoration}

When a character rolls a Critical Injury, their Broken Attribute **remains at 0** unless the result explicitly states otherwise (e.g., 'Strength returns to 1'). A character whose attribute remains at 0 is still Broken and must be stabilized before they can act. Results that do restore the attribute (11, 16, 42) represent impacts that Broke the character through shock alone. The physical damage was not severe enough to maintain the Broken state.

::: {.lookup register="physical-injuries" kind="D66" title="Physical injuries"}
### Physical Critical Injury Table (D66) {#07-physical-critical-injury-table-d66}

Roll when Broken by **Strength or Agility** damage.
:::

::: {.catalog register="physical-injuries"}
| D66 | Injury | Mechanical Effect | Healing |
| ------------ | ------------------------ | ------------------------------------------------ | ------------------------------------ |
| 11 | **Wind Knocked Out** | No actions next turn; Strength returns to 1. | Recovers automatically end of scene. |
| 12 | **Bad Fall** | Agility reduced by 1 permanently. | Requires Keep medical facility (downtime). |
| 13 | **Bloody Nose** | −1 die on Investigate rolls until treated. | Heal roll (Difficulty 1) with First Aid Kit. |
| 14 | **Cracked Ribs** | −1 die on all Force rolls; any violent action costs 1 additional Strength. | Bed rest (1 downtime phase). |
| 15 | **Sprained Wrist** | Cannot use two-handed weapons. −1 die on all AGI rolls. | Splint + 1 downtime phase. |
| 16 | **Grazed** | Strength returns to 1. Scar remains (cosmetic). | No treatment needed. |
| 21 | **Concussion** | Wits reduced by 1 until treated. Disorientation: must succeed on Wits roll (Diff 1) to use Slow Actions. | Heal roll (Difficulty 2) + 24 hours rest. |
| 22 | **Shoulder Dislocation** | Dominant arm useless. −2 dice on all STR rolls. | Heal roll (Difficulty 2); 1 downtime phase. |
| 23 | **Torn Knee** | Movement costs double (2 Fast Actions per zone instead of 1). | Surgery (Keep facility) + 1 downtime phase. |
| 24 | **Ringing Ears** | −1 die on all WIT-based rolls for rest of session. | No treatment needed, fades by next session. |
| 25 | **Fractured Hand** | −2 dice on all AGI rolls. Cannot wield weapons requiring grip. | Splint + 2 downtime phases. |
| 26 | **Severe Bruising** | −1 Strength maximum until healed (cannot be healed above 3). | Heal roll (Difficulty 2) + 1 downtime phase. |
| 31 | **Deep Laceration** | Bleeds 1 Strength per round until treated (First Aid, Difficulty 1). | Bandaging stops bleed; full recovery = 1 downtime. |
| 32 | **Fractured Arm** | Non-dominant arm: useless. Dominant arm: −2 dice STR. | Cast + 2 downtime phases. |
| 33 | **Broken Nose (Insight)** | **+1 die on Command rolls made through threat or intimidation forever** (you look dangerous now). | No mechanical healing needed. Defect: cosmetic disfiguration. |
| 34 | **Shattered Kneecap** | Movement speed halved permanently (1 zone costs Slow Action). Surgery can restore. | Keep surgical facility + 2 downtime phases. |
| 35 | **Punctured Lung** | −2 dice on all STR and AGI rolls. Strenuous action triggers Endure roll (Difficulty 2) or collapse. | Heal roll (Difficulty 3) + 2 downtime phases. |
| 36 | **Blinding Strike** | One eye damaged: −1 die on all ranged attack and Investigate rolls permanently. Insight: **+1 die on Empathy rolls** (you understand fragility now). | Cannot be fully healed; monocle/patch is acquired (CL 1). |
| 41 | **Severed Tendon** | Permanently −1 Agility. | Keep surgical facility restores −1 penalty only. |
| 42 | **Trauma Shock** | Frozen for 1d6 rounds. No actions possible. Strength returns to 1 after unfreezing. | Recovers on its own; stimulants (Fast Action) end it immediately. |
| 43 | **Broken Vertebra** | Agility reduced by 2. Risk of paralysis: any further STR/AGI damage to 0 triggers death check without rolling. | Keep surgical facility (requires 2 downtime phases, Difficulty 3 Heal roll). |
| 44 | **Organ Damage** | Strength maximum reduced by 2 permanently. | Keep surgical facility can restore 1 point. |
| 45 | **Severed Ear** | Permanent −1 die on Investigate rolls. Insight: **+1 die on Empathy rolls** (you listen more carefully now). | Cosmetic only; scar remains. |
| 46 | **Gutted** † | Bleeding: lose 1 Strength per round. Death check after 3 rounds if untreated. Heal (Difficulty 3) stops bleeding. | Emergency surgery (Keep facility) required; 2 downtime phases. |
| 51 | **Broken Jaw** | Cannot speak coherently. Cannot use Manipulate or Command skills until treated. | Surgical wire (Keep) + 1 downtime phase. |
| 52 | **Nerve Damage** | Permanently −1 Agility. Occasional muscle spasms: on any die roll of all 1s, drop what you're holding. | Cannot be healed. |
| 53 | **Severe Burns** | −2 dice on all STR/AGI actions. Unbandaged burns: lose 1 Strength per scene from infection. | Keep medical facility; 2 downtime phases. |
| 54 | **Spinal Injury** | Agility reduced to 1 until treated. No running (cannot move two zones). | Keep surgical facility (Difficulty 4); 3 downtime phases. |
| 55 | **Arm Blown Off** † | Dominant arm severed. Death check. Surviving: permanently one-armed. All two-handed weapons require improvised rig or aid. | Cannot regrow. Prosthetic possible ([Equipment → Prosthetics](#chapter-equipment), CL 5). |
| 56 | **Skull Fracture** † | Death check. Surviving: Wits permanently reduced by 1. Severe headaches: −1 die on Investigate for 1 month. | Keep facility; 1 downtime phase after death check survival. |
| 61 | **Chest Shot** † | Death check. Surviving: Strength maximum reduced by 1 permanently. | Emergency surgery (Keep facility required immediately). |
| 62 | **Leg Blown Off** † | Death check. Surviving: movement reduced to 1 zone per Slow Action, permanently. | Cannot regrow. Prosthetic possible ([Equipment → Prosthetics](#chapter-equipment), CL 5). |
| 63 | **Multiple Wounds** † | Death check. Surviving: roll twice more on this table (ignoring further †). | As per rolled injuries. |
| 64 | **Arterial Strike** † | Bleeding 2 Strength per round. Death check must be made within 2 rounds or automatic death. | Tourniquet (Fast Action, CL 1) buys 1 extra round; Heal (Difficulty 4) fully stabilizes. |
| 65 | **Head Shot** † | Death check. Surviving: permanently remove 1 from Wits AND Empathy. Insight: **+2 dice on Psychoanalyze forever** (near-death clarity). | Cannot be healed. Persistent migraines (permanent). |
| 66 | **DOA** † | **No automatic Death Check.** An ally must attempt Heal (WIT, Difficulty 4) **same round** to make a Death Check possible. Without the Heal, automatic death. No roll is made. If the Heal succeeds: Death Check at no bonus (plain d6, Medical Training modifier does not apply). Surviving: character is clinically dead for 1d6 rounds, then revives. All Attributes return to 1. +3 Corruption, Empathy −1 permanently. | See **Extreme Critical Injuries** above. |
:::

::: {.lookup register="mental-injuries" kind="D66" title="Mental injuries"}
### Mental & Emotional Critical Injury Table (D66) {#07-mental-emotional-critical-injury-table-d66}

Roll when Broken by **Wits or Empathy** damage. Mental criticals always gain Corruption. The occult has left its mark.

> **All mental criticals:** Gain **+1 Corruption** upon rolling this table, in addition to any listed in the individual result. This +1 applies **once per Broken event**, not per roll, rerolls triggered by Veil Madness (result 63) or similar effects do not trigger the +1 again. Accumulate all Corruption from the sequence and check the threshold once at the end (Step 3 of Simultaneous Injury Resolution).
:::

::: {.catalog register="mental-injuries"}
| D66 | Injury | Mechanical Effect | Recovery |
| ------------ | ------------------------ | ------------------------------------------------ | ------------------------------------ |
| 11 | **Shaken** | −1 die on all WIT and EMP rolls until end of scene. Wits or Empathy returns to 1. | Rest or reassurance (Empathy roll, Difficulty 1). |
| 12 | **Distracted** | Cannot push rolls until the end of scene (mind can't sustain the effort). | ends automatically with scene change. |
| 13 | **Tremors** | Fine motor control impaired: −1 die on Deft Hands and Firearms this session. | No treatment needed, fades by next session. |
| 14 | **Dissociation** | Character acts on autopilot: DA narrates their next turn's actions. | Psychoanalyze check (Difficulty 1) by ally to snap them out early. |
| 15 | **Paranoid Flash** | Character immediately acts on the nearest perceived threat (DA chooses target, may be an ally). | Psychoanalyze (Difficulty 1) ends it; 1 Empathy cost to the treating ally. |
| 16 | **Acute Anxiety** | All Difficulty ratings increase by 1 for rest of scene. | Scene change ends it automatically. |
| 21 | **Night Terrors** | Between sessions: character does not benefit from sleep-based recovery. Agility Broken recovery is halved. | Psychoanalyze session (downtime, Difficulty 2) clears it. |
| 22 | **Intrusive Visions** | −1 die on Investigate whenever concentration is needed (DA's discretion). | Psychoanalyze session (downtime, Difficulty 2). |
| 23 | **Fugue State** | Miss one scene entirely (treated as absent). Character wanders or freezes; ally must spend a Slow Action per round to keep them moving. | Psychoanalyze (Difficulty 2) by an ally to restore presence. |
| 24 | **Emotional Numbing** | Empathy reduced by 1 until treated. Cannot Manipulate others. No connection is felt. | Downtime scene of roleplay connection + Psychoanalyze (Difficulty 2). |
| 25 | **Hypervigilance (Insight)** | **Permanently: +1 die on Investigate rolls** (always watching). Permanent: −1 die on Empathy-based social rolls (you don't trust anyone). | No recovery needed, rewired. |
| 26 | **Compulsion** | Character develops a specific compulsion (DA and player define together: counting objects, checking door locks, avoiding red cars). Each scene, must make Wits roll (Difficulty 1) or act on compulsion before other actions. | Psychoanalyze campaign (3 downtime phases, Difficulty 3) to suppress. |
| 31 | **Sensory Flashback** | Triggered by a DA-defined stimulus (a smell, a sound). When triggered: lose Fast Action that round as flashback fires. | Psychoanalyze campaign (2 downtime phases, Difficulty 2). |
| 32 | **Social Withdrawal** | −2 dice on all Empathy-based rolls. Character refuses social complexity. | Downtime social scene (roleplay) + Psychoanalyze (Difficulty 2). |
| 33 | **Survivor Guilt** | If any ally takes damage within the scene, character suffers 1 Empathy damage (involuntary). | Psychoanalyze (Difficulty 2) + meaningful roleplay scene. |
| 34 | **Paranoid Ideation** | Character believes a specific NPC or faction is surveilling them (DA chooses). Act on it: +1 die on Sneak actions. Suffer it: −1 die on Empathy rolls involving the believed threat. | Psychoanalyze campaign (2 downtime phases). |
| 35 | **Dissociative Identity Trigger** | +1 Corruption (additional). DA introduces an alternate behavioral state, twice per session, at dramatic moments, rolls a d6: 1–2 = alternate state this scene. | Psychoanalyze campaign (3 downtime phases, Difficulty 3). |
| 36 | **Rage Episodes** | When Empathy falls below 2, character must succeed on Wits roll (Difficulty 2) or attack nearest person (ally or foe). | Psychoanalyze campaign (2 downtime phases, Difficulty 3). |
| 41 | **Artifact Corruption (Insight)** | +2 Corruption (additional). Permanent: **+1 die on all artifact interaction rolls** (you opened a channel). Permanent: −1 Empathy. | Cannot be recovered. This is the artifact's mark. |
| 42 | **Phobia** | New phobia defined (DA and player): when triggered, automatic Corruption Burst at Burst Rating 3. | Psychoanalyze campaign (3 downtime phases, Difficulty 3) reduces to Burst Rating 1. |
| 43 | **Waking Hallucinations** | Wits reduced by 1 permanently. Once per session, character perceives a supernatural intrusion that may or may not be real (DA only knows). | Keep's Empathy specialist can reduce severity; Wits loss is permanent. |
| 44 | **Emotional Bleed** | Permanently −1 Empathy. Character becomes emotionally numb. All social skill rolls suffer −1 die for the remainder of the campaign. | Cannot be healed. |
| 45 | **Fracture Point** | Corruption threshold reduced by 2 (permanently). Max Corruption = `8 + Empathy` instead of `10 + Empathy`. The exposure has cracked something fundamental. | Cannot be reversed. |
| 46 | **Catatonic Episode** † | Death check (mind, not body, failure = permanent catatonia, character retirement). Surviving: Wits and Empathy each reduced by 1. +2 Corruption immediately. | Intensive Psychoanalyze (Difficulty 4, Keep facility) over 2 downtime phases to stabilize. |
| 51 | **Obsessive Documentation** | Character must document everything (Insight: **+2 dice on Investigate** when reviewing notes from current mission). Compulsion: spends all available time writing; −1 die on social rolls (distracted). | Psychoanalyze campaign (3 downtime phases) to reduce compulsion; Insight remains. |
| 52 | **Broken Empathy** | Permanently −2 Empathy. All social skills lose 2 dice. | Cannot be healed. The connection is severed. |
| 53 | **Artifact Imprint** | +3 Corruption (additional). Character begins hearing the artifact that Broke them. DA may use this as a plot hook: the artifact calls them back. | Shielding ritual (see [Containment Rituals](#containment-rituals)) can suppress the call but not eliminate the imprint. |
| 54 | **Veil Burn** | +2 Corruption. Wits permanently −1. Insight: **+1 die on all artifact detection rolls** (you can feel them now). | Cannot be healed. The Veil has scorched your perception permanently. |
| 55 | **Shattered Will** † | Death check (mind). Surviving: Wits and Empathy max permanently reduced by 1 each. +2 Corruption. Cannot push rolls for remainder of campaign arc until psychological breakthrough (DA milestone). | Keep Psychoanalyze program (4 downtime phases, Difficulty 4). |
| 56 | **Cosmic Revelation** † | Death check (mind). Surviving: character learns something true and terrible about the Covenant's mission or the nature of artifacts. +3 Corruption, −2 Empathy permanently. Insight: **+2 dice on all Lore-type rolls forever** (Wayfinder skill equivalent). DA defines the revelation. It should reshape how the character sees the world. | Cannot be unlearned. Roleplay is mandatory. |
| 61 | **Memory Dissolution** | Permanently −1 Wits. Character loses one specific skill memory (DA chooses a skill at rank 1–2; it drops to 0). | Cannot recover lost skill without retraining ([Advancement → Skill Retraining during downtime](#chapter-advancement)). |
| 62 | **Identity Crisis** | Character's Division Allegiance wavers. For the remainder of the current Case File, they cannot use **Division Talents that cost Corruption to activate** (their free foundational healing talent remains available). Restriction ends at the start of the next Case File. | Major roleplay scene with Covenant superior + Psychoanalyze (Difficulty 3). |
| 63 | **Veil Madness** | +4 Corruption immediately. Roll on this table **again** (ignore result 63 on reroll). | As per second roll result. |
| 64 | **Prophetic Fugue** † | Death check (mind). Surviving: +3 Corruption. Character enters a trance broadcasting the Covenant's location to hostile artifact entities until a Shielding ritual is performed. | Ritual seals the broadcast; Corruption remains. |
| 65 | **Ego Death** † | Death check (mind). Surviving: character personality fundamentally alters. Player rewrites one Drive and one aspect of their biography. +3 Corruption. Insight: **+2 dice on all Empathy rolls** (dissolution breeds radical compassion, or fearlessness). | Cannot be undone. Roleplay the new self. |
| 66 | **Unraveling** † | Automatic mind death check (no bonus). Surviving: +4 Corruption, −1 to every Attribute permanently, character retires at end of current mission (they cannot continue as an operative). Final scene before retirement should be played. | Retirement is farewell, play it well. |
:::

### Psychoanalyze Campaign Treatment {#07-psychoanalyze-campaign-treatment}

Several Mental Critical Injuries require a **Psychoanalyze campaign**, a structured series of therapeutic sessions during downtime.

- The **treating character** (an ally with Psychoanalyze skill, or a Keep Empathy Specialist NPC) makes one **Psychoanalyze (EMP) roll** per downtime phase.
- Roll against the **listed Difficulty** (default: Difficulty 2 if not specified).
- Each success completes one required phase.
- On failure, the phase is wasted but may be retried next downtime.
- The **patient cannot undertake other downtime activities** during active treatment phases.

**Format guide:**

- **"Psychoanalyze campaign (X downtime phases)"**: X rolls at Difficulty 2 (default).
- **"Psychoanalyze campaign (X downtime phases, Difficulty Y)"**: X rolls at Difficulty Y.
- **"Keep Psychoanalyze program"**: same rules, but requires a Keep Empathy Specialist NPC as the treater. Player allies cannot provide this level of care. The Empathy Specialist is a Keep Staff NPC available at HQ ([Headquarters](#chapter-headquarters)).

## Attribute Recovery {#07-attribute-recovery}

Attributes damaged during play (by physical or mental damage) recover over time. The process is separate from Corruption healing (see [Corruption and Healing](#chapter-corruption)).

::: wide
### Standard Recovery {#07-standard-recovery}

| Recovery Type | Attributes Restored | Conditions |
| ------------------------ | ------------------------------------ | ------------------------------------ |
| **Short Rest (1 Shift)** | 1 point to each damaged attribute | Must be in a safe location (no active threat, no travel). 1 Shift ≈ 4 hours. |
| **Full Downtime** | All attribute damage cleared | Between Case Files. The team returns to base, rests, and recovers fully. |
| **Medical Aid (Heal WIT check)** | +1 point per success beyond Difficulty | Difficulty 1 for basic aid (cuts, bruises); Difficulty 2 for serious wounds; Difficulty 3 for critical injuries. Requires a First Aid Kit. |
:::

### Broken Recovery {#07-broken-recovery}

An attribute at 0 (Broken state) cannot recover through rest alone. The damage is too severe.

To recover from Broken:

1. An ally must succeed on a **Heal (EMP) roll, Difficulty 2** (First Aid Kit required).
1. On success, the Broken attribute is restored to **1**. The character is no longer Broken.
1. This takes a **full Shift** and requires the character to rest without interruption.
1. Each failed Heal attempt still requires the Shift of rest before retrying.

**Night Terrors (Critical Injury result 21):** A character with Night Terrors does not benefit from Short Rest recovery for Agility damage. Recovery is halved (1 point per 2 Shifts instead of 1 per Shift) until the Critical Injury is treated.

### Infirmary (HQ Facility) {#07-infirmary-hq-facility}

The Keep's Infirmary ([HQ → Infirmary](#chapter-headquarters)) provides enhanced Short Rest recovery: **3 Attribute points** per Shift instead of 1. This is what Ch 12 means by "2 additional Attribute points beyond normal rest". The baseline 1 + 2 = 3.

## Armor Mechanics {#07-armor-mechanics}

Armor protects against **physical damage only**. When an agent suffers physical damage targeting Strength or Agility, they roll Gear Dice equal to their Armor Rating. Mental damage (targeting Wits or Empathy) and Corruption damage bypass armor entirely. No amount of Kevlar protects the psyche.

1. When you suffer physical damage, roll a number of **Gear Dice** equal to the item's **Armor Rating**.
1. Every **6** rolled absorbs **1 point** of incoming damage before it reduces your Strength.
1. **Degradation:** Armor Gear Dice **do not degrade on every armor roll**. Armor Rating decreases by 1 when: (a) the character **pushes a roll** while wearing the armor (the desperate effort strains the equipment), or (b) a **Combat Stunt or Critical Injury** specifically targets the armor. Armor uses flat AR decrement, not the Gear Die step chain used by weapons and tools. This is an exception noted in [Equipment](#chapter-equipment).

**Gear Dice cannot be pushed.** When you push a roll, you reroll all non-6 dice from your Attribute and Skill pools. Gear Dice are never rerolled. They represent equipment performance, not personal effort. If the character **pushes any roll while wearing armor**, their armor Gear Dice degrade (Armor Rating −1).

> **Unified armor rule:** Armor Rating is a flat number that decrements on qualifying events (pushes, targeted Combat Stunts, specific Critical Injuries). It does not use the Gear Die step chain (d12→d10→etc.) that weapons and tools use. See [Equipment](#chapter-equipment) for standard Gear Degradation rules.
