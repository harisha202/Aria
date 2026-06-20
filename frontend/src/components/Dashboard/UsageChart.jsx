function UsageChart({ data = [] }) {
  const maxValue = Math.max(...data.map((item) => item.messages || 0), 1)

  return (
    <div className="usage-chart" aria-label="Weekly usage chart">
      {data.map((item) => (
        <div className="usage-bar" key={item.name}>
          <span
            className="usage-bar-fill"
            style={{ height: `${Math.max(8, ((item.messages || 0) / maxValue) * 100)}%` }}
            title={`${item.messages} messages`}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  )
}

export default UsageChart
