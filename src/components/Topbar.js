"use client";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

export default function Topbar() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="w-full h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-slate-900">Laguna Padel</h1>
        <span className="text-slate-500 text-sm">Management Dashboard</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
