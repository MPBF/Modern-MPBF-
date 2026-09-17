import { Suspense } from "react";
import { Route, Switch, Redirect, useLocation } from "wouter";

import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Header from "./components/layout/Header";
import MobileShell from "./components/layout/MobileShell";
import Sidebar from "./components/layout/Sidebar";
import InstallPrompt from "./components/pwa/InstallPrompt";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { lazyWithRetry } from "./lib/lazyWithRetry";
import Login from "./pages/misc/login";
import ForceChangePassword from "./pages/misc/force-change-password";

import { shouldShowChrome } from "./config/chromeRoutes";

function PersistentChrome() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) return null;
  if (user?.must_change_password) return null;
  if (!shouldShowChrome(location)) return null;

  return (
    <>
      <Header />
      <Sidebar />
      <MobileShell />
    </>
  );
}

const Orders = lazyWithRetry(() => import("./pages/orders/orders"));
const Customers = lazyWithRetry(() => import("./pages/customers/customers"));
const CustomerManagement = lazyWithRetry(
  () => import("./pages/customers/customer-management"),
);
const Definitions = lazyWithRetry(() => import("./pages/settings/definitions"));
const NotFound = lazyWithRetry(() => import("./pages/misc/not-found"));
const ProductionDashboard = lazyWithRetry(
  () => import("./pages/production/ProductionDashboard"),
);
const ViewOrder = lazyWithRetry(() => import("./pages/orders/view-order"));

function PageLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
          جاري تحميل الصفحة...
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();

  const mustChange = !!user?.must_change_password;
  const isPublicPath = location.startsWith("/view/order/") || location === "/login";

  if (
    !isLoading &&
    isAuthenticated &&
    mustChange &&
    location !== "/change-password" &&
    !isPublicPath
  ) {
    return <Redirect to="/change-password" />;
  }

  // Public paths must render immediately — never block on the auth check.
  // isLoading only gates protected pages so unauthenticated QR/public users
  // don't hit a spinner that looks like a login wall.
  if (isLoading && !isPublicPath) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
            جاري تحميل النظام...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Switch>
        <Route path="/login">
          {isAuthenticated ? <Redirect to="/" /> : <Login />}
        </Route>

        <Route path="/change-password">
          {isAuthenticated ? <ForceChangePassword /> : <Redirect to="/login" />}
        </Route>

        {/* Public order view — no login required (QR code scanning) */}
        <Route path="/view/order/:token">
          <ViewOrder />
        </Route>

        <Route path="/">
          <Redirect to="/orders" />
        </Route>

        <Route path="/orders">
          <ProtectedRoute path="/orders">
            <Orders />
          </ProtectedRoute>
        </Route>

        <Route path="/customers">
          <ProtectedRoute path="/customers">
            <Customers />
          </ProtectedRoute>
        </Route>

        <Route path="/customer-management">
          <ProtectedRoute path="/customer-management">
            <CustomerManagement />
          </ProtectedRoute>
        </Route>

        {/* Production Dashboard - Unified operators dashboard */}
        <Route path="/production-dashboard">
          <ProtectedRoute path="/production-dashboard">
            <ProductionDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/definitions">
          <ProtectedRoute path="/definitions">
            <Definitions />
          </ProtectedRoute>
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary fallback="page" showReload>
      <AuthProvider>
        <PersistentChrome />
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
