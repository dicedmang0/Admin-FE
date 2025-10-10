"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDel } from "@/lib/api";
import CampaignFormModal from "./CampaignFormModal";
import { Pencil, Trash2 } from "lucide-react";

export default function AdminCampaignsTable() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function loadCampaigns() {
    try {
      const data = await apiGet("/admin/campaigns", { auth: true });
      setCampaigns(data);
    } catch {
      alert("Gagal memuat campaign");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSave = async (data) => {
    try {
      if (selected) {
        await apiPatch(`/admin/campaigns/${selected.id}`, data, { auth: true });
        alert("Campaign updated!");
      } else {
        await apiPost("/admin/campaigns", data, { auth: true });
        alert("Campaign created!");
      }
      setShowModal(false);
      loadCampaigns();
    } catch {
      alert("Error saving campaign");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus campaign ini?")) return;
    await apiDel(`/admin/campaigns/${id}`, { auth: true });
    loadCampaigns();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-black">Hero Carousel Management</h2>
        <button
          onClick={() => {
            setSelected(null);
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Campaign
        </button>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-slate-500 border-b text-xs uppercase">
            <th className="py-2">Image</th>
            <th className="py-2">Title</th>
            <th className="py-2">Date</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b last:border-none">
              <td className="py-2">
                <img src={c.image} alt={c.title} className="h-12 w-20 rounded object-cover" />
              </td>
              <td className="py-2 text-black font-medium">{c.title}</td>
              <td className="py-2 text-black">{c.date}</td>
              <td className="py-2">
                <span className={`px-3 py-1 text-xs rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2 text-right space-x-2">
                <button onClick={() => { setSelected(c); setShowModal(true); }}>
                  <Pencil size={16} className="text-blue-600 hover:text-blue-800" />
                </button>
                <button onClick={() => handleDelete(c.id)}>
                  <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <CampaignFormModal
          campaign={selected}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
