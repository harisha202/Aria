function StatCard({ title, value, trend }) {
  return (
    <article className="stat-card">
      <p className="muted">{title}</p>
      <div className="stat-value">{value}</div>
      {trend && <p className="stat-trend">{trend}</p>}
    </article>
  )
}

export default StatCard
