import { useEffect, useRef, useState } from "react";

function currentTodayStr(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function useToday(onRollover?: () => void): string {
  const [today, setToday] = useState<string>(currentTodayStr);
  const cbRef = useRef(onRollover);
  cbRef.current = onRollover;

  useEffect(() => {
    const tick = () => {
      const next = currentTodayStr();
      setToday((prev) => {
        if (prev === next) return prev;
        try {
          cbRef.current?.();
        } catch (err) {
          console.warn("[use-today] rollover callback failed", err);
        }
        return next;
      });
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return today;
}
