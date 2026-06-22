// src/components/OverviewCharts.jsx

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = [
  "#2ec4b6",
  "#ff4f5e",
  "#f5b942",
  "#3ddc84",
];

export default function OverviewCharts({
  title,
  type = "line",
  data = [],
}) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>

      {data.length === 0 ? (
        <div className="chart-empty">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="value"
                stroke="#2ec4b6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2ec4b6"
                fill="#2ec4b633"
              />
            </AreaChart>
          ) : type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2ec4b6"
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                outerRadius={90}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}