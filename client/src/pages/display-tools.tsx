import { Link } from "wouter";
import { Wand2, Box, Warehouse, Tv, MonitorCog, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../hooks/use-auth";
import { useLanguage } from "../contexts/LanguageContext";
import { canAccessRoute } from "../utils/roleUtils";

const tools = [
  {
    path: "/bag-configurator",
    icon: Wand2,
    name_ar: "معالج تصميم الأكياس",
    name_en: "Bag Configurator",
    desc_ar: "تصميم ومعاينة مواصفات الأكياس خطوة بخطوة",
    desc_en: "Design and preview bag specifications step by step",
  },
  {
    path: "/factory-simulation",
    icon: Box,
    name_ar: "محاكاة المصنع",
    name_en: "Factory Simulation",
    desc_ar: "عرض ثلاثي الأبعاد لخطوط الإنتاج والمكائن",
    desc_en: "3D view of production lines and machines",
  },
  {
    path: "/virtual-warehouse",
    icon: Warehouse,
    name_ar: "المستودع الافتراضي",
    name_en: "Virtual Warehouse",
    desc_ar: "جولة افتراضية في المستودع ومحتوياته",
    desc_en: "Virtual tour of the warehouse and its contents",
  },
  {
    path: "/display-screen",
    icon: Tv,
    name_ar: "شاشة العرض",
    name_en: "Display Screen",
    desc_ar: "عرض شاشة العرض العامة",
    desc_en: "View the public display screen",
  },
  {
    path: "/display-control",
    icon: MonitorCog,
    name_ar: "لوحة تحكم شاشة العرض",
    name_en: "Display Control",
    desc_ar: "إدارة محتوى وإعدادات شاشة العرض",
    desc_en: "Manage display screen content and settings",
  },
];

export default function DisplayTools() {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const isAr = language !== "en";
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const visibleTools = tools.filter((tool) => canAccessRoute(user, tool.path));

  return (
    <div className="p-4 md:p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          {isAr ? "أدوات العرض" : "Display Tools"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr
            ? "مجموعة الأدوات المرئية والتفاعلية في مكان واحد"
            : "Visual and interactive tools in one place"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              href={tool.path}
              data-testid={`link-tool-${tool.path.replace("/", "")}`}
            >
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Chevron className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {isAr ? tool.name_ar : tool.name_en}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isAr ? tool.desc_ar : tool.desc_en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {visibleTools.length === 0 && (
        <p className="text-muted-foreground">
          {isAr
            ? "لا تملك صلاحية الوصول إلى أي من أدوات العرض"
            : "You don't have access to any display tools"}
        </p>
      )}
    </div>
  );
}
