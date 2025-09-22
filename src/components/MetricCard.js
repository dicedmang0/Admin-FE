export default function MetricCard({ icon = "📦", label, value }) {
  return (
    <div className="bg-white rounded-xl border shadow-soft p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
