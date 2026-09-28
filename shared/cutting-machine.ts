/** Legacy and current machine types both occur in production data. */
export function isActiveCuttingMachine(machine: {
  section_id: string | null;
  type: string | null;
  status: string | null;
}): boolean {
  return machine.section_id === "SEC05" &&
    machine.status === "active" &&
    ["cutter", "cutting"].includes((machine.type || "").trim().toLowerCase());
}