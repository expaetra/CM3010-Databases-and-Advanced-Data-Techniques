-- ========== Referential & domain integrity constraints ==========
-- Define foreign key constraints and domain checks to make sure data is correct, consistent, and ensure referential integrity in the database
-- Executed after the base schema has been created

USE croatian_tourism;

-- ========== Referential integrity: tourism_observation ==========
-- Every tourism observation must reference valid county, country, and time dimension records
-- Deletions restricted to prevent orphaned facts
-- Updates cascade to maintain consistency 

ALTER TABLE tourism_observation 
ADD CONSTRAINT fk_tourism_county
FOREIGN KEY (county_id) REFERENCES county(county_id) 
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE tourism_observation 
ADD CONSTRAINT fk_tourism_country
FOREIGN KEY (country_id) REFERENCES country(country_id)
ON DELETE RESTRICT 
ON UPDATE CASCADE; 

ALTER TABLE tourism_observation
ADD CONSTRAINT fk_tourism_time 
FOREIGN KEY (time_id) REFERENCES time(time_id)
ON DELETE RESTRICT
ON UPDATE CASCADE; 


-- ========== Referential integrity: schengen_membership ===========
-- Schengen membership records must reference valid countries and time periods:

ALTER TABLE schengen_membership
ADD CONSTRAINT fk_schengen_country
FOREIGN KEY (country_id) REFERENCES country(country_id)
ON DELETE RESTRICT
ON UPDATE CASCADE; 

ALTER TABLE schengen_membership 
ADD CONSTRAINT fk_schengen_time
FOREIGN KEY (time_id) REFERENCES time(time_id)
ON DELETE RESTRICT
ON UPDATE CASCADE; 


-- ========== Domain integrity constraints ==========
-- Enforce valid date range and prevent logically invalid data from  being stored

-- Months values represent valid calendar months
ALTER TABLE time
ADD CONSTRAINT chk_valid_month
CHECK (month BETWEEN 1 AND 12); 

-- Tourist arrivals are never negative 
ALTER TABLE tourism_observation 
ADD CONSTRAINT chk_nonnegative_arrivals
CHECK (arrivals>=0); 


-- ========== Uniqueness constraints ===========
-- Prevent duplicates caused by formatting errors or inconsistencies in data ingestion or processing 

ALTER TABLE county
ADD CONSTRAINT uq_county_name UNIQUE (county_name); 

ALTER TABLE country 
ADD CONSTRAINT uq_country_name UNIQUE (country_name); 

 