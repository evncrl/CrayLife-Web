// src/components/Sidebar.jsx

const NAV = [
  {
    section: "Monitor",
    items: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "sensors", label: "Sensors", icon: "🧪" },
      { id: "outputs", label: "Outputs", icon: "🔄" },
    ],
  },
  {
    section: "Data",
    items: [
      { id: "history", label: "History", icon: "📈" },
    ],
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
  alerts = 0,
  isConnected,
  syncLabel,
}) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__mark">
          🦞
        </div>

        <div className="sidebar__brand-text">
          <div className="sidebar__name">
            CrayLife
          </div>

          <div className="sidebar__sub">
            Sensor Monitor
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="sidebar__nav"
        aria-label="Dashboard navigation"
      >
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <span className="sidebar__section-label">
              {section}
            </span>

            {items.map((item) => {
              const isActive =
                activePage === item.id;

              const showBadge =
                item.id === "overview" &&
                alerts > 0;

              return (
                <button
                  key={item.id}
                  className={`nav-item${
                    isActive ? " active" : ""
                  }`}
                  onClick={() =>
                    onNavigate(item.id)
                  }
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                >
                  <span className="nav-item__icon">
                    {item.icon}
                  </span>

                  {item.label}

                  {showBadge && (
                    <span className="nav-item__badge">
                      {alerts}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__live">
          <span
            className={`live-dot${
              isConnected
                ? ""
                : " live-dot--offline"
            }`}
          />

          <span>
            {isConnected
              ? syncLabel || "Live"
              : "Connection lost"}
          </span>
        </div>
      </div>
    </aside>
  );
}