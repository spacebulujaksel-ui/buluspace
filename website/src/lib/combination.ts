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
    const ALLOWED = ['Eyebrows', 'Upper Lip', 'Chin', 'Cheek', 'Forehead', 'Underarms', 'Chest', 'Stomach', 'Buttocks', 'Basic Bikini'];
    const bad = selected.find((s) => s.name !== 'Feel Smooth' && !ALLOWED.includes(s.name));
    return bad ? 'Feel Smooth hanya bisa digabung dengan Eyebrows, Upper Lip, Chin, Cheek, Forehead, Underarms, Chest, Stomach, Buttocks, atau Basic Bikini.' : null;
  }

  const pkg = selected.find((s) => s.category === 'package');
  return pkg ? `${pkg.name} hanya bisa dipilih sendiri.` : null;
}