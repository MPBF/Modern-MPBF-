import { useState } from "react";
import { Eye, EyeOff, Factory, Package, Layers, BarChart3 } from "lucide-react";

export function SplitScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const stats = [
    { icon: Package, label: "أوامر الإنتاج", value: "١٢٤" },
    { icon: Layers, label: "خطوط التشغيل", value: "٨" },
    { icon: BarChart3, label: "كفاءة المصنع", value: "٩٤٪" },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen flex"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* ── Left panel: brand + stats ── */}
      <div className="hidden md:flex w-[52%] flex-col justify-between p-10 relative overflow-hidden bg-[#0f2341]">
        {/* Geometric accent */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3984f6 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />

        {/* Logo + wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">MPBF</div>
            <div className="text-white/50 text-xs leading-tight">مصنع الأكياس البلاستيكية</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            نظام إدارة<br />
            <span style={{ color: "#3984f6" }}>المصنع المتكامل</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            تحكم كامل في دورة الإنتاج من الأوامر إلى التسليم، مع تتبع لحظي لكل مرحلة.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-col gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(57,132,246,0.2)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#3984f6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/50 text-xs">{label}</div>
                </div>
                <div className="text-white font-bold text-lg tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/30 text-xs">
          جميع الحقوق محفوظة لـ AbuKhalid © ٢٠٢٦
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 bg-gray-50">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <Factory className="w-6 h-6 text-[#3984f6]" />
          <span className="font-bold text-gray-800">نظام MPBF</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full h-11 px-4 rounded-lg border text-right text-sm bg-white transition-all outline-none"
                style={{
                  borderColor: username ? "#3984f6" : "#e5e7eb",
                  boxShadow: username ? "0 0 0 3px rgba(57,132,246,0.1)" : "none",
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full h-11 px-4 pl-11 rounded-lg border text-right text-sm bg-white transition-all outline-none"
                  style={{
                    borderColor: password ? "#3984f6" : "#e5e7eb",
                    boxShadow: password ? "0 0 0 3px rgba(57,132,246,0.1)" : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #3984f6 0%, #2563eb 100%)",
                boxShadow: "0 4px 14px rgba(57,132,246,0.35)",
              }}
            >
              تسجيل الدخول
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">أو</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Replit SSO */}
          <button
            type="button"
            className="w-full h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2v20h20V2H2zm18 18H4V4h16v16z" />
            </svg>
            تسجيل الدخول باستخدام Replit
          </button>

          <p className="mt-8 text-center text-xs text-gray-400">
            جميع الحقوق محفوظة لـ AbuKhalid مطور ومنفذ
          </p>
        </div>
      </div>
    </div>
  );
}
