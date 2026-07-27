export default function StatsCard({ icon, count, label, variant = '' }) {
  return (
    <div className={`admin-stat-card ${variant ? `admin-stat--${variant}` : ''}`}>
      <span className="admin-stat-icon">{icon}</span>
      <div>
        <span className="admin-stat-count">{count}</span>
        <span className="admin-stat-label">{label}</span>
      </div>
    </div>
  );
}
