/** Printer names/types are stored in both legacy and newer forms. */
export function isActivePrintingMachine(machine: {
  section_id: string | null;
  type: string | null;
  status: string | null;
}): boolean {
  return machine.section_id === "SEC04" &&
    machine.status === "active" &&
    ["printer", "printing"].includes((machine.type || "").trim().toLowerCase());
}