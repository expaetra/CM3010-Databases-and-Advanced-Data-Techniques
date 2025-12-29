-- ========= Croatian tourism database schema ==========
-- Define the relational schema for the project. Create all tables and primary keys
USE croatian_tourism;

-- ========== Database initialization ==========
-- Drop the database if exists to allow a clean rebuild of the schema.
-- Set encoding to be appropriate for Croatian characters
DROP DATABASE IF EXISTS croatian_tourism;
CREATE DATABASE croatian_tourism
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE croatian_tourism;


-- ========== Dimension tables ==========

-- County dimension
-- Represents a Croatian territoral unit (counties + Zagreb)
-- County_id is a surrogate key generated in ETL transfromation stage
-- Coastal classification is a derived static attribute that indicates whether a county has a coastline or not
CREATE TABLE county (
    county_id INT PRIMARY KEY,
    county_name VARCHAR(120) NOT NULL,
    coastal_flag BOOLEAN NOT NULL 
);


-- Country dimension
-- Represents tourist's country of residence
-- Country ID set in the ETL transformation stage as surrogate key
CREATE TABLE country (
    country_id INT PRIMARY KEY,
    country_name VARCHAR(120) NOT NULL
);


-- Time dimension
-- Represents a monthly time period. Each row corresponds to a unique pair of year and month
-- Surrogate key time_id is geenrated in ETL. UNIQUE ensures the combination appears only once
CREATE TABLE time (
    time_id INT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    UNIQUE (year, month)
);



-- ========== Fact tables ==========

-- Tourism Observation fact table
-- Central fact table of the schema: each row represents the number of tourist arrivals for a specific county, country, and month
-- Coomposite primary key enforces the grain of the data & prevents duplicates
CREATE TABLE tourism_observation (
    county_id INT NOT NULL,
    country_id INT NOT NULL,
    time_id INT NOT NULL,
    arrivals INT NOT NULL,
    PRIMARY KEY (county_id, country_id, time_id)
); 

-- Schengen Membership fact table
-- Time-dependant classification of country's Schengen status (indicates whether a country is a member in a given month)
-- The composite primary key ensures one record per country and a time period
CREATE TABLE schengen_membership (
    country_id INT NOT NULL,
    time_id INT NOT NULL,
    is_schengen BOOLEAN NOT NULL,
    PRIMARY KEY (country_id, time_id)
); 