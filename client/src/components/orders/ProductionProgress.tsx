import { Film, Printer, Scissors } from "lucide-react";

interface ProductionProgressProps {
  filmPercentage: number;
  printingPercentage: number;
  cuttingPercentage: number;
}

export default function ProductionProgress({
  filmPercentage,
  printingPercentage,
  cuttingPercentage,
}: ProductionProgressProps) {
  // تحديد النسب بحيث لا تتجاوز 100% لكل مرحلة
  const cappedFilm = Math.min(Math.max(filmPercentage || 0, 0), 100);
  const cappedPrinting = Math.min(Math.max(printingPercentage || 0, 0), 100);
  const cappedCutting = Math.min(Math.max(cuttingPercentage || 0, 0), 100);

  const stages = [
    {
      key: "film",
      label: "الفيلم",
      value: cappedFilm,
      icon: Film,
      barClass: "bg-slate-900 dark:bg-slate-100",
      iconClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
      testId: "progress-film",
    },
    {
      key: "printing",
      label: "الطباعة",
      value: cappedPrinting,
      icon: Printer,
      barClass: "bg-red-500",
      iconClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      testId: "progress-printing",
    },
    {
      key: "cutting",
      label: "القص",
      value: cappedCutting,
      icon: Scissors,
      barClass: "bg-amber-500",
      iconClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      testId: "progress-cutting",
    },
  ];

  return (
    <div className="grid w-full min-w-[210px] gap-2" aria-label="نسب إنجاز مراحل الإنتاج">
      {stages.map((stage) => {
        const Icon = stage.icon;
        const roundedValue = Math.round(stage.value);

        return (
          <div
            key={stage.key}
            className="grid grid-cols-[4.75rem_1fr_2.75rem] items-center gap-2"
            data-testid={stage.testId}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${stage.iconClass}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span>{stage.label}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stage.barClass}`}
                style={{ width: `${stage.value}%` }}
              />
            </div>
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-center text-[11px] font-black text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
              {roundedValue}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
