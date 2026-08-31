export function toNumericSectionIds(
  sectionIds: string[] | undefined,
): number[] | undefined {
  if (!sectionIds) return undefined;

  return sectionIds.flatMap((sectionId) => {
    const match = /^SEC(\d+)$/.exec(sectionId);
    if (!match) return [];
    const numericId = Number(match[1]);
    return Number.isSafeInteger(numericId) ? [numericId] : [];
  });
}