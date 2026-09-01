import { useQuery } from "@tanstack/react-query";
import {
  Factory,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  BarChart3,
  Megaphone,
  BookOpen,
  Bell,
  Table2,
  ImageIcon,
  Users,
  Trophy,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  Medal,
  Copy,
  Check,
  Film,
  Printer,
  Scissors,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSmartPolling } from "../../hooks/use-smart-polling";

interface SlideData {
  id: number;
  title: string;
  slide_type: string;
  content: any;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
}

interface ProductionOrder {
  id: number;
  production_order_number: string;
  status: string;
  quantity_kg: string;
  produced_quantity_kg: string;
  film_completion_percentage: string;
  size_caption: string;
  order_number: string;
  customer_name: string;
  customer_name_ar: string;
}

interface RollData {
  id: number;
  roll_number: string;
  weight_kg: string;
  status: string;
  created_at: string;
  machine_name: string;
  machine_name_ar: string;
  production_order_number: string;
  size_caption: string;
}

interface ProductionStats {
  active_orders: string;
  rolls_today: string;
  production_kg_today: string;
  completed_today: string;
}

interface AttendanceData {
  records: any[];
  totalPresent: number;
  totalAbsent: number;
  total: number;
  date: string;
}

interface TopProducersData {
  period: string;
  stage: string;
  sections: Record<string, any[]>;
}

interface OrdersBoardData {
  filters: { status: string; stage: string; limit: number };
  orders: any[];
}

interface SectionStatsData {
  period: string;
  sections: any[];
}

interface MachineStatsData {
  period: string;
  stage: string;
  machines: any[];
}

interface UserStatsData {
  period: string;
  stage: string;
  users: any[];
}

function useLocale() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "en").toLowerCase();
  if (lang.startsWith("ar")) return "ar-SA";
  return "en-US";
}

function formatNumber(
  val: string | number | null | undefined,
  locale: string = "en-US",
) {
  const num = Number(val);
  if (isNaN(num)) return "0";
  return num.toLocaleString(locale, { maximumFractionDigits: 1 });
}

function formatTime(dateStr: string, locale: string = "en-US") {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

const stageLabels: Record<string, string> = {
  film: "الفيلم",
  printing: "الطباعة",
  cutting: "التقطيع",
  done: "جاهز",
  all: "كل الأقسام",
};

const stageLabelsEn: Record<string, string> = {
  film: "Film",
  printing: "Printing",
  cutting: "Cutting",
  done: "Ready",
  all: "All Sections",
};

const stageIcons: Record<string, any> = {
  film: Film,
  printing: Printer,
  cutting: Scissors,
  done: Check,
  all: Factory,
};

const stageColors: Record<string, string> = {
  film: "from-slate-200 to-white text-slate-950",
  printing: "from-red-500 to-rose-700 text-white",
  cutting: "from-amber-400 to-orange-600 text-slate-950",
  done: "from-emerald-500 to-teal-700 text-white",
  all: "from-blue-500 to-cyan-700 text-white",
};

function StageProgressStrip({ order }: { order: any }) {
  const stages = [
    { key: "film", value: Number(order.film_completion_percentage) || 0 },
    { key: "printing", value: Number(order.printing_completion_percentage) || 0 },
    { key: "cutting", value: Number(order.cutting_completion_percentage) || 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stages.map((stage) => {
        const Icon = stageIcons[stage.key];
        const value = Math.min(Math.max(stage.value, 0), 100);
        return (
          <div key={stage.key} className="rounded-xl bg-white/10 p-2">
            <div className="mb-1 flex items-center justify-between gap-2 text-white/80">
              <span className="flex items-center gap-1 text-xs font-bold">
                <Icon className="h-3.5 w-3.5" />
                <span>{stageLabels[stage.key]}</span>
                <span className="opacity-70" dir="ltr">
                  {stageLabelsEn[stage.key]}
                </span>
              </span>
              <span className="text-xs font-black">{Math.round(value)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full bg-gradient-to-l ${stageColors[stage.key]}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CurrentDateTime() {
  const displayLocale = "en-US";
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4 text-white/90">
      <div className="text-2xl font-bold tabular-nums">
        {now.toLocaleTimeString(displayLocale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
      <div className="text-lg opacity-80">
        {now.toLocaleDateString(displayLocale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
}

function ProductionStatsSlide({
  stats,
}: {
  stats: ProductionStats | undefined;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const items = [
    {
      icon: Factory,
      label: t("display.stats.activeOrders"),
      value: stats?.active_orders || "0",
      color: "from-blue-600 to-blue-800",
    },
    {
      icon: Package,
      label: t("display.stats.rollsToday"),
      value: stats?.rolls_today || "0",
      color: "from-green-600 to-green-800",
    },
    {
      icon: TrendingUp,
      label: t("display.stats.productionToday"),
      value: formatNumber(stats?.production_kg_today, locale),
      color: "from-purple-600 to-purple-800",
    },
    {
      icon: BarChart3,
      label: t("display.stats.completedToday"),
      value: stats?.completed_today || "0",
      color: "from-orange-600 to-orange-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      {items.map((item, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br ${item.color} rounded-3xl p-10 flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-transform`}
          style={{ animation: `fadeSlideUp 0.6s ease-out ${i * 0.15}s both` }}
        >
          <item.icon className="w-16 h-16 text-white/80 mb-4" />
          <div className="text-7xl font-black text-white mb-3 tabular-nums">
            {item.value}
          </div>
          <div className="text-2xl text-white/90 font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function OrdersBoardSlide({ data }: { data: OrdersBoardData | undefined }) {
  const locale = useLocale();
  const englishLocale = "en-US";
  const orders = data?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-white/50">
        <div>
          <ClipboardList className="mx-auto mb-4 h-24 w-24 opacity-40" />
          <p className="text-3xl font-bold">لا توجد طلبات مطابقة للفلاتر</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 gap-5 p-6">
      {orders.slice(0, data?.filters?.limit || 8).map((order, index) => (
        <div
          key={order.id}
          className="flex min-h-0 flex-col rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-sm"
          style={{ animation: `fadeSlideUp 0.45s ease-out ${index * 0.07}s both` }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-3xl font-black text-white">
                {order.order_number}
              </div>
              <div className="mt-2 space-y-1">
                <div className="truncate text-xl font-bold text-blue-200">
                  {order.customer_name_ar || "بدون اسم عربي"}
                </div>
                <div className="truncate text-base font-semibold text-white/65" dir="ltr">
                  {order.customer_name || "No English customer name"}
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-center">
              <div className="text-3xl font-black text-white">
                {formatNumber(order.production_order_count, englishLocale)}
              </div>
              <div className="text-xs font-bold uppercase tracking-wide text-white/60" dir="ltr">
                Production Orders
              </div>
            </div>
          </div>

          <StageProgressStrip order={order} />

          <div className="mt-4 flex-1 space-y-2 overflow-hidden">
            {(order.production_orders || []).slice(0, 3).map((po: any) => {
              const StageIcon = stageIcons[po.production_stage || "film"] || Factory;
              const categoryName = po.category_name_ar || "غير محدد";
              const itemName = po.item_name_ar || "غير محدد";
              return (
                <div
                  key={po.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-black/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-lg font-black text-white">
                        {po.production_order_number}
                      </span>
                      <span className="truncate text-base font-bold text-blue-100">
                        الفئة: {categoryName} · الصنف: {itemName}
                      </span>
                    </div>
                    <div className="truncate text-sm text-white/60">
                      المقاس: {po.size_caption || "غير محدد"} • {formatNumber(po.quantity_kg, locale)} كجم
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full bg-gradient-to-l px-3 py-1.5 text-sm font-black ${stageColors[po.production_stage] || stageColors.all}`}>
                    <StageIcon className="h-4 w-4" />
                    <span>{stageLabels[po.production_stage] || po.production_stage}</span>
                    <span className="opacity-70" dir="ltr">
                      {stageLabelsEn[po.production_stage] || po.production_stage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionStatsSlide({ data }: { data: SectionStatsData | undefined }) {
  const locale = useLocale();
  const sections = data?.sections || [];
  const totalWeight = sections.reduce(
    (sum, item) => sum + Number(item.total_weight_kg || 0),
    0,
  );

  return (
    <div className="grid h-full grid-cols-3 gap-6 p-8">
      {sections.map((section, index) => {
        const Icon = stageIcons[section.stage] || Factory;
        const weight = Number(section.total_weight_kg || 0);
        const share = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
        return (
          <div
            key={section.stage}
            className="flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-sm"
            style={{ animation: `fadeScaleIn 0.5s ease-out ${index * 0.12}s both` }}
          >
            <div>
              <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${stageColors[section.stage] || stageColors.all}`}>
                <Icon className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black text-white">
                {stageLabels[section.stage] || section.stage}
              </h3>
              <p className="mt-2 text-xl text-white/60">إنتاج الفترة المحددة</p>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-7xl font-black text-white tabular-nums">
                  {formatNumber(weight, locale)}
                </div>
                <div className="text-2xl font-bold text-white/70">كجم</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-black/20 p-4">
                  <div className="text-3xl font-black text-white">
                    {formatNumber(section.roll_count, locale)}
                  </div>
                  <div className="text-sm text-white/60">رول</div>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <div className="text-3xl font-black text-white">{share}%</div>
                  <div className="text-sm text-white/60">الحصة</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankingStatsSlide({
  title,
  rows,
  rowLabel,
}: {
  title: string;
  rows: any[];
  rowLabel: "machine" | "user";
}) {
  const locale = useLocale();
  const medalStyles = [
    "from-yellow-300 to-amber-500 text-slate-950",
    "from-slate-200 to-slate-400 text-slate-950",
    "from-orange-300 to-orange-700 text-white",
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-8 py-5 backdrop-blur-sm">
        <h3 className="text-4xl font-black text-white">{title}</h3>
        <Trophy className="h-12 w-12 text-yellow-300" />
      </div>
      <div className="grid gap-4">
        {rows.slice(0, 8).map((row, index) => {
          const StageIcon = stageIcons[row.stage] || Factory;
          const name =
            rowLabel === "machine"
              ? row.name_ar || row.name || row.machine_id
              : row.full_name || row.username || row.user_id;
          return (
            <div
              key={`${row.stage}-${row.machine_id || row.user_id}-${index}`}
              className="grid grid-cols-[5rem_1fr_12rem_10rem] items-center gap-5 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
              style={{ animation: `fadeSlideRight 0.4s ease-out ${index * 0.06}s both` }}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl font-black ${medalStyles[index] || "from-white/10 to-white/5 text-white"}`}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="truncate text-3xl font-black text-white">{name}</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-bold text-white/60">
                  <StageIcon className="h-5 w-5" />
                  {stageLabels[row.stage] || row.stage}
                </div>
              </div>
              <div className="text-left">
                <div className="text-4xl font-black text-white">
                  {formatNumber(row.total_weight_kg, locale)}
                </div>
                <div className="text-sm font-bold text-white/50">كجم</div>
              </div>
              <div className="rounded-2xl bg-black/20 p-4 text-center">
                <div className="text-3xl font-black text-white">
                  {formatNumber(row.roll_count, locale)}
                </div>
                <div className="text-sm text-white/60">رول</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentProductionSlide({ orders }: { orders: ProductionOrder[] }) {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const isAr = i18n.language === "ar";

  const getStatusInfo = (status: string) => {
    const key = `display.status.${status}`;
    const label = t(key);
    const colorMap: Record<string, string> = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
      new: "bg-purple-500",
      film_production: "bg-indigo-500",
      printing: "bg-cyan-500",
      cutting: "bg-orange-500",
    };
    return {
      label: label !== key ? label : status,
      color: colorMap[status] || "bg-gray-500",
    };
  };

  return (
    <div className="p-6">
      <div className="grid gap-3">
        {orders.map((order, i) => {
          const status = getStatusInfo(order.status);
          const progress = Number(order.film_completion_percentage) || 0;
          return (
            <div
              key={order.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-6 border border-white/10"
              style={{
                animation: `fadeSlideRight 0.5s ease-out ${i * 0.08}s both`,
              }}
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-bold text-white">
                    {order.production_order_number}
                  </span>
                  <span
                    className={`${status.color} text-white text-sm px-3 py-1 rounded-full font-medium`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="text-white/70 text-base truncate">
                  {isAr
                    ? order.customer_name_ar || order.customer_name
                    : order.customer_name || order.customer_name_ar}{" "}
                  — {order.size_caption}
                </div>
              </div>
              <div className="flex-shrink-0 text-left w-40">
                <div className="text-white/60 text-sm mb-1">
                  {t("display.progress")}
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="text-white font-bold text-lg mt-1">
                  {formatNumber(progress, locale)}%
                </div>
              </div>
              <div className="flex-shrink-0 text-left w-28">
                <div className="text-white/60 text-sm">
                  {t("display.quantity")}
                </div>
                <div className="text-white font-bold text-lg">
                  {formatNumber(order.quantity_kg, locale)}{" "}
                  {t("common.kg", "كجم")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LatestRollsSlide({ rolls }: { rolls: RollData[] }) {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const isAr = i18n.language === "ar";

  const getStatusInfo = (status: string) => {
    const key = `display.status.${status}`;
    const label = t(key);
    const colorMap: Record<string, string> = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      for_printing: "bg-cyan-500",
      for_cutting: "bg-orange-500",
      done: "bg-green-600",
    };
    return {
      label: label !== key ? label : status,
      color: colorMap[status] || "bg-gray-500",
    };
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        {rolls.map((roll, i) => {
          const status = getStatusInfo(roll.status);
          return (
            <div
              key={roll.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
              style={{
                animation: `fadeSlideUp 0.5s ease-out ${i * 0.1}s both`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-white">
                  {roll.roll_number}
                </span>
                <span
                  className={`${status.color} text-white text-xs px-3 py-1 rounded-full`}
                >
                  {status.label}
                </span>
              </div>
              <div className="space-y-2 text-white/80 text-base">
                <div className="flex justify-between">
                  <span>{t("display.weight")}:</span>
                  <span className="font-bold text-white">
                    {formatNumber(roll.weight_kg, locale)}{" "}
                    {t("common.kg", "كجم")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("display.machine")}:</span>
                  <span>
                    {isAr
                      ? roll.machine_name_ar || roll.machine_name
                      : roll.machine_name || roll.machine_name_ar || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("display.time")}:</span>
                  <span>{formatTime(roll.created_at, locale)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ANNOUNCEMENT_LANG_META: Record<
  string,
  { label: string; rtl: boolean }
> = {
  ar: { label: "العربية", rtl: true },
  en: { label: "English", rtl: false },
  ur: { label: "اردو", rtl: true },
  hi: { label: "हिन्दी", rtl: false },
  fil: { label: "Filipino", rtl: false },
  ne: { label: "नेपाली", rtl: false },
};

function AnnouncementSlide({ content }: { content: any }) {
  const iconMap: Record<string, any> = {
    announcement: Megaphone,
    warning: AlertTriangle,
    info: BookOpen,
    notification: Bell,
  };
  const Icon = iconMap[content?.icon] || Megaphone;
  const colorMap: Record<string, string> = {
    blue: "from-blue-600 to-blue-900",
    red: "from-red-600 to-red-900",
    green: "from-green-600 to-green-900",
    yellow: "from-yellow-600 to-yellow-900",
    purple: "from-purple-600 to-purple-900",
  };
  const gradient = colorMap[content?.color] || "from-blue-600 to-blue-900";

  // Build the list of language versions: original Arabic first, then each translation.
  const versions = useMemo(() => {
    const list: {
      code: string;
      title: string;
      message: string;
      footer: string;
    }[] = [
      {
        code: "ar",
        title: content?.title || "",
        message: content?.message || "",
        footer: content?.footer || "",
      },
    ];
    if (content?.autoTranslate && content?.translations) {
      const order: string[] = Array.isArray(content?.translateLangs)
        ? content.translateLangs
        : Object.keys(content.translations);
      for (const code of order) {
        const tr = content.translations[code];
        if (!tr) continue;
        if (!tr.title && !tr.message && !tr.footer) continue;
        list.push({
          code,
          title: tr.title || "",
          message: tr.message || "",
          footer: tr.footer || "",
        });
      }
    }
    return list;
  }, [content]);

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [versions.length]);

  useEffect(() => {
    if (versions.length <= 1 || hovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % versions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [versions.length, hovered]);

  const current = versions[index] || versions[0];
  const meta = ANNOUNCEMENT_LANG_META[current.code] || {
    label: current.code,
    rtl: false,
  };

  const handleCopy = async () => {
    const text = [current.title, current.message, current.footer]
      .filter(Boolean)
      .join("\n\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be blocked; ignore silently.
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group h-full flex items-center justify-center p-12 bg-gradient-to-br ${gradient} rounded-3xl mx-6 relative select-text`}
    >
      <button
        onClick={handleCopy}
        title="نسخ النص"
        className="absolute bottom-6 left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-lg font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/25"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            تم النسخ
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            نسخ
          </>
        )}
      </button>
      {versions.length > 1 && (
        <>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {versions.map((v, i) => (
              <span
                key={v.code}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
          <div className="absolute top-6 right-8 px-4 py-1.5 rounded-full bg-white/15 text-white text-lg font-bold z-10">
            {meta.label}
          </div>
        </>
      )}
      <div
        key={`${current.code}-${index}`}
        className="text-center max-w-4xl"
        dir={meta.rtl ? "rtl" : "ltr"}
        style={{ animation: "fadeScaleIn 0.8s ease-out" }}
      >
        <Icon className="w-24 h-24 text-white/80 mx-auto mb-8" />
        <h2 className="text-5xl font-black text-white mb-6 leading-tight">
          {current.title}
        </h2>
        <p className="text-3xl text-white/90 leading-relaxed whitespace-pre-wrap">
          {current.message}
        </p>
        {current.footer && (
          <div className="mt-8 text-xl text-white/60 border-t border-white/20 pt-6">
            {current.footer}
          </div>
        )}
      </div>
    </div>
  );
}

function InstructionsSlide({ content }: { content: any }) {
  const instructions = content?.items || [];
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-5">
        {instructions.map((item: string, i: number) => (
          <div
            key={i}
            className="flex items-start gap-5 bg-white/10 rounded-2xl p-6 border border-white/10"
            style={{
              animation: `fadeSlideRight 0.5s ease-out ${i * 0.12}s both`,
            }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-black text-white">
              {i + 1}
            </div>
            <p className="text-2xl text-white/90 leading-relaxed pt-2">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTableSlide({ content }: { content: any }) {
  const columns: string[] = content?.columns || [];
  const rows: string[][] = content?.rows || [];
  const headerColor = content?.headerColor || "blue";

  const headerGradients: Record<string, string> = {
    blue: "from-blue-600 to-blue-800",
    red: "from-red-600 to-red-800",
    green: "from-green-600 to-green-800",
    yellow: "from-yellow-600 to-yellow-800",
    purple: "from-purple-600 to-purple-800",
  };
  const grad = headerGradients[headerColor] || headerGradients.blue;

  return (
    <div className="p-8">
      {content?.tableName && (
        <h3
          className="text-3xl font-black text-white text-center mb-6"
          style={{ animation: "fadeScaleIn 0.5s ease-out" }}
        >
          {content.tableName}
        </h3>
      )}
      <div
        className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        style={{ animation: "fadeSlideUp 0.6s ease-out" }}
      >
        <table className="w-full">
          <thead>
            <tr className={`bg-gradient-to-r ${grad}`}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-5 text-white text-xl font-bold text-right border-l border-white/20 first:border-l-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`${ri % 2 === 0 ? "bg-white/5" : "bg-white/10"} border-t border-white/10`}
                style={{
                  animation: `fadeSlideRight 0.4s ease-out ${ri * 0.08}s both`,
                }}
              >
                {columns.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-6 py-4 text-white/90 text-lg border-l border-white/10 first:border-l-0"
                  >
                    {row[ci] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImageSlide({ content }: { content: any }) {
  const fit = content?.fit || "contain";
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div
        className="flex-1 w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ animation: "fadeScaleIn 0.6s ease-out" }}
      >
        <img
          src={content?.url}
          alt={content?.caption || ""}
          className="max-h-full max-w-full rounded-2xl shadow-2xl"
          style={{ objectFit: fit }}
        />
      </div>
      {content?.caption && (
        <div className="mt-4 text-2xl text-white/80 text-center font-medium">
          {content.caption}
        </div>
      )}
    </div>
  );
}

function AttendanceSlide({ data }: { data: AttendanceData | undefined }) {
  const { t } = useTranslation();
  const locale = useLocale();

  if (!data || data.records.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white/50">
          <Users className="w-20 h-20 mx-auto mb-4 opacity-40" />
          <p className="text-2xl">{t("display.attendance_slide.title")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 flex items-center gap-4 shadow-xl"
          style={{ animation: "fadeSlideUp 0.5s ease-out" }}
        >
          <UserCheck className="w-12 h-12 text-white/80" />
          <div>
            <div className="text-5xl font-black text-white">
              {data.totalPresent}
            </div>
            <div className="text-lg text-white/80">
              {t("display.attendance_slide.totalPresent")}
            </div>
          </div>
        </div>
        <div
          className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 flex items-center gap-4 shadow-xl"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.1s both" }}
        >
          <UserX className="w-12 h-12 text-white/80" />
          <div>
            <div className="text-5xl font-black text-white">
              {data.totalAbsent}
            </div>
            <div className="text-lg text-white/80">
              {t("display.attendance_slide.totalAbsent")}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl max-h-[55vh] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0">
            <tr className="bg-gradient-to-r from-indigo-600 to-indigo-800">
              <th className="px-5 py-4 text-white text-lg font-bold text-right">
                {t("display.attendance_slide.employee")}
              </th>
              <th className="px-5 py-4 text-white text-lg font-bold text-center">
                {t("display.attendance_slide.status")}
              </th>
              <th className="px-5 py-4 text-white text-lg font-bold text-center">
                {t("display.attendance_slide.checkIn")}
              </th>
              <th className="px-5 py-4 text-white text-lg font-bold text-center">
                {t("display.attendance_slide.checkOut")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.records.slice(0, 15).map((record: any, i: number) => {
              const isPresent =
                record.status === "حاضر" || record.status === "present";
              return (
                <tr
                  key={record.id}
                  className={`${i % 2 === 0 ? "bg-white/5" : "bg-white/10"} border-t border-white/10`}
                  style={{
                    animation: `fadeSlideRight 0.3s ease-out ${i * 0.05}s both`,
                  }}
                >
                  <td className="px-5 py-3 text-white text-base font-medium">
                    {record.full_name || record.username}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${isPresent ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-white/80">
                    {record.check_in_time ? (
                      <span className="flex items-center justify-center gap-1">
                        <LogIn className="w-4 h-4 text-green-400" />
                        {formatTime(record.check_in_time, locale)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 text-center text-white/80">
                    {record.check_out_time ? (
                      <span className="flex items-center justify-center gap-1">
                        <LogOut className="w-4 h-4 text-red-400" />
                        {formatTime(record.check_out_time, locale)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopProducersSlide({
  data,
  content,
}: {
  data: TopProducersData | undefined;
  content: any;
}) {
  const { t } = useTranslation();
  const locale = useLocale();

  const sectionLabels: Record<string, string> = {
    film: t("display.top_producers_slide.film"),
    printing: t("display.top_producers_slide.printing"),
    cutting: t("display.top_producers_slide.cutting"),
  };

  const periodLabels: Record<string, string> = {
    today: t("display.top_producers_slide.today"),
    week: t("display.top_producers_slide.week"),
    month: t("display.top_producers_slide.month"),
    all: t("display.top_producers_slide.allTime"),
  };

  const sectionColors: Record<string, string> = {
    film: "from-blue-600 to-blue-800",
    printing: "from-cyan-600 to-cyan-800",
    cutting: "from-orange-600 to-orange-800",
  };

  const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  if (!data || Object.keys(data.sections || {}).length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white/50">
          <Trophy className="w-20 h-20 mx-auto mb-4 opacity-40" />
          <p className="text-2xl">{t("display.top_producers_slide.title")}</p>
        </div>
      </div>
    );
  }

  const sections = Object.entries(data.sections);
  const period = content?.period || data.period || "today";

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <span className="bg-white/10 px-4 py-2 rounded-full text-white/80 text-lg border border-white/20">
          {periodLabels[period] || period}
        </span>
      </div>
      <div
        className={`grid gap-6 ${sections.length === 1 ? "grid-cols-1 max-w-3xl mx-auto" : sections.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
      >
        {sections.map(([sectionKey, producers], si) => (
          <div
            key={sectionKey}
            className="rounded-2xl overflow-hidden border border-white/20 shadow-xl"
            style={{
              animation: `fadeSlideUp 0.5s ease-out ${si * 0.15}s both`,
            }}
          >
            <div
              className={`bg-gradient-to-r ${sectionColors[sectionKey] || "from-gray-600 to-gray-800"} px-5 py-4`}
            >
              <h3 className="text-xl font-bold text-white text-center">
                {sectionLabels[sectionKey] || sectionKey}
              </h3>
            </div>
            <div className="bg-white/5">
              {(producers as any[]).length === 0 ? (
                <div className="p-6 text-center text-white/40 text-base">—</div>
              ) : (
                (producers as any[]).slice(0, 5).map((p: any, pi: number) => (
                  <div
                    key={pi}
                    className={`flex items-center gap-4 px-5 py-3 ${pi % 2 === 0 ? "bg-white/5" : ""} border-t border-white/10 first:border-t-0`}
                  >
                    <div className="w-8 flex-shrink-0 text-center">
                      {pi < 3 ? (
                        <Medal
                          className={`w-6 h-6 mx-auto ${medalColors[pi]}`}
                        />
                      ) : (
                        <span className="text-white/50 font-bold">
                          {pi + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-base truncate">
                        {p.full_name || p.username || "—"}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-lg">
                        {formatNumber(p.total_weight_kg, locale)}
                      </div>
                      <div className="text-white/50 text-xs">
                        {t("common.kg", "كجم")} • {p.roll_count}{" "}
                        {t("display.top_producers_slide.rollCount")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DisplayScreen() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const isRtl = i18n.language === "ar";
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionClass, setTransitionClass] = useState("opacity-100");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fastPolling = useSmartPolling(60_000);
  const normalPolling = useSmartPolling(90_000);

  const { data: slides = [] } = useQuery<SlideData[]>({
    queryKey: ["/api/display/slides/active"],
    refetchInterval: fastPolling,
  });

  const { data: recentProduction = [] } = useQuery<ProductionOrder[]>({
    queryKey: ["/api/display/live/recent-production"],
    refetchInterval: normalPolling,
  });

  const { data: latestRolls = [] } = useQuery<RollData[]>({
    queryKey: ["/api/display/live/latest-rolls"],
    refetchInterval: normalPolling,
  });

  const { data: productionStats } = useQuery<ProductionStats>({
    queryKey: ["/api/display/live/production-stats"],
    refetchInterval: normalPolling,
  });

  const currentSlide = slides[currentSlideIndex];

  const ordersBoardContent =
    currentSlide?.slide_type === "orders_board" ? currentSlide.content : null;
  const statsContent = ["section_stats", "machine_stats", "user_stats"].includes(
    currentSlide?.slide_type || "",
  )
    ? currentSlide.content
    : null;
  const livePeriod = statsContent?.period || "today";
  const liveStage = statsContent?.stage || "all";
  const liveLimit = statsContent?.limit || 8;

  const { data: ordersBoardData } = useQuery<OrdersBoardData>({
    queryKey: [
      "/api/display/live/orders-board",
      ordersBoardContent?.status || "active",
      ordersBoardContent?.stage || "all",
      ordersBoardContent?.limit || 8,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: ordersBoardContent?.status || "active",
        stage: ordersBoardContent?.stage || "all",
        limit: String(ordersBoardContent?.limit || 8),
      });
      const res = await fetch(`/api/display/live/orders-board?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch display orders board");
      return res.json();
    },
    refetchInterval: fastPolling,
    enabled: currentSlide?.slide_type === "orders_board",
  });

  const { data: sectionStatsData } = useQuery<SectionStatsData>({
    queryKey: ["/api/display/live/section-stats", livePeriod],
    queryFn: async () => {
      const res = await fetch(
        `/api/display/live/section-stats?period=${livePeriod}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch section stats");
      return res.json();
    },
    refetchInterval: fastPolling,
    enabled: currentSlide?.slide_type === "section_stats",
  });

  const { data: machineStatsData } = useQuery<MachineStatsData>({
    queryKey: ["/api/display/live/machine-stats", livePeriod, liveStage, liveLimit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: livePeriod,
        stage: liveStage,
        limit: String(liveLimit),
      });
      const res = await fetch(`/api/display/live/machine-stats?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch machine stats");
      return res.json();
    },
    refetchInterval: fastPolling,
    enabled: currentSlide?.slide_type === "machine_stats",
  });

  const { data: userStatsData } = useQuery<UserStatsData>({
    queryKey: ["/api/display/live/user-stats", livePeriod, liveStage, liveLimit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: livePeriod,
        stage: liveStage,
        limit: String(liveLimit),
      });
      const res = await fetch(`/api/display/live/user-stats?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return res.json();
    },
    refetchInterval: fastPolling,
    enabled: currentSlide?.slide_type === "user_stats",
  });

  const topProducersContent =
    currentSlide?.slide_type === "top_producers" ? currentSlide.content : null;
  const topProducersPeriod = topProducersContent?.period || "today";
  const topProducersStage = topProducersContent?.stage || "all";

  const { data: attendanceData } = useQuery<AttendanceData>({
    queryKey: ["/api/display/live/attendance"],
    refetchInterval: fastPolling,
    enabled: slides.some((s) => s.slide_type === "attendance"),
  });

  const { data: topProducersData } = useQuery<TopProducersData>({
    queryKey: [
      "/api/display/live/top-producers",
      topProducersPeriod,
      topProducersStage,
    ],
    queryFn: async () => {
      const res = await fetch(
        `/api/display/live/top-producers?period=${topProducersPeriod}&stage=${topProducersStage}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch top producers");
      return res.json();
    },
    refetchInterval: fastPolling,
    enabled: slides.some((s) => s.slide_type === "top_producers"),
  });

  const goToSlide = useCallback((index: number) => {
    setTransitionClass("opacity-0 scale-95");
    setTimeout(() => {
      setCurrentSlideIndex(index);
      setTransitionClass("opacity-100 scale-100");
    }, 400);
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    goToSlide((currentSlideIndex + 1) % slides.length);
  }, [currentSlideIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    goToSlide((currentSlideIndex - 1 + slides.length) % slides.length);
  }, [currentSlideIndex, slides.length, goToSlide]);

  // Effective slide duration in ms. Announcement/notification slides with
  // translations are extended so every language version (5s each) is shown
  // before the slideshow advances to the next slide.
  const effectiveDurationMs = useMemo(() => {
    const cs = slides[currentSlideIndex];
    let duration = (cs?.duration_seconds || 10) * 1000;
    if (
      (cs?.slide_type === "announcement" ||
        cs?.slide_type === "notification") &&
      cs?.content?.autoTranslate &&
      cs?.content?.translations
    ) {
      const versionCount =
        1 +
        Object.values(cs.content.translations).filter(
          (tr: any) => tr && (tr.title || tr.message || tr.footer),
        ).length;
      if (versionCount > 1) {
        duration = Math.max(duration, versionCount * 5000);
      }
    }
    return duration;
  }, [slides, currentSlideIndex]);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    timerRef.current = setTimeout(nextSlide, effectiveDurationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlideIndex, isPaused, slides, nextSlide, effectiveDurationMs]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        isRtl ? prevSlide() : nextSlide();
      } else if (e.key === "ArrowLeft") {
        isRtl ? nextSlide() : prevSlide();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide, toggleFullscreen, isRtl]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const renderSlideContent = () => {
    if (!currentSlide) return null;
    switch (currentSlide.slide_type) {
      case "production_stats":
        return <ProductionStatsSlide stats={productionStats} />;
      case "orders_board":
        return <OrdersBoardSlide data={ordersBoardData} />;
      case "section_stats":
        return <SectionStatsSlide data={sectionStatsData} />;
      case "machine_stats":
        return (
          <RankingStatsSlide
            title="أعلى الماكينات إنتاجًا"
            rows={machineStatsData?.machines || []}
            rowLabel="machine"
          />
        );
      case "user_stats":
        return (
          <RankingStatsSlide
            title="أعلى العاملين إنتاجًا"
            rows={userStatsData?.users || []}
            rowLabel="user"
          />
        );
      case "recent_production":
        return <RecentProductionSlide orders={recentProduction} />;
      case "latest_rolls":
        return <LatestRollsSlide rolls={latestRolls} />;
      case "announcement":
      case "notification":
        return <AnnouncementSlide content={currentSlide.content} />;
      case "instructions":
        return <InstructionsSlide content={currentSlide.content} />;
      case "custom_table":
        return <CustomTableSlide content={currentSlide.content} />;
      case "image":
        return <ImageSlide content={currentSlide.content} />;
      case "attendance":
        return <AttendanceSlide data={attendanceData} />;
      case "top_producers":
        return (
          <TopProducersSlide
            data={topProducersData}
            content={currentSlide.content}
          />
        );
      default:
        return <AnnouncementSlide content={currentSlide.content} />;
    }
  };

  const slideTypeIcons: Record<string, any> = {
    production_stats: BarChart3,
    orders_board: ClipboardList,
    section_stats: Sparkles,
    machine_stats: Factory,
    user_stats: Users,
    recent_production: Package,
    latest_rolls: Factory,
    announcement: Megaphone,
    instructions: BookOpen,
    notification: Bell,
    custom_table: Table2,
    image: ImageIcon,
    attendance: Users,
    top_producers: Trophy,
  };
  const SlideIcon = slideTypeIcons[currentSlide?.slide_type || ""] || Factory;

  if (slides.length === 0) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-center text-white/60">
          <Factory className="w-24 h-24 mx-auto mb-6 opacity-40" />
          <h2 className="text-3xl font-bold mb-3">
            {t("display.noDisplaySlides")}
          </h2>
          <p className="text-xl">{t("display.addFromControl")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col overflow-hidden select-none"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between px-8 py-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Factory className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {t("display.title")}
            </h1>
            <div className="text-sm text-white/50">
              {t("display.factorySystem")}
            </div>
          </div>
        </div>

        <CurrentDateTime />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="px-8 pt-4 pb-2 flex items-center gap-3">
          <SlideIcon className="w-7 h-7 text-white/70" />
          <h2 className="text-3xl font-bold text-white">
            {currentSlide?.title}
          </h2>
          {isPaused && (
            <span className="bg-yellow-500/30 text-yellow-300 text-sm px-3 py-1 rounded-full border border-yellow-500/30">
              {t("display.paused")}
            </span>
          )}
        </div>

        <div
          className={`flex-1 transition-all duration-400 ease-out select-text ${transitionClass}`}
        >
          {renderSlideContent()}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white/60 hover:bg-black/60 hover:text-white flex items-center justify-center transition-all opacity-0 hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white/60 hover:bg-black/60 hover:text-white flex items-center justify-center transition-all opacity-0 hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="px-8 py-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center gap-3 mb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlideIndex
                  ? "bg-blue-500 w-10"
                  : "bg-white/30 w-2.5 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        {!isPaused && (
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{
                animation: `progressBar ${effectiveDurationMs / 1000}s linear`,
                animationIterationCount: 1,
              }}
              key={`${currentSlideIndex}-${Date.now()}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
