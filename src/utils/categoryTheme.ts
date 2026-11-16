import type { ClassificationCategory } from '../types/sortsmart';

export interface CategoryVisualTokens {
  accentHex: string;
  surfaceTint: string;
  textColor: string;
  borderColor: string;
  shortLabel: string;
}

export function getCategoryVisuals(category: ClassificationCategory): CategoryVisualTokens {
  switch (category) {
    case 'Wet waste':
      return {
        accentHex: '#16A36A',
        surfaceTint: 'bg-emerald-50/70',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-200',
        shortLabel: 'Green Compost Bin',
      };
    case 'Dry waste':
      return {
        accentHex: '#38BDF8',
        surfaceTint: 'bg-sky-50/70',
        textColor: 'text-sky-800',
        borderColor: 'border-sky-200',
        shortLabel: 'Blue Dry Bin',
      };
    case 'Recyclable waste':
      return {
        accentHex: '#65A30D',
        surfaceTint: 'bg-lime-50/80',
        textColor: 'text-lime-900',
        borderColor: 'border-lime-200',
        shortLabel: 'Blue Recyclable Bin',
      };
    case 'E-waste':
      return {
        accentHex: '#CA8A04',
        surfaceTint: 'bg-amber-50/80',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-200',
        shortLabel: 'E-Waste Drop-Box',
      };
    case 'Hazardous waste':
      return {
        accentHex: '#E11D48',
        surfaceTint: 'bg-rose-50/75',
        textColor: 'text-rose-800',
        borderColor: 'border-rose-200',
        shortLabel: 'Red Hazardous Bin',
      };
    case 'Unclear':
    default:
      return {
        accentHex: '#64748B',
        surfaceTint: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        shortLabel: 'Manual Review',
      };
  }
}
