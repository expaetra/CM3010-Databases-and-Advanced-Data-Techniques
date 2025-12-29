# Main ETL script
# Establish data entry point & define execution order of the ETL pipeline
import pandas as pd

# ========== Extract ==========
from etl.extract.load_pxweb import load_pxweb_csv

# ========== Transfrom ==========
from etl.transform.arrivals import transform_arrivals 
from etl.transform.time import build_time_dimension
from etl.transform.county import build_county_dimension
from etl.transform.country import build_country_dimension
from etl.transform.schengen import build_schengen_membership

# ========== Load ========== 
from etl.load.load_county import load_county_dimension
from etl.load.load_country import load_country_dimension
from etl.load.load_time import load_time_dimension 
from etl.load.load_tourism_observation import load_tourism_observations
from etl.load.load_schengen_membership import load_schengen_membership

# ========== DB utils ==========
from etl.db import get_connection, close_connection


# Step by step execution of the ELT pipeline:
def main(): 

    # 1 - etract raw data
    df_raw = load_pxweb_csv()

    # 2 - transform arrivals data to long form
    df_long = transform_arrivals(df_raw) 

    # 3 - build dimension tables 
    time_df = build_time_dimension(df_long)
    county_df =build_county_dimension(df_long)
    country_df = build_country_dimension(df_long)

    # 4 - load the dimension tables
    conn, cursor = get_connection()
    load_county_dimension(cursor, county_df)
    load_country_dimension(cursor, country_df)
    load_time_dimension(cursor, time_df)
    conn.commit()

    # 5 - load tourism observation fact table
    load_tourism_observations(cursor,df_long)
    conn.commit()

    # 6 - build and load Schengen membership fact table
    entry_df = pd.read_csv("data/schengen_entry.csv") # Countries and Schengen entry dates 

    schengen_df = build_schengen_membership(
        time_df=time_df,
        country_df=country_df, 
        entry_df=entry_df
    ) 

    load_schengen_membership(cursor,schengen_df)
    conn.commit()

    # 7 - clean db resources
    close_connection(conn, cursor)

if __name__ == "__main__": 
    main() 
