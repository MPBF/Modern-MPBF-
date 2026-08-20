import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, Redirect, useLocation } from "wouter";

import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Header from "./components/layout/Header";
import MobileShell from "./components/layout/MobileShell";
import Sidebar from "./components/layout/Sidebar";
import InstallPrompt from "./components/pwa/InstallPrompt";
import GlobalNotificationListener from "./components/notifications/GlobalNotificationListener";
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

const BagConfigurator = lazyWithRetry(() => import("./pages/display/bag-configurator"));
const DisplayTools = lazyWithRetry(() => import("./pages/display/display-tools"));
const Dashboard = lazyWithRetry(() => import("./pages/dashboard/dashboard"));
const Orders = lazyWithRetry(() => import("./pages/orders/orders"));
const Production = lazyWithRetry(() => import("./pages/production/production"));
const ProductionOrdersManagement = lazyWithRetry(
  () => import("./pages/production/ProductionOrdersManagement"),
);
const ProductionQueues = lazyWithRetry(
  () => import("./pages/production/ProductionQueues"),
);
const Quality = lazyWithRetry(() => import("./pages/misc/quality"));
const Warehouse = lazyWithRetry(() => import("./pages/warehouse/warehouse"));
const Maintenance = lazyWithRetry(() => import("./pages/misc/maintenance"));
const HR = lazyWithRetry(() => import("./pages/hr/hr"));
const Messages = lazyWithRetry(() => import("./pages/misc/messages"));
const CustomerService = lazyWithRetry(() => import("./pages/customer-service"));
const Reports = lazyWithRetry(() => import("./pages/reports/reports"));
const Settings = lazyWithRetry(() => import("./pages/settings/settings"));
const Definitions = lazyWithRetry(() => import("./pages/settings/definitions"));
const UserDashboard = lazyWithRetry(() => import("./pages/dashboard/user-dashboard"));
const NotFound = lazyWithRetry(() => import("./pages/misc/not-found"));
const Notifications = lazyWithRetry(() => import("./pages/misc/notifications"));
const AlertsCenter = lazyWithRetry(() => import("./pages/misc/AlertsCenter"));
const SystemHealth = lazyWithRetry(() => import("./pages/misc/SystemHealth"));
const ProductionMonitoring = lazyWithRetry(
  () => import("./pages/production/production-monitoring"),
);
const MetaWhatsAppSetup = lazyWithRetry(
  () => import("./pages/whatsapp/meta-whatsapp-setup"),
);
const WhatsAppSetup = lazyWithRetry(() => import("./pages/whatsapp/whatsapp-setup"));
const WhatsAppTest = lazyWithRetry(() => import("./pages/whatsapp/whatsapp-test"));
const WhatsAppTroubleshoot = lazyWithRetry(
  () => import("./pages/whatsapp/whatsapp-troubleshoot"),
);
const WhatsAppProductionSetup = lazyWithRetry(
  () => import("./pages/whatsapp/whatsapp-production-setup"),
);
const WhatsAppFinalSetup = lazyWithRetry(
  () => import("./pages/whatsapp/whatsapp-final-setup"),
);
const TwilioContentTemplate = lazyWithRetry(
  () => import("./pages/whatsapp/twilio-content-template"),
);
const WhatsAppTemplateTest = lazyWithRetry(
  () => import("./pages/whatsapp/whatsapp-template-test"),
);
const WhatsAppWebhooks = lazyWithRetry(
  () => import("./pages/whatsapp/whatsapp-webhooks"),
);
const ToolsPage = lazyWithRetry(() => import("./pages/misc/tools_page"));
const AdminTools = lazyWithRetry(() => import("./pages/misc/admin-tools"));
const FilmOperatorDashboard = lazyWithRetry(
  () => import("./pages/production/FilmOperatorDashboard"),
);
const PrintingOperatorDashboard = lazyWithRetry(
  () => import("./pages/production/PrintingOperatorDashboard"),
);
const CuttingOperatorDashboard = lazyWithRetry(
  () => import("./pages/production/CuttingOperatorDashboard"),
);
const ProductionDashboard = lazyWithRetry(
  () => import("./pages/production/ProductionDashboard"),
);
const RollSearch = lazyWithRetry(() => import("./pages/production/RollSearch"));
const ProductionReports = lazyWithRetry(
  () => import("./pages/production/ProductionReports"),
);
const SystemMonitoring = lazyWithRetry(
  () => import("./pages/settings/system-monitoring"),
);
const FactorySimulation3D = lazyWithRetry(
  () => import("./pages/display/FactorySimulation3D"),
);
const VirtualWarehouse3D = lazyWithRetry(
  () => import("./pages/display/VirtualWarehouse3D"),
);
const CompanySetup = lazyWithRetry(() => import("./pages/settings/company-setup"));
const DisplayScreen = lazyWithRetry(() => import("./pages/display/DisplayScreen"));
const DisplayControlPanel = lazyWithRetry(
  () => import("./pages/display/DisplayControlPanel"),
);
const FactoryFloor = lazyWithRetry(() => import("./pages/production/FactoryFloor"));
const MaterialMixing = lazyWithRetry(() => import("./pages/production/material-mixing"));
const MyOrders = lazyWithRetry(() => import("./pages/orders/my-orders"));
const McpSettings = lazyWithRetry(() => import("./pages/settings/mcp-settings"));
const MpbfBagQuote = lazyWithRetry(() => import("./pages/orders/mpbf-bag-quote"));
const ViewOrder = lazyWithRetry(() => import("./pages/orders/view-order"));
const BatchLookup = lazyWithRetry(() => import("./pages/production/BatchLookup"));

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
  const { t } = useTranslation();
  const [location] = useLocation();

  const mustChange = !!user?.must_change_password;
  const isPublicPath =
    location.startsWith("/mpbf") ||
    location.startsWith("/view/order/") ||
    location === "/login";

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

        {/* Public mobile-friendly bag design quote — no login required */}
        <Route path="/mpbf">
          <MpbfBagQuote />
        </Route>

        {/* Public order view — no login required (QR code scanning) */}
        <Route path="/view/order/:token">
          <ViewOrder />
        </Route>

        <Route path="/bag-configurator">
          <ProtectedRoute path="/bag-configurator">
            <BagConfigurator />
          </ProtectedRoute>
        </Route>

        {/* Authenticated batch traceability lookup (opened by scanning a label QR) */}
        <Route path="/batch/:batchNumber">
          <ProtectedRoute path="/batch/:batchNumber">
            <BatchLookup />
          </ProtectedRoute>
        </Route>

        <Route path="/setup">
          <CompanySetup />
        </Route>
        <Route path="/tools">
          <ProtectedRoute path="/tools">
            <ToolsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin-tools">
          <ProtectedRoute path="/admin-tools">
            <AdminTools />
          </ProtectedRoute>
        </Route>

        <Route path="/">
          <ProtectedRoute path="/">
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/orders">
          <ProtectedRoute path="/orders">
            <Orders />
          </ProtectedRoute>
        </Route>

        <Route path="/my-orders">
          <ProtectedRoute path="/my-orders">
            <MyOrders />
          </ProtectedRoute>
        </Route>

        <Route path="/production">
          <Redirect to="/production-dashboard" />
        </Route>

        {/* Redirects from old routes to Orders page with tabs */}
        <Route path="/production-orders-management">
          <Redirect to="/orders?tab=production-orders" />
        </Route>

        <Route path="/production-queues">
          <ProtectedRoute path="/production-queues">
            <ProductionQueues />
          </ProtectedRoute>
        </Route>

        <Route path="/roll-search">
          <Redirect to="/orders?tab=roll-search" />
        </Route>

        {/* Production Dashboard - Unified operators dashboard */}
        <Route path="/production-dashboard">
          <ProtectedRoute path="/production-dashboard">
            <ProductionDashboard />
          </ProtectedRoute>
        </Route>

        {/* Redirect old operator routes to new unified dashboard */}
        <Route path="/film-operator">
          <Redirect to="/production-dashboard" />
        </Route>

        <Route path="/printing-operator">
          <Redirect to="/production-dashboard" />
        </Route>

        <Route path="/cutting-operator">
          <Redirect to="/production-dashboard" />
        </Route>

        <Route path="/quality">
          <ProtectedRoute path="/quality">
            <Quality />
          </ProtectedRoute>
        </Route>

        <Route path="/warehouse">
          <ProtectedRoute path="/warehouse">
            <Warehouse />
          </ProtectedRoute>
        </Route>

        <Route path="/maintenance">
          <ProtectedRoute path="/maintenance">
            <Maintenance />
          </ProtectedRoute>
        </Route>

        <Route path="/hr">
          <ProtectedRoute path="/hr">
            <HR />
          </ProtectedRoute>
        </Route>

        <Route path="/messages">
          <ProtectedRoute path="/messages">
            <Messages />
          </ProtectedRoute>
        </Route>

        <Route path="/customer-service">
          <ProtectedRoute path="/customer-service">
            <CustomerService />
          </ProtectedRoute>
        </Route>

        <Route path="/reports">
          <ProtectedRoute path="/reports">
            <Reports />
          </ProtectedRoute>
        </Route>

        <Route path="/production-reports">
          <Redirect to="/orders?tab=production-reports" />
        </Route>

        <Route path="/settings">
          <ProtectedRoute path="/settings">
            <Settings />
          </ProtectedRoute>
        </Route>

        <Route path="/definitions">
          <ProtectedRoute path="/definitions">
            <Definitions />
          </ProtectedRoute>
        </Route>

        <Route path="/user-dashboard">
          <ProtectedRoute path="/user-dashboard">
            <UserDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/notifications">
          <ProtectedRoute path="/notifications">
            <Notifications />
          </ProtectedRoute>
        </Route>

        <Route path="/alerts">
          <ProtectedRoute path="/alerts">
            <AlertsCenter />
          </ProtectedRoute>
        </Route>

        <Route path="/system-health">
          <ProtectedRoute path="/system-health">
            <SystemHealth />
          </ProtectedRoute>
        </Route>

        <Route path="/production-monitoring">
          <ProtectedRoute path="/production-monitoring">
            <ProductionMonitoring />
          </ProtectedRoute>
        </Route>

        <Route path="/meta-whatsapp-setup">
          <ProtectedRoute path="/meta-whatsapp-setup">
            <MetaWhatsAppSetup />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-setup">
          <ProtectedRoute path="/whatsapp-setup">
            <WhatsAppSetup />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-test">
          <ProtectedRoute path="/whatsapp-test">
            <WhatsAppTest />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-troubleshoot">
          <ProtectedRoute path="/whatsapp-troubleshoot">
            <WhatsAppTroubleshoot />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-production-setup">
          <ProtectedRoute path="/whatsapp-production-setup">
            <WhatsAppProductionSetup />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-final-setup">
          <ProtectedRoute path="/whatsapp-final-setup">
            <WhatsAppFinalSetup />
          </ProtectedRoute>
        </Route>

        <Route path="/twilio-content">
          <ProtectedRoute path="/twilio-content">
            <TwilioContentTemplate />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-template-test">
          <ProtectedRoute path="/whatsapp-template-test">
            <WhatsAppTemplateTest />
          </ProtectedRoute>
        </Route>

        <Route path="/whatsapp-webhooks">
          <ProtectedRoute path="/whatsapp-webhooks">
            <WhatsAppWebhooks />
          </ProtectedRoute>
        </Route>

        <Route path="/system-monitoring">
          <Redirect to="/settings?section=system-monitoring" />
        </Route>

        <Route path="/display-tools">
          <ProtectedRoute path="/display-tools">
            <DisplayTools />
          </ProtectedRoute>
        </Route>

        <Route path="/factory-simulation">
          <ProtectedRoute path="/factory-simulation">
            <FactorySimulation3D />
          </ProtectedRoute>
        </Route>

        <Route path="/virtual-warehouse">
          <ProtectedRoute path="/virtual-warehouse">
            <VirtualWarehouse3D />
          </ProtectedRoute>
        </Route>

        <Route path="/display-screen">
          <ProtectedRoute path="/display-screen">
            <DisplayScreen />
          </ProtectedRoute>
        </Route>

        <Route path="/display-control">
          <ProtectedRoute path="/display-control">
            <DisplayControlPanel />
          </ProtectedRoute>
        </Route>

        <Route path="/factory-floor">
          <ProtectedRoute path="/factory-floor">
            <FactoryFloor />
          </ProtectedRoute>
        </Route>

        <Route path="/material-mixing">
          <ProtectedRoute path="/material-mixing">
            <MaterialMixing />
          </ProtectedRoute>
        </Route>

        <Route path="/mcp-settings">
          <Redirect to="/settings?section=mcp" />
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
        <GlobalNotificationListener />
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
