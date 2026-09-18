export interface CombinationItem {
  name: string;
  category: string;
  duration: number;
}

const FULL_TREATMENTS = ['Full Legs', 'Full Arms', 'Full Front', 'Full Back'];

export function combinationError(selected: CombinationItem[]): string | null {
  if (selected.length < 2) return null;

  const names = selected.map((s) => s.name);

  if (names.includes('Brazilian')) {
    const bad = selected.find((s) => s.category === 'package' || FULL_TREATMENTS.includes(s.name));
    return bad ? `Brazilian tidak bisa digabung dengan ${bad.name}.` : null;
  }

  if (names.includes('Feel Smooth')) {
    const bad = selected.find((s) => s.name !== 'Feel Smooth' && (s.duration < 10 || s.duration > 15));
    return bad ? 'Feel Smooth hanya bisa digabung dengan treatment 10–15 menit.' : null;
  }

  const full = selected.find((s) => FULL_TREATMENTS.includes(s.name));
  if (full) return `${full.name} hanya bisa dipilih sendiri.`;

  const pkg = selected.find((s) => s.category === 'package');
  return pkg ? `${pkg.name} hanya bisa dipilih sendiri.` : null;
}