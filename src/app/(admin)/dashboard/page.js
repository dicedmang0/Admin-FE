"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import { DateTime } from "luxon";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    DateTime.now().toFormat("yyyy-LL-dd")
  );

  async function loadStats(date) {
    try {
      setLoading(true);
      const data = await getDashboard(date);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats(selectedDate);
  }, [selectedDate]);

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    DateTime.now().plus({ days: i - 3 }) // range ±3 hari
  );

  if (loading) return <div className="text-slate-600">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-600">Gagal memuat data</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm">
          Today’s overview – {DateTime.fromISO(selectedDate).toLocaleString(DateTime.DATE_FULL)}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-slate-500">Total Courts</p>
          <p className="text-2xl font-bold text-slate-800">{stats.courts}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-800">{stats.bookings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="text-2xl font-bold text-slate-800">${stats.paid}</p>
        </div>
      </div>

      {/* Quick Date Navigation */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="font-semibold text-slate-700 mb-4">Quick Date Navigation</p>
        <div className="flex gap-2">
          {weekDays.map((d) => {
            const iso = d.toFormat("yyyy-LL-dd");
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  iso === selectedDate
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d.toFormat("ccc dd")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
