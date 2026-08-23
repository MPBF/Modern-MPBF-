// client/src/components/dashboard/Shortcuts.tsx
import { PlusCircle, UserPlus, Package } from "lucide-react";
import { Link } from "wouter";

export default function Shortcuts() {
  const items = [
    {
      id: "order",
      label: "إضافة طلب",
      href: "/orders?create=1",
      Icon: PlusCircle,
      bg: "bg-blue-600",
    },
    {
      id: "customer",
      label: "إضافة عميل",
      href: "/definitions?tab=customers&create=1",
      Icon: UserPlus,
      bg: "bg-green-600",
    },
    {
      id: "cust-product",
      label: "إضافة منتج عميل",
      href: "/definitions?tab=customerProducts&create=1",
      Icon: Package,
      bg: "bg-indigo-600",
    },
  ];

  return (
    <div className="mb-8 pb-2">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full">
        {items.map((it) => (
          <Link key={it.id} href={it.href} className="flex-1">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg text-white shadow-md hover:shadow-lg transition cursor-pointer
                         ${it.bg} hover:opacity-95 w-full`}
              title={it.label}
              aria-label={it.label}
              data-testid={`shortcut-${it.id}`}
            >
              <it.Icon className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold truncate">{it.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
