"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courts", label: "Courts" },
  { href: "/bookings", label: "Bookings" },
  { href: "/customers", label: "Customers" },
  { href: "/payments", label: "Payments" },
  { href: "/users", label: "Admin Setup" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Topbar (selalu full width di paling atas) */}
      <header className="bg-white border-b shadow-sm px-6 h-14 flex justify-between items-center w-full">
        {/* Left */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Laguna Padel</h1>
          <span className="text-slate-500 text-sm">Management Dashboard</span>
        </div>

        {/* Right */}
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1">
        {/* Sidebar (tidak lagi full height, tapi hanya di bawah topbar) */}
        <aside className="w-64 bg-white shadow-lg border-r">
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 ${
                  pathname.startsWith(item.href)
                    ? "bg-sky-100 text-sky-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
