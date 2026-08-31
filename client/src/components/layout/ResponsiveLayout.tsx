/**
 * 🎯 Responsive Modern Layout System
 * Mobile-First, RTL-Ready, Dark Mode Support
 */

import React, { ReactNode, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import "../styles/layout.css";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  title?: string;
  description?: string;
}

interface ResponsiveLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// ==========================================
// 📱 Mobile Header
// ==========================================
export function MobileHeader({
  onMenuClick,
  title,
}: {
  onMenuClick: () => void;
  title?: string;
}) {
  const [isDark, setIsDark] = useState(false);

  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="فتح القائمة">
          <Menu size={24} />
        </button>

        {title && <h1 className="mobile-header-title">{title}</h1>}

        <button
          className="theme-toggle"
          onClick={() => setIsDark(!isDark)}
          aria-label="تبديل المظهر"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}

// ==========================================
// 🧭 Responsive Sidebar Navigation
// ==========================================
export function ResponsiveSidebar({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`responsive-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">MPBF</h2>
          <button
            className="close-sidebar-btn"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">{children}</nav>
      </aside>
    </>
  );
}

// ==========================================
// 🎨 Main Responsive Layout
// ==========================================
export function ResponsiveLayout({
  children,
  sidebar,
  header,
  footer,
  className = "",
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`responsive-layout ${className}`}>
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        title="MPBF"
      />

      {/* Responsive Sidebar */}
      {sidebar && (
        <ResponsiveSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          {sidebar}
        </ResponsiveSidebar>
      )}

      {/* Main Content */}
      <main className="main-content">
        {header && <header className="page-header">{header}</header>}

        <div className="content-wrapper">{children}</div>

        {footer && <footer className="page-footer">{footer}</footer>}
      </main>
    </div>
  );
}

// ==========================================
// 📊 Dashboard Grid Layout
// ==========================================
export function DashboardGrid({
  children,
  columns = 1,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div className={`dashboard-grid dashboard-grid-${columns}`}>
      {children}
    </div>
  );
}

// ==========================================
// 🪟 Card Component with RTL Support
// ==========================================
export function Card({
  children,
  className = "",
  clickable = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`card ${clickable ? "card-clickable" : ""} ${className}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// ==========================================
// 🎯 Page Container
// ==========================================
export function PageContainer({
  children,
  title,
  description,
  action,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-container">
      {(title || description || action) && (
        <div className="page-header-section">
          <div className="page-header-content">
            {title && <h1 className="page-title">{title}</h1>}
            {description && (
              <p className="page-description">{description}</p>
            )}
          </div>
          {action && <div className="page-action">{action}</div>}
        </div>
      )}

      <div className="page-content">{children}</div>
    </div>
  );
}

// ==========================================
// 📋 Responsive Table Layout
// ==========================================
export function ResponsiveTable({
  children,
  scrollable = true,
}: {
  children: ReactNode;
  scrollable?: boolean;
}) {
  return (
    <div className={`responsive-table-wrapper ${scrollable ? "scrollable" : ""}`}>
      <table className="responsive-table">{children}</table>
    </div>
  );
}

// ==========================================
// 🔲 Flex Grid (Responsive Columns)
// ==========================================
export function FlexGrid({
  children,
  gap = "md",
  columns = "auto",
  className = "",
}: {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  columns?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex-grid flex-gap-${gap} ${className}`}
      style={{ "--grid-columns": columns } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// ==========================================
// 🎪 Hero Section
// ==========================================
export function HeroSection({
  title,
  description,
  action,
  background = "gradient",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  background?: "gradient" | "image" | "solid";
}) {
  return (
    <section className={`hero-section hero-${background}`}>
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {description && <p className="hero-description">{description}</p>}
        {action && <div className="hero-action">{action}</div>}
      </div>
    </section>
  );
}

// ==========================================
// 🎁 Feature Card Grid
// ==========================================
export function FeatureCardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div className={`feature-grid feature-grid-${columns}`}>
      {children}
    </div>
  );
}

// ==========================================
// 📄 Responsive Form Layout
// ==========================================
export function FormLayout({
  children,
  columns = 1,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={`form-layout form-layout-${columns}`}>
      {children}
    </div>
  );
}

export default ResponsiveLayout;
