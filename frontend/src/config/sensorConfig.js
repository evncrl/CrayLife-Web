// src/config/sensorConfig.js
//
// Single source of truth for how each sensor_name from the API should be
// displayed. Add a new sensor here and it picks up the right label, unit,
// icon and card layout automatically — Overview/SensorCard never need to
// know about individual sensor names.

export const GROUPS = {
  environment: { label: "Environment", order: 0 },
  watertank: { label: "Water Tank", order: 1 },
  other: { label: "Other", order: 2 },
};

// type: "metric" | "dual-metric" | "toggle" | "status" | "alert"
export const SENSOR_CONFIG = {
  ammonia: {
    label: "Ammonia",
    unit: "ppm",
    group: "environment",
    type: "metric",
    icon: "flask",
    decimals: 2,
  },
  lux: {
    label: "Light Level",
    unit: "lx",
    group: "environment",
    type: "metric",
    icon: "sun",
    decimals: 0,
  },
  ir: {
    label: "IR Sensor",
    unit: "",
    group: "environment",
    type: "metric",
    icon: "eye",
    decimals: 0,
  },
  status: {
    label: "System Status",
    group: "environment",
    type: "status",
    icon: "cpu",
  },
  growlightstatus: {
    label: "Grow Light",
    group: "environment",
    type: "toggle",
    icon: "bulb",
  },
  watertank_tds: {
    label: "TDS / EC",
    group: "watertank",
    type: "dual-metric",
    icon: "droplet",
    parts: [
      { label: "TDS", unit: "ppm", decimals: 1 },
      { label: "EC", unit: "mS/cm", decimals: 3 },
    ],
  },
  watertank_status: {
    label: "Tank Level",
    group: "watertank",
    type: "status",
    icon: "tank",
  },
  watertank_valve: {
    label: "Solenoid Valve",
    group: "watertank",
    type: "toggle",
    icon: "valve",
    onWords: ["ON", "OPEN"],
  },
  watertank_pump2: {
    label: "Pump 2",
    group: "watertank",
    type: "toggle",
    icon: "pump",
  },
  watertank_pump3: {
    label: "Pump 3",
    group: "watertank",
    type: "toggle",
    icon: "pump",
  },
  watertank_flow: {
    label: "Flow Rate",
    unit: "L/min",
    group: "watertank",
    type: "metric",
    icon: "wave",
    decimals: 1,
  },
  watertank_flow_status: {
    label: "Flow Status",
    group: "watertank",
    type: "alert",
    icon: "alert",
  },
};

const FALLBACK_ICON_BY_TYPE = {
  metric: "gauge",
  "dual-metric": "gauge",
  toggle: "power",
  status: "cpu",
  alert: "alert",
};

const ON_WORDS = ["ON", "OPEN", "TRUE", "1", "ACTIVE"];

export function isNumeric(value) {
  if (value === null || value === undefined || value === "") return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isEmptyValue(value) {
  return value === null || value === undefined || value === "";
}

function prettifyName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Builds the display metadata for a sensor_name, falling back to sensible
// guesses (based on the raw value's shape) for anything not in the registry.
export function getSensorMeta(name, rawValue) {
  const known = SENSOR_CONFIG[name];
  if (known) return { ...known, key: name };

  let type = "status";
  if (!isEmptyValue(rawValue)) {
    const upper = String(rawValue).toUpperCase();
    if (ON_WORDS.includes(upper) || upper === "OFF" || upper === "CLOSED") {
      type = "toggle";
    } else if (isNumeric(rawValue)) {
      type = "metric";
    }
  }

  return {
    key: name,
    label: prettifyName(name),
    group: "other",
    type,
    icon: FALLBACK_ICON_BY_TYPE[type] || "gauge",
    unit: "",
    decimals: 1,
  };
}

export function isOnValue(value, onWords) {
  if (isEmptyValue(value)) return false;
  const upper = String(value).toUpperCase();
  return (onWords || ON_WORDS).includes(upper);
}

export function formatNumber(value, decimals = 1) {
  const n = parseFloat(value);
  if (isNaN(n)) return String(value);
  return n.toFixed(decimals);
}

// "1032.3,2.198" -> ["1032.3", "2.198"]
export function splitParts(value) {
  if (isEmptyValue(value)) return [];
  return String(value)
    .split(",")
    .map((p) => p.trim());
}

export function deriveAlertSeverity(value) {
  if (isEmptyValue(value)) return "offline";
  const upper = String(value).toUpperCase();
  if (upper.includes("CRITICAL") || upper.includes("ERROR") || upper.includes("BLOCKED")) {
    return "critical";
  }
  if (upper.includes("WARNING") || upper.includes("LOW")) {
    return "warning";
  }
  if (upper.includes("OK") || upper.includes("NORMAL") || upper.includes("GOOD")) {
    return "ok";
  }
  return "neutral";
}

export function groupSensors(sensors) {
  const byGroup = {};
  for (const groupKey of Object.keys(GROUPS)) byGroup[groupKey] = [];

  for (const sensor of sensors) {
    const meta = getSensorMeta(sensor.sensor_name, sensor.value);
    const groupKey = GROUPS[meta.group] ? meta.group : "other";
    byGroup[groupKey].push({ ...sensor, meta });
  }

  return Object.keys(GROUPS)
    .sort((a, b) => GROUPS[a].order - GROUPS[b].order)
    .map((key) => ({
      key,
      label: GROUPS[key].label,
      items: byGroup[key],
    }))
    .filter((g) => g.items.length > 0);
}