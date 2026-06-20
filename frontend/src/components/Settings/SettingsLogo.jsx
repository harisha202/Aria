function SettingsLogo({ type = 'profile', size = 'md', className = '' }) {
  return (
    <span className={`section-logo section-logo-${type} section-logo-${size} ${className}`.trim()} aria-hidden="true">
      <span className="section-logo-detail" />
    </span>
  )
}

export default SettingsLogo
