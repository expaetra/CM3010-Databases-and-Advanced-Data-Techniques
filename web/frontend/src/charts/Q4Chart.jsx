// Imports and chart.js parts
import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { fetchQ4 } from "../api";
import "./chart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Store foreign tourism composition by Schengen membership
export default function Q4Chart() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on mount (data is computed in the backend)
  useEffect(() => {
    fetchQ4()
      .then(setRows)
      .catch(e => setError(String(e)));
  }, []);

  const chartData = useMemo(() => { 
    if (!rows.length) return null;

    const years = Array.from(
      new Set(rows.map(r => r.year))
    ).sort((a, b) => a - b);

    // shares for schengen and non-schengen countries 
    const schengen =years.map(y =>
      Number(
        rows.find(r => r.year === y && r.is_schengen === 1)?.share ?? 0 
      ) * 100
    );

    const nonSchengen = years.map(y =>
      Number(
        rows.find(r => r.year === y && r.is_schengen === 0)?.share ?? 0
      ) * 100
    );
    return {
      labels: years.map(String),
      datasets: [
        {
          label: "Non-Schengen",
          data: nonSchengen,
          backgroundColor: "#57ced6ff"
        },
        {
          label: "Schengen",
          data: schengen,
          backgroundColor: "#823ecfff"
        }
      ]
    };
  }, 
  [rows]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Loading chart data…</div>;

  return (
    <section className="chart-card">
      <h2>Composition of foreign tourism by Schengen membership</h2>
      <p>
        This chart shows the share of foreign tourists from Schengen and non-Schengen countries over time.
      </p>

      <div style={{ height: "400px" }}> 
        <Bar
          data={chartData}
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
              x: {
                stacked: true,
                min: 0,
                max: 100,
                ticks: {
                  callback: v => `${v}%`
                },
                title: {
                  display: true,
                  text: "Share of foreign tourists (%)" 
                }
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: "Year"
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: ctx => {
                    const v = ctx.parsed.x;
                    return v === null
                      ? "n/a"
                      : `${ctx.dataset.label}: ${v.toFixed(1)}%`;
                  }
                }
              },
              legend: {
                position: "bottom"
              }
            }
          }}
        />
      </div>
    </section>
  );
}
