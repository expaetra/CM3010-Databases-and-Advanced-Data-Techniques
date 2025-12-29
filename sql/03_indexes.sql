-- ========== indexes ===========
-- The database is primarily used for reading and aggregation of data rather than frequent updates and inserts. 
-- Indexes make analytical querying faster and more efficient
-- They are created mainly on foreign key columns and commonly used filtering and grouping attributes (time, county type, Schengen membership status)


USE croatian_tourism;

-- ========== Fact table indexes (tourism_observation) ==========
-- indexes on FKs significanlty improve performance of:
--      - JOIN with dimension tables
--      - GROUP BY operations
--      - filtering by county, country, time

CREATE INDEX idx_obs_time 
ON tourism_observation (time_id); 

CREATE INDEX idx_obs_country 
ON tourism_observation (country_id); 

CREATE INDEX idx_obs_county 
ON tourism_observation (county_id);


-- ========= Time dimension indexes ==========
-- Supports time-based analysis like:
--      - yearly aggregations
--      - Analysis of trends over time

CREATE INDEX idx_time_year
ON time (year);


-- ========== Spatial classification indexes ==========
-- Improves performance when comparing inland and coastal counties

CREATE INDEX idx_county_coastal 
ON county (coastal_flag);


-- ========== Classification indexes (policy) ===========
-- support analysis of tourism patterns before and after Schengen entry and across time
CREATE INDEX idx_schengen_status 
ON schengen_membership (is_schengen);

CREATE INDEX idx_schengen_time
ON schengen_membership (time_id); 
