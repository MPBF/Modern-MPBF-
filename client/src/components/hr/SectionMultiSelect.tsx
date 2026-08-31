import { ChevronDown, ListFilter } from "lucide-react";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type AttendanceSection = {
  id: string;
  name: string;
  name_ar: string | null;
};

type SectionMultiSelectProps = {
  sections: AttendanceSection[];
  selectedIds: string[];
  isLoading: boolean;
  isRTL: boolean;
  onChange: (ids: string[]) => void;
};

export default function SectionMultiSelect({
  sections,
  selectedIds,
  isLoading,
  isRTL,
  onChange,
}: SectionMultiSelectProps) {
  const L = (ar: string, en: string) => (isRTL ? ar : en);
  const selected = new Set(selectedIds);

  const toggleSection = (id: string) => {
    onChange(
      selected.has(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoading}
          className="min-w-36 justify-between gap-2"
          data-testid="button-daily-attendance-sections"
        >
          <span className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            {isLoading
              ? L("جاري تحميل الأقسام", "Loading sections")
              : `${L("الأقسام", "Sections")} (${selectedIds.length})`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isRTL ? "end" : "start"}
        className="w-72 p-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between border-b p-2">
          <span className="text-sm font-medium">
            {L("تصفية حسب القسم", "Filter by section")}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(sections.map((section) => section.id))}
            >
              {L("تحديد الكل", "Select all")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onChange([])}
            >
              {L("إلغاء الكل", "Clear all")}
            </Button>
          </div>
        </div>
        <div
          className="max-h-64 space-y-1 overflow-y-auto p-2"
          role="listbox"
          aria-multiselectable="true"
        >
          {sections.map((section) => {
            const label =
              (isRTL ? section.name_ar : section.name) ||
              section.name_ar ||
              section.name;
            const isSelected = selected.has(section.id);
            return (
              <label
                key={section.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSection(section.id)}
                  data-testid={`checkbox-daily-attendance-section-${section.id}`}
                />
                <span className="flex-1">{label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
