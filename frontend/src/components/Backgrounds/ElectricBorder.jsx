function ElectricBorder({ children, className = '' }) {
  return <div className={`electric-border ${className}`.trim()}>{children}</div>
}

export default ElectricBorder
