# Bestiary {#chapter-bestiary}

The world of Project Neon Relic contains two kinds of dangerous things: **people** who have made terrible choices, and **entities** that should not exist. Understanding the difference (and knowing when you are facing which) is a field skill every Covenant agent must develop.

This chapter provides stat blocks for the most common adversaries: human factions who oppose the Covenant's work, and supernatural entities that artifacts attract, create, or summon.

## Stat Block Format {#19-stat-block-format}

Human and supernatural adversaries use the same record. Its detail depends on the threat level.

### Standard Stat Block {#19-standard-stat-block}

Record the subject’s **name, classification, faction, and threat tier**.

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| Strength | Agility | Wits | Empathy |

**Defenses.** Record Armor Rating and armor type. Record Burst Rating, usually 0 for humans.

**Skills and abilities.** List each trained skill with its rating. Give each special ability a name, trigger, and effect.

**Broken state and motivation.** Describe what happens when the adversary breaks and what it wants in this scene.

### Stat Block Notes {#19-stat-block-notes}

- **Attributes** are used exactly as PC attributes, as both dice pool maximums and health pools. When Strength reaches 0, the adversary is Broken.
- **Skills not listed** default to 0.
- **Armor Rating** functions identically to PC armor: Gear dice rolled against incoming damage.
- **Burst Rating** applies to supernatural entities and rare humans. 0 = no Corruption Burst triggered. See [Corruption and Healing](#chapter-corruption).
- **Broken State** defines what happens when the adversary's Strength hits 0.
- **Damage types** in special abilities should specify their type and target: Physical (STR or AGI), Mental (WIT or EMP), or Corruption. See [Health, Damage & Armor](#chapter-health).

### Simplified Humanoid Format {#19-simplified-humanoid-format}

Minor human adversaries (background cultists, security guards, common thugs) do not require full stat blocks. Use this shorthand:

TYPE (Threat Level: Low / Medium / High)  
STR X | AGI X | WIT X | EMP X | Armor X | Firearms X | Brawl X  
Broken State: [Flee/Surrender]  
Special: [One sentence if applicable, or "None"]

## NPC Tier Reference {#19-npc-tier-reference}

For quick reference when building encounters:

::: wide
| Tier | Label | Description | Typical Strength |
| ------------ | ------------ | ------------------------ | ------------ |
| 1 | **Grunt** | No special abilities; acts in mobs; simplified stat block | 2–3 |
| 2 | **Operative** | One special ability; acts individually; mild tactics | 3–5 |
| 3 | **Elite** | Two or more special abilities; acts strategically; has a plan | 5–7 |
| 4 | **Named Threat** | Full stat block; unique abilities; plot significance | 6–10 |
:::

> Named Threats are specific individuals (a faction leader, a bound entity with a centuries-long history) and should be developed individually rather than drawn from this reference list. The stat blocks above represent archetypes, not named antagonists.

## Human Adversaries {#19-human-adversaries}

:::: {.specimen}
### Ember Accord Cultist {#19-ember-accord-cultist}

Human / The Ember Accord / Threat: Low

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 2 | 2 | 3 |

**Skills** Force 1, Brawl 2, Sneak 2, Lore 2, Manipulate 2

**Armor** 0

**Burst** 0

**Zealot's Resolve.** The cultist does not surrender until their Strength is reduced to 1. They believe their cause makes them untouchable.

**Improvised Ritual.** Once per combat, the cultist may spend their Slow Action to attempt a Lore roll (Difficulty 3). On success, they call a fragment of an artifact's corrupting effect to their location: all agents within Near range gain +1 Corruption. On failure, the cultist takes 1 Wits damage (backlash).

**Broken State.** Zealot's Resolve delays collapse; at STR 1, one more hit Breaks them. Broken cultists either enter catatonic prayer or flee. DA's call.

**Motivation.** Protect the artifact/ritual/site. They believe you are desecrating something holy.
::::

:::: {.specimen}
### Ember Accord Cell Leader {#19-ember-accord-cell-leader}

Human / The Ember Accord / Threat: Medium

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 4 | 3 | 3 | 4 |

**Skills** Force 2, Brawl 3, Endure 2, Firearms 2, Lore 3, Manipulate 3, Command 2

**Armor** 1 (concealed vest, improvised, not rated)

**Burst** 0

**Burn the Evidence.** If the Cell Leader reaches Broken State with a ritual site or artifact nearby, they attempt one final Lore roll (Difficulty 2) to trigger a corruption discharge. On success: all within Short range gain +2 Corruption. This is not suicidal. They expect to survive. They often don't.

**Rally the Faithful.** While the Cell Leader is active, all Ember Accord Cultists in the scene gain +1 die on Brawl rolls. If the Cell Leader falls, they lose this bonus and their Broken State changes to immediate surrender or flight.

**Broken State.** Surrender. The Cell Leader is pragmatic enough to value their life over the immediate mission. They will lie during interrogation.

**Motivation.** You have interfered with something the Accord spent years preparing. They want to delay, contain, or eliminate you before word reaches the Covenant.
::::

:::: {.specimen}
### Majestic-12 (MJ-12) Strike Agent {#19-majestic-12-mj-12-strike-agent}

Human / Majestic-12 (MJ-12) / Threat: High

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 5 | 4 | 3 | 2 |

**Skills** Force 3, Brawl 3, Endure 3, Sneak 3, Firearms 4, Investigate 2, Tech 2

**Armor** 4 (Tactical Kevlar, military spec)

**Burst** 0

**Suppressive Discipline.** MJ-12 agents do not panic under mundane violence. Supernatural Corruption Burst checks are still required, but they roll with **+1 bonus die** (training).

**Tactical Communication.** If two or more MJ-12 agents are present, they act simultaneously on the same Initiative card. One card covers the team.

**Secure Extraction Protocol.** If an MJ-12 team's mission fails (artifact lost, agents dead or captured), surviving Strike Agents attempt organized withdrawal and extraction. They do not chase; they regroup. The agents will know they were seen. A debrief has already been filed.

**Broken State.** Tactical withdrawal. MJ-12 never dies on-site unnecessarily. A Broken Strike Agent calls for backup on a secure frequency as they fall. A dead man's switch. Agents have 1d6 scenes before extraction arrives.

**Motivation.** Retrieve the artifact for Project Paper Lantern. Neutralize Covenant operatives if exposed. No witnesses.
::::

:::: {.specimen art="hellfire"}
### Hellfire Consortium Blood Contractor {#19-hellfire-consortium-blood-contractor}

Human / The Hellfire Consortium / Threat: High

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 3 | 4 | 3 |

**Skills** Brawl 2, Endure 3, Sneak 2, Lore 4, Manipulate 3, Command 2

**Armor** 2 (ritual garments, treated leather with artifact weaving)

**Burst** 2 (the things they've done are visible in their eyes)

**Blood Price.** The Contractor may spend their own Strength (up to 2 per round) to fuel their abilities. Each point of Strength voluntarily spent grants them +2 dice on their next Lore roll. This does not trigger armor. They choose to bleed.

**Corruption Tap.** On a successful Lore roll (Difficulty 2), the Contractor forces one agent within Near range to gain +2 Corruption immediately.

**Bound Sigil.** The Contractor carries a ward. The first time they would be Broken, the ward absorbs it: they are reduced to STR 1 instead of 0. The ward then cracks. A physical object on their person is visibly destroyed. This happens once.

**Broken State.** Dissipation of the bound contract. The Contractor collapses and enters a catatonic state. Their blood price comes due. They cannot be easily interrogated; the contract burns out their ability to speak clearly for hours.

**Motivation.** Acquire the artifact. The Consortium has a buyer. The agents are an inconvenience that should have been avoided.
::::

:::: {.specimen art="compact"}
### Vantablack Compact Field Professional {#19-vantablack-compact-field-professional}

Human / The Vantablack Compact / Threat: High

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 5 | 4 | 3 |

**Skills** Brawl 2, Endure 2, Sneak 4, Deft Hands 3, Firearms 3, Investigate 3, Tech 2, Manipulate 3

**Armor** 1 (concealed ballistic vest)

**Burst** 0

**Counter-Surveillance.** The Field Professional immediately detects standard Covenant surveillance setups (stakeouts, tails, static observation posts). If the agents attempt an Investigate roll to surveil a Compact operative, it is opposed by the Professional's Investigate 3 (ties go to the Professional, they've done this longer than most agents have been alive).

**Sterile Exit.** When a Compact professional is Broken or their mission is compromised, they trigger a prepared extraction protocol. All physical evidence of their presence is destroyed or removed within 2d6 minutes (DA controls timing). Agents have a narrow window to secure evidence before the protocol completes. Tech (Difficulty 2) to identify the extraction route; Sneak (AGI) or Investigate (WIT) (Difficulty 3) to interrupt it.

**Non-Confrontational Default.** Compact professionals do not escalate to lethal force unless trapped. If outmaneuvered, they attempt negotiation, misdirection, or extraction. They carry suppressed sidearms but use them only to buy escape time.

**Broken State.** Tactical extraction. The Professional abandons the current operation, destroys materials, and goes to ground. They will resurface in a later Case File with knowledge of the agents' methods. A captured Compact professional will cooperate only in exchange for specific concessions (their freedom, their handler's identity protected, access to their collection returned).

**Motivation.** Acquire the artifact with minimum exposure. The Compact has a client waiting. The agents are the only variable they didn't plan for.
::::

## Supernatural Entities {#19-supernatural-entities}

:::: {.specimen}
### Echoing Remnant (Poltergeist) {#19-echoing-remnant-poltergeist}

Supernatural / Entity / Threat: Low–Medium

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 4 | 3 | 1 | 0 |

**Skills** Force 3, Sneak 3

**Armor** 2 (the force that holds the entity together)

**Burst** 2 (objects move wrong; the air gets cold)

**Incorporeal Movement.** The Remnant moves through solid objects and zone walls without cost. Zone features (Cramped, Rough) do not apply to it.

**Poltergeist (Passive).** At the start of each combat round, all loose objects in the Remnant's current zone animate. One agent in the zone takes 1 Strength damage from thrown debris (no attack roll, environmental). An agent who takes cover removes themselves from the zone effectively.

**Corruption Bleed.** When the Remnant deals damage, the target gains +1 Corruption in addition to the physical effect. The touch carries something of whatever this thing was.

**Broken State.** Dispersal. The Remnant's coherence fails; it fragments into an area of ambient cold and auditory static. It may reconstitute (DA decision) if the anchor object that binds it is not removed from the area.

**Anchor.** Every Echoing Remnant is bound to a physical object. Destroying or removing the anchor prevents reconstitution. Finding the anchor requires an Investigate roll (Difficulty 2) or Lore roll (Difficulty 3) if the anchor is concealed within a larger collection.

**Motivation.** None: Remnants do not have goals. They are a resonant impression left by violent death near an artifact. They act on the echo of their last strong emotional state.
::::

:::: {.specimen art="shard"}
### Shard Construct (Artifact Guardian) {#19-shard-construct-artifact-guardian}

Supernatural / Artifact-Spawned / Threat: High

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 8 | 3 | 2 | 0 |

**Skills** Force 5, Brawl 4, Endure 4

**Armor** 5 (crystallized occult energy from the artifact)

**Burst** 4 (wrongness of form; the geometry of it shouldn't work)

**Occult Shell.** Standard firearms deal only 1 Damage per hit against the Shard Construct regardless of weapon rating. Artifact-derived weapons, fire, or electromagnetic disruption deal full damage.

**Shard Burst (Slow Action).** The Construct fires crystallized occult shards in a cone. All agents within Near range take 2 Strength damage. Armor applies. No attack roll. The DA describes the burst; agents may spend a Fast Action to Dodge (opposed Agility roll; the attacker's successes must exceed the defender's to hit. Ties favor the defender) before it lands.

**Anchored to Artifact.** The Construct cannot move more than Long range from the artifact it protects. If the artifact is moved, the Construct follows (teleportation effect between scenes; not instant-travel within a scene).

**Falling Construct.** When the Shard Construct's Strength is reduced to 3 or lower, it enters a berserker state: it no longer uses Shard Burst (too degraded) but gains +2 dice on all Force and Brawl rolls. Its dissolution becomes imminent and it acts with total abandon.

**Broken State.** Dissolution. The Construct collapses into inert crystal fragments. The fragments are safe but fascinating to Lore scholars. The artifact it was protecting remains where it was. The Construct does not reconstitute, but similar constructs have been documented at the same artifact after 24-hour gaps.

**Motivation.** The artifact. Nothing enters its protection radius. Nothing leaves with the artifact.
::::

## Additional Supernatural Entities {#19-additional-supernatural-entities}

:::: {.specimen}
### The Mire (Psychic Contamination Zone) {#19-the-mire-psychic-contamination-zone}

Supernatural / Named Threat (Zone-Based)

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| N/A | N/A | 4 | 5 |

**STR** cannot be targeted by physical attacks

**AGI** does not move; fills a space

**EMP** uses Empathy to manipulate; passively broadcasts

**Skills** Psychoanalyze 3 (passive pressure), Manipulate 2 (hallucination-induced)

**Armor** Immune to physical damage

**Burst** 3

**Corruption cost** +1 Corruption per minute spent within it (scene = +3 total)

**Origin.** A Mire forms when intense psychological trauma fuses with corrupting artifact energy over years, a long-term infestation of a place by accumulated suffering. Hospitals, prisons, and sites of mass corruption exposure are most at risk.

**Zone Control.** The Mire occupies a defined zone (one to three
interconnected rooms). All Wits and Empathy rolls made inside the zone
are at −2 dice. Firearms and Force rolls are unaffected; the Mire does
not respond to violence.

**Memory Bleed.** At the start of each scene inside the zone, each
character witnesses an involuntary memory of the zone's traumatic origin
(DA description). Characters must pass an Endure roll (Difficulty 1) or
take 1 Wits damage.

**Dissolution Trigger.** The Mire cannot be destroyed by conventional
means. It can be dispersed by:
 (1) Removing the corrupting artifact at its core (Investigate Difficulty 3
 to locate it inside the zone, Lore Difficulty 2 to identify it
 as the anchor).
 (2) A Containment Ritual (see [Containment Rituals](#containment-rituals)) performed
 by an agent with Lore 3+, taking one full scene.
 (3) Destroying the artifact at its core (Artifact Fracture; triggers
 a Corruption spike. Everyone in the zone takes +3 Corruption).

**Broken State.** Dispersed. The zone returns to normal. Physical damage from the trauma-origin remains (stains, broken furniture, cold spots). The artifact anchor must be contained; leaving it creates a new Mire within 1d6 days.

**Motivation.** The Mire has no motivation. It is an environmental hazard with rudimentary self-preservation logic. It does not pursue; it holds.
::::

:::: {.specimen}
### The Hollow {#19-the-hollow}

Supernatural / Operative (2)

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 5 | 2 | 1 | 0 |

**AGI** sluggish, deliberate

**WIT** no autonomous thought

**Skills** Force 3, Brawl 2, Endure 3

**Armor** 1 (physical deadness reduces impact)

**Burst** 2

**Corruption cost** +1 Corruption on first sighting; +1 if recognized as someone known

**Origin.** A Hollow is a human corpse reanimated by a corrupting artifact using residual psychic impressions of the deceased. The body retains muscle memory and some learned behaviors, but there is nothing behind the eyes.

**Artifact Tether.** A Hollow is bound to a specific artifact that controls it. While within Short range of that artifact, it gains +2 dice on all rolls. If the artifact is moved more than 50 meters away, the Hollow loses all special abilities and functions as a Grunt.

**Recognition Response.** If a player character knew the deceased in life and makes eye contact with the Hollow, they must pass a Psychoanalyze or Endure roll (Difficulty 2) or take 1 Empathy damage immediately.

**Dead to Pain.** The Hollow does not bleed (no ongoing Strength loss from wounds), cannot be staggered, and ignores fatigue. It will pursue until Broken or the artifact is removed.

**Broken State.** Collapse. The body goes completely inert. The artifact that controlled it is not damaged by the Hollow's collapse, but its occult signature is now readable (Lore Difficulty 1 to identify its history).

**Motivation.** The Hollow protects the artifact, returned the artifact to its last owner, or simply pursues the last living person it was "tasked" to reach. The DA determines the simple directive at the moment of the Hollow's creation.
::::

:::: {.specimen art="listening" portrait="full"}
### The Listening {#19-the-listening}

Supernatural / Elite (3)

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 5 | 6 | 5 |

::: identification

**STR** only manifests briefly

**AGI** intangible movement

**Skills** Investigate 4, Sneak 5, Manipulate 3

**Armor** Immune to physical damage while intangible

**Burst** 2 (initially); 4 (once its nature is understood)

**Corruption cost** +2 Corruption when it speaks directly to a character

**Origin.** Formed from decades of surveillance anxiety, in a city wired by cold-war paranoia, government wiretapping, and Covenant counter-intelligence operations bleeding occult energy, The Listening coheres as an entity that **only knows how to observe and manipulate**. It does not attack physically; it attacks information.
:::

**Absolute Silence.** The Listening's presence is announced by the
sudden total cessation of ambient noise. Phones stop mid-ring. Tape
recorders erase. Radio static vanishes. Characters with Investigate 2+
notice it immediately; others need a Wits roll (Difficulty 1).

**They Know.** Once per scene, The Listening can whisper a secret about
one character to another character within Near range. The secret is
true. The character who hears it must pass a Manipulate (resisted by
Command or Endure, Difficulty 2) or immediately distrust the revealed
character for the scene.

**Wire Tap.** If a character makes a Tech roll within The Listening's zone,
The Listening gains access to all information contained in the device
used. It may use this information in the same or future scenes (DA's
discretion).

**Intangible.** The Listening cannot be harmed by physical attacks. It can
only be targeted by a Containment Ritual (see [Containment Rituals](#containment-rituals)) or destroyed by removing all
corrupted surveillance equipment from its zone of origin and performing a
Tech roll (Difficulty 3) to disrupt its signal network.

**Broken State.** Static. A burst of white noise. Every electronic device in Near range emits a single piercing tone and loses 1 Gear Bonus permanently. The Listening disperses. It may reconstitute in 1d6 days if its occult origin point is not addressed.

**Motivation.** To know everything. To use what it knows. It does not kill, but it will unravel a team from inside if left unchecked.
::::

:::: {.specimen art="wraith" portrait="full"}
### Fracture Wraith {#19-fracture-wraith}

Supernatural / Named Threat (4)

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 6 | 4 | 3 | 6 |

::: identification

**WIT** fragmented; once higher

**EMP** weaponized grief

**Skills** Psychoanalyze 4, Manipulate 4, Brawl 3 (manifested physical form)

**Armor** 3 (partially intangible)

**Burst** 4 (maximum if the Wraith wears the face of a dead teammate)

**Corruption cost** +2 Corruption on first contact; +1 each subsequent scene

**Origin.** When a Covenant agent dies during a corruption spike (their Corruption threshold exceeded at the moment of death by artifact activation or entity contact) the psychic echo of that agent does not dissipate cleanly. It **fractures**. The resulting Wraith retains the face, voice, and mannerisms of the deceased, but its core motivation has been replaced entirely by the trauma of its creation.
:::

**Familiar Face.** The Fracture Wraith appears as a dead Covenant agent. If any surviving character knew the deceased, seeing the Wraith triggers an immediate Corruption Burst (Burst Rating 4). If no character knew the deceased, it appears as a figure whose face they can't quite place: Burst Rating 2.

**Guilt Echo.** Once per scene, the Wraith can attempt a Psychoanalyze roll (opposed by the target's Wits). On success: the target relives a specific guilt memory and gains +2 Corruption immediately. The experience is indistinguishable from a genuine flashback.

**Corruption Drain.** Any character who engages the Wraith in melee gains +1 Corruption per round of direct contact, regardless of outcome.

**Memory of Skill.** The Fracture Wraith retains one skill from the deceased at their final level. The DA chooses which skill based on the dead agent's profile (e.g., a dead Firearms 3 agent becomes a Wraith with Firearms 3).

**Broken State.** Release. The Wraith dissolves in a cascade of static images (faces, file documents, artifact photographs) before going silent. The dissolution does not grant XP; experience points come from surviving and understanding, not from destroying what the Covenant failed to protect. Instead, each character who witnesses the dissolution gains a **Clarifying Vision**: the DA reveals one true fact about the artifact that created the Wraith. Its origin, its prior victim, or its Containment Truth. The corruption spike that created the Wraith is fully discharged; the location is safe from this specific entity. Every agent present gains **+1 Corruption** from witnessing the dissolution, the price of clarity.

**Motivation.** The Fracture Wraith is not the dead agent. It is the **moment of death** given form. It seeks to replicate the conditions of its creation, drawing living agents toward high-corruption situations, artifact activation, and the threshold of corruption. It doesn't know it's doing this. It believes it's trying to warn them.
::::

## Medium-Threat Adversaries {#19-medium-threat-adversaries}

The following entries fill the gap between low-tier nuisances and lethal high-tier threats. Each is designed to recur across multiple scenes without being trivially defeated or impossibly dangerous. A prepared QRT should find these adversaries challenging but survivable.

:::: {.specimen art="vessel"}
### The Vessel (Artifact-Possessed Human) {#19-the-vessel-artifact-possessed-human}

Human / Artifact-Corrupted / Threat: Medium

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 3 | 4 | 2 |

**Skills** Manipulate 3, Lore 2, Brawl 2, Endure 3

**Armor** 0

**Burst** 2

**Movement.** 1 zone / Fast Action (standard)

**Resonance Broadcast (Passive).** All characters within the same zone as the Vessel gain +1 Corruption at the start of each round. This effect persists even if the Vessel is unconscious. Only physical separation (moving to a different zone) or artifact suppression stops it.

**Artifact Reflex (+1 Corruption to Vessel).** When threatened, the artifact surges through the Vessel's body. The Vessel may make a Manipulate roll (4 dice) as a Fast Action, targeting one agent in the same zone. On success, the target experiences a flash of the artifact's origin, vivid, disorienting, painful. The target takes 1 Wits damage (mental, no armor). On 2+ successes, the target also loses their next Fast Action as they recover.

**Borrowed Resilience (Passive).** The first time the Vessel would become Broken from Strength damage, the artifact absorbs the blow. The Vessel immediately heals to STR 1 and emits a Corruption pulse: +1 Corruption to all characters within Near range. This ability triggers once only.

**Broken State.** When the Vessel is Broken, the human host collapses. The artifact resonance lingers in the body for 1d6 rounds, during this window, any agent in the same zone continues to gain +1 Corruption per round from Resonance Broadcast. After the resonance dissipates, the host is unconscious but alive. Psychoanalyze (Difficulty 2) can be attempted during downtime to begin the decontamination process.

**Motivation.** The Vessel doesn't have a unified motivation. The human and the artifact want different things. The human may beg for help, attempt to flee, or cooperate with agents who seem capable of removing the artifact. The artifact wants proximity to other artifacts, wants to be activated, and resists containment. The DA should alternate between these two drives based on stress level. The artifact takes over when the Vessel is frightened or in pain.

**DA Guidance.** Vessels are moral dilemmas, not combat encounters. The ideal resolution is containment and decontamination, not violence. If agents kill a Vessel, the human host dies. This should have narrative consequences (Standing loss, guilt, Corruption from the act). Vessels work best as recurring NPCs who appear in multiple scenes, growing more unstable as the Case File progresses and the artifact's influence deepens. Consider starting the Vessel at Stage 1 corruption in early scenes and advancing to Stage 2 by the climax.
::::

:::: {.specimen art="echo"}
### The Resonance Echo (Non-Corporeal Manifestation) {#19-the-resonance-echo-non-corporeal-manifestation}

Supernatural / Artifact-Generated / Threat: Medium

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| N/A | N/A | 5 | 4 |

**STR** incorporeal

**AGI** incorporeal

**Skills** None (the Echo does not act with intention)

**Armor** Immune to physical damage

**Burst** 3

**Movement.** Zone-locked (occupies 1–2 zones defined at creation; does not move)

**Immersion Field (Passive).** At the start of each round, all characters within the Echo's zone(s) resist the Echo's influence. This uses the same mechanic as a Corruption Burst check (Wits attribute only, no skill bonus), Difficulty 1. Failure: the character experiences the historical trauma as if they were a participant, takes 1 Wits damage and 1 Empathy damage (mental, no armor). Success: the character observes the replay from a dissociated perspective and takes no damage, but gains a fragmentary clue about the artifact's history (the DA provides one sensory detail per success, a face, a location, a spoken word, a smell).

**Corruption Bleed (Passive).** The Echo's zone is saturated with residual artifact energy. All characters within the zone gain +1 Corruption at the end of each scene spent inside the zone (not per round, per scene). Extended investigation is possible but costly.

**Escalation (Triggered).** If any character within the Echo's zone activates an artifact, uses a Division Talent, or pushes a roll, the Echo intensifies. For the remainder of the scene, Immersion Field damage increases to 2 Wits + 1 Empathy, and the Burst Rating increases to 4. The historical replay becomes more vivid and violent.

**Loop Reset (Passive).** At the end of each scene, the Echo restarts its cycle. Characters who leave the zone and return trigger the Immersion Field anew. The Echo does not tire, deplete, or weaken through repetition.

**Broken State.** The Echo cannot be Broken through damage. It is dispersed by one of three methods: 1. Identify and remove the anchor object. Every Echo is tethered to a physical object within its zone. Investigate (Difficulty 2) to locate it. Removing the object from the zone immediately disperses the Echo. 2. Containment ritual: Lore (Difficulty 2), requires knowledge of the artifact's origin event. Advances artifact Decay by +1. 3. Artifact suppression: If the source artifact is contained or neutralized, the Echo fades within 1d6 rounds.

**Motivation.** None. The Echo is not sentient, it's a scar in local reality, endlessly replaying because the artifact's energy has nowhere else to go. It cannot be reasoned with, bargained with, or intimidated. It simply is.

**DA Guidance.** Resonance Echoes are investigation puzzles, not combat encounters. The threat isn't the Echo itself (which can be avoided by leaving the zone), it's that the Echo occupies a location the agents need to access. The clues embedded in the Immersion Field make the Echo simultaneously dangerous and useful: agents who endure the replay learn about the artifact's history, which may be essential for containment. Design Echoes around specific historical events tied to the Case File's artifact. The more vivid and specific the replay, the better, don't describe "a battle" when you can describe "a woman in a blue coat being dragged from a church while snow falls through the broken roof."
::::

:::: {.specimen}
### The Collector (Artifact Hoarder) {#19-the-collector-artifact-hoarder}

Human / Artifact-Corrupted / Threat: Medium

| STR | AGI | WIT | EMP |
| --- | --- | --- | --- |
| 3 | 3 | 4 | 2 |

**Skills** Lore 4, Manipulate 3, Investigate 3, Deft Hands 3, Sneak 2, Tech 2

**Armor** 1 (artifact-warded clothing, subtle, not tactical)

**Burst** 0 (human, but deeply unsettling. See DA Guidance)

**Movement.** 1 zone / Fast Action (standard)

**Artifact Arsenal.** The Collector carries 2–3 Tier 1 artifacts and uses them tactically. Artifact activation follows standard rules (Corruption cost, Artifact Die roll), but the Collector's boosted threshold means they can afford costs that would destroy most NPCs. The DA should select artifacts from the existing catalog or create case-specific ones. Suggested loadout: one defensive artifact (sensory disruption, environmental manipulation), one information-gathering artifact (surveillance, detection), one escape artifact (concealment, misdirection). Collectors avoid combat artifacts. They survive by knowing more and leaving faster.

**Corrupted Resilience (Passive).** The Collector's Corruption threshold is 18 (far above normal, and set directly by the DA, not derived from the standard `10 + Empathy` player formula; NPCs and supernatural entities may have DA-assigned thresholds that reflect their unique nature rather than the player formula). Their current Corruption is 11–14 (deeply corrupted, well past the point where most humans would have reached catatonia). This means they exhibit visible corruption effects, electronics glitch in their presence, shadows move wrong, their speech occasionally includes words they didn't intend to say. These effects are not mechanically dangerous but provide atmosphere.

**Artifact Sense (Passive).** The Collector automatically detects active artifacts within Short range (1–2 zones). They can identify artifact tier and prior activation history by spending a Slow Action and rolling Lore (Difficulty 1). This ability does not cost Corruption, it's a consequence of prolonged exposure, not an activated power.

**Poison Knowledge (Triggered, once per scene).** If the Collector identifies an agent carrying an artifact, they may offer accurate, detailed information about the artifact's properties, risks, and history. This information is always truthful and always unsettling. The agent receiving this information must make a Corruption Burst check (Wits only, standard Burst rules), not because the Collector is frightening, but because the depth and accuracy of their knowledge implies intimate experience with forces that should have destroyed them.

**Broken State.** When Broken, the Collector collapses. Their carried artifacts remain active and may emit Corruption (Aura type, +1 Corruption per round in the same zone) until properly secured. If the Collector is killed, their personal Corruption discharges in a burst: all characters within Near range gain +2 Corruption. Recovery agents experienced with artifact handling may attempt a Lore (Difficulty 2) roll to shield against this burst, reducing it to +1.

**Motivation.** The Collector wants to keep their collection and add to it. They are not ideological. They don't want to activate artifacts for power or revelation. They want to _have_ them. Ownership is the addiction. They'll negotiate, lie, flee, and use artifacts to escape, but they won't start fights. If cornered without escape, they'll offer to trade: one artifact from their collection in exchange for their freedom and the rest. This bargain is genuine but creates a Covenant protocol violation for any agent who accepts.

**DA Guidance.** Collectors are recurring antagonists, not one-scene threats. Introduce them early in a Case File as someone who knows too much, then reveal their nature gradually. The Collector's value is that they create moral complexity: they have information the agents need, they're willing to share it (for a price), and killing them creates a Corruption burst that endangers everyone. The optimal approach (from the Covenant's perspective) is to capture the Collector, confiscate their collection, and hand them over to the Keep for long-term observation. But the Collector knows this, and they've evaded the Covenant before.

**Recurrence.** One Collector per campaign arc is sufficient. If the agents encounter the same Collector again, show how far their Corruption has advanced. Reality distorts more sharply, their fugue states deepen, and artifacts behave erratically nearby. The Collector is on a trajectory, and the agents can see where it ends.
::::

## Corrupted NPCs {#19-corrupted-npcs}

**Corrupted NPCs** are people whose Corruption has crossed into active dysfunction. They might be faction contacts, civilians, or Covenant support staff. Unlike Fracture Wraiths or Hollows, they are still alive. They still want things. But **what** they want has been bent by prolonged corruption exposure.

### Corruption Threshold and Behavior {#19-corruption-threshold-and-behavior}

The Corruption thresholds from [Corruption and Healing](#chapter-corruption) apply to NPCs as well as agents. For simplicity, the DA tracks NPC corruption with a three-stage shorthand:

::: wide
| Stage | Corruption | Behavior |
| ------------ | ------------------------ | ------------------------------------------------ |
| **0** | 0–3 | Normal. No mechanical difference from a baseline NPC. |
| **1** | 4–7 | **Distorted.** The NPC is erratic, inconsistent, prone to misreading motives. −1 die on all social skill rolls targeting them. They believe they are functioning normally. |
| **2** | 8--10 | **Compromised.** The NPC's primary goal has been replaced by the logic of a corrupting artifact. They act with genuine conviction in service of something the artifact wants. Burst Rating 1 (their behavior is uncanny and wrong). |
| **3** | 11+ | **Broken.** The NPC meets the Fracture Wraith threshold or reaches catatonia. If not Catatonic, treat as equivalent to a Hollow (see above), still moving, but no longer present. |
:::

### Running a Corrupted NPC {#19-running-a-corrupted-npc}

Corrupted NPCs are not villains in the traditional sense. They are **victims**. Consider the following when playing them:

- A Stage 1 NPC may give the players subtly wrong information, not because they are lying, but because they have stopped being able to distinguish memory from artifact-induced suggestion.
- A Stage 2 NPC may have physically altered their behavior to serve the artifact (hoarding it, protecting a building it lives in, feeding it corruption by exposing others to it).
- A Stage 2 NPC who is confronted about their behavior becomes **aggressively defensive**. They are convinced they are fine. A Psychoanalyze roll (Difficulty 3) reveals the fracture.
- A Stage 2 NPC who is successfully **separated from the artifact** for 48 hours begins to recover. A Psychoanalyze roll (Difficulty 2) can accelerate recovery. Recovery is not complete. They retain the trauma and may have acted against people they care about.

### Identifying Corruption {#19-identifying-corruption}

Detecting a Corrupted NPC in play:

- **Investigate (WIT) Difficulty 2:** Notice that the NPC's behavior is inconsistent with their established pattern.
- **Lore (WIT) Difficulty 3:** Identify the specific artifact exerting influence based on the NPC's behavioral distortions.
- **Psychoanalyze (EMP) Difficulty 2:** Confirm the NPC is compromised; learn how long it has been going on.

> **Design note:** Corrupted NPCs are the game's most human horror. The artifacts don't just corrupt agents. They reach out through anyone who gets close to them. The party's best informant may already be Stage 1. The Covenant archivist they trusted for six Case Files may have been Stage 2 for months.

## DA Monster Creation Guidelines {#19-da-monster-creation-guidelines}

Use these guidelines when building new entities for a scenario.

### Step 1: Establish Tier {#19-step-1-establish-tier}

Choose the entity's Tier from the NPC Tier Reference table. Named Threats require a narrative hook (a history, a motivation, a way they can be permanently stopped) and should appear no more than once or twice per campaign.

### Step 2: Assign Attributes {#19-step-2-assign-attributes}

Use the following baselines as starting points:

| Tier | STR | AGI | WIT | EMP |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| Grunt | 2–3 | 2–3 | 1–2 | 1–2 |
| Operative | 3–5 | 3–4 | 2–3 | 2–3 |
| Elite | 5–7 | 3–5 | 3–4 | 3–5 |
| Named Threat | 6–10 | 4–6 | 4–6 | 4–7 |

Supernatural entities may exceed these ranges in one or two Attributes to reflect their inhuman nature, but balance this against their vulnerabilities.

### Step 3: Choose a Primary Skill (and Two Secondary Skills) {#19-step-3-choose-a-primary-skill-and-two-secondary-skills}

The primary skill is what the entity **does in combat or interaction**. The secondary skills represent what it falls back on. Named Threats get three secondary skills.

### Step 4: Define Special Abilities {#19-step-4-define-special-abilities}

Limit special abilities by tier:

- Grunt: 0–1 special abilities
- Operative: 1 special ability
- Elite: 2–3 special abilities
- Named Threat: 3–5 special abilities

**Good special ability design rules:**

1. Each ability should create a **distinct tactical decision** for the players.
1. At least one ability should have **a meaningful counter** that can be discovered with a successful Lore or Investigate roll.
1. If an entity can only be hurt in a particular way, give players clues they can use to discover its vulnerability.

### Step 5: Set Burst Rating {#19-step-5-set-burst-rating}

| Rating | When to Use |
| ------------ | ------------------------------------ |
| 1 | Unsettling, wrong but not immediately dangerous (a Hollow in daylight) |
| 2 | Disturbing, genuinely threatening, supernatural in an obvious way |
| 3 | Horrifying. The sight alone causes psychological harm |
| 4 | Shattering, maximum; reserved for entities of existential scale |

### Step 6: Write the Broken State {#19-step-6-write-the-broken-state}

Every entity needs an end condition. Answer: **What does it look like when this thing stops?** What does it leave behind? Is it permanent?

### Step 7: Write the Motivation {#19-step-7-write-the-motivation}

Even mindless entities have a directive. Define it in one sentence. If you can't, the entity isn't ready yet.
