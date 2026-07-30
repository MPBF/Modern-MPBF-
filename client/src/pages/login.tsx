import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Eye, EyeOff, Factory, Layers, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { useCompanyLogo } from "../hooks/use-company-logo";
import { useToast } from "../hooks/use-toast";

const stats = [
  { icon: Package, label: "أوامر الإنتاج", value: "١٢٤" },
  { icon: Layers, label: "خطوط التشغيل", value: "٨" },
  { icon: BarChart3, label: "كفاءة المصنع", value: "٩٤٪" },
];

export default function Login() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const { logoUrl } = useCompanyLogo();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    username: z
      .string()
      .min(1, t("auth.usernameRequired"))
      .min(3, t("auth.usernameMinLength")),
    password: z
      .string()
      .min(1, t("auth.passwordRequired"))
      .min(6, t("auth.passwordMinLength")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.username, values.password);
      toast({
        title: t("auth.welcomeBack"),
        description: t("auth.loginSuccess"),
      });
    } catch (error) {
      let errorMessage = t("auth.unexpectedError");
      if (error instanceof Error) errorMessage = error.message;
      if (
        errorMessage.includes("Network error") ||
        errorMessage.includes("Failed to fetch")
      ) {
        errorMessage = t("auth.networkError");
      }
      toast({
        title: t("auth.loginError"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex"
      style={{ fontFamily: "'Cairo', system-ui, sans-serif" }}
    >
      {/* ── Brand panel (right in RTL) ── */}
      <div
        className="hidden md:flex w-[52%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "#0f2341" }}
      >
        {/* Geometric accents */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #3984f6 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-5 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />

        {/* Logo + wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border"
            style={{
              background: "rgba(255,255,255,0.10)",
              borderColor: "rgba(255,255,255,0.20)",
              backdropFilter: "blur(8px)",
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={t("auth.factoryLogoAlt")}
                className="w-9 h-9 object-contain"
              />
            ) : (
              <Factory className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">MPBF</div>
            <div className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>
              مصنع الأكياس البلاستيكية
            </div>
          </div>
        </div>

        {/* Hero copy + stat pills */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            {t("auth.systemTitle").split(" ").slice(0, 2).join(" ")}<br />
            <span style={{ color: "#3984f6" }}>
              {t("auth.systemTitle").split(" ").slice(2).join(" ") ||
                "المصنع المتكامل"}
            </span>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {t("auth.systemDescription")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(57,132,246,0.20)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#3984f6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {label}
                  </div>
                </div>
                <div className="text-white font-bold text-lg tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
          {t("auth.copyright")}
        </div>
      </div>

      {/* ── Form panel (left in RTL) ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 bg-gray-50">
        {/* Mobile: show logo when brand panel is hidden */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={t("auth.factoryLogoAlt")} className="w-7 h-7 object-contain" />
          ) : (
            <Factory className="w-6 h-6" style={{ color: "#3984f6" }} />
          )}
          <span className="font-bold text-gray-800">{t("auth.systemTitle")}</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("auth.login")}</h2>
            <p className="text-gray-500 text-sm">{t("auth.systemDescription")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("auth.username")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("auth.enterUsername")}
                        className="h-11 text-right rounded-lg border bg-white transition-all"
                        style={
                          field.value
                            ? {
                                borderColor: "#3984f6",
                                boxShadow: "0 0 0 3px rgba(57,132,246,0.10)",
                              }
                            : undefined
                        }
                        disabled={isLoading}
                        autoComplete="username"
                        data-testid="input-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("auth.password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.enterPassword")}
                          className="h-11 text-right rounded-lg border bg-white pr-4 pl-11 transition-all"
                          style={
                            field.value
                              ? {
                                  borderColor: "#3984f6",
                                  boxShadow: "0 0 0 3px rgba(57,132,246,0.10)",
                                }
                              : undefined
                          }
                          disabled={isLoading}
                          autoComplete="current-password"
                          data-testid="input-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98] border-0"
                style={{
                  background: isLoading
                    ? "#93b4fb"
                    : "linear-gradient(135deg, #3984f6 0%, #2563eb 100%)",
                  boxShadow: isLoading ? "none" : "0 4px 14px rgba(57,132,246,0.35)",
                }}
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? t("auth.loggingIn") : t("auth.login")}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              {t("auth.or")}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Replit SSO */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            onClick={() => {
              window.location.href = "/api/login-replit";
            }}
            data-testid="button-login-replit"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2v20h20V2H2zm18 18H4V4h16v16z" />
            </svg>
            {t("auth.loginWithReplit")}
          </Button>

          <p className="mt-8 text-center text-xs text-gray-400">
            {t("auth.copyright")}
          </p>
        </div>
      </div>
    </div>
  );
}
