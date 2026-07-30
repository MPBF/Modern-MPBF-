import { Sun, Moon, Palette, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme, type Theme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/use-auth";
import { useCompanyLogo } from "../../hooks/use-company-logo";
import { NotificationBell } from "../notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logoUrl } = useCompanyLogo();

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    {
      value: "light",
      label: t("dashboard.profile.lightMode", "الوضع الفاتح"),
      icon: Sun,
    },
    {
      value: "dark",
      label: t("dashboard.profile.darkMode", "الوضع المظلم"),
      icon: Moon,
    },
    {
      value: "blue",
      label: t("dashboard.profile.blueMode", "الأزرق الاحترافي"),
      icon: Palette,
    },
  ];
  const ActiveThemeIcon =
    themeOptions.find((o) => o.value === theme)?.icon ?? Sun;

  const initials = (
    user?.display_name_ar ||
    user?.display_name ||
    user?.username ||
    t("header.defaultInitial")
  ).charAt(0);

  return (
    <header
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: "#0f2341",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <img
              src={logoUrl}
              alt={t("header.factoryLogo")}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">
              MPBF
            </h1>
            <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>
              {t("common.appName")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,0.75)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.10)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "transparent")
                }
                title={t("dashboard.profile.theme", "المظهر")}
                data-testid="button-theme-menu"
              >
                <ActiveThemeIcon className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              {themeOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className="gap-2 cursor-pointer"
                    data-testid={`theme-option-${option.value}`}
                  >
                    <OptionIcon className="h-4 w-4" />
                    <span className="flex-1">{option.label}</span>
                    {theme === option.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language + Notifications — inherit color from context */}
          <div style={{ color: "rgba(255,255,255,0.75)" }}>
            <LanguageSwitcher variant="dropdown" size="sm" />
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)" }}>
            <NotificationBell />
          </div>

          {/* User info + avatar */}
          <div className="flex items-center gap-2 ms-1">
            <div
              className={`${isRTL ? "text-right" : "text-left"} hidden sm:block`}
            >
              <p className="text-sm font-medium text-white leading-tight">
                {user?.display_name_ar || user?.display_name || user?.username}
              </p>
              <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>
                {user?.role_name_ar ||
                  user?.role_name ||
                  t("header.defaultRole")}
              </p>
            </div>
            <button
              onClick={logout}
              className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm text-white transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #3984f6 0%, #2563eb 100%)",
                boxShadow: "0 2px 8px rgba(57,132,246,0.40)",
              }}
            >
              {initials}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
