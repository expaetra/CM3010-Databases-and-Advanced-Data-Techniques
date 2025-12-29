// imports and Chart.js parts 
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

// fetch data for question 5 and schengen entry year
import { fetchQ5, fetchSchengenEntryYear } from "../api";
import "./chart.css";

// fetch Schengen entry year from the database and draw vertical line on that year  
const verticalLinePlugin = {
  id: "verticalLine",
  afterDraw(chart) {
    const year = chart.options.plugins?.verticalLine?.year; 
    if (!year) return;

    const { ctx, scales, chartArea } =chart;
    const xScale = scales.x; 
    if (!xScale) return;

    const x = xScale.getPixelForValue(year);
    ctx.save();
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle ="steelblue";
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "steelblue";
    ctx.font = "12px sans-serif";
    ctx.fillText("Schengen entry", x + 8, chartArea.top + 14);
    ctx.restore();
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  verticalLinePlugin
);

// Fetch and store indexed tourism growth data by county type
export default function Q5Chart() {
  const [rows, setRows] = useState([]);
  const [schengenYear, setSchengenYear] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQ5().then(setRows).catch(e => setError(String(e)));

    fetchSchengenEntryYear().then(d => setSchengenYear(String(d.year))).catch(() => setSchengenYear(null));
  }, 
  []);

  const chartData = useMemo(() => {
    if (!rows.length) return null;

    // get years and sort them correctly 
    const years = [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);

    // separate coastal and inland country data, convert values & align them year by year
    const coastal = years.map(y =>
      Number(rows.find(r => r.year === y && r.coastal_flag === 1)?.index_value)
    );
    const inland = years.map(y =>
      Number(rows.find(r => r.year === y && r.coastal_flag === 0)?.index_value)
    );

    return {
      labels: years.map(String),
      datasets: [
        {
          label: "Coastal counties",
          data: coastal,
          borderColor: "#5279ceff",
          tension: 0.3,
          pointRadius: 5
        },
        {
          label: "Inland counties",
          data: inland,
          borderColor: "#56aa73ff",
          tension: 0.3,
          pointRadius: 5 
        }
      ]
    };
  }, 
  [rows]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Loading data…</div>;

  return (
    <section className="chart-card">
      <h2>Indexed growth of tourism activity by county type</h2>
      <p>
        Tourism arrivals are shown indexed to 2019 as a baseine (100). Hover over a year to see annual growth rates.
      </p>

      <Line
        data={chartData}
        options={{
          responsive: true,
          interaction: {
            mode: "index", 
            intersect: false
          },
          scales: {
            y: {
              title: {
                display: true,
                text: "Index (2019 = 100)"
              } 
            },
            x: {
              title: {
                display: true,
                text: "Year"
              }
            }
          },
          plugins: {
            verticalLine: {
              year: schengenYear
            },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const data = ctx.dataset.data;
                  const i = ctx.dataIndex;
                  const value = ctx.parsed.y;
                  if (i === 0) {
                    return `${ctx.dataset.label}: ${value.toFixed(1)} (baseline)`; 
                  }
    
                  const prev = data[i - 1];
                  const growth = ((value - prev) / prev) * 100;

                  return `${ctx.dataset.label}: ${value.toFixed(
                    1
                  )}  (${growth > 0 ? "+" : ""}${growth.toFixed(1)}%)`;
                }
              }
            }
          }
        }}
      />
    </section>
  );
}
