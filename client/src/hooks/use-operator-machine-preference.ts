import { useCallback, useEffect, useMemo, useState } from "react";

export type OperatorMachineStage = "film" | "printing" | "cutting";

const STORAGE_PREFIX = "mpbf:operator-machine:v1";

export function getOperatorMachineStorageKey(
  stage: OperatorMachineStage,
  userId: number | string | null | undefined,
): string | null {
  if (userId === null || userId === undefined || userId === "") return null;
  return `${STORAGE_PREFIX}:${stage}:${String(userId)}`;
}

interface UseOperatorMachinePreferenceOptions {
  stage: OperatorMachineStage;
  userId: number | string | null | undefined;
  availableMachineIds: string[];
  machinesReady: boolean;
}

export function useOperatorMachinePreference({
  stage,
  userId,
  availableMachineIds,
  machinesReady,
}: UseOperatorMachinePreferenceOptions) {
  const storageKey = getOperatorMachineStorageKey(stage, userId);
  const machineIdsKey = useMemo(
    () => availableMachineIds.join("|"),
    [availableMachineIds],
  );
  const [selectedMachineIdState, setSelectedMachineIdState] =
    useState<string>("");
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // A user change must clear the previous user's choice before reading the
  // new user key. This prevents a brief cross-user selection during re-renders.
  useEffect(() => {
    if (!storageKey) {
      setSelectedMachineIdState("");
      setLoadedKey(null);
      return;
    }

    let stored = "";
    try {
      stored = localStorage.getItem(storageKey) || "";
    } catch {
      // Keep the preference in React state if browser storage is unavailable.
    }
    setSelectedMachineIdState(stored);
    setLoadedKey(storageKey);
  }, [storageKey]);

  const isReady =
    Boolean(storageKey) && loadedKey === storageKey && machinesReady;
  const selectedMachineId =
    isReady && availableMachineIds.includes(selectedMachineIdState)
      ? selectedMachineIdState
      : "";

  // The machine list is asynchronous and machines can be deactivated. Never
  // keep or submit a saved id that is not currently available to this stage.
  useEffect(() => {
    if (!isReady || !selectedMachineIdState) return;
    if (availableMachineIds.includes(selectedMachineIdState)) return;

    setSelectedMachineIdState("");
    try {
      if (storageKey) localStorage.removeItem(storageKey);
    } catch {
      // React state is still cleared even when storage removal is blocked.
    }
  }, [
    availableMachineIds,
    isReady,
    machineIdsKey,
    selectedMachineIdState,
    storageKey,
  ]);

  const setSelectedMachineId = useCallback(
    (id: string) => {
      setSelectedMachineIdState(id);
      if (!storageKey) return;
      try {
        if (id) localStorage.setItem(storageKey, id);
        else localStorage.removeItem(storageKey);
      } catch {
        // The current selection remains usable for this page session.
      }
    },
    [storageKey],
  );

  return {
    selectedMachineId,
    setSelectedMachineId,
    isReady,
  };
}
