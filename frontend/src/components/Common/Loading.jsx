function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export default Loading
