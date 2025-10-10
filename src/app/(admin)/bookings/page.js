"use client";

import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // 🧩 Filter state
  const [filters, setFilters] = useState({
    search: "",
    court: "",
    date: "",
    status: "",
  });

  // 📦 Grouping helper
  function groupByOrderId(data) {
    return Object.values(
      data.reduce((acc, b) => {
        if (!acc[b.orderId]) {
          acc[b.orderId] = {
            orderId: b.orderId,
            name: b.name,
            whatsapp: b.whatsapp,
            email: b.email,
            status: b.status,
            dateISO: b.dateISO,
            court: b.court?.name,
            startAt: new Date(b.startAt),
            endAt: new Date(b.endAt),
            totalSlots: 1,
            amountPerSlot: b.amount,
            grandTotal: b.grandTotal,
          };
        } else {
          const current = acc[b.orderId];
          if (new Date(b.startAt) < current.startAt)
            current.startAt = new Date(b.startAt);
          if (new Date(b.endAt) > current.endAt)
            current.endAt = new Date(b.endAt);
          current.totalSlots += 1;
        }
        return acc;
      }, {})
    );
  }

  // 🔁 Fetch bookings with pagination + filters
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Build query string dynamically
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.court && { court: filters.court }),
          ...(filters.date && { date: filters.date }),
          ...(filters.status && { status: filters.status }),
        });

        const res = await apiGet(`/admin/bookings?${params.toString()}`, {
          auth: true,
        });

        const grouped = groupByOrderId(res.data);
        setBookings(grouped);
        setTotal(res.total);
      } catch (err) {
        console.error("Error fetch bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, limit]); // reload on pagination change

  const handleFilter = async () => {
    setPage(1);
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.court && { court: filters.court }),
        ...(filters.date && { date: filters.date }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await apiGet(`/admin/bookings?${params.toString()}`, {
        auth: true,
      });
      const grouped = groupByOrderId(res.data);
      setBookings(grouped);
      setTotal(res.total);
    } catch (err) {
      console.error("Error filtering bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl text-white font-bold mb-4">Bookings Management</h1>

      {/* 🔍 Filter Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by customer, phone, email..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filters.court}
            onChange={(e) =>
              setFilters((f) => ({ ...f, court: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Courts</option>
            <option value="Bandeja">Bandeja</option>
            <option value="Smash">Smash</option>
            <option value="Volley">Volley</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((f) => ({ ...f, date: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Filter
          </button>
        </div>
      </div>

      {/* 📊 Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100 text-left text-sm font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Court</th>
              <th className="px-4 py-2">Date & Time</th>
              <th className="px-4 py-2">Total Slots</th>
              <th className="px-4 py-2">Amount / Slot</th>
              <th className="px-4 py-2">Grand Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {bookings.map((b) => (
              <tr key={b.orderId} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-600 font-mono text-xs">
                  {b.orderId}
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-slate-500">{b.whatsapp}</div>
                  <div className="text-xs text-slate-400">{b.email}</div>
                </td>
                <td className="px-4 py-2">{b.court}</td>
                <td className="px-4 py-2">
                  {new Date(b.dateISO).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  <br />
                  {b.startAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {b.endAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 text-center">{b.totalSlots}</td>
                <td className="px-4 py-2">
                  Rp {b.amountPerSlot.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2 font-medium text-slate-700">
                  Rp {b.grandTotal.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : b.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : b.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination Controls */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-slate-600">
          Page {page} of {Math.ceil(total / limit) || 1}
        </span>
        <button
          onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
          disabled={page * limit >= total}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border border-black text-black rounded px-2 py-1 text-sm"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}
