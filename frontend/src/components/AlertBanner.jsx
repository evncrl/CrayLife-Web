// src/components/AlertBanner.jsx

const TITLES = {
  critical: "Critical",
  warning: "Warning",
  ok: "All Clear",
};

export default function AlertBanner({ alert }) {
  const { severity, message, label, timestamp } = alert;

  const modifier =
    severity === "ok"
      ? "alert-banner--clear"
      : severity === "warning"
      ? "alert-banner--warning"
      : "";

  return (
    <div className={`alert-banner ${modifier}`}>
      <span
        className="alert-banner__icon"
        style={{ fontSize: "1.5rem" }}
      >
        {severity === "critical"
          ? "🚨"
          : severity === "warning"
          ? "⚠️"
          : "✅"}
      </span>

      <div className="alert-banner__body">
        <p className="alert-banner__title">
          {TITLES[severity] || "Notice"} · {label}
        </p>

        <p className="alert-banner__message">
          {message}
        </p>

        {timestamp && (
          <p className="alert-banner__source">
            Reported {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}