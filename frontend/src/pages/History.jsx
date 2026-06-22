// src/pages/History.jsx
import { useState, useEffect, useCallback } from "react";
import { deriveAlertSeverity, SENSOR_CONFIG, getSensorMeta } from "../config/sensorConfig";

const PAGE_SIZE = 25;

const ALL_SENSOR_NAMES = ["all", ...Object.keys(SENSOR_CONFIG)];

const SEVERITY_COLORS = {
  critical: "var(--critical)",
  warning:  "var(--warning)",
  ok:       "var(--ok)",
};

function SeverityDot({ value }) {
  const s = deriveAlertSeverity(value);
  const color = SEVERITY_COLORS[s];
  if (!color) return null;
  return (
    <span style={{
      display: "inline-block",
      width: 7, height: 7,
      borderRadius: "50%",
      background: color,
      marginLeft: 8,
      flexShrink: 0,
    }} />
  );
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const API_URL = "http://192.168.1.173:5000";

async function fetchHistory({ sensor, offset, search }) {
  const params = new URLSearchParams({
    sensor: sensor || "all",
    limit: PAGE_SIZE,
    offset: offset || 0,
  });

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(
    `${API_URL}/api/history?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

export default function History() {
  const [sensor,  setSensor]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(0);
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async (opts) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory({
        sensor: opts.sensor ?? sensor,
        offset: opts.offset ?? page * PAGE_SIZE,
        search: opts.search ?? search,
      });
      setRows(data.rows  ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sensor, page, search]); // eslint-disable-line

  useEffect(() => { load({}); }, [sensor, page]); // eslint-disable-line

  function handleSensorChange(e) {
    setSensor(e.target.value);
    setPage(0);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    load({ offset: 0, search });
  }

  function handleSearchClear() {
    setSearch("");
    setPage(0);
    load({ offset: 0, search: "" });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startRow   = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow     = Math.min((page + 1) * PAGE_SIZE, total);

  function pageButtons() {
    const btns  = [];
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    const end   = Math.min(totalPages, start + 5);
    for (let i = start; i < end; i++) btns.push(i);
    return btns;
  }

  return (
    <div>
      {/* ── Controls ── */}
      <div className="history-controls">
        <select
          className="history-select"
          value={sensor}
          onChange={handleSensorChange}
          aria-label="Filter by sensor"
        >
          {ALL_SENSOR_NAMES.map((n) => (
            <option key={n} value={n}>
              {n === "all" ? "All sensors" : getSensorMeta(n, null).label}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            className="history-input"
            type="text"
            placeholder="Search values…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search by value"
            style={{ width: 200 }}
          />
          <button className="history-btn" type="submit">Search</button>
          {search && (
            <button className="history-btn" type="button" onClick={handleSearchClear}>
              Clear
            </button>
          )}
        </form>

        <button
          className="history-btn"
          onClick={() => load({})}
          style={{ marginLeft: "auto" }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          padding: "14px 16px", borderRadius: 10, marginBottom: 16,
          background: "var(--warning-soft)",
          border: "1px solid var(--warning)",
          borderLeft: "4px solid var(--warning)",
        }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>⚠</span>
          <div>
            <p style={{ margin: "0 0 3px", fontWeight: 600, fontSize: 13, color: "var(--warning)", textTransform: "uppercase", letterSpacing: ".03em" }}>
              Could not load history
            </p>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-primary)" }}>{error}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Make sure <code style={{ color: "var(--accent-water)" }}>/api/history</code> is in your api.py and the backend is running.
            </p>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {!error && (
        <>
          <div className="history-table-wrap">
            {loading ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div className="spinner" />
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 14 }}>
                  Fetching records…
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="state-empty">
                <p className="state-empty__title">No records found</p>
                <p>Try adjusting your sensor filter or search term.</p>
              </div>
            ) : (
              <table className="history-table" aria-label="Sensor history">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sensor</th>
                    <th>Value</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id ?? idx}>
                      <td className="td-time" style={{ color: "var(--text-muted)", minWidth: 50 }}>
                        {startRow + idx}
                      </td>
                      <td>
                        <span className="td-sensor">
                          {getSensorMeta(row.sensor_name, row.value).label}
                        </span>
                        <br />
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {row.sensor_name}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className={`td-value ${
                            deriveAlertSeverity(row.value) === "critical" ? "td-value--critical" :
                            deriveAlertSeverity(row.value) === "warning"  ? "td-value--warning"  :
                            deriveAlertSeverity(row.value) === "ok"       ? "td-value--ok"       : ""
                          }`}>
                            {String(row.value ?? "—")}
                          </span>
                          <SeverityDot value={row.value} />
                        </div>
                      </td>
                      <td className="td-time">{formatTimestamp(row.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ── */}
          {total > 0 && (
            <div className="history-pagination">
              <span className="history-pagination__info">
                {startRow}–{endRow} of {total.toLocaleString()} records
              </span>
              <div className="pagination-btns">
                <button className="pagination-btn" onClick={() => setPage(0)}              disabled={page === 0}             aria-label="First page">«</button>
                <button className="pagination-btn" onClick={() => setPage((p) => p - 1)}  disabled={page === 0}             aria-label="Previous page">‹</button>
                {pageButtons().map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn${p === page ? " pagination-btn--active" : ""}`}
                    onClick={() => setPage(p)}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p + 1}
                  </button>
                ))}
                <button className="pagination-btn" onClick={() => setPage((p) => p + 1)}  disabled={page >= totalPages - 1} aria-label="Next page">›</button>
                <button className="pagination-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} aria-label="Last page">»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}