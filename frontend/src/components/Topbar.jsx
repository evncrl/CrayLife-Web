// src/components/TopBar.jsx
import { useEffect, useState } from "react";

const PAGE_TITLES = {
  overview: "Overview",
  sensors:  "Environment Sensors",
  outputs:  "Tank Outputs",
  history:  "Sensor History",
};

export default function TopBar({ page }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="topbar">
      <h1 className="topbar__title">{PAGE_TITLES[page] || page}</h1>
      <div className="topbar__right">
        <span className="topbar__clock">
          {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          &nbsp;&nbsp;
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  );
}