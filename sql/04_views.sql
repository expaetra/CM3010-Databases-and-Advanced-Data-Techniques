-- #------------------ MY CODE --------------------#
USE croatian_tourism;

-- ========== Q1: Tourist volume by country of residence over time ==========
-- Research question: "How does tourist volume vary by country of residence over time?"
-- Aggregate the fact table at the year x country level
-- Grain: one row per (year, country_name)
-- measure: total arrivasl (all countries x all months)

CREATE OR REPLACE VIEW vw_country_yearly_arrivals AS 
SELECT
    t.year AS year, 
    c.country_name AS country_name,
    CAST(
        SUM(f.arrivals) AS DECIMAL(12,0)
        ) AS arrivals
FROM tourism_observation AS f
JOIN country AS c ON f.country_id = c.country_id
JOIN time AS t ON f.time_id = t.time_id 
GROUP BY t.year, c.country_name; 


-- ========== Q2: Coastal vs. inland tourism concentration over time ===========
-- Research question:"How is tourism distributed between coastal and inland counties, and how stable is this distribution over time?
--   Aggregates arrivals at year x coastla_flag level to compare two groups: coastal counties & inland counties
--   Grain: one row per (year, coastal_flag) 
--   Measure: total arrivals(summed across counties within each group)

CREATE OR REPLACE VIEW vw_coastal_yearly_arrivals AS 
SELECT 
    t.year AS year,
    c.coastal_flag AS coastal_flag,
    CAST(
        SUM(f.arrivals) AS DECIMAL(12,0)) 
        AS arrivals
FROM tourism_observation AS f
JOIN county AS c ON f.county_id = c.county_id 
JOIN time AS t ON f.time_id = t.time_id
GROUP BY t.year, c.coastal_flag; 

-- ========== Q2b, focus on stabiity and distribution ==========
-- convert absolute arrivlas into shares (within year percentages)
-- Makes it easier to evaluate, e.g if coastal share stays constant over time = stable distribution, if there is a meaningful change of shares = structural change
CREATE OR REPLACE VIEW vw_coastal_yearly_share AS 
SELECT
    year,
    coastal_flag, 
    arrivals,
    CAST(
        arrivals / NULLIF(SUM(arrivals) OVER (PARTITION BY year), 0) AS DECIMAL(10,6)
        ) AS share
FROM vw_coastal_yearly_arrivals; 


-- ========== Helper: domestic & foreign yearly arrivals ==========
CREATE OR REPLACE VIEW vw_domestic_foreign_yearly_arrivals AS
SELECT 
    t.year AS year,
    CASE
        WHEN c.country_name='Croatia' THEN 'Domestic'
        ELSE 'Foreign'
    END AS visitor_type, 
    SUM(f.arrivals) AS arrivals
FROM tourism_observation AS f
JOIN time AS t ON f.time_id = t.time_id
JOIN country AS c ON f.country_id = c.country_id
GROUP BY t.year, visitor_type;


-- ========== Q3: Foreign-to-domestic tourism ratio ==========
-- Research question: "Are there observable changes in the balance between domestic and foreign tourism in Croatia before and after its Schengen entry in 2023?" 
-- Produce a yearly ratio: ratio > 1  = foreign arrivals exceed domestic, ratio < 1 = domestic arrivals exceed foreign arrivals
-- Use NULLIF to avoid division
CREATE OR REPLACE VIEW vw_foreign_domestic_ratio AS
SELECT
    year,
    CASE 
        WHEN year < 2023 THEN 'Pre-Schengen'
        ELSE 'Post-Schengen'
    END AS period,
    CAST( 
        SUM(CASE WHEN visitor_type = 'Foreign'  THEN arrivals ELSE 0 END) /
        NULLIF(SUM(CASE WHEN visitor_type= 'Domestic' THEN arrivals ELSE 0 END), 0)
        AS DECIMAL(10,6)
        ) AS ratio
FROM vw_domestic_foreign_yearly_arrivals
GROUP BY year;


-- ========== Q4: Share of foreign arrivals by Schengen membership by year ==========
-- Research question:"Do tourists from Schengen-member countries exhibit different tourism patterns after 2023 compared to tourists from non-Schengen countries?" 
-- For each year divide foreign arrivals into two groups: 1. is_schengen=1 (Schengen members) & 2. is_schengen=0 (non Schengen members or not recorded then compute shares per year
-- If Schengen membership is missing for a country in a year we treat it as 0.

CREATE OR REPLACE VIEW vw_schengen_foreign_yearly_share AS
SELECT
    year,
    is_schengen,
    CAST(
        arrivals/NULLIF(SUM(arrivals) OVER (PARTITION BY year),0) AS DECIMAL(10,6)
        )AS share
FROM (
    SELECT
        t.year AS year,
        COALESCE(s.is_schengen, 0) AS is_schengen,
        SUM(f.arrivals) AS arrivals
    FROM tourism_observation AS f
    JOIN time AS t ON f.time_id = t.time_id
    JOIN country AS c ON f.country_id = c.country_id
    LEFT JOIN schengen_membership AS s ON f.country_id = s.country_id
        AND f.time_id = s.time_id
    WHERE c.country_name <> 'Croatia'
    GROUP BY
        t.year,
        COALESCE(s.is_schengen, 0)
)AS x;



-- ========== Q5: Yearly inland vs coastal arrivals (absolute)
-- Research question: "Did the post pandemic recovery differ between inland and coastal counties following Croatia's Schengen accession in 2023?"
-- reuse view form Q2
-- =========================================================
CREATE OR REPLACE VIEW vw_inland_coastal_yearly AS
SELECT
    year,
    coastal_flag,
    arrivals 
FROM vw_coastal_yearly_arrivals;


-- ========== Q5b: Indexed growth of inland vs. coastal arrivals (baseline 2019) 
--   2019 is start of the data, also last pre-pandemic tourism year,w hich makes it meaningful to evaluate recovery
--   index_value=100 = same as baseline year
--   index_value=110 = 10% above baseline
CREATE OR REPLACE VIEW vw_inland_coastal_indexed AS
WITH base AS (
    SELECT
        coastal_flag,
        arrivals AS base_arrivals
    FROM vw_inland_coastal_yearly
    WHERE year=2019
)
SELECT
    y.year,
    y.coastal_flag,
    CAST(
        (y.arrivals / NULLIF(b.base_arrivals, 0)) * 100 AS DECIMAL(10,2)
        ) AS index_value 
FROM vw_inland_coastal_yearly AS y
JOIN base AS b ON y.coastal_flag = b.coastal_flag;


-- ========== Q5c: Yearly growth rate ===========
-- To measure speed of recovery rather than level:
-- growth_rate:0  => expansion
-- growth_rate<0  => contraction

CREATE OR REPLACE VIEW vw_inland_coastal_growth_rate AS
SELECT
    year,
    coastal_flag,
    CAST(
        (index_value -
         LAG(index_value) OVER (PARTITION BY coastal_flag
             ORDER BY year)) /
        NULLIF(
            LAG(index_value) OVER (PARTITION BY coastal_flag
                ORDER BY year), 0)
        AS DECIMAL(10,4)
    ) AS growth_rate
FROM vw_inland_coastal_indexed;


-- ========== Q6 Seasonality intensity, by coastal vs. inland counties ==========
-- Research question: "Is inland tourism less seasonal than coastal tourism?"
-- compute a seasonality intensity ratio by comparing summer arrivals (months June, July, August) to non summer arrivals per year and for each county type
-- Higher ratio = stronger dependence on summer tourism, lower ratio = more even distribution of tourism across the year 

CREATE OR REPLACE VIEW vw_seasonality_intensity AS 
WITH seasonal_totals AS (
    SELECT
        t.year AS year,
        c.coastal_flag AS coastal_flag,
        CASE
            WHEN t.month IN (6,7,8) THEN 'Summer'
            ELSE 'Non-summer'
        END AS season,
        SUM(f.arrivals) AS arrivals
    FROM tourism_observation AS f
    JOIN time AS t ON f.time_id = t.time_id
    JOIN county AS c ON f.county_id = c.county_id
    GROUP BY t.year, c.coastal_flag, season
)
SELECT
    year,
    coastal_flag,
    CAST(
        SUM(CASE WHEN season ='Summer' THEN arrivals ELSE 0 END) /
        NULLIF(SUM(CASE WHEN season = 'Non-summer' THEN arrivals ELSE 0 END),0)
        AS DECIMAL(10,4)
        ) AS seasonality_ratio
FROM seasonal_totals
GROUP BY year, coastal_flag;

-- #--------------------------------------#