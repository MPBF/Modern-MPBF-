import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  Monitor,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Package,
  Factory,
  Megaphone,
  BookOpen,
  Bell,
  ExternalLink,
  Eye,
  GripVertical,
  Clock,
  Table2,
  ImageIcon,
  Users,
  Trophy,
  Upload,
  Loader2,
  Scissors,
  Printer,
  Film,
  Sparkles,
  Languages,
  ClipboardList,
} from "lucide-react";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../components/layout/PageLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";

interface SlideData {
  id: number;
  title: string;
  slide_type: string;
  content: any;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const ANNOUNCEMENT_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिन्दी" },
  { code: "fil", label: "Filipino" },
  { code: "ne", label: "नेपाली" },
];

function useSlideTypes() {
  const { t } = useTranslation();
  return [
    {
      value: "production_stats",
      label: t("display.types.production_stats"),
      icon: BarChart3,
      description: t("display.types.production_statsDesc"),
    },
    {
      value: "recent_production",
      label: t("display.types.recent_production"),
      icon: Package,
      description: t("display.types.recent_productionDesc"),
    },
    {
      value: "orders_board",
      label: "الطلبات وأوامر الإنتاج",
      icon: ClipboardList,
      description: "عرض الطلبات النشطة مع أوامر الإنتاج ونسب الإنجاز لكل قسم",
    },
    {
      value: "section_stats",
      label: "إحصائيات الأقسام",
      icon: Sparkles,
      description: "مقارنة إنتاج الفيلم والطباعة والتقطيع حسب الفترة",
    },
    {
      value: "machine_stats",
      label: "إحصائيات الماكينات",
      icon: Factory,
      description: "ترتيب الماكينات حسب الوزن وعدد الرولات",
    },
    {
      value: "user_stats",
      label: "إحصائيات المستخدمين",
      icon: Users,
      description: "متابعة إنتاج العاملين حسب القسم والفترة",
    },
    {
      value: "latest_rolls",
      label: t("display.types.latest_rolls"),
      icon: Factory,
      description: t("display.types.latest_rollsDesc"),
    },
    {
      value: "announcement",
      label: t("display.types.announcement"),
      icon: Megaphone,
      description: t("display.types.announcementDesc"),
    },
    {
      value: "instructions",
      label: t("display.types.instructions"),
      icon: BookOpen,
      description: t("display.types.instructionsDesc"),
    },
    {
      value: "notification",
      label: t("display.types.notification"),
      icon: Bell,
      description: t("display.types.notificationDesc"),
    },
    {
      value: "custom_table",
      label: t("display.types.custom_table"),
      icon: Table2,
      description: t("display.types.custom_tableDesc"),
    },
    {
      value: "image",
      label: t("display.types.image"),
      icon: ImageIcon,
      description: t("display.types.imageDesc"),
    },
    {
      value: "attendance",
      label: t("display.types.attendance"),
      icon: Users,
      description: t("display.types.attendanceDesc"),
    },
    {
      value: "top_producers",
      label: t("display.types.top_producers"),
      icon: Trophy,
      description: t("display.types.top_producersDesc"),
    },
  ];
}

function useColors() {
  const { t } = useTranslation();
  return [
    { value: "blue", label: t("display.colors.blue"), class: "bg-blue-500" },
    { value: "red", label: t("display.colors.red"), class: "bg-red-500" },
    { value: "green", label: t("display.colors.green"), class: "bg-green-500" },
    {
      value: "yellow",
      label: t("display.colors.yellow"),
      class: "bg-yellow-500",
    },
    {
      value: "purple",
      label: t("display.colors.purple"),
      class: "bg-purple-500",
    },
  ];
}

function useIcons() {
  const { t } = useTranslation();
  return [
    { value: "announcement", label: t("display.icons.announcement") },
    { value: "warning", label: t("display.icons.warning") },
    { value: "info", label: t("display.icons.info") },
    { value: "notification", label: t("display.icons.notification") },
  ];
}

function SlideForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: SlideData;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const SLIDE_TYPES = useSlideTypes();
  const COLORS = useColors();
  const ICONS = useIcons();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slideType, setSlideType] = useState(initialData?.slide_type || "");
  const [durationSeconds, setDurationSeconds] = useState(
    initialData?.duration_seconds || 10,
  );
  const [contentTitle, setContentTitle] = useState(
    initialData?.content?.title || "",
  );
  const [contentMessage, setContentMessage] = useState(
    initialData?.content?.message || "",
  );
  const [contentFooter, setContentFooter] = useState(
    initialData?.content?.footer || "",
  );
  const [contentColor, setContentColor] = useState(
    initialData?.content?.color || "blue",
  );
  const [contentIcon, setContentIcon] = useState(
    initialData?.content?.icon || "announcement",
  );
  const [autoTranslate, setAutoTranslate] = useState<boolean>(
    !!initialData?.content?.autoTranslate,
  );
  const [translateLangs, setTranslateLangs] = useState<string[]>(
    Array.isArray(initialData?.content?.translateLangs)
      ? initialData!.content.translateLangs
      : [],
  );
  const [translations, setTranslations] = useState<Record<string, any>>(
    initialData?.content?.translations || {},
  );
  const [translatedSource, setTranslatedSource] = useState<string>(
    initialData?.content?.translatedSource || "",
  );
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();
  const [instructionItems, setInstructionItems] = useState<string[]>(
    initialData?.content?.items || [""],
  );

  const [tableName, setTableName] = useState(
    initialData?.content?.tableName || "",
  );
  const [tableColumns, setTableColumns] = useState<string[]>(
    initialData?.content?.columns || [""],
  );
  const [tableRows, setTableRows] = useState<string[][]>(
    initialData?.content?.rows || [[""]],
  );
  const [headerColor, setHeaderColor] = useState(
    initialData?.content?.headerColor || "blue",
  );

  const [imageUrl, setImageUrl] = useState(initialData?.content?.url || "");
  const [imageCaption, setImageCaption] = useState(
    initialData?.content?.caption || "",
  );
  const [imageFit, setImageFit] = useState<"contain" | "cover">(
    initialData?.content?.fit || "contain",
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topPeriod, setTopPeriod] = useState(
    initialData?.content?.period || "today",
  );
  const [topStage, setTopStage] = useState(
    initialData?.content?.stage || "all",
  );
  const [orderStatus, setOrderStatus] = useState(
    initialData?.content?.status || "active",
  );
  const [rowLimit, setRowLimit] = useState(initialData?.content?.limit || 8);

  const handleSubmit = () => {
    if (!title || !slideType) return;
    let content: any = null;
    if (slideType === "announcement" || slideType === "notification") {
      content = {
        title: contentTitle,
        message: contentMessage,
        footer: contentFooter,
        color: contentColor,
        icon: contentIcon,
        autoTranslate,
        translateLangs: autoTranslate ? translateLangs : [],
        translations: autoTranslate ? translations : {},
        translatedSource: autoTranslate ? translatedSource : "",
      };
    } else if (slideType === "instructions") {
      content = { items: instructionItems.filter((i) => i.trim()) };
    } else if (slideType === "custom_table") {
      content = {
        tableName,
        headerColor,
        columns: tableColumns.filter((c) => c.trim()),
        rows: tableRows,
      };
    } else if (slideType === "image") {
      content = {
        url: imageUrl,
        caption: imageCaption || undefined,
        fit: imageFit,
      };
    } else if (slideType === "orders_board") {
      content = {
        status: orderStatus,
        stage: topStage,
        limit: rowLimit,
      };
    } else if (
      slideType === "section_stats" ||
      slideType === "machine_stats" ||
      slideType === "user_stats"
    ) {
      content = {
        period: topPeriod,
        stage: topStage,
        limit: rowLimit,
      };
    } else if (slideType === "top_producers") {
      content = { period: topPeriod, stage: topStage };
    }
    onSubmit({
      title,
      slide_type: slideType,
      duration_seconds: durationSeconds,
      content,
    });
  };

  const sourceSignature = `${contentTitle}|::SEP::|${contentMessage}|::SEP::|${contentFooter}`;
  const translationsStale =
    Object.keys(translations).length > 0 &&
    translatedSource !== "" &&
    translatedSource !== sourceSignature;

  const toggleTranslateLang = (code: string) => {
    setTranslateLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleGenerateTranslations = async () => {
    if (!contentTitle.trim() && !contentMessage.trim() && !contentFooter.trim()) {
      toast({
        title: t("display.announcement_form.translate.noText"),
        variant: "destructive",
      });
      return;
    }
    if (translateLangs.length === 0) {
      toast({
        title: t("display.announcement_form.translate.noLangs"),
        variant: "destructive",
      });
      return;
    }
    setTranslating(true);
    try {
      const res = await apiRequest("/api/display/translate", {
        method: "POST",
        body: JSON.stringify({
          title: contentTitle,
          message: contentMessage,
          footer: contentFooter,
          languages: translateLangs,
        }),
        timeout: 90000,
      });
      const data = await res.json();
      if (data?.translations) {
        setTranslations(data.translations);
        setTranslatedSource(sourceSignature);
        toast({ title: t("display.announcement_form.translate.success") });
      } else {
        throw new Error("no translations");
      }
    } catch (err: any) {
      toast({
        title: t("display.announcement_form.translate.error"),
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/display/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const addTableColumn = () => {
    setTableColumns([...tableColumns, ""]);
    setTableRows(tableRows.map((row) => [...row, ""]));
  };

  const removeTableColumn = (idx: number) => {
    if (tableColumns.length <= 1) return;
    setTableColumns(tableColumns.filter((_, i) => i !== idx));
    setTableRows(tableRows.map((row) => row.filter((_, i) => i !== idx)));
  };

  const addTableRow = () => {
    setTableRows([...tableRows, new Array(tableColumns.length).fill("")]);
  };

  const removeTableRow = (idx: number) => {
    if (tableRows.length <= 1) return;
    setTableRows(tableRows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("display.slideTitle")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("display.duration")}</Label>
          <Input
            type="number"
            min={3}
            max={120}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("display.slideType")}</Label>
        <div className="grid grid-cols-2 gap-3">
          {SLIDE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSlideType(type.value)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                  slideType === type.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mt-0.5 flex-shrink-0 ${slideType === type.value ? "text-blue-600" : "text-gray-400"}`}
                />
                <div>
                  <div className="font-bold text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {type.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(slideType === "announcement" || slideType === "notification") && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.announcement_form.content")}
          </h4>
          <div className="space-y-2">
            <Label>{t("display.announcement_form.mainTitle")}</Label>
            <Input
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("display.announcement_form.messageText")}</Label>
            <Textarea
              value={contentMessage}
              onChange={(e) => setContentMessage(e.target.value)}
              placeholder={t("display.announcement_form.writeMessage")}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("display.announcement_form.footer")}</Label>
            <Input
              value={contentFooter}
              onChange={(e) => setContentFooter(e.target.value)}
              placeholder={t("display.announcement_form.footerExample")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("display.announcement_form.bgColor")}</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setContentColor(c.value)}
                    className={`w-10 h-10 rounded-lg ${c.class} transition-all ${contentColor === c.value ? "ring-4 ring-offset-2 ring-blue-400 scale-110" : "opacity-60 hover:opacity-100"}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("display.announcement_form.icon")}</Label>
              <Select value={contentIcon} onValueChange={setContentIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-translate"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <Label
                htmlFor="auto-translate"
                className="flex items-center gap-2 cursor-pointer font-bold text-sm"
              >
                <Languages className="w-4 h-4 text-blue-600" />
                {t("display.announcement_form.translate.enable")}
              </Label>
            </div>

            {autoTranslate && (
              <div className="space-y-3 pr-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("display.announcement_form.translate.help")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ANNOUNCEMENT_LANGUAGES.map((lang) => {
                    const active = translateLangs.includes(lang.code);
                    const done = !!translations[lang.code];
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleTranslateLang(lang.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }`}
                      >
                        {lang.label}
                        {active && done ? " ✓" : ""}
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTranslations}
                  disabled={translating || translateLangs.length === 0}
                >
                  {translating ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4 ml-2" />
                  )}
                  {t("display.announcement_form.translate.generate")}
                </Button>
                {Object.keys(translations).length > 0 &&
                  !translationsStale && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {t("display.announcement_form.translate.ready", {
                        count: Object.keys(translations).length,
                      })}
                    </div>
                  )}
                {translationsStale && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {t("display.announcement_form.translate.stale")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {slideType === "instructions" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.instructions_form.title")}
          </h4>
          {instructionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                {i + 1}
              </span>
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...instructionItems];
                  newItems[i] = e.target.value;
                  setInstructionItems(newItems);
                }}
                placeholder={`${t("display.instructions_form.itemPlaceholder")} ${i + 1}`}
              />
              {instructionItems.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setInstructionItems(
                      instructionItems.filter((_, idx) => idx !== i),
                    )
                  }
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInstructionItems([...instructionItems, ""])}
          >
            <Plus className="w-4 h-4 ml-2" />
            {t("display.instructions_form.addItem")}
          </Button>
        </div>
      )}

      {slideType === "custom_table" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.table_form.title")}
          </h4>
          <div className="space-y-2">
            <Label>{t("display.table_form.tableName")}</Label>
            <Input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("display.table_form.columns")}</Label>
            {tableColumns.map((col, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={col}
                  onChange={(e) => {
                    const newCols = [...tableColumns];
                    newCols[i] = e.target.value;
                    setTableColumns(newCols);
                  }}
                  placeholder={`${t("display.table_form.columnName")} ${i + 1}`}
                />
                {tableColumns.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTableColumn(i)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTableColumn}>
              <Plus className="w-4 h-4 ml-2" />
              {t("display.table_form.addColumn")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("display.table_form.rows")}</Label>
            {tableRows.map((row, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                  {ri + 1}
                </span>
                {row.map((cell, ci) => (
                  <Input
                    key={ci}
                    value={cell}
                    onChange={(e) => {
                      const newRows = tableRows.map((r) => [...r]);
                      newRows[ri][ci] = e.target.value;
                      setTableRows(newRows);
                    }}
                    placeholder={tableColumns[ci] || `${ci + 1}`}
                    className="flex-1"
                  />
                ))}
                {tableRows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTableRow(ri)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTableRow}>
              <Plus className="w-4 h-4 ml-2" />
              {t("display.table_form.addRow")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("display.table_form.headerColor")}</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setHeaderColor(c.value)}
                  className={`w-10 h-10 rounded-lg ${c.class} transition-all ${headerColor === c.value ? "ring-4 ring-offset-2 ring-blue-400 scale-110" : "opacity-60 hover:opacity-100"}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {slideType === "image" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.image_form.title")}
          </h4>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {t("display.image_form.uploading")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  {t("display.image_form.upload")}
                </>
              )}
            </Button>
          </div>

          {imageUrl && (
            <div className="space-y-2">
              <img
                src={imageUrl}
                alt="preview"
                className="max-h-48 rounded-lg border object-contain"
              />
              <div className="text-xs text-gray-500 truncate">{imageUrl}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("display.image_form.caption")}</Label>
            <Input
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("display.image_form.fit")}</Label>
            <Select
              value={imageFit}
              onValueChange={(v: "contain" | "cover") => setImageFit(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">
                  {t("display.image_form.contain")}
                </SelectItem>
                <SelectItem value="cover">
                  {t("display.image_form.cover")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {slideType === "attendance" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.attendance_slide.title")}
          </h4>
          <p className="text-sm text-gray-500">
            {t("display.types.attendanceDesc")}
          </p>
        </div>
      )}

      {slideType === "orders_board" && (
        <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            إعدادات شريحة الطلبات وأوامر الإنتاج
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>حالة الطلبات</Label>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">الطلبات النشطة</SelectItem>
                  <SelectItem value="all">كل الطلبات</SelectItem>
                  <SelectItem value="waiting">بانتظار الإنتاج</SelectItem>
                  <SelectItem value="in_production">قيد الإنتاج</SelectItem>
                  <SelectItem value="on_hold">معلّقة</SelectItem>
                  <SelectItem value="paused">متوقفة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Select value={topStage} onValueChange={setTopStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  <SelectItem value="film">الفيلم</SelectItem>
                  <SelectItem value="printing">الطباعة</SelectItem>
                  <SelectItem value="cutting">التقطيع</SelectItem>
                  <SelectItem value="done">جاهز</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>عدد الطلبات</Label>
              <Input
                type="number"
                min={3}
                max={20}
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {(slideType === "section_stats" ||
        slideType === "machine_stats" ||
        slideType === "user_stats") && (
        <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            إعدادات شريحة الإحصائيات
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>الفترة</Label>
              <Select value={topPeriod} onValueChange={setTopPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="month">الشهر</SelectItem>
                  <SelectItem value="year">السنة</SelectItem>
                  <SelectItem value="all">كل الفترات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Select value={topStage} onValueChange={setTopStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  <SelectItem value="film">الفيلم</SelectItem>
                  <SelectItem value="printing">الطباعة</SelectItem>
                  <SelectItem value="cutting">التقطيع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {slideType !== "section_stats" && (
              <div className="space-y-2">
                <Label>عدد النتائج</Label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={rowLimit}
                  onChange={(e) => setRowLimit(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {slideType === "top_producers" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            {t("display.top_producers_slide.title")}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("display.top_producers_slide.period")}</Label>
              <Select value={topPeriod} onValueChange={setTopPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    {t("display.top_producers_slide.today")}
                  </SelectItem>
                  <SelectItem value="week">
                    {t("display.top_producers_slide.week")}
                  </SelectItem>
                  <SelectItem value="month">
                    {t("display.top_producers_slide.month")}
                  </SelectItem>
                  <SelectItem value="year">السنة</SelectItem>
                  <SelectItem value="all">
                    {t("display.top_producers_slide.allTime")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("display.top_producers_slide.section")}</Label>
              <Select value={topStage} onValueChange={setTopStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("display.top_producers_slide.allSections")}
                  </SelectItem>
                  <SelectItem value="film">
                    {t("display.top_producers_slide.film")}
                  </SelectItem>
                  <SelectItem value="printing">
                    {t("display.top_producers_slide.printing")}
                  </SelectItem>
                  <SelectItem value="cutting">
                    {t("display.top_producers_slide.cutting")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          {t("display.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={!title || !slideType}>
          {initialData ? t("display.update") : t("display.add")}{" "}
          {t("display.theSlide")}
        </Button>
      </div>
    </div>
  );
}

export default function DisplayControlPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);
  const SLIDE_TYPES = useSlideTypes();

  const { data: slides = [], isLoading } = useQuery<SlideData[]>({
    queryKey: ["/api/display/slides"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("/api/display/slides", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display/slides"] });
      toast({ title: t("display.created") });
      setDialogOpen(false);
    },
    onError: () =>
      toast({ title: t("display.createError"), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest(`/api/display/slides/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display/slides"] });
      toast({ title: t("display.updated") });
      setDialogOpen(false);
      setEditingSlide(null);
    },
    onError: () =>
      toast({ title: t("display.updateError"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/display/slides/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display/slides"] });
      toast({ title: t("display.deleted") });
    },
    onError: () =>
      toast({ title: t("display.deleteError"), variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: number;
      is_active: boolean;
    }) => {
      const res = await apiRequest(`/api/display/slides/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display/slides"] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async (slideOrders: { id: number; sort_order: number }[]) => {
      const res = await apiRequest("/api/display/slides/reorder", {
        method: "PUT",
        body: JSON.stringify({ slideOrders }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display/slides"] });
    },
  });

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];
    const orders = newSlides.map((s, i) => ({ id: s.id, sort_order: i }));
    moveMutation.mutate(orders);
  };

  const handleSubmit = (data: any) => {
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data });
    } else {
      createMutation.mutate({ ...data, sort_order: slides.length });
    }
  };

  const openEdit = (slide: SlideData) => {
    setEditingSlide(slide);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingSlide(null);
    setDialogOpen(true);
  };

  const getSlideTypeInfo = (type: string) =>
    SLIDE_TYPES.find((t) => t.value === type);
  const activeSlides = slides.filter((slide) => slide.is_active).length;
  const totalDuration = slides.reduce(
    (sum, slide) => sum + Number(slide.duration_seconds || 0),
    0,
  );
  const liveSlides = slides.filter((slide) =>
    [
      "production_stats",
      "recent_production",
      "orders_board",
      "section_stats",
      "machine_stats",
      "user_stats",
      "top_producers",
      "attendance",
      "latest_rolls",
    ].includes(slide.slide_type),
  ).length;
  const formatSlideContent = (slide: SlideData) => {
    const content = slide.content || {};
    const parts = [];
    if (content.period) parts.push(`الفترة: ${content.period === "today" ? "اليوم" : content.period === "month" ? "الشهر" : content.period === "year" ? "السنة" : "كل الفترات"}`);
    if (content.stage) parts.push(`القسم: ${content.stage === "all" ? "كل الأقسام" : content.stage === "film" ? "الفيلم" : content.stage === "printing" ? "الطباعة" : content.stage === "cutting" ? "التقطيع" : content.stage}`);
    if (content.status) parts.push(`الحالة: ${content.status === "active" ? "النشطة" : content.status}`);
    if (content.limit) parts.push(`عدد العرض: ${content.limit}`);
    if (content.message) parts.push(content.message);
    if (content.items) parts.push(`${content.items.length} تعليمات`);
    return parts.join(" • ");
  };

  return (
    <PageLayout
      title={t("display.controlPanel")}
      description={t("display.manageSlidesDesc")}
    >
      <div className="space-y-6" dir="rtl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-l from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-blue-100 ring-1 ring-white/10">
                <Monitor className="h-4 w-4" />
                شاشة المصنع المباشرة
              </div>
              <h2 className="text-3xl font-black tracking-normal">
                {t("display.manageSlides")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                إدارة الشرائح التي تظهر أمام عمال الفيلم والطباعة والتقطيع، مع بيانات مباشرة عن الطلبات والإنتاج والمراكز الأولى.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <a href="/display-screen" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Monitor className="w-4 h-4 ml-2" />
                {t("display.openDisplay")}
                <ExternalLink className="w-3 h-3 mr-2" />
              </Button>
            </a>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) setEditingSlide(null);
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="bg-blue-500 text-white hover:bg-blue-600">
                  <Plus className="w-4 h-4 ml-2" />
                  {t("display.addSlide")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlide
                      ? t("display.editSlide")
                      : t("display.addSlide")}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSlide
                      ? t("display.editSlideDescription")
                      : t("display.addSlideDescription")}
                  </DialogDescription>
                </DialogHeader>
                <SlideForm
                  initialData={editingSlide || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setDialogOpen(false);
                    setEditingSlide(null);
                  }}
                />
              </DialogContent>
            </Dialog>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: "إجمالي الشرائح", value: slides.length, icon: Table2 },
              { label: "شرائح فعالة", value: activeSlides, icon: Eye },
              { label: "شرائح مباشرة", value: liveSlides, icon: Sparkles },
              { label: "مدة الدورة", value: `${totalDuration}s`, icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-2xl font-black">{item.value}</div>
                      <div className="text-xs font-medium text-white/60">{item.label}</div>
                    </div>
                    <Icon className="h-6 w-6 text-blue-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Monitor className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">
                {t("display.noSlides")}
              </h3>
              <p className="text-gray-400 mb-6">{t("display.noSlidesDesc")}</p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 ml-2" />
                {t("display.addFirstSlide")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {slides.map((slide, index) => {
              const typeInfo = getSlideTypeInfo(slide.slide_type);
              const Icon = typeInfo?.icon || Monitor;
              const contentSummary = formatSlideContent(slide);
              return (
                <Card
                  key={slide.id}
                  className={`overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 ${!slide.is_active ? "opacity-55" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch gap-4">
                      <div className="flex flex-col items-center justify-center gap-1 border-l border-slate-100 bg-slate-50 px-2 dark:border-slate-800 dark:bg-slate-900">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSlide(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <GripVertical className="w-4 h-4 text-gray-300 mx-auto" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSlide(index, "down")}
                          disabled={index === slides.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="min-w-0 flex-1 py-4 pl-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-black text-slate-950 dark:text-white">
                                {slide.title}
                              </h3>
                              <Badge variant="secondary" className="rounded-full text-xs">
                                {typeInfo?.label || slide.slide_type}
                              </Badge>
                              <Badge className={slide.is_active ? "rounded-full bg-emerald-50 text-emerald-700" : "rounded-full bg-slate-100 text-slate-500"}>
                                {slide.is_active ? "نشطة" : "متوقفة"}
                              </Badge>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {contentSummary || typeInfo?.description || "شريحة عرض"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="hidden items-center gap-2 px-2 text-gray-500 sm:flex">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {slide.duration_seconds}s
                        </span>
                      </div>

                      <Switch
                        checked={slide.is_active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({
                            id: slide.id,
                            is_active: checked,
                          })
                        }
                      />

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(slide)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            if (confirm(t("display.deleteConfirm"))) {
                              deleteMutation.mutate(slide.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              {t("display.tutorials.title")}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {t("display.tutorials.description")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: "film",
                  icon: Film,
                  color: "blue",
                  bgColor:
                    "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
                  iconColor: "text-blue-600",
                  btnClass: "bg-blue-600 hover:bg-blue-700",
                  titleKey: "display.tutorials.film.title",
                  descKey: "display.tutorials.film.description",
                  slideTitle: t("display.tutorials.film.slideTitle"),
                  items: [
                    t("display.tutorials.film.step1"),
                    t("display.tutorials.film.step2"),
                    t("display.tutorials.film.step3"),
                    t("display.tutorials.film.step4"),
                    t("display.tutorials.film.step5"),
                    t("display.tutorials.film.step6"),
                    t("display.tutorials.film.step7"),
                  ],
                },
                {
                  key: "printing",
                  icon: Printer,
                  color: "purple",
                  bgColor:
                    "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
                  iconColor: "text-purple-600",
                  btnClass: "bg-purple-600 hover:bg-purple-700",
                  titleKey: "display.tutorials.printing.title",
                  descKey: "display.tutorials.printing.description",
                  slideTitle: t("display.tutorials.printing.slideTitle"),
                  items: [
                    t("display.tutorials.printing.step1"),
                    t("display.tutorials.printing.step2"),
                    t("display.tutorials.printing.step3"),
                    t("display.tutorials.printing.step4"),
                    t("display.tutorials.printing.step5"),
                  ],
                },
                {
                  key: "cutting",
                  icon: Scissors,
                  color: "green",
                  bgColor:
                    "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                  iconColor: "text-green-600",
                  btnClass: "bg-green-600 hover:bg-green-700",
                  titleKey: "display.tutorials.cutting.title",
                  descKey: "display.tutorials.cutting.description",
                  slideTitle: t("display.tutorials.cutting.slideTitle"),
                  items: [
                    t("display.tutorials.cutting.step1"),
                    t("display.tutorials.cutting.step2"),
                    t("display.tutorials.cutting.step3"),
                    t("display.tutorials.cutting.step4"),
                    t("display.tutorials.cutting.step5"),
                    t("display.tutorials.cutting.step6"),
                  ],
                },
              ].map((tutorial) => {
                const TIcon = tutorial.icon;
                return (
                  <div
                    key={tutorial.key}
                    className={`rounded-xl border p-4 ${tutorial.bgColor}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm`}
                      >
                        <TIcon className={`w-5 h-5 ${tutorial.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {t(tutorial.titleKey)}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {t(tutorial.descKey)}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {tutorial.items.slice(0, 3).map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          <span
                            className={`w-4 h-4 rounded-full ${tutorial.btnClass} text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold`}
                          >
                            {i + 1}
                          </span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {tutorial.items.length > 3 && (
                        <li className="text-xs text-gray-400 pr-6">
                          +{tutorial.items.length - 3}{" "}
                          {t("display.tutorials.moreSteps")}
                        </li>
                      )}
                    </ul>
                    <Button
                      size="sm"
                      className={`w-full ${tutorial.btnClass} text-white`}
                      onClick={() => {
                        createMutation.mutate({
                          title: tutorial.slideTitle,
                          slide_type: "instructions",
                          duration_seconds: 30,
                          content: { items: tutorial.items },
                          sort_order: slides.length,
                        });
                      }}
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <Plus className="w-4 h-4 ml-2" />
                      )}
                      {t("display.tutorials.addToDisplay")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="py-4 px-5">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">
                  {t("display.tips")}
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                  <li>{t("display.tip1")}</li>
                  <li>{t("display.tip2")}</li>
                  <li>{t("display.tip3")}</li>
                  <li>{t("display.tip4")}</li>
                  <li>{t("display.tip5")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
