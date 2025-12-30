import { useState } from "react";
import Q1Chart from "./charts/Q1Chart"; 
import Q2Chart from "./charts/Q2Chart";
import Q3Chart from "./charts/Q3Chart";
import Q4Chart from "./charts/Q4Chart";
import Q5Chart from "./charts/Q5Chart";
import Q6Chart from "./charts/Q6Chart";

import "./app.css";

export default function App(){
  const [activeChart, setActiveChart]=useState("q1");
  return (
    <div className="page">
      <header className="header">
        <h1>Croatian Tourism Dashboard</h1>
        <p>
          Visual summary of tourism trends in Croatia based on official data. 
        </p>
      </header>
      <div className="dashboard">
        <aside className="sidebar">
          <button onClick={()=>setActiveChart("q1")} className={activeChart==="q1" ? "active" : ""}>
            Q1 ⬩ Country of origin
          </button>

          <button onClick={() => setActiveChart("q2")}className={activeChart === "q2" ? "active" : ""}>
            Q2 ⬩ Coastal vs. inland
          </button>

          <button onClick={() => setActiveChart("q3")} className={activeChart === "q3" ? "active" : ""}>
            Q3 ⬩ Domestic vs. foreign
          </button>

          <button onClick={() => setActiveChart("q4")} className={activeChart === "q4" ? "active" : ""}>
            Q4 ⬩ Schengen vs. non-Schengen
          </button>

          <button onClick={() => setActiveChart("q5")} className={activeChart === "q5" ? "active" : ""}>
            Q5 ⬩ Indexed growth
          </button>

          <button onClick={() => setActiveChart("q6")} className={activeChart === "q6" ? "active" : ""}>
            Q6 ⬩ Seasonality
          </button>
        </aside>

        <main className="content">
          {activeChart === "q1" && <Q1Chart />} 
          {activeChart === "q2" && <Q2Chart />}
          {activeChart === "q3" && <Q3Chart />}
          {activeChart === "q4" && <Q4Chart />}
          {activeChart === "q5" && <Q5Chart />}
          {activeChart === "q6" && <Q6Chart />}
        </main>
      </div>
    </div>
  );
}
