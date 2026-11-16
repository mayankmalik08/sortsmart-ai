import React from 'react';
import { Award, Building2, Check, Edit2, MapPin, Recycle } from 'lucide-react';
import type {
  AchievementBadge,
  StudentProfile,
  WasteScanRecord,
} from '../types/sortsmart';
import { calculateRewardTier, computeDashboardMetrics } from '../utils/wasteLogic';

interface ProfileViewProps {
  profile: StudentProfile;
  scans: WasteScanRecord[];
  achievements: AchievementBadge[];
  bonusChallengePoints: number;
  onUpdateProfile: (next: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  scans,
  achievements,
  bonusChallengePoints,
  onUpdateProfile,
}) => {
  const [editing, setEditing] = React.useState(false);
  const [draftName, setDraftName] = React.useState(profile.name);
  const [draftInstitution, setDraftInstitution] = React.useState(profile.institution);
  const [draftZone, setDraftZone] = React.useState(profile.campusZone);
  const [avatarError, setAvatarError] = React.useState(false);

  const metrics = computeDashboardMetrics(scans, bonusChallengePoints);
  const tierInfo = calculateRewardTier(metrics.totalPoints);
  const unlockedBadges = achievements.filter((b) => b.unlocked);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim() || !draftInstitution.trim()) return;
    onUpdateProfile({
      ...profile,
      name: draftName.trim(),
      institution: draftInstitution.trim(),
      campusZone: draftZone.trim() || profile.campusZone,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {!avatarError ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-emerald-100 text-emerald-800 text-2xl font-display font-bold flex items-center justify-center shrink-0">
                {profile.name.slice(0, 1)}
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-[#172B35]">
                {profile.name}
              </h2>
              <div className="text-sm text-[#475569]">{profile.role}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#16A36A]" />
                  {profile.institution}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#16A36A]" />
                  {profile.campusZone}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDraftName(profile.name);
              setDraftInstitution(profile.institution);
              setDraftZone(profile.campusZone);
              setEditing((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#172B35] self-start md:self-center whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {editing && (
          <form
            onSubmit={handleSave}
            className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium text-[#475569] mb-1">
                Student Name
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-[#172B35] focus:outline-none focus:border-[#16A36A] focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="prof-inst" className="block text-xs font-medium text-[#475569] mb-1">
                Institution / Campus
              </label>
              <input
                id="prof-inst"
                type="text"
                required
                value={draftInstitution}
                onChange={(e) => setDraftInstitution(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-[#172B35] focus:outline-none focus:border-[#16A36A] focus:bg-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="prof-zone" className="block text-xs font-medium text-[#475569] mb-1">
                  Hostel / Zone
                </label>
                <input
                  id="prof-zone"
                  type="text"
                  value={draftZone}
                  onChange={(e) => setDraftZone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-[#172B35] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-sm font-semibold whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Profile KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Total Scans</div>
          <div className="mt-1.5 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {metrics.totalScans}
          </div>
          <div className="mt-1 text-xs text-[#475569]">Logged waste items</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Green Points</div>
          <div className="mt-1.5 text-3xl font-display font-bold text-[#16A36A] tabular-nums">
            {metrics.totalPoints.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Tier: {tierInfo.currentTier}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Achievements Unlocked</div>
          <div className="mt-1.5 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {unlockedBadges.length} / {achievements.length}
          </div>
          <div className="mt-1 text-xs text-[#475569]">Campus sustainability milestones</div>
        </div>
      </section>

      {/* Achievements & Recent Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-[#172B35]">
            Unlocked Achievements
          </h3>
          {unlockedBadges.length === 0 ? (
            <p className="text-xs text-[#475569]">
              Complete your first scan to unlock sustainability badges.
            </p>
          ) : (
            <div className="space-y-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A36A] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#172B35]">
                      {badge.title}
                    </div>
                    <p className="text-xs text-[#475569]">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-[#172B35]">
            Recent Activities
          </h3>
          {scans.length === 0 ? (
            <p className="text-xs text-[#475569]">No recent scan activities yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {scans.slice(0, 6).map((scan) => (
                <li
                  key={scan.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#16A36A] flex items-center justify-center shrink-0">
                      <Recycle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#172B35] truncate">
                        Sorted {scan.item}
                      </div>
                      <div className="text-xs text-[#475569]">
                        {scan.category} · {scan.recommendedBin}
                      </div>
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
