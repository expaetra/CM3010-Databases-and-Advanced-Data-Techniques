// imports and Chart.js parts
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale, 
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { fetchQ3 } from "../api";
import "./chart.css";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Store annual foreign/domestic tourism ratio data 
export default function Q3Chart() {
  const [rows, setRows] = useState([]); 
  const [error, setError] = useState(null);

  // Fetch data on mount (data is computed in the backend)
  useEffect(() => {
    fetchQ3()
      .then(setRows)
      .catch(e => setError(String(e)));
  }, 
  []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!rows.length) return null;

    return {
      datasets: [ 
        {
          label: "Foreign / Domestic tourism ratio",
          data: rows.map(r => ({ x: r.year, y: r.ratio })), 
          borderColor: "#bb6bdbff",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5
        }
      ]
    };
  }, [rows]);

  if (error) return <div>Error: {error}</div>; 
  if(!chartData) return <div>Loading chart data…</div>;

  return (
    <section className="chart-card">
      <h2>Balance between foreign and domestic tourism</h2>
      <p>
        Ratio of foreign to domestic tourist arrivals over time. Values above 1 indicate a higher presence of foreign tourists.
      </p>

      <Line
        data={chartData}
        options={{
          responsive: true,
          scales: {
            x: {
              type: "linear",
              title: {
                display: true, 
                text: "Year"
              },
              ticks: {
                callback: value =>Math.round(value).toString()
              }
            },
            y: {
              title: {
                display: true,
                text: "Foreign / Domestic ratio" 
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (items) => {
                  return `Year: ${Math.round(items[0].parsed.x)}`; 
                },
                label: ctx => {
                  const value = ctx.parsed.y;
                  if (value===null) return "Ratio: n/a";
                  return `Ratio: ${value.toFixed(2)}`;
                }
              }
            },
            legend: { display: false }
                    } 
        }}
      />
    </section>
  );
}
