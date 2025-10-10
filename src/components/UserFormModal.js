"use client";
import { useState } from "react";

export default function UserFormModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    email: user?.email || "",
    password: "",
    role: user?.role || "STAFF",
  });

  const isEdit = !!user;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || (!isEdit && !form.password)) {
      alert("Email dan password wajib diisi.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit User" : "Add New User"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isEdit && (
            <div>
              <label className="text-sm text-slate-500">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm text-slate-500">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="STAFF">Court Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
