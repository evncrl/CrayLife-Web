// src/pages/Control.jsx

import { useState } from "react";

const API_URL = "http://192.168.1.173:5000";

export default function Control() {
  const [controls, setControls] = useState({
    growlight: false,
    uv: false,
    pump2: false,
    pump3: false,
    valve: false,
  });

  async function toggleControl(key, topic, value) {
    try {
      await fetch(`${API_URL}/api/control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          value,
        }),
      });

      setControls((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } catch (err) {
      console.error(err);
    }
  }

  const devices = [
    {
      key: "growlight",
      label: "Grow Light",
      topic: "craylife/growlight/control",
    },
    {
      key: "uv",
      label: "UV Light",
      topic: "craylife/control/uv",
    },
    {
      key: "pump2",
      label: "Pump 2",
      topic: "home/watertank/pump2/control",
    },
    {
      key: "pump3",
      label: "Pump 3",
      topic: "home/watertank/pump3/control",
    },
    {
      key: "valve",
      label: "Solenoid Valve",
      topic: "home/watertank/valve/control",
      onText: "OPEN",
      offText: "CLOSE",
    },
  ];

  return (
    <div>
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            Control Center
          </h2>
          <span className="section__rule" />
        </div>

        <div className="control-grid">
          {devices.map((device) => {
            const enabled = controls[device.key];

            return (
              <div
                key={device.key}
                className={`control-card ${
                  enabled ? "control-card--on" : ""
                }`}
              >
                <div className="control-card__header">
                  <h3>{device.label}</h3>

                  <span
                    className={
                      enabled
                        ? "status-pill status-pill--ok"
                        : "status-pill status-pill--offline"
                    }
                  >
                    {enabled
                      ? device.onText || "ON"
                      : device.offText || "OFF"}
                  </span>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() =>
                      toggleControl(
                        device.key,
                        device.topic,
                        enabled
                          ? device.offText || "OFF"
                          : device.onText || "ON"
                      )
                    }
                  />

                  <span className="slider"></span>
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}