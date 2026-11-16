import type {
  AchievementBadge,
  DisposalCategoryGuide,
  EcoChallenge,
  InstitutionalAnalytics,
  LeaderboardEntry,
  StudentProfile,
  WasteClassificationResult,
  WasteScanRecord,
} from '../types/sortsmart.ts';
import avatarStudentAaravUrl from '../assets/images/avatar_student_aarav_1794773578980.jpg';
import samplePlasticBottleUrl from '../assets/images/sample_plastic_bottle_1794773579632.jpg';
import sampleEwasteCableUrl from '../assets/images/sample_ewaste_cable_1794773578829.jpg';
import sampleWetOrganicsUrl from '../assets/images/sample_wet_organics_1794773579283.jpg';

export const STUDENT_AVATAR_URL = avatarStudentAaravUrl;

export interface SampleScanPreset {
  id: string;
  label: string;
  subtitle: string;
  imageUrl: string;
  demoClassification: WasteClassificationResult;
}

export const SAMPLE_SCAN_PRESETS: SampleScanPreset[] = [
  {
    id: 'sample-pet-bottle',
    label: 'PET Water Bottle',
    subtitle: 'Campus outdoor bench',
    imageUrl: samplePlasticBottleUrl,
    demoClassification: {
      item: 'Clear PET Plastic Water Bottle',
      category: 'Recyclable waste',
      reasoning:
        'Single-use #1 PET bottle with cap intact; clean clear plastic is high-value dry recyclable feedstock.',
      recommendedBin: 'Blue Dry Recyclable Waste Bin',
      instructions:
        'Empty remaining liquid completely, flatten lightly to save bin volume, keep the cap on, and place in the blue recyclable bin.',
      specialHandlingRequired: false,
      specialHandlingNote: null,
      ecoTip:
        'Carrying a reusable stainless steel bottle on campus prevents 200+ PET bottles from entering waste streams every semester.',
      confidence: 94,
      isUnclear: false,
    },
  },
  {
    id: 'sample-ewaste-bundle',
    label: 'Batteries & USB Cable',
    subtitle: 'Hostel desk electronics',
    imageUrl: sampleEwasteCableUrl,
    demoClassification: {
      item: 'Used AA Batteries, Frayed USB Cable & Earphones',
      category: 'E-waste',
      reasoning:
        'Contains heavy metals, copper wiring, and electronic connectors that leach toxins in landfills and must not enter regular bins.',
      recommendedBin: 'Campus E-Waste Collection Drop-Box',
      instructions:
        'Keep batteries and frayed cables out of wet and dry bins. Drop them at your hostel lobby or Academic Block E-Waste Drop-Box.',
      specialHandlingRequired: true,
      specialHandlingNote:
        'Tape battery terminals with clear tape before drop-off to prevent short circuits during storage.',
      ecoTip:
        'Switching to NiMH rechargeable AA batteries and braided USB cables cuts electronic waste significantly.',
      confidence: 92,
      isUnclear: false,
    },
  },
  {
    id: 'sample-wet-organics',
    label: 'Fruit Peels & Tea Leaves',
    subtitle: 'Canteen & kitchen scraps',
    imageUrl: sampleWetOrganicsUrl,
    demoClassification: {
      item: 'Banana Peel, Apple Core & Used Tea Leaves',
      category: 'Wet waste',
      reasoning:
        'Biodegradable kitchen organics rich in moisture and nitrogen, ideal for campus aerobic composting or biogas digesters.',
      recommendedBin: 'Green Wet / Compostable Waste Bin',
      instructions:
        'Tip food scraps and loose tea leaves directly into the green bin without plastic bags. Keep soiled paper napkins minimal.',
      specialHandlingRequired: false,
      specialHandlingNote: null,
      ecoTip:
        'Segregating wet organics keeps dry paper and plastics clean enough for high-grade recycling.',
      confidence: 96,
      isUnclear: false,
    },
  },
];

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@campus-demo.edu.in',
  role: 'B.Tech 3rd Year · Sustainability Club',
  institution: 'IIT Delhi — Nilgiri Hostel (Demo Campus)',
  campusZone: 'North Hostel Block B',
  avatarUrl: STUDENT_AVATAR_URL,
};

export const INITIAL_SCANS: WasteScanRecord[] = [
  {
    id: 'scan-demo-101',
    scanHash: 'seed-pet-bottle-01',
    item: 'Clear PET Water Bottle (500 ml)',
    category: 'Recyclable waste',
    recommendedBin: 'Blue Dry Recyclable Waste Bin',
    instructions: 'Empty liquid, flatten bottle, and drop in Blue Recyclable Bin.',
    reasoning: 'Clean PET #1 plastic is recyclable.',
    ecoTip: 'Use a refillable bottle between lectures.',
    specialHandlingRequired: false,
    confidence: 95,
    pointsAwarded: 20,
    confirmed: true,
    manualOverride: false,
    sourceMode: 'demo-sample',
    timestamp: '2026-11-15T10:15:00.000Z',
    thumbnailUrl: samplePlasticBottleUrl,
  },
  {
    id: 'scan-demo-102',
    scanHash: 'seed-wet-peel-02',
    item: 'Banana Peel & Loose Tea Leaves',
    category: 'Wet waste',
    recommendedBin: 'Green Wet / Compostable Waste Bin',
    instructions: 'Deposit unbagged into hostel mess green compost bin.',
    reasoning: '100% biodegradable organic food scraps.',
    ecoTip: 'Campus bio-digester turns canteen wet waste into cooking gas.',
    specialHandlingRequired: false,
    confidence: 96,
    pointsAwarded: 15,
    confirmed: true,
    manualOverride: false,
    sourceMode: 'demo-sample',
    timestamp: '2026-11-15T08:40:00.000Z',
    thumbnailUrl: sampleWetOrganicsUrl,
  },
  {
    id: 'scan-demo-103',
    scanHash: 'seed-ewaste-cable-03',
    item: 'Used AA Cells & Frayed USB Cable',
    category: 'E-waste',
    recommendedBin: 'Campus E-Waste Collection Drop-Box',
    instructions: 'Tape battery terminals and drop in Academic Block 2 e-waste kiosk.',
    reasoning: 'Contains heavy metals and electronic wiring.',
    ecoTip: 'Rechargeable cells reduce battery waste by up to 80%.',
    specialHandlingRequired: true,
    confidence: 91,
    pointsAwarded: 30,
    confirmed: true,
    manualOverride: false,
    sourceMode: 'demo-sample',
    timestamp: '2026-11-14T17:20:00.000Z',
    thumbnailUrl: sampleEwasteCableUrl,
  },
  {
    id: 'scan-demo-104',
    scanHash: 'seed-dry-wrapper-04',
    item: 'Foil-Lined Snack Wrapper',
    category: 'Dry waste',
    recommendedBin: 'Blue Dry Waste Bin',
    instructions: 'Shake out crumbs and dispose in Dry Waste bin (non-recyclable MLP).',
    reasoning: 'Multi-layered laminated plastic cannot be conventionally recycled.',
    ecoTip: 'Prefer bulk or paper-packed snacks at the campus tuck shop.',
    specialHandlingRequired: false,
    confidence: 88,
    pointsAwarded: 15,
    confirmed: true,
    manualOverride: false,
    sourceMode: 'demo-sample',
    timestamp: '2026-11-14T13:05:00.000Z',
  },
  {
    id: 'scan-demo-105',
    scanHash: 'seed-recyclable-cardboard-05',
    item: 'Corrugated Delivery Box',
    category: 'Recyclable waste',
    recommendedBin: 'Blue Dry Recyclable Waste Bin',
    instructions: 'Remove plastic tape, flatten carton, and stack in paper/cardboard bin.',
    reasoning: 'Clean dry corrugated fiberboard is highly recyclable.',
    ecoTip: 'Flattening boxes keeps hostel bin chutes from jamming.',
    specialHandlingRequired: false,
    confidence: 93,
    pointsAwarded: 20,
    confirmed: true,
    manualOverride: false,
    sourceMode: 'demo-sample',
    timestamp: '2026-11-13T16:45:00.000Z',
  },
];

export const INITIAL_CHALLENGES: EcoChallenge[] = [
  {
    id: 'chal-daily-sort',
    title: 'Zero-Contamination Streak',
    description: 'Scan and confirm disposal for 2 recyclable items today.',
    targetCount: 2,
    currentCount: 1,
    rewardPoints: 40,
    targetCategory: 'Recyclable waste',
    completed: false,
    claimed: false,
  },
  {
    id: 'chal-organic-divert',
    title: 'Hostel Compost Hero',
    description: 'Log 1 wet waste item into the Green Compost Bin.',
    targetCount: 1,
    currentCount: 1,
    rewardPoints: 25,
    targetCategory: 'Wet waste',
    completed: true,
    claimed: false,
  },
  {
    id: 'chal-ewaste-hunt',
    title: 'Desk Drawer E-Waste Sweep',
    description: 'Scan and drop off 1 old cable, charger, or battery.',
    targetCount: 1,
    currentCount: 0,
    rewardPoints: 50,
    targetCategory: 'E-waste',
    completed: false,
    claimed: false,
  },
];

export const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge-first-scan',
    title: 'First Sort',
    description: 'Completed your first AI-assisted waste segregation scan.',
    requirementLabel: '1+ confirmed scans',
    unlocked: true,
    unlockedAt: 'Nov 12, 2026',
  },
  {
    id: 'badge-five-streak',
    title: '5-Item Sorter',
    description: 'Verified 5 waste disposals across campus bins.',
    requirementLabel: '5+ confirmed scans',
    unlocked: true,
    unlockedAt: 'Nov 15, 2026',
  },
  {
    id: 'badge-ewaste-guardian',
    title: 'Circuit Saver',
    description: 'Diverted hazardous electronics from regular hostel trash.',
    requirementLabel: '1+ E-waste or Hazardous scan',
    unlocked: true,
    unlockedAt: 'Nov 14, 2026',
  },
  {
    id: 'badge-eco-explorer',
    title: 'Eco Explorer',
    description: 'Reached 200+ Green Points in campus sustainability tracking.',
    requirementLabel: '200+ Green Points',
    unlocked: false,
  },
];

export const CAMPUS_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    name: 'Ananya Iyer',
    institution: 'Kailash Hostel · M.Sc.',
    scans: 29,
    points: 640,
  },
  {
    id: 'lb-2',
    name: 'Rohan Kulkarni',
    institution: 'Satpura Hostel · B.Tech',
    scans: 22,
    points: 495,
  },
  {
    id: 'lb-3',
    name: 'Meera Nair',
    institution: 'Himadri Hostel · Ph.D.',
    scans: 16,
    points: 350,
  },
  {
    id: 'lb-4',
    name: 'Kabir Verma',
    institution: 'Vindhyachal Hostel · B.Tech',
    scans: 9,
    points: 185,
  },
];

export const DISPOSAL_GUIDE_ITEMS: DisposalCategoryGuide[] = [
  {
    category: 'Wet waste',
    binName: 'Green Bin',
    binColorLabel: 'Biodegradable Organics',
    accentHex: '#16A36A',
    badgeBgClass: 'bg-emerald-50',
    badgeTextClass: 'text-emerald-800',
    summary:
      'Moisture-rich organic food and garden matter that breaks down into compost or biogas.',
    examples: [
      'Fruit & vegetable peels',
      'Leftover cooked meals & chapatis',
      'Used tea leaves & coffee grounds',
      'Eggshells & fallen campus leaves',
    ],
    disposalInstructions: [
      'Drain excess gravy or liquids before tipping into the green bin.',
      'Empty directly without plastic liner bags whenever compost bins are available.',
      'Keep dairy and cooked food covered to avoid pests in hostel corridors.',
    ],
    precautions: [
      'Never mix plastic spoons, foil, or tea bags with plastic staples into wet waste.',
      'Wet waste contaminating dry paper ruins the entire recycling batch.',
    ],
  },
  {
    category: 'Dry waste',
    binName: 'Blue Bin (Non-Recyclable Dry)',
    binColorLabel: 'Clean Non-Recyclable Dry',
    accentHex: '#38BDF8',
    badgeBgClass: 'bg-sky-50',
    badgeTextClass: 'text-sky-800',
    summary:
      'Dry, non-biodegradable packaging and soiled items that cannot be composted or cleanly recycled.',
    examples: [
      'Multi-layer chips & biscuit wrappers',
      'Soiled pizza boxes & oily food paper',
      'Thermocol & foam packaging',
      'Used paper cups with plastic lining',
    ],
    disposalInstructions: [
      'Shake out food crumbs and wipe dry before placing in the dry waste bin.',
      'Crush bulky packaging to maximize shared hostel bin capacity.',
      'Keep separate from wet canteen scraps so refuse-derived fuel recovery remains viable.',
    ],
    precautions: [
      'Do not place wet liquids inside dry bins—moisture causes mold and odor.',
      'Do not burn multi-layer plastic wrappers; they release toxic fumes.',
    ],
  },
  {
    category: 'Recyclable waste',
    binName: 'Blue Recyclable Bin',
    binColorLabel: 'High-Value Dry Recyclables',
    accentHex: '#A3E635',
    badgeBgClass: 'bg-lime-50',
    badgeTextClass: 'text-lime-900',
    summary:
      'Clean, sorted plastics, paper, cardboard, metals, and glass ready for material recovery facilities.',
    examples: [
      'Rinsed PET water & cold-drink bottles',
      'Aluminum beverage cans & clean tins',
      'Notebooks, newspapers & corrugated boxes',
      'Clean HDPE detergent or shampoo bottles',
    ],
    disposalInstructions: [
      'Rinse bottles and food containers briefly and let them drip-dry.',
      'Flatten cardboard cartons and crush plastic bottles with caps re-attached.',
      'Stack clean paper flat so it stays unsoiled during campus collection.',
    ],
    precautions: [
      'Food-stained cardboard or half-full bottles may be rejected by recyclers.',
      'Wrap broken glass separately in thick newspaper and label before disposal.',
    ],
  },
  {
    category: 'E-waste',
    binName: 'E-Waste Drop-Box',
    binColorLabel: 'Certified Electronic Recovery',
    accentHex: '#FACC15',
    badgeBgClass: 'bg-amber-50',
    badgeTextClass: 'text-amber-900',
    summary:
      'Discarded electrical and electronic devices containing recoverable metals and regulated heavy metals.',
    examples: [
      'AA/AAA & lithium-ion phone batteries',
      'Frayed USB cables, adapters & power banks',
      'Broken earphones, mice & keyboards',
      'Dead LED bulbs & compact circuit boards',
    ],
    disposalInstructions: [
      'Store old electronics in a dry box until visiting a campus E-Waste kiosk.',
      'Use authorized institutional e-waste drives or PRO collection partners.',
      'Wipe personal data from old phones or USB drives before recycling.',
    ],
    precautions: [
      'Never crush, puncture, or incinerate swollen lithium-ion batteries.',
      'Tape exposed battery terminals with insulating or clear tape before drop-off.',
    ],
  },
  {
    category: 'Hazardous waste',
    binName: 'Red Hazardous Bin',
    binColorLabel: 'Isolated Safe Disposal',
    accentHex: '#E11D48',
    badgeBgClass: 'bg-rose-50',
    badgeTextClass: 'text-rose-800',
    summary:
      'Toxic, reactive, flammable, or biomedical household waste requiring isolated municipal handling.',
    examples: [
      'Expired medicines & blister packs',
      'Sanitary waste & used bandages (wrapped)',
      'Aerosol spray cans, paint & solvent tins',
      'Lab/cleaning chemical bottles & sharps',
    ],
    disposalInstructions: [
      'Wrap sanitary or sharp items tightly in newspaper and mark clearly.',
      'Return expired medicines to campus health center take-back boxes where available.',
      'Keep chemical bottles sealed upright in original labeled containers.',
    ],
    precautions: [
      'Never flush expired antibiotics or pour solvents down hostel sinks.',
      'Keep hazardous waste completely isolated from wet compost and recyclables.',
    ],
  },
];

export const DEMO_ADMIN_ANALYTICS: InstitutionalAnalytics = {
  totalRegisteredUsers: 1480,
  totalCampusScans: 18420,
  activeParticipationPct: 74,
  totalPointsDistributed: 368400,
  categoryDistribution: [
    { category: 'Recyclable waste', count: 6815, percentage: 37, colorHex: '#16A36A' },
    { category: 'Wet waste', count: 5526, percentage: 30, colorHex: '#A3E635' },
    { category: 'Dry waste', count: 3868, percentage: 21, colorHex: '#38BDF8' },
    { category: 'E-waste', count: 1474, percentage: 8, colorHex: '#FACC15' },
    { category: 'Hazardous waste', count: 737, percentage: 4, colorHex: '#E11D48' },
  ],
  dailyActivity: [
    { day: 'Mon', scans: 412, recycled: 298 },
    { day: 'Tue', scans: 468, recycled: 341 },
    { day: 'Wed', scans: 525, recycled: 392 },
    { day: 'Thu', scans: 489, recycled: 356 },
    { day: 'Fri', scans: 614, recycled: 461 },
    { day: 'Sat', scans: 540, recycled: 405 },
    { day: 'Sun', scans: 392, recycled: 284 },
  ],
  weeklyActivity: [
    { week: 'Wk 1', scans: 2640, participationPct: 62 },
    { week: 'Wk 2', scans: 3010, participationPct: 66 },
    { week: 'Wk 3', scans: 3290, participationPct: 70 },
    { week: 'Wk 4', scans: 3440, participationPct: 74 },
  ],
  recentReports: [
    {
      id: 'rep-01',
      zone: 'Central Mess Courtyard',
      issue: 'Plastic cutlery found in Green Wet Bin #3; signage refreshed.',
      category: 'Dry waste',
      status: 'Resolved',
      reportedAt: '2 hours ago',
    },
    {
      id: 'rep-02',
      zone: 'Lecture Hall Complex',
      issue: 'E-waste kiosk at 85% capacity; vendor pickup scheduled.',
      category: 'E-waste',
      status: 'In Review',
      reportedAt: '5 hours ago',
    },
    {
      id: 'rep-03',
      zone: 'Chemistry Block Annex',
      issue: 'Empty solvent container flagged for Red Hazardous pickup.',
      category: 'Hazardous waste',
      status: 'Action Needed',
      reportedAt: 'Yesterday',
    },
    {
      id: 'rep-04',
      zone: 'Nilgiri Hostel Wing B',
      issue: 'Cardboard recycling baler cleared ahead of weekend rush.',
      category: 'Recyclable waste',
      status: 'Resolved',
      reportedAt: '2 days ago',
    },
  ],
  topParticipants: [
    {
      id: 'tp-1',
      name: 'Ananya Iyer',
      department: 'Biochemical Engg · Kailash Hostel',
      scans: 142,
      points: 2890,
    },
    {
      id: 'tp-2',
      name: 'Rohan Kulkarni',
      department: 'Computer Science · Satpura Hostel',
      scans: 128,
      points: 2540,
    },
    {
      id: 'tp-3',
      name: 'Meera Nair',
      department: 'Environmental Studies · Himadri',
      scans: 115,
      points: 2310,
    },
    {
      id: 'tp-4',
      name: 'Siddharth Rao',
      department: 'Mechanical Engg · Aravali Hostel',
      scans: 98,
      points: 1945,
    },
  ],
};
