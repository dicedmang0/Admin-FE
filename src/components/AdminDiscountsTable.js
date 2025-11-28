"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "@/lib/api"; // sesuaikan path api.js kamu

function fmt(dtISO) {
  try {
    return new Date(dtISO).toLocaleString("id-ID", { hour12: false });
  } catch {
    return dtISO;
  }
}

function isoToLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function localInputValueToISO(localValue) {
  const d = new Date(localValue); // treated as local
  return d.toISOString();
}

function validateForm(f) {
  if (!f.name?.trim()) return "Name wajib diisi";
  const p = Number(f.percentage);
  if (!Number.isFinite(p) || p < 0 || p > 100) return "Percentage harus 0-100";
  const s = new Date(f.startAt);
  const e = new Date(f.endAt);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "Tanggal tidak valid";
  if (!(e > s)) return "End harus setelah Start";
  return null;
}

export default function AdminDiscountsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [form, setForm] = useState(() => {
    const now = new Date();
    const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return {
      name: "",
      percentage: 10,
      startAt: isoToLocalInputValue(now.toISOString()),
      endAt: isoToLocalInputValue(plus2h.toISOString()),
      isActive: true,
    };
  });

  const activeNow = useMemo(() => {
    const now = new Date();
    return (
      rows.find(
        (d) =>
          d.isActive &&
          new Date(d.startAt) <= now &&
          new Date(d.endAt) >= now
      ) || null
    );
  }, [rows]);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const data = await getDiscounts();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function onCreate() {
    const msg = validateForm(form);
    if (msg) return setErr(msg);

    setCreating(true);
    setErr(null);
    try {
      await createDiscount({
        name: form.name.trim(),
        percentage: Math.round(Number(form.percentage)),
        startAt: localInputValueToISO(form.startAt),
        endAt: localInputValueToISO(form.endAt),
        isActive: !!form.isActive,
      });
      setForm((p) => ({ ...p, name: "" }));
      await reload();
    } catch (e) {
      setErr(e?.message || "Failed to create discount");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(d) {
    setEditingId(d.id);
    setEditForm({
      name: d.name,
      percentage: d.percentage,
      startAt: isoToLocalInputValue(d.startAt),
      endAt: isoToLocalInputValue(d.endAt),
      isActive: !!d.isActive,
    });
    setErr(null);
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;

    const msg = validateForm(editForm);
    if (msg) return setErr(msg);

    setErr(null);
    try {
      await updateDiscount(editingId, {
        name: editForm.name.trim(),
        percentage: Math.round(Number(editForm.percentage)),
        startAt: localInputValueToISO(editForm.startAt),
        endAt: localInputValueToISO(editForm.endAt),
        isActive: !!editForm.isActive,
      });
      setEditingId(null);
      setEditForm(null);
      await reload();
    } catch (e) {
      setErr(e?.message || "Failed to update discount");
    }
  }

  async function toggleActive(d) {
    setErr(null);
    try {
      await updateDiscount(d.id, { isActive: !d.isActive });
      await reload();
    } catch (e) {
      setErr(e?.message || "Failed to toggle discount");
    }
  }

  async function onDelete(d) {
    const ok = confirm(`Hapus discount "${d.name}"?`);
    if (!ok) return;

    setErr(null);
    try {
      await deleteDiscount(d.id);
      await reload();
    } catch (e) {
      setErr(e?.message || "Failed to delete discount");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-800">Discounts</h2>
        <p className="text-sm text-slate-500">
          Terapkan discount berdasarkan kurun waktu dan persentase.
        </p>
      </div>

      {activeNow && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="font-semibold">Active now:</span>{" "}
          {activeNow.name} ({activeNow.percentage}%)
          <span className="text-emerald-700"> • </span>
          {fmt(activeNow.startAt)} → {fmt(activeNow.endAt)}
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      )}

      {/* Create */}
      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Create Discount</h3>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            Active
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Weekend Promo"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Percentage</label>
            <div className="relative mt-1">
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm outline-none focus:border-slate-400"
                value={form.percentage}
                onChange={(e) =>
                  setForm((p) => ({ ...p, percentage: e.target.value }))
                }
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Start</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.startAt}
              onChange={(e) =>
                setForm((p) => ({ ...p, startAt: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">End</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.endAt}
              onChange={(e) =>
                setForm((p) => ({ ...p, endAt: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onCreate}
            disabled={creating}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            onClick={() => setForm((p) => ({ ...p, name: "", percentage: 10 }))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">%</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  No discounts yet.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{d.percentage}</td>
                  <td className="px-4 py-3 text-slate-600">{fmt(d.startAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmt(d.endAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(d)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        d.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(d)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(d)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Edit Discount
              </h3>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
                className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Percentage
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={editForm.percentage}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, percentage: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!editForm.isActive}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  Active
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Start</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={editForm.startAt}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, startAt: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">End</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={editForm.endAt}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, endAt: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
