# Main script to rebuild the database and run the ETL pipeline
# Automate the setup process. 
##Steps:
## - Convert the raw csv to utf8 encoding
## - Create the database schema, constraints, indexes
## - Run the ETL pipeline to load all data
## - Create database viwes after the data is loaded:

import subprocess
import getpass

# csv encoding helper
from scripts.convert_csv_to_utf8 import convert_csv_to_utf8

# File paths
from etl.config import RAW_CSV_PATH, CSV_PATH


# ========== SQL authentication ===========
# Prompt user for password
password=getpass.getpass("MySQL password: ")
# Build the mysql command using the password entered at runtime
mysql = f'mysql -u root -p"{password}"'


# Run a shell command that exits if an error occurs
def run(cmd):
    print(f"\n>>> {cmd}")
    subprocess.run(cmd, shell=True,check=True) 


# ========== Step 1 - convert file =========
# Check if the file has already been converted to utf-8, convert if needed
convert_csv_to_utf8(
    input_path=RAW_CSV_PATH, 
    output_path=CSV_PATH
) 

# ========== Step 2 - Build database structure ==========

# Create tables
run(f"{mysql} < sql/01_schema.sql") 

# Add foreign keys constraints
run(f"{mysql} < sql/02_constraints.sql") 

# Create indexes
run(f"{mysql} < sql/03_indexes.sql")


# ========= Step 3 - Run ETL pipeline ========== 
#Run the etl pipeline as a module so package imports work correctly
run("python -m etl.etl_transform_load")


# =========== Step 4 - Create database views ===========
# Views are created only after all data has been loaded because they depend on populated tables
run(f"{mysql} < sql/04_views.sql") 


print("\nDatabse rebuilt & ETL pipeline completed successfully! ")