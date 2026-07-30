import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CheckCircle, Clock, Package, Truck, XCircle, AlertCircle, Phone, Building2 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  waiting:       { label: "في الانتظار",       color: "#92400e", bg: "#fef3c7", icon: Clock },
  for_production:{ label: "للإنتاج",           color: "#1e40af", bg: "#dbeafe", icon: Package },
  in_production: { label: "قيد الإنتاج",       color: "#065f46", bg: "#d1fae5", icon: Package },
  pending:       { label: "معلق",              color: "#6b21a8", bg: "#f3e8ff", icon: AlertCircle },
  in_progress:   { label: "جارٍ التنفيذ",      color: "#0369a1", bg: "#e0f2fe", icon: Package },
  paused:        { label: "موقوف",             color: "#c2410c", bg: "#ffedd5", icon: AlertCircle },
  on_hold:       { label: "معلق مؤقتاً",       color: "#c2410c", bg: "#ffedd5", icon: AlertCircle },
  completed:     { label: "مكتمل",             color: "#065f46", bg: "#d1fae5", icon: CheckCircle },
  delivered:     { label: "تم التسليم",        color: "#065f46", bg: "#d1fae5", icon: Truck },
  cancelled:     { label: "ملغي",              color: "#991b1b", bg: "#fee2e2", icon: XCircle },
};

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(d));
};

const addDays = (d?: string | null, days?: number | null) => {
  if (!d || !days) return null;
  const dt = new Date(d);
  dt.setDate(dt.getDate() + (days as number));
  return dt;
};

const fmt = (v?: number | string | null) => {
  const n = Number(v);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
};

function StatusBadge({ status }: { status?: string }) {
  const s = status ? (statusConfig[status] ?? { label: status, color: "#374151", bg: "#f3f4f6", icon: AlertCircle }) : { label: "—", color: "#374151", bg: "#f3f4f6", icon: AlertCircle };
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700, fontSize: 13 }}>
      <Icon size={14} />
      {s.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#0f172a", fontSize: 14, fontWeight: 700, textAlign: "left" }}>{value ?? "—"}</span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 14, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ icon: Icon, text, color = "#2563eb" }: { icon: any; text: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, borderBottom: "2px solid #f1f5f9", paddingBottom: 10 }}>
      <Icon size={18} color={color} />
      <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>{text}</span>
    </div>
  );
}

function handleTypeLabel(v?: string | null) {
  const map: Record<string, string> = {
    none: "بدون مقبض",
    loop: "مقبض حلقة",
    soft_loop: "حلقة ناعمة",
    die_cut: "مقبض مقصوص",
    patch: "مقبض ملصق",
  };
  return v ? (map[v] ?? v) : "—";
}

function rawMaterialLabel(v?: string | null) {
  const map: Record<string, string> = {
    HDPE: "HDPE",
    LDPE: "LDPE",
    LLDPE: "LLDPE",
    PP: "PP",
    recycled: "مواد معاد تدويرها",
  };
  return v ? (map[v] ?? v) : "—";
}

export default function ViewOrder() {
  const params = useParams<{ token: string }>();
  const orderId = params.token;

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["/api/public/orders", orderId],
    queryFn: () => fetch(`/api/public/orders/${orderId}`).then(r => r.json()),
    enabled: !!orderId,
    retry: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>جاري تحميل بيانات الطلب...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <XCircle size={56} color="#ef4444" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>الطلب غير موجود</h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>لم يتم العثور على الطلب المطلوب. تأكد من صحة الرابط أو الكود الممسوح.</p>
        </div>
      </div>
    );
  }

  const { order, customer, production_orders: pos } = data;
  const deliveryDate = addDays(order.created_at, order.delivery_days);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", padding: "0 0 32px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "24px 20px 28px", color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, letterSpacing: 1 }}>MPBF — مصنع الأكياس البلاستيكية الحديث</div>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, letterSpacing: 0.5 }}>
          طلب رقم #{order.order_number}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* Order Info */}
        <Card>
          <CardTitle icon={Package} text="تفاصيل الطلب" />
          <InfoRow label="رقم الطلب" value={`#${order.order_number}`} />
          <InfoRow label="تاريخ الإنشاء" value={formatDate(order.created_at)} />
          {deliveryDate && (
            <InfoRow label="تاريخ التسليم المتوقع" value={
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Truck size={14} color="#2563eb" />
                {formatDate(deliveryDate.toISOString())}
              </span>
            } />
          )}
          {order.priority && order.priority !== "normal" && (
            <InfoRow label="الأولوية" value={
              <span style={{ background: order.priority === "urgent" ? "#fee2e2" : "#fef3c7", color: order.priority === "urgent" ? "#991b1b" : "#92400e", padding: "2px 8px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                {order.priority === "urgent" ? "عاجل" : order.priority === "high" ? "مرتفعة" : order.priority}
              </span>
            } />
          )}
          {order.notes && <InfoRow label="ملاحظات" value={order.notes} />}
        </Card>

        {/* Customer Info */}
        {customer && (
          <Card>
            <CardTitle icon={Building2} text="بيانات العميل" color="#0891b2" />
            <InfoRow label="اسم العميل" value={customer.name_ar || customer.name} />
            {customer.commercial_name && <InfoRow label="الاسم التجاري" value={customer.commercial_name} />}
            {customer.phone && (
              <InfoRow label="رقم الهاتف" value={
                <a href={`tel:${customer.phone}`} style={{ color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                  <Phone size={13} />
                  {customer.phone}
                </a>
              } />
            )}
          </Card>
        )}

        {/* Production Orders */}
        {pos && pos.length > 0 && (
          <>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#475569", margin: "4px 4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <Package size={15} color="#7c3aed" />
              أوامر الإنتاج ({pos.length})
            </div>
            {pos.map((po: any, idx: number) => {
              const cp = po.customer_product;
              const progress = po.quantity_kg && Number(po.quantity_kg) > 0
                ? Math.min(100, Math.round((Number(po.produced_quantity_kg || 0) / Number(po.quantity_kg)) * 100))
                : 0;
              return (
                <Card key={po.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>
                      #{po.production_order_number || `PO-${idx + 1}`}
                    </span>
                    <StatusBadge status={po.status} />
                  </div>

                  {cp && (
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                      {cp.size_caption && (
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 8 }}>{cp.size_caption}</div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                        {cp.width && <div><span style={labelStyle}>العرض</span> <span style={valStyle}>{fmt(cp.width)} سم</span></div>}
                        {cp.cutting_length_cm && <div><span style={labelStyle}>الطول</span> <span style={valStyle}>{fmt(cp.cutting_length_cm)} سم</span></div>}
                        {cp.thickness && <div><span style={labelStyle}>السماكة</span> <span style={valStyle}>{fmt(cp.thickness)} ميكرون</span></div>}
                        {cp.raw_material && <div><span style={labelStyle}>الخامة</span> <span style={valStyle}>{rawMaterialLabel(cp.raw_material)}</span></div>}
                        {cp.handle_type && cp.handle_type !== "none" && <div><span style={labelStyle}>المقبض</span> <span style={valStyle}>{handleTypeLabel(cp.handle_type)}</span></div>}
                        {cp.print_colors && <div><span style={labelStyle}>الألوان</span> <span style={valStyle}>{cp.print_colors}</span></div>}
                        {cp.unit_weight_gram && <div><span style={labelStyle}>وزن الوحدة</span> <span style={valStyle}>{fmt(cp.unit_weight_gram)} جم</span></div>}
                      </div>
                    </div>
                  )}

                  <InfoRow label="الكمية المطلوبة" value={`${fmt(po.quantity_kg)} كجم`} />

                  {(() => {
                    const rs = po.roll_summary;
                    if (!rs || Number(rs.film_rolls) === 0) return null;
                    const isPrinted = cp?.is_printed;
                    const cutDenom = isPrinted ? rs.printed_rolls : rs.film_rolls;
                    const stages: {
                      key: string;
                      label: string;
                      color: string;
                      bg: string;
                      count: number;
                      denom: number | null;
                      weight: number;
                    }[] = [
                      { key: "film", label: "إنتاج الفيلم", color: "#2563eb", bg: "#eff6ff", count: rs.film_rolls, denom: null, weight: rs.film_weight_kg },
                      ...(isPrinted
                        ? [{ key: "print", label: "الطباعة", color: "#7c3aed", bg: "#f5f3ff", count: rs.printed_rolls, denom: rs.film_rolls, weight: rs.printed_weight_kg }]
                        : []),
                      { key: "cut", label: "التقطيع (جاهز للاستلام)", color: "#059669", bg: "#ecfdf5", count: rs.cut_rolls, denom: cutDenom, weight: rs.cut_weight_kg },
                    ];
                    return (
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>تقدّم الإنتاج (الرولات)</div>
                        {stages.map((s) => (
                          <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: s.bg, borderRadius: 10, padding: "8px 12px", borderRight: `3px solid ${s.color}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.label}</span>
                            </div>
                            <div style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>
                                {s.denom != null ? `${fmt(s.count)} من ${fmt(s.denom)} رول` : `${fmt(s.count)} رول`}
                              </span>
                              <span style={{ fontSize: 12, color: "#64748b", marginRight: 8 }}>{fmt(s.weight)} كجم</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Progress bar */}
                  {po.quantity_kg && Number(po.quantity_kg) > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
                        <span>التقدم</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: progress >= 100 ? "#22c55e" : "#2563eb", borderRadius: 8, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  )}

                  {po.notes && (
                    <div style={{ marginTop: 10, padding: "8px 10px", background: "#fefce8", borderRadius: 8, fontSize: 13, color: "#713f12", fontWeight: 600 }}>
                      {po.notes}
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, color: "#94a3b8", fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>MPBF — نظام إدارة مصنع الأكياس البلاستيكية</div>
          <div>هذه الصفحة تعرض بيانات الطلب للاطلاع العام</div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 1 };
const valStyle: React.CSSProperties = { fontSize: 13, color: "#1e293b", fontWeight: 700 };
