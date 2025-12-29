const express = require("express"); 
const router = express.Router();
const db = require("../db"); 

// Show available endpoints
router.get("/", (req, res) =>{
  res.json([
    "/api/q1",
    "/api/q2",
    "/api/q3",
    "/api/q4",
    "/api/q5",
    "/api/q5-growth",
    "/api/q6",
    "/api/schengen-entry-year"
  ]); 
});


// Question 1 - tourists by county of residence over time
router.get("/api/q1", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year,country_name, arrivals FROM vw_country_yearly_arrivals ORDER BY year, arrivals DESC"
    ); 
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q1 data fetch failed!" });
  } 
});


// Question 2 - Distribution of tourism between coastal and inland counties 
router.get("/api/q2", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year, coastal_flag, share FROM vw_coastal_yearly_share ORDER BY year, coastal_flag"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q2 data fetch failed!" });
  }
});


// Question 3 - Foreign-domestic ratio before and after schengen entry
router.get("/api/q3", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year, period, ratio FROM vw_foreign_domestic_ratio ORDER BY year"
    ); 
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q3 data fetch failed!" });
  }
});


//Question 4 - Share of foreign arrivals by Schengen membership status
router.get("/api/q4", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year, is_schengen, share FROM vw_schengen_foreign_yearly_share ORDER BY year, is_schengen"
    );
    res.json(rows); 
  } catch {
    res.status(500).json({ error: "Q4 data fetch failed!" });
  } 
});


// Question 5 - Indexed recovery of inland vs. coastal counties 
router.get("/api/q5", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year, coastal_flag, index_value FROM vw_inland_coastal_indexed ORDER BY year, coastal_flag"
      );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q5 data fetch failed!" });
  } 
});


// Question 5c - yearly growth rate of tourist activity
router.get("/api/q5-growth", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT year, coastal_flag, growth_rate FROM vw_inland_coastal_growth_rate ORDER BY year, coastal_flag"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q5 growth rate fetch failed!" });
  }
});



// Question 6 - seasonality of tourism in inland vs. coastal counties
router.get("/api/q6", async (req, res) => {
  try { 
    const [rows] = await db.query(
      "SELECT year, coastal_flag, seasonality_ratio FROM vw_seasonality_intensity ORDER BY year, coastal_flag"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Q6 data fetch failed!" });
  } 
});


// Schengen entry year for Croatia (retrieved from the database)
router.get("/api/schengen-entry-year", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT MIN(t.year) AS year FROM schengen_membership s JOIN country c ON s.country_id = c.country_id JOIN time t ON s.time_id = t.time_id WHERE c.country_name = 'Croatia' AND s.is_schengen = 1"
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Schengen entry year fetch failed!" });
  }
});

module.exports = router;
