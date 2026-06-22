import { getSensorMeta, isEmptyValue, isOnValue, deriveAlertSeverity } from "../config/sensorConfig";

const OUTPUT_SENSORS  = ["watertank_valve", "watertank_pump2", "watertank_pump3"];
const READING_SENSORS = ["watertank_tds", "watertank_status", "watertank_flow"];
const ALERT_SENSORS   = ["watertank_flow_status"];

// Icon glyphs keyed to sensor meta.icon — no external icon lib needed
const GLYPHS = {
  valve:   "⬡", pump: "◎", wave: "≋",
  droplet: "◉", tank: "▭", gauge: "◈", alert: "⚠",
};

function getSensor(sensors, name) {
  return sensors.find((s) => s.sensor_name === name) || { sensor_name: name, value: null, timestamp: null };
}

function formatTs(ts) {
  if (!ts) return "No data yet";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return `Updated ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function formatValue(value, meta) {
  if (isEmptyValue(value)) return "—";
  if (meta.type === "dual-metric") {
    const parts = String(value).split(",").map((p) => p.trim());
    const defs  = meta.parts || [];
    return parts.map((p, i) => `${parseFloat(p).toFixed(defs[i]?.decimals ?? 1)} ${defs[i]?.unit ?? ""}`).join("  /  ");
  }
  if (meta.type === "metric" && !isNaN(parseFloat(value))) {
    return `${parseFloat(value).toFixed(meta.decimals ?? 1)}${meta.unit ? " " + meta.unit : ""}`;
  }
  return String(value);
}

// ── Inline alert banner ──────────────────────────────────────────────────────
function AlertBanner({ alert }) {
  const colors = {
    critical: { bg: "var(--critical-soft)", border: "var(--critical)", text: "var(--critical)" },
    warning:  { bg: "var(--warning-soft)",  border: "var(--warning)",  text: "var(--warning)"  },
    ok:       { bg: "var(--ok-soft)",       border: "var(--ok)",       text: "var(--ok)"       },
  };
  const c = colors[alert.severity] || colors.warning;
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "14px 16px", borderRadius: 10, marginBottom: 14,
      background: c.bg, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.border}`,
    }}>
      <span style={{ fontSize: 16, color: c.text, marginTop: 1 }}>⚠</span>
      <div>
        <p style={{ margin: "0 0 3px", fontWeight: 600, fontSize: 12.5, color: c.text, textTransform: "uppercase", letterSpacing: ".03em" }}>
          {alert.severity === "ok" ? "All Clear" : alert.severity} · {alert.label}
        </p>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.45 }}>
          {alert.message}
        </p>
      </div>
    </div>
  );
}

// ── Inline reading card (for tank readings section) ──────────────────────────
function ReadingCard({ sensor }) {
  const { meta, value, timestamp } = sensor;
  const empty = isEmptyValue(value);
  return (
    <div className={`sensor-card${empty ? " sensor-card--offline" : ""}`}>
      <div className="sensor-card__top">
        <div className="sensor-card__label-group">
          <span style={{ fontSize: 14, color: "var(--accent-water)", lineHeight: 1 }}>
            {GLYPHS[meta.icon] || "◈"}
          </span>
          <span className="sensor-card__label">{meta.label}</span>
        </div>
        {empty && (
          <span className="status-pill status-pill--offline">No Data</span>
        )}
      </div>
      <div className="sensor-card__value" style={{ fontSize: empty ? 16 : 22 }}>
        {empty ? "No data" : formatValue(value, meta)}
      </div>
      <div className="sensor-card__footer">
        <span className="sensor-card__timestamp">{formatTs(timestamp)}</span>
      </div>
    </div>
  );
}

// ── Output card (actuators — valve / pumps) ──────────────────────────────────
function OutputCard({ name, sensors }) {
  const raw  = getSensor(sensors, name);
  const meta = getSensorMeta(name, raw.value);
  const on   = !isEmptyValue(raw.value) && isOnValue(raw.value, meta.onWords);

  return (
    <div className={`output-card${on ? " output-card--on" : " output-card--off"}`}>
      <div className="output-card__head">
        <div className="output-card__icon-wrap">
          <span style={{ fontSize: 20, lineHeight: 1 }}>{GLYPHS[meta.icon] || "◈"}</span>
        </div>
        <div>
          <div className="output-card__title">{meta.label}</div>
          <div className="output-card__sub">{name}</div>
        </div>
      </div>
      <div className="output-card__state">
        <span className="output-card__state-label">
          {isEmptyValue(raw.value) ? "—" : String(raw.value).toUpperCase()}
        </span>
        <span className={`toggle-indicator ${on ? "toggle-indicator--on" : "toggle-indicator--off"}`}
              style={{ width: 44, height: 24 }}>
          <span className="toggle-indicator__thumb" />
        </span>
      </div>
      <div className="output-card__ts">{formatTs(raw.timestamp)}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Outputs({ sensors }) {
  const activeOutputs = OUTPUT_SENSORS.filter((name) => {
    const raw  = getSensor(sensors, name);
    const meta = getSensorMeta(name, raw.value);
    return !isEmptyValue(raw.value) && isOnValue(raw.value, meta.onWords);
  }).length;

  const alertItems = ALERT_SENSORS.map((name) => {
    const raw = getSensor(sensors, name);
    return {
      label:    getSensorMeta(name, raw.value).label,
      message:  isEmptyValue(raw.value) ? "No data." : String(raw.value),
      severity: deriveAlertSeverity(raw.value),
    };
  });

  const hasActiveAlert = alertItems.some((a) => a.severity === "critical" || a.severity === "warning");

  const readingCards = READING_SENSORS.map((name) => {
    const raw = getSensor(sensors, name);
    return { ...raw, meta: getSensorMeta(name, raw.value) };
  });

  return (
    <div>
      {/* Stats */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="stat-card__value">{OUTPUT_SENSORS.length}</span>
          <span className="stat-card__label">Actuators</span>
        </div>
        <div className={`stat-card${activeOutputs > 0 ? " stat-card--ok" : ""}`}>
          <span className="stat-card__value">{activeOutputs}</span>
          <span className="stat-card__label">Active</span>
        </div>
        <div className={`stat-card${hasActiveAlert ? " stat-card--critical" : " stat-card--ok"}`}>
          <span className="stat-card__value">{hasActiveAlert ? "⚠" : "✓"}</span>
          <span className="stat-card__label">System Health</span>
        </div>
      </div>

      {/* Alert banners */}
      {alertItems.map((alert, i) => <AlertBanner key={i} alert={alert} />)}

      {/* Actuators */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Actuators</h2>
          <span className="section__count">{OUTPUT_SENSORS.length}</span>
          <span className="section__rule" />
        </div>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {OUTPUT_SENSORS.map((name) => (
            <OutputCard key={name} name={name} sensors={sensors} />
          ))}
        </div>
      </section>

      {/* Tank readings */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Tank Readings</h2>
          <span className="section__count">{readingCards.length}</span>
          <span className="section__rule" />
        </div>
        <div className="card-grid card-grid--wide">
          {readingCards.map((s) => (
            <ReadingCard key={s.sensor_name} sensor={s} />
          ))}
        </div>
      </section>
    </div>
  );
}