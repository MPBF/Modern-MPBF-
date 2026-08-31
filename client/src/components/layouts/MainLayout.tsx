/**
 * 🏢 Modern Responsive Main Layout
 * Mobile-First Design System with RTL Support
 */

import React, { useState } from "react";
import { Menu, X, Bell, Settings, LogOut } from "lucide-react";
import {
  ResponsiveHeader,
  ResponsiveSidebar,
  ResponsiveContainer,
  ResponsiveFlex,
} from "@/components/ui/responsive-layout";

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  navigation?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  user,
  navigation = [],
  onLogout,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div
      className="
        min-h-screen
        bg-neutral-50 dark:bg-neutral-950
        text-neutral-900 dark:text-white
        dir-rtl
      "
    >
      {/* ==================== Header ==================== */}
      <ResponsiveHeader>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo/Brand */}
          <div className="flex-1 md:flex-none pl-4 md:pl-0">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600">
              MPBF
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-600 rounded-full" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-14 w-80 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-lg">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">الإخطارات</h3>
                    <div className="space-y-2">
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                        <p className="text-sm font-medium">طلب إنتاج جديد</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          منذ 5 دقائق
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 md:pl-4 border-l border-neutral-200 dark:border-neutral-800">
              {user && (
                <>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {user.role || "المستخدم"}
                    </p>
                  </div>
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                </>
              )}

              <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-danger-100 dark:hover:bg-danger-900 text-danger-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </ResponsiveHeader>

      {/* ==================== Mobile Overlay ==================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20 top-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== Main Content ==================== */}
      <div className="flex">
        {/* Sidebar */}
        <ResponsiveSidebar isOpen={sidebarOpen}>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3
                  px-4 py-3
                  rounded-lg
                  transition-colors duration-200
                  ${
                    item.active
                      ? "bg-primary-600 text-white"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
                <span className="text-sm sm:text-base font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </ResponsiveSidebar>

        {/* Content Area */}
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== Responsive Dashboard Layout ====================
export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      {title && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
}

// ==================== Responsive Modal ====================
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!isOpen) return null;

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative
          bg-white dark:bg-neutral-900
          rounded-lg
          shadow-xl
          max-h-[90vh]
          overflow-y-auto
          w-full
          ${sizeMap[size]}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
