export const ADMIN_WA_NUMBER = '6281234567890';

export function buildWaLink(message: string): string {
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}