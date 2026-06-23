// src/pages/Sensors.jsx
//
// Shows only environment-group sensors: ammonia, lux, voltage, IR,
// system status, and grow light. Pure read-only sensor readings.

import SensorCard from "../components/SensorCard";
import { getSensorMeta, isEmptyValue } from "../config/sensorConfig";

const ENV_SENSORS = [
  "ammonia",
  "lux",
  "ir",
  "watertank_tds",
  "watertank_flow",
  "watertank_status"
];

function getReading(sensors, name) {
  return sensors.find((s) => s.sensor_name === name) || {
    sensor_name: name,
    value: null,
    timestamp: null,
  };
}

export default function Sensors({ sensors }) {
  const envReadings = ENV_SENSORS.map((name) => {
    const raw = getReading(sensors, name);
    return { ...raw, meta: getSensorMeta(name, raw.value) };
  });

  const liveCount    = envReadings.filter((s) => !isEmptyValue(s.value)).length;
  const offlineCount = envReadings.length - liveCount;

  return (
    <div>
      {/* Summary strip */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="stat-card__value">{envReadings.length}</span>
          <span className="stat-card__label">Total Sensors</span>
        </div>
        <div className={`stat-card${liveCount === envReadings.length ? " stat-card--ok" : ""}`}>
          <span className="stat-card__value">{liveCount}</span>
          <span className="stat-card__label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{offlineCount}</span>
          <span className="stat-card__label">No Data</span>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Environment Readings</h2>
          <span className="section__count">{envReadings.length}</span>
          <span className="section__rule" />
        </div>
        <div className="card-grid card-grid--wide">
          {envReadings.map((sensor) => (
            <SensorCard key={sensor.sensor_name} sensor={sensor} />
          ))}
        </div>
      </section>

      {/* Info footer */}
      <p style={{
        fontSize: 12,
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        marginTop: 8,
      }}>
        Readings auto-refresh every 2 seconds via MQTT broker.
      </p>
    </div>
  );
}