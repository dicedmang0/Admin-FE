"use client";
import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [filters, setFilters] = useState({
    search: "",
    court: "all",
    date: "",
    status: "all",
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data dari BE
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken"); // simpan token JWT di login admin
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();

      // Filtering di sisi FE (atau bisa tambahkan query param ke BE nanti)
      let filtered = data;
      if (filters.search) {
        filtered = filtered.filter(
          (b) =>
            b.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            b.whatsapp?.includes(filters.search) ||
            b.email?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.court !== "all") {
        filtered = filtered.filter((b) => b.court?.id === filters.court);
      }
      if (filters.status !== "all") {
        filtered = filtered.filter(
          (b) => b.status.toLowerCase() === filters.status.toLowerCase()
        );
      }
      if (filters.date) {
        filtered = filtered.filter((b) => b.dateISO === filters.date);
      }

      setBookings(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const statusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "EXPIRED":
        return "bg-gray-100 text-gray-700";
      case "HOLD":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bookings Management</h1>
        <p className="text-slate-500">View and manage all court bookings</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Search Bookings
            </label>
            <input
              type="text"
              placeholder="Search by customer name, phone, or email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Court */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Court
            </label>
            <select
              value={filters.court}
              onChange={(e) =>
                setFilters({ ...filters, court: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courts</option>
              {/* TODO: bisa fetch daftar court dari BE */}
              <option value="court1">Court 1</option>
              <option value="court2">Court 2</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date Range
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {loading ? (
          <p className="p-4 text-slate-500">Loading...</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 text-left">
              <tr>
                <th className="px-4 py-3 border-b">Customer</th>
                <th className="px-4 py-3 border-b">Court</th>
                <th className="px-4 py-3 border-b">Date & Time</th>
                <th className="px-4 py-3 border-b">Amount</th>
                <th className="px-4 py-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.whatsapp}</div>
                  </td>
                  <td className="px-4 py-3">{b.court?.name}</td>
                  <td className="px-4 py-3">
                    {b.dateISO} <br />
                    {new Date(b.startAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(b.endAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">Rp {b.grandTotal.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
