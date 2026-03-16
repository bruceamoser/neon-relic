// ============================================================
// CH-02: Creating Your Agent
// Source: docs/chapters/02-character-creation.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("02", "Creating Your Agent")

Every player in Neon Relic portrays a sworn agent of *The Verdant Covenant* — a specialist with a particular expertise, a history that brought them to this work, and a threshold for the horrors they are about to witness. Character creation follows these eleven steps in order.

#section-rule()

= Step 1: Choose Your Division

Your *Division* is your character class. It defines your role within the Covenant, your key attributes, your starting skills, and your access to supernatural Division Talents. There are four playable Divisions:

#nr-table(
  columns: (1fr, 2fr, 1fr, 2fr),
  [*Division*], [*Role*], [*CL*], [*Key Attributes*],
  [*Wayfinder*], [Research and intelligence. You find what others don't know exists.], [3], [Wits, Empathy],
  [*Recovery*], [Field retrieval. You go in and bring the artifact out.], [2], [Strength, Agility],
  [*The Keep*], [Vault security and custody. You guard what has been won.], [3], [Empathy, Wits],
  [*Stack*], [Logistics and technical support. You make sure everyone else can do their job.], [4], [Wits, Agility],
)

#callout-block("NOTE", [
  *Clearance Level (CL)* represents your seniority and authorization within the Covenant. A higher CL grants access to better gear requisitions and more sensitive intelligence. Your final CL equals your Division's base CL plus your Age Group modifier (minimum 1).
])

Read the full Division descriptions in the Divisions chapter before making your choice.

#section-rule()

= Step 2: Choose Your Department or Background

Within your Division, you have a specific background:

- *Wayfinder:* Choose a Department — _Research_ or _Counterintelligence_. Within that, choose a role (Desk Analyst or Field Analyst).
- *Recovery:* Choose an Operational Background — _Ex-Agency Operative_, _Heavy-Hitter_, or _Acquisition Specialist_.
- *The Keep:* Choose a Department — _Catalogers_, _Wardens_, or _Internal Counterintelligence_.
- *Stack:* Choose a specialty — _Quartermaster_, _Retro-Engineer_, or _Paratech Inventor_.

Your background is primarily a narrative statement — it tells you and the DA where you came from. It does not grant mechanical bonuses at creation, but it should inform which skills you prioritize.

#section-rule()

= Step 3: Choose Your Age Group and Distribute Attribute Points

Choose an *Age Group* that reflects your agent's seniority and experience. This determines your age range, attribute point pool, skill point pool (used in Step 4), and *Clearance Level modifier* — the longer you've served the Covenant, the higher your authorization.

#nr-table(
  columns: (1fr, 1fr, 1fr, 1fr, 1fr),
  [*Age Group*], [*Age Range*], [*Attribute Points*], [*Skill Points*], [*CL Modifier*],
  [*Young*], [22–28], [14], [10], [−1],
  [*Experienced*], [29–38], [13], [12], [+0],
  [*Senior*], [39–52], [12], [14], [+1],
)

Younger characters are physically sharper (more attribute points); older characters are more skilled and better connected (more skill points and higher clearance). The trade-off is real and interesting — there is no "best" choice.

Distribute your *Attribute Points* across your four core attributes. Each attribute has a minimum score of *2* and a maximum score of *5*.

#nr-table(
  columns: (1fr, 1fr, 4fr),
  [*Attribute*], [*Range*], [*Description*],
  [*Strength*], [2–5], [Physical power, endurance, and resistance to bodily harm.],
  [*Agility*], [2–5], [Reflexes, coordination, fine motor control, and speed.],
  [*Wits*], [2–5], [Perception, memory, deductive reasoning, and technical aptitude.],
  [*Empathy*], [2–5], [Charisma, social intuition, and resistance to psychological horror.],
)

#callout-block("NOTE", [
  *Division Favorite Attribute:* Each Division has one *Favorite Attribute* — the stat at the core of your agent's identity. Plan to assign 4 or 5 points there. *Wayfinder:* Wits | *Recovery:* Agility | *The Keep:* Empathy | *Stack:* Wits. Investing there is strongly recommended but not mechanically enforced.
])

#callout-block("NOTE", [
  *Attributes as Health:* Your attributes also serve as your health pools. Strength absorbs physical damage; Agility absorbs exhaustion; Wits absorbs mental horror; Empathy absorbs emotional trauma. A score of 0 in any attribute means your character is *Broken*.
])

#section-rule()

= Step 4: Distribute Skill Points

Distribute your *Skill Points* (determined by your Age Group in Step 3) across the twelve core skills. No single skill may exceed *3* at character creation.

#nr-table(
  columns: (2fr, 1fr, 2fr, 4fr),
  [*Skill*], [*Attr*], [*Starting Max*], [*Recommended Division Priority*],
  [Force], [STR], [3], [Recovery],
  [Brawl], [STR], [3], [Recovery],
  [Endure], [STR], [3], [Keep],
  [Sneak], [AGI], [3], [Recovery],
  [Sleight of Hand], [AGI], [3], [Stack],
  [Firearms], [AGI], [3], [Recovery],
  [Investigate], [WIT], [3], [Wayfinder, Stack],
  [Tech], [WIT], [3], [Wayfinder, Stack],
  [Lore], [WIT], [3], [Wayfinder, Keep],
  [Manipulate], [EMP], [3], [Wayfinder],
  [Command], [EMP], [3], [Keep],
  [Psychoanalyze], [EMP], [3], [Wayfinder, Keep],
)

#callout-block("NOTE", [
  *Unranked skills:* A skill at rating 0 means you have no formal training. You may still attempt rolls using only your Attribute Dice — there are no "untrained" restrictions.
])

#callout-block("NOTE", [
  *Division Key Skill — Starting Cap Exception:* Each Division has one designated Key Skill that may start at rating *4* instead of the normal maximum of 3. This represents professional specialization before Covenant service. You may spend up to 4 of your starting points on that skill.
])

#nr-table(
  columns: (1fr, 1fr),
  [*Division*], [*Key Skill (Starting Cap: 4)*],
  [Wayfinder], [Lore],
  [Recovery], [Firearms],
  [The Keep], [Command],
  [Stack], [Tech],
)

#section-rule()

= Step 5: Choose Your Starting Talents

At creation, every agent selects *two* talents:

- *One Division Talent* chosen from your Division's talent list (see the Divisions chapter). You may only choose from your own Division's list at creation.
- *One General Talent* chosen from the General Talents list (see the Advancement chapter). These are available to every agent regardless of Division.

Most Division Talents cost *+1 Corruption* to activate. One talent per list is a *Healing* talent, usable freely but once per session. General Talents are passive or per-session effects with no Corruption cost unless noted.

#callout-block("NOTE", [
  *Talent Advancement:* Additional talents can be purchased during play using experience points. See the Advancement chapter.
])

#section-rule()

= Step 6: Record Your Starting Statistics

Once attributes are set, note the following:

#nr-table(
  columns: (2fr, 3fr),
  [*Statistic*], [*Starting Value*],
  [*Clearance Level (CL)*], [Division base CL + Age Group modifier (minimum 1)],
  [*Corruption*], [*0* — you begin psychologically intact],
  [*Max Corruption Threshold*], [`10 + Empathy score`],
  [*Broken Thresholds*], [Any attribute reaching 0],
)

#callout-block("NOTE", [
  *Maximum Corruption Threshold* is the number at which your character's mind permanently fractures, resulting in catatonia and character retirement. This is the most important number on your sheet — protect it.
])

#section-rule()

= Step 7: Claim Your Division Item

Every agent receives their Division's *signature item* at induction. This item requires no CL check and no requisition roll — record it automatically.

#nr-table(
  columns: (1fr, 2fr, 4fr),
  [*Division*], [*Item*], [*Granted Abilities*],
  [Wayfinder], [*Verdant Codex*], [Secures memory, decodes language and symbols, maps artifact locations, preserves documents.],
  [Recovery], [*Verdant Satchel*], [Suppresses artifact aura, seals cursed items, warns of instability, produces basic tools on demand.],
  [Keep], [*Warden's Bracer*], [Suppresses artifact magic nearby, warns of containment failure, safe handling of cursed objects, absorbs 1 Corruption/session, +1 Armor Rating.],
  [Stack], [_(none)_], [Stack agents receive no Division Item, but gain +1 requisition die whenever acquiring _crafting materials_ during the Equipping Phase.],
)

#section-rule()

= Step 8: Select Starting Gear

Each agent begins with a Division-appropriate kit. Gear beyond this standard kit requires a *Clearance Level roll* during the mission's Equipping Phase.

== Wayfinder Starting Kit

- Verdant Codex _(Division Item — automatic)_
- Briefcase with research materials (notepad, pens, carbon paper)
- 35mm camera with two rolls of film
- Forged credentials (press pass, academic ID, or government contractor badge — player's choice)
- Civilian clothing (appropriate for the investigation environment)
- 1× small concealable weapon (pocket knife, derringer) _(optional, CL 3 item — already authorized)_

== Recovery Starting Kit

- Verdant Satchel _(Division Item — automatic)_
- Sidearm (.38 Special revolver or 9mm semi-automatic, 12 rounds)
- Flashlight (D-cell)
- Basic field kit: 10m rope, zip ties × 6, chalk × 2, crowbar
- Field jacket with concealed holster
- One additional item from the Equipment tables _(CL 2 or lower)_

== The Keep Starting Kit

- Warden's Bracer _(Division Item — automatic)_
- Containment kit: 1kg salt, copper wire (10m), chalk × 4, sealed glass canisters × 4
- Lore reference binder (photocopied Covenant texts on known artifact types)
- Formal attire or tactical jacket _(player's choice based on role)_
- 1× sidearm _(optional, CL 3 permitted — Wardens only)_

== Stack Starting Kit

- Personal toolkit: flathead and Phillips screwdrivers × 3, soldering iron, wire cutters, electrical tape, multimeter
- Signal jammer (prototype; 1 use before requiring repair; Gear Die d6)
- Walkie-talkies × 2 (range: ~2km, 9V battery)
- Duct tape (1 roll), WD-40
- Practical coveralls or utility vest

#section-rule()

= Step 9: Choose Your Anchor

Every agent carries an *Anchor* — a tangible, physical object tied to a core humanizing memory from before the Covenant. It connects you to the ordinary world you are fighting to protect, and it is your most reliable tool for healing Corruption.

Choose one of the following options:

- *Roll d66* on the Memento Table in the Healing chapter and accept the result as written.
- *Invent your own:* name a specific object and the memory attached to it. Run it by your DA.

Record your Anchor's name and the memory it represents on your character sheet.

#callout-block("NOTE", [
  *Mechanic:* Once per session, dedicate a scene to your Anchor — a quiet moment where you handle the object and let the memory surface. Heal *1d4 Corruption*. Full rules in the Healing chapter.
])

#section-rule()

= Step 10: Choose Your Dark Secret

Every Covenant agent harbors a *Dark Secret* — something from their past that the Covenant knows, or should know, about them. It must be specific enough that the DA can use it as a story hook when the investigation points in the right direction.

Choose one from your Division's example list in the Advancement chapter, or write your own. The XP question at session end — _"Did your Dark Secret complicate the mission?"_ — is the mechanical payoff. Full rules and Division-specific examples are in the Dark Secrets section of the Advancement chapter.

#section-rule()

= Step 11: Name, Country of Origin, and Biography

Choose a name appropriate for your campaign's 1980s setting. Record your *Country of Origin*. Then write 2–3 sentences of biography: who were you before the Covenant? What incident drew their attention? What can you not bring yourself to talk about?

#callout-block("NOTE", [
  *Country of Origin Guidance:* This is primarily narrative. Use it to inform your accent, contacts, cultural references, and how local authorities read you in the field. Do not apply mandatory mechanical modifiers.
])

#callout-block("NOTE", [
  *1980s Name Inspiration:* Choose names authentic to your character's country of origin and cultural background. British Isles: Margaret, Colin, Siobhan, Alistair. France: Isabelle, François, Nathalie, Michel. Germany: Ursula, Dieter, Heike, Jürgen. Japan: Kenji, Noriko, Takeshi, Yuki. Use surnames that fit your cultural heritage and the era — the 1980s had specific naming fashions in every country.
])

#section-rule()

= Character Sheet Summary

After completing all steps, your sheet should record:

#nr-table(
  columns: (1fr, 2fr),
  [*Field*], [*Notes*],
  [*Name / Country of Origin / Division / Department*], [Identity and role],
  [*Clearance Level*], [Division base CL + Age Group modifier (minimum 1)],
  [*Age Group / Age*], [Chosen in Step 3 (Young / Experienced / Senior)],
  [*Attributes (STR / AGI / WIT / EMP)*], [Attribute Points distributed per Age Group, 2–5 each],
  [*Skills (12)*], [Skill Points distributed per Age Group, 0–3 each],
  [*Division Talent*], [One chosen from Division list],
  [*General Talent*], [One chosen from General Talents list (Step 5)],
  [*Division Item*], [Automatic (or Stack bonus)],
  [*Starting Gear*], [Division kit ± optional items],
  [*Corruption*], [Starts at 0],
  [*Max Corruption Threshold*], [10 + Empathy],
  [*Dark Secret*], [Chosen from Division list or custom (see Advancement chapter)],
  [*Anchor*], [Object name + memory (see Healing chapter)],
)

#section-rule()

= Worked Example: Creating Petra Vasquez

The following example demonstrates a complete character build for a Recovery agent.

== Step 1–2: Division and Background

*Petra Vasquez* is a *Recovery* agent with the *Ex-Agency Operative* background. She is a former DEA field agent who recovered an artifact during what she thought was a routine drug raid — and has been in the Covenant's employ ever since.

== Step 3: Age Group and Attributes

Petra's six years in DEA field operations put her at age 34 — she selects *Experienced* (29–38), giving her *13 Attribute Points* and *12 Skill Points*.

#nr-table(
  columns: (1fr, 1fr, 1fr),
  [*Attribute*], [*Score*], [*Reasoning*],
  [Strength], [4], [Ex-agency physical conditioning],
  [Agility], [4], [Trained for fast entries; Recovery Key Attribute],
  [Wits], [3], [Sharp but not an analyst],
  [Empathy], [2], [Gets by on presence, not charm; lower threshold is a real risk],
)

_(13 points spent: 4 + 4 + 3 + 2 = 13)_

#callout-block("NOTE", [
  Max Corruption Threshold: `10 + 2 = 12`. Petra has a tighter margin than she'd like — but those attribute points went where they needed to go.
])

== Step 4: Skills (12 points)

#nr-table(
  columns: (1fr, 1fr, 1fr),
  [*Skill*], [*Rating*], [*Reasoning*],
  [Sneak], [3], [Core recovery skill; DEA background],
  [Firearms], [3], [Agency-trained; Recovery Key Skill],
  [Force], [2], [Physical entries, breaking down doors],
  [Brawl], [2], [Hand-to-hand when it comes to that],
  [Investigate], [1], [Enough to read a crime scene],
  [Endure], [1], [Agency conditioning],
)

_(12 points spent: 3 + 3 + 2 + 2 + 1 + 1 = 12. Remaining 6 skills at 0.)_

== Step 5: Starting Talents

- *Division Talent:* Petra chooses *Shadow Walker* (+1 Corruption): Become entirely imperceptible to mundane guards or cameras for a scene, provided she does not attack. This fits her infiltration background perfectly.
- *General Talent:* Petra takes *Flee the Scene* — gain +2 bonus dice to Agility when rolling explicitly to escape a conflict. A field operative who knows when to run lives longer than one who doesn't.

== Step 6: Starting Statistics

#nr-table(
  columns: (1fr, 1fr),
  [*Statistic*], [*Value*],
  [Clearance Level], [2],
  [Corruption], [0],
  [Max Corruption Threshold], [12],
)

== Steps 7–8: Division Item and Gear

Petra records the *Verdant Satchel* automatically. From the Recovery Kit she takes: .38 Special revolver (12 rounds), D-cell flashlight, field kit (rope, zip ties, chalk, crowbar), and field jacket. For her additional CL 2 item she selects a police scanner.

== Step 9: Anchor

#example-box([
  *Anchor:* A cassette tape — Los Lobos, _By the Light of the Moon_, 1987. Her brother Marco made it for her birthday. She keeps it in the inside pocket of her field jacket and hasn't listened to it since the Tucson raid.
])

== Step 10: Dark Secret

#example-box([
  *Dark Secret:* Petra's former DEA supervisor is now working for *The Vantablack Compact*. She has not reported this.
])

== Step 11: Name, Country of Origin, and Biography

- *Name:* Petra Vasquez
- *Country of Origin:* United States (California)

#example-box([
  _"Former DEA Special Agent, six years in field operations before the Tucson Incident. The Covenant found her two days after the raid. She's never asked them how they knew."_
])
