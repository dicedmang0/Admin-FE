"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courts", label: "Courts" },
  { href: "/bookings", label: "Bookings" },
  { href: "/payments", label: "Payments" },
  { href: "/admin-setup", label: "Admin Setup" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [filteredMenu, setFilteredMenu] = useState([]);

  useEffect(() => {
    // Ambil role dari localStorage
    const storedRole = localStorage.getItem("admin_role");
    setRole(storedRole);

    // 🔒 Filter menu berdasarkan role
    if (storedRole === "STAFF") {
      setFilteredMenu(
        allMenuItems.filter((item) =>
          ["/dashboard", "/courts", "/bookings"].includes(item.href)
        )
      );
    } else {
      // SUPERADMIN dapat semua
      setFilteredMenu(allMenuItems);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-black">
      {/* Topbar */}
      <header className="bg-white border-b shadow-sm px-6 h-14 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-black">Laguna Padel</h1>
          <span className="text-sm text-black">Management Dashboard</span>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg border-r">
          <nav className="mt-6 space-y-1">
            {filteredMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md ${
                  pathname.startsWith(item.href)
                    ? "bg-sky-100 text-sky-700 font-medium"
                    : "text-black hover:bg-slate-50"
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
