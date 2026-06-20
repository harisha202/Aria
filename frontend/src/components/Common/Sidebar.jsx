function Sidebar({ children, isOpen = true, onToggle, title = 'Menu' }) {
  return (
    <aside className={`chat-sidebar ${isOpen ? 'is-open' : 'is-collapsed'}`} aria-label={title}>
      <button
        type="button"
        className="sidebar-logo-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close sidebar options' : 'Open sidebar options'}
      >
        <span className="sidebar-toggle-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <div className="sidebar-options" aria-hidden={!isOpen}>
        {children}
      </div>
    </aside>
  )
}

export default Sidebar
