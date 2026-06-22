// src/components/SensorCard.jsx

function formatTimestamp(ts) {
  if (!ts) return "No data";

  return new Date(ts).toLocaleString();
}

function getIcon(name) {
  const icons = {
    ammonia: "🧪",
    uv: "🔆",
    lux: "💡",
    voltage: "⚡",
    tds: "💧",
    flow: "🌊",
    pump1: "🔄",
    pump2: "🔄",
    pump3: "🔄",
    solenoid: "🚰",
    status: "📡",
    growlightstatus: "💡",
  };

  return icons[name] || "📊";
}

export default function SensorCard({ sensor }) {
  return (
    <div className="sensor-card">
      <div className="sensor-card__top">
        <span className="sensor-card__icon">
          {getIcon(sensor.sensor_name)}
        </span>

        <span className="sensor-card__label">
          {sensor.sensor_name}
        </span>
      </div>

      <div className="sensor-card__value-row">
        <span className="sensor-card__value">
          {sensor.value}
        </span>
      </div>

      <div className="sensor-card__footer">
        <span className="sensor-card__timestamp">
          {formatTimestamp(sensor.timestamp)}
        </span>
      </div>
    </div>
  );
}