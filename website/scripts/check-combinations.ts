import assert from "node:assert/strict";
import { totalMinutesFor } from "../src/lib/combination.ts";

const durations: Record<string, number> = {
  "Feel Smooth": 60,
  Brazilian: 30,
  "Full Back": 30,
  "Full Front": 30,
  "Full Arms": 30,
  "Full Legs": 30,
  "Bali Ready": 45,
  "Clean Girl": 45,
  Eyebrows: 15,
  Underarms: 15,
  "Half Arms": 15,
  Forehead: 10,
};

const cases: [string[], number][] = [
  [["Feel Smooth", "Full Back"], 90],
  [["Feel Smooth", "Full Front"], 90],
  [["Feel Smooth", "Full Legs"], 90],
  [["Feel Smooth", "Brazilian"], 90],
  [["Feel Smooth", "Bali Ready"], 105],
  [["Feel Smooth", "Clean Girl"], 105],
  [["Brazilian", "Full Arms"], 60],
  [["Brazilian", "Full Back"], 60],
  [["Brazilian", "Full Front"], 60],
  [["Brazilian", "Full Legs"], 60],
  [["Brazilian", "Feel Smooth"], 90],
  [["Brazilian", "Clean Girl"], 75],
  [["Brazilian", "Bali Ready"], 75],
  // Paket gratis SATU layanan 15 menit; sisanya dihitung normal.
  [["Brazilian", "Underarms"], 30],
  [["Brazilian", "Eyebrows"], 30],
  [["Brazilian", "Eyebrows", "Underarms"], 45],
  [["Brazilian", "Eyebrows", "Underarms", "Half Arms"], 60],
  [["Brazilian", "Full Legs", "Eyebrows", "Underarms"], 75],
  [["Brazilian", "Forehead"], 40],
  [["Feel Smooth", "Eyebrows", "Underarms"], 75],
  [["Feel Smooth", "Brazilian", "Underarms"], 90],
];

for (const [names, expected] of cases) {
  const actual = totalMinutesFor(
    names.map((name) => ({ name, category: "", duration: durations[name] })),
  );
  assert.equal(actual, expected, names.join(" + "));
}

console.log(`${cases.length} kombinasi durasi sesuai.`);
