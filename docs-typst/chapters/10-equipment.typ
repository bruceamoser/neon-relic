// ============================================================
// CH-10: 1980s Equipment and Analog Gear
// Source: docs/chapters/10-equipment.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("10", "1980s Equipment and Analog Gear")

Covenant agents do not carry personal cash or maintain private arsenals. All
operational gear — from a pocket flashlight to a helicopter — is requisitioned
through the Covenant's Clearance Level (CL) system. Everything has a cost in
organizational trust and bureaucratic weight. Agents who treat gear as
expendable will find themselves facing an empty armory.

Gear is not just equipment. In the analog 1980s, a piece of kit represents
skill, preparation, and sometimes the only line between a successful containment
and a catastrophic breach. Treat it accordingly.

== Investigative & Paranormal Tech

#nr-table-wide(
  columns: (2fr, 4fr, 1fr, 1fr),
  [*Item*], [*Effect*], [*Enc*], [*CL*],

  [Heavy-Duty Maglite],
  [+1 die to Investigate or Scout rolls in darkness. Can also be used as an improvised weapon (Damage 1). Blinds a target for one round on a successful hit to the face (Difficulty 2).],
  [½], [1],

  [Micro-Cassette Recorder],
  [+1 die to Psychoanalyze rolls made while reviewing recordings. Can capture EVPs (Electronic Voice Phenomena) — roll Lore upon playback; a success reveals a clue the agent missed in person.],
  [½], [1],

  [Polaroid SX-70 Camera],
  [+2 dice to Lore rolls made to analyze crime scenes or paranormal evidence from physical prints. Each photo is a permanent record — GMs may use these as clue anchors.],
  [1], [2],

  [Air Ion Counter],
  [+1 die to Investigate rolls in locations with suspected supernatural activity. Functions as a rudimentary spirit detector — a spiking reading (GM call) indicates residual entity presence.],
  [1], [2],

  [Acoustic Coupler Modem],
  [+1 die to Tech rolls to access remote databases or mainframe systems via payphone. Requires a compatible phone line and 10–30 minutes per query. Fragile — Gear Die d8.],
  [1], [2],

  [P-SB7 Spirit Box Prototype],
  [+2 dice to Lore rolls made to discern entity motivations or communicate with anchored spirits. Creates significant paranormal noise — anything within earshot knows you are here.],
  [1], [3],

  [Thermal/IR Camera],
  [+2 dice to Scout rolls in darkness or obscured environments. Can spot entities that are thermally invisible to the naked eye. Requires specialized battery (d6 Resource Die).],
  [2], [4],
)

== Standard Tools & Survival

#nr-table-wide(
  columns: (2fr, 4fr, 1fr, 1fr),
  [*Item*], [*Effect*], [*Enc*], [*CL*],

  [Basic First Aid Kit],
  [+1 die to Heal rolls. Contains bandages, antiseptic, and basic wound supplies. Consumable — uses a d10 Resource Die (see Consumables).],
  [1], [1],

  [Lockpick Kit],
  [+2 dice to Sleight of Hand rolls made to pick locks or bypass simple mechanical security. Requires a minimum of 30 seconds. Useless against electronic locks.],
  [½], [2],

  [Crowbar / Bolt Cutters],
  [+2 dice to Force rolls to break open doors, padlocks, gates, or barriers. Can also serve as an improvised weapon (Damage 2, Slow action).],
  [1], [2],

  [Long-Range Walkie-Talkies (pair)],
  [Enables reliable two-way voice communication across up to 3 zones or several city blocks. Encrypted channel — not police-band interceptable without specialized gear. Requires general battery (d8).],
  [½], [2],

  [Trauma Surgical Kit],
  [+3 dice to Heal rolls for serious wounds requiring surgical intervention. Requires a stable environment — cannot be used in active combat zones. Consumable (d8 Resource Die).],
  [2], [3],
)

== 1980s Weaponry

#nr-table-wide(
  columns: (2fr, 1fr, 1fr, 1fr, 1fr, 3fr, 1fr),
  [*Weapon*], [*Gear Bonus*], [*Damage*], [*Type*], [*Range*], [*Special*], [*CL*],

  [Brass Knuckles],
  [+1], [1], [Physical (STR)], [Engaged],
  [Concealable (DC 0). Does not require a draw action.],
  [1],

  [Switchblade],
  [+1], [2], [Physical (AGI)], [Engaged],
  [Concealable (DC 0). Can be drawn as a Free Action.],
  [1],

  [Stun Gun / Taser],
  [+2], [Stun], [Stun], [Engaged],
  [On a hit, target loses their next Slow Action. No lethal damage. Requires close contact to apply.],
  [2],

  [.38 Snub-nose Revolver],
  [+2], [2], [Physical (AGI)], [Short],
  [Reliable — when pushing this weapon's attack roll, ignore the first die showing 1.],
  [2],

  [9mm Semi-Automatic Pistol],
  [+2], [2], [Physical (AGI)], [Short],
  [On 3+ successes, split damage across two targets in the same zone.],
  [3],

  [Pump-Action Shotgun],
  [+3], [3], [Physical (AGI)], [Short],
  [+1 Damage when used at Engaged range. Loud — triggers an automatic Noise alert. Bulky (counts as 2 Enc).],
  [3],

  [M16 Assault Rifle],
  [+2], [3], [Physical (AGI)], [Long],
  [Full-auto capable — may push the attack roll twice (consuming extra ammo: roll Rifle Rounds die twice on full-auto). Illegal for civilian possession.],
  [4],
)

== Armor

#nr-table-wide(
  columns: (2fr, 1fr, 3fr, 1fr),
  [*Armor*], [*AR*], [*Notes*], [*CL*],

  [Concealed Kevlar Vest],
  [3],
  [Worn under civilian clothing — passes casual inspection. Does not impose movement penalties. Standard Covenant field issue.],
  [3],

  [Tactical Riot Armor],
  [6],
  [Bulky. Imposes −2 dice to all AGI-based rolls while worn. Conspicuous — impossible to conceal, triggers immediate attention in civilian environments.],
  [4],
)

#section-rule()

== Consumables and Resource Dice

Not everything in the field is permanent. Ammunition runs out. Batteries die at
the worst possible moment. Medical supplies get used. The Covenant tracks these
consumables using *Resource Dice* — a mechanic borrowed from real-world
survival logistics.

After each scene in which a consumable was meaningfully used, roll its Resource
Die. On a *1 or 2*, the die steps down one size. When a d4 Resource Die rolls *1
or 2*, the supply is *Depleted* — gone. Cross it off.

#nr-table(
  columns: (1fr, 3fr),
  [*Die*], [*Supply Status*],
  [d12], [Abundant — freshly restocked, no concerns],
  [d10], [Well-supplied — minor use, still comfortable],
  [d8],  [Adequate — noticeable use, starting to watch it],
  [d6],  [Running Low — rationing recommended],
  [d4],  [Critical — one bad scene from empty],
  [—],   [*Depleted* — supply exhausted],
)

*Restocking:* Resource Dice are restored during the *Equipping Phase* between
cases (see Headquarters chapter). In the field, agents may resupply from a
captured enemy cache, a cooperative civilian contact, or a Covenant dead-drop
(GM discretion). A Covenant HQ medic can restore medical supplies to d10 once
per case with a successful Heal roll (Diff 1).

=== Supply Categories

#nr-table-wide(
  columns: (2fr, 1fr, 1fr, 3fr),
  [*Supply*], [*Die*], [*CL*], [*Roll Trigger*],

  [Pistol Ammo (.38 / 9mm)],
  [d10], [2],
  [Roll after any scene involving a firefight. On full-auto (9mm), roll twice.],

  [Shotgun Shells],
  [d8], [3],
  [Roll after any scene involving a firefight with the shotgun.],

  [Rifle Rounds (M16)],
  [d8], [4],
  [Roll after any scene involving an M16. On full-auto, roll twice.],

  [Basic First Aid Kit],
  [d10], [1],
  [Roll after each Heal roll that consumed supplies.],

  [Trauma Surgical Kit],
  [d8], [3],
  [Roll after any surgical Heal roll.],

  [Battery Pack (general)],
  [d8], [1],
  [Roll after any scene lasting more than 30 minutes of continuous device use.],

  [Specialized Battery],
  [d6], [3],
  [Roll after each scene of active use for high-draw devices (IR Camera, Spirit Box).],

  [Field Rations],
  [d8], [1],
  [Roll once per day on extended journeys only. Not tracked on standard operations.],

  [Artifact Components],
  [d6], [—],
  [Roll after each artifact interaction that required preparation or containment materials. Cannot be requisitioned — must be scavenged or salvaged.],
)

_Note: In-combat ammunition tracking is governed by the weapon's attack rules in
the Combat chapter. Resource Dice apply between combats and across scenes._

#section-rule()

== Encumbrance

Agents are not pack mules. Every item carried has an *Encumbrance (Enc)* value.
Armor adds its CL value to carried Enc. Exceeding your carry capacity slows you
down and impairs your ability to act.

#nr-table(
  columns: (1fr, 3fr),
  [*Enc Value*], [*Item Examples*],
  [½],  [Pocket items, folded documents, small tools, knives],
  [1],  [Standard kit, handguns, most tech gear],
  [2],  [Long arms, bulky tech, trauma kit],
  [3+], [Heavy weapons, full riot armor, crates, equipment cases],
)

*Carry Capacity:* STR × 2. An agent with STR 3 can carry up to 6 Enc without
penalty. Armor adds its CL to the total equipped Enc.

*Encumbered (over capacity):* −1 die to all STR and AGI rolls. Moving costs a
Slow Action instead of a Free Move.

*Overloaded (double capacity):* Cannot move between zones. −2 dice to STR and
AGI rolls. Dangerous in any tactical situation.

#nr-table(
  columns: (1fr, 3fr),
  [*CL*], [*Requisition Scope*],
  [1], [Standard field gear, widely available, no paperwork],
  [2], [Specialized tools, restricted items, section head sign-off],
  [3], [Rare or dangerous equipment, divisional director approval],
  [4], [Exceptional assets, Covenant Council authorization required],
)

#section-rule()

== Vehicle Rules

Vehicles are assets, not characters. They are requisitioned like any other gear
(at CL 3–4 for military or rare models) and can be damaged, repaired, or
destroyed over the course of an operation.

Every vehicle has five stats:

- *Speed:* Slow / Medium / Fast / Very Fast. Determines initiative tier in chases and base movement range.
- *AR (Armor Rating):* Reduces incoming damage from collisions, gunfire, and physical attack.
- *Reliability:* Represented as a Wear track (max 5). At 3 Wear: −1 die to all Driving rolls. At 5 Wear: vehicle stops functioning.
- *Handling:* Bonus (+) or penalty (−) dice to Driving rolls in maneuvering situations.
- *Capacity:* Maximum passengers and cargo Enc.

=== 1980s Vehicle Roster

#nr-table-wide(
  columns: (2fr, 1fr, 1fr, 1fr, 1fr, 2fr),
  [*Vehicle*], [*Speed*], [*AR*], [*Rel*], [*Hand*], [*Capacity / Notes*],

  [Ford Crown Victoria (Police Interceptor)],
  [Medium], [1], [5], [+0],
  [4 pass / 25 Enc. Government plate — police deference in most jurisdictions.],

  [Chevy Caprice Classic (Civilian Sedan)],
  [Medium], [1], [5], [+0],
  [4 pass / 25 Enc. Completely forgettable. Best vehicle for surveillance.],

  [Dodge Van / Ford Econoline],
  [Medium], [1], [4], [−1],
  [6 pass / 50 Enc cargo. Neighbors notice a van parked too long. Good equipment transport.],

  [Ford F-150 Pickup],
  [Medium], [0], [5], [+0],
  [2 pass + open bed / 40 Enc. No off-road movement penalty. Excellent rural operations vehicle.],

  [Ducati 900 SS (Motorcycle)],
  [Fast], [0], [3], [+2],
  [1 rider / 10 Enc. −2 Handling in rain or snow. Rider is exposed — no AR protection.],

  [Chevy Camaro Z28],
  [Fast], [0], [4], [+1],
  [2 pass / 10 Enc. −1 die on tight urban turns. Engine is loud — cannot tail quietly.],

  [UH-1 Huey Helicopter],
  [Very Fast], [2], [3], [−1],
  [8 pass / 30 Enc. CL 4 to requisition. Requires Covenant authorization and a licensed pilot.],

  [Cessna 172 (Light Aircraft)],
  [Very Fast], [0], [4], [−1],
  [3 pass / 15 Enc. Requires a licensed pilot and a runway (or very flat field). Slow to deploy.],

  [Zodiac Inflatable Boat],
  [Medium], [0], [4], [+0],
  [4 pass / 40 Enc cargo. Water only — cannot be used in road pursuits. Silent approach.],
)

=== Vehicle Conflict and Chase Rules

When agents pursue or flee in vehicles, the scene is resolved using a
*Contact Track* — an abstract measure of relative position between two parties.

#nr-table(
  columns: (1fr, 3fr),
  [*Position*], [*Status*],
  [1 — Rammed],   [Vehicles in direct contact. Ramming and boarding possible.],
  [2 — Close],    [Tight pursuit. Handgun fire is possible. Difficult to shake.],
  [3 — Medium],   [Standard pursuit range. All weapons usable. Default start.],
  [4 — Distant],  [Long pursuit range. Only rifles and thrown signals effective.],
  [5 — Escaped],  [Pursuit broken. Quarry has successfully evaded.],
)

*Chase Roll:* Driver rolls *Driving (WIT)* against the quarry rolling *Evasion
(AGI)* or their own Driving. Success moves the Contact Track one step in the
winner's favor.

*Speed Modifiers:* For each Speed tier faster than the opponent, a driver gains
+1 die on their Chase Roll. For each tier slower, −1 die.

*Pushing:* A driver may push their Chase Roll, but doing so adds +1 Corruption
and inflicts 1 Wear on the vehicle from reckless driving.

==== Vehicle Maneuvers

#nr-table-wide(
  columns: (1fr, 2fr, 3fr),
  [*Maneuver*], [*Requirement*], [*Effect*],

  [Ram],
  [Contact 1–2],
  [Driver rolls Driving vs. target Driving. Success: target takes Wear equal to successes. Both vehicles take 1 Wear from impact.],

  [PIT Maneuver],
  [Contact 2; Handling +1 or better],
  [Driving roll Diff 2. Success: target vehicle must roll Driving Diff 3 or spins out (Contact Track resets to 1; target loses next turn).],

  [Gunfire from Vehicle],
  [Contact 2–4],
  [Attacker rolls combat skill at −1 die (moving platform). Target AR applies. Vehicle hit: roll on Breakdown Table.],

  [Off-Road Break],
  [Any; requires suitable terrain],
  [Driver rolls Driving vs. target. Success moves Contact Track 2 steps toward Escaped. Failure: 1 Wear from rough terrain (or more on critical failure).],

  [Blending In],
  [Contact 3–5; civilian vehicle],
  [Driver rolls Infiltration (AGI) vs. target Scout. Success: quarry loses the trail entirely (Contact 5, chase ends). Failure: Contact track steps 1 closer.],
)

==== Vehicle Damage and Repair

When a vehicle takes damage (from collision, gunfire, or crash), add *Wear*
equal to the damage dealt (after AR reduction). Vehicle effects:

- *3 Wear:* −1 die to all Driving rolls.
- *4+ Wear:* Roll on the Breakdown Table immediately.
- *5 Wear:* Vehicle stops functioning — engine out, tires shredded, or similar.

*Field Repair:* A Tech roll (WIT), Diff 2, 30 minutes of work, reduces 1 Wear.
Requires a basic toolkit. An overnight garage repair fully restores Reliability.

#nr-table(
  columns: (1fr, 4fr),
  [*d6*], [*Breakdown Result*],
  [1–2], [*Total Failure.* Engine seizes or wheels lock. Vehicle is immobile. Requires shop repair (full day + parts).],
  [3–4], [*Serious Fault.* Critical system compromised (brakes, steering, electrics). −2 dice to all Driving rolls until repaired.],
  [5–6], [*Inconvenient.* Minor issue — flat tire, cracked windshield, leaking fluid. −1 die to Driving. Repairable with 15 minutes and a Junk Die.],
)

#section-rule()

== Crafting and Repair

Not every problem can be solved with a requisition form. Gear breaks. Fields
are hostile. Sometimes the nearest Covenant armory is 300 miles away and the
entity is *right here*.

Stack Division agents are the Covenant's premier field engineers — the people
who keep equipment running, improvise solutions from junk, and occasionally
build something brilliant from components that have no business working together.
But any trained agent can attempt basic repairs. Stack agents are simply *better*
at it.

*Gear Degradation recap:* Gear Dice follow the track d12 → d10 → d8 → d6 → d4
→ Broken when rolling a 1. A Broken item cannot be used until repaired. Stack
agents' *Jury-Rig* talent can restore an item to one step above Broken in a
single scene — at the cost of +1 Corruption. Formal repair rules follow.

=== Repair Rules

Repairing gear requires *time*, *parts*, and a *Craft* roll.

#nr-table(
  columns: (1fr, 3fr),
  [*Attribute*], [Wits (WIT)],
  [*Skill*],     [Craft _(Stack signature skill)_],
  [*Base Difficulty*], [Varies by condition (see table below)],
  [*Time Required*],   [Varies (see table below)],
  [*Tools Required*],  [Basic toolkit (most repairs); specialized kit for electronics/artifacts],
)

#nr-table-wide(
  columns: (2fr, 1fr, 1fr, 2fr),
  [*Condition*], [*Gear Die*], [*Repair Diff*], [*Time Required*],

  [Degraded (d10–d4)],
  [Any step below max], [1],
  [Quick Repair: 15 minutes (1 scene)],

  [Broken (non-electronic)],
  [—], [2],
  [Full Repair: 1 Shift (~4 hours)],

  [Broken (electronic / mechanical)],
  [—], [3],
  [Full Repair: 1 Shift; requires Power Tools],

  [Combat-Damaged Vehicle],
  [Reliability die], [3],
  [Full Day; requires Auto Repair kit],

  [Artifact-Adjacent Damage],
  [—], [4],
  [Requires Occult Lab or Wayfinder consult],
)

*Success:* Each success restores the Gear Die one step (up to its maximum). A
single Quick Repair roll can only ever restore to the step *above* Broken — a
Broken item must be fully repaired before it can be used again.

*Failure:* The repair attempt fails but does not make things worse.

*Complication (Pushed roll only):* A pushed Repair roll that fails delivers a
Complication roll on the Breakdown Table.

=== Parts Requirements

Every repair requires at minimum a *Junk Die* (d6 Resource Die representing
scavenged or on-hand parts). Roll the Junk Die after completing repairs:

- *3+:* Parts hold; no step-down.
- *1–2:* Parts ran short; step the Junk Die down one.
- *Junk Die Exhausted:* No spare parts of that type remain. Acquire more (see Component Sourcing below).

#nr-table-wide(
  columns: (2fr, 1fr, 3fr),
  [*Parts Category*], [*Resource Die*], [*Used For*],

  [Junk / Scrap],
  [d6],
  [Field repairs, improvised items, basic mechanical fixes],

  [Hardware Components],
  [d8],
  [Electronics, communications gear, vehicle parts],

  [Medical Supplies],
  [d10],
  [See Resource Dice table in Consumables section],

  [Specialized Parts],
  [d6],
  [High-tech, rare, or artifact-adjacent repairs only — not scavengeable],

  [Covenant Cache Parts],
  [d12],
  [HQ-supplied; best quality; no acquisition roll needed],
)

== Component Sourcing

Not everything is sitting in a Covenant armory. Field agents must scavenge,
requisition, or improvise.

=== Scavenging

When in a setting that plausibly contains usable materials (hardware store,
junkyard, abandoned building, mechanic's garage), an agent may spend a *Slow
Action* or *Free Move* to scavenge. Roll *Investigate (WIT)*, Diff 1.

- *Success:* Find d6 uses worth of Junk/Scrap (or roll on the Scavenge table below).
- *Extra Successes (2+):* Upgrade the find to Hardware Components instead of Junk.

#nr-table(
  columns: (1fr, 3fr),
  [*Scavenge Location*], [*Typical Find (d6)*],

  [Hardware / Home Improvement Store],
  [1–3: Junk; 4–5: Hardware Components; 6: Power Tools (counts as Specialized Parts)],

  [Auto Repair Shop / Junkyard],
  [1–2: Junk; 3–5: Hardware Components; 6: Vehicle-rated Specialized Parts],

  [Office Building / University],
  [1–3: Junk; 4–5: Electronics (Hardware Components); 6: Lab-grade Specialized Parts],

  [Abandoned Farmhouse / Rural Site],
  [1–4: Junk; 5: Hardware Components; 6: Firearms Parts (Hardware Components)],

  [Government / Military Facility],
  [1: Junk; 2–4: Hardware Components; 5–6: Specialized Parts],

  [Active Household],
  [1–5: Junk only; 6: Hardware Components (medical kit, power tools)],
)

=== HQ Requisition

Any non-scavengeable part (Specialized Parts, Covenant Cache Parts) requires a
Covenant requisition. Use the standard CL system. Specialized Parts have CL 3.
Covenant Cache Parts are CL 4+ and require approval from the Keep.

*Stack Advantage:* Stack Division agents treat Specialized Parts as CL 2 when
requisitioning — their workshop connections reduce red tape.

== Improvised Items

When time is short and a proper tool isn't available, agents can construct
improvised weapons and tools from scavenged materials. Improvised items function
at reduced effectiveness and carry a higher risk of failure.

=== Crafting Improvised Items

Roll *Craft (WIT)*, using the difficulty from the table below. Requires at
minimum a *Junk Die (d6)* as parts; step it down after crafting.

Improvised items begin with a *d8 Gear Die* (never start at d10 or d12 —
they're held together with duct tape and prayer).

#nr-table-wide(
  columns: (2fr, 1fr, 1fr, 4fr),
  [*Improvised Item*], [*Craft Diff*], [*Time*], [*Notes*],

  [Club / Makeshift Bludgeon],
  [1], [1 minute],
  [Damage 1, Slow. No Gear Die — it's a pipe.],

  [Shiv / Field Knife],
  [1], [5 minutes],
  [Damage 1, Fast. Gear d8. Breaks on a Gear roll of 1–2.],

  [Molotov Cocktail],
  [1], [10 minutes],
  [Blast 1, Fire. No Gear Die — single use.],

  [Improvised First Aid Kit],
  [2], [20 minutes],
  [Functions as Basic First Aid (d8 Resource Die). Gear d8.],

  [Signal Jammer],
  [2], [1 hour],
  [Blocks comms in zone. Gear d8. Electronics.],

  [Tripwire / Alarm Trap],
  [2], [30 minutes],
  [Spend; triggers on intruder entry. Single use.],

  [Garrote Wire],
  [1], [5 minutes],
  [Grapple-linked attack. No Gear Die — simple tool.],

  [Lockpick Set (crude)],
  [3], [1 hour],
  [Sleight of Hand −1 die compared to proper picks.],

  [Improvised Bug Detector],
  [3], [2 hours],
  [Detect surveillance; −1 die vs. professional gear.],

  [Field Radio Booster],
  [3], [2 hours],
  [Extend comms range by 1 zone. Gear d8. Electronics.],
)

#callout-block("NOTE", [Improvised items *cannot* be upgraded with proper parts after the fact —
once improvised, always improvised. The exception is Stack Division agents
with the *Prototyper* talent, who may treat any improvised item as fully
professional for one roll before it is destroyed.])

=== Improvised Item Failure

When a Gear Die on an improvised item comes up *1*, it does not simply degrade —
roll on the following table:

#nr-table(
  columns: (1fr, 4fr),
  [*d6*], [*Improvised Item Failure*],

  [1], [*Catastrophic Break.* Item is destroyed instantly. If a weapon, the wielder takes 1 damage.],
  [2], [*Jams or Jams Shut.* Item is unusable this scene. Can be cleared with a free action next round.],
  [3], [*Splinters / Shrapnel.* Item breaks; nearest ally in zone rolls AGI Diff 1 or takes 1 damage.],
  [4], [*Power Surge.* Electronic items: short circuit and sparks. Clear by spending a Slow Action.],
  [5], [*Reduced Function.* Item still usable but provides no bonus die (treat as no item).],
  [6], [*Quick Fix.* Roll was a near-miss — item is stable. Gear Die stays at current step.],
)

== Stack Division: Crafting Signature

Stack agents aren't just better at repairs — they have a different relationship
with gear entirely. Training in Covenant workshops, maintaining equipment under
operational conditions, and sourcing parts through a network of trusted contacts
gives Stack agents mechanical advantages no other Division matches.

#nr-table(
  columns: (2fr, 4fr),
  [*Advantage*], [*Effect*],

  [Craft Bonus],
  [Stack agents add *+1 die* to all Craft rolls (repair and improvised item creation).],

  [Faster Repairs],
  [Quick Repairs take 5 minutes instead of 15. Full Repairs take 2 hours instead of a full Shift.],

  [Parts Economy],
  [Stack agents never step down a Junk Die on a successful repair — only failed repairs consume parts.],

  [Known Contacts],
  [Once per case, a Stack agent can source *Hardware Components (d8)* without a Covenant requisition — a contact comes through.],

  [Workshop Access],
  [At HQ, Stack agents may use the Covenant Armorer facility at no additional cost, even before it is fully built. They improvise the bench themselves.],
)

#design-note([*Cross-reference:* Stack Division full description, background options, and Talents
(including _Jury-Rig_, _Prototyper_, _Duct Tape & WD-40_) are in the Divisions chapter.])
