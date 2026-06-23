// src/components/MemberPage.jsx

import SensorCard from "../components/SensorCard";

export default function MemberPage({
  title,
  sensorKeys,
  sensors
}) {
  const filtered = sensors.filter((s) =>
    sensorKeys.includes(s.sensor_name)
  );

  return (
    <div>
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            {title}
          </h2>
          <span className="section__count">
            {filtered.length}
          </span>
          <span className="section__rule" />
        </div>

        <div className="card-grid">
          {filtered.map((sensor) => (
            <SensorCard
              key={sensor.sensor_name}
              sensor={sensor}
            />
          ))}
        </div>
      </section>
    </div>
  );
}