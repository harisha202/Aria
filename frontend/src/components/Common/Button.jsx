function Button({
  text,
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) {
  let btnClass = `btn btn-${variant}`
  if (variant === 'ghost') btnClass = 'ghost-button'
  if (variant === 'icon') btnClass = 'icon-button'

  return (
    <button
      className={`${btnClass} ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span>{loading ? 'Please wait' : text || children}</span>
    </button>
  )
}

export default Button
