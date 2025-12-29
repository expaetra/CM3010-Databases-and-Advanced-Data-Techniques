-- ========== Validation queries ==========
-- Check that the schema is successfully created and data is loaded. Confirm functionality of foreign key relationships and constraints and confirm successful aggregation.

-- use the correct database
USE croatian_tourism;

-- List all tables to confirm the schema creation
SHOW TABLES;

-- Confirm tables are populated: check how much data exists in tables
SELECT 'county' AS table_name, COUNT(*) AS row_count FROM county
UNION ALL 
SELECT 'country', COUNT(*) FROM country
UNION ALL 
SELECT 'time', COUNT(*) FROM time
UNION ALL
SELECT 'tourism_observation', COUNT(*) FROM tourism_observation
UNION ALL
SELECT 'schengen_membership', COUNT(*) FROM schengen_membership;

-- Inspect county dimension: structure & attributes
SELECT * 
FROM county
ORDER BY county_name
LIMIT 10;

-- inspect country dimension
SELECT *
FROM country
ORDER BY country_name
LIMIT 10; 

-- Inspect time dimension
SELECT *
FROM time 
ORDER BY year, month
LIMIT 12;

-- View some tourism observations
SELECT *
FROM tourism_observation
LIMIT 10; 

-- Verify that all foreign keys work correctly
SELECT
    o.arrivals,
    c.county_name,
    co.country_name,
    t.year, 
    t.month
FROM tourism_observation o
JOIN county c ON o.county_id = c.county_id
JOIN country co ON o.country_id = co.country_id
JOIN time t ON o.time_id = t.time_id
LIMIT 10;

-- Aggregation check: total tourist arrivals per year
SELECT
    t.year,
    SUM(o.arrivals) AS total_arrivals
FROM tourism_observation o
JOIN time t ON o.time_id = t.time_id
GROUP BY t.year
ORDER BY t.year; 


-- Coastal vs. inland: compare tourism volume between counties based on their coastal flag
SELECT
    c.coastal_flag, 
    SUM(o.arrivals) AS total_arrivals
FROM tourism_observation o 
JOIN county c ON o.county_id = c.county_id
GROUP BY c.coastal_flag;  

-- check Schengen membership records 
SELECT
    co.country_name,
    t.year,
    t.month,    
    s.is_schengen
FROM schengen_membership s
JOIN country co ON s.country_id = co.country_id
JOIN time t ON s.time_id =t.time_id
ORDER BY co.country_name, t.year, t.month
LIMIT 20; 


-- Confirm Croatia's historical Schengen membership status (0 until january 2023)
SELECT
  t.year,
  t.month,
  s.is_schengen
FROM schengen_membership s
JOIN country c ON s.country_id = c.country_id
JOIN time t ON s.time_id = t.time_id
WHERE c.country_name = 'Croatia' 
ORDER BY t.year, t.month; 


-- Constraint testing: this should fail 
INSERT INTO tourism_observation (county_id, country_id, time_id, arrivals)
VALUES (1,1,1,-5);

