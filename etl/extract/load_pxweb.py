#Load tourism data from the px-web system =  reads the CSV file, performs basic cleaning by normalizing column names
import pandas as pd 
from etl.config import CSV_PATH, CSV_ENCODING, CSV_SKIPROWS

def load_pxweb_csv():
    df = pd.read_csv(
        CSV_PATH, 
        encoding=CSV_ENCODING,
        skiprows=CSV_SKIPROWS
    )

    # Convert column names to strings
    df.columns = df.columns.astype(str) 

    # Remove whitespaces 
    df.columns = df.columns.str.strip() 

    # Remove bom
    df.columns = df.columns.str.replace("\ufeff", "", regex=False) 

    return df 