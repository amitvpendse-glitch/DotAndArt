export const BLOCKED_SKUS = new Set<string>([
  'DA-TC-CS-0001-COPY-304', 'DA-TC-CS-0001-COPY-585'
]);

export function isSkuBlocked(sku?: string, id?: string): boolean {
  if (sku && BLOCKED_SKUS.has(sku.toUpperCase())) return true;
  return false;
}

