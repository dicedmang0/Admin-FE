"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function BookingModal({ court, slot, dateISO, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "UNAVAILABLE", // default
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await apiPost("/admin/bookings", {
        courtId: court.id,
        startAt: slot.start, // dari slot
        status: form.status,
        name: form.name,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
      }, { auth: true });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create booking:", err);
      alert("Gagal membuat booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg  text-black font-semibold mb-4">
          Booking – {court.name} ({slot.time})
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <div>
            <label className="block text-sm  text-black font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border text-black rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm  text-black font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border text-black rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm  text-black font-medium mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full border text-black rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm  text-black font-medium mb-1">Booking Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border text-black rounded-lg px-3 py-2"
            >
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="BOOKED">Booked</option>
              <option value="HOLD">Hold</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm  text-black font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border  text-black rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
