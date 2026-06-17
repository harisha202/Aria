import { useId } from 'react'

function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  name,
  autoComplete,
}) {
  const generatedId = useId()
  const inputId = name || generatedId

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={error ? 'error' : ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span className="error-message" id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
