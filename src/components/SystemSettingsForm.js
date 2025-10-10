"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

export default function SystemSettingsForm() {
  const [form, setForm] = useState({
    weekdayRate: "",
    weekendRate: "",
    openAt: "00",
    closeAt: "23:59",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings saat pertama kali render
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/admin/settings", { auth: true });
        if (data) {
          setForm({
            weekdayRate: data.weekdayRate || "",
            weekendRate: data.weekendRate || "",
            openAt: data.openAt?.toString().padStart(2, "0") || "08",
            closeAt: data.closeAt?.toString().padStart(2, "0") || "22",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        alert("Gagal memuat pengaturan sistem.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle submit (PATCH ke backend)
  const handleSave = async () => {
    try {
      setSaving(true);
      await apiPatch("/admin/settings", form, { auth: true });
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to update settings:", err);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-600">Loading settings...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <span>⚙️</span> System Settings
      </h2>

      {/* Weekday Pricing */}
      <div>
        <label className="block text-sm text-slate-500 mb-1">
          Weekday Hourly Rate
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Rp</span>
          <input
            type="number"
            value={form.weekdayRate}
            onChange={(e) =>
              setForm({ ...form, weekdayRate: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Weekend Pricing */}
      <div>
        <label className="block text-sm text-slate-500 mb-1">
          Weekend Hourly Rate
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Rp</span>
          <input
            type="number"
            value={form.weekendRate}
            onChange={(e) =>
              setForm({ ...form, weekendRate: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Operating Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Opening Time
          </label>
          <input
            type="time"
            value={`${form.openAt.padStart(2, "0")}:00`}
            onChange={(e) => {
              const hour = e.target.value.split(":")[0];
              setForm({ ...form, openAt: hour });
            }}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Closing Time
          </label>
          <input
            type="time"
            value={`${form.closeAt.padStart(2, "0")}:00`}
            onChange={(e) => {
              const hour = e.target.value.split(":")[0];
              setForm({ ...form, closeAt: hour });
            }}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
