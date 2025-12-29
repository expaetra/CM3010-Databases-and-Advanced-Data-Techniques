# ETL test runner to test each step independently:
## - Database connectivity
## - CSV extraction
## - Data transfromation
## - Database loading


# =========== DB utils ==========
from etl.db import get_connection, close_connection 

# ========= Extract ===========
from extract.load_pxweb import load_pxweb_csv

# ========== Transfrom ==========
from etl.transform.arrivals import transform_arrivals 
from etl.transform.country import build_country_dimension
from etl.transform.county import build_county_dimension 
from etl.transform.time import build_time_dimension

# ========= Load ==========
from etl.load.load_country import load_country_dimension
from etl.load.load_county import load_county_dimension
from etl.load.load_time import load_time_dimension
from etl.load.load_tourism_observation import load_tourism_observations 


# ========== helper ==========
# Retunr the number of rows in the table
def table_count(cursor, table):
    cursor.execute(f"SELECT COUNT(*) FROM {table}") 
    return cursor.fetchone()[0]


# ========== DB test ==========
# Check if database conenciton can be established
# Check if queries cna be executed
def test_database_connection():
    print("Database connection test... ")

    connection, cursor = get_connection()

    # Check SQL querying 
    cursor.execute("SELECT 1")
    result = cursor.fetchone() 

    #Assert that the db responds correctly 
    assert result == (1,), "Database connection failed!" 
    print("Database connection OK!")

    close_connection(connection, cursor)


# ========== Extraction test ==========
# Test by loading the csv file and check that the rows are returned
def test_extract():
    print("Extract test...") 

    df = load_pxweb_csv() 

    #Assert that data is loaded
    assert len(df) > 0, "CSV is loaded but it contains no rows!" 
    print("Rows loaded: ", len(df))


# ========= Transform test ==========
# Test the transformation logic by verifying the conversion of wide into long format
def test_transform():
    print("Transform test...") 

    df_raw = load_pxweb_csv()
    df_long =transform_arrivals(df_raw) 

    #Assert that the long form contains more rows than original dataset
    assert len(df_long)>len(df_raw), "Transform failed!"
    print("Transformed rows: ", len(df_long))


#========== Load test ==========
# test the loading process by inserting data into tables and verifying row counts
def test_loaders():
    print("Loader test... ")

    connection, cursor = get_connection()

    df_raw = load_pxweb_csv()
    df_long = transform_arrivals(df_raw)

    #Build the tables
    country_df = build_country_dimension(df_long) 
    county_df = build_county_dimension(df_long) 
    time_df = build_time_dimension(df_long)

    # Load dimensions
    load_country_dimension(cursor, country_df)
    load_county_dimension(cursor,county_df)
    load_time_dimension(cursor, time_df) 

    # Load the fact table 
    load_tourism_observations(cursor, df_long) 

    connection.commit()

    # Validate results through row counts
    print("country:", table_count(cursor, "country")) 
    print("county:", table_count(cursor, "county"))
    print("time:", table_count(cursor, "time")) 
    print("tourism_observation:", table_count(cursor, "tourism_observation")) 

    close_connection(connection, cursor) 

#========== Entry points ==========
# Allow running individual tests in the command line
#Use: python etl/test.py followed by the stage to be tested: db, extract, transform, load 
## Example: python etl/test.py extract
import sys

if __name__ == "__main__": 
    if len(sys.argv)<2:
        print("Please specify which test to run!") 

    elif sys.argv[1] == "db":
        test_database_connection() 

    elif sys.argv[1] =="extract": 
        test_extract() 

    elif sys.argv[1] == "transform": 
        test_transform()

    elif sys.argv[1]== "load":
        test_loaders() 
    else:
        print("Available testing options: db, extract, transform, load") 
    