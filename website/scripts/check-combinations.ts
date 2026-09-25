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
};

const cases: [string, string, number][] = [
  ["Feel Smooth", "Full Back", 90],
  ["Feel Smooth", "Full Front", 90],
  ["Feel Smooth", "Full Legs", 90],
  ["Feel Smooth", "Brazilian", 90],
  ["Feel Smooth", "Bali Ready", 105],
  ["Feel Smooth", "Clean Girl", 105],
  ["Brazilian", "Full Arms", 60],
  ["Brazilian", "Full Back", 60],
  ["Brazilian", "Full Front", 60],
  ["Brazilian", "Full Legs", 60],
  ["Brazilian", "Feel Smooth", 90],
  ["Brazilian", "Clean Girl", 75],
  ["Brazilian", "Bali Ready", 75],
];

for (const [first, second, expected] of cases) {
  const actual = totalMinutesFor([
    { name: first, category: "", duration: durations[first] },
    { name: second, category: "", duration: durations[second] },
  ]);
  assert.equal(actual, expected, `${first} + ${second}`);
}

console.log(`${cases.length} kombinasi durasi sesuai.`);
