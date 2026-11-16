export type WasteCategory =
  | 'Wet waste'
  | 'Dry waste'
  | 'Recyclable waste'
  | 'E-waste'
  | 'Hazardous waste';

export type ClassificationCategory = WasteCategory | 'Unclear';

export type AppPage =
  | 'dashboard'
  | 'scanner'
  | 'guide'
  | 'rewards'
  | 'profile'
  | 'admin';

export type RewardTierName =
  | 'Green Beginner'
  | 'Eco Explorer'
  | 'Sustainability Champion'
  | 'Planet Guardian';

export interface WasteClassificationResult {
  item: string;
  category: ClassificationCategory;
  reasoning: string;
  recommendedBin: string;
  instructions: string;
  specialHandlingRequired: boolean;
  specialHandlingNote: string | null;
  ecoTip: string;
  confidence: number | null;
  isUnclear: boolean;
}

export interface WasteScanRecord {
  id: string;
  scanHash: string;
  item: string;
  category: WasteCategory;
  recommendedBin: string;
  instructions: string;
  reasoning: string;
  ecoTip: string;
  specialHandlingRequired: boolean;
  confidence: number | null;
  pointsAwarded: number;
  confirmed: boolean;
  manualOverride: boolean;
  sourceMode: 'live-ai' | 'demo-sample' | 'manual-entry';
  timestamp: string;
  thumbnailUrl?: string;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardPoints: number;
  targetCategory?: WasteCategory | 'Any';
  completed: boolean;
  claimed: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  role: string;
  institution: string;
  campusZone: string;
  avatarUrl: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  institution: string;
  scans: number;
  points: number;
  isCurrentUser?: boolean;
}

export interface DisposalCategoryGuide {
  category: WasteCategory;
  binName: string;
  binColorLabel: string;
  accentHex: string;
  badgeBgClass: string;
  badgeTextClass: string;
  summary: string;
  examples: string[];
  disposalInstructions: string[];
  precautions: string[];
}

export interface InstitutionalAnalytics {
  totalRegisteredUsers: number;
  totalCampusScans: number;
  activeParticipationPct: number;
  totalPointsDistributed: number;
  categoryDistribution: Array<{
    category: WasteCategory;
    count: number;
    percentage: number;
    colorHex: string;
  }>;
  dailyActivity: Array<{
    day: string;
    scans: number;
    recycled: number;
  }>;
  weeklyActivity: Array<{
    week: string;
    scans: number;
    participationPct: number;
  }>;
  recentReports: Array<{
    id: string;
    zone: string;
    issue: string;
    category: WasteCategory;
    status: 'Resolved' | 'In Review' | 'Action Needed';
    reportedAt: string;
  }>;
  topParticipants: Array<{
    id: string;
    name: string;
    department: string;
    scans: number;
    points: number;
  }>;
}
