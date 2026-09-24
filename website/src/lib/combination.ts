export interface CombinationItem {
  name: string;
  category: string;
  duration: number;
}

const BRAZILIAN_ALLOWED = [
  "Eyebrows", "Upper Lip", "Chin", "Cheek", "Forehead",
  "Half Arms", "Half Legs", "Chest", "Stomach", "Buttocks",
];

export function combinationError(selected: CombinationItem[]): string | null {
  const hasBrazilian = selected.some((s) => s.name === "Brazilian");
  if (!hasBrazilian) return null;

  const forbidden = selected.filter((s) =>
    s.name !== "Brazilian" && s.name !== "Feel Smooth" && !BRAZILIAN_ALLOWED.includes(s.name),
  );
  if (forbidden.length === 0) return null;

  return "Brazilian hanya bisa digabung dengan: Eyebrows, Upper Lip, Chin, Cheek, Forehead, Half Arms, Half Legs, Chest, Stomach, Buttocks (atau paket Feel Smooth).";
}