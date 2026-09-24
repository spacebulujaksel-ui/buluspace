export interface CombinationItem {
  name: string;
  category: string;
  duration: number;
}

export function combinationError(_selected: CombinationItem[]): string | null {
  return null;
}