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
            {/* ... (isi form sama seperti sebelumnya) ... */}
          </form>
        )}
      </div>
    </div>
  );
}
