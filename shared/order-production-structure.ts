export interface ProductionOrderStructureItem {
  customer_product_id: unknown;
  quantity_kg: unknown;
}

export function validProductionOrderStructure(
  rows: ProductionOrderStructureItem[],
): Array<{ customer_product_id: unknown; quantity_kg: number }> {
  return rows
    .map((row) => ({
      customer_product_id: row.customer_product_id,
      quantity_kg: Number(row.quantity_kg),
    }))
    .filter((row) =>
      String(row.customer_product_id ?? "").trim().length > 0 &&
      Number.isFinite(row.quantity_kg) &&
      row.quantity_kg > 0,
    );
}

export function productionOrderStructureChanged(
  existing: ProductionOrderStructureItem[],
  proposed: ProductionOrderStructureItem[],
): boolean {
  const normalize = (rows: ProductionOrderStructureItem[]) =>
    validProductionOrderStructure(rows)
      .map((row) => `${String(row.customer_product_id).trim()}\u0000${row.quantity_kg}`)
      .sort();
  const left = normalize(existing);
  const right = normalize(proposed);
  return left.length !== right.length || left.some((value, index) => value !== right[index]);
}

export function orderStructureEditDecision(
  _status: string,
  existing: ProductionOrderStructureItem[],
  proposed: ProductionOrderStructureItem[],
): { changed: boolean; blocked: boolean } {
  const changed = productionOrderStructureChanged(existing, proposed);
  return { changed, blocked: changed };
}