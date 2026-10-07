// Salinan identik logika backend App\Services\BookingDuration::totalMinutes
// utk dipakai di UI admin. updateServices di backend memakai totalMinutes yang
// sama, jadi durasi "pas" tidak pernah beda antara form dan server.

export interface DurationItem {
  name: string;
  duration_minutes: number;
}

// Paket memberi gratis SATU layanan 15 menit. Hanya layanan 15 menit yang boleh
// diserap; 10 menit dan 30/45 menit selalu dihitung normal.
const PACKAGE_FREE_MINUTES = 15;
const ABSORBED: Record<string, string[]> = {
  Brazilian: ["Eyebrows", "Underarms", "Half Arms", "Half Legs", "Chest", "Stomach", "Buttocks"],
  "Feel Smooth": ["Eyebrows", "Underarms", "Chest", "Stomach", "Buttocks", "Basic Bikini"],
};

export function totalMinutesFor(items: DurationItem[]): number {
  const hasBrazilian = items.some((i) => i.name === "Brazilian");
  const hasFeelSmooth = items.some((i) => i.name === "Feel Smooth");
  const total = items.reduce((acc, i) => acc + i.duration_minutes, 0);
  if (!hasBrazilian && !hasFeelSmooth) return total;

  const absorbed = [
    ...(hasBrazilian ? ABSORBED["Brazilian"] : []),
    ...(hasFeelSmooth ? ABSORBED["Feel Smooth"] : []),
  ];
  const hasFreeSlot = items.some(
    (i) => absorbed.includes(i.name) && i.duration_minutes === PACKAGE_FREE_MINUTES,
  );

  return hasFreeSlot ? total - PACKAGE_FREE_MINUTES : total;
}

/** "16:00" / "16:00:00" -> menit */
export function minutesOf(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
}