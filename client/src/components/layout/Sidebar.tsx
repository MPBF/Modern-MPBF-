import { Link, useLocation } from "wouter";

import {
  navigationItems,
  getLocalizedName,
} from "../../config/navigationConfig";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../hooks/use-auth";
import { canAccessRoute } from "../../utils/roleUtils";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();

  const accessibleModules = navigationItems.filter((module) =>
    canAccessRoute(user, module.path),
  );

  return (
    <aside
      className={`fixed top-16 bottom-0 w-64 hidden lg:block z-10 overflow-y-auto ${isRTL ? "right-0" : "left-0"}`}
      style={{
        background: "#0f2341",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: "0",
        borderStyle: "solid",
        ...(isRTL
          ? { borderLeftWidth: "1px" }
          : { borderRightWidth: "1px" }),
      }}
    >
      {/* Geometric accent blobs — matches login brand panel */}
      <div
        className="absolute bottom-12 pointer-events-none"
        style={{
          insetInlineStart: "-2rem",
          width: "12rem",
          height: "12rem",
          borderRadius: "9999px",
          opacity: 0.08,
          background: "radial-gradient(circle, #3984f6 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 pointer-events-none"
        style={{
          insetInlineEnd: "-3rem",
          width: "10rem",
          height: "10rem",
          borderRadius: "9999px",
          opacity: 0.05,
          background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
        }}
      />

      <nav className="relative z-10 p-3 mt-3">
        <div className="space-y-1">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            const isActive = location === module.path;

            return (
              <Link key={module.name} href={module.path}>
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all"
                  style={
                    isActive
                      ? {
                          background: "rgba(57,132,246,0.22)",
                          border: "1px solid rgba(57,132,246,0.40)",
                          color: "#ffffff",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "rgba(255,255,255,0.70)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLDivElement).style.color =
                        "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLDivElement).style.color =
                        "rgba(255,255,255,0.70)";
                    }
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive
                        ? "rgba(57,132,246,0.30)"
                        : "rgba(255,255,255,0.07)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm leading-tight">
                    {getLocalizedName(module, language)}
                  </span>
                  {isActive && (
                    <div
                      className="ms-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "#3984f6" }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
