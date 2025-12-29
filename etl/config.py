# Configuration values for the etl pipeline
# Centralize file paths, encoding, & database connection params
import os
import getpass

## ========== CSV ========= 
# Path to the original document
RAW_CSV_PATH = "data/BS_TU13_20251222-173735.csv"

# Path to the UTF-8 encoded file
CSV_PATH = "data/encoded_file.csv"

# Encoding for Croatian characters
CSV_ENCODING ="utf-8" 

# Skip metadata rows
CSV_SKIPROWS=2


## ======== DB CONFIGURATION ========== 
# Read db password from environment variable
DB_PASSWORD = os.getenv("DB_PASSWORD") 

# If password not set, prompt user to set password
if DB_PASSWORD is None:
    DB_PASSWORD = getpass.getpass("Enter MySQL password:  ") 

# Db connection parameters
DB_CONFIG = {
    "host": "localhost", 
    "user": "root", 
    "password": DB_PASSWORD,
    "database": "croatian_tourism" 
} 
