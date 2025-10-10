"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@laguna-padel.com".replace("padel","padel")); // placeholder
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
  e.preventDefault();
  setErr("");
  setLoading(true);
  try {
    const out = await apiPost("/auth/login", { email, password });

    // ✅ gunakan key admin_role & admin_token dari auth.js
    saveSession({
      token: out.access_token,
      role: out.user.role, // ✅ ambil dari out.user.role
      remember,
    });

    router.replace("/dashboard");
  } catch (e) {
    setErr(e.message || "Login failed");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#6EABC6" }}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-soft p-6 md:p-8">
        <div className="w-12 h-12 mx-auto rounded-full grid place-items-center mb-3" style={{ background: "#E6F4F1" }}>
          {/* globe-ish icon */}
          <img src="https://res.cloudinary.com/doy2qixs5/image/upload/v1758449892/laguna/logo/laguna-padel-yellow_avinuo.png" alt="laguna-padel-logo" />
        </div>

        <h1 className="text-center text-black text-2xl font-bold">Laguna Padel</h1>
        <p className="text-center text-slate-500 text-sm">Management Dashboard</p>
        <p className="text-center text-slate-400 text-xs mt-1">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Email Address</label>
            <div className="mt-1 relative">
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 pl-9 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="absolute left-3 top-2.5 text-slate-400">✉️</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700">Password</label>
            <div className="mt-1 relative">
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 pr-9 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="absolute right-3 top-2.5 text-slate-400">👁️</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="text-slate-600">Remember me</span>
            </label>
            <button type="button" className="text-blue-600 hover:underline">Forgot password?</button>
          </div>

          {err ? (
            <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
