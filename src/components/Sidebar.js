"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ALL = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["STAFF","SUPERADMIN"] },
  { href: "/courts",    label: "Court Management", icon: "🧰", roles: ["STAFF","SUPERADMIN"] },
  { href: "/bookings",  label: "Bookings", icon: "📒", roles: ["STAFF","SUPERADMIN"] },
  { href: "/customers", label: "Customers", icon: "👥", roles: ["SUPERADMIN"] },
  { href: "/payments",  label: "Payments", icon: "💳", roles: ["SUPERADMIN"] },
  { href: "/admin-setup", label: "Admin Setup", icon: "⚙️", roles: ["SUPERADMIN"] },
];

export default function Sidebar({ role = "STAFF" }) {
  const pathname = usePathname();
  const items = ALL.filter(i => i.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r min-h-screen sticky top-0">
      <div className="px-4 py-4 border-b">
        <p className="font-semibold">Laguna Padel</p>
        <p className="text-xs text-slate-500">Management Dashboard</p>
      </div>

      <nav className="p-2 space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              ${active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <span>{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {role === "SUPERADMIN" && (
        <div className="absolute bottom-4 left-0 w-full px-2">
          <Link
            href="/admin-setup"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-slate-50"
          >
            <span>⚙️</span> <span>Admin Setup</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
