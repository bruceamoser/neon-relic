// ============================================================
// CH-13: Advancement
// Source: docs/chapters/13-advancement.adoc
// ============================================================

#import "../lib/theme.typ": *
#import "../lib/components.typ": *

#chapter-header("13", "Advancement")

== Dark Secrets

A *Dark Secret* is a specific fact from your character's past — something true, hidden, and consequential. It is not a personality flaw or a general backstory. It names something: an event, a decision, a relationship that *someone wants to remain buried*.

Dark Secrets serve two purposes in the game:

+ *Roleplay device.* They give the DA a hook. When the investigation points toward your secret — when the evidence room comes up, when the contact's name surfaces — things get complicated. That's the point.
+ *XP question.* At the end of each session, the DA asks: *"Did your Dark Secret complicate the mission?"* If yes: +1 XP. That is the entirety of the mechanical system.

There are no rules for voluntary activation, mandatory exposure, or faction consequences. If your secret surfaces, play it. Whether it surfaced because you chose to bring it in or because the DA did, the XP question applies the same way. Everything else is fiction.

#design-note([*Choosing a secret:* Pick one from your Division's example list below, or write your own. The only requirement: it must be specific enough that the DA can look at it and ask "what happens if the investigation goes _here_?"])

#section-rule()

=== Wayfinder Dark Secrets

#nr-table(
  columns: (2fr, 5fr),
  [*Secret*], [*Details*],
  [*The Fabricated Report*], [You submitted a field analysis that was false. You buried evidence linking a recovered artifact to a civilian casualty event. The truth is in a file somewhere. The file has a reference number. You know it.],
  [*The Missing Informant*], [You cultivated a civilian informant for three years — a librarian with a genuine gift for pattern recognition. When the case closed, they disappeared. You did not report them missing. You don't know what happened, but you fear you do.],
  [*Unauthorized Correspondence*], [You have been communicating with a researcher outside the Covenant — someone who reached out through channels that shouldn't exist. Their information has been accurate. You have told them more than authorized. You don't know who they work for.],
  [*The Siphoned Archive*], [You copied a restricted section of the Verdant Codex and hid the transcription in a dead drop you maintain. Your reason was professional — there were patterns in the restricted material that connected to an active case. Your superior has since died. Nobody else knows about the copy or the dead drop.],
  [*The Wrong Conclusion*], [Your analysis on the Alderman Acquisition directly caused the team to misidentify and release a contained artifact. What they released hurt three people. The official record says the release was accidental. You know it followed your recommendation.],
)

#section-rule()

=== Recovery Dark Secrets

#nr-table(
  columns: (2fr, 5fr),
  [*Secret*], [*Details*],
  [*The One You Left*], [You extracted a target from a hostile situation and got the artifact out clean. But you left someone behind who could have survived with ten more minutes. You made a judgment call. They did not make it out. They had a name. You remember it.],
  [*The Side Deal*], [You negotiated a private arrangement with a civilian who held an artifact: they handed it over, you gave them something in return. Not money — something Covenant. A name. A suppressed report. A real asset. The Covenant doesn't know the trade terms.],
  [*The Competing Employer*], [Early in your career — before the Covenant — you did contract work for a private intelligence firm. You never fully severed the relationship. They knew about you when you were recruited. You have not told anyone. At least one person at the firm knows you are Covenant now.],
  [*The Planted Evidence*], [On a recovery that was politically complicated, you placed evidence at a scene to close a civilian case that was getting too close to the truth. An innocent person was charged. The case was closed. You closed it deliberately.],
  [*The Kept Artifact*], [You found a secondary artifact on a site — smaller, overlooked. You logged the primary. The secondary is in a fireproof box in your apartment. You tell yourself you're studying it. That has been true for sixteen months. You have not told anyone.],
)

#section-rule()

=== Keep Dark Secrets

#nr-table(
  columns: (2fr, 5fr),
  [*Secret*], [*Details*],
  [*The Unauthorized Transfer*], [You moved an artifact between vault cells without clearance — you believed its listed containment protocol was incorrect. You were probably right. But the transfer created a window during which something influenced three junior staff members. The behavioural anomalies are in the health records. You signed the transfer log as routine maintenance.],
  [*The Suppressed Incident*], [Fourteen months ago, containment in your section failed briefly. Nothing escaped. But a visitor was present — a civilian consultant who should never have been in that corridor. They survived. You suppressed the incident log entry. The consultant now returns your calls with a very specific kind of urgency.],
  [*The Loyalty Debt*], [You owe a significant personal debt to someone who is a member of The Compact — the rival faction. The debt predates your Covenant service. You have not acted on it, but you have also not reported the contact. The debt is the kind that has a due date.],
  [*The Copyist*], [You maintain a personal archive — transcribed containment protocols, artifact property notes, Warden's Bracer readings — for a project you tell yourself is academic. The project is not approved. The archive exists on paper, in your handwriting, in your home. You know what happens if it's found.],
  [*The Broken Warden*], [A trainee under your supervision suffered a containment exposure event eighteen months ago. The official report says they resigned for personal reasons. They are alive, institutionalized under a false name you arranged, and the Covenant does not know they exist. You visit them every few weeks. They are getting worse.],
)

#section-rule()

=== Stack Dark Secrets

#nr-table(
  columns: (2fr, 5fr),
  [*Secret*], [*Details*],
  [*The Off-Books Supply Chain*], [You have a procurement network that the Covenant doesn't know about. It operates faster and quieter than official channels. You trust it because you built it. Two of your suppliers have connections you would struggle to explain cleanly.],
  [*The Substitution*], [When a mission-critical component was unavailable, you substituted something that looked right, worked in the moment, and was not what you logged it as. Nothing went wrong. But the mission notes, the equipment manifest, and the Covenant's records all describe gear that was not actually used.],
  [*The Blackmail File*], [You stumbled onto something about a senior Covenant official during a logistics audit. You photographed the document. You have not used it, have not shown it to anyone, have no plan to. But you kept the photograph. It is in a very safe place.],
  [*The Freelance Job*], [Before — or possibly overlapping with — your Covenant service, you completed contract work for private clients that was unambiguously not sanctioned. The work involved resources and knowledge that came from your Covenant position. You were careful. You do not think you were seen.],
  [*The Faulty Log*], [The inventory manifest for the last six months has an inconsistency — a recurring item that is always logged as consumed but which you know was not always needed. Someone above you in the logistics chain is running a parallel set of numbers. You have not reported it because you're not certain you are not also implicated.],
)

#section-rule()

== Advancement and General Talents

Experience Points (XP) are awarded at the end of each Case File through a structured debriefing. The DA asks the group a series of questions — for every "yes," each player receives *1 XP* (maximum *5 XP per session*):

#nr-table(
  columns: (1fr, 5fr),
  [*\#*], [*Debriefing Question*],
  [1], [Did you participate in the session? _(Automatic +1 XP)_],
  [2], [Did you risk your life for a fellow Covenant member or an innocent civilian?],
  [3], [Did your Dark Secret complicate the mission, or did you heavily interact with your Anchor?],
  [4], [Did the team successfully secure or contain an Occult Artifact?],
  [5], [Did you learn something new and significant about the supernatural threat or rival factions?],
)

=== Spending XP

#nr-table(
  columns: (3fr, 1fr, 2fr),
  [*Upgrade*], [*XP Cost*], [*Limit*],
  [Increase a Skill by 1], [5 XP], [Maximum rating of 5],
  [Purchase a new Talent], [6 XP], [General Talent or additional Division Talent],
  [Increase Clearance Level (CL) by 1], [3 XP], [Once per Case File; DA approval required for fiction fit],
)

Clearance increases represent institutional trust and access expansion, not just personal capability. DAs should require a fiction trigger (mission performance, formal commendation, reassignment, or political sponsorship) before the increase is finalized.

=== Worked Example: Session Debrief and CL Increase

The following shows a typical post-session debrief for *Agent Yusuf Demi*, a Keep Warden currently at Clearance Level 2 with 8 XP carried over from the previous Case File.

*The DA runs the debrief questions:*

#nr-table(
  columns: (3fr, 1fr, 2fr),
  [*Debriefing Question*], [*Answer*], [*Result*],
  [Did you participate in the session?], [Yes], [+1 XP],
  [Did you risk your life for a fellow Covenant member or an innocent civilian?], [Yes — Yusuf entered the artifact room to pull Agent Skovgaard to safety when triple-layer containment cracked.], [+1 XP],
  [Did your Dark Secret complicate the mission, or did you interact heavily with your Anchor?], [Yes — the mission contact recognised Yusuf from the unauthorised transfer incident; Yusuf had to manage that conversation while the team worked.], [+1 XP],
  [Did the team successfully secure or contain an Occult Artifact?], [Yes — the artifact reached the Keep vault intact.], [+1 XP],
  [Did you learn something new and significant about the supernatural threat or rival factions?], [No — the team already knew the artifact's provenance from prior Wayfinder reports.], [—],
)

*Result: 4 XP earned this session.* Added to 8 XP carried over: *12 XP total.*

*Yusuf's player spends XP:*

- *3 XP → Clearance Level increase (CL 2 → CL 3).* The Watch Commander issued a formal written commendation during the case closure review, explicitly noting the intact transport as mission-critical. The DA agrees this is a valid fiction trigger and approves the increase.
- *9 XP remain* for future sessions.

#design-note([*DA note:* CL increases are not automatic once the 3 XP threshold is met. A fiction trigger must exist — a commendation, a formal reassignment, or a documented mission assessment that the Covenant acknowledges. If the trigger hasn't been established in play, ask the player to name one before approving. The increase marks institutional recognition, not just personal growth.])

=== General Talents

General Talents are specialized abilities available to *any character*, providing mechanical exceptions or situational bonuses:

#nr-table(
  columns: (2fr, 4fr),
  [*Talent*], [*Effect*],
  [*Street Medic*], [Restore 2 physical Attribute points instead of 1 when successfully using Heal.],
  [*Cathartic Release* _(Healing)_], [Once per session, dedicate a moment to breaking down, screaming, or venting. Heal 1 Corruption.],
  [*Hair-Trigger*], [Draw a weapon as a free action instead of a fast action. Critical edge in ambushes.],
  [*Paranormal Intuition*], [When entering a room, roll Wits (Scout). On success, the DA must tell you if a supernatural entity has been here in the last 24 hours.],
  [*Heavy Packer*], [Carry items equal to twice your Strength without becoming encumbered.],
  [*Skeptic's Shield*], [Once per session, outright ignore a minor supernatural effect by rigidly refusing to acknowledge the impossible.],
  [*Night Owl*], [Ignore all penalties from sleep deprivation. Operate perfectly in the dark.],
  [*Chain Smoker* _(Healing)_], [Consume a scarce resource (cigarette, specific 80s junk food) during stress. Heal 1 Corruption.],
  [*Analog Junkie*], [Gain +2 Gear dice when using period-accurate 1980s technology (ham radios, acoustic couplers, microfiche).],
  [*Grit Your Teeth*], [Once per session, ignore a −1 Attribute penalty for a single critical roll.],
  [*Desensitized*], [Gain +1 bonus die to all Empathy rolls when dealing with horrific or gruesome crime scenes.],
  [*Lucky Coin*], [Once per session, ignore a 1 rolled on a Gear die, preventing item degradation.],
  [*Iron Will* _(Healing)_], [Land the killing blow or banish a supernatural threat? The rush of victory heals 1 Corruption.],
  [*Brawler*], [Unarmed strikes inflict base damage of 2 instead of 1.],
  [*Flee the Scene*], [Gain +2 bonus dice to Agility when rolling explicitly to escape a conflict.],
)
