// ============================================================
// CH-09: Covenant Divisions and Departments
// Source: docs/chapters/09-divisions.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("09", "Covenant Divisions and Departments")

In Project Neon Relic, players are sworn members of *The Verdant Covenant*. Because no single person possesses the brains, brawn, network, and magical guardianship required to hunt dangerous artifacts, players choose a *Division* (their core class) which dictates their starting attributes, skills, and Clearance Level (CL).

Within that Division, players select a *Department* background. During creation, they may select one of the 5 unique *Division Talents*. These Talents operate similarly to magic systems  -  they guarantee a supernatural or highly specialized effect but cost +1 Corruption to activate, feeding directly into the game's risk-reward loop.

#section-rule()

== Division 1: The Wayfinder

_"What is found must be known."_

The Wayfinder Division serves as the primary investigative arm of the Covenant. Wayfinders are scholars, hackers, and researchers whose directive is uncovering the existence and historical locations of lost artifacts before rival factions do. They work to assemble and preserve knowledge from historical records, archaeological reports, religious texts, folklore, academic publications, government archives, museum collections, and contemporary news reporting.

=== Wayfinder Key Stats

#nr-table(
  caption: "Wayfinder Key Stats",
  columns: (1fr, 2fr),
  [*Key Attributes*], [Wits, Empathy],
  [*Favorite Attribute*], [Wits],
  [*Key Skills*], [Investigate, Lore, Tech, Psychoanalyze],
  [*Key Skill (Cap 4 at creation)*], [Lore],
  [*Starting Clearance Level*], [3],
)

=== The Verdant Codex (Division Item)

All Wayfinders bear the *Verdant Codex*, an enchanted field journal for recording discoveries. The Codex provides the following benefits:

- Writing in the Codex secures knowledge in the memory of the author
- Maintains historical records in an organized and cataloged fashion
- Assists in decoding languages and symbols
- Automatically preserves documents placed within its pages
- Stores large scrolls without damage
- Faintly glows near ancient magic
- Contains a living map lining that slowly reveals artifact locations

=== Wayfinder Departments

*Department of Research*

The Department of Research is responsible for the discovery, documentation, and verification of artifacts. Research personnel identify artifacts before they are lost, misused, or fall into the possession of hostile actors.

- *Research Desk Analyst*  -  Focuses on research within Covenant archives and partner repositories. Studies historical documents, translates ancient texts, analyzes cultural and religious records, and monitors scholarly publications. Desk Analysts maintain artifact catalogues, cross-reference historical reports, and identify patterns indicating the presence of significant artifacts.

- *Research Field Analyst*  -  Conducts investigative work outside Covenant facilities. Visits archaeological sites, examines ruins, conducts interviews with scholars or local witnesses, and verifies Desk Analyst intelligence. Gathers firsthand observations, photographic documentation, and environmental intelligence.

#callout-block("NOTE", [
  _Research personnel do not retrieve artifacts._ Once an artifact's existence and location have been confirmed, the Department prepares a formal assessment and forwards the case to the Recovery Division.
])

*Department of Counterintelligence*

The Department of Counterintelligence protects the Covenant from external threats and preserves the secrecy of the organization's existence, operations, and holdings. The Department maintains continuous surveillance of known and emerging groups with an interest in relic acquisition, including rival secret societies, criminal networks, illicit antiquities traffickers, extremist religious movements, and private collectors.

- *Counterintelligence Desk Analyst*  -  Monitors global communications, public records, academic publications, and intelligence reports for indications that artifacts have been discovered, trafficked, or targeted. Maintains profiles of known rival organizations, tracks patterns of artifact-related activity, and compiles threat analyses.

- *Counterintelligence Field Analyst*  -  Operates outside Covenant facilities to investigate threats directly. Duties include surveillance of suspicious organizations, infiltration of groups seeking artifacts, observation of illicit antiquities markets, and disruption of activities that could expose the Covenant. Field Analysts may be authorized to engage hostiles, albeit infrequently.

#callout-block("NOTE", [
  Through the vigilance of the Department of Counterintelligence, the Covenant ensures that what is known remains contained, and that those who would misuse the past are stopped before they can act.
])

=== Wayfinder Talents (Choose 1 at Creation)

#nr-table-wide(
  caption: "Wayfinder Talents",
  columns: (2fr, 1fr, 4fr),
  [*Talent*], [*Cost*], [*Effect*],
  [*The Antiquarian's Eye*], [+1 Corruption], [Instantly identify an artifact's primary activation trigger and base effect without a Lore roll.],
  [*Ghost in the Machine*], [+1 Corruption], [Use Tech to directly interface with electronic devices jammed or possessed by anomalous entities.],
  [*The Hunch*], [+1 Corruption], [Ask the DA one yes/no question about a crime scene or NPC's motive. The DA must answer truthfully.],
  [*Academic Grounding* _(Healing)_], [ - ], [Spend an hour researching an entity and framing it in academic terms. Heal 1 Corruption for yourself or one ally.],
  [*Eldritch Empathy*], [+1 Corruption], [Sense the immediate emotional state, hunger, or primary intent of an invisible or disguised supernatural entity.],
)

#section-rule()

== Division 2: The Recovery

_"What is known must be contained."_

The Recovery Division serves as the field arm of the Verdant Covenant. Where the Wayfinders uncover knowledge and the Keep guards what has already been secured, the Recovery Division is responsible for bringing artifacts safely into Covenant custody.

Recovery agents operate in the world beyond the Covenant's halls, traveling wherever relics are rumored to exist. They investigate ruins, ancient vaults, forgotten temples, private collections, corporate archives, black markets, and the holdings of religious or political institutions. Their mandate is simple and absolute: *recover the object and return it to the Covenant.*

Recovery agents are trained to operate in a wide variety of environments. Some recover artifacts from abandoned ruins and dangerous landscapes. Others negotiate with collectors, institutions, or governments. At times, they must retrieve relics from those who knowingly misuse them or seek to exploit their power. Characters here often come from military or law enforcement backgrounds.

#callout-block("NOTE", [
  Unlike other Divisions, the Recovery Division has *no internal departments or specializations*. Every member shares the same purpose and authority. Instead, agents are distinguished by their *operational background*.
])

=== Recovery Key Stats

#nr-table(
  caption: "Recovery Key Stats",
  columns: (1fr, 2fr),
  [*Key Attributes*], [Strength, Agility],
  [*Favorite Attribute*], [Agility],
  [*Key Skills*], [Force, Brawl, Firearms, Sneak],
  [*Key Skill (Cap 4 at creation)*], [Firearms],
  [*Starting Clearance Level*], [2],
)

=== The Verdant Satchel (Division Item)

All Recovery agents carry the *Verdant Satchel*, a specially enchanted field bag designed to safely transport relics. The Satchel provides the following benefits:

- Suppresses the magical aura of items placed inside
- Warns when nearby artifacts become unstable
- Allows temporary sealing of cursed items
- Contains a small dimensional containment compartment
- Produces useful tools on demand (rope, chalk, spikes, vials, etc.)
- Enchantment of Warding obscures any magical object placed inside from detection

=== Recovery Backgrounds

Choose one background that defines your agent's prior experience:

#nr-table(
  caption: "Recovery Backgrounds",
  columns: (2fr, 4fr),
  [*Background*], [*Description*],
  [*Ex-Agency Operative*], [Former intelligence or special forces. Trained in infiltration, extraction, and covert operations.],
  [*Heavy-Hitter (Brawler)*], [Brute-force specialist. Comfortable in direct violent confrontation above all else.],
  [*Acquisition Specialist (Thief)*], [Expert in bypassing security, stealing valuable objects, and getting in and out unseen.],
)

=== Recovery Talents (Choose 1 at Creation)

#nr-table-wide(
  caption: "Recovery Talents",
  columns: (2fr, 1fr, 4fr),
  [*Talent*], [*Cost*], [*Effect*],
  [*Conditioned Mind*], [ - ], [Once per session, entirely ignore the Corruption point generated from pushing a roll.],
  [*Unstoppable Force*], [+1 Corruption], [Your next successful melee or unarmed attack inflicts +2 damage.],
  [*Shadow Walker*], [+1 Corruption], [Become entirely imperceptible to mundane guards or cameras for a scene, provided you do not attack.],
  [*Adrenaline Junkie*], [ - ], [When you have a −1 penalty to Strength, gain +2 bonus dice to all Agility rolls.],
  [*Gallows Humor* _(Healing)_], [ - ], [Once per session, after surviving a combat encounter, crack a dark joke. You and all allies who hear you heal 1d4 Corruption.],
)

#section-rule()

== Division 3: The Keep

_"What is contained must be guarded."_

The Keep serves as the custodial authority of the Verdant Covenant. Once artifacts have been recovered and delivered to Covenant custody, responsibility for their handling, documentation, containment, and protection is transferred to the Keep.

Members of the Keep are entrusted with the stewardship of the Covenant's most sensitive holdings. Their work ensures that artifacts  -  whether magical, religious, occult, or culturally significant  -  are properly cataloged, secured, and prevented from causing harm.

=== Keep Key Stats

#nr-table(
  caption: "Keep Key Stats",
  columns: (1fr, 2fr),
  [*Key Attributes*], [Empathy, Wits],
  [*Favorite Attribute*], [Empathy],
  [*Key Skills*], [Lore, Command, Endure, Heal],
  [*Key Skill (Cap 4 at creation)*], [Command],
  [*Starting Clearance Level*], [3],
)

=== The Warden's Bracer (Division Item)

All Keepers wear the *Warden's Bracer*, marking them as guardians of the Covenant's vaults. The Bracer symbolizes that the Keeper is bound to guard what others must never wield. It provides the following benefits:

- Suppresses artifact magic in close proximity
- Warns the wearer if containment fails
- Allows safe handling of cursed objects
- Absorbs Corruption (soaks 1 Corruption per session)
- Grants *+1 to Armor Rating*

=== Keep Departments

*The Department of Catalogers*

The Catalogers are responsible for the documentation, classification, and containment planning of all artifacts. Every item recovered by the Recovery Division is delivered first to the Catalogers for formal intake. They maintain the Covenant's master artifact registry  -  detailing origin, cultural context, physical properties, historical significance, and known risks for each artifact in custody.

The Department also designs containment chambers tailored to each artifact's characteristics: sealed vaults, protective casings, environmental stabilization systems, isolation chambers, or other specialized safeguards. Catalogers conduct periodic inspections to verify that artifacts remain secure and containment measures remain effective.

*The Wardens*

The Wardens serve as the defensive arm of the Keep. They are responsible for the physical protection of Covenant facilities, personnel, and artifact vaults. Primary duties include:

- Guarding headquarters, satellite facilities, and vault complexes
- Enforcing access protocols and escorting authorized personnel through sensitive areas
- Responding to security incidents
- Coordinating with Counterintelligence on infiltration threats
- Conducting field operations to disrupt hostile activities or recover stolen property when credible threats emerge

#callout-block("NOTE", [
  Through the actions of the Wardens, the Verdant Covenant ensures that what is contained remains guarded, and that those who would misuse the relics of the past are prevented from doing so.
])

*Internal Counterintelligence*

Working in coordination with the Wayfinder Division's Department of Counterintelligence, Internal CI agents investigate individuals or groups seeking to infiltrate the Covenant, steal artifacts, or expose the organization. They safeguard the Covenant's secrecy by identifying information leaks, preventing public exposure of operations, and ensuring that knowledge of sensitive artifacts remains tightly controlled.

=== Keep Talents (Choose 1 at Creation)

#nr-table-wide(
  caption: "Keep Talents",
  columns: (2fr, 1fr, 4fr),
  [*Talent*], [*Cost*], [*Effect*],
  [*Containment Protocol*], [+1 Corruption], [Quickly improvise a ward using mundane materials (salt, copper wire). Any supernatural entity must make a Hard (−2) roll to cross it.],
  [*Shield of the Covenant*], [+1 Corruption], [When an ally within Engaged range is attacked, automatically step in front of the blow. Take the damage but halve its severity.],
  [*The Inquisitor's Gaze*], [+1 Corruption], [While conversing with someone, instantly know their current Corruption score and whether they are possessed.],
  [*Sanctuary Master*], [ - ], [When inside Covenant HQ, automatically succeed on any Wits (Lore) roll regarding the history of a contained artifact.],
  [*The Confessor* _(Healing)_], [ - ], [Spend a quiet moment listening to an ally confess their Dark Secret. Both you and the ally heal *1d4 Corruption*.],
)

#section-rule()

== Division 4: Stack (Logistics)

_"Queue up, agents."_

The Department of Logistics sits organizationally within the Keep, but its unique expertise and operational independence justify its treatment as a separate playable Division. Informally known as *"Stack,"* the department is composed of technicians, quartermasters, archivists of equipment, engineers, and inventors who maintain the Covenant's stores of specialized gear.

#callout-block("NOTE", [
  *Origin of the name:* During the global espionage boom of the 1970s, younger Recovery agents began jokingly referring to Logistics as the "Q Department," a nod to the famous James Bond armorer. Given the notoriously long requisition lines outside the Logistics offices, the nickname evolved into "Queue." Over time, Covenant humor shortened it further, and the department became known as *Stack*  -  a name that has endured ever since.
])

Stack agents design, modify, and distribute the tools used by Covenant agents  -  from standard field supplies to experimental devices developed specifically for artifact recovery and containment. Though rarely leaving Covenant facilities themselves, Stack agents ensure that when Recovery teams enter the field, they do so properly equipped for whatever dangers await.

=== Stack Key Stats

#nr-table(
  caption: "Stack Key Stats",
  columns: (1fr, 2fr),
  [*Key Attributes*], [Wits, Agility],
  [*Favorite Attribute*], [Wits],
  [*Key Skills*], [Tech, Sleight of Hand, Investigate, Craft _(specialized sub-skill for building/repairing gear)_],
  [*Key Skill (Cap 4 at creation)*], [Tech],
  [*Starting Clearance Level*], [4],
)

=== Stack Departments

#nr-table(
  caption: "Stack Departments",
  columns: (2fr, 4fr),
  [*Department*], [*Description*],
  [*The Quartermaster*], [Manages the Covenant's equipment stores. Expert in acquisition, logistics, and knowing exactly what's available.],
  [*The Retro-Engineer*], [Specializes in modifying and repairing existing technology. Can coax impossible performance from aging hardware.],
  [*The Paratech Inventor*], [Designs entirely new experimental devices that blend analog technology with paranatural principles.],
)

=== Stack Talents (Choose 1 at Creation)

#nr-table-wide(
  caption: "Stack Talents",
  columns: (2fr, 1fr, 4fr),
  [*Talent*], [*Cost*], [*Effect*],
  [*Requisition Expert*], [+1 Corruption], [During the Equipping Phase, automatically acquire any one non-artifact item, bypassing the CL roll entirely.],
  [*Jury-Rig*], [+1 Corruption], [Immediately restore a broken or degraded piece of gear to maximum bonus during combat or a high-tension scene.],
  [*Prototyper*], [+1 Corruption], [Grant a piece of mundane gear an Artifact Die (d8) for a single skill roll. The item is permanently destroyed immediately after.],
  [*Duct Tape & WD-40* _(Healing)_], [ - ], [Spend a Shift at base tinkering. Automatically repair all degraded gear for the entire party without a roll, and heal 1 Corruption.],
  [*Experimental Shielding*], [+1 Corruption], [Once per session, completely ignore the degradation penalty of rolling a 1 on a Gear Die.],
)
