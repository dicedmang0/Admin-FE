"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";

const TZ = "Asia/Jakarta";

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, "0");

// ISO date yang aman untuk WIB (menghindari off-by-one karena toISOString UTC)
function toISODateWIB(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function getWibYearMonthNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const y = Number(parts.find((p) => p.type === "year")?.value || "1970");
  const m = Number(parts.find((p) => p.type === "month")?.value || "01"); // 1..12
  return { year: y, monthIndex: m - 1 }; // 0..11
}

function addMonths({ year, monthIndex }, delta) {
  const total = year * 12 + monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: total % 12 };
}

function monthLabel(year, monthIndex) {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function monthShort(year, monthIndex) {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  return d.toLocaleDateString("en-US", { month: "short" });
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// 0..6 (Sun..Sat)
function firstDayOfMonthDow(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

function isoFromYMD(year, monthIndex, day) {
  // Kita bentuk date lokal, lalu format ke ISO WIB via Intl
  const d = new Date(year, monthIndex, day, 12, 0, 0);
  return toISODateWIB(d);
}

function isPastDateWIB(dateISO) {
  const todayISO = toISODateWIB(new Date());
  return dateISO < todayISO;
}

// ---------- day summary ----------
/**
 * Return one of:
 * - "available"
 * - "booked"
 * - "hold"
 * - "blocked"
 * - "unavailable" (tanggal lampau)
 */
function summarizeDay(courts, dateISO) {
  if (isPastDateWIB(dateISO)) return "unavailable";

  if (!Array.isArray(courts) || courts.length === 0) return "blocked";

  // kalau semua court tidak punya slot (misal closed day/exception closed)
  const totalSlots = courts.reduce(
    (sum, c) => sum + (c?.slots?.length || 0),
    0
  );
  if (totalSlots === 0) return "blocked";

  let hasBooked = false;
  let hasHold = false;

  for (const c of courts) {
    for (const s of c?.slots || []) {
      if (s?.state === "booked") hasBooked = true;
      if (s?.state === "hold") hasHold = true;
    }
  }

  // Prioritas: booked > hold > available
  if (hasBooked) return "booked";
  if (hasHold) return "hold";
  return "available";
}

// ---------- UI ----------
function LegendItem({ colorClass, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M12.78 15.53a.75.75 0 01-1.06 0l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 111.06 1.06L8.31 10l4.47 4.47a.75.75 0 010 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M7.22 4.47a.75.75 0 011.06 0l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06L11.69 10 7.22 5.53a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ThreeMonthCalendarCard({
  onDateSelect,
  value, // optional: YYYY-MM-DD
}) {
  const initial = getWibYearMonthNow();
  const [anchor, setAnchor] = useState(initial); // month pertama dari range 3 bulan
  const [selectedISO, setSelectedISO] = useState(
    value || toISODateWIB(new Date())
  );

  // cache status per tanggal
  const [dayState, setDayState] = useState(() => new Map()); // dateISO -> state
  const [loadingMap, setLoadingMap] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    if (value) setSelectedISO(value);
  }, [value]);

  const months = useMemo(() => {
    return [anchor, addMonths(anchor, 1), addMonths(anchor, 2)];
  }, [anchor]);

  const rangeLabel = useMemo(() => {
    const start = months[0];
    const end = months[2];
    return `${monthShort(start.year, start.monthIndex)} - ${monthShort(
      end.year,
      end.monthIndex
    )} ${end.year}`;
  }, [months]);

  // generate semua dateISO yg tampil dalam 3 bulan (hanya hari valid, bukan padding)
  const visibleDates = useMemo(() => {
    const out = [];
    for (const m of months) {
      const dim = daysInMonth(m.year, m.monthIndex);
      for (let d = 1; d <= dim; d++) {
        out.push(isoFromYMD(m.year, m.monthIndex, d));
      }
    }
    return out;
  }, [months]);

  // fetch status untuk semua tanggal yg tampil (chunked)
  useEffect(() => {
    abortRef.current = false;

    async function run() {
      setLoadingMap(true);

      // biar gak fetch ulang yang sudah ada
      const toFetch = visibleDates.filter((iso) => !dayState.has(iso));
      if (toFetch.length === 0) {
        setLoadingMap(false);
        return;
      }

      const chunkSize = 10;
      const nextMap = new Map(dayState);

      try {
        for (let i = 0; i < toFetch.length; i += chunkSize) {
          if (abortRef.current) return;

          const chunk = toFetch.slice(i, i + chunkSize);
          const results = await Promise.all(
            chunk.map(async (iso) => {
              try {
                const courts = await apiGet(`/admin/courts?date=${iso}`, {
                  auth: true,
                });
                return [iso, summarizeDay(courts, iso)];
              } catch {
                // kalau error, jangan bikin page crash. tandai blocked saja.
                return [iso, "blocked"];
              }
            })
          );

          for (const [iso, st] of results) nextMap.set(iso, st);
          if (!abortRef.current) setDayState(new Map(nextMap));
        }
      } finally {
        if (!abortRef.current) setLoadingMap(false);
      }
    }

    run();

    return () => {
      abortRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDates.join("|")]); // aman untuk trigger saat month berubah

  const handlePick = (dateISO) => {
    setSelectedISO(dateISO);
    onDateSelect?.(dateISO);
  };

  // grayscale style untuk day cell (legend tetap warna booking modal)
  const dayCellClass = (dateISO) => {
    const st = dayState.get(dateISO); // bisa undefined saat loading
    const isSelected = selectedISO === dateISO;

    let base =
      "h-9 w-9 rounded-lg border text-sm grid place-items-center transition select-none";
    let color = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";

    if (st === "booked")
      color = "bg-slate-200 border-slate-300 text-slate-900 hover:bg-slate-200";
    else if (st === "hold")
      color = "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-100";
    else if (st === "blocked")
      color = "bg-slate-100 border-slate-200 text-slate-400";
    else if (st === "unavailable")
      color = "bg-slate-50 border-slate-200 text-slate-300";

    if (st === undefined) {
      color = "bg-slate-50 border-slate-200 text-slate-400 animate-pulse";
    }

    const ring = isSelected ? "ring-2 ring-sky-400 border-sky-300" : "";
    return `${base} ${color} ${ring}`;
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-4">
      {/* Header: kiri title, kanan legend */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Calendar Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a date to load court bookings for that day.
          </p>
        </div>

        {/* Legend (warna mengikuti BookingModal) */}
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <LegendItem colorClass="bg-green-500" label="Available" />
          <LegendItem colorClass="bg-red-500" label="Booked" />
          <LegendItem colorClass="bg-yellow-500" label="Hold" />
          <LegendItem colorClass="bg-gray-400" label="Blocked" />
          <LegendItem colorClass="bg-sky-500" label="Selected" />
        </div>
      </div>

      {/* 3 bulan */}
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        {months.map((m) => {
          const dim = daysInMonth(m.year, m.monthIndex);
          const firstDow = firstDayOfMonthDow(m.year, m.monthIndex); // 0..6 Sun..Sat
          const blanks = Array.from({ length: firstDow });

          return (
            <div key={`${m.year}-${m.monthIndex}`} className="min-w-0">
              <div className="text-center font-semibold text-slate-800">
                {monthLabel(m.year, m.monthIndex)}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2 text-[11px] text-slate-400">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                  <div key={`${d}-${idx}`} className="text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {blanks.map((_, i) => (
                  <div key={`b-${i}`} />
                ))}

                {Array.from({ length: dim }).map((_, idx) => {
                  const day = idx + 1;
                  const iso = isoFromYMD(m.year, m.monthIndex, day);
                  const st = dayState.get(iso);

                  const disabled =
                    st === "blocked" ||
                    st === "unavailable" ||
                    st === undefined;

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => handlePick(iso)}
                      disabled={disabled}
                      className={`${dayCellClass(iso)} ${
                        disabled ? "cursor-not-allowed" : ""
                      }`}
                      title={iso}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer buttons (tengah bawah) */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setAnchor((a) => addMonths(a, -3))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          <ChevronLeft />
          Previous 3 Months
        </button>

        <div className="text-sm text-slate-600 px-2">{rangeLabel}</div>

        <button
          type="button"
          onClick={() => setAnchor((a) => addMonths(a, 3))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Next 3 Months
          <ChevronRight />
        </button>
      </div>

      {/* kecil: loading indicator */}
      {loadingMap && (
        <div className="mt-3 text-center text-xs text-slate-400">
          Loading calendar summary…
        </div>
      )}
    </div>
  );
}
