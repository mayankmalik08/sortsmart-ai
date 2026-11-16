import type {
  ClassificationCategory,
  EcoChallenge,
  RewardTierName,
  WasteCategory,
  WasteClassificationResult,
  WasteScanRecord,
} from '../types/sortsmart.ts';

export const VALID_WASTE_CATEGORIES: readonly WasteCategory[] = [
  'Wet waste',
  'Dry waste',
  'Recyclable waste',
  'E-waste',
  'Hazardous waste',
] as const;

export const REWARD_TIERS: ReadonlyArray<{
  name: RewardTierName;
  minPoints: number;
  maxPoints: number | null;
  summary: string;
}> = [
  {
    name: 'Green Beginner',
    minPoints: 0,
    maxPoints: 199,
    summary: 'Starting your campus waste segregation habit.',
  },
  {
    name: 'Eco Explorer',
    minPoints: 200,
    maxPoints: 499,
    summary: 'Consistent daily sorting across wet, dry, and recyclable bins.',
  },
  {
    name: 'Sustainability Champion',
    minPoints: 500,
    maxPoints: 999,
    summary: 'High-accuracy segregation including e-waste and special handling.',
  },
  {
    name: 'Planet Guardian',
    minPoints: 1000,
    maxPoints: null,
    summary: 'Campus sustainability leader driving zero-landfill impact.',
  },
];

export function isValidWasteCategory(value: unknown): value is WasteCategory {
  return (
    typeof value === 'string' &&
    (VALID_WASTE_CATEGORIES as readonly string[]).includes(value)
  );
}

export function normalizeCategory(value: unknown): ClassificationCategory {
  if (typeof value !== 'string') return 'Unclear';
  const normalized = value.trim().toLowerCase();

  if (normalized === 'wet waste' || normalized === 'wet' || normalized === 'organic') {
    return 'Wet waste';
  }
  if (normalized === 'dry waste' || normalized === 'dry') {
    return 'Dry waste';
  }
  if (
    normalized === 'recyclable waste' ||
    normalized === 'recyclable' ||
    normalized === 'dry / recyclable waste' ||
    normalized === 'dry/recyclable waste'
  ) {
    return 'Recyclable waste';
  }
  if (normalized === 'e-waste' || normalized === 'ewaste' || normalized === 'electronic waste') {
    return 'E-waste';
  }
  if (normalized === 'hazardous waste' || normalized === 'hazardous') {
    return 'Hazardous waste';
  }
  return 'Unclear';
}

export function getDefaultBinForCategory(category: ClassificationCategory): string {
  switch (category) {
    case 'Wet waste':
      return 'Green Wet / Compostable Waste Bin';
    case 'Dry waste':
      return 'Blue Dry Waste Bin';
    case 'Recyclable waste':
      return 'Blue Dry Recyclable Waste Bin';
    case 'E-waste':
      return 'Campus E-Waste Collection Drop-Box';
    case 'Hazardous waste':
      return 'Red Domestic Hazardous Waste Bin';
    case 'Unclear':
    default:
      return 'Unclear — Retry Scan or Select Category Manually';
  }
}

export function validateWasteClassification(
  raw: unknown
): { valid: true; data: WasteClassificationResult } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'AI response was not a valid structured object.' };
  }

  const record = raw as Record<string, unknown>;
  const item = typeof record.item === 'string' ? record.item.trim() : '';
  const category = normalizeCategory(record.category);
  const reasoning = typeof record.reasoning === 'string' ? record.reasoning.trim() : '';
  const instructions =
    typeof record.instructions === 'string' ? record.instructions.trim() : '';
  const ecoTip = typeof record.ecoTip === 'string' ? record.ecoTip.trim() : '';
  const recommendedBinRaw =
    typeof record.recommendedBin === 'string' ? record.recommendedBin.trim() : '';

  const isUnclear =
    Boolean(record.isUnclear) ||
    category === 'Unclear' ||
    item.length === 0;

  if (!isUnclear && (!reasoning || !instructions)) {
    return {
      valid: false,
      error: 'AI response was missing required reasoning or disposal instructions.',
    };
  }

  let confidence: number | null = null;
  if (!isUnclear && typeof record.confidence === 'number' && Number.isFinite(record.confidence)) {
    const rounded = Math.round(record.confidence);
    if (rounded >= 1 && rounded <= 100) {
      confidence = rounded;
    }
  }

  const specialHandlingRequired = Boolean(record.specialHandlingRequired);
  const specialHandlingNote =
    specialHandlingRequired && typeof record.specialHandlingNote === 'string' && record.specialHandlingNote.trim().length > 0
      ? record.specialHandlingNote.trim()
      : specialHandlingRequired
        ? 'Handle carefully and keep separated from regular campus bins.'
        : null;

  return {
    valid: true,
    data: {
      item: item || 'Unidentified item',
      category: isUnclear ? 'Unclear' : category,
      reasoning:
        reasoning ||
        'The uploaded image is too blurry, dark, or ambiguous to identify a specific waste item reliably.',
      recommendedBin: recommendedBinRaw || getDefaultBinForCategory(isUnclear ? 'Unclear' : category),
      instructions:
        instructions ||
        'Retake the photo in brighter lighting with the waste item centered, or choose the matching waste category manually below.',
      specialHandlingRequired,
      specialHandlingNote,
      ecoTip:
        ecoTip ||
        'Separating clean recyclables from wet food waste keeps campus recovery rates high.',
      confidence,
      isUnclear,
    },
  };
}

export function computePointsForScan(
  category: WasteCategory,
  isManualOverride: boolean
): number {
  if (isManualOverride) {
    return 15;
  }
  switch (category) {
    case 'E-waste':
    case 'Hazardous waste':
      return 30;
    case 'Recyclable waste':
      return 20;
    case 'Wet waste':
    case 'Dry waste':
    default:
      return 15;
  }
}

export function canClaimScanPoints(
  scanHash: string,
  claimedScanHashes: readonly string[]
): boolean {
  if (!scanHash) return false;
  return !claimedScanHashes.includes(scanHash);
}

export function calculateRewardTier(points: number): {
  currentTier: RewardTierName;
  nextTier: RewardTierName | null;
  pointsToNext: number;
  progressPct: number;
  summary: string;
} {
  const safePoints = Math.max(0, Math.floor(points));
  let tierIndex = 0;

  for (let i = 0; i < REWARD_TIERS.length; i++) {
    if (safePoints >= REWARD_TIERS[i].minPoints) {
      tierIndex = i;
    }
  }

  const current = REWARD_TIERS[tierIndex];
  const next = tierIndex < REWARD_TIERS.length - 1 ? REWARD_TIERS[tierIndex + 1] : null;

  if (!next) {
    return {
      currentTier: current.name,
      nextTier: null,
      pointsToNext: 0,
      progressPct: 100,
      summary: current.summary,
    };
  }

  const span = next.minPoints - current.minPoints;
  const gained = safePoints - current.minPoints;
  const progressPct = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return {
    currentTier: current.name,
    nextTier: next.name,
    pointsToNext: Math.max(0, next.minPoints - safePoints),
    progressPct,
    summary: current.summary,
  };
}

export function applyScanToChallenges(
  challenges: readonly EcoChallenge[],
  category: WasteCategory
): EcoChallenge[] {
  return challenges.map((challenge) => {
    if (challenge.completed) return challenge;
    const matches =
      challenge.targetCategory === 'Any' || challenge.targetCategory === category;
    if (!matches) return challenge;
    const nextCount = Math.min(challenge.targetCount, challenge.currentCount + 1);
    return {
      ...challenge,
      currentCount: nextCount,
      completed: nextCount >= challenge.targetCount,
    };
  });
}

export function computeDashboardMetrics(
  scans: readonly WasteScanRecord[],
  bonusChallengePoints: number
): {
  totalScans: number;
  totalPoints: number;
  recyclableAndDryCount: number;
  recyclingRatePct: number;
  categoryCounts: Record<WasteCategory, number>;
} {
  const categoryCounts: Record<WasteCategory, number> = {
    'Wet waste': 0,
    'Dry waste': 0,
    'Recyclable waste': 0,
    'E-waste': 0,
    'Hazardous waste': 0,
  };

  let scanPoints = 0;
  for (const scan of scans) {
    if (isValidWasteCategory(scan.category)) {
      categoryCounts[scan.category] += 1;
    }
    if (scan.confirmed) {
      scanPoints += scan.pointsAwarded;
    }
  }

  const totalScans = scans.length;
  const recyclableAndDryCount =
    categoryCounts['Recyclable waste'] +
    categoryCounts['Dry waste'] +
    categoryCounts['E-waste'];
  const recyclingRatePct =
    totalScans > 0 ? Math.round((recyclableAndDryCount / totalScans) * 100) : 0;

  return {
    totalScans,
    totalPoints: scanPoints + Math.max(0, bonusChallengePoints),
    recyclableAndDryCount,
    recyclingRatePct,
    categoryCounts,
  };
}
