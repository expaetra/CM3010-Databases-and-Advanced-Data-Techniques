// imports and Chart.js parts
import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchQ2 } from "../api";
import "./Chart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Store the data returned by the api. Row = arrivals for a given year and county type (coastal/inland)
export default function Q2Chart() {
  const [rows, setRows] = useState([]);
  // Fetch data when component mounts
  useEffect(() => {
    fetchQ2().then(setRows).catch(console.error);
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!rows.length) return null;

    const years = [...new Set(rows.map(r => r.year))].sort((a,b) => a - b);

    // data for coastal and inland counties - SQL returns proportions, convert to %
    const coastal = years.map(
      y => rows.find(r => r.year ===y && r.coastal_flag === 1)?.share * 100
    );

    const inland = years.map(
      y => rows.find(r => r.year ===y && r.coastal_flag === 0)?.share * 100
    );

    // build chart data object
    return {
      labels: years,
      datasets: [
        {
          label: "Coastal counties",
          data: coastal,
          fill: true, // Fill blue to bottom - coastal counties
          backgroundColor: "rgba(90, 165, 226, 0.6)",
          borderColor: "rgba(47, 119, 212, 1)"
        },
        {
          label: "Inland counties", 
          data: inland,
          fill: "-1", // Fill green on top for coastal counties share
          backgroundColor: "rgba(35, 189, 104, 0.6)",
          borderColor: "rgba(20, 150, 106, 1)" 
        }
      ]
    };
  }, [rows]);

  if (!chartData) return <div>Loading chart data…</div>;

  return (
    <section className="chart-card">
      <h2>Tourism distribution: coastal vs. inland counties</h2>
      <p>
        Share of total tourist arrivals by county type. Values sum to 100% each year.
      </p>
      <div className="chart-area">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                stacked: true,
                min: 0, 
                max: 100,
                ticks: {
                  callback: v => `${v}%` 
                }
              },
              x: {
                stacked: true
              }
            }, 
            plugins: {
              tooltip: {
                callbacks: {
                  label: ctx =>
                    `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`  
                }
              }
            }
          }}
        />
      </div>
    </section>
  ); 
}