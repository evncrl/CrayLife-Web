// src/pages/Overview.jsx
import SensorCard from "../components/SensorCard";
import AlertBanner from "../components/AlertBanner";
import { groupSensors, deriveAlertSeverity, isEmptyValue, getSensorMeta } from "../config/sensorConfig";

// Quick stats across all data
function buildStats(sensors) {
  const total = sensors.length;
  const live   = sensors.filter((s) => !isEmptyValue(s.value)).length;
  const offline = total - live;
  const crits  = sensors.filter((s) => {
    const m = getSensorMeta(s.sensor_name, s.value);
    return m.type === "alert" && deriveAlertSeverity(s.value) === "critical";
  }).length;
  return { total, live, offline, crits };
}

export default function Overview({ sensors }) {
  const stats  = buildStats(sensors);
  const groups = groupSensors(sensors);

  // Pull alert-type sensors into a banner list
  const alerts = [];
  const gridGroups = groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.meta.type !== "alert") return true;
      alerts.push({
        label:     item.meta.label,
        message:   isEmptyValue(item.value) ? "No data available." : String(item.value),
        severity:  deriveAlertSeverity(item.value),
        timestamp: item.timestamp,
      });
      return false;
    }),
  }));

  const hasActiveAlert = alerts.some((a) => a.severity === "critical" || a.severity === "warning");

  return (
    <div>
      {/* Stat summary */}
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{stats.total}</span>
          <span className="stat-card__label">Total Sensors</span>
        </div>
        <div className={`stat-card${stats.live === stats.total ? " stat-card--ok" : ""}`}>
          <span className="stat-card__value">{stats.live}</span>
          <span className="stat-card__label">Live Readings</span>
        </div>
        <div className={`stat-card${stats.offline > 0 ? "" : " stat-card--ok"}`}>
          <span className="stat-card__value">{stats.offline}</span>
          <span className="stat-card__label">No Data</span>
        </div>
        <div className={`stat-card${stats.crits > 0 ? " stat-card--critical" : " stat-card--ok"}`}>
          <span className="stat-card__value">{stats.crits}</span>
          <span className="stat-card__label">Critical Alerts</span>
        </div>
      </div>

      {/* Alert banners */}
      {alerts.length > 0 && (
        hasActiveAlert
          ? alerts
              .filter((a) => a.severity === "critical" || a.severity === "warning")
              .map((alert, i) => <AlertBanner key={i} alert={alert} />)
          : <AlertBanner alert={{ label: "System", message: "All monitored systems are operating normally.", severity: "ok" }} />
      )}

      {/* Sensor groups */}
      {gridGroups.map((group) =>
        group.items.length === 0 ? null : (
          <section className="section" key={group.key}>
            <div className="section__head">
              <h2 className="section__title">{group.label}</h2>
              <span className="section__count">{group.items.length}</span>
              <span className="section__rule" />
            </div>
            <div className="card-grid">
              {group.items.map((sensor) => (
                <SensorCard key={sensor.sensor_name} sensor={sensor} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}