// Imports and chart.js parts
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { fetchQ6 } from "../api";
import "./chart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// convert the SQL returned ration to percentages: summer and non-summer
function ratioToPercentages(ratio) {
  const r = Number(ratio); 
  const summer = (r / (1 + r)) * 100;
  const nonSummer = (1 / (1 +r)) * 100;
  return { summer, nonSummer };
}

// buildt two charts for coastal/inland counties
function buildChartData(rows, coastalFlag) {
  const filtered = rows.filter(r => r.coastal_flag === coastalFlag);
  const years = filtered
    .map(r => r.year)
    .sort((a, b) => a - b);

  const summer = filtered.map(r =>
    ratioToPercentages(r.seasonality_ratio).summer
  );

  const nonSummer = filtered.map(r =>
    ratioToPercentages(r.seasonality_ratio).nonSummer
  );

  return {
    labels: years.map(String),
    datasets: [
      {
        label: "Summer",
        data: summer,
        backgroundColor: "#ebcf5fff" // yellow for summer
      },
      {
        label: "Non-summer",
        data: nonSummer,
        backgroundColor: "#518ff3ff" // blue for non-summer
      }
    ]
  };
}

export default function Q6Chart() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetchQ6().then(setRows);
  }, 
  []);

  if (!rows.length) return <div>Loading…</div>;

  const coastalData = buildChartData(rows, 1);
  const inlandData = buildChartData(rows, 0);

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        min: 0,
        max: 100,
        ticks: { 
          callback: v => `${v}%`
        },
        title: {
          display: true,
          text: "Percentage of annual arrivals"
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
        }
      },
      legend: {
        position: "bottom"
      }
    }
  };

  return (
    <section className="chart-card">
      <h2>Seasonal patterns in inland and coastal tourism</h2>
      <p>
        Seasonality is calculated using the ration of summer and non-summer tourist arrivals. The bars show the percentage share of arrivals in summer months (from June to 
        August) and the rest of the year.
      </p>
      <h4>Coastal counties</h4>
      <Bar data={coastalData} options={options} />

      <h4 style={{ marginTop: "1rem" }}>Inland counties</h4>
      <Bar data={inlandData} options={options} />
    </section>
  );
}
