export interface CombinationItem {
  name: string;
  category: string;
  duration: number;
}

export function combinationError(_selected: CombinationItem[]): string | null {
  return null;
}

// Paket memberi gratis SATU layanan 15 menit. Hanya layanan 15 menit yang boleh
// diserap; 10 menit dan 30/45 menit selalu dihitung normal.
const PACKAGE_FREE_MINUTES = 15;
const ABSORBED: Record<string, string[]> = {
  Brazilian: ["Eyebrows", "Underarms", "Half Arms", "Half Legs", "Chest", "Stomach", "Buttocks"],
  "Feel Smooth": ["Eyebrows", "Underarms", "Chest", "Stomach", "Buttocks", "Basic Bikini"],
};

export function totalMinutesFor(items: CombinationItem[]): number {
  const hasBrazilian = items.some((i) => i.name === "Brazilian");
  const hasFeelSmooth = items.some((i) => i.name === "Feel Smooth");
  const total = items.reduce((acc, i) => acc + i.duration, 0);
  if (!hasBrazilian && !hasFeelSmooth) return total;

  const absorbed = [
    ...(hasBrazilian ? ABSORBED["Brazilian"] : []),
    ...(hasFeelSmooth ? ABSORBED["Feel Smooth"] : []),
  ];
  const hasFreeSlot = items.some(
    (i) => absorbed.includes(i.name) && i.duration === PACKAGE_FREE_MINUTES,
  );

  return hasFreeSlot ? total - PACKAGE_FREE_MINUTES : total;
}
