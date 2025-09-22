"use client";
import { useState } from "react";
import { DateTime } from "luxon";

export default function MiniCalendarCard({ onDateSelect }) {
  const today = DateTime.now().startOf("day");
  const days = Array.from({ length: 30 }).map((_, i) =>
    today.minus({ days: 15 }).plus({ days: i })
  );

  // index hari ini (posisi awal di tengah)
  const [currentIndex, setCurrentIndex] = useState(15);
  const [selected, setSelected] = useState(today.toISODate());

  const move = (dir) => {
    setCurrentIndex((prev) =>
      Math.min(Math.max(prev + dir, 2), days.length - 3) // jaga supaya tidak keluar range
    );
  };

  const visibleDays = days.slice(currentIndex - 2, currentIndex + 3);

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-700">Pilih Tanggal</p>
        <div className="flex gap-2">
          <button
            onClick={() => move(-1)}
            className="px-2 py-1 rounded border bg-slate-100 hover:bg-slate-200"
          >
            ◀
          </button>
          <button
            onClick={() => move(1)}
            className="px-2 py-1 rounded border bg-slate-100 hover:bg-slate-200"
          >
            ▶
          </button>
        </div>
      </div>

      {/* hanya 5 tanggal tampil */}
      <div className="flex gap-2 justify-center">
        {visibleDays.map((d) => {
          const iso = d.toISODate();
          const isActive = iso === selected;
          const isWeekend = d.weekday === 6 || d.weekday === 7;

          return (
            <button
              key={iso}
              onClick={() => {
                setSelected(iso);
                onDateSelect?.(iso);
              }}
              className={`flex-shrink-0 w-[72px] h-[70px] flex flex-col items-center justify-center rounded-lg text-sm ${
                isActive
                  ? "bg-blue-600 text-white font-semibold"
                  : isWeekend
                  ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="text-base">{d.toFormat("dd")}</span>
              <span className="text-xs">{d.toFormat("ccc")}</span>
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-200 border border-green-400" />
          <span className="text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-200 border border-red-400" />
          <span className="text-slate-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-200 border border-yellow-400" />
          <span className="text-slate-600">Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-200 border border-gray-400" />
          <span className="text-slate-600">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
