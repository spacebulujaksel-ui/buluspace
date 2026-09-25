export interface CombinationItem {
  name: string;
  category: string;
  duration: number;
}

export function combinationError(_selected: CombinationItem[]): string | null {
  return null;
}

// Add-on yang durasinya diserap ke durasi dasar Brazilian/Feel Smooth (tidak menambah total).
const ABSORBED: Record<string, string[]> = {
  Brazilian: ["Eyebrows", "Upper Lip", "Chin", "Cheek", "Forehead", "Half Arms", "Half Legs", "Chest", "Stomach", "Buttocks"],
  "Feel Smooth": ["Eyebrows", "Upper Lip", "Chin", "Cheek", "Forehead", "Underarms", "Chest", "Stomach", "Buttocks", "Basic Bikini"],
};

export function totalMinutesFor(items: CombinationItem[]): number {
  const withBase = items.some((i) => i.name === "Brazilian")
    ? "Brazilian"
    : items.some((i) => i.name === "Feel Smooth")
      ? "Feel Smooth"
      : null;
  if (!withBase) return items.reduce((acc, i) => acc + i.duration, 0);
  const absorbed = ABSORBED[withBase] ?? [];
  return items.reduce((acc, i) => acc + (absorbed.includes(i.name) ? 0 : i.duration), 0);
}