"use client";
import AdminCampaignsTable from "@/components/AdminCampaignsTable";
import AdminUsersTable from "@/components/AdminUsersTable";
import SystemSettingsForm from "@/components/SystemSettingsForm";
import AdminDiscountsTable from "@/components/AdminDiscountsTable";

export default function AdminSetupPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Admin Setup</h1>
      <p className="text-slate-500 text-sm">
        Manage users, pricing, and operating hours.
      </p>

      {/* User Management Section */}
      <AdminUsersTable />

      {/* System Settings Section */}
      <SystemSettingsForm />
      <AdminDiscountsTable />
      <AdminCampaignsTable/>
    </div>
  );
}
