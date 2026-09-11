/**
 * 🎯 Responsive Layout Components - Modern Design System
 * Mobile-First approach with full RTL support
 */

import React from "react";

// ==================== Header/Navigation ====================
export function ResponsiveHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`
        sticky top-0 z-40
        w-full
        bg-white dark:bg-neutral-900
        border-b border-neutral-200 dark:border-neutral-800
        shadow-sm
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}

// ==================== Sidebar ====================
export function ResponsiveSidebar({
  children,
  isOpen = true,
  className = "",
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}) {
  return (
    <aside
      className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        fixed md:sticky
        top-0 right-0 md:right-auto
        z-30
        h-screen
        w-64 md:w-72
        bg-white dark:bg-neutral-900
        border-l md:border-l border-r md:border-r-0
        border-neutral-200 dark:border-neutral-800
        overflow-y-auto
        transition-transform duration-300
        ${className}
      `}
    >
      {children}
    </aside>
  );
}

// ==================== Main Content Area ====================
export function ResponsiveContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`
        flex-1
        w-full
        px-4 sm:px-6 lg:px-8
        py-4 sm:py-6 lg:py-8
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}

// ==================== Card Component ====================
export function ResponsiveCard({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        bg-white dark:bg-neutral-900
        rounded-lg
        border border-neutral-200 dark:border-neutral-800
        shadow-sm
        p-4 sm:p-6
        ${hover ? "hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ==================== Grid Layout ====================
export function ResponsiveGrid({
  children,
  cols = 1,
  className = "",
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colsMap = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={`
        grid
        grid-cols-1
        ${colsMap[cols]}
        gap-4 sm:gap-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ==================== Flexbox Layout ====================
export function ResponsiveFlex({
  children,
  direction = "row",
  justify = "between",
  align = "center",
  gap = 4,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "row" | "col";
  justify?: "start" | "center" | "between" | "around";
  align?: "start" | "center" | "end";
  gap?: 2 | 3 | 4 | 6 | 8;
  className?: string;
}) {
  const dirMap = { row: "flex-row", col: "flex-col" };
  const justMap = {
    start: "justify-start",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
  };
  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };
  const gapMap = { 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8" };

  return (
    <div
      className={`
        flex
        ${dirMap[direction]}
        ${justMap[justify]}
        ${alignMap[align]}
        ${gapMap[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ==================== Section Header ====================
export function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row
        justify-between items-start sm:items-center
        gap-4 sm:gap-6
        mb-6
        ${className}
      `}
    >
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ==================== Responsive Table ====================
export function ResponsiveTable({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        w-full
        overflow-x-auto
        rounded-lg
        border border-neutral-200 dark:border-neutral-800
        ${className}
      `}
    >
      <table className="w-full text-sm sm:text-base">
        {children}
      </table>
    </div>
  );
}

// ==================== Button Variants ====================
export function ResponsiveButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantMap = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
    secondary:
      "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600",
    danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800",
    ghost:
      "text-primary-600 dark:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  };

  const sizeMap = {
    sm: "px-3 py-1 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg",
  };

  return (
    <button
      className={`
        flex items-center justify-center gap-2
        font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantMap[variant]}
        ${sizeMap[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ==================== Input Field ====================
export function ResponsiveInput({
  label,
  error,
  icon,
  fullWidth = true,
  className = "",
  ...props
}: {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 right-0 dir-rtl:left-0 dir-rtl:right-auto pr-3 dir-rtl:pl-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full
            px-4 py-2 sm:py-2.5
            border border-neutral-300 dark:border-neutral-600
            rounded-lg
            bg-white dark:bg-neutral-800
            text-neutral-900 dark:text-white
            placeholder-neutral-400 dark:placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-colors duration-200
            ${icon ? "pr-10" : ""}
            ${error ? "border-danger-500 focus:ring-danger-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ==================== Badge ====================
export function ResponsiveBadge({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const variantMap = {
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
    success: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
    warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
    danger: "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5 py-0.5
        rounded-full
        text-xs sm:text-sm
        font-medium
        ${variantMap[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// ==================== Loading Skeleton ====================
export function ResponsiveSkeleton({
  count = 1,
  height = "h-8",
  className = "",
}: {
  count?: number;
  height?: string;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            ${height}
            bg-neutral-200 dark:bg-neutral-800
            rounded-lg
            animate-pulse
            ${i > 0 ? "mt-4" : ""}
            ${className}
          `}
        />
      ))}
    </>
  );
}
