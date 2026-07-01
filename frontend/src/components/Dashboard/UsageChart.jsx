import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function UsageChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="usage-chart" aria-label="Weekly usage chart" style={{ height: 240 }} />
  }

  return (
    <div className="usage-chart-container" aria-label="Weekly usage chart" style={{ height: 240, width: '100%', marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            dy={10}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ backgroundColor: 'var(--panel-strong)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text)' }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Bar dataKey="messages" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--primary)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UsageChart
