"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDel } from "@/lib/api";
import UserFormModal from "./UserFormModal";
import { Pencil, Trash2 } from "lucide-react"; // ✅ icons

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function loadUsers() {
    try {
      const data = await apiGet("/admin/users", { auth: true });
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Gagal memuat daftar user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (userData) => {
    try {
      await apiPost("/admin/users", userData, { auth: true });
      alert("User created successfully!");
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(err.message || "Failed to create user.");
    }
  };

  const handleUpdate = async (id, userData) => {
    try {
      await apiPatch(`/admin/users/${id}`, userData, { auth: true });
      alert("User updated successfully!");
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(err.message || "Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiDel(`/admin/users/${id}`, { auth: true });
      alert("User deleted successfully!");
      loadUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    }
  };

  if (loading)
    return <p className="text-slate-600 text-sm">Loading users...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span>👥</span> User Management
        </h2>
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">＋</span>
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b text-slate-500 text-xs uppercase tracking-wide">
              <th className="py-3 px-2">User</th>
              <th className="py-3 px-2">Role</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Last Login</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 text-center text-slate-500 text-sm"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-none hover:bg-slate-50"
                >
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-slate-800">
                        {user.email.split("@")[0]}
                      </p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "SUPERADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "SUPERADMIN"
                        ? "Super Admin"
                        : "Court Admin"}
                    </span>
                  </td>

                  <td className="py-3 px-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>

                  <td className="py-3 px-2 text-slate-500 text-xs">
                    {user.lastLogin
                      ? formatLastLogin(user.lastLogin)
                      : "—"}
                  </td>

                  <td className="py-3 px-2 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit User"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <UserFormModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={(data) =>
            selectedUser
              ? handleUpdate(selectedUser.id, data)
              : handleCreate(data)
          }
        />
      )}
    </div>
  );
}

// ✅ Helper untuk format last login
function formatLastLogin(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(diffHrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
