import { ReactNode } from "react";
import { useLocation } from "wouter";

import { shouldShowChrome } from "../../config/chromeRoutes";
import { useLanguage } from "../../contexts/LanguageContext";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
}

export default function PageLayout({
  children,
  title,
  description,
  className = "",
  actions,
}: PageLayoutProps) {
  const { isRTL } = useLanguage();
  const [location] = useLocation();
  const hasChrome = shouldShowChrome(location);

  const sidebarSpacing = hasChrome ? (isRTL ? "lg:mr-64" : "lg:ml-64") : "";
  const mobileNavSpacing = hasChrome ? "pb-24 lg:pb-6" : "pb-6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className={`page-layout-main ${mobileNavSpacing} ${sidebarSpacing}`}>
        <div className={`page-layout-content ${className}`}>
          {(title || description || actions) && (
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
