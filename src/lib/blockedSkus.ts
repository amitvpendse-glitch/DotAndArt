export const BLOCKED_SKUS = new Set<string>([
  'DA-AP-10-0001',
  'DA-AP-10-0002',
  'DA-AP-10-0003',
  'DA-AP-10-0004',
  'DA-AP-10-0005',
  'DA-LP-SM-0001',
  'DA-LP-SM-0002',
  'DA-LP-MD-0001',
  'DA-LP-MD-0002',
  'DA-LP-MD-0003',
  'DA-LP-LG-0001',
  'DA-LP-LG-0002',
  'DA-LP-LG-0003',
]);

export function isSkuBlocked(sku?: string, id?: string): boolean {
  if (sku) {
    const s = sku.trim().toUpperCase();
    if (s.startsWith('DA-AP') || s.includes('AP-10-000')) return true;
    if (s.startsWith('DA-LP-SM') || s.startsWith('DA-LP-MD') || s.startsWith('DA-LP-LG')) return true;
    if (BLOCKED_SKUS.has(s)) return true;
  }
  if (id) {
    const i = id.trim().toLowerCase();
    if (i.includes('da-ap') || i.includes('ap-10-000')) return true;
    if (i.includes('da-lp-sm') || i.includes('da-lp-md') || i.includes('da-lp-lg')) return true;
  }
  return false;
}
