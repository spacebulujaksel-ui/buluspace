export const ADMIN_WA_NUMBER = '6281285356113';

export function buildWaLink(message: string): string {
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}