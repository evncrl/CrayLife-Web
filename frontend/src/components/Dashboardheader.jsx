// src/components/DashboardHeader.jsx

import { useEffect, useState } from "react";

function formatClock(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function secondsAgo(date) {
  if (!date) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
}

export default function DashboardHeader({
  lastUpdated,
  isConnected,
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(
      () => setNow(new Date()),
      1000
    );

    return () => clearInterval(tick);
  }, []);

  const ago = secondsAgo(lastUpdated);
  const connected =
    isConnected &&
    ago !== null &&
    ago < 10;

  return (
    <header className="dashboard__header">
      <div className="header__brand">
        <div className="header__mark">
          🦞
        </div>

        <div>
          <h1 className="header__title">
            CrayLife
          </h1>

          <p className="header__subtitle">
            Sensor Monitor
          </p>
        </div>
      </div>

      <div className="header__meta">
        <span className="header__clock">
          {formatClock(now)}
        </span>

        <span
          className={`live-status ${
            connected
              ? ""
              : "live-status--offline"
          }`}
        >
          <span className="live-dot" />

          {connected
            ? `Synced ${ago}s ago`
            : "Connection lost"}
        </span>
      </div>
    </header>
  );
}