# Croatian Tourism Analytics

An end-to-end data engineering project: official Croatian tourism statistics are extracted from the Croatian Bureau of Statistics, loaded into a MySQL star schema through a Python ETL pipeline, and served through an Express API to a React dashboard. 
The analytical focus is what happened to Croatian tourism around the country's accession to the Schengen Area in 2023, a natural experiment on real national data.

<!-- TODO: dashboard screenshot here (capture the Schengen chart) -->

Built as university coursework (BSc Computer Science, University of London), January 2026. The brief set the format; the topic, dataset and research questions are my own.

## Research questions

Six questions, each implemented as a SQL view and a dashboard chart:

1. How does tourist volume vary by country of residence over time?
2. How is tourism distributed between coastal and inland counties, and how stable is that distribution?
3. Did the balance between domestic and foreign tourism change after Schengen entry?
4. Do tourists from Schengen countries show different patterns after 2023 than tourists from non-Schengen countries?
5. Did the post-pandemic recovery differ between coastal and inland counties?
6. Is inland tourism less seasonal than coastal tourism?

## Architecture

```
CBS PX-Web CSV (monthly arrivals, county x country)
        |
        v
Python ETL (pandas): clean, reshape wide -> long, build dimensions, surrogate keys
        |
        v
MySQL star schema: county / country / time dimensions + 2 fact tables
        |
        v
SQL views (one per research question, window functions for shares and growth)
        |
        v
Express API (read-only DB user)  -->  React + Chart.js dashboard
```

## Data model

A star schema with the grain stated explicitly:

| Table | Type | Grain |
| --- | --- | --- |
| `county` | dimension | one row per Croatian county, with a derived coastal/inland flag |
| `country` | dimension | one row per country of residence |
| `time` | dimension | one row per (year, month) |
| `tourism_observation` | fact | arrivals per (county, country, month); composite PK enforces the grain |
| `schengen_membership` | fact | a country's Schengen status per month, modelled as time-dependent to avoid update anomalies |

The SQL is split into numbered stages in [`sql/`](sql): schema, constraints, indexes, views, validation queries, and a read-only `web_user` for the API. Design reasoning, the E/R model and the normalization analysis are in [`docs/design.md`](docs/design.md).

## What the pipeline handles

- The source table arrives as a wide CSV (1,738 rows x 275 columns) with year and month encoded in column headers; the ETL reshapes it to long format and strips pre-aggregated rows so the warehouse holds one grain only
- Croatian characters: the raw export is re-encoded to UTF-8 and the database uses `utf8mb4`
- Schengen membership is time-dependent, so it is a fact table keyed by (country, month) rather than a flag on the country dimension
- Within-year shares and indexed growth are computed in views with window functions, so the API and charts stay thin

## Running locally

Prerequisites: MySQL 8, Python 3.10+, Node 18+.

1. **Get the data.** Download table 1.3, ["Tourist arrivals and nights, by country of residence, Republic of Croatia, counties, by months" (BS_TU13)](https://web.dzs.hr/PxWeb/pxweb/en/Turizam/Turizam__Dolasci%20i%20no%C4%87enja%20turista%20u%20komercijalnim%20smje%C5%A1tajnim%20objektima/BS_TU13.px/) from the Croatian Bureau of Statistics PX-Web portal, export as CSV and save it under `data/`. Set its filename in `etl/config.py` (`RAW_CSV_PATH`). The Schengen entry dates in `data/schengen_entry.csv` are included in the repo.
2. **Build the database and load it:**
   ```bash
   pip install -r requirements.txt
   python run_all.py        # prompts for the MySQL password (twice: once for SQL, once for the ETL, unless DB_PASSWORD is set)
   ```
   This converts the CSV encoding, creates the schema, constraints, indexes, runs the ETL, and creates the views.
3. **API:**
   ```bash
   cd web/backend
   npm install
   cp .env.example .env     # fill in the DB credentials
   npm start
   ```
4. **Dashboard:**
   ```bash
   cd web/frontend
   npm install && npm run dev
   ```

`etl/tests.py` checks each ETL stage independently: connectivity, extraction, each transformation, and the loaded row counts.



## About

Data: Croatian Bureau of Statistics (CBS), PX-Web table BS_TU13, 2019-2025. Built by [Petra Ivas](https://ivas.is).
