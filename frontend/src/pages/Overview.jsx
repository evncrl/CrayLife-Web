// src/pages/Overview.jsx

import { useEffect, useState } from "react";

import SensorCard from "../components/SensorCard";
import AlertBanner from "../components/AlertBanner";
import OverviewCharts from "../components/OverviewCharts";

import {
  groupSensors,
  deriveAlertSeverity,
  isEmptyValue,
  getSensorMeta,
} from "../config/sensorConfig";

const API_URL = "http://192.168.1.173:5000";

function buildStats(sensors = []) {
  const total = sensors.length;

  const live = sensors.filter(
    (s) => !isEmptyValue(s.value)
  ).length;

  const offline = total - live;

  const crits = sensors.filter((s) => {
    const meta = getSensorMeta(
      s.sensor_name,
      s.value
    );

    return (
      meta.type === "alert" &&
      deriveAlertSeverity(s.value) === "critical"
    );
  }).length;

  return {
    total,
    live,
    offline,
    crits,
  };
}

export default function Overview({
  sensors = [],
}) {
  const stats = buildStats(sensors);
  const groups = groupSensors(sensors);

  const [ammoniaHistory, setAmmoniaHistory] =
    useState([]);

  const [luxHistory, setLuxHistory] =
    useState([]);

  const [flowStatus, setFlowStatus] =
    useState([]);

  const [alertData, setAlertData] =
    useState([]);

  useEffect(() => {
    async function loadCharts() {
      try {
        const res = await fetch(
          `${API_URL}/api/history?sensor=all&limit=1000`
        );

        const data = await res.json();

        const rows = [...(data.rows || [])].reverse();

        /* -------------------------
           AMMONIA TREND
        -------------------------- */

        const ammoniaRows = rows
          .filter(
            (r) =>
              r.sensor_name
                .toLowerCase()
                .includes("ammonia")
          )
          .slice(-30);

        setAmmoniaHistory(
          ammoniaRows.map((r) => ({
            time: new Date(
              r.timestamp
            ).toLocaleTimeString(),
            value: Number(r.value),
          }))
        );

        /* -------------------------
           LUX TREND
        -------------------------- */

        const luxRows = rows
          .filter(
            (r) =>
              r.sensor_name
                .toLowerCase()
                .includes("lux")
          )
          .slice(-30);

        setLuxHistory(
          luxRows.map((r) => ({
            time: new Date(
              r.timestamp
            ).toLocaleTimeString(),
            value: Number(r.value),
          }))
        );

        /* -------------------------
           FLOW STATUS PIE
        -------------------------- */

        const flowRows = rows.filter(
          (r) =>
            r.sensor_name ===
            "watertank_flow_status"
        );

        const blocked = flowRows.filter(
          (r) =>
            String(r.value)
              .toLowerCase()
              .includes("blocked")
        ).length;

        const normal =
          flowRows.length - blocked;

        setFlowStatus([
          {
            label: "Blocked",
            value: blocked,
          },
          {
            label: "Normal",
            value: Math.max(0, normal),
          },
        ]);

        /* -------------------------
           ALERT BAR CHART
        -------------------------- */

        const critical = flowRows.filter(
          (r) =>
            String(r.value)
              .toLowerCase()
              .includes("critical")
        ).length;

        const warning = flowRows.filter(
          (r) =>
            String(r.value)
              .toLowerCase()
              .includes("warning")
        ).length;

        const ok =
          flowRows.length -
          critical -
          warning;

        setAlertData([
          {
            label: "Critical",
            value: critical,
          },
          {
            label: "Warning",
            value: warning,
          },
          {
            label: "Normal",
            value: Math.max(0, ok),
          },
        ]);
      } catch (err) {
        console.error(
          "Chart loading failed:",
          err
        );
      }
    }

    loadCharts();
  }, []);

  /* -------------------------
     ALERT BANNERS
  -------------------------- */

  const alerts = [];

  const gridGroups = groups.map(
    (group) => ({
      ...group,
      items: group.items.filter(
        (item) => {
          if (
            item.meta.type !== "alert"
          )
            return true;

          alerts.push({
            label: item.meta.label,
            message: isEmptyValue(
              item.value
            )
              ? "No data available."
              : String(item.value),
            severity:
              deriveAlertSeverity(
                item.value
              ),
            timestamp:
              item.timestamp,
          });

          return false;
        }
      ),
    })
  );

  const hasActiveAlert =
    alerts.some(
      (a) =>
        a.severity ===
          "critical" ||
        a.severity === "warning"
    );

  return (
    <div>
      {/* ==========================
          STATS
      ========================== */}

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">
            {stats.total}
          </span>
          <span className="stat-card__label">
            Total Sensors
          </span>
        </div>

        <div
          className={`stat-card${
            stats.live ===
            stats.total
              ? " stat-card--ok"
              : ""
          }`}
        >
          <span className="stat-card__value">
            {stats.live}
          </span>
          <span className="stat-card__label">
            Live Readings
          </span>
        </div>

        <div
          className={`stat-card${
            stats.offline === 0
              ? " stat-card--ok"
              : ""
          }`}
        >
          <span className="stat-card__value">
            {stats.offline}
          </span>
          <span className="stat-card__label">
            No Data
          </span>
        </div>

        <div
          className={`stat-card${
            stats.crits > 0
              ? " stat-card--critical"
              : " stat-card--ok"
          }`}
        >
          <span className="stat-card__value">
            {stats.crits}
          </span>
          <span className="stat-card__label">
            Critical Alerts
          </span>
        </div>
      </div>

      {/* ==========================
          CHARTS
      ========================== */}

      <div className="chart-grid">
        <OverviewCharts
          title="Ammonia Trend"
          type="line"
          data={ammoniaHistory}
        />

        <OverviewCharts
          title="Lux Trend"
          type="area"
          data={luxHistory}
        />

        <OverviewCharts
          title="Water Flow Status"
          type="pie"
          data={flowStatus}
        />

        <OverviewCharts
          title="Alert Distribution"
          type="bar"
          data={alertData}
        />
      </div>

      {/* ==========================
          ALERTS
      ========================== */}

      {alerts.length > 0 &&
        (hasActiveAlert ? (
          alerts
            .filter(
              (a) =>
                a.severity ===
                  "critical" ||
                a.severity ===
                  "warning"
            )
            .map((alert, i) => (
              <AlertBanner
                key={i}
                alert={alert}
              />
            ))
        ) : (
          <AlertBanner
            alert={{
              label: "System",
              message:
                "All monitored systems are operating normally.",
              severity: "ok",
            }}
          />
        ))}

      {/* ==========================
          SENSOR GROUPS
      ========================== */}

      {gridGroups.map((group) =>
        group.items.length === 0 ? null : (
          <section
            className="section"
            key={group.key}
          >
            <div className="section__head">
              <h2 className="section__title">
                {group.label}
              </h2>

              <span className="section__count">
                {group.items.length}
              </span>

              <span className="section__rule" />
            </div>

            <div className="card-grid">
              {group.items.map(
                (sensor) => (
                  <SensorCard
                    key={
                      sensor.sensor_name
                    }
                    sensor={sensor}
                  />
                )
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}