import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";

const FIELDS = [
  { key: "check_in_time", ar: "وقت الحضور", en: "Check-in" },
  { key: "break_start_time", ar: "بداية الاستراحة", en: "Break start" },
  { key: "break_end_time", ar: "العودة من الاستراحة", en: "Break return" },
  { key: "check_out_time", ar: "وقت الانصراف", en: "Check-out" },
] as const;

export type TimeField = (typeof FIELDS)[number]["key"];
export type BulkTimes = Partial<Record<TimeField, string | null>>;

export default function BulkAttendanceDialog({
  open, onOpenChange, count, isRTL, isSaving, onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  isRTL: boolean;
  isSaving: boolean;
  onSave: (times: BulkTimes) => void;
}) {
  const [enabled, setEnabled] = useState<TimeField[]>([]);
  const [values, setValues] = useState<Partial<Record<TimeField, string>>>({});
  const L = (ar: string, en: string) => isRTL ? ar : en;
  useEffect(() => {
    if (!open) {
      setEnabled([]);
      setValues({});
    }
  }, [open]);

  function close(next: boolean) {
    if (isSaving) return;
    if (!next) {
      setEnabled([]);
      setValues({});
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{L(`تعديل أوقات ${count} موظف`, `Edit times for ${count} employees`)}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {L("حدد الأوقات التي تريد تغييرها فقط. الحقل المحدد والفارغ يمسح وقته من جميع السجلات المحددة.",
            "Select only the times to change. A selected empty field clears that time for all selected records.")}
        </p>
        <div className="space-y-3 py-2">
          {FIELDS.map(({ key, ar, en }) => (
            <div key={key} className="flex flex-wrap items-center gap-3">
              <Checkbox
                id={`bulk-${key}`}
                checked={enabled.includes(key)}
                onCheckedChange={(checked) => setEnabled((current) =>
                  checked ? [...current, key] : current.filter((item) => item !== key))}
              />
              <Label htmlFor={`bulk-${key}`} className="min-w-28 cursor-pointer">{L(ar, en)}</Label>
              <Input
                type="time"
                aria-label={L(ar, en)}
                className="w-32"
                disabled={!enabled.includes(key)}
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => close(false)} disabled={isSaving}>{L("إلغاء", "Cancel")}</Button>
          <Button
            disabled={!enabled.length || count > 100 || isSaving}
            onClick={() => onSave(Object.fromEntries(enabled.map((key) => [key, values[key] || null])) as BulkTimes)}
          >
            {isSaving ? L("جاري الحفظ...", "Saving...") : L("تطبيق على المحددين", "Apply to selected")}
          </Button>
        </DialogFooter>
        {count > 100 && <p className="text-sm text-destructive">
          {L("يمكن تعديل 100 موظف كحد أقصى في المرة الواحدة.", "Edit at most 100 employees at a time.")}
        </p>}
      </DialogContent>
    </Dialog>
  );
}