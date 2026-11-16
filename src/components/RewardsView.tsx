import React from 'react';
import { Award, CheckCircle2, Info, Lock, Trophy } from 'lucide-react';
import { CAMPUS_LEADERBOARD } from '../data/seedData';
import type {
  AchievementBadge,
  AppPage,
  EcoChallenge,
  StudentProfile,
  WasteScanRecord,
} from '../types/sortsmart';
import {
  REWARD_TIERS,
  calculateRewardTier,
  computeDashboardMetrics,
} from '../utils/wasteLogic';

interface RewardsViewProps {
  profile: StudentProfile;
  scans: WasteScanRecord[];
  challenges: EcoChallenge[];
  achievements: AchievementBadge[];
  bonusChallengePoints: number;
  onClaimChallenge: (challengeId: string) => void;
  onNavigate: (page: AppPage) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  profile,
  scans,
  challenges,
  achievements,
  bonusChallengePoints,
  onClaimChallenge,
  onNavigate,
}) => {
  const metrics = computeDashboardMetrics(scans, bonusChallengePoints);
  const tierInfo = calculateRewardTier(metrics.totalPoints);

  const combinedLeaderboard = [
    ...CAMPUS_LEADERBOARD,
    {
      id: 'current-user',
      name: `${profile.name} (You)`,
      institution: profile.institution,
      scans: metrics.totalScans,
      points: metrics.totalPoints,
      isCurrentUser: true,
    },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Prototype Rewards Disclaimer */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Prototype Gamification Notice:</strong> Green Points, reward tiers,
          and campus leaderboard standings are prototype sustainability recognition
          metrics and are <strong>not redeemable cash</strong>. Duplicate point claims
          from the same waste scan image are automatically blocked.
        </p>
      </div>

      {/* Points & Tier Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="text-xs font-medium text-[#475569]">
              Total Green Points Balance
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-[#16A36A] tabular-nums">
                {metrics.totalPoints.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-[#475569]">pts</span>
            </div>
            <p className="mt-2 text-sm text-[#475569]">
              Current Tier:{' '}
              <strong className="text-[#172B35]">{tierInfo.currentTier}</strong>
            </p>
            <p className="mt-1 text-xs text-[#475569]">{tierInfo.summary}</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-[#475569] tabular-nums">
              <span>
                {tierInfo.nextTier
                  ? `Progress to ${tierInfo.nextTier}`
                  : 'Highest tier achieved'}
              </span>
              <span className="font-mono font-semibold text-[#172B35]">
                {tierInfo.progressPct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A36A] transition-all duration-300"
                style={{ width: `${tierInfo.progressPct}%` }}
              />
            </div>
            {tierInfo.nextTier && (
              <div className="text-xs text-[#475569] tabular-nums">
                {tierInfo.pointsToNext} more points needed for {tierInfo.nextTier}
              </div>
            )}
          </div>
        </div>

        {/* 4 Reward Tiers */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-[#172B35]">
            Campus Sustainability Reward Tiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {REWARD_TIERS.map((tier) => {
              const isCurrent = tier.name === tierInfo.currentTier;
              const unlocked = metrics.totalPoints >= tier.minPoints;
              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-xl border ${
                    isCurrent
                      ? 'border-[#16A36A] bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-display font-bold text-[#172B35]">
                      {tier.name}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-[#475569]">
                      {tier.maxPoints !== null
                        ? `${tier.minPoints}–${tier.maxPoints} pts`
                        : `${tier.minPoints}+ pts`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                    {tier.summary}
                  </p>
                  <div className="mt-2.5 text-[11px] font-semibold">
                    {isCurrent ? (
                      <span className="text-[#16A36A]">Active Tier</span>
                    ) : unlocked ? (
                      <span className="text-[#475569]">Completed</span>
                    ) : (
                      <span className="text-slate-400">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Eco Challenges & Achievement Badges */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              Daily Eco Challenges
            </h3>
            <span className="text-xs text-[#475569]">Updated on scan confirm</span>
          </div>

          <div className="divide-y divide-slate-100">
            {challenges.map((ch) => {
              const pct = Math.min(
                100,
                Math.round((ch.currentCount / Math.max(1, ch.targetCount)) * 100)
              );
              return (
                <div key={ch.id} className="py-4 first:pt-1 last:pb-1 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#172B35]">
                        {ch.title}
                      </div>
                      <p className="text-xs text-[#475569] mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-semibold text-[#16A36A] shrink-0">
                      +{ch.rewardPoints} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#16A36A]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[#475569] shrink-0">
                      {ch.currentCount}/{ch.targetCount}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    {ch.claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A36A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bonus Claimed
                      </span>
                    ) : ch.completed ? (
                      <button
                        type="button"
                        onClick={() => onClaimChallenge(ch.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-xs font-semibold"
                      >
                        Claim +{ch.rewardPoints} pts
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('scanner')}
                        className="text-xs font-medium text-[#16A36A] hover:underline"
                      >
                        Scan item to progress
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-[#172B35]">
            Achievement Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  badge.unlocked
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      badge.unlocked
                        ? 'bg-emerald-50 text-[#16A36A]'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {badge.unlocked ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#475569]">
                    {badge.unlocked ? badge.unlockedAt || 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#172B35]">
                    {badge.title}
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
                <div className="text-[11px] text-[#475569] pt-1 border-t border-slate-100">
                  Target: {badge.requirementLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Leaderboard & Activity History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FACC15]" />
              <h3 className="text-base font-display font-semibold text-[#172B35]">
                Campus Hostel Leaderboard (Demo)
              </h3>
            </div>
            <span className="text-xs text-[#475569]">Live personal rank</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-[#475569] bg-slate-50/70">
                  <th className="py-3 px-6">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 text-right">Scans</th>
                  <th className="py-3 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {combinedLeaderboard.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={entry.isCurrentUser ? 'bg-emerald-50/50 font-medium' : ''}
                  >
                    <td className="py-3 px-6 font-mono tabular-nums text-xs text-[#475569]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#172B35] font-medium">{entry.name}</div>
                      <div className="text-xs text-[#475569]">{entry.institution}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-[#475569]">
                      {entry.scans}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums text-xs font-semibold text-[#16A36A]">
                      {entry.points.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-[#172B35]">
            Points Activity History
          </h3>
          {scans.length === 0 ? (
            <p className="text-xs text-[#475569]">
              No points earned yet. Confirm a waste scan to log activity.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {scans.slice(0, 6).map((scan) => (
                <li
                  key={scan.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#172B35] truncate">
                      {scan.item}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {scan.category} ·{' '}
                      {new Date(scan.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#16A36A] shrink-0">
                    +{scan.pointsAwarded} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
