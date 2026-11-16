import React from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  Info,
  Leaf,
  Package,
  Recycle,
  Search,
} from 'lucide-react';
import { DISPOSAL_GUIDE_ITEMS } from '../data/seedData';
import type { WasteCategory } from '../types/sortsmart';

const CATEGORY_ICONS: Record<WasteCategory, React.ComponentType<{ className?: string }>> = {
  'Wet waste': Leaf,
  'Dry waste': Package,
  'Recyclable waste': Recycle,
  'E-waste': BatteryCharging,
  'Hazardous waste': AlertTriangle,
};

export const DisposalGuideView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<'All' | WasteCategory>('All');
  const [query, setQuery] = React.useState('');

  const filteredItems = DISPOSAL_GUIDE_ITEMS.filter((guide) => {
    const matchesCat = selectedCategory === 'All' || guide.category === selectedCategory;
    const q = query.trim().toLowerCase();
    if (!q) return matchesCat;
    const searchable = [
      guide.category,
      guide.binName,
      guide.summary,
      ...guide.examples,
      ...guide.disposalInstructions,
    ]
      .join(' ')
      .toLowerCase();
    return matchesCat && searchable.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header & Municipal Notice */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#172B35]">
              Smart Waste Segregation Guide
            </h2>
            <p className="text-sm text-[#475569]">
              Reference how Indian campuses, hostels, and municipal collection systems
              separate five core waste streams.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="guide-search" className="sr-only">
              Search waste items or disposal rules
            </label>
            <input
              id="guide-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bottle, battery, peel..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-[#172B35] placeholder:text-slate-400 focus:outline-none focus:border-[#16A36A] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-sky-50/80 border border-sky-200 text-xs text-sky-900">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <p>
            <strong>Municipal Rules Notice:</strong> Actual bin colors, multi-layer
            plastic rules, and e-waste pickup schedules can differ by municipality (e.g.,
            MCD, BMC, BBMP) and campus waste contractor. Always check local hostel bin
            signage.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5 pt-1"
          role="group"
          aria-label="Filter disposal categories"
        >
          {(['All', ...DISPOSAL_GUIDE_ITEMS.map((i) => i.category)] as const).map(
            (cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#172B35] text-white'
                      : 'bg-slate-100 text-[#475569] hover:text-[#172B35] hover:bg-slate-200/70'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Guide Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <div className="text-sm font-semibold text-[#172B35]">
            No matching waste items found
          </div>
          <p className="text-xs text-[#475569]">
            Try searching another item name or switch back to All Categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="mt-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-[#172B35]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((guide) => {
            const Icon = CATEGORY_ICONS[guide.category];
            return (
              <article
                key={guide.category}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: guide.accentHex }}
                  aria-hidden="true"
                />
                <div className="p-6 space-y-5 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${guide.badgeBgClass} ${guide.badgeTextClass}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold text-[#172B35]">
                          {guide.category}
                        </h3>
                        <div className="text-xs text-[#475569]">
                          {guide.binName} · {guide.binColorLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed">
                    {guide.summary}
                  </p>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-xs font-semibold text-[#172B35] mb-2">
                        Common Campus Examples
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#475569]">
                        {guide.examples.map((ex) => (
                          <li key={ex} className="flex items-start gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ backgroundColor: guide.accentHex }}
                              aria-hidden="true"
                            />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#172B35] mb-1.5">
                        Disposal Instructions
                      </div>
                      <ul className="space-y-1 text-xs text-[#475569]">
                        {guide.disposalInstructions.map((step) => (
                          <li key={step}>• {step}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-rose-700 mb-1.5">
                        Important Precautions
                      </div>
                      <ul className="space-y-1 text-xs text-[#475569]">
                        {guide.precautions.map((prec) => (
                          <li key={prec}>• {prec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
