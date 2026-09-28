/** A normal roll may neither close film nor claim a later production stage. */
export function hasInvalidOrdinaryFilmOverride(body: {
  is_last_roll?: unknown;
  stage?: unknown;
}): boolean {
  return (body.is_last_roll != null && body.is_last_roll !== false) ||
    (body.stage != null && body.stage !== "film");
}