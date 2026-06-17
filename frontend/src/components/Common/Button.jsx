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
  return (
    <button
      className={`btn btn-${variant} ${className}`.trim()}
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
