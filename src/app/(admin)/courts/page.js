"use client";
import { useState, useEffect } from "react";
import ThreeMonthCalendarCard from "@/components/ThreeMonthCalendarCard";
import Skeleton from "@/components/Skeleton";
import BookingModal from "@/components/BookingModal";
import { getCourtsByDate } from "@/lib/api"; // ✅ pakai helper baru

export default function CourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // pakai ISO tanggal lokal (admin view), cukup
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString()
      .slice(0, 10);
  });

  async function load(dateISO) {
    try {
      setLoading(true);
      const data = await getCourtsByDate(dateISO);
      setCourts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load courts", err);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* ✅ replace calendar */}
      <ThreeMonthCalendarCard
        value={selectedDate}
        onDateSelect={(dateISO) => {
          setSelectedDate(dateISO);
          load(dateISO);
        }}
      />

      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 space-y-4"
              >
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          courts.map((court) => (
            <div
              key={court.id}
              className="bg-white shadow-sm border border-slate-200 rounded-xl p-4"
            >
              <h2 className="text-lg font-semibold text-slate-700">
                {court.name}
              </h2>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
                {court.slots.map((slot) => {
                  const state = slot.state || "available";

                  const cls =
                    state === "booked"
                      ? "bg-red-100 text-red-600 border-red-200"
                      : state === "hold"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : state === "unavailable"
                      ? "bg-gray-100 text-gray-500 border-gray-200"
                      : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot({ ...slot, court })}
                      className={`p-2 rounded-lg text-center text-xs border transition-all ${cls}`}
                    >
                      <div>{slot.time}</div>
                      {state === "booked" ? (
                        <>
                          <div className="font-semibold text-[10px]">
                            {slot.bookingCode}
                          </div>
                          <div className="text-[10px] truncate">
                            {slot.bookingName}
                          </div>
                        </>
                      ) : (
                        <div>{state}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal detail slot */}
      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          court={selectedSlot.court}
          dateISO={selectedDate}
          onClose={() => setSelectedSlot(null)}
          onBooked={() => {
            // ✅ reload tanggal yang sedang dipilih
            load(selectedDate);
          }}
        />
      )}
    </div>
  );
}
