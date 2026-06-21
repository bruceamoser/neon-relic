// Neon Relic — DA Operations Board Data
// Game data, seed states, and sample case file packages.
const NR_DATA = (function() {
  'use strict';

  // ─── DEFAULT BLANK CASE STATE ────────────────────────────
  const BLANK_CASE = {
    caseId: '',
    caseName: 'New Case File',
    region: '',
    currentDay: 14,
    shiftsFilled: [],
    organizations: [
      createBlankOrg('O1', 1), createBlankOrg('O2', 2),
      createBlankOrg('O3', 3), createBlankOrg('O4', 4),
      createBlankOrg('O5', 5), createBlankOrg('O6', 6),
      createBlankOrg('O7', 7), createBlankOrg('O8', 8)
    ],
    relicMilestones: [],
    currentDayDisplay: 14
  };

  function createBlankOrg(id, num) {
    const val = (typeof num === 'number' && num >= 0 && num <= 14) ? num : 1;
    return {
      id: id,
      name: '',
      value: val,
      active: val > 0,
      dormant: val === 0,
      activationCondition: '',
      squaresConsumed: [],
      milestones: [],
      linkedEffects: '',
      playerSigns: '',
      notes: ''
    };
  }

  // ─── SPEAR OF DESTINY SAMPLE CASE ────────────────────────
  const SPEAR_OF_DESTINY = {
    caseId: 'VC-AR-87-041',
    caseName: 'The Spear That Went Dark',
    region: 'Buenos Aires, Argentina',
    currentDay: 14,
    shiftsFilled: [],
    organizations: [
      {
        id: 'O1', name: 'Vantablack Compact', value: 9, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 7, label: 'O1M1', description: 'The Compact sends a cleaner to eliminate loose ends. The agents find a body at their hotel — a warning.', crossAdvances: [{ targetOrg: 'O3', squares: 1 }], triggered: false },
          { day: 4, label: 'O1M2', description: 'Cleaner fails. The Compact escalates to direct action — a black-market hit squad is dispatched.', crossAdvances: [{ targetOrg: 'O3', squares: 2 }], triggered: false },
          { day: 1, label: 'O1M3', description: 'The Compact makes its final play. All remaining assets converge on the Spear\'s location for a violent extraction.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Escalation increases heat on all players in Buenos Aires underworld.',
        playerSigns: 'Increased surveillance, unfamiliar faces tailing agents, vehicles parked outside safe houses.', notes: ''
      },
      {
        id: 'O2', name: 'The Theft Crew', value: 6, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 5, label: 'O2M1', description: 'One crew member cracks under pressure and reaches out to the agents. He offers information in exchange for protection.', crossAdvances: [{ targetOrg: 'O6', squares: 1 }], triggered: false },
          { day: 3, label: 'O2M2', description: 'The crew fragments. Internal betrayal leads to a shootout at a crew safehouse.', crossAdvances: [{ targetOrg: 'O3', squares: 2 }], triggered: false },
          { day: 1, label: 'O2M3', description: 'The last surviving crew member makes a desperate play for the Spear, seeking to sell it and disappear.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Crew paranoia makes them unpredictable — they may attack agents or rivals without warning.',
        playerSigns: 'Underground contacts go quiet. Safehouse locations are abandoned. Burner phones stop ringing.', notes: ''
      },
      {
        id: 'O3', name: 'Buenos Aires Police', value: 10, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 8, label: 'O3M1', description: 'Homicide detective Mateo Suarez connects the deaths to a larger pattern. Police investigation widens.', crossAdvances: [{ targetOrg: 'O6', squares: 1 }], triggered: false },
          { day: 6, label: 'O3M2', description: 'Police obtain a warrant for the agents\' hotel. Federal authorities are notified.', crossAdvances: [{ targetOrg: 'O4', squares: 1 }], triggered: false },
          { day: 3, label: 'O3M3', description: 'Police-Compact confrontation. A full-scale law enforcement operation targets known Compact locations.', crossAdvances: [{ targetOrg: 'O1', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'Police pressure forces all factions to act more aggressively.',
        playerSigns: 'Police cruisers in the neighborhood. Hotel staff asking questions. Wanted posters.', notes: ''
      },
      {
        id: 'O4', name: 'The Catholic Church', value: 12, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 9, label: 'O4M1', description: 'Father Esteban Vale reports the theft to the Vatican. A Church investigator is dispatched.', crossAdvances: [{ targetOrg: 'O3', squares: 1 }], triggered: false },
          { day: 6, label: 'O4M2', description: 'Church leadership goes public with a statement about "desecration of a holy relic." Public pressure mounts.', crossAdvances: [{ targetOrg: 'O3', squares: 2 }, { targetOrg: 'O6', squares: 1 }], triggered: false },
          { day: 3, label: 'O4M3', description: 'The Church threatens diplomatic consequences. Argentine government pressured to resolve the situation.', crossAdvances: [{ targetOrg: 'O5', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'Church involvement attracts international attention.',
        playerSigns: 'Increased clergy presence near crime scenes. Church volunteers asking questions. Nuns at the hospital.', notes: ''
      },
      {
        id: 'O5', name: 'The Foreign Buyer', value: 8, active: false, dormant: true,
        activationCondition: 'Triggered by O4M2 or when agents make significant progress locating the Spear.',
        squaresConsumed: [],
        milestones: [
          { day: 5, label: 'O5M1', description: 'The buyer\'s intermediary, Ivan Lujan, arrives in Buenos Aires. He begins making inquiries at currency exchanges.', crossAdvances: [{ targetOrg: 'O1', squares: 1 }], triggered: false },
          { day: 2, label: 'O5M2', description: 'The buyer grows impatient. Sabine Voss arrives personally with a security detail and diplomatic cover.', crossAdvances: [{ targetOrg: 'O4', squares: 2 }], triggered: false }
        ],
        linkedEffects: 'Buyer\'s presence escalates the black market bidding war.',
        playerSigns: 'Unusual foreign nationals at hotels. Rumors of a big sale. Currency exchanges seeing large transactions.', notes: 'Dormant until activated by O4M2 milestone.'
      },
      {
        id: 'O6', name: 'Buenos Aires Press', value: 6, active: false, dormant: true,
        activationCondition: 'Triggered by O3M1 (police investigation goes public) or any public incident.',
        squaresConsumed: [],
        milestones: [
          { day: 3, label: 'O6M1', description: 'A tabloid publishes photos of the crime scene. "Satanic Cult in Buenos Aires?" headline triggers public panic.', crossAdvances: [{ targetOrg: 'O4', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'Media coverage makes covert operations significantly harder.',
        playerSigns: 'Reporters at every scene. Cameras. Tabloid headlines. Public hysteria about cults.', notes: 'Dormant until activated by O3M1 or public-facing incident.'
      },
      { id: 'O7', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O8', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' }
    ],
    relicMilestones: [
      { day: 11, description: 'The Spear emits its first pulse — all agents within 1 mile gain +1 Corruption. Animals in the city become agitated. Electronic devices flicker.' },
      { day: 8, description: 'Second pulse: radius expands to 5 miles. Church bells ring spontaneously. Holy water turns black in churches across the city.' },
      { day: 5, description: 'Catastrophic emission: the Spear activates partially. Reality distortions begin. Shadows move independently. Mirrors show things that aren\'t there.' },
      { day: 2, description: 'Imminent catastrophe warning signs. The sky darkens over Buenos Aires. Anyone within 10 miles experiences nightmares of conquest and blood.' },
      { day: 1, description: 'CATASTROPHE: The Spear fully activates. It seeks a wielder of conqueror\'s blood. Mass Corruption Burst (BR 5) across the entire city. The Covenant\'s existence is exposed.' }
    ],
    currentDayDisplay: 14
  };

  function finalizeOrgSquares(orgs) {
    orgs.forEach(org => {
      if (org.value > 0 && (!org.squaresConsumed || org.squaresConsumed.length === 0)) {
        org.squaresConsumed = [];
        for (let col = 14; col > org.value; col--) {
          org.squaresConsumed.push(col);
        }
      }
    });
  }

  // Pre-fill shift quadrants for days already passed based on case's currentDay.
  // E.g., currentDay=10 means days 14-11 are fully filled; day 10 is the active day.
  function finalizeShiftsFilled(caseObj) {
    if (!caseObj.shiftsFilled || caseObj.shiftsFilled.length === 0) {
      const currentDay = caseObj.currentDay || 14;
      caseObj.shiftsFilled = [];
      for (let day = 14; day > currentDay; day--) {
        ['M', 'D', 'E', 'N'].forEach(shift => {
          caseObj.shiftsFilled.push({ day: day, shift: shift, filled: true, undertaking: '' });
        });
      }
    }
  }
  finalizeOrgSquares(SPEAR_OF_DESTINY.organizations);
  finalizeShiftsFilled(SPEAR_OF_DESTINY);

  // ─── GAME RULES REFERENCE DATA ───────────────────────────
  const SKILL_LIST = [
    { key: 'force', name: 'Force', attr: 'strength' },
    { key: 'brawl', name: 'Brawl', attr: 'strength' },
    { key: 'endure', name: 'Endure', attr: 'strength' },
    { key: 'sneak', name: 'Sneak', attr: 'agility' },
    { key: 'deftHands', name: 'Deft Hands', attr: 'agility' },
    { key: 'firearms', name: 'Firearms', attr: 'agility' },
    { key: 'investigate', name: 'Investigate', attr: 'wits' },
    { key: 'tech', name: 'Tech', attr: 'wits' },
    { key: 'lore', name: 'Lore', attr: 'wits' },
    { key: 'heal', name: 'Heal', attr: 'wits' },
    { key: 'manipulate', name: 'Manipulate', attr: 'empathy' },
    { key: 'command', name: 'Command', attr: 'empathy' },
    { key: 'psychoanalyze', name: 'Psychoanalyze', attr: 'empathy' }
  ];

  const ATTRIBUTES = [
    { key: 'strength', name: 'Strength', abbr: 'STR' },
    { key: 'agility', name: 'Agility', abbr: 'AGI' },
    { key: 'wits', name: 'Wits', abbr: 'WIT' },
    { key: 'empathy', name: 'Empathy', abbr: 'EMP' }
  ];

  // ─── CORRUPTION STAGES ───────────────────────────────────
  const CORRUPTION_STAGES = [
    { min: 1, max: 3, name: 'Nosebleeds / Migraines', penalty: '' },
    { min: 4, max: 6, name: 'Auditory Hallucinations', penalty: '' },
    { min: 7, max: 9, name: 'Eldritch Tremors', penalty: '−1 Deft Hands / Firearms' },
    { min: 10, max: 12, name: 'Reality Distortion', penalty: '' },
    { min: 13, max: 14, name: 'Fugue States', penalty: '' },
    { min: 15, max: 999, name: 'Collapse of Self', penalty: '' }
  ];

  // ─── DISPOSITION SCALE ───────────────────────────────────
  const DISPOSITION_LEVELS = [
    { value: 1, name: 'Closed', desc: 'Social rolls impossible. Must recover first.' },
    { value: 2, name: 'Hostile', desc: 'Roll required for basic information.' },
    { value: 3, name: 'Guarded', desc: 'Truth to low-risk questions.' },
    { value: 4, name: 'Cautious', desc: 'Willing to share, but watching.' },
    { value: 5, name: 'Open / Allied', desc: 'Fully cooperative. Shares freely.' }
  ];

  // ─── ZONES ───────────────────────────────────────────────
  const COMBAT_ZONES = ['Engaged', 'Near', 'Far', 'Distant'];

  // ─── SOCIAL MANEUVERS ────────────────────────────────────
  const SOCIAL_MANEUVERS = [
    { key: 'press', name: 'Press', desc: 'Push for information directly.', skill: 'manipulate' },
    { key: 'probe', name: 'Probe', desc: 'Test for inconsistencies.', skill: 'psychoanalyze' },
    { key: 'manipulate', name: 'Manipulate', desc: 'Deceive or misdirect.', skill: 'manipulate' },
    { key: 'persuade', name: 'Persuade', desc: 'Reason and negotiate.', skill: 'command' }
  ];

  // ═══════════════════════════════════════════════════════════
  // AGENT DATA
  // ═══════════════════════════════════════════════════════════

  // ─── BLANK AGENT TEMPLATE ────────────────────────────────
  function createBlankAgent(id) {
    id = id || 'agent-' + Date.now();
    return {
      id: id,
      name: '',
      division: '',
      subUnit: '',
      specialty: '',
      ageGroup: 'adult',
      age: 30,
      origin: '',
      anchor: '',
      attributes: { strength: 3, agility: 3, wits: 3, empathy: 3 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 0, brawl: 0, endure: 0,
        sneak: 0, deftHands: 0, firearms: 0,
        investigate: 0, tech: 0, lore: 0, heal: 0,
        manipulate: 0, command: 0, psychoanalyze: 0
      },
      corruption: 0,
      armorRating: 0,
      talents: [],
      gear: [],
      resourceDice: { ammo: '', medical: '', battery: '', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 1,
      standing: 1,
      xp: 0,
      notes: '',
      commonRolls: [],
      addedAt: new Date().toISOString()
    };
  }

  // ─── PREBUILT AGENTS ─────────────────────────────────────
  const PREBUILT_AGENTS = [
    {
      id: 'agent-ingrid',
      name: 'Ingrid Skovgaard',
      division: 'Wayfinder',
      subUnit: 'Research Wing',
      specialty: 'Research Field Analyst',
      ageGroup: 'senior',
      age: 44,
      origin: 'Copenhagen, Denmark',
      anchor: 'A brass compass — her father\'s, a retired merchant marine captain. It hasn\'t pointed north since 1979.',
      attributes: { strength: 2, agility: 2, wits: 5, empathy: 3 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 0, brawl: 0, endure: 0,
        sneak: 0, deftHands: 0, firearms: 0,
        investigate: 3, tech: 2, lore: 4, heal: 1,
        manipulate: 2, command: 1, psychoanalyze: 1
      },
      corruption: 0,
      armorRating: 0,
      talents: [
        { name: 'The Antiquarian\'s Eye', effect: 'On first inspection, identify either an artifact\'s likely activation trigger or its likely base effect without a Lore roll.', cost: '+1 Corruption', source: 'division' },
        { name: 'Deep Archive Access', effect: 'Spend an action consulting restricted Covenant records. Gain +2 bonus dice on your next Lore or Investigate roll this scene.', cost: '+1 Corruption', source: 'subunit' },
        { name: 'Archaeologist (+1 Lore)', effect: 'Study of ancient civilizations lets you interpret artifacts buried by time. Background bonus is always active.', cost: '— (passive)', source: 'background' }
      ],
      gear: [
        { name: 'Briefcase with research materials', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: '35mm camera with two rolls of film', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: 'Forged credentials (academic ID)', bonus: 0, enc: '½', cl: 2, degraded: false },
        { name: 'Civilian clothing (field appropriate)', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: 'Pocket knife (concealed)', bonus: 1, enc: '½', cl: 0, degraded: false }
      ],
      resourceDice: { ammo: '—', medical: '', battery: '', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 4, standing: 3, xp: 12,
      notes: 'Has a personal connection to Buenos Aires — studied abroad there in university.',
      commonRolls: [
        { label: 'Lore Research', attribute: 'wits', skill: 'lore', gear: [] },
        { label: 'Investigation', attribute: 'wits', skill: 'investigate', gear: [] },
        { label: 'Manipulate', attribute: 'empathy', skill: 'manipulate', gear: [] }
      ],
      addedAt: ''
    },
    {
      id: 'agent-margaret',
      name: 'Margaret "Maggie" Chen',
      division: 'The Keep',
      subUnit: 'Stack (Logistics)',
      specialty: 'Logistics & Containment Engineer',
      ageGroup: 'senior',
      age: 41,
      origin: 'Hong Kong / London, UK',
      anchor: 'A red plastic transistor radio — from her childhood flat in Kowloon Walled City. It only picks up static now.',
      attributes: { strength: 2, agility: 2, wits: 4, empathy: 4 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 0, brawl: 0, endure: 0,
        sneak: 0, deftHands: 1, firearms: 0,
        investigate: 2, tech: 3, lore: 3, heal: 2,
        manipulate: 1, command: 2, psychoanalyze: 0
      },
      corruption: 0,
      armorRating: 1,
      talents: [
        { name: 'Containment Protocol', effect: 'Improvise a ward using available materials. Supernatural entities must succeed on a Hard roll to cross the barrier.', cost: '+1 Corruption', source: 'division' },
        { name: 'Jury-Rig', effect: 'Restore a broken or degraded piece of gear to its maximum bonus during combat or a high-tension scene.', cost: '+1 Corruption', source: 'subunit' },
        { name: 'Engineer (+1 Tech)', effect: 'Formal training in electrical and mechanical systems. Background bonus is always active.', cost: '— (passive)', source: 'background' }
      ],
      gear: [
        { name: 'Personal toolkit (screwdrivers, soldering iron, multimeter)', bonus: 2, enc: '2', cl: 0, degraded: false },
        { name: 'Signal jammer (prototype; 1 use; Gear Die d6)', bonus: 1, enc: '1', cl: 3, degraded: false },
        { name: 'Walkie-talkies ×2 (range: ~2km)', bonus: 1, enc: '1', cl: 0, degraded: false },
        { name: 'Duct tape + WD-40', bonus: 0, enc: '½', cl: 0, degraded: false },
        { name: 'Utility vest (many pockets)', bonus: 0, enc: '1', cl: 0, degraded: false }
      ],
      resourceDice: { ammo: '', medical: '', battery: 'd6', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 4, standing: 3, xp: 10,
      notes: 'Worked for the BBC\'s engineering department before recruitment. Received signals from 1923 through a transmitter near Dover.',
      commonRolls: [
        { label: 'Tech (Field Repair)', attribute: 'wits', skill: 'tech', gear: ['Personal toolkit'] },
        { label: 'Investigation', attribute: 'wits', skill: 'investigate', gear: [] },
        { label: 'Lore (Artifact Studies)', attribute: 'wits', skill: 'lore', gear: [] }
      ],
      addedAt: ''
    },
    {
      id: 'agent-nikolai',
      name: 'Nikolai "Kolya" Petrov',
      division: 'Recovery',
      subUnit: 'Heavy-Hitter',
      specialty: 'Combat Recovery Specialist',
      ageGroup: 'experienced',
      age: 35,
      origin: 'Soviet Union (defected)',
      anchor: 'A faded photograph — his mother standing in front of the family dacha near Kaluga. She smiled like the world was still simple.',
      attributes: { strength: 5, agility: 3, wits: 2, empathy: 3 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 3, brawl: 3, endure: 2,
        sneak: 1, deftHands: 0, firearms: 2,
        investigate: 0, tech: 0, lore: 0, heal: 0,
        manipulate: 0, command: 1, psychoanalyze: 0
      },
      corruption: 0,
      armorRating: 0,
      talents: [
        { name: 'Conditioned Mind', effect: 'Once per session, entirely ignore the Corruption point generated from pushing a roll.', cost: 'no cost', source: 'division' },
        { name: 'Stand Your Ground', effect: 'Plant yourself and refuse to move. Until your next turn, cannot be pushed/knocked down, +2 Armor Rating.', cost: '+1 Corruption', source: 'subunit' },
        { name: 'Military Veteran (+1 Firearms)', effect: 'Formal military training in weapons and battlefield discipline. Background bonus is always active.', cost: '— (passive)', source: 'background' }
      ],
      gear: [
        { name: '.38 Special revolver (12 rounds)', bonus: 2, enc: '1', cl: 2, degraded: false },
        { name: 'D-cell flashlight', bonus: 1, enc: '1', cl: 0, degraded: false },
        { name: 'Field kit (10m rope, zip ties ×6, chalk ×2, crowbar)', bonus: 0, enc: '2', cl: 0, degraded: false },
        { name: 'Field jacket with concealed holster', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: 'Stun baton', bonus: 1, enc: '1', cl: 2, degraded: false }
      ],
      resourceDice: { ammo: 'd8', medical: '', battery: '', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 2, standing: 1, xp: 6,
      notes: 'Former Spetsnaz sergeant. The artifact he found in an Afghan cave killed three of his men. He has not spoken Russian since.',
      commonRolls: [
        { label: 'Force (Break Door)', attribute: 'strength', skill: 'force', gear: ['Crowbar'] },
        { label: 'Brawl (Hand-to-Hand)', attribute: 'strength', skill: 'brawl', gear: ['Stun baton'] },
        { label: 'Firearms (.38 Special)', attribute: 'agility', skill: 'firearms', gear: ['.38 Special revolver'] }
      ],
      addedAt: ''
    },
    {
      id: 'agent-vivienne',
      name: 'Vivienne "Viv" Moreau',
      division: 'Recovery',
      subUnit: 'Acquisition Specialist',
      specialty: 'Infiltration & Acquisition',
      ageGroup: 'young',
      age: 26,
      origin: 'Lyon, France',
      anchor: 'A silver locket — inside, a photograph of her older sister, Camille, who died in a car accident on the N7 near Lyon. Viv was fifteen.',
      attributes: { strength: 2, agility: 5, wits: 4, empathy: 3 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 0, brawl: 0, endure: 0,
        sneak: 3, deftHands: 3, firearms: 2,
        investigate: 1, tech: 1, lore: 0, heal: 0,
        manipulate: 0, command: 0, psychoanalyze: 0
      },
      corruption: 0,
      armorRating: 0,
      talents: [
        { name: 'Shadow Walker', effect: 'Become imperceptible to mundane guards and electronic surveillance for one scene.', cost: '+1 Corruption', source: 'division' },
        { name: 'Ghost Entry', effect: 'Bypass a single locked door, gate, or security system without a roll. Silent and leaves no trace.', cost: '+1 Corruption', source: 'subunit' },
        { name: 'Locksmith (+1 Deft Hands)', effect: 'Trained hands and an instinct for tumblers and mechanisms. Background bonus is always active.', cost: '— (passive)', source: 'background' }
      ],
      gear: [
        { name: '9mm semi-automatic (12 rounds)', bonus: 2, enc: '1', cl: 2, degraded: false },
        { name: 'D-cell flashlight', bonus: 1, enc: '1', cl: 0, degraded: false },
        { name: 'Field kit (10m rope, zip ties ×6, chalk ×2, crowbar)', bonus: 0, enc: '2', cl: 0, degraded: false },
        { name: 'Field jacket with concealed holster', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: 'Lockpick set (professional)', bonus: 1, enc: '½', cl: 0, degraded: false }
      ],
      resourceDice: { ammo: 'd8', medical: '', battery: '', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 1, standing: 1, xp: 4,
      notes: 'Former cat burglar from Lyon. Lifted a jade figurine at 19 that turned her fingernails black for a week.',
      commonRolls: [
        { label: 'Sneak (Infiltration)', attribute: 'agility', skill: 'sneak', gear: [] },
        { label: 'Deft Hands (Lockpicking)', attribute: 'agility', skill: 'deftHands', gear: ['Lockpick set'] },
        { label: 'Firearms (9mm)', attribute: 'agility', skill: 'firearms', gear: ['9mm semi-automatic'] }
      ],
      addedAt: ''
    },
    {
      id: 'agent-yusuf',
      name: 'Yusuf Demir',
      division: 'The Keep',
      subUnit: 'Wardens',
      specialty: 'Containment Warden',
      ageGroup: 'experienced',
      age: 37,
      origin: 'Istanbul, Turkey',
      anchor: 'A worn leather belt — his grandfather\'s, a night watchman in Istanbul who never locked the gate for those seeking shelter.',
      attributes: { strength: 3, agility: 3, wits: 3, empathy: 4 },
      attributeDamage: { strength: 0, agility: 0, wits: 0, empathy: 0 },
      skills: {
        force: 0, brawl: 2, endure: 2,
        sneak: 0, deftHands: 0, firearms: 1,
        investigate: 0, tech: 0, lore: 2, heal: 1,
        manipulate: 0, command: 4, psychoanalyze: 0
      },
      corruption: 0,
      armorRating: 1,
      talents: [
        { name: 'Shield of the Covenant', effect: 'Step in front of an attack targeting an ally within Near range. You take the damage instead, but halve severity (round down).', cost: '+1 Corruption', source: 'division' },
        { name: 'Lockdown', effect: 'Seal an entrance or passage. No entity may pass for one round without succeeding on a Hard Force roll. Supernatural beings roll with −2.', cost: '+1 Corruption', source: 'subunit' },
        { name: 'Security Guard (+1 Command)', effect: 'Years of directing personnel and maintaining order under pressure. Background bonus is always active.', cost: '— (passive)', source: 'background' }
      ],
      gear: [
        { name: 'Containment kit (1kg salt, 10m copper wire, chalk ×4, sealed glass canisters ×4)', bonus: 0, enc: '2', cl: 2, degraded: false },
        { name: 'Lore reference binder', bonus: 1, enc: '1', cl: 0, degraded: false },
        { name: 'Tactical jacket', bonus: 0, enc: '1', cl: 0, degraded: false },
        { name: '.38 Special revolver (12 rounds)', bonus: 2, enc: '1', cl: 2, degraded: false }
      ],
      resourceDice: { ammo: 'd8', medical: '', battery: '', rations: '' },
      criticalInjuries: [],
      conditions: { starving: false, dehydrated: false, exhausted: false, freezing: false, sleepy: false },
      cl: 3, standing: 2, xp: 8,
      notes: 'Former Turkish military police. A containment incident at Incirlik Air Base brought him to the Covenant.',
      commonRolls: [
        { label: 'Command (Leadership)', attribute: 'empathy', skill: 'command', gear: [] },
        { label: 'Lore (Relic Knowledge)', attribute: 'wits', skill: 'lore', gear: ['Lore reference binder'] },
        { label: 'Brawl (Restraint)', attribute: 'strength', skill: 'brawl', gear: [] }
      ],
      addedAt: ''
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // SPEAR OF DESTINY CASE DATA — NPCS, LOCATIONS, INFO CARDS
  // ═══════════════════════════════════════════════════════════

  const SPEAR_NPCS = [
    {
      id: 'npc-lucia', name: 'Lucia Ferreyra', role: 'Estate Custodian',
      portrait: 'handouts/spear-npc-1-lucia-ferreyra.png',
      organization: 'Independent (estate custodian line)',
      attributes: { strength: 2, agility: 2, wits: 3, empathy: 4 },
      skills: { lore: 3, manipulate: 2, investigate: 1, endure: 2 },
      gear: 'Estate keys, family ledger, liturgical notebook (partial)',
      disposition: 3,
      secret: 'She knows the vault was a custody chamber, not a safe — and she has the family liturgical sequence memorized.',
      goal: 'Protect the family\'s reputation and prevent anyone from learning the true nature of what was stored.',
      artifactConnection: 'Raised in custodian tradition. Never handled the Spear directly but witnessed its effects during suppression rites as a child.',
      startingKnowledge: [{ info: 'I4', desc: 'Vault was suppressive — Containment Truth' }, { info: 'I9', desc: 'Family were custodians' }, { info: 'I11', desc: 'Partial substitute custody sequence' }],
      gainedKnowledge: [{ trigger: 'O4M2', desc: 'Learns Church observers are monitoring the family — becomes more cooperative if offered protection.' }],
      locations: ['L1'],
      positiveResult: 'Shares I4, I9, I11. Reveals partial containment sequence. May provide access to family chapel records (unlocks path to L7).',
      negativeResult: 'Refuses further contact. O4 advances 1 square (Church observers alerted by her distress).',
      daNotes: ''
    },
    {
      id: 'npc-suarez', name: 'Detective Mateo Suárez', role: 'Homicide Detective',
      portrait: 'handouts/spear-npc-2-detective-mateo-suarez.png',
      organization: 'O3 (Buenos Aires Police)',
      attributes: { strength: 3, agility: 2, wits: 4, empathy: 3 },
      skills: { investigate: 4, firearms: 3, command: 2, endure: 2, manipulate: 3 },
      gear: 'Service pistol, badge, police radio, case files',
      disposition: 3,
      secret: 'He knows the robbery case has unexplained elements — witnesses describing identical wounds, objects that should not exist — but he cannot write that in a report.',
      goal: 'Close the robbery case cleanly before it becomes a political embarrassment.',
      artifactConnection: 'No direct contact. Has interviewed witnesses who exhibited mild ideological contagion.',
      startingKnowledge: [{ info: 'I5', desc: 'Witness list' }, { info: 'I6', desc: 'Wounded thief route' }, { info: 'I8', desc: 'Sketch fragments' }],
      gainedKnowledge: [{ trigger: 'O3M2', desc: 'Learns I7 (hospital referrals) from a released witness.' }],
      locations: ['L2'],
      positiveResult: 'Shares I5, I6, I7, I8. Becomes a quiet ongoing source. Opens unofficial access to police and hospital records.',
      negativeResult: 'O3 advances 1 square (official attention drawn to agents). Agents flagged in police system.',
      daNotes: ''
    },
    {
      id: 'npc-vale', name: 'Father Esteban Vale', role: 'Church Investigator',
      portrait: 'handouts/spear-npc-3-father-esteban-vale.png',
      organization: 'O4 (The Catholic Church)',
      attributes: { strength: 2, agility: 2, wits: 4, empathy: 4 },
      skills: { lore: 4, command: 3, manipulate: 4, psychoanalyze: 2, investigate: 3 },
      gear: 'Ecclesiastical credentials, black-chamber file, consecrated reliquary case',
      disposition: 2,
      secret: 'Authorized to reclaim the relic by any necessary means — but his superiors will deny his existence if exposed.',
      goal: 'Recover the Spear into Church custody without a public ecclesiastical scandal.',
      artifactConnection: 'Has read the black-chamber file. Understands the relic as a sovereignty token, not merely a devotional artifact.',
      startingKnowledge: [{ info: 'I9', desc: 'Family were custodians' }, { info: 'I10', desc: 'Postwar custody compromise' }],
      gainedKnowledge: [{ trigger: 'O4M2', desc: 'Learns I11 from Church archives.' }],
      locations: ['L1', 'L3'],
      positiveResult: 'Shares I9, I10. May negotiate exchange if agents demonstrate containment capability. Introduces Sister Inés.',
      negativeResult: 'O4 advances 1 square (Church accelerates independent recovery).',
      daNotes: ''
    },
    {
      id: 'npc-ines', name: 'Sister Inés Barral', role: 'Church Archivist',
      portrait: 'handouts/spear-npc-4-sister-ines-barral.png',
      organization: 'O4 (Church — archivist)',
      attributes: { strength: 2, agility: 3, wits: 5, empathy: 4 },
      skills: { lore: 5, investigate: 4, manipulate: 2, heal: 2 },
      gear: 'Archive keys, catalog indices, older containment record',
      disposition: 3,
      secret: 'Has access to the older containment record and believes the Church should share it, not hoard it.',
      goal: 'Preserve the archival truth about the relic custody lineage, even if her superiors disagree.',
      artifactConnection: 'Studied the textual record extensively. Understands Quiescence conditions better than Father Vale.',
      startingKnowledge: [{ info: 'I9', desc: 'Family were custodians' }, { info: 'I10', desc: 'Postwar custody compromise' }, { info: 'I11', desc: 'Partial substitute custody sequence' }],
      gainedKnowledge: [{ trigger: 'O4M3', desc: 'Learns the retrieval cleric\'s full plan.' }],
      locations: ['L3'],
      positiveResult: 'Shares I9, I10, I11. Provides most complete Quiescence picture.',
      negativeResult: 'O4 advances 1 square. Sister Inés is reassigned — no longer available.',
      daNotes: ''
    },
    {
      id: 'npc-ramiro', name: 'Ramiro "Rami" Acosta', role: 'Theft Crew Survivor',
      portrait: 'handouts/spear-npc-5-ramiro-acosta.png',
      organization: 'O2 (The Theft Crew)',
      attributes: { strength: 3, agility: 4, wits: 2, empathy: 2 },
      skills: { sneak: 4, deftHands: 3, firearms: 3, endure: 3 },
      gear: 'Stolen tools, blood-stained bandages, crew burner phone',
      disposition: 4,
      secret: 'Knows where the Spear was last held and who currently has proximity control — but suffering wound bloom and command-delusion.',
      goal: 'Survive. He wants medical treatment and a way out of Buenos Aires.',
      artifactConnection: 'Touched the Spear during the heist. Suffering reopened wounds, religious certainty, and intermittent ecstatic episodes.',
      startingKnowledge: [{ info: 'I15', desc: 'Supernatural effects — wound bloom' }, { info: 'I16', desc: 'Who began speaking like a chosen ruler' }, { info: 'I17', desc: 'Final custody break site' }],
      gainedKnowledge: [{ trigger: '—', desc: 'None — deteriorating.' }],
      locations: ['L5'],
      positiveResult: 'Shares I15, I16, I17. Can lead agents to L7 (Hidden Shrine).',
      negativeResult: 'O2 advances 1 square (Rami disappears or silenced by Compact).',
      daNotes: ''
    },
    {
      id: 'npc-sabine', name: 'Sabine Voss', role: 'Compact Financier',
      portrait: 'handouts/spear-npc-6-sabine-voss.png',
      organization: 'O1 (Vantablack Compact)',
      attributes: { strength: 3, agility: 3, wits: 4, empathy: 2 },
      skills: { manipulate: 5, command: 3, investigate: 3, firearms: 2 },
      gear: 'Encrypted wire-transfer ledger, compact credentials, personal security detail',
      disposition: 1,
      secret: 'She financed the heist and has already taken significant losses. Her superiors are losing patience.',
      goal: 'Recover the Spear and complete the sale before the Compact writes off the operation — and her.',
      artifactConnection: 'No direct handling. Views the Spear as high-value merchandise, not a supernatural threat.',
      startingKnowledge: [{ info: 'I12', desc: 'Who financed the theft' }, { info: 'I13', desc: 'Handoff collapse location' }],
      gainedKnowledge: [{ trigger: 'O1M2', desc: 'Learns I14 (buyer demands).' }, { trigger: 'O5M1', desc: 'Learns I18 (export route).' }],
      locations: ['L4', 'L6'],
      positiveResult: 'I12, I13 extractable through interrogation or intercepted communications.',
      negativeResult: 'O1 advances 1 square. Agents marked as interference targets.',
      daNotes: ''
    },
    {
      id: 'npc-ivan', name: 'Iván Luján', role: 'Compact Fixer / Bearer Candidate',
      portrait: 'handouts/spear-npc-7-ivan-lujan.png',
      organization: 'O1 (Compact cutout / nationalist fixer)',
      attributes: { strength: 4, agility: 3, wits: 4, empathy: 3 },
      skills: { command: 4, manipulate: 3, firearms: 3, force: 3, endure: 3 },
      gear: 'Concealed pistol, diplomatic pouches, bearer\'s journal',
      disposition: 1,
      secret: 'He has begun interpreting tactical instinct as divine revelation. He is the strongest bearer candidate.',
      goal: 'He no longer wants to sell the Spear. He wants to keep it — and he is beginning to believe he was meant to.',
      artifactConnection: 'Extended proximity exposure. Exhibiting claimant-language patterns.',
      startingKnowledge: [{ info: 'I13', desc: 'Handoff collapse location' }, { info: 'I16', desc: 'Who began speaking like a chosen ruler — because it was him' }],
      gainedKnowledge: [{ trigger: '—', desc: 'None — he is becoming the problem.' }],
      locations: ['L4', 'L7'],
      positiveResult: 'Agents can identify him as the bearer before full activation.',
      negativeResult: 'Fill 1 extra shift quadrant. Bearer activation accelerates.',
      daNotes: ''
    },
    {
      id: 'npc-tomas', name: 'Brother Tomás Arce', role: 'False Ecclesiastical Broker',
      portrait: 'handouts/spear-npc-8-brother-tomas-arce.png',
      organization: 'Independent (false ecclesiastical broker)',
      attributes: { strength: 2, agility: 3, wits: 4, empathy: 3 },
      skills: { manipulate: 5, deceive: 4, investigate: 2, sneak: 3 },
      gear: 'Fake clerical dress, broker\'s notebook, multiple burner phones',
      disposition: 2,
      secret: 'He wears clerical dress but has no real ecclesiastical authority. He brokers between clergy, smugglers, and collectors.',
      goal: 'Profit from the chaos by selling information to whoever pays — Church, Compact, or buyers.',
      artifactConnection: 'None directly. Has heard enough from multiple sources to piece together partial truths.',
      startingKnowledge: [{ info: 'I10', desc: 'Postwar custody compromise (partial)' }, { info: 'I14', desc: 'Buyer demands (partial)' }],
      gainedKnowledge: [{ trigger: 'O5M1', desc: 'Learns I18 (export route) from courier contacts.' }],
      locations: ['L3', 'L6'],
      positiveResult: 'Shares I10 (partial), I14 (partial), I18.',
      negativeResult: 'Information sold to Compact instead. O1 advances 1 square.',
      daNotes: ''
    }
  ];

  const SPEAR_LOCATIONS = [
    {
      id: 'L1', name: 'The Ferreyra Estate, Recoleta District',
      description: 'A fortified residential compound with shattered vault access, scattered reliquary fragments, and signs of a professional breach. The family has locked up the property and stopped answering the door.',
      availability: 'open', availabilityCondition: 'Available at case start.',
      npcsPresent: 'Lucia Ferreyra. After O4M1: Father Esteban Vale may appear.',
      cluesPresent: ['I1', 'I2', 'I3', 'I4'],
      hazards: '',
      organizations: ['O3', 'O4'],
      positiveResult: 'Agents reconstruct the theft sequence and learn I1–I4. Unlocks L4 and L3.',
      negativeResult: 'O3 advances 1 square. Lucia refuses further contact.',
      milestoneChanges: 'O3M2: police cordon the estate. O4M3: Church retrieval cleric is on-site.',
      daNotes: ''
    },
    {
      id: 'L2', name: 'Buenos Aires Police — Robbery Division',
      description: 'A cramped detective bullpen with case boards, witness logs, and an overworked staff managing a theft that keeps getting stranger.',
      availability: 'clue-locked', availabilityCondition: 'Open after the estate is known or any police-connected clue.',
      npcsPresent: 'Detective Mateo Suárez.',
      cluesPresent: ['I5', 'I6', 'I7', 'I8'],
      hazards: '',
      organizations: ['O3', 'O1'],
      positiveResult: 'Agents gain I5–I8. Suárez becomes a quiet source. Unlocks L5.',
      negativeResult: 'O3 advances 1 square. O6 may activate if pressure is mishandled publicly.',
      milestoneChanges: 'O3M3: checkpoints and raids begin. O1M2: Compact tipped off.',
      daNotes: ''
    },
    {
      id: 'L3', name: 'Diocesan Archive, Cathedral Annex',
      description: 'A restricted ecclesiastical archive behind two locked doors and one polite but immovable secretary. Dust, ledgers, and the smell of old ink.',
      availability: 'clue-locked', availabilityCondition: 'Open after estate aftermath or any Church-linked clue.',
      npcsPresent: 'Sister Inés Barral. After O4M2: Father Esteban Vale arrives.',
      cluesPresent: ['I9', 'I10', 'I11'],
      hazards: '',
      organizations: ['O4'],
      positiveResult: 'Agents gain I9–I11. May unlock L7.',
      negativeResult: 'O4 advances 1 square. Access to deeper records closed.',
      milestoneChanges: 'O4M3: retrieval cleric arrives with custody demands.',
      daNotes: ''
    },
    {
      id: 'L4', name: 'Cambio Cerrito, Microcentro District',
      description: 'A nondescript currency exchange shopfront concealing wire-transfer infrastructure and a back-office courier dispatch.',
      availability: 'clue-locked', availabilityCondition: 'Open after estate evidence, police data, or financial cutout leads.',
      npcsPresent: 'Iván Luján. After O1M2: Sabine Voss appears.',
      cluesPresent: ['I12', 'I13', 'I14'],
      hazards: 'Compact surveillance.',
      organizations: ['O1', 'O3'],
      positiveResult: 'Agents gain I12–I14. Unlocks L6.',
      negativeResult: 'O1 advances 1 square. Evidence destroyed.',
      milestoneChanges: 'O1M2: field professionals replace cutouts.',
      daNotes: ''
    },
    {
      id: 'L5', name: 'Clínica Informal, La Boca District',
      description: 'An unlicensed medical practice in a converted warehouse. Chemical smells, improvised surgical equipment.',
      availability: 'clue-locked', availabilityCondition: 'Open after police, street, or church leads surface a surviving thief.',
      npcsPresent: 'Ramiro "Rami" Acosta.',
      cluesPresent: ['I15', 'I16', 'I17'],
      hazards: 'Compact operatives searching for survivors.',
      organizations: ['O2', 'O1'],
      positiveResult: 'Agents gain I15–I17. Rami can lead to L7.',
      negativeResult: 'O2 advances 1 square. O1 advances 1 square.',
      milestoneChanges: 'O2M2: Rami surfaces here.',
      daNotes: ''
    },
    {
      id: 'L6', name: 'Puerto Madero Freight District',
      description: 'Container yards, cargo offices, and private air charter desks. The border between legal commerce and black-market logistics.',
      availability: 'clue-locked', availabilityCondition: 'Open once buyer proof, Compact movement, or route intelligence exists.',
      npcsPresent: 'Brother Tomás Arce. After O5M1: unnamed foreign courier.',
      cluesPresent: ['I18', 'I19'],
      hazards: 'Compact security. Customs patrols.',
      organizations: ['O5', 'O1', 'O3'],
      positiveResult: 'Agents gain I18–I19. Can interdict export corridor.',
      negativeResult: 'O5 advances 1 square. O1 advances 1 square.',
      milestoneChanges: 'O5M2: handoff imminent.',
      daNotes: ''
    },
    {
      id: 'L7', name: 'Abandoned Chapel, Flores District',
      description: 'A derelict family chapel with makeshift ritual markings and the unmistakable pressure of a nearby active relic. The Spear is here — or was recently.',
      availability: 'clue-locked', availabilityCondition: 'Usually unlocked by at least two prior clues.',
      npcsPresent: 'The current bearer (Iván Luján or another).',
      cluesPresent: ['I20', 'I21', 'I22'],
      hazards: 'Active relic proximity (Corruption Burst risk).',
      organizations: ['O1', 'O4', 'O5'],
      positiveResult: 'Agents can attempt controlled containment.',
      negativeResult: 'Fill 1 extra shift quadrant. Custody conflict may erupt.',
      milestoneChanges: 'Day 2: the Spear begins selecting a claimant.',
      daNotes: ''
    }
  ];

  const SPEAR_INFO_CARDS = [
    {
      id: 'I1', content: 'The estate vault was breached using shaped charges matched to the vault\'s specific construction — not a random burglary technique. The crew had insider architectural plans.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L1'], knownBy: ['Lucia Ferreyra (inferred)', 'Det. Suárez (forensics)'],
      hqFallback: 'Day 1', daNotes: 'Breach Method — insider architectural plans used.', revealed: false
    },
    {
      id: 'I2', content: 'The thieves bypassed significant conventional valuables — silver, paintings, documents — and went directly to the subterranean vault. They knew exactly what they were after.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L1'], knownBy: ['Lucia Ferreyra'],
      hqFallback: 'Day 1', daNotes: 'False Target — confirms the heist was targeted, not opportunistic.', revealed: false
    },
    {
      id: 'I3', content: 'The operation was professionally financed through Compact cutouts. Wire transfers, equipment procurement, and crew payments all trace back to Vantablack financial infrastructure.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L1', 'L4'], knownBy: ['Sabine Voss (I12 cross-ref)'],
      hqFallback: 'Day 2', daNotes: 'Funded Heist Proof — Compact financial infrastructure traced.', revealed: false
    },
    {
      id: 'I4', content: 'The estate vault was not merely a safe. It was a custody chamber — a ritual containment site maintained through a liturgical sequence passed down through the custodian family. Breaking the vault broke the containment.',
      type: 'containment-truth', truthStatus: 'trigger',
      foundAt: ['L1'], knownBy: ['Lucia Ferreyra'],
      hqFallback: 'Day 2', daNotes: 'Vault Was Suppressive — establishes that the theft broke active containment.', revealed: false
    },
    {
      id: 'I5', content: 'Police have compiled a list of witnesses from the estate neighborhood who reported unusual activity the night of the theft — vehicles, shouting, and at least one person carried out on a stretcher.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L2'], knownBy: ['Det. Suárez'],
      hqFallback: 'Day 1', daNotes: 'Witness List — neighborhood accounts of the theft night.', revealed: false
    },
    {
      id: 'I6', content: 'One member of the heist crew was injured during the breach and fled separately. A blood trail and taxi records suggest a route toward La Boca district.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L2'], knownBy: ['Det. Suárez'],
      hqFallback: 'Day 2', daNotes: 'Wounded Thief Route — blood trail leads toward La Boca.', revealed: false
    },
    {
      id: 'I7', content: 'Hospital intake records show no matching admissions — suggesting the wounded thief sought unlicensed medical care. Street contacts may know where.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L2'], knownBy: ['Det. Suárez (gained at O3M2)'],
      hqFallback: 'Day 2', daNotes: 'Hospital Referrals — no matching admissions, unlicensed care likely.', revealed: false
    },
    {
      id: 'I8', content: 'Witness descriptions and partial security footage produce fragmentary sketches of at least two crew members who did not match any known criminal profile — suggesting outside recruitment.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L2'], knownBy: ['Det. Suárez'],
      hqFallback: 'Day 2', daNotes: 'Sketch Fragments — outside recruitment indicated.', revealed: false
    },
    {
      id: 'I9', content: 'The Spear is drawn to wound trauma, ideological certainty, righteous violence, and the proximity of anyone who believes themselves chosen. It does not merely react to these conditions — it seeks them out.',
      type: 'containment-truth', truthStatus: 'appetite',
      foundAt: ['L1', 'L3', 'L5'], knownBy: ['Lucia Ferreyra', 'Father Vale', 'Sister Inés', 'Rami Acosta (observed effects)'],
      hqFallback: 'Day 2', daNotes: 'Appetite Pattern — what the relic feeds on and is drawn toward.', revealed: false
    },
    {
      id: 'I10', content: 'After wartime displacement, the relic was placed with the Ferreyra family under a quiet compromise. The Church maintained a monitoring role but never officially acknowledged the arrangement.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L3'], knownBy: ['Father Vale', 'Sister Inés'],
      hqFallback: 'Day 2', daNotes: 'Postwar Custody Compromise.', revealed: false
    },
    {
      id: 'I11', content: 'The older containment record describes a substitute custody protocol: a specific sequence of shielding, silence, and liturgical actions required to move the Spear without triggering activation. The record is incomplete — key steps are missing or deliberately redacted.',
      type: 'containment-truth', truthStatus: 'quiescence',
      foundAt: ['L3'], knownBy: ['Lucia Ferreyra (oral tradition)', 'Sister Inés (archival text)'],
      hqFallback: 'Day 2', daNotes: 'Partial Substitute Custody Sequence.', revealed: false
    },
    {
      id: 'I12', content: 'The heist was funded by Sabine Voss through Vantablack Compact financial channels routed through the Cambio Cerrito currency exchange.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L4'], knownBy: ['Sabine Voss'],
      hqFallback: 'Day 2', daNotes: 'Who Financed — Voss through Compact channels.', revealed: false
    },
    {
      id: 'I13', content: 'The scheduled buyer handoff was meant to occur at a freight staging area but collapsed when the courier and the relic failed to arrive on time. The relic went sideways into someone else\'s hands.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L4'], knownBy: ['Sabine Voss', 'Iván Luján'],
      hqFallback: 'Day 2', daNotes: 'Handoff Collapse.', revealed: false
    },
    {
      id: 'I14', content: 'The foreign buyer\'s requirements reveal whether they want the Spear as a proof-of-force weapon or as a symbolic legitimacy token. This distinction determines the urgency and nature of the export threat.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L4'], knownBy: ['Sabine Voss (O1M2)', 'Br. Arce (partial)'],
      hqFallback: 'Day 2', daNotes: 'Buyer Demands — shapes endgame urgency.', revealed: false
    },
    {
      id: 'I15', content: 'The surviving thief exhibits wound bloom — injuries that reopen despite treatment, bleeding in patterns that echo the Spear\'s own wound history.',
      type: 'containment-truth', truthStatus: 'effect',
      foundAt: ['L5'], knownBy: ['Rami Acosta (experiencing it)'],
      hqFallback: 'Day 2', daNotes: 'First Supernatural Effects.', revealed: false
    },
    {
      id: 'I16', content: 'During and after the heist, one member of the crew began speaking in command-language: references to mandate, destiny, divine selection, and righteous authority.',
      type: 'containment-truth', truthStatus: 'proximity',
      foundAt: ['L5'], knownBy: ['Rami Acosta (witnessed)', 'Iván Luján (producing it)'],
      hqFallback: 'Day 2', daNotes: 'Chosen Ruler Speech — claimant-language.', revealed: false
    },
    {
      id: 'I17', content: 'The thief knows the location where the last transfer attempt occurred — the site connected to the final break in the custody chain.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L5'], knownBy: ['Rami Acosta'],
      hqFallback: 'Day 2', daNotes: 'Final Custody Break Site.', revealed: false
    },
    {
      id: 'I18', content: 'The Compact has established an export corridor — maritime, air charter, or diplomatic pouch — to move the Spear out of Argentina.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L6'], knownBy: ['Br. Arce (gained at O5M1)'],
      hqFallback: 'Day 2', daNotes: 'Export Route.', revealed: false
    },
    {
      id: 'I19', content: 'The foreign buyer\'s motivation — whether the Spear is wanted as a weapon of force, a token of political legitimacy, or a devotional relic — shapes the endgame.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L6'], knownBy: ['—'],
      hqFallback: 'Day 2', daNotes: 'Buyer Motivation.', revealed: false
    },
    {
      id: 'I20', content: 'The person currently holding proximity control over the Spear — the bearer — can be identified at the shrine.',
      type: 'containment-truth', truthStatus: 'effect',
      foundAt: ['L7'], knownBy: ['—'],
      hqFallback: '—', daNotes: 'Proximity Control Holder.', revealed: false
    },
    {
      id: 'I21', content: 'The bearer\'s self-justification — what they believe the Spear is telling them — reveals the Spear\'s current activation vector.',
      type: 'supporting-intel', truthStatus: null,
      foundAt: ['L7'], knownBy: ['—'],
      hqFallback: '—', daNotes: 'Bearer Beliefs.', revealed: false
    },
    {
      id: 'I22', content: 'The final element of the Quiescence protocol — the missing step from I11\'s incomplete custody sequence.',
      type: 'containment-truth', truthStatus: 'missing',
      foundAt: ['L7'], knownBy: ['—'],
      hqFallback: 'Day 2', daNotes: 'Missing Quiescence Piece.', revealed: false
    }
  ];

  // ─── DEFAULT APP STATE ───────────────────────────────────
  function getDefaultState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(BLANK_CASE)),
      agents: [],
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  function getSpearOfDestinyState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(SPEAR_OF_DESTINY)),
      agents: JSON.parse(JSON.stringify(PREBUILT_AGENTS)),
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // HEAVENLY CRUCIFIX CASE DATA
  // ═══════════════════════════════════════════════════════════

  const HEAVENLY_CRUCIFIX = {
    caseId: 'VC-CZ-87-019',
    caseName: 'The Heavenly Crucifix',
    region: 'Central Europe (Prague, Vienna, Munich)',
    currentDay: 10,
    shiftsFilled: [],
    organizations: [
      {
        id: 'O1', name: 'Vantablack Compact', value: 8, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 9, label: 'O1M1', description: 'Compact fixer Elena Varga arrives in Prague to broker the sale. She makes contact with the thief and begins arranging the exchange.', crossAdvances: [{ targetOrg: 'O3', squares: 1 }], triggered: false },
          { day: 5, label: 'O1M2', description: 'The Compact grows nervous about the thief\'s erratic behavior. Varga requests backup — a cleaner is dispatched.', crossAdvances: [{ targetOrg: 'O3', squares: 2 }], triggered: false },
          { day: 1, label: 'O1M3', description: 'The exchange at the Bavarian hunting lodge. Varga and the Compact attempt to close the deal before everything falls apart.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Compact presence attracts Church counter-intelligence. Varga\'s movements expose the buyer network.',
        playerSigns: 'Eastern European men in dark suits at hotels. Currency exchanges processing unusual amounts. Prague underworld unusually quiet.',
        notes: ''
      },
      {
        id: 'O2', name: 'Countess Martinice', value: 10, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 8, label: 'O2M1', description: 'Countess Martinice receives a visitor from the Church. She becomes defensive and may destroy records if pressured.', crossAdvances: [{ targetOrg: 'O4', squares: 1 }], triggered: false },
          { day: 5, label: 'O2M2', description: 'The Countess decides to cooperate fully with the agents if they\'ve earned her trust. She reveals the family tree and letters.', crossAdvances: [{ targetOrg: 'O6', squares: 1 }], triggered: false },
          { day: 2, label: 'O2M3', description: 'The Countess\'s estate in Brno is searched by Church authorities. If agents haven\'t secured the documents, they are confiscated.', crossAdvances: [{ targetOrg: 'O4', squares: 2 }], triggered: false }
        ],
        linkedEffects: 'The Countess holds the key to the shrine site. Her cooperation or obstruction determines whether agents can locate additional meteoric iron.',
        playerSigns: 'Letters from Brno arriving at agents\' hotel. A family servant asking discrete questions.',
        notes: ''
      },
      {
        id: 'O3', name: 'Klaus Reiner — The Thief', value: 7, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 7, label: 'O3M1', description: 'Reiner tests the crucifix in Vienna — throwing himself down stairs, walking into traffic. He emerges unscathed. His confidence becomes dangerous.', crossAdvances: [{ targetOrg: 'O1', squares: 1 }], triggered: false },
          { day: 5, label: 'O3M2', description: 'Immortality mania sets in. Reiner begins seeking life-threatening situations. He publicly challenges a local tough to shoot him.', crossAdvances: [{ targetOrg: 'O3', squares: 1 }, { targetOrg: 'O7', squares: 1 }], triggered: false },
          { day: 1, label: 'O3M3', description: 'Reiner at the exchange — manic, invincible, and utterly convinced of his divine mandate.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Reiner\'s behavior escalates from erratic to suicidal-manic.',
        playerSigns: 'News reports of a man surviving impossible accidents. Vienna hospital records showing a patient who walked away from unsurvivable trauma.',
        notes: ''
      },
      {
        id: 'O4', name: 'Cardinal Voss & Church Team', value: 9, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 8, label: 'O4M1', description: 'Cardinal Voss arrives in Prague with a Vatican recovery team. He presents himself as cooperative but begins his own investigation.', crossAdvances: [{ targetOrg: 'O2', squares: 1 }], triggered: false },
          { day: 6, label: 'O4M2', description: 'The Church team identifies the shrine site independently. Voss dispatches a team to the Bohemian Forest.', crossAdvances: [{ targetOrg: 'O6', squares: 2 }], triggered: false },
          { day: 3, label: 'O4M3', description: 'Voss attempts to claim ecclesiastical authority over the crucifix. He demands the agents turn over any recovered artifacts.', crossAdvances: [{ targetOrg: 'O5', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'The Church\'s parallel investigation creates a race condition.',
        playerSigns: 'Vatican diplomatic plates on black cars. Priests at every location the agents visit.',
        notes: ''
      },
      {
        id: 'O5', name: 'Andy Warhol — The Buyer', value: 10, active: false, dormant: true,
        activationCondition: 'Activated when the agents trace the Compact\'s money trail or when O1M2 fires.',
        squaresConsumed: [],
        milestones: [
          { day: 5, label: 'O5M1', description: 'Warhol\'s representative arrives in Munich to inspect the merchandise. The buyer\'s identity becomes traceable.', crossAdvances: [{ targetOrg: 'O1', squares: 1 }], triggered: false },
          { day: 2, label: 'O5M2', description: 'Warhol himself travels to Bavaria. He is frail, polite, and utterly convinced the crucifix is meant for him.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Warhol\'s involvement transforms the case from artifact recovery to celebrity crisis management.',
        playerSigns: 'Factory employees spotted in Munich. Pop art references in Compact communications.',
        notes: 'Dormant until activated by money trail discovery or O1M2.'
      },
      {
        id: 'O6', name: 'Bohemian Forest Shrine', value: 12, active: false, dormant: true,
        activationCondition: 'Activated when agents discover the Countess\'s documents or when O4M2 fires.',
        squaresConsumed: [],
        milestones: [
          { day: 4, label: 'O6M1', description: 'The shrine site is located. Excavation reveals additional meteoric iron fragments — the threat is replicable.', crossAdvances: [{ targetOrg: 'O4', squares: 1 }], triggered: false },
          { day: 2, label: 'O6M2', description: 'The Church team arrives at the shrine. A confrontation between agents, Church recovery team, and Compact operatives.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The shrine site changes the classification from "unique relic recovery" to "containment of replicable threat."',
        playerSigns: 'Old maps of the Bohemian Forest. Pagan symbols on local buildings.',
        notes: 'Dormant until activated by Countess documents or O4M2.'
      },
      { id: 'O7', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O8', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' }
    ],
    relicMilestones: [
      { day: 8, description: 'Signature spike detected in Vienna. The thief has begun testing the crucifix — throwing himself down stairs, walking into traffic. The Corruption signature is unmistakable.' },
      { day: 5, description: 'Immortality mania onset. The thief\'s psychological state deteriorates. He seeks out danger. The crucifix\'s aura intensifies — +1 Corruption for all characters in the same zone as the bearer.' },
      { day: 3, description: 'The crucifix begins emitting a visible aura — a faint golden light visible in darkness. Church observers interpret this as divine radiance.' },
      { day: 1, description: 'CATASTROPHE: The exchange at the Bavarian hunting lodge. Three-way standoff between Compact, Church, and agents. The thief is unkillable and manic. Warhol is in the parking lot.' }
    ],
    currentDayDisplay: 10,
    relicSheet: {
      name: 'The Heavenly Crucifix',
      tier: 'Tier 2 — Threatening',
      artifactDie: 'd8',
      activationCondition: 'The bearer must believe they are immortal. Physical contact plus conviction activates the crucifix.',
      mechanicalEffect: 'Wounds heal instantly. The bearer cannot die while wearing the crucifix — injuries close, blood returns, heartbeat restarts. Each near-death event costs +2 Corruption.',
      fracture: 'If the bearer dies while the Artifact Die is d4, the crucifix shatters and the shards embed in nearby flesh — granting fragmentary immortality to multiple hosts.'
    }
  };

  finalizeOrgSquares(HEAVENLY_CRUCIFIX.organizations);
  finalizeShiftsFilled(HEAVENLY_CRUCIFIX);

  function getHeavenlyCrucifixState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(HEAVENLY_CRUCIFIX)),
      agents: JSON.parse(JSON.stringify(PREBUILT_AGENTS)),
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // HEAVENLY CRUCIFIX — NPCs, LOCATIONS, INFO CARDS
  // ═══════════════════════════════════════════════════════════
  const CRUCIFIX_NPCS = [
    {
      id: 'npc-varga', name: 'Elena Varga', role: 'Compact Fixer',
      organization: 'O1 (Vantablack Compact)',
      attributes: { strength: 2, agility: 3, wits: 4, empathy: 2 },
      skills: { manipulate: 4, command: 3, investigate: 3, firearms: 2 },
      disposition: 1,
      secret: 'She has been ordered to close the deal before the Compact writes off the operation. Her career depends on this.',
      goal: 'Complete the sale of the crucifix to Warhol and disappear.',
      artifactConnection: 'No direct handling. Views the crucifix as merchandise.',
      locations: ['L1', 'L3'],
      positiveResult: 'Reveals the buyer network and handoff timeline.',
      negativeResult: 'O1 advances 1 square. Cleaner dispatched.',
      daNotes: ''
    },
    {
      id: 'npc-reiner', name: 'Klaus Reiner', role: 'Thief & Bearer',
      organization: 'O3 (Independent — the thief)',
      attributes: { strength: 3, agility: 2, wits: 2, empathy: 2 },
      skills: { sneak: 3, deftHands: 3, endure: 5, firearms: 2 },
      disposition: 2,
      secret: 'He is the bearer. The crucifix has made him immortal and manic — he cannot be killed while wearing it.',
      goal: 'Keep the crucifix. He believes he is divinely chosen.',
      artifactConnection: 'Bearer. Wears the crucifix at all times. Has died and resurrected at least three times.',
      locations: ['L2', 'L5'],
      positiveResult: 'Agents can identify the bearer and containment conditions.',
      negativeResult: 'O3 advances 1 square. Reiner becomes more erratic.',
      daNotes: ''
    },
    {
      id: 'npc-countess', name: 'Countess Martinice', role: 'Custodian Heir',
      organization: 'O2 (Independent — custodian family)',
      attributes: { strength: 2, agility: 2, wits: 4, empathy: 3 },
      skills: { lore: 4, investigate: 3, manipulate: 3, command: 2 },
      disposition: 3,
      secret: 'Her family has guarded the shrine site for generations. She holds the key to locating the original meteoric iron source.',
      goal: 'Protect her family\'s legacy and prevent the shrine from being exploited.',
      artifactConnection: 'Family custodian lineage. Knows the shrine\'s location and history.',
      locations: ['L4'],
      positiveResult: 'Reveals shrine location and family records.',
      negativeResult: 'Records destroyed. O2 advances 1 square.',
      daNotes: ''
    },
    {
      id: 'npc-voss-card', name: 'Cardinal Voss', role: 'Vatican Recovery Lead',
      organization: 'O4 (The Catholic Church)',
      attributes: { strength: 2, agility: 2, wits: 5, empathy: 4 },
      skills: { lore: 5, command: 4, manipulate: 4, investigate: 3 },
      disposition: 2,
      secret: 'Authorized to use any means necessary to recover the crucifix. The Vatican will disavow him if exposed.',
      goal: 'Recover the crucifix for the Church and suppress knowledge of its true nature.',
      artifactConnection: 'Has studied Church records on the crucifix. Understands it as both holy relic and dangerous artifact.',
      locations: ['L1', 'L5'],
      positiveResult: 'May negotiate shared custody if agents demonstrate containment capability.',
      negativeResult: 'O4 advances 1 square. Church accelerates recovery.',
      daNotes: ''
    },
    {
      id: 'npc-warhol', name: 'Andy Warhol', role: 'The Buyer',
      organization: 'O5 (Independent — celebrity collector)',
      attributes: { strength: 2, agility: 2, wits: 3, empathy: 3 },
      skills: { manipulate: 3, lore: 2 },
      disposition: 4,
      secret: 'He is dying and believes the crucifix will save him. He is wrong — it will only make him unkillably dying.',
      goal: 'Acquire the crucifix as both art and salvation.',
      artifactConnection: 'None yet. Obsessed with the idea of the crucifix as a transformative artifact.',
      locations: ['L5'],
      positiveResult: 'Can be convinced to withdraw if agents show him the truth.',
      negativeResult: 'O5 advances 1 square. Warhol\'s representatives escalate.',
      daNotes: ''
    }
  ];

  const CRUCIFIX_LOCATIONS = [
    { id: 'L1', name: 'Prague Safe House', description: 'Compact operational base in Prague\'s Old Town. Varga coordinates from here.', availability: 'clue-locked', npcsPresent: 'Elena Varga, Cardinal Voss (after O4M1)', cluesPresent: ['I1', 'I2'], organizations: ['O1', 'O4'] },
    { id: 'L2', name: 'Vienna — Reiner\'s Apartment', description: 'The thief\'s last known residence. Signs of struggle and manic behavior.', availability: 'clue-locked', npcsPresent: 'Klaus Reiner (unpredictable schedule)', cluesPresent: ['I3', 'I4'], organizations: ['O3'] },
    { id: 'L3', name: 'Prague Currency Exchange', description: 'Compact financial infrastructure node. Wire transfers and courier dispatches.', availability: 'clue-locked', npcsPresent: 'Elena Varga', cluesPresent: ['I5', 'I6'], organizations: ['O1'] },
    { id: 'L4', name: 'Countess Martinice\'s Estate, Brno', description: 'Aristocratic estate with family archive. The Countess guards her family\'s custodial secrets.', availability: 'clue-locked', npcsPresent: 'Countess Martinice', cluesPresent: ['I7', 'I8'], organizations: ['O2', 'O4'] },
    { id: 'L5', name: 'Bavarian Hunting Lodge', description: 'Remote lodge in the Bavarian Forest. The exchange site for the crucifix.', availability: 'clue-locked', npcsPresent: 'All parties converge on Day 1', cluesPresent: ['I9', 'I10'], organizations: ['O1', 'O3', 'O4', 'O5'] },
    { id: 'L6', name: 'Bohemian Forest Shrine', description: 'Ancient shrine site where meteoric iron was originally mined. The source of the crucifix\'s power.', availability: 'clue-locked', npcsPresent: 'Church excavation team (after O4M2)', cluesPresent: ['I11', 'I12'], organizations: ['O4', 'O6'] },
    { id: 'L7', name: 'Munich Gallery', description: 'Warhol\'s exhibition space and front for artifact acquisition.', availability: 'clue-locked', npcsPresent: 'Warhol\'s representatives', cluesPresent: ['I13'], organizations: ['O5'] }
  ];

  const CRUCIFIX_INFO_CARDS = [
    { id: 'I1', content: 'The crucifix was stolen from a private chapel in Brno. The thief used insider knowledge of the estate\'s security.', type: 'supporting-intel', foundAt: ['L1'], knownBy: ['Elena Varga'], hqFallback: 'Day 1' },
    { id: 'I2', content: 'Vantablack Compact financed the theft. Elena Varga is the operational lead.', type: 'supporting-intel', foundAt: ['L1', 'L3'], knownBy: ['Elena Varga'], hqFallback: 'Day 2' },
    { id: 'I3', content: 'Klaus Reiner is the thief. He has been wearing the crucifix since the theft and has survived multiple fatal incidents.', type: 'containment-truth', truthStatus: 'trigger', foundAt: ['L2'], knownBy: ['Klaus Reiner'], hqFallback: 'Day 2' },
    { id: 'I4', content: 'The crucifix grants conditional immortality: the bearer cannot die while wearing it, but each near-death resurrection costs +2 Corruption.', type: 'containment-truth', truthStatus: 'effect', foundAt: ['L2'], knownBy: ['Klaus Reiner (experiencing it)'], hqFallback: 'Day 3' },
    { id: 'I5', content: 'The Compact has arranged a sale to Andy Warhol for an undisclosed sum. The exchange is scheduled at a Bavarian hunting lodge.', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['Elena Varga'], hqFallback: 'Day 3' },
    { id: 'I6', content: 'Wire transfer records trace the Compact\'s payment network to Warhol\'s Factory accounts.', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['Elena Varga'], hqFallback: 'Day 4' },
    { id: 'I7', content: 'The Countess\'s family has guarded the Bohemian Forest shrine for over 400 years. The shrine contains the original meteoric iron source.', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['Countess Martinice'], hqFallback: 'Day 4' },
    { id: 'I8', content: 'The crucifix was forged from meteoric iron at the Bohemian shrine in the 14th century. Multiple fragments remain at the site.', type: 'containment-truth', truthStatus: 'appetite', foundAt: ['L4', 'L6'], knownBy: ['Countess Martinice'], hqFallback: 'Day 5' },
    { id: 'I9', content: 'The bearer must believe they are immortal for the crucifix to activate. Physical contact plus absolute conviction triggers the effect.', type: 'containment-truth', truthStatus: 'quiescence', foundAt: ['L5'], knownBy: ['—'], hqFallback: 'Day 5' },
    { id: 'I10', content: 'Removing the crucifix from the bearer terminates the immortality effect — but the bearer will not voluntarily remove it.', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['Cardinal Voss'], hqFallback: 'Day 6' },
    { id: 'I11', content: 'Additional meteoric iron fragments at the shrine mean the threat is replicable — more crucifixes could be forged.', type: 'supporting-intel', foundAt: ['L6'], knownBy: ['—'], hqFallback: '—' },
    { id: 'I12', content: 'The shrine must be secured to prevent additional artifacts from being created from the remaining meteoric iron.', type: 'supporting-intel', foundAt: ['L6'], knownBy: ['—'], hqFallback: '—' },
    { id: 'I13', content: 'Warhol\'s interest is personal — he believes the crucifix\'s immortality can cure his deteriorating health.', type: 'supporting-intel', foundAt: ['L7'], knownBy: ['Warhol\'s representatives'], hqFallback: 'Day 6' }
  ];

  // ═══════════════════════════════════════════════════════════
  // THE BARBARIAN'S CUP CASE DATA
  // ═══════════════════════════════════════════════════════════

  const BARBARIANS_CUP = {
    caseId: 'VC-MO-87-004',
    caseName: 'The Barbarian\'s Cup',
    region: 'Macau / Hong Kong / South China Sea',
    currentDay: 14,
    shiftsFilled: [],
    organizations: [
      {
        id: 'O1', name: 'The Broker — J. Rosário', value: 6, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 6, label: 'O1M1', description: 'Rosário\'s nerve cracks. He contacts the Covenant through an old backchannel and offers information selectively. He reveals bidders\' code names but not their real identities.', crossAdvances: [{ targetOrg: 'O4', squares: 1 }], triggered: false },
          { day: 3, label: 'O1M2', description: 'Rosário tries to cancel the auction. The bidders refuse. The Al-Quds Front threatens his family. Rosário is now a hostage in his own operation.', crossAdvances: [{ targetOrg: 'O2', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'Rosário\'s cooperation is the key to the auction structure. His fear makes him unpredictable.',
        playerSigns: 'Antiques shop open at odd hours. Rosário chain-smoking on his balcony.',
        notes: 'Former Covenant informant 1979–1984. Relationship ended badly. He\'s terrified the Covenant wants revenge.'
      },
      {
        id: 'O2', name: 'Al-Quds Liberation Front', value: 8, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 8, label: 'O2M1', description: 'Private viewing. Farouk handles the cup (gloved) and is visibly shaken. Nasim is enraptured. The Front increases their bid to $5M. Nasim begins carrying a photograph of the cup.', crossAdvances: [], triggered: false },
          { day: 5, label: 'O2M2', description: 'Nasim takes operational control. Farouk is sidelined. The Front begins planning deployment — Nasim has identified a reservoir serving the Hong Kong New Territories.', crossAdvances: [{ targetOrg: 'O5', squares: 1 }], triggered: false },
          { day: 2, label: 'O2M3', description: 'The Front moves to Coloane. Nasim has stopped sleeping — 2 hours a night maximum. He believes the cup speaks to him.', crossAdvances: [{ targetOrg: 'O3', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'The Front is the catastrophe vector. Nasim wants to use the cup as a weapon.',
        playerSigns: 'Unfamiliar faces near the tea house. A rented Toyota parked in Coloane.',
        notes: 'Fictional extremist group. Cell leader Farouk is inexperienced and afraid. Nasim is the real danger.'
      },
      {
        id: 'O3', name: 'Daewon Pharmaceutical', value: 8, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 7, label: 'O3M1', description: 'Daewon corporate security team arrives in Macau. They set up a mobile lab in a Coloane warehouse. Park gives an interview about "an imminent breakthrough in holistic medicine."', crossAdvances: [{ targetOrg: 'O6', squares: 1 }], triggered: false },
          { day: 4, label: 'O3M2', description: 'Yoon\'s analysis of residue confirms: the poison kills everything. Including human cells. No therapeutic window. She tells Park. Park says "we can work with that." Yoon begins to have ethical doubts.', crossAdvances: [], triggered: false },
          { day: 2, label: 'O3M3', description: 'Daewon moves to the fort. They\'ve brought a biosafety container and a $7M cashier\'s check. Park plans to address the cup directly before taking possession.', crossAdvances: [{ targetOrg: 'O2', squares: 1 }], triggered: false }
        ],
        linkedEffects: 'Daewon\'s theory is elegant, plausible, and wrong. Yoon knows this.',
        playerSigns: 'Korean businessmen at the hotel. A biosafety van on Coloane.',
        notes: 'Seoul-based pharmaceutical company. CEO Park is a wellness-guru true believer. R&D head Yoon is having ethical doubts.'
      },
      {
        id: 'O4', name: 'The Monk — Shi Yánxìn', value: 5, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 6, label: 'O4M1', description: 'The monk makes contact with the agents. He\'s been watching them since they arrived. He reveals the cup\'s true history and what broke it.', crossAdvances: [], triggered: false },
          { day: 3, label: 'O4M2', description: 'The monk reveals the quiescence condition — a surface never touched by violence. He offers the stone from Bodhidharma\'s cave if agents promise to let him see the cup one last time.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The monk is the key to safe containment. He has the quiescence stone and knows the restoration ritual.',
        playerSigns: 'An old monk feeding pigeons in Camões Garden. Green tea left on a bench.',
        notes: 'Age 74, last guardian. Hid the cup at age 14. Spent 8 years in a labor camp. Has been searching for 38 years.'
      },
      {
        id: 'O5', name: 'Macau Judiciary Police', value: 5, active: false, dormant: true,
        activationCondition: 'Triggered by O2M2 (Front planning detected), gunfire/violence at any Macau location, or agents bringing Inspector Guterres into the loop.',
        squaresConsumed: [],
        milestones: [
          { day: 5, label: 'O5M1', description: 'Inspector Guterres opens an investigation into "suspicious financial activity" linked to Rosário. Police presence increases at L1, L2, and L3.', crossAdvances: [], triggered: false },
          { day: 2, label: 'O5M2', description: 'Guterres connects Rosário to the Front. Counter-terrorism protocols activate. Macau security forces are now looking for the same people the agents are tracking.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Police presence complicates covert operations and may trigger a raid on the auction.',
        playerSigns: 'Increased patrols. Plainclothes officers at the bank. Guterres asking questions.',
        notes: 'Dormant until triggered. Led by Inspector Matias Guterres — methodical, honest, under-resourced.'
      },
      {
        id: 'O6', name: 'Chinese State Security', value: 7, active: false, dormant: true,
        activationCondition: 'Triggered by O3M1 (Daewon activity detected), agents accessing Hong Kong dealer records, or auction location becoming known to Chinese intelligence.',
        squaresConsumed: [],
        milestones: [
          { day: 4, label: 'O6M1', description: 'Agent Chen of the MSS identifies the cup as stolen cultural property. A surveillance team is deployed to Macau.', crossAdvances: [], triggered: false },
          { day: 2, label: 'O6M2', description: 'The MSS team moves to Coloane. Chen has orders to secure the cup for the state — "by any means necessary."', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'MSS intervention is a wildcard at the climax. Chen will not let the cup leave Chinese territory.',
        playerSigns: 'A woman in a gray coat. A car that appears at multiple locations.',
        notes: 'Dormant until triggered. Led by Agent Chen Wei — professional, silent, operating at the edge of her mandate.'
      },
      { id: 'O7', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O8', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' }
    ],
    relicMilestones: [
      { day: 8, description: 'The cup\'s Corruption signature spikes. It\'s been moved for a private viewing. A plant in the viewing room is dead. The bidders have seen it.' },
      { day: 5, description: 'The cup\'s "personality" becomes more pronounced. It starts humming audibly. Rosário can\'t sleep in the same building. The Front\'s second-in-command becomes obsessed.' },
      { day: 1, description: 'CATASTROPHE: The auction at an abandoned Portuguese fort on Coloane. All parties converge. The cup is on a table. Someone is about to win. The monk is in the back, waiting.' }
    ],
    currentDayDisplay: 14,
    relicSheet: {
      name: 'Bodhidharma\'s Teacup (The Barbarian\'s Cup)',
      tier: 'Tier 2 — Threatening',
      artifactDie: 'd8',
      activationCondition: 'Inner surface + liquid = lethal transmutation. Accidental contact still poisons. Deliberate use costs +2 Corruption.',
      mechanicalEffect: 'Absolute lethality — kills all living things within 60–90 seconds. Liquid retains all physical properties. Undetectable by conventional tests. Sunlight degrades poison over 24 hours.',
      fracture: 'When Artifact Die steps past d4: the crack splits open. Every liquid within 50 meters becomes poison for 60 seconds.'
    }
  };
  finalizeOrgSquares(BARBARIANS_CUP.organizations);
  finalizeShiftsFilled(BARBARIANS_CUP);

  const BARBARIANS_NPCS = [
    { id: 'npc-rosario', name: 'João "The Jesuit" Rosário', role: 'Antiquities Broker — Former Seminarian', organization: 'O1 (The Broker)', attributes: { strength: 2, agility: 3, wits: 4, empathy: 3 }, skills: { manipulate: 4, investigate: 3, lore: 3 }, disposition: 2, secret: 'Former Covenant informant from 1979–1984. The relationship ended badly. He\'s been waiting for the Covenant to come back for him.', goal: 'Close the auction. Get the cup out of his life. Survive whatever comes next.', artifactConnection: 'Handled the cup once, with three layers of gloves. Has not slept properly since.', locations: ['L2'], positiveResult: 'Cooperates with agents who offer him a way out that preserves his reputation.', negativeResult: 'If threatened, activates dead-man switch — auction closes early. Lose 2 shifts.', daNotes: '' },
    { id: 'npc-farouk', name: 'Farouk Al-Masri', role: 'Cell Leader — Al-Quds Liberation Front', organization: 'O2 (Al-Quds Liberation Front)', attributes: { strength: 2, agility: 2, wits: 3, empathy: 4 }, skills: { manipulate: 3, command: 2 }, disposition: 2, secret: 'He has never killed anyone. He was sent as a low-priority errand. He touched the cup and realized it IS real. Now he\'s trapped.', goal: 'Get out. He doesn\'t know how. He\'s hoping someone will intervene.', artifactConnection: 'Handled during viewing. Hands shook. Can still feel the cold in his palms.', locations: ['L5'], positiveResult: 'Can be flipped — a Manipulate (Diff 3) or genuine human appeal convinces him to withdraw the bid.', negativeResult: 'If confronted in front of Nasim, Farouk cannot show weakness.', daNotes: '' },
    { id: 'npc-nasim', name: 'Nasim', role: 'Second-in-Command — The Real Danger', organization: 'O2 (Al-Quds Liberation Front)', attributes: { strength: 3, agility: 4, wits: 3, empathy: 2 }, skills: { firearms: 3, endure: 4, manipulate: 2 }, disposition: 1, secret: 'Believes the cup is a divine instrument. Plans to poison a Hong Kong reservoir. Has not slept more than 2 hours a night since the viewing.', goal: 'Acquire the cup. Use it. He will not be stopped by argument — only by force or superior tactics.', artifactConnection: 'Handled once, gloved, during viewing. Carries a photograph of the cup over his heart.', locations: ['L5'], positiveResult: 'Cannot be reasoned with, but can be outmaneuvered — he\'s a sleep-deprived fanatic.', negativeResult: 'If Nasim touches the cup, he will try to activate it immediately.', daNotes: '' },
    { id: 'npc-park', name: 'Dr. Park Min-ho', role: 'CEO — Daewon Pharmaceutical', organization: 'O3 (Daewon Pharmaceutical)', attributes: { strength: 2, agility: 2, wits: 3, empathy: 5 }, skills: { command: 4, manipulate: 4, lore: 2 }, disposition: 4, secret: 'Believes acquiring the cup is his destiny, revealed in a meditation retreat. Has not told his board the cup kills everything.', goal: 'Acquire the cup. "Understand" it. Use its "gift" to cure disease.', artifactConnection: 'Never touched it. Saw photographs. Felt "an immediate energetic connection."', locations: ['L4'], positiveResult: 'Will talk to anyone about his vision — extracting information is easy.', negativeResult: 'Cannot be convinced the cup is dangerous. Smiles, offers kombucha, has security escort agents out.', daNotes: '' },
    { id: 'npc-yoon', name: 'Dr. Yoon Seo-yeon', role: 'Head of R&D — Daewon Pharmaceutical', organization: 'O3 (Daewon Pharmaceutical)', attributes: { strength: 2, agility: 3, wits: 5, empathy: 3 }, skills: { tech: 4, investigate: 4, heal: 3 }, disposition: 2, secret: 'She swabbed the viewing room table. The residue killed everything. She told Park. He said "we can work with that." She\'s starting to think she might need to be a whistleblower.', goal: 'Understand the mechanism. If it cannot be controlled, prevent Daewon from releasing anything derived from it.', artifactConnection: 'Never touched the cup. Swabbed the table where it sat. The residue killed everything in her lab.', locations: ['L4'], positiveResult: 'Most important ally in the case — can provide Daewon security details, bid amount, and sabotage from within.', negativeResult: 'If threatened, she withdraws. She\'s not a hero — she\'s a scientist who wants to survive.', daNotes: '' },
    { id: 'npc-shixin', name: 'Shi Yánxìn', role: 'The Last Guardian — Shaolin Monk, Age 74', organization: 'O4 (The Monk)', attributes: { strength: 2, agility: 3, wits: 5, empathy: 5 }, skills: { lore: 5, endure: 4, manipulate: 3, heal: 3 }, disposition: 4, secret: 'Blames himself for everything. Has been searching for the cup for 38 years. Carries the quiescence stone sewn into his robe.', goal: 'Recover the cup. Restore it if possible. Contain it if not. Tell it he\'s sorry.', artifactConnection: 'Last person to hold the cup before it was hidden. Was 14. Remembers it humming warm — like a cat purring.', locations: ['L6'], positiveResult: 'Key to safe containment. Has the stone from Bodhidharma\'s cave. Knows the restoration ritual.', negativeResult: 'If agents treat the cup as merely a threat, he still helps — but withholds the stone.', daNotes: '' },
    { id: 'npc-guterres', name: 'Inspector Matias Guterres', role: 'Macau Judiciary Police', organization: 'O5 (Macau Judiciary Police)', attributes: { strength: 3, agility: 2, wits: 4, empathy: 3 }, skills: { investigate: 4, command: 3, firearms: 3 }, disposition: 2, secret: 'Has been a cop for 22 years. Doesn\'t believe in cursed teacups. Believes in evidence. The evidence doesn\'t make sense.', goal: 'Solve the case. He wants answers, not glory.', artifactConnection: 'None. Has not seen the cup. Has only seen its effects — dead orchid, Rosário\'s behavior, money trail.', locations: ['L2'], positiveResult: 'Can be an ally if agents are straight with him. Can provide police resources.', negativeResult: 'If agents lie to him, he investigates THEM. Methodical and patient.', daNotes: '' },
    { id: 'npc-chenwei', name: 'Agent Chen Wei', role: 'Chinese Ministry of State Security', organization: 'O6 (Chinese State Security)', attributes: { strength: 2, agility: 3, wits: 4, empathy: 2 }, skills: { investigate: 4, firearms: 3, command: 3, sneak: 3 }, disposition: 1, secret: 'Mid-level MSS officer. File led her to Macau. Discovered the cup is being bid on by terrorists and a foreign pharma company. Operating at the edge of her mandate.', goal: 'Secure the cup for the PRC. Prevent it from leaving Chinese territory.', artifactConnection: 'Has not touched the cup. Has surveillance photographs. Something about the photographs is wrong.', locations: ['L7'], positiveResult: 'Can be reasoned with if agents acknowledge Chinese sovereignty and offer a solution keeping the cup in the region.', negativeResult: 'If agents try to smuggle the cup out, she intervenes with deadly force. Six armed operatives.', daNotes: '' }
  ];

  const BARBARIANS_LOCATIONS = [
    { id: 'L1', name: 'Banco de Macau, Safety Deposit Vault', description: 'Portuguese colonial-era bank on Macau\'s main avenue. The cup is in box 419. Vault is time-locked — accessible during banking hours.', availability: 'Day shifts only', npcsPresent: 'Bank Manager Oliveira', cluesPresent: ['I1', 'I2'], organizations: ['O1'], positiveResult: 'Confirms cup location and Rosário\'s rental records.', negativeResult: 'Botched infiltration triggers silent alarm. Cup becomes police evidence.', daNotes: '' },
    { id: 'L2', name: 'Rosário\'s Antique Shop, Rua de São Paulo', description: 'Narrow three-story shop near the ruins of St. Paul\'s. Ground floor: antiques. Second floor: office. Third floor: apartment — he sleeps on the couch because his bedroom feels wrong.', availability: 'Day and Evening', npcsPresent: 'João Rosário', cluesPresent: ['I3', 'I4', 'I5'], organizations: ['O1'], positiveResult: 'Rosário cooperates if treated with respect. Reveals auction structure.', negativeResult: 'If humiliated, triggers dead-man switch.', daNotes: '' },
    { id: 'L3', name: 'The Tea House, Travessa da Paixão', description: 'Traditional Macanese tea house. Room 7 still contains the viewing table. A potted orchid in the corner is dead.', availability: 'All shifts', npcsPresent: 'Tea House Owner', cluesPresent: ['I8', 'I9', 'I10'], organizations: ['O1', 'O2', 'O3'], positiveResult: 'Dead orchid is forensic evidence of cup effect. Owner saw everything.', negativeResult: 'If agents disturb room before gathering evidence, Rosário has it cleaned.', daNotes: '' },
    { id: 'L4', name: 'Daewon Pharmaceutical Regional Office, Hong Kong', description: 'Sleek 23rd-floor office in Central District. Floor-to-ceiling windows, meditation room, kombucha on tap. R&D briefing room where Yoon analyzes the cup data.', availability: 'Day shifts only', npcsPresent: 'Dr. Park Min-ho, Dr. Yoon Seo-yeon', cluesPresent: ['I10', 'I14', 'I15'], organizations: ['O3'], positiveResult: 'Yoon may flip. Park will talk to anyone.', negativeResult: 'Park is unreachable by reason. Security escorts agents out.', daNotes: '' },
    { id: 'L5', name: 'Al-Quds Safe House, Coloane Village', description: 'Rented fishing cottage on southern Coloane coast. Isolated, overgrown. Farouk sleeps in the car. Nasim sits in the dark with a photograph of the cup.', availability: 'All shifts, 1 shift travel', npcsPresent: 'Farouk Al-Masri, Nasim', cluesPresent: ['I12', 'I17', 'I19'], organizations: ['O2'], positiveResult: 'Farouk reachable if approached alone. Cork board has target maps.', negativeResult: 'Nasim attacks suicidally if agents detected.', daNotes: '' },
    { id: 'L6', name: 'Camões Garden, Macau', description: 'Quiet public garden with grottoes, banyan trees, old men playing chess. Every morning, an old monk sits on the same bench feeding pigeons.', availability: 'All shifts', npcsPresent: 'Shi Yánxìn (every Morning)', cluesPresent: ['I7', 'I8', 'I18'], organizations: ['O4'], positiveResult: 'Monk shares everything if agents show respect for the cup.', negativeResult: 'If dismissive, monk still helps but withholds the stone.', daNotes: '' },
    { id: 'L7', name: 'Fortaleza de Coloane (Abandoned Portuguese Fort)', description: 'Crumbling 17th-century fort on Coloane\'s eastern headland. Central courtyard cleared for auction. Single wooden table, folding chairs, bare bulb. Wind constant. Sea loud.', availability: 'After O2M3 (Day 2)', npcsPresent: 'All parties converge Day 1 Evening', cluesPresent: ['I22'], organizations: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'], positiveResult: 'Agents arrive before envelopes opened — can negotiate, intervene, intercept.', negativeResult: 'If envelopes opened, winner has cup. Nasim will try to run toward the sea.', daNotes: '' }
  ];

  const BARBARIANS_INFO_CARDS = [
    { id: 'I1', content: 'Bodhidharma\'s Teacup is in safety deposit box 419 at the Banco de Macau, rented under "Silva Import/Export" — Rosário\'s shell company.', type: 'supporting-intel', foundAt: ['L1'], knownBy: ['Rosário'], hqFallback: 'Day 9' },
    { id: 'I2', content: '"Silva Import/Export" is a Macau-registered shell with no physical office. Bank records show large deposits from Hong Kong, Seoul, Zurich.', type: 'supporting-intel', foundAt: ['L1'], knownBy: ['Rosário'], hqFallback: 'Day 8' },
    { id: 'I3', content: 'Rosário organized a blind sealed-bid auction with a 10-day window. Three bidders confirmed: "Eastern Buyer," "Wellness Group," and "The Pilgrim."', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Rosário'], hqFallback: 'Day 8' },
    { id: 'I4', content: 'Rosário was a Covenant informant from 1979–1984. The relationship ended badly when he sold an artifact the Covenant wanted.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Rosário'], hqFallback: 'Day 7' },
    { id: 'I5', content: 'Bidders identified: Al-Quds Liberation Front ($4.2M), Daewon Pharmaceutical ($7M), and "The Pilgrim" — a private individual whose identity Rosário doesn\'t know.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Rosário (O1M1)'], hqFallback: 'Day 7' },
    { id: 'I6', content: 'Rosário attempted to cancel the auction. The Front threatened his family. He is now a hostage in his own operation.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Rosário (O1M2)'], hqFallback: 'Day 5' },
    { id: 'I7', content: 'The cup was made at Shaolin Temple ~518 CE for Bodhidharma — the monk who brought Chan Buddhism to China. It brewed "poison to delusion."', type: 'supporting-intel', foundAt: ['L6'], knownBy: ['Shi Yánxìn'], hqFallback: 'Day 7' },
    { id: 'I8', content: 'In 1966, Red Guards sacked Shaolin. A 14-year-old novice hid the cup. Without the daily ritual for 20 years, "poison to delusion" became literal poison. The cup doesn\'t know it changed.', type: 'supporting-intel', foundAt: ['L3', 'L6'], knownBy: ['Shi Yánxìn'], hqFallback: 'Day 6' },
    { id: 'I9', content: 'During the Front\'s private viewing, a drop of water accidentally touched the cup. The potted orchid was dead within 60 seconds. Nasim was enraptured.', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['Tea House Owner', 'Farouk'], hqFallback: 'Day 7' },
    { id: 'I10', content: 'Daewon believes the poison mechanism can be isolated to selectively kill cancer cells and viruses. This theory is wrong. The poison kills everything.', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['Park', 'Yoon'], hqFallback: 'Day 6' },
    { id: 'I11', content: 'The looter found the cup, sold it for $200 in Hong Kong. The dealer contacted Rosário. The looter\'s sales receipt is in the safety deposit box with the cup.', type: 'supporting-intel', foundAt: ['L1'], knownBy: ['—'], hqFallback: 'Day 7' },
    { id: 'I12', content: 'Nasim\'s target: Tai Lam Chung Reservoir in Hong Kong New Territories — supplies 1.2 million people. Maps on the cottage cork board.', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['Nasim', 'Farouk (if flipped)'], hqFallback: 'Day 4' },
    { id: 'I13', content: 'Inspector Guterres has opened an investigation into suspicious financial activity linked to Rosário. Police presence at L1, L2, L3.', type: 'supporting-intel', foundAt: ['—'], knownBy: ['Guterres (O5M1)'], hqFallback: 'Day 5' },
    { id: 'I14', content: 'Yoon\'s lab analysis confirms: the poison kills everything — human cells, bacteria, viruses. No selectivity. No therapeutic window. A single molecule is as lethal as a gallon.', type: 'containment-truth', truthStatus: 'effect', foundAt: ['L4'], knownBy: ['Yoon (O3M2)'], hqFallback: 'Day 4' },
    { id: 'I15', content: 'Park\'s personal journal records his conviction that the cup is his destiny. "The universe does not make mistakes."', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['Park'], hqFallback: 'Day 4' },
    { id: 'I16', content: 'Agent Chen of the MSS has identified the cup as stolen cultural property. A surveillance team is deployed to Macau.', type: 'supporting-intel', foundAt: ['—'], knownBy: ['Chen (O6M1)'], hqFallback: 'Day 4' },
    { id: 'I17', content: 'Farouk wants out. He has never killed anyone. He prays five times a day and adds a silent sixth prayer: "Please let someone stop this."', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['Farouk (O2M2)'], hqFallback: 'Day 3' },
    { id: 'I18', content: 'The quiescence stone from Bodhidharma\'s cave — smooth, dark, sewn into the monk\'s robe. Cup stored upside-down on this stone goes quiet.', type: 'containment-truth', truthStatus: 'quiescence', foundAt: ['L6'], knownBy: ['Shi Yánxìn (O4M2)'], hqFallback: 'Day 3' },
    { id: 'I19', content: 'Nasim believes the cup is the voice of God. He has written pages of "conversations" with it. He plans to die with it — martyrdom.', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['Nasim (O2M3)'], hqFallback: 'Day 2' },
    { id: 'I20', content: 'Guterres is planning a raid on Coloane. He\'s noticed the agents\' presence. They\'re on his board now.', type: 'supporting-intel', foundAt: ['—'], knownBy: ['Guterres (O5M2)'], hqFallback: 'Day 2' },
    { id: 'I21', content: 'MSS intervention imminent. Chen has orders to secure the cup "by any means necessary." Six operatives, all armed.', type: 'supporting-intel', foundAt: ['—'], knownBy: ['Chen (O6M2)'], hqFallback: 'Day 2' },
    { id: 'I22', content: 'Synthesis: The cup was never a weapon. It was a tool of awakening, confused by 20 years of silence. The monk can help contain it. Some things that were once holy can still be saved.', type: 'containment-truth', truthStatus: 'synthesis', foundAt: ['L7'], knownBy: ['—'], hqFallback: '—' }
  ];

  // ═══════════════════════════════════════════════════════════
  // THE BOUDICA PACT CASE DATA
  // ═══════════════════════════════════════════════════════════

  const BOUDICA_PACT = {
    caseId: 'VC-UK-87-007',
    caseName: 'The Boudica Pact',
    region: 'Staffordshire, England / London / Rome / Birmingham',
    currentDay: 7,
    shiftsFilled: [],
    organizations: [
      {
        id: 'O1', name: 'Birmingham Museum', value: 5, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 4, label: 'O1M1', description: 'Dr. Price notices items in the Anglo-Saxon gallery have shifted overnight — all in the same direction. She increases security.', crossAdvances: [], triggered: false },
          { day: 2, label: 'O1M2', description: 'Mr. Okonkwo, the night guard, files a report: the coins are "glowing." His supervisor dismisses it. Okonkwo decides to help anyone who takes him seriously.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Museum holds the Staffordshire Hoard — any gold coin from the hoard can restore the binding.',
        playerSigns: 'Museum security on alert. Dr. Price defensive about the collection.',
        notes: 'Curator Dr. Helen Price does not believe in cursed coins. She has been having headaches since the keystone was removed.'
      },
      {
        id: 'O2', name: 'Vatican Archive', value: 6, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 5, label: 'O2M1', description: 'Agents arrive in Rome. Father Matteo confirms the ledger exists but access requires authorization. A six-week backlog can be bypassed with Church credentials or a Manipulate (Diff 2).', crossAdvances: [], triggered: false },
          { day: 3, label: 'O2M2', description: 'The ledger is accessed. It contains the pact terms: "gold in earth, binding holds. Gold removed, subject returns. Gold returned, binding restored."', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The ledger provides the binding words and confirms any gold from the hoard works.',
        playerSigns: 'Vatican bureaucracy. Father Matteo waiting for someone to ask about the ledger.',
        notes: 'Codex Mercaturae Britanniae — a Roman trade ledger mis-catalogued as a medieval merchant\'s book.'
      },
      {
        id: 'O3', name: 'Ministry of Agriculture', value: 6, active: false, dormant: true,
        activationCondition: 'Activates when blight radius exceeds 5 miles, civilian reports insect behavior, or Day 3 (automatic).',
        squaresConsumed: [],
        milestones: [
          { day: 3, label: 'O3M1', description: 'The Ministry declares an "Agricultural Health Zone" in Staffordshire. Roadblocks appear. Quarantine checkpoints staffed. Mr. Philip Croft assigned to investigate.', crossAdvances: [], triggered: false },
          { day: 1, label: 'O3M2', description: 'Quarantine expands. Birmingham on alert. Museum increases security. The re-burial site is inside the quarantine zone.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Quarantine restricts movement and complicates museum infiltration and re-burial.',
        playerSigns: 'Roadblocks on county roads. Officials who don\'t know what they\'re containing.',
        notes: 'Dormant until triggered. Once active, squares fill from activation day forward.'
      },
      {
        id: 'O4', name: 'The Farmer\'s Trail', value: 4, active: false, dormant: true,
        activationCondition: 'Activates when agents actively search for Arthur Dunn.',
        squaresConsumed: [],
        milestones: [
          { day: 4, label: 'O4M1', description: 'Agents trace Dunn to a fishing lodge in Scotland. He arrived, stayed two nights, left abruptly. "Said something was calling him."', crossAdvances: [], triggered: false },
          { day: 2, label: 'O4M2', description: 'Dunn is found — in a motel near Lichfield, 20 miles from his farm. Hasn\'t slept. "I can still feel it. It\'s not in my pocket anymore. I threw it in a river. But I can still feel it."', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Dunn\'s trail confirms the coin is unrecoverable — agents must use a museum coin.',
        playerSigns: 'A locked cottage. Piling post. A fishing license found in Scotland.',
        notes: 'Dormant until agents search for Dunn. The coin is in a Scottish river — irrecoverable.'
      },
      { id: 'O5', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O6', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O7', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O8', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' }
    ],
    relicMilestones: [
      { day: 5, description: 'The silence spreads. Birds stop singing within 3 miles of the binding locus. The British Library yields Eadwine\'s chronicle — references to "the queen who would not leave."' },
      { day: 3, description: 'The binding locus begins breathing — soil rises and falls like a chest. The blight radius is now 5 miles. Livestock in the zone are stillborn.' },
      { day: 1, description: 'CATASTROPHE: The voice. Someone very hungry, very far away, calling. The ground is breathing. The blight radius is 10 miles. The entity is about to manifest.' }
    ],
    currentDayDisplay: 7,
    relicSheet: {
      name: 'The Keystone Coin (The Boudica Binding)',
      tier: 'Tier 2 — Threatening',
      artifactDie: 'd6',
      activationCondition: 'The coin does not activate. Its effect is passive — when buried at the binding locus, it sustains the pact. When removed, the binding weakens.',
      mechanicalEffect: 'Binding sustenance: gold in earth = entity dormant. Gold removed = entity wakes. Re-burial ritual restores binding — 10 minutes, +2 Corruption.',
      fracture: 'If the ritual fails (d4 rolls 1): coin flies upward, entity partially manifests for 60 seconds. +3 Corruption to everyone at locus.'
    }
  };
  finalizeOrgSquares(BOUDICA_PACT.organizations);
  finalizeShiftsFilled(BOUDICA_PACT);

  const BOUDICA_NPCS = [
    { id: 'npc-albright', name: 'Mrs. Albright', role: 'Village Pub Owner', organization: 'Independent', attributes: { strength: 2, agility: 2, wits: 3, empathy: 4 }, disposition: 4, secret: 'Has been having dreams of a woman in red walking the fields. The dreams started the night Dunn vanished.', goal: 'Help the agents understand what\'s happening to her village.', artifactConnection: 'None. But she knows everyone and everything.', locations: ['L2'], positiveResult: 'Provides local knowledge, Dunn\'s habits, and pub gossip — including who else noticed the blight.', negativeResult: 'If dismissed, she stops talking. Information lost.', daNotes: '' },
    { id: 'npc-price', name: 'Dr. Helen Price', role: 'Museum Curator', organization: 'O1 (Birmingham Museum)', attributes: { strength: 2, agility: 2, wits: 5, empathy: 2 }, disposition: 2, secret: 'Doesn\'t believe in cursed coins. Has been having headaches since the keystone was removed — doesn\'t connect them.', goal: 'Protect the Staffordshire Hoard. She\'s spent 10 years studying it.', artifactConnection: 'None. Studying the hoard for a decade. She\'s noticed the coins feel warm.', locations: ['L3'], positiveResult: 'Evidence might convince her. A scientist at heart — show her the blight is real.', negativeResult: 'Protective of the hoard. Will not lend a coin without extraordinary proof.', daNotes: '' },
    { id: 'npc-okonkwo', name: 'Mr. Okonkwo', role: 'Night Security Guard', organization: 'O1 (Birmingham Museum)', attributes: { strength: 3, agility: 2, wits: 3, empathy: 4 }, disposition: 3, secret: 'Has seen the coins glow — a faint reddish warmth visible only in peripheral vision. Knows the patrol schedule and security gaps.', goal: 'Help anyone who takes him seriously. His supervisor dismissed his report.', artifactConnection: 'None. Observing anomalous effects in the museum.', locations: ['L3'], positiveResult: 'Provides patrol schedules, 90-second camera loop window, and security gaps.', negativeResult: 'If dismissed or mocked, he withdraws.', daNotes: '' },
    { id: 'npc-matteo', name: 'Father Matteo', role: 'Vatican Archivist', organization: 'O2 (Vatican Archive)', attributes: { strength: 2, agility: 2, wits: 5, empathy: 4 }, disposition: 3, secret: 'Has read the ledger. Knows it describes something that shouldn\'t be in a trade ledger. Has been waiting for someone to ask about it.', goal: 'Help the right people find the ledger. He\'s been waiting quietly.', artifactConnection: 'None. Curator of the ledger. Understands its significance.', locations: ['L5'], positiveResult: 'Confirms ledger existence, expedites access. Church credentials bypass the backlog.', negativeResult: 'Bound by procedure. Access delayed by 1 day if agents fail Manipulate roll.', daNotes: '' },
    { id: 'npc-croft', name: 'Philip Croft', role: 'Agricultural Inspector', organization: 'O3 (Ministry of Agriculture)', attributes: { strength: 2, agility: 2, wits: 4, empathy: 3 }, disposition: 3, secret: 'Has been investigating the blight for the Ministry. He knows it\'s not a crop disease — but he can\'t say that in his report.', goal: 'Find the real cause. His career depends on submitting a report, but he knows the report will be wrong.', artifactConnection: 'None. Observing the blight\'s effects.', locations: ['L1'], positiveResult: 'Provides soil analysis, blight radius data, and Ministry internal reports.', negativeResult: 'Cannot help openly — his report must follow Ministry protocols.', daNotes: '' },
    { id: 'npc-dunn', name: 'Arthur Dunn', role: 'Missing Farmer', organization: 'O4 (The Farmer\'s Trail)', attributes: { strength: 4, agility: 2, wits: 2, empathy: 3 }, disposition: 2, secret: 'Threw the coin in a Scottish river. Has been circling Staffordshire ever since. Can feel the coin calling him. Exhausted, confused, and increasingly desperate.', goal: 'Go home. He can\'t. Something won\'t let him.', artifactConnection: 'Handled the coin. Carried it for days. Can still feel it.', locations: ['L7'], positiveResult: 'Confirms the coin is unrecoverable. Provides narrative weight.', negativeResult: 'If found too late, Dunn may have already collapsed from exhaustion.', daNotes: '' },
    { id: 'npc-baker', name: 'Reverend Baker', role: 'Cormsil Vicar', organization: 'Independent (Church of England)', attributes: { strength: 2, agility: 2, wits: 3, empathy: 5 }, disposition: 4, secret: 'Found references to the 1882 compact in the parish records. Doesn\'t understand what it means but knows it\'s important.', goal: 'Help the village. He\'s the spiritual center of Cormsil.', artifactConnection: 'None. Custodian of parish records.', locations: ['L2'], positiveResult: 'Provides parish records referencing the compact.', negativeResult: 'Limited by his lack of knowledge — can only point, not explain.', daNotes: '' },
    { id: 'npc-entity', name: 'The Entity ("The Red Woman")', role: 'Bound Presence', organization: 'Independent — the binding subject', attributes: { strength: 6, agility: 4, wits: 6, empathy: 1 }, disposition: 1, secret: 'Is Boudica\'s dying curse adopted by something older than the Celts. Cannot be killed — only bound.', goal: 'Be acknowledged. It wants the wrong of its binding to be recognized.', artifactConnection: 'The subject of the binding. The coin is its lock.', locations: ['L7'], positiveResult: 'Can be re-bound with the ritual. Responds to acknowledgment.', negativeResult: 'If the binding fails, partially manifests. +3 Corruption to everyone at locus.', daNotes: '' }
  ];

  const BOUDICA_LOCATIONS = [
    { id: 'L1', name: 'Dunn\'s Farm, Staffordshire', description: 'The binding locus. A farm field where the keystone coin was buried for 1,900 years. Soil analysis reveals gold residue and anomalous mineral content. The hole where the coin was is still visible.', availability: 'All shifts, open', npcsPresent: 'Philip Croft (after O3M1)', cluesPresent: ['I1', 'I2'], organizations: ['O4'], positiveResult: 'Soil analysis confirms binding locus. The hole is the key evidence.', negativeResult: 'If agents disturb the site, the entity notices.', daNotes: '' },
    { id: 'L2', name: 'The Plough Inn, Cormsil Village', description: 'The village pub. Mrs. Albright knows everyone. Dunn was a regular. The pub is the social hub — locals have noticed the blight but don\'t have language for it.', availability: 'All shifts, open', npcsPresent: 'Mrs. Albright, Reverend Baker', cluesPresent: ['I3', 'I4'], organizations: [], positiveResult: 'Local knowledge, Dunn\'s habits, multiple witness accounts of anomalous events.', negativeResult: 'Locals clam up if agents are too official or threatening.', daNotes: '' },
    { id: 'L3', name: 'Birmingham Museum', description: 'Holds the Staffordshire Hoard — 3,500 pieces of Anglo-Saxon gold. Public gallery with alarmed display cases. Secure vault with motion sensors and two locked doors.', availability: 'Day shifts only (public). Vault: 24/7 with access.', npcsPresent: 'Dr. Helen Price, Mr. Okonkwo', cluesPresent: ['I5', 'I6'], organizations: ['O1'], positiveResult: 'Any coin from the hoard works for re-burial. Okonkwo provides access window.', negativeResult: 'Failed infiltration triggers police response. Museum locked down.', daNotes: '' },
    { id: 'L4', name: 'British Library, London', description: 'Holds Eadwine\'s chronicle — a Mercian monk\'s manuscript from the 7th century. References "the queen who would not leave" and "the book of reckonings in the iron-men\'s city of stone."', availability: 'Day shifts only', npcsPresent: 'Research librarians', cluesPresent: ['I7', 'I8'], organizations: [], positiveResult: 'Chronicle provides binding words in Old English and references to the Roman ledger.', negativeResult: 'Manuscript is fragile — restricted access.', daNotes: '' },
    { id: 'L5', name: 'Vatican Apostolic Archive, Rome', description: 'Holds Codex Mercaturae Britanniae — Agricola\'s ledger. Dry, bureaucratic Latin recording "one binding, site CXVII, payment: gold, measured by weight."', availability: 'Day shifts, requires authorization', npcsPresent: 'Father Matteo', cluesPresent: ['I9', 'I10'], organizations: ['O2'], positiveResult: 'Ledger provides binding words in Latin and confirms any gold works.', negativeResult: 'Bureaucratic delays — 1 day lost.', daNotes: '' },
    { id: 'L6', name: 'Dr. Rhys\'s Archaeology Office, University of Birmingham', description: 'Dr. Rhys was the lead archaeologist on the 1984 Staffordshire Hoard excavation. His office contains dig records, photographs, and the anomaly report.', availability: 'Day shifts, by appointment', npcsPresent: 'Dr. Rhys', cluesPresent: ['I11', 'I12'], organizations: [], positiveResult: 'Dig records confirm the keystone coin was deeper than radar reached.', negativeResult: 'Dr. Rhys is protective of his academic reputation.', daNotes: '' },
    { id: 'L7', name: 'The Binding Locus — Dunn\'s Field', description: 'The epicenter. A 3-meter patch of earth where the keystone was buried. The soil is warmer than surrounding earth. At night, a faint reddish glow. The ground breathes.', availability: 'Always accessible', npcsPresent: 'Arthur Dunn (if found), The Entity (Day 1)', cluesPresent: ['I13', 'I14'], organizations: ['O4'], positiveResult: 'The re-burial site. All paths lead here.', negativeResult: 'The entity resists re-binding. Ritual is contested.', daNotes: '' }
  ];

  const BOUDICA_INFO_CARDS = [
    { id: 'I1', content: 'Soil analysis at the farm confirms gold residue at the binding locus. The hole is 1.2 meters deep — the coin was buried deeper than a plough typically reaches.', type: 'containment-truth', truthStatus: 'trigger', foundAt: ['L1'], knownBy: ['Philip Croft'], hqFallback: 'Day 6' },
    { id: 'I2', content: 'Arthur Dunn found "something interesting" while ploughing. He showed it at the pub. Described as a gold coin, warm to the touch, with a woman\'s face on one side.', type: 'supporting-intel', foundAt: ['L1', 'L2'], knownBy: ['Mrs. Albright'], hqFallback: 'Day 6' },
    { id: 'I3', content: 'Locusts have been sighted near the farm. Unusual for Staffordshire. They navigate toward the binding locus regardless of wind direction.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Mrs. Albright', 'Philip Croft'], hqFallback: 'Day 5' },
    { id: 'I4', content: 'Dunn left for a "fishing trip" to Scotland three weeks ago. He has not returned. His cottage is locked. His post is piling up.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Mrs. Albright'], hqFallback: 'Day 5' },
    { id: 'I5', content: 'The Staffordshire Hoard includes gold coins from the 7th century. Any gold from the hoard matches the binding\'s terms — "gold, measured by weight."', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['Dr. Price'], hqFallback: 'Day 4' },
    { id: 'I6', content: 'Mr. Okonkwo reports the coins in the Anglo-Saxon gallery emit a faint reddish glow visible only in peripheral vision. The glow intensifies at night.', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['Mr. Okonkwo (O1M2)'], hqFallback: 'Day 3' },
    { id: 'I7', content: 'Eadwine\'s chronicle describes "the queen who would not leave" and a binding reinforced with gold. References "the book of reckonings in the iron-men\'s city of stone" — the Roman ledger in Rome.', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['—'], hqFallback: 'Day 5' },
    { id: 'I8', content: 'The chronicle contains binding words in Old English. Speaking these words during the re-burial is one way to complete the ritual.', type: 'containment-truth', truthStatus: 'quiescence', foundAt: ['L4'], knownBy: ['—'], hqFallback: 'Day 4' },
    { id: 'I9', content: 'The Roman ledger records the original pact: "One binding, site CXVII, province of Britannia. Payment: gold, measured by weight. Gold in earth, binding holds."', type: 'containment-truth', truthStatus: 'appetite', foundAt: ['L5'], knownBy: ['Father Matteo (O2M2)'], hqFallback: 'Day 4' },
    { id: 'I10', content: 'The ledger specifies no minimum gold quantity. A single coin is sufficient. The Romans were precise about loopholes.', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['Father Matteo (O2M2)'], hqFallback: 'Day 3' },
    { id: 'I11', content: 'Dr. Rhys\'s anomaly report: during the 1984 excavation, ground-penetrating radar showed a void at 1.2 meters. The team assumed it was a natural cavity. It was the keystone\'s resting place.', type: 'supporting-intel', foundAt: ['L6'], knownBy: ['Dr. Rhys'], hqFallback: 'Day 3' },
    { id: 'I12', content: 'The anomaly coordinates match the binding locus on Dunn\'s farm exactly. The void is now empty — the coin was removed in 1987.', type: 'supporting-intel', foundAt: ['L6'], knownBy: ['Dr. Rhys'], hqFallback: 'Day 2' },
    { id: 'I13', content: 'The binding locus is active. Soil temperature is 4°C above ambient. The ground rises and falls — approximately 2 cm every 30 seconds.', type: 'containment-truth', truthStatus: 'effect', foundAt: ['L7'], knownBy: ['—'], hqFallback: 'Day 2' },
    { id: 'I14', content: 'The entity can be heard at the locus — a voice in layers: Old English, Brythonic, something older. It is reciting wrongs. Every preventable death it has witnessed.', type: 'containment-truth', truthStatus: 'synthesis', foundAt: ['L7'], knownBy: ['—'], hqFallback: '—' }
  ];

  // ═══════════════════════════════════════════════════════════
  // THE CORMSIL COMPACT CASE DATA
  // ═══════════════════════════════════════════════════════════

  const CORMSIL_COMPACT = {
    caseId: 'VC-UK-87-012',
    caseName: 'The Cormsil Compact',
    region: 'Yorkshire Dales, England → Oxford → London',
    currentDay: 14,
    shiftsFilled: [],
    organizations: [
      {
        id: 'O1', name: 'The Returned', value: 6, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 7, label: 'O1M1', description: 'The returned begin coordinating. They visit Eleanor in groups. They speak in unison without realizing they\'re doing it. The skeptical townsfolk notice and become alarmed.', crossAdvances: [{ targetOrg: 'O2', squares: 1 }], triggered: false },
          { day: 4, label: 'O1M2', description: 'The returned stop pretending to be normal. They gather at the burned library every evening, standing in a circle, facing inward. They don\'t speak. They just stand. Eleanor stops leaving her house entirely.', crossAdvances: [{ targetOrg: 'O4', squares: 2 }], triggered: false },
          { day: 2, label: 'O1M3', description: 'One of the returned — Margaret Hale, a former schoolteacher — breaks from the group. She remembers dying. She knows what she is. She offers to help.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The 25 returned are vessels for the Dōmere\'s fragments. Their escalation mirrors the spirit\'s growing awareness.',
        playerSigns: 'People who blink too slowly. Cold handshakes. Groups that stop talking when agents enter.',
        notes: 'The 25 library fire victims. Initially passive. Escalating as the spirit\'s awareness grows.'
      },
      {
        id: 'O2', name: 'The Skeptical Townsfolk', value: 7, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 6, label: 'O2M1', description: 'Tom Dwerryhouse approaches the agents. He\'s been keeping notes — documented the tells. His wife Mary is among the returned. He knows something is wrong.', crossAdvances: [], triggered: false },
          { day: 3, label: 'O2M2', description: 'The skeptics confront the returned at the library. The returned speak in unison: "We are the balance. Do not interfere." The skeptics now have undeniable proof.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The skeptics provide on-the-ground intelligence and may become allies or obstacles.',
        playerSigns: 'A farmer watching the returned too closely. Notes being taken. Someone waiting outside the library.',
        notes: 'Led by Tom Dwerryhouse. His wife Mary is among the returned.'
      },
      {
        id: 'O3', name: 'The Society\'s Trail', value: 5, active: false, dormant: true,
        activationCondition: 'Activated when agents find the Society\'s manual in the church crypt, or discover the first reference to The Society.',
        squaresConsumed: [],
        milestones: [
          { day: 6, label: 'O3M1', description: 'The Society\'s manual is found in the church crypt — a Victorian field guide to negotiating with subterranean presences. References Colne\'s manuscript and the standing stone.', crossAdvances: [], triggered: false },
          { day: 3, label: 'O3M2', description: 'The vicar\'s letter at the Bodleian provides context: The Society was organized, secretive, and effective. "They prefer to remain unremembered."', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'The Society\'s manual is the key operational document. Without it, agents cannot negotiate or perform the silencing ritual.',
        playerSigns: 'References to "The Society" in parish records. A hidden compartment in the church crypt.',
        notes: 'Dormant until agents find the manual. The Society is a shadowy Victorian organization — almost nothing is known about them.'
      },
      {
        id: 'O4', name: 'Eleanor Vane', value: 4, active: true, dormant: false,
        activationCondition: '',
        squaresConsumed: [],
        milestones: [
          { day: 8, label: 'O4M1', description: 'Eleanor stops sleeping entirely — 19 days awake. She tells agents everything: the candle, the fire, the people running into the woods. "They don\'t want me to die. They want me to KNOW."', crossAdvances: [], triggered: false },
          { day: 5, label: 'O4M2', description: 'Eleanor collapses — not physically, psychologically. Catatonic for hours, then wakes and writes the same sentence: "The stone is warm." She\'s never been to the standing stone. The spirit is speaking through her.', crossAdvances: [], triggered: false }
        ],
        linkedEffects: 'Eleanor is the spirit\'s conduit. Her deterioration mirrors the spirit\'s awakening.',
        playerSigns: 'A librarian who hasn\'t slept in weeks. Letters piling up outside her door. The same sentence written a hundred times.',
        notes: 'Responsible for the library fire. Visited daily by 25 people who "forgive" her.'
      },
      { id: 'O5', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O6', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O7', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' },
      { id: 'O8', name: '', value: 0, active: false, dormant: true, activationCondition: '', squaresConsumed: [], milestones: [], linkedEffects: '', playerSigns: '', notes: '' }
    ],
    relicMilestones: [
      { day: 7, description: 'The returned begin coordinating. They visit Eleanor in groups. They speak in unison. The spirit\'s awareness is growing — it perceives the agents as foreign elements in its domain.' },
      { day: 4, description: 'The spirit speaks directly — a voice from beneath the earth, reciting wrongs in layers of language. Every preventable death in Cormsil\'s history. Everyone in the village hears it.' },
      { day: 1, description: 'CATASTROPHE: The Dōmere attempts expansion beyond Cormsil. The returned lose their anchor. Eleanor Vane may die from exhaustion. The binding must be performed now or never.' }
    ],
    currentDayDisplay: 14,
    relicSheet: {
      name: 'The Dōmere ("The Buried Judge")',
      tier: 'Tier 2 — Subterranean Presence',
      artifactDie: 'N/A — No physical artifact. The Society\'s manual is the operational key.',
      activationCondition: 'A binding compact is broken or acknowledgment of wrongful deaths ceases. The library fire destroyed the compact; the spirit woke immediately.',
      mechanicalEffect: 'The returned: the spirit embodies the wrongfully dead with fragments of its awareness. They appear alive and healthy but are compelled to make the responsible person acknowledge what they did.',
      fracture: 'If the silencing ritual fails: the entity partially manifests. Everyone at locus takes +3 Corruption. The standing stone cracks.'
    }
  };
  finalizeOrgSquares(CORMSIL_COMPACT.organizations);
  finalizeShiftsFilled(CORMSIL_COMPACT);

  const CORMSIL_NPCS = [
    { id: 'npc-eleanor', name: 'Eleanor Vane', role: 'Librarian — The Anchor', organization: 'O4 (Eleanor Vane)', attributes: { strength: 2, agility: 2, wits: 4, empathy: 5 }, disposition: 3, secret: 'Fell asleep. A scented candle ignited a stack of books. 25 people died. She has not slept in over three weeks. Being visited daily by people who "forgive" her.', goal: 'End this. She can\'t take much more. She\'s deteriorating.', artifactConnection: 'The spirit\'s conduit. The returned are extensions of the spirit — they visit her because the spirit compels them.', locations: ['L1'], positiveResult: 'Eleanor shares everything — the fire, the returned, the visits. Genuinely wants help.', negativeResult: 'If agents are accusatory, she withdraws. O4 advances 2 squares.', daNotes: '' },
    { id: 'npc-dwerryhouse', name: 'Tom Dwerryhouse', role: 'Farmer — Skeptic Leader', organization: 'O2 (The Skeptical Townsfolk)', attributes: { strength: 3, agility: 2, wits: 3, empathy: 3 }, disposition: 2, secret: 'His wife Mary is among the returned. He knows the woman in his house is not his wife. Has been documenting the tells for weeks.', goal: 'Get his wife back. Understand what happened. He\'ll do whatever it takes.', artifactConnection: 'None. Living with one of the returned. The standing stone is in his field.', locations: ['L2'], positiveResult: 'Shares documentation of returned tells. Reveals standing stone location.', negativeResult: 'If agents dismiss his concerns, he acts alone — confronts returned, triggers O2M2 early.', daNotes: '' },
    { id: 'npc-hale', name: 'Margaret Hale', role: 'Returned — Former Schoolteacher', organization: 'O1 (The Returned)', attributes: { strength: 2, agility: 2, wits: 5, empathy: 5 }, disposition: 4, secret: 'Has pieced together what she is. Remembers dying. Knows she is being used. The intended volunteer for the silencing ritual.', goal: 'Help the agents silence the Dōmere. She is willing to release the spirit\'s fragment — ending her borrowed existence.', artifactConnection: 'One of the returned. A fragment of the Dōmere inhabits her body.', locations: ['L1', 'L7'], positiveResult: 'Volunteers for the silencing ritual. Her self-awareness is the key to breaking the spirit\'s hold.', negativeResult: 'If agents cannot reach her before O1M3, she may lose the will to resist.', daNotes: '' },
    { id: 'npc-baker-c', name: 'Reverend Baker', role: 'Cormsil Vicar', organization: 'Independent (Church of England)', attributes: { strength: 2, agility: 2, wits: 3, empathy: 5 }, disposition: 4, secret: 'Found references to the 1882 compact in the parish records. Discovered the Society\'s manual in the crypt but was too afraid to move it.', goal: 'Help the village. He\'s the spiritual center but out of his depth.', artifactConnection: 'None. Custodian of parish records and de facto guardian of the Society\'s manual.', locations: ['L3'], positiveResult: 'Directs agents to the crypt and the Society\'s manual.', negativeResult: 'Too afraid to act directly. Can only point, not lead.', daNotes: '' },
    { id: 'npc-colne', name: 'Sir Geoffrey Colne (Manuscript)', role: '1642 Scholar — Deceased', organization: 'Historical', attributes: { strength: 0, agility: 0, wits: 5, empathy: 3 }, disposition: 0, secret: 'His manuscript "Of Certain Subterranean Presences in the County of York" describes the Dōmere, a failed binding attempt, and the silencing ritual. Contains the Old English riddle encoding the spirit\'s true name.', goal: 'Posthumous: his manuscript is the key to the silencing ritual.', artifactConnection: 'Attempted to bind the Dōmere in 1642. Failed because he treated it as an enemy rather than a party.', locations: ['L6'], positiveResult: 'Manuscript provides silencing ritual, spirit description, and riddle for true name.', negativeResult: 'Manuscript is fragile. Restricted access at British Library.', daNotes: '' },
    { id: 'npc-vicar', name: 'The Vicar of 1882 (Papers)', role: 'Society Collaborator — Deceased', organization: 'O3 (The Society)', attributes: { strength: 0, agility: 0, wits: 4, empathy: 4 }, disposition: 0, secret: 'Collaborated with The Society to broker the 1882 compact. Hid the Society\'s manual in the crypt. His papers at the Bodleian reference "the volume I have hidden."', goal: 'Posthumous: his papers provide context for the Society and the compact.', artifactConnection: 'None. Administrator of the compact.', locations: ['L5'], positiveResult: 'Papers provide Society context, compact summary, and note about hidden manual.', negativeResult: 'Papers are incomplete — missing key operational details found only in the manual.', daNotes: '' },
    { id: 'npc-society', name: 'The Society (Organization)', role: 'Victorian Occult Organization', organization: 'O3 (The Society\'s Trail)', attributes: { strength: 0, agility: 0, wits: 5, empathy: 3 }, disposition: 0, secret: 'Brokered the 1882 compact. Had no name worth recording — "they prefer to remain unremembered." Effective, organized, and vanished without a trace.', goal: 'Their manual and methods are the only remaining evidence they existed.', artifactConnection: 'Understood what others didn\'t: the Dōmere is not malicious — it is absolute.', locations: ['—'], positiveResult: 'Their manual is the key operational document.', negativeResult: 'Almost nothing is known about them. This is intentional.', daNotes: '' },
    { id: 'npc-mary', name: 'Mary Dwerryhouse', role: 'Returned — Tom\'s Wife', organization: 'O1 (The Returned)', attributes: { strength: 2, agility: 2, wits: 3, empathy: 4 }, disposition: 3, secret: 'Among the returned. The fragment inhabiting her body still loves her husband. She can sometimes act independently — small gestures, a familiar expression. This is the crack in the spirit\'s control.', goal: 'Reach her husband. The fragment is weakening — the spirit\'s control is not absolute.', artifactConnection: 'A fragment of the Dōmere inhabits her body. The spirit acts through her.', locations: ['L2'], positiveResult: 'Through Mary, agents can understand the returned aren\'t hostile — they\'re vessels.', negativeResult: 'If the spirit\'s control strengthens, Mary loses her ability to resist.', daNotes: '' }
  ];

  const CORMSIL_LOCATIONS = [
    { id: 'L1', name: 'Eleanor Vane\'s Cottage, Cormsil', description: 'A small cottage at the edge of the village. Curtains drawn. Post piling up. Eleanor hasn\'t left in days. Inside: the same sentence written on every surface.', availability: 'Day/Evening shifts', npcsPresent: 'Eleanor Vane, Margaret Hale (sometimes)', cluesPresent: ['I1', 'I2'], organizations: ['O4'], positiveResult: 'Eleanor provides the fire account and description of the returned.', negativeResult: 'Eleanor is fragile. Aggressive questioning worsens her condition.', daNotes: '' },
    { id: 'L2', name: 'Dwerryhouse Farm, Cormsil', description: 'A working farm on the edge of the village. Tom\'s wife Mary is among the returned — she\'s here but she\'s not his wife. The standing stone is in the north field.', availability: 'All shifts', npcsPresent: 'Tom Dwerryhouse, Mary Dwerryhouse', cluesPresent: ['I3', 'I4'], organizations: ['O2'], positiveResult: 'Dwerryhouse shares documentation. Standing stone location revealed.', negativeResult: 'Mary may act on the spirit\'s will if agents threaten Tom.', daNotes: '' },
    { id: 'L3', name: 'St. Cuthbert\'s Church Crypt, Cormsil', description: 'The village church. The crypt contains parish records dating to the 12th century. Behind a loose stone: the Society\'s manual, hidden by the vicar in 1882.', availability: 'All shifts', npcsPresent: 'Reverend Baker', cluesPresent: ['I5', 'I6'], organizations: ['O3'], positiveResult: 'Society manual provides negotiation framework and references to Colne\'s manuscript.', negativeResult: 'Crypt is dark and damp. Manual is fragile — handle carefully.', daNotes: '' },
    { id: 'L4', name: 'The Burned Library, Cormsil', description: 'The remains of the village library. Charred beams, melted glass, the smell of old smoke. The compact of 1882 was stored here in a glass case. All that remains is ash.', availability: 'All shifts', npcsPresent: 'The Returned (evenings, after O1M2)', cluesPresent: ['I7', 'I8'], organizations: ['O1'], positiveResult: 'Glass case fragments confirm the compact was here and is now destroyed.', negativeResult: 'The returned gather here at night. Approaching them may trigger escalation.', daNotes: '' },
    { id: 'L5', name: 'Bodleian Library, Oxford', description: 'Holds the vicar\'s papers — letters, parish records, and a note about the hidden manual. Also contains references to The Society and the 1882 compact.', availability: 'Day shifts only', npcsPresent: 'Research librarians', cluesPresent: ['I9', 'I10'], organizations: ['O3'], positiveResult: 'Vicar\'s papers contextualize the Society and confirm the manual was hidden deliberately.', negativeResult: 'Bodleian access requires academic credentials or a compelling reason.', daNotes: '' },
    { id: 'L6', name: 'British Library, London', description: 'Holds Sir Geoffrey Colne\'s 1642 manuscript "Of Certain Subterranean Presences in the County of York." Describes the Dōmere, a failed binding, and the silencing ritual. Contains an Old English riddle encoding the spirit\'s true name.', availability: 'Day shifts only', npcsPresent: 'Manuscript librarians', cluesPresent: ['I11', 'I12'], organizations: [], positiveResult: 'Manuscript provides ritual method and riddle for true name "Dōmere."', negativeResult: 'Manuscript is fragile and restricted. May require special handling.', daNotes: '' },
    { id: 'L7', name: 'The Standing Stone, Dwerryhouse\'s Field', description: 'A pre-Saxon standing stone in the north field of Dwerryhouse Farm. Marks the Dōmere\'s original resting place before the Saxons built the church. The stone is warm to the touch. The soil beneath is darker, warmer than surrounding earth.', availability: 'All shifts', npcsPresent: 'The Returned (Day 1)', cluesPresent: ['I13', 'I14'], organizations: ['O1', 'O2'], positiveResult: 'The ritual site. All three components converge here.', negativeResult: 'The spirit resists. The silencing ritual is contested.', daNotes: '' }
  ];

  const CORMSIL_INFO_CARDS = [
    { id: 'I1', content: 'The library fire was accidental — a librarian fell asleep, a scented candle ignited books. 25 people were seen running into the woods. They emerged the next morning, unharmed, claiming no memory.', type: 'supporting-intel', foundAt: ['L1'], knownBy: ['Eleanor Vane'], hqFallback: 'Day 9' },
    { id: 'I2', content: 'The returned exhibit specific tells: slowed blink rate (3–4 seconds), cool skin (~34°C), tendency to complete others\' sentences or speak in unison. These are consistent across all 25.', type: 'containment-truth', truthStatus: 'effect', foundAt: ['L1', 'L2'], knownBy: ['Eleanor Vane', 'Tom Dwerryhouse'], hqFallback: 'Day 8' },
    { id: 'I3', content: 'Tom Dwerryhouse\'s notes document the tells across multiple returned over three weeks. The pattern is consistent and escalating.', type: 'supporting-intel', foundAt: ['L2'], knownBy: ['Tom Dwerryhouse (O2M1)'], hqFallback: 'Day 7' },
    { id: 'I4', content: 'The standing stone in Dwerryhouse\'s north field is warm to the touch. It predates the Saxon church. The Dōmere\'s original resting place is beneath it.', type: 'containment-truth', truthStatus: 'trigger', foundAt: ['L2', 'L7'], knownBy: ['Tom Dwerryhouse'], hqFallback: 'Day 7' },
    { id: 'I5', content: 'The Society\'s manual is a handwritten Victorian field guide to negotiating with subterranean presences. It describes the Dōmere, negotiation methods, and references "Colne\'s manuscript" and "the standing stone at Cormsil."', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['—'], hqFallback: 'Day 6' },
    { id: 'I6', content: 'The manual describes the framework for the 1882 compact: acknowledgment, formal agreement, and an annual reading at the library. The compact was stored in the library\'s "History of Cormsil" section.', type: 'supporting-intel', foundAt: ['L3'], knownBy: ['—'], hqFallback: 'Day 6' },
    { id: 'I7', content: 'The compact of 1882 was stored in a glass case in the library. It burned in the fire. All that remains is ash and fragments of the case.', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['Eleanor Vane'], hqFallback: 'Day 8' },
    { id: 'I8', content: 'The returned gather at the burned library every evening after O1M2. They stand in a circle, facing inward. They don\'t speak. They just stand.', type: 'supporting-intel', foundAt: ['L4'], knownBy: ['— (observation)'], hqFallback: 'Day 5' },
    { id: 'I9', content: 'The vicar\'s letter at the Bodleian mentions "the volume I have hidden" — confirming the manual was placed in the crypt deliberately. The letter also notes The Society "has no name worth recording."', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['—'], hqFallback: 'Day 4' },
    { id: 'I10', content: 'The vicar\'s papers include a summary of the 1882 compact terms and a reference to Sir Geoffrey Colne\'s manuscript at the British Library.', type: 'supporting-intel', foundAt: ['L5'], knownBy: ['—'], hqFallback: 'Day 4' },
    { id: 'I11', content: 'Colne\'s manuscript "Of Certain Subterranean Presences in the County of York" describes the Dōmere in detail: a pre-Celtic entity that responds to wrongful death by embodying the deceased.', type: 'containment-truth', truthStatus: 'appetite', foundAt: ['L6'], knownBy: ['—'], hqFallback: 'Day 4' },
    { id: 'I12', content: 'The manuscript contains an Old English riddle: "The judge beneath, who cannot speak / Dōm-ere, Dōm-ere, the Saxon\'s leak." The spirit\'s true name is Dōmere — "the Doomer, the Judge."', type: 'containment-truth', truthStatus: 'quiescence', foundAt: ['L6'], knownBy: ['—'], hqFallback: 'Day 3' },
    { id: 'I13', content: 'The standing stone marks the Dōmere\'s original resting place. Soil from beneath the stone is darker and warmer than surrounding earth. It must be used in the silencing ritual.', type: 'supporting-intel', foundAt: ['L7'], knownBy: ['—'], hqFallback: 'Day 2' },
    { id: 'I14', content: 'A returned volunteer who chooses true death over borrowed existence is the third component of the silencing ritual. Margaret Hale is the intended volunteer — she has pieced together what she is.', type: 'containment-truth', truthStatus: 'synthesis', foundAt: ['L7'], knownBy: ['Margaret Hale (O1M3)'], hqFallback: '—' }
  ];

  // ═══════════════════════════════════════════════════════════
  // PROMPT TEMPLATES FOR NR.PromptGenerator
  // ═══════════════════════════════════════════════════════════

  const PROMPT_TEMPLATES = [
    { type: 'corruption', weight: 1, templates: [
      'An agent notices their Corruption creeping — describe the physical manifestation they experience right now.',
      'The Corruption threshold has been crossed. What does {agent} see in their peripheral vision that no one else can see?',
      'The anchor object in {agent}\'s pocket grows warm. Describe the memory that surfaces — and why it hurts.',
      'A mundane object in the room begins to bleed. Only one agent notices. Which one, and what do they do?'
    ]},
    { type: 'milestone', weight: 1, templates: [
      'A milestone has fired: {milestone_desc}. What public event occurs that the agents cannot ignore?',
      'The board shifts. Describe the moment the agents realize {org_name} has just escalated — what do they see, hear, or feel?',
      'Cross-advance chain: {chain_desc}. How does this cascade manifest in the physical world right now?',
      'The relic pulses. Every agent within range feels it differently. Describe each agent\'s unique sensation.'
    ]},
    { type: 'combat', weight: 1, templates: [
      'Combat is about to begin. Describe the tableau — the lighting, the sounds, the expressions on faces — before the first move.',
      'The fight is turning against the agents. What environmental detail could they exploit if they notice it?',
      'An NPC combatant hesitates. What do they see in one of the agents that makes them reconsider?',
      'The zone shifts. Describe how the physical space changed — a door opened, a light went out, something fell.'
    ]},
    { type: 'social', weight: 1, templates: [
      '{npc_name} is {disposition}. What subtle tell reveals they are holding something back?',
      'The conversation reaches an impasse. What unexpected detail in the room could break the tension?',
      'An NPC says something that contradicts their own secret. What slip did they make?',
      'The agents have leverage. How does {npc_name} physically react when they realize they\'ve been outmaneuvered?'
    ]},
    { type: 'discovery', weight: 1, templates: [
      'New information card revealed: {info_id}. How is this clue physically discovered — not found, but stumbled upon?',
      'A location becomes accessible: {loc_name}. Describe the threshold moment when the agents first step inside.',
      'The agents put two clues together. What connection do they suddenly make that changes everything?',
      'An NPC unexpectedly shares something they shouldn\'t. Why do they trust the agents with this?'
    ]},
    { type: 'shift', weight: 1, templates: [
      'A new shift begins: {shift_name} on Day {day}. Describe the city at this time of day — what\'s different?',
      'Time passes. The countdown continues. What mundane detail reminds the agents that the clock is ticking?',
      'The shift changes from day to night. How does the atmosphere of the investigation transform?',
      'Day {day} is ending. What loose end keeps one of the agents awake tonight?'
    ]},
    { type: 'atmosphere', weight: 2, templates: [
      'Set the scene for the current moment. What is the weather doing? What sounds are in the background? What does the air smell like?',
      'Describe a brief, wordless moment — something an agent notices out a window, in a reflection, or in a stranger\'s expression.',
      'A radio is playing somewhere. What song comes on, and why does it feel significant?',
      'An animal appears at the edge of the scene. What kind of animal, and what does it do?',
      'Describe the meal the agents haven\'t had time to eat. What are they craving, and what are they actually sustaining themselves on?'
    ]}
  ];

  // ═══════════════════════════════════════════════════════════
  // CASE LIBRARY — All cases for the dropdown loader
  // ═══════════════════════════════════════════════════════════
  const CASE_LIBRARY = {
    blank: { name: 'Blank Board', stateFn: 'getDefaultState' },
    spear: { name: 'The Spear That Went Dark', stateFn: 'getSpearOfDestinyState' },
    crucifix: { name: 'The Heavenly Crucifix', stateFn: 'getHeavenlyCrucifixState' },
    barbarians: { name: 'The Barbarian\'s Cup', stateFn: 'getBarbariansCupState' },
    boudica: { name: 'The Boudica Pact', stateFn: 'getBoudicaPactState' },
    cormsil: { name: 'The Cormsil Compact', stateFn: 'getCormsilCompactState' }
  };

  function getBarbariansCupState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(BARBARIANS_CUP)),
      agents: JSON.parse(JSON.stringify(PREBUILT_AGENTS)),
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  function getBoudicaPactState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(BOUDICA_PACT)),
      agents: JSON.parse(JSON.stringify(PREBUILT_AGENTS)),
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  function getCormsilCompactState() {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      case: JSON.parse(JSON.stringify(CORMSIL_COMPACT)),
      agents: JSON.parse(JSON.stringify(PREBUILT_AGENTS)),
      combat: { active: false, round: 0, currentTurnIndex: 0, combatants: [], zones: ['Engaged', 'Near', 'Far', 'Distant'], notes: '' },
      social: { activeInteractions: [] },
      undoStack: [],
      redoStack: [],
      preferences: {
        theme: 'dossier',
        showAgentRoster: false,
        agentRosterCollapsed: true,
        confirmMilestoneTriggers: true,
        showPressureMeter: false,
        boardZoom: 1.0
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  return {
    BLANK_CASE: BLANK_CASE,
    SPEAR_OF_DESTINY: SPEAR_OF_DESTINY,
    HEAVENLY_CRUCIFIX: HEAVENLY_CRUCIFIX,
    BARBARIANS_CUP: BARBARIANS_CUP,
    BOUDICA_PACT: BOUDICA_PACT,
    CORMSIL_COMPACT: CORMSIL_COMPACT,
    PREBUILT_AGENTS: PREBUILT_AGENTS,
    SPEAR_NPCS: SPEAR_NPCS,
    SPEAR_LOCATIONS: SPEAR_LOCATIONS,
    SPEAR_INFO_CARDS: SPEAR_INFO_CARDS,
    CRUCIFIX_NPCS: CRUCIFIX_NPCS,
    CRUCIFIX_LOCATIONS: CRUCIFIX_LOCATIONS,
    CRUCIFIX_INFO_CARDS: CRUCIFIX_INFO_CARDS,
    BARBARIANS_NPCS: BARBARIANS_NPCS,
    BARBARIANS_LOCATIONS: BARBARIANS_LOCATIONS,
    BARBARIANS_INFO_CARDS: BARBARIANS_INFO_CARDS,
    BOUDICA_NPCS: BOUDICA_NPCS,
    BOUDICA_LOCATIONS: BOUDICA_LOCATIONS,
    BOUDICA_INFO_CARDS: BOUDICA_INFO_CARDS,
    CORMSIL_NPCS: CORMSIL_NPCS,
    CORMSIL_LOCATIONS: CORMSIL_LOCATIONS,
    CORMSIL_INFO_CARDS: CORMSIL_INFO_CARDS,
    PROMPT_TEMPLATES: PROMPT_TEMPLATES,
    CASE_LIBRARY: CASE_LIBRARY,
    getDefaultState: getDefaultState,
    getSpearOfDestinyState: getSpearOfDestinyState,
    getHeavenlyCrucifixState: getHeavenlyCrucifixState,
    getBarbariansCupState: getBarbariansCupState,
    getBoudicaPactState: getBoudicaPactState,
    getCormsilCompactState: getCormsilCompactState,
    createBlankAgent: createBlankAgent,
    SKILL_LIST: SKILL_LIST,
    ATTRIBUTES: ATTRIBUTES,
    CORRUPTION_STAGES: CORRUPTION_STAGES,
    DISPOSITION_LEVELS: DISPOSITION_LEVELS,
    COMBAT_ZONES: COMBAT_ZONES,
    SOCIAL_MANEUVERS: SOCIAL_MANEUVERS
  };
})();
