export const BLOCKED_SKUS = new Set<string>([
  'DA-AP-10-0001',
  'DA-AP-10-0002',
  'DA-AP-10-0003',
  'DA-AP-10-0004',
  'DA-AP-10-0005',
]);

export function isSkuBlocked(sku?: string, id?: string): boolean {
  if (sku) {
    const s = sku.trim().toUpperCase();
    if (s.startsWith('DA-AP') || s.includes('AP-10-000')) return true;
    if (BLOCKED_SKUS.has(s)) return true;
  }
  if (id) {
    const i = id.trim().toLowerCase();
    if (i.includes('da-ap') || i.includes('ap-10-000')) return true;
  }
  return false;
}
