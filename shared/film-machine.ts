/** Film machines may use the legacy "film" type or the newer "extruder" type. */
export function isActiveFilmMachine(machine: {
  section_id: string | null;
  type: string | null;
  status: string | null;
}): boolean {
  return machine.section_id === "SEC03" &&
    machine.status === "active" &&
    ["extruder", "film"].includes((machine.type || "").trim().toLowerCase());
}