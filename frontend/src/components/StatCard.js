export default function StatCard({ label, value, helper }) {
  return (
    <div className="card stat-card">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <span className="muted">{helper}</span>
    </div>
  );
}
