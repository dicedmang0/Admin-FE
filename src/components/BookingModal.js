"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiPatch, getBookingDetail } from "@/lib/api";

export default function BookingModal({
  court,
  slot,
  dateISO,
  onClose,
  onBooked,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "PENDING",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  // 🔄 Prefill kalau slot sudah booked
  useEffect(() => {
    async function prefill() {
      if (!slot || slot.state !== "booked" || !slot.bookingId) return;

      try {
        setPrefillLoading(true);
        const data = await getBookingDetail(slot.bookingId);

        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.whatsapp || "",
          status: data?.status || "PENDING",
          notes: data?.note || "",
        });
      } catch (err) {
        console.error("Failed to fetch booking detail for prefill", err);
      } finally {
        setPrefillLoading(false);
      }
    }

    prefill();
  }, [slot]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const isBookedSlot = slot.state === "booked";
      const wantsCancel = form.status === "CANCELLED";

      // CASE 1: sudah booked + pilih Cancelled → PATCH cancel
      if (isBookedSlot && wantsCancel && slot.bookingId) {
        await apiPatch(
          `/admin/bookings/${slot.bookingId}/cancel`,
          {},
          { auth: true }
        );
      } else {
        // CASE 2: create booking manual baru
        const startAtLocal = `${dateISO}T${slot.time}:00+07:00`;
        const startAt = new Date(startAtLocal);

        await apiPost(
          "/admin/bookings",
          {
            courtId: court.id,
            startAt,
            status: form.status,
            name: form.name,
            email: form.email,
            phone: form.phone,
            note: form.notes,
          },
          { auth: true }
        );
      }

      // 🔁 minta parent reload data courts untuk tanggal yang sama
      if (onBooked) {
        await onBooked();
      }

      // 🔁 refresh route Next.js (server components / layout ikut update)
      router.refresh();

      // 🔚 tutup modal
      onClose();
    } catch (err) {
      console.error("Failed to submit booking", err);
      alert(err?.message || "Gagal menyimpan booking");
    } finally {
      setLoading(false);
    }
  }

  const isEditingBooked = slot.state === "booked";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg text-black font-semibold mb-4">
          Booking – {court.name} ({slot.time})
        </h2>

        {prefillLoading ? (
          <p className="text-sm text-slate-500">Loading booking data…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Info */}
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Name
              </label>
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
                <label className="block text-sm text-black font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                  className="w-full border text-black rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-black font-medium mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  required
                  className="w-full border text-black rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Booking Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full border text-black rounded-lg px-3 py-2"
              >
                <option value="PENDING">Unavailable</option>
                <option value="PAID">Booked</option>
                <option value="HOLD">Hold</option>
                <option value="CANCELLED">Cancelled (Free slot)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                className="w-full border text-black rounded-lg px-3 py-2"
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
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditingBooked
                  ? "Save / Cancel Booking"
                  : "Create Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
