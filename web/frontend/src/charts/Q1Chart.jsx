// Imports & chart.js parts 
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

import { fetchQ1 } from "../api";
import "./chart.css";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Q1Chart() {
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState(null);


  // Fetching data
  useEffect(() => {
    fetchQ1().then(data =>{
      setRows(data); 
      const years = [...new Set(data.map(r => r.year))].sort(
        (a,b) => a-b
      );
      setYear(years[years.length - 1]); // Set to latest year
    });
  }, 
[]);

  // slider years 
  const years = useMemo(
    () => [...new Set(rows.map(r => r.year))].sort((a, b) => a - b),
    [rows]
  );

  // top 10 countries for the selected year
  const top10 = useMemo(() => { 
    if (year === null) return [];

    return rows.filter(r => r.year===year).map(r => ({ ...r, arrivals: Number(r.arrivals)})).sort((a, b) => b.arrivals - a.arrivals).slice(0, 10);
  }, [rows, year]);

  if (!rows.length || year===null) {
    return <div>Loading chartdata…</div>;
  }

  const chartOptions = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: {
          callback: v => Number(v).toLocaleString()  
        }
      }
    }
  };
  return (
    <section className="chart-card">
      <header>
        <h2>Tourist volume by country and year</h2>
        <p>Top 10 countries by arrivals for the selected year. Use the slider to change the year.</p>
      </header>

      <div className="chart-slider">
        <div className="range-labels">
          <strong>Year</strong>
          <strong>{year}</strong>
        </div>

        <input
          type="range"
          min={years[0]}
          max={years[years.length - 1]}
          value={year} 
          onChange={e => setYear(Number(e.target.value))} 
        />
        
        <div className="range-labels">
          <span>{years[0]}</span>
          <span>{years[years.length-1]}</span>
        </div>
      </div>

      <div className="chart-area">
        <Bar
          data={{
            labels: top10.map(d => d.country_name),
            datasets: [
              {
                label: "Arrivals", 
                data: top10.map(d => d.arrivals)
              }
            ]
          }}
          options = {chartOptions} 
        />
      </div> 
    </section>
  );
}
