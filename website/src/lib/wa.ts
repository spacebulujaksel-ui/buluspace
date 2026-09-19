export const WA_JAKBAR = '6285691717248';
export const WA_JAKSEL = '6285811331147';
export const DEFAULT_WA = WA_JAKBAR;

// Dipertahankan untuk kompatibilitas import lama.
export const ADMIN_WA_NUMBER = DEFAULT_WA;

export function isJaksel(branch?: string | null): boolean {
  return !!branch && branch.toLowerCase().includes('selatan');
}

export function waForBranch(branch?: string | null): string {
  return isJaksel(branch) ? WA_JAKSEL : WA_JAKBAR;
}

export function branchLabel(branch?: string | null): string {
  return isJaksel(branch) ? 'Jakarta Selatan' : 'Jakarta Barat';
}

export function buildWaLink(message: string, branch?: string | null): string {
  return `https://wa.me/${waForBranch(branch)}?text=${encodeURIComponent(message)}`;
}
