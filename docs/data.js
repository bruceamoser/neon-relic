// Neon Relic — Game Data
// All rules, talents, equipment, and reference data for the interactive character sheet.

const NR_DATA = {

  // ─── DIVISIONS ───────────────────────────────────────────
  divisions: {
    wayfinder: {
      name: "Wayfinder",
      motto: "What is found must be known.",
      role: "Research and intelligence. You find what others don't know exists.",
      primaryAttribute: "wits",
      keySkill: "lore",
      baseCL: 3,
      divisionItem: {
        name: "Verdant Codex",
        description: "An enchanted field journal for recording discoveries. Writing in the Codex secures knowledge in the memory of the author. Maintains historical records, assists in decoding languages and symbols, preserves documents, stores large scrolls, faintly glows near ancient magic, and contains a living map lining.",
        mechanics: [
          "Research bonus: Once per scene, when making a Lore (WIT) or Investigate (WIT) roll supported by notes you've written in the Codex, gain +1 bonus die.",
          "Lore preservation: Any Lore (WIT) roll that succeeds while using the Codex automatically records the result — the DA must confirm that the information cannot be 'forgotten' by later Corruption or injury effects."
        ]
      },
      subUnits: {
        label: "Wing",
        options: {
          research: {
            name: "Research Wing",
            description: "Discovery, documentation, and verification of artifacts.",
            specialties: ["Research Desk Analyst", "Research Field Analyst", "Research Liaison"]
          },
          counterintel: {
            name: "Counterintelligence Wing",
            description: "Protects the Covenant from external threats and preserves secrecy.",
            specialties: ["CI Desk Analyst", "CI Field Analyst", "CI Technical Analyst"]
          }
        }
      },
      startingKit: [
        "Verdant Codex (Division Item — automatic)",
        "Briefcase with research materials (notepad, pens, carbon paper)",
        "35mm camera with two rolls of film",
        "Forged credentials (press pass, academic ID, or government contractor badge — player's choice)",
        "Civilian clothing (appropriate for the investigation environment)",
        "1× small concealable weapon (pocket knife, derringer) (optional, CL 3 item — already authorized)"
      ]
    },
    recovery: {
      name: "Recovery",
      motto: "What is known must be contained.",
      role: "Field retrieval. You go in and bring the artifact out.",
      primaryAttribute: "agility",
      keySkill: "firearms",
      baseCL: 2,
      divisionItem: {
        name: "Verdant Satchel",
        description: "A specially enchanted field bag designed to safely transport relics. Suppresses magical aura, warns of instability, allows temporary sealing of cursed items, contains a small dimensional containment compartment.",
        mechanics: [
          "Aura suppression: Artifacts inside the Satchel do not emit passive Corruption to nearby characters.",
          "Instability warning: When an artifact inside approaches Volatile or Catastrophic rating, the Satchel becomes warm and vibrates.",
          "Artifact stabilization: Once per scene, delay an artifact's activation or emission by one round without a roll."
        ]
      },
      subUnits: {
        label: "Paradigm",
        options: {
          exAgency: {
            name: "Ex-Agency Operative",
            description: "Former intelligence or special forces. Trained in infiltration, extraction, and covert operations.",
            specialties: ["Handler", "Breacher", "Ghost"]
          },
          heavyHitter: {
            name: "Heavy-Hitter",
            description: "Brute-force specialist. Comfortable in direct violent confrontation.",
            specialties: ["Enforcer", "Close Protection", "Wrecker"]
          },
          acquisition: {
            name: "Acquisition Specialist",
            description: "Expert in bypassing security, stealing valuable objects, and getting in and out unseen.",
            specialties: ["Infiltrator", "Grifter", "Wheelman"]
          }
        }
      },
      startingKit: [
        "Verdant Satchel (Division Item — automatic)",
        "Sidearm (.38 Special revolver or 9mm semi-automatic, 12 rounds)",
        "Flashlight (D-cell)",
        "Basic field kit: 10m rope, zip ties × 6, chalk × 2, crowbar",
        "Field jacket with concealed holster",
        "One additional item from the Equipment tables (CL 2 or lower)"
      ]
    },
    keep: {
      name: "The Keep",
      motto: "What is contained must be guarded.",
      role: "Vault security, custody, and logistics. You guard what has been won — and equip those who win it.",
      primaryAttribute: "empathy",
      keySkill: "command",
      baseCL: 3,
      divisionItem: {
        name: "Warden's Bracer",
        description: "Marks the wearer as a guardian of the Covenant's vaults. Dampens artifact emissions, warns of containment failure, allows safe handling of cursed objects.",
        mechanics: [
          "Armor: +1 Armor Rating (applies to physical damage only).",
          "Corruption Absorption: Once per session, passively absorbs 1 point of Corruption that would be gained from any source. Does not require activation."
        ]
      },
      subUnits: {
        label: "Department",
        options: {
          catalogers: {
            name: "Catalogers",
            description: "Documentation, classification, and containment planning of all artifacts.",
            specialties: ["Intake Officer", "Archivist", "Containment Architect"]
          },
          wardens: {
            name: "Wardens",
            description: "Defensive arm of the Keep. Physical protection of facilities, personnel, and vaults.",
            specialties: ["Vault Guardian", "Escort Warden", "Field Warden"]
          },
          internalCI: {
            name: "Internal Counterintelligence",
            description: "Investigates infiltration threats, information leaks, and exposure risks.",
            specialties: ["Counter-Exposure Analyst", "Infiltration Investigator", "Vetting Officer"]
          },
          stack: {
            name: "Stack (Logistics)",
            description: "Technicians, quartermasters, engineers, and inventors who maintain the Covenant's stores of specialized gear. +1 requisition die for crafting materials.",
            specialties: ["Quartermaster", "Field Tech", "Inventor"],
            isStack: true
          }
        }
      },
      startingKit: [
        "Warden's Bracer (Division Item — automatic)",
        "Containment kit: 1kg salt, copper wire (10m), chalk × 4, sealed glass canisters × 4",
        "Lore reference binder (photocopied Covenant texts on known artifact types)",
        "Formal attire or tactical jacket (player's choice based on role)",
        "1× sidearm (optional — Wardens only; others must requisition)"
      ],
      stackKit: [
        "Warden's Bracer (Division Item — automatic)",
        "Personal toolkit: flathead and Phillips screwdrivers × 3, soldering iron, wire cutters, electrical tape, multimeter",
        "Signal jammer (prototype; 1 use before requiring repair; Gear Die d6)",
        "Walkie-talkies × 2 (range: ~2km, 9V battery)",
        "Duct tape (1 roll), WD-40",
        "Practical coveralls or utility vest"
      ]
    }
  },

  // ─── AGE GROUPS ──────────────────────────────────────────
  ageGroups: {
    young:      { name: "Young",      ageRange: "22–28", attrPoints: 14, skillPoints: 10, clMod: -1 },
    experienced:{ name: "Experienced", ageRange: "29–38", attrPoints: 13, skillPoints: 12, clMod:  0 },
    senior:     { name: "Senior",      ageRange: "39–52", attrPoints: 12, skillPoints: 14, clMod: +1 }
  },

  // ─── ATTRIBUTES ──────────────────────────────────────────
  attributes: [
    { key: "strength", name: "Strength", abbr: "STR", min: 2, max: 5,
      description: "Physical power, endurance, and resistance to bodily harm.",
      damageLabel: "Physical Damage", damageType: "Physical" },
    { key: "agility",  name: "Agility",  abbr: "AGI", min: 2, max: 5,
      description: "Reflexes, coordination, fine motor control, and speed.",
      damageLabel: "Hobbling", damageType: "Hobbling" },
    { key: "wits",     name: "Wits",     abbr: "WIT", min: 2, max: 5,
      description: "Perception, memory, deductive reasoning, and technical aptitude.",
      damageLabel: "Mental Horror", damageType: "Mental" },
    { key: "empathy",  name: "Empathy",  abbr: "EMP", min: 2, max: 5,
      description: "Charisma, social intuition, and resistance to psychological horror.",
      damageLabel: "Emotional Trauma", damageType: "Emotional" }
  ],

  // ─── SKILLS ──────────────────────────────────────────────
  skills: [
    { key: "force",        name: "Force",        attr: "strength", maxStart: 3,
      desc: "Breaking down sealed bunker doors, forcing open containment chambers." },
    { key: "brawl",        name: "Brawl",        attr: "strength", maxStart: 3,
      desc: "Hand-to-hand combat with cultists, wrestling cursed objects from hostile hands." },
    { key: "endure",       name: "Endure",       attr: "strength", maxStart: 3,
      desc: "Resisting the physical toll of harsh environments, toxic substances, or sustained injury." },
    { key: "sneak",        name: "Sneak",        attr: "agility",  maxStart: 3,
      desc: "Infiltrating corporate research facilities, bypassing analog security systems." },
    { key: "deftHands",    name: "Deft Hands",   attr: "agility",  maxStart: 3,
      desc: "Picking locks, pocketing small artifacts, disarming mechanical traps." },
    { key: "firearms",     name: "Firearms",     attr: "agility",  maxStart: 3,
      desc: "Utilizing period-accurate weaponry (.38 revolvers, pump-action shotguns)." },
    { key: "investigate",  name: "Investigate",  attr: "wits",     maxStart: 3,
      desc: "Searching crime scenes for anomalous evidence, analyzing forensic data." },
    { key: "tech",         name: "Tech",         attr: "wits",     maxStart: 3,
      desc: "Operating 1980s mainframes, hacking BBS networks, repairing analog equipment." },
    { key: "lore",         name: "Lore",         attr: "wits",     maxStart: 3,
      desc: "Decoding ancient occult texts, identifying mythological creatures and artifact origins." },
    { key: "heal",         name: "Heal",         attr: "wits",     maxStart: 3,
      desc: "Field medicine, triage, emergency stabilization, and treating physical injuries." },
    { key: "manipulate",   name: "Manipulate",   attr: "empathy",  maxStart: 3,
      desc: "Bribing informants, deceiving rivals, leveraging secrets, or extracting sensitive disclosures." },
    { key: "command",      name: "Command",      attr: "empathy",  maxStart: 3,
      desc: "Directing panicked civilians, asserting emergency authority, and coordinating team actions." },
    { key: "psychoanalyze",name: "Psychoanalyze",attr: "empathy",  maxStart: 3,
      desc: "Reading psychological states, detecting deception through behavior, and stabilizing traumatized witnesses." }
  ],

  // ─── DIVISION TALENTS ────────────────────────────────────
  divisionTalents: {
    wayfinder: [
      { name: "The Antiquarian's Eye", cost: "+1 Corruption",
        effect: "On first inspection, identify either an artifact's activation trigger or its base effect without a Lore roll." },
      { name: "Ghost in the Machine", cost: "+1 Corruption",
        effect: "Use Tech to read data from electronic devices jammed or possessed by anomalous entities, bypassing the entity's interference." },
      { name: "The Hunch", cost: "+1 Corruption",
        effect: "Ask the DA one yes/no question about a crime scene or NPC's motive. The DA must answer truthfully." },
      { name: "Academic Grounding", cost: "— (Healing)",
        effect: "Spend an hour researching an entity and framing it in academic terms. Heal 1 Corruption for yourself or one ally." },
      { name: "Eldritch Empathy", cost: "+1 Corruption",
        effect: "Sense the immediate emotional state, hunger, or primary intent of an invisible or disguised supernatural entity." }
    ],
    recovery: [
      { name: "Conditioned Mind", cost: "—",
        effect: "Declare before you push the roll. Once per session, you may push a roll and entirely ignore the +1 Corruption that pushing costs." },
      { name: "Unstoppable Force", cost: "+1 Corruption",
        effect: "Your next successful melee or unarmed attack inflicts +2 damage." },
      { name: "Shadow Walker", cost: "+1 Corruption",
        effect: "For the duration of a scene, you are entirely imperceptible to mundane guards and cameras. Attacking breaks the effect immediately." },
      { name: "Adrenaline Junkie", cost: "—",
        effect: "When your Strength has taken at least 1 point of damage, gain +2 bonus dice to all Agility rolls." },
      { name: "Gallows Humor", cost: "— (Healing)",
        effect: "Once per session, immediately after a combat encounter ends, crack a dark joke. You and all allies who can hear you heal 1d4 Corruption." },
      { name: "Combat Reflexes", cost: "—",
        effect: "When initiative cards are drawn, draw two cards and keep one. Alternatively, you may swap your initiative card with a willing ally's card." }
    ],
    keep: [
      { name: "Lockdown", cost: "+1 Corruption",
        effect: "Seal a room, corridor, or building entrance. No entity — mundane or supernatural — may pass through it for one full round without a Strength (Force) roll at Difficulty 2." },
      { name: "Threat Assessment", cost: "+1 Corruption",
        effect: "When entering a new area, instantly identify the single greatest physical threat present (hostile actor, structural weakness, hidden trap). The DA must describe it." },
      { name: "Sentinel's Vigil", cost: "— (Healing)",
        effect: "Once per session, after completing a guard shift, patrol, or escort mission without a security breach, heal 1 Corruption." },
      { name: "Hazard Classification", cost: "+1 Corruption",
        effect: "Upon first contact with an unknown artifact, instantly determine its danger rating (Inert / Active / Volatile / Catastrophic) and one primary containment requirement." },
      { name: "Registry Cross-Reference", cost: "+1 Corruption",
        effect: "Consult the master artifact registry to identify a connection between the current artifact and a previously catalogued item." }
    ]
  },

  // ─── SUB-UNIT TALENTS ────────────────────────────────────
  subUnitTalents: {
    // Wayfinder Wings
    research: [
      { name: "Pattern Recognition", cost: "+1 Corruption",
        effect: "When examining a document, site, or artifact for the first time, identify one plausible connection to a previously catalogued case." },
      { name: "Deep Archive Access", cost: "+1 Corruption",
        effect: "Spend an action consulting restricted Covenant records. Gain +2 bonus dice on your next Lore or Investigate roll this scene." },
      { name: "Methodical Review", cost: "— (Healing)",
        effect: "Spend a Shift organizing and cross-referencing your field notes. Heal 1 Corruption and grant one ally +1 bonus die on their next Investigate roll." }
    ],
    counterintel: [
      { name: "Burned Asset", cost: "+1 Corruption",
        effect: "When caught in a lie or exposed during infiltration, immediately generate a plausible cover story. The target must make an Empathy (Psychoanalyze) roll at Difficulty 2 to see through it." },
      { name: "Signal Intercept", cost: "+1 Corruption",
        effect: "Tap into a nearby communication channel (radio, phone line, intercom). For the remainder of the scene, you overhear all traffic on that channel." },
      { name: "Compartmentalized Mind", cost: "— (Healing)",
        effect: "Once per session, after completing a successful counterintelligence action (surveillance, interrogation, or exposure prevention), heal 1 Corruption." }
    ],
    // Recovery Paradigms
    exAgency: [
      { name: "Dead Drop Protocol", cost: "+1 Corruption",
        effect: "Establish an instant covert information exchange with any NPC contact. Gain one actionable piece of intelligence from the DA without a roll." },
      { name: "Exfiltration Specialist", cost: "+1 Corruption",
        effect: "When retreating or extracting under fire, you and all allies within Short range gain +1 bonus die to their next Agility roll this round." },
      { name: "Spycraft Discipline", cost: "— (Healing)",
        effect: "Once per session, after successfully completing a covert objective without being detected, heal 1 Corruption." }
    ],
    heavyHitter: [
      { name: "Wrecking Ball", cost: "+1 Corruption",
        effect: "When attacking an inanimate object or structure (door, wall, barricade, vehicle), gain +3 bonus dice to the Force roll and inflict +2 damage on a success." },
      { name: "Stand Your Ground", cost: "+1 Corruption",
        effect: "Plant yourself and refuse to move. Until your next turn, you cannot be pushed, knocked down, or forcibly moved, and you gain +2 Armor Rating." },
      { name: "Blunt Trauma Recovery", cost: "— (Healing)",
        effect: "Once per session, after winning a physical confrontation through brute force, heal 1 Corruption." }
    ],
    acquisition: [
      { name: "Ghost Entry", cost: "+1 Corruption",
        effect: "Bypass a single ordinary locked door, security system, or physical barrier without a roll. Leave no trace of entry." },
      { name: "The Long Con", cost: "+1 Corruption",
        effect: "After at least one scene spent building rapport with an NPC, gain +3 bonus dice on a Manipulate roll to extract one specific piece of information or gain one specific favor." },
      { name: "Clean Getaway", cost: "— (Healing)",
        effect: "Once per session, after successfully completing a theft, infiltration, or escape without triggering an alarm, heal 1 Corruption." }
    ],
    // Keep Departments
    catalogers: [
      { name: "Hazard Classification", cost: "+1 Corruption",
        effect: "Upon first contact with an unknown artifact, instantly determine its danger rating and one primary containment requirement — no roll needed." },
      { name: "Registry Cross-Reference", cost: "+1 Corruption",
        effect: "Consult the master artifact registry to identify a connection between the current artifact and a previously catalogued item. The DA must reveal one actionable link." },
      { name: "Archival Calm", cost: "— (Healing)",
        effect: "Spend a Shift updating the artifact registry with new findings. Heal 1 Corruption and grant one ally who contributed field data +1 bonus die on their next Lore roll." }
    ],
    wardens: [
      { name: "Lockdown", cost: "+1 Corruption",
        effect: "Seal a room, corridor, or building entrance. No entity may pass through for one full round without a Strength (Force) roll at Difficulty 2." },
      { name: "Threat Assessment", cost: "+1 Corruption",
        effect: "When entering a new area, instantly identify the single greatest physical threat present. The DA must describe it." },
      { name: "Sentinel's Vigil", cost: "— (Healing)",
        effect: "Once per session, after completing a guard shift, patrol, or escort mission without a security breach, heal 1 Corruption." }
    ],
    internalCI: [
      { name: "Silent Audit", cost: "+1 Corruption",
        effect: "Gain access to one person's recent communications, personnel file, or activity log without their knowledge. The DA must reveal one compromising or actionable detail." },
      { name: "Loyalty Test", cost: "+1 Corruption",
        effect: "During a conversation, make a concealed Empathy roll at +2 bonus dice to determine if the target is actively deceiving, withholding critical information, or operating under external influence." },
      { name: "Debriefing Protocol", cost: "— (Healing)",
        effect: "Once per session, after conducting a successful internal investigation or clearing a suspect, heal 1 Corruption." }
    ],
    stack: [
      { name: "Jury-Rig", cost: "+1 Corruption",
        effect: "Restore a Broken item to Gear Bonus 1 mid-scene. The fix is temporary — the item degrades again after the scene ends." },
      { name: "Redundant Safeties", cost: "—",
        effect: "Your Corruption threshold increases by +2 (effective threshold = 12 + Empathy instead of 10 + Empathy)." },
      { name: "Duct Tape & WD-40", cost: "— (Healing)",
        effect: "Once per session, after successfully repairing a piece of gear or equipment in the field, heal 1 Corruption." }
    ]
  },

  // ─── GENERAL TALENTS ─────────────────────────────────────
  generalTalents: [
    { name: "Street Medic", effect: "Restore 2 physical Attribute points instead of 1 when successfully using Heal (WIT).", healing: false },
    { name: "Cathartic Release", effect: "Once per session, dedicate a moment to breaking down, screaming, or venting — this must occur in a scene where you are not actively in conflict. Heal 1 Corruption.", healing: true },
    { name: "Hair-Trigger", effect: "Draw a weapon as a free action instead of a fast action. Critical edge in ambushes.", healing: false },
    { name: "Paranormal Intuition", effect: "When entering a new room or location, roll Investigate (WIT) Difficulty 1. On success, the DA must tell you if a supernatural entity has been here in the last 24 hours. This roll cannot be pushed.", healing: false },
    { name: "Heavy Packer", effect: "Your carry capacity increases to Strength × 3 Enc. (instead of the standard Strength × 2). You are not Overloaded until your Enc. exceeds Strength × 4.", healing: false },
    { name: "Skeptic's Shield", effect: "Once per session, when exposed to a minor supernatural effect, you may outright ignore it by rigidly refusing to acknowledge the impossible.", healing: false },
    { name: "Night Owl", effect: "Ignore all penalties from sleep deprivation. When operating in darkness, you treat Darkness as Dim (−1 die, not −2 dice).", healing: false },
    { name: "Chain Smoker", effect: "Consume a period-appropriate scarce resource (cigarettes, specific 1980s junk food, etc.) during a non-conflict moment. Heal 1 Corruption. The resource must actually be spent.", healing: true },
    { name: "Analog Junkie", effect: "Gain +2 bonus dice when using period-accurate 1980s technology (ham radios, acoustic couplers, microfiche, reel-to-reel).", healing: false },
    { name: "Grit Your Teeth", effect: "Once per session, ignore a −1 Attribute penalty for a single roll. Declare before rolling.", healing: false },
    { name: "Desensitized", effect: "Gain +1 bonus die on Endure (STR) or Empathy (EMP) rolls when witnessing or investigating horrific or gruesome scenes.", healing: false },
    { name: "Lucky Coin", effect: "Once per session, ignore a 1 rolled on a single Gear die, preventing item degradation. Declare after seeing the roll.", healing: false },
    { name: "Iron Will", effect: "When you personally deliver the killing blow to a Named Threat or banish a supernatural entity, heal 1 Corruption.", healing: true },
    { name: "Brawler", effect: "Unarmed strikes inflict base damage of 2 instead of 1.", healing: false },
    { name: "Flee the Scene", effect: "Gain +2 bonus dice to Agility (ATT) when rolling explicitly to escape a conflict or pursue fleeing targets.", healing: false },
    { name: "Requisition Authority", effect: "Increase your personal Clearance Level by 1 (maximum CL 5). May be purchased multiple times. Repeatable.", healing: false }
  ],

  // ─── BACKGROUND TALENTS ──────────────────────────────────
  backgroundTalents: [
    { name: "Accountant", skill: "investigate", desc: "You spent years tracking numbers, discrepancies, and hidden financial patterns." },
    { name: "Actor", skill: "manipulate", desc: "You are comfortable becoming someone else entirely, adopting personas and convincing others of your performance." },
    { name: "Amateur Astronomer", skill: "investigate", desc: "Long nights studying the skies have sharpened your patience and your ability to notice subtle anomalies." },
    { name: "Amateur Radio Operator", skill: "tech", desc: "You built and maintained your own radio equipment, speaking across the airwaves with strangers around the world." },
    { name: "Archaeologist", skill: "lore", desc: "You studied the remnants of ancient civilizations and learned to interpret artifacts buried by time." },
    { name: "Artist", skill: "investigate", desc: "Your eye for composition, pattern, and subtle detail allows you to notice things others overlook." },
    { name: "Athlete", skill: "endure", desc: "Rigorous training and competition have hardened your body and stamina." },
    { name: "Bartender", skill: "psychoanalyze", desc: "You've listened to countless confessions and learned to read people when they think no one is watching." },
    { name: "Birdwatcher", skill: "investigate", desc: "You possess extraordinary patience and observational skill developed from quietly studying wildlife." },
    { name: "Board Game Enthusiast", skill: "command", desc: "Strategic thinking and anticipating opponents' moves comes naturally to you." },
    { name: "Bodyguard", skill: "brawl", desc: "Protecting others from physical harm is your profession, and you know how to handle yourself in close quarters." },
    { name: "Bookseller", skill: "lore", desc: "Years surrounded by literature and obscure texts have broadened your knowledge." },
    { name: "Chess Grandmaster", skill: "command", desc: "You think several moves ahead and naturally direct others toward strategic goals." },
    { name: "Collector", skill: "lore", desc: "You have spent years hunting, cataloging, and preserving rare and unusual items." },
    { name: "Construction Worker", skill: "force", desc: "Heavy labor has made you strong and capable of breaking through physical barriers." },
    { name: "Cook", skill: "endure", desc: "Long hours in demanding kitchen environments have built your stamina and resilience." },
    { name: "Courier", skill: "sneak", desc: "Moving unnoticed and navigating complex urban spaces is second nature to you." },
    { name: "Detective", skill: "investigate", desc: "Solving mysteries and reconstructing events from fragments of evidence is your specialty." },
    { name: "Doctor", skill: "psychoanalyze", desc: "Treating patients has given you a keen understanding of human behavior and distress." },
    { name: "Electrician", skill: "tech", desc: "You know how to wire, repair, and safely manipulate electrical systems." },
    { name: "Engineer", skill: "tech", desc: "Your technical education allows you to understand machines, structures, and mechanical systems." },
    { name: "Factory Worker", skill: "endure", desc: "Years of repetitive, demanding labor have toughened your body." },
    { name: "Farmer", skill: "endure", desc: "You are accustomed to harsh weather, long days, and physically demanding work." },
    { name: "Firefighter", skill: "force", desc: "You are trained to break through barriers and force entry during emergencies." },
    { name: "Fisher", skill: "endure", desc: "Working long hours on the water has given you patience and resilience." },
    { name: "Food Service Professional", skill: "manipulate", desc: "You have mastered the art of dealing with difficult people while maintaining composure." },
    { name: "Gambler", skill: "deftHands", desc: "You know how to move cards, chips, and small objects without drawing attention." },
    { name: "Gardener", skill: "lore", desc: "Your knowledge of plants, natural cycles, and organic growth runs deep." },
    { name: "Hiker", skill: "endure", desc: "You are accustomed to long treks through rough terrain and difficult conditions." },
    { name: "Historian", skill: "lore", desc: "You have studied the past and understand how ancient events shape the present." },
    { name: "Journalist", skill: "investigate", desc: "Asking questions and digging for the truth is part of your nature." },
    { name: "Librarian", skill: "lore", desc: "You have spent years cataloging and studying vast collections of knowledge." },
    { name: "Locksmith", skill: "deftHands", desc: "Locks, tumblers, and mechanical security devices are familiar tools of your trade." },
    { name: "Lockpicking Hobbyist", skill: "deftHands", desc: "What began as a pastime has made you remarkably skilled with delicate mechanisms." },
    { name: "Mechanic", skill: "tech", desc: "Engines, machines, and broken equipment rarely intimidate you." },
    { name: "Metal Detectorist", skill: "investigate", desc: "You've spent countless hours searching for hidden objects beneath the earth." },
    { name: "Military Veteran", skill: "firearms", desc: "You received formal training in weapons and battlefield discipline." },
    { name: "Model Builder", skill: "tech", desc: "Constructing detailed models has taught you patience and mechanical understanding." },
    { name: "Musician", skill: "manipulate", desc: "You know how to influence the emotions of a room through performance and presence." },
    { name: "Nurse", skill: "psychoanalyze", desc: "You are accustomed to comforting the injured and calming frightened people." },
    { name: "Office Clerk", skill: "investigate", desc: "Handling paperwork and records has trained you to recognize patterns and inconsistencies." },
    { name: "Park Ranger", skill: "sneak", desc: "You are skilled at moving quietly through wilderness environments." },
    { name: "Pharmacist", skill: "lore", desc: "You understand medicines, chemicals, and their effects on the human body." },
    { name: "Photographer", skill: "investigate", desc: "You instinctively notice visual details others miss." },
    { name: "Pilot", skill: "tech", desc: "Operating complex vehicles and navigation equipment is part of your training." },
    { name: "Police Officer", skill: "firearms", desc: "You are trained in the proper use of service weapons." },
    { name: "Priest", skill: "manipulate", desc: "Your words carry moral authority and influence over others." },
    { name: "Private Investigator", skill: "investigate", desc: "Tracking people and uncovering hidden truths is your livelihood." },
    { name: "Professor", skill: "lore", desc: "Your academic background grants you extensive theoretical knowledge." },
    { name: "Sailor", skill: "endure", desc: "Life at sea has taught you to withstand difficult conditions." },
    { name: "Salesperson", skill: "manipulate", desc: "Convincing people to trust and believe you is part of your profession." },
    { name: "Scientist", skill: "investigate", desc: "You rely on observation, experimentation, and analysis." },
    { name: "Security Guard", skill: "command", desc: "You are trained to maintain order and direct people during incidents." },
    { name: "Shopkeeper", skill: "manipulate", desc: "Negotiating with customers and suppliers has sharpened your social instincts." },
    { name: "Sports Fan", skill: "command", desc: "Years of studying team strategy and leadership dynamics influence how you guide others." },
    { name: "Student", skill: "lore", desc: "Your academic studies have given you a foundation of knowledge." },
    { name: "Survivalist", skill: "endure", desc: "You train to endure extreme environments and catastrophic scenarios." },
    { name: "Taxi Driver", skill: "sneak", desc: "You know how to navigate cities and move through them without drawing attention." },
    { name: "Teacher", skill: "command", desc: "You are skilled at directing groups and keeping people focused." },
    { name: "Technician", skill: "tech", desc: "You repair and maintain specialized equipment." },
    { name: "Translator", skill: "manipulate", desc: "Understanding language nuances allows you to influence conversations and negotiations." },
    { name: "Urban Explorer", skill: "sneak", desc: "You specialize in quietly entering and navigating abandoned structures." },
    { name: "Watchmaker", skill: "deftHands", desc: "You possess remarkable dexterity working with tiny mechanical components." },
    { name: "Woodworker", skill: "force", desc: "Years of manual craftsmanship have strengthened your hands and arms." },
    { name: "Writer", skill: "investigate", desc: "Research and storytelling have sharpened your ability to uncover hidden truths." }
  ],

  // ─── EQUIPMENT ───────────────────────────────────────────
  equipment: {
    investigative: [
      { name: "Heavy-Duty Maglite", bonus: "+1 Investigate in the dark", enc: "½", cl: 1, notes: "Can act as blunt weapon (Damage 1)." },
      { name: "Micro-Cassette Recorder", bonus: "+1 Psychoanalyze", enc: "½", cl: 1, notes: "Captures EVPs (Electronic Voice Phenomena)." },
      { name: "Polaroid SX-70 Camera", bonus: "+2 Lore (crime scene study)", enc: "1", cl: 2, notes: "Produces instant evidence." },
      { name: "Air Ion Counter", bonus: "+1 Investigate", enc: "1", cl: 2, notes: "Bulky spirit detector measuring static drops." },
      { name: "Acoustic Coupler Modem", bonus: "+1 Tech", enc: "1", cl: 2, notes: "Interface with remote mainframes via payphone." },
      { name: "P-SB7 Spirit Box Prototype", bonus: "+2 Lore (deciphering entities)", enc: "1", cl: 3, notes: "Sweeps radio frequencies." },
      { name: "Thermal / Infrared Camera", bonus: "+2 Investigate (heat/cold/invisible)", enc: "2", cl: 4, notes: "Heavy early-80s tech." }
    ],
    tools: [
      { name: "Basic First Aid Kit", bonus: "+1 Heal", enc: "1", cl: 1, notes: "Bandages, antiseptics, painkillers." },
      { name: "Lockpick Kit", bonus: "+2 Deft Hands", enc: "½", cl: 2, notes: "Bypassing mechanical locks." },
      { name: "Crowbar / Bolt Cutters", bonus: "+2 Force", enc: "1", cl: 2, notes: "Breaking through chains or sealed doors." },
      { name: "Long-Range Walkie-Talkies", bonus: "Communication (few miles)", enc: "½", cl: 2, notes: "No supernatural interference." },
      { name: "Trauma Surgical Kit", bonus: "+3 Heal", enc: "2", cl: 3, notes: "Sutures, adrenaline, blood-clotting agents." }
    ],
    weapons: [
      { name: "Brass Knuckles", bonus: "+1", damage: "1", type: "Physical (STR)", range: "Engaged", cl: 1, traits: "Concealable." },
      { name: "Switchblade", bonus: "+1", damage: "2", type: "Physical (STR)", range: "Engaged", cl: 1, traits: "Concealable; puncture criticals." },
      { name: "Stun Gun / Taser", bonus: "+2", damage: "—", type: "Physical (STR)", range: "Engaged", cl: 2, traits: "No Strength damage. Target is Stunned: loses next Slow Action." },
      { name: ".38 Snub-nose Revolver", bonus: "+2", damage: "2", type: "Physical (STR)", range: "Short", cl: 2, traits: "Reliable — when pushing, ignore first 1 on Gear Die." },
      { name: "9mm Semi-Auto Pistol", bonus: "+2", damage: "2", type: "Physical (STR)", range: "Short", cl: 3, traits: "High capacity. Extra successes may hit additional targets in Engaged range." },
      { name: "Pump-Action Shotgun", bonus: "+3", damage: "3", type: "Physical (STR)", range: "Short", cl: 3, traits: "+1 Damage at Engaged range. Loud and bulky." },
      { name: "M16 Assault Rifle", bonus: "+2", damage: "3", type: "Physical (STR)", range: "Long", cl: 4, traits: "Full Auto — two-attack-roll, two-Ammo-Die procedure." }
    ],
    armor: [
      { name: "Concealed Kevlar Vest", rating: 3, enc: "1", cl: 3, notes: "Wearer passes as civilian at distance." },
      { name: "Tactical Riot Armor", rating: 6, enc: "3", cl: 4, notes: "Bulky; −2 penalty to Agility rolls." }
    ],
    vehicles: [
      { name: "Ford Crown Victoria (Government Sedan)", speed: "Medium", ar: 1, reliability: 5, handling: "+0", capacity: "4 passengers, 25 Enc.", notes: "Inconspicuous government plate. Standard Covenant pool car." },
      { name: "Chevrolet Caprice Classic", speed: "Medium", ar: 1, reliability: 5, handling: "+0", capacity: "4 passengers, 25 Enc.", notes: "Common, forgettable. The correct answer to most field transport needs." },
      { name: "Dodge Van / Econoline (Panel Van)", speed: "Medium", ar: 1, reliability: 4, handling: "−1", capacity: "6 passengers, 50 Enc.", notes: "Roomy but noticeable. Good for equipment transport." },
      { name: "Ford F-150 (Pickup Truck)", speed: "Medium", ar: 0, reliability: 5, handling: "+0", capacity: "2 cab + bed (40 Enc.)", notes: "Rural credibility. No Difficulty penalty off-road." },
      { name: "Ducati 900 SS Motorcycle", speed: "Fast", ar: 0, reliability: 3, handling: "+2", capacity: "1 rider, 10 Enc.", notes: "Best pursuit in urban terrain. −2 dice in rain/snow. Rider exposed." },
      { name: "Chevrolet Camaro Z28 (Muscle Car)", speed: "Fast", ar: 0, reliability: 4, handling: "+1", capacity: "2 passengers, 10 Enc.", notes: "Fast straight line. −1 die tight turns. Loud and memorable." }
    ]
  },

  // ─── CORRUPTION STAGES ───────────────────────────────────
  corruptionStages: [
    { min: 1, max: 3, name: "Nosebleeds / Migraines",
      effect: "Intense intracranial pressure. Occasional bleeding and severe headaches. The character maintains control." },
    { min: 4, max: 6, name: "Auditory Hallucinations",
      effect: "Distinct whispers from the void. Once per session, DA may require Wits roll (Diff 1) to distinguish real from imagined." },
    { min: 7, max: 9, name: "Eldritch Tremors",
      effect: "−1 die on Deft Hands and Firearms rolls. Visible tremors: NPCs and allies may notice." },
    { min: 10, max: 12, name: "Reality Distortion",
      effect: "Electronic Gear Dice degrade one step at start of each scene. Allies in same zone gain +1 Corruption at start of each scene." },
    { min: 13, max: 14, name: "Fugue States",
      effect: "At start of each scene, DA rolls d6. On 1–2, character enters brief fugue (DA controls character for one round)." },
    { min: 15, max: 17, name: "Collapse of Self",
      effect: "−1 die on all social skill rolls. Character speaks in third person, loses track of memories." },
    { min: 99, max: 99, name: "Catatonic Revelation",
      effect: "Permanent catatonic state. Character immediately removed from campaign." }
  ],

  // ─── ANCHOR SOURCES ──────────────────────────────────────
  anchorSources: [
    { roll: "11–16", category: "Faith / Spirituality",
      examples: "Prayer (any tradition). Lighting a candle for the dead. Reading scripture. Meditation with rosary beads. Visiting a church, mosque, or temple." },
    { roll: "21–22", category: "Physical Exertion",
      examples: "Running laps. Push-ups until the shaking stops. Boxing a heavy bag. Swimming. The body takes over when the mind won't stop." },
    { roll: "23–24", category: "Music / Art",
      examples: "Playing guitar in the motel room. Sketching in a field journal. Singing — badly, alone, in the car. Listening to a specific album." },
    { roll: "25–26", category: "A Person",
      examples: "Calling your mother. Writing a letter to your daughter that you'll never send. Sitting with a teammate who doesn't need to talk." },
    { roll: "31–32", category: "Routine / Ritual",
      examples: "Cleaning and maintaining your weapon. Cooking a specific meal. Ironing your shirt. The ritual matters because it's the same every time." },
    { roll: "33–34", category: "Logic / Rationalization",
      examples: "Writing out what happened in clinical language. Diagramming cause-and-effect until it makes sense." },
    { roll: "35–36", category: "Substance",
      examples: "A drink. A cigarette. Something stronger. It works in the short term. The DA may eventually ask what happens when it stops working." },
    { roll: "41–42", category: "Nature / Solitude",
      examples: "Sitting outside at 3 AM. Watching the sunrise. Finding a park, a river, a patch of sky with no buildings." },
    { roll: "43–44", category: "Animals",
      examples: "A stray cat that lives behind the motel. A dog you kept from a case. Feeding pigeons. Animals don't know what you've seen." },
    { roll: "45–46", category: "Writing / Journaling",
      examples: "A private journal. Poetry nobody reads. Letters to someone who won't write back. The act of putting it into words." },
    { roll: "51–52", category: "Games / Puzzles",
      examples: "A Rubik's Cube. Crosswords. Chess by mail. Solitaire with a real deck. Something with rules and solutions." },
    { roll: "53–54", category: "Memory / Nostalgia",
      examples: "Looking at photographs. Holding a keepsake. Replaying a specific moment — a birthday, a last good day." },
    { roll: "55–56", category: "Humor / Connection",
      examples: "Telling jokes — bad ones, dark ones. Making someone laugh. Being around people who don't know what you do." },
    { roll: "61–62", category: "Service / Helping",
      examples: "Fixing something for a stranger. Volunteering. Doing something kind that has nothing to do with the Covenant." },
    { roll: "63–64", category: "Professional Craft",
      examples: "Working with your hands — carpentry, electronics, mechanics. Building something that stays fixed." },
    { roll: "65–66", category: "Denial / Compartmentalization",
      examples: "Refusing to think about it. Going to a bar and watching the game. Not healthy, but functional. For now." }
  ],

  // ─── BURST RATINGS ───────────────────────────────────────
  burstRatings: [
    { rating: 1, threat: "Unsettling", examples: "A shadow that moves wrong. A sound that shouldn't exist. A photograph with an extra figure." },
    { rating: 2, threat: "Disturbing", examples: "A possessed civilian. A minor entity (shadow-form, bound spirit). A fresh, inexplicably ritualistic death scene." },
    { rating: 3, threat: "Horrifying", examples: "A mid-tier entity fully manifested. An artifact consuming a living person. A Covenant vault breach in progress." },
    { rating: 4, threat: "Shattering", examples: "A major entity (ancient, named, deliberate). An artifact performing an impossible act of scale." },
    { rating: 5, threat: "Annihilating", examples: "A Class-5 entity. A tear in physical space. Direct contact with whatever the artifacts are for." }
  ],

  // ─── PANIC TABLE ─────────────────────────────────────────
  panicTable: [
    { roll: 1, response: "Fight", effect: "Attack nearest creature (ally or foe) with bare hands. Single Brawl attack. Ends after one strike." },
    { roll: 2, response: "Flight", effect: "Run at maximum speed (2 zones/round) away from the source for 1d6 rounds. Drop held items." },
    { roll: 3, response: "Freeze", effect: "Paralyzed. Cannot move, speak, or act. Ally can snap you out with Psychoanalyze (Diff 1)." },
    { roll: 4, response: "Denial", effect: "Treat the supernatural as mundane for rest of scene. Cannot acknowledge entity as real." },
    { roll: 5, response: "Compulsion", effect: "Locked in repetitive behavior. Cannot take meaningful action until ally Psychoanalyze (Diff 2) frees you." },
    { roll: 6, response: "Fugue", effect: "DA takes character sheet. DA narrates character for rest of scene. Player regains control next scene." }
  ],

  // ─── SKILL STUNTS (abbreviated) ──────────────────────────
  stunts: {
    force: [
      { cost: 1, name: "Controlled Break", effect: "Force open without damaging contents or triggering adjacent mechanisms." },
      { cost: 1, name: "Intimidating Display", effect: "One NPC must make a Corruption Burst (BR 1) or comply with your next simple demand." },
      { cost: 2, name: "Clear the Room", effect: "A shove, flip, or sweep clears all loose objects from the zone simultaneously." }
    ],
    brawl: [
      { cost: 1, name: "Stay Down", effect: "Target cannot stand up until start of your next turn." },
      { cost: 1, name: "Weapon Strike", effect: "Target suffers −1 die on all attack rolls until end of round." },
      { cost: 2, name: "Neck Crank", effect: "Target is immediately Grappled without requiring a separate maneuver roll." }
    ],
    endure: [
      { cost: 1, name: "Grind Through", effect: "Ignore one penalty on your next roll." },
      { cost: 1, name: "Inspire", effect: "One ally in the scene recovers 1 point of Agility." },
      { cost: 2, name: "Unfazed", effect: "Take no Agility damage from whatever triggered the roll." }
    ],
    sneak: [
      { cost: 1, name: "Shadow Step", effect: "Take one additional move action without breaking stealth." },
      { cost: 1, name: "Identify Exit", effect: "+2 dice on any Sneak roll to leave this location later this scene." },
      { cost: 2, name: "Ghost Pass", effect: "Passage through this location leaves zero physical trace." }
    ],
    deftHands: [
      { cost: 1, name: "Undetected", effect: "Target of pick-pocket/lift/plant does not notice even after the scene ends." },
      { cost: 1, name: "Speed Lock", effect: "Open a lock in seconds. No time resource consumed." },
      { cost: 2, name: "Perfect Plant", effect: "Plant an item on a target so that subsequent investigation treats it as their possession." }
    ],
    firearms: [
      { cost: 1, name: "Aimed Shot", effect: "Shot hits exactly the intended location (specific limb, lock, cable, tire)." },
      { cost: 1, name: "Suppression", effect: "Target pinned behind cover until start of your next turn." },
      { cost: 2, name: "Warning Shot", effect: "Target must make Corruption Burst (BR 2) or drop and remain down for 1 round." }
    ],
    investigate: [
      { cost: 1, name: "Pattern Lock", effect: "DA must tell you one piece of context about the object's history or origin." },
      { cost: 1, name: "Clock It", effect: "Determine precisely when an event occurred (within 30-minute window)." },
      { cost: 2, name: "Hidden Compartment", effect: "Find something the scene intended to conceal — DA must reveal one hidden element." }
    ],
    tech: [
      { cost: 1, name: "Trace", effect: "Identify who else accessed the system recently — one account or terminal revealed." },
      { cost: 1, name: "Improvised Repair", effect: "Item also gets a temporary improvement (+1 Gear die this session, etc.)." },
      { cost: 2, name: "Ghost Session", effect: "Access to this digital system leaves no log entry. No one can prove you were connected." }
    ]
  },

  // ─── CLEARANCE LEVELS ────────────────────────────────────
  clearanceLevels: [
    { cl: 1, desc: "All agents — basic field supplies." },
    { cl: 2, desc: "Agents at Division default (Recovery) or with one completed Case File." },
    { cl: 3, desc: "Agents at Division default (Wayfinder, Keep) or with field commendations." },
    { cl: 4, desc: "Senior agents and Warden rank — restricted hardware and experimental tech." },
    { cl: 5, desc: "Maximum clearance — prototype equipment and Covenant legacy assets." }
  ],

  // ─── RESOURCE DIE SCALE ──────────────────────────────────
  resourceDieScale: [
    { die: "d12", desc: "Fully stocked — fresh from Stack." },
    { die: "d10", desc: "Well supplied — no concerns yet." },
    { die: "d8", desc: "Adequate — a couple of heavy uses left." },
    { die: "d6", desc: "Running low — ration carefully." },
    { die: "d4", desc: "Critical — final uses. Do not count on it." },
    { die: "Depleted", desc: "Gone. Cannot be used." }
  ],

  // ─── CRITICAL INJURIES ───────────────────────────────────
  criticalInjuries: [
    { roll: "11–12", name: "Wind Knocked Out", effect: "−1 die on all actions for 1d6 rounds.", lethal: false, healing: "Heal (WIT) Difficulty 1; recovery time: d6 hours." },
    { roll: "13–14", name: "Bruised Ribs", effect: "−1 die on Strength and Agility rolls until healed.", lethal: false, healing: "Heal (WIT) Difficulty 1; recovery time: d6 days." },
    { roll: "15–16", name: "Sprained Wrist", effect: "−1 die on Deft Hands and Firearms rolls until healed.", lethal: false, healing: "Heal (WIT) Difficulty 1; recovery time: d6 days." },
    { roll: "21–22", name: "Deep Gash", effect: "Bleeding: lose 1 Strength per round until Heal (WIT) Difficulty 1 applied.", lethal: false, healing: "Heal (WIT) Difficulty 1; recovery time: d6 days." },
    { roll: "23–24", name: "Concussion", effect: "−2 dice on Wits rolls for d6 hours. Cannot push Wits rolls.", lethal: false, healing: "Rest; recovery time: d6 days." },
    { roll: "25–26", name: "Broken Nose", effect: "−1 die on Manipulate and Psychoanalyze rolls until healed.", lethal: false, healing: "Heal (WIT) Difficulty 1; recovery time: d6 days." },
    { roll: "31–32", name: "Cracked Ribs", effect: "−2 dice on Strength and Agility rolls. Cannot push these rolls.", lethal: false, healing: "Heal (WIT) Difficulty 2; recovery time: 2d6 days." },
    { roll: "33–34", name: "Fractured Arm", effect: "Arm unusable. −2 dice on actions requiring both hands.", lethal: false, healing: "Heal (WIT) Difficulty 2; recovery time: 2d6 weeks." },
    { roll: "35–36", name: "Fractured Leg", effect: "Cannot run. Move one zone per Slow Action. −2 dice on Agility rolls.", lethal: false, healing: "Heal (WIT) Difficulty 2; recovery time: 2d6 weeks." },
    { roll: "41–42", name: "Punctured Lung", effect: "−2 dice on all actions. Cannot push any rolls. Suffocation risk.", lethal: true, healing: "Heal (WIT) Difficulty 3; recovery time: d6 weeks. Lethal if untreated." },
    { roll: "43–44", name: "Internal Bleeding", effect: "Lose 1 Strength per hour until Heal (WIT) Difficulty 2 applied.", lethal: true, healing: "Heal (WIT) Difficulty 2; recovery time: d6 days. Lethal within d6 hours if untreated." },
    { roll: "45–46", name: "Cracked Skull", effect: "−2 dice on Wits rolls. Stunt Points cannot be spent. Unconscious on d6 roll of 1–2 each scene.", lethal: true, healing: "Heal (WIT) Difficulty 3; recovery time: 2d6 weeks. Lethal if untreated." },
    { roll: "51–52", name: "Severed Artery", effect: "Lose 1 Strength per round until Heal (WIT) Difficulty 2 applied. Death within d6 rounds if untreated.", lethal: true, healing: "Heal (WIT) Difficulty 2; immediate treatment required. Recovery: 2d6 weeks." },
    { roll: "53–54", name: "Ruptured Organ", effect: "−3 dice on all actions. Cannot push. Lose 1 Strength per scene.", lethal: true, healing: "Heal (WIT) Difficulty 3 + surgical kit; recovery time: 2d6 weeks in infirmary." },
    { roll: "55–56", name: "Spinal Injury", effect: "Paralyzed from injury site down. Cannot move without assistance.", lethal: false, healing: "Heal (WIT) Difficulty 3; recovery time: 3d6 weeks. May be permanent at DA discretion." },
    { roll: "61–62", name: "Shattered Jaw", effect: "Cannot speak intelligibly. −3 dice on Manipulate and Command.", lethal: false, healing: "Heal (WIT) Difficulty 2; recovery time: 2d6 weeks." },
    { roll: "63–64", name: "Crushed Hand", effect: "Hand destroyed. −3 dice on Deft Hands. Cannot use two-handed weapons.", lethal: false, healing: "Heal (WIT) Difficulty 2; recovery time: 3d6 weeks. May be permanent." },
    { roll: "65–66", name: "Fracture Point", effect: "Permanent −2 to Corruption Threshold. −1 Empathy permanently.", lethal: false, healing: "Cannot be healed. Permanent character change." }
  ]
};
