export const BLOCKED_SKUS = new Set<string>([
  'DA-TC-CS-0001-COPY-304',
  'DA-TC-CS-0001-COPY-585',
  'DA-TC-CS-0001-AMIT',
]);

export const BLOCKED_IDS = new Set<string>([
  'prod-tc-3-1793234378011',
]);

export function isSkuBlocked(sku?: string, id?: string): boolean {
  if (sku && BLOCKED_SKUS.has(sku.trim().toUpperCase())) return true;
  if (id && BLOCKED_IDS.has(id.trim())) return true;
  return false;
}

