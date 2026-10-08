# Transformation logic for the tourism arrivals data - clean, filter, reshape
### Rename the columns to match db schema
### Remove aggregate rows
### Select only monthly data
### Reshape the dataset from wide to long form
### Extract year & month values

import pandas as pd

# Rename the original column to standardized internal names
def rename_dimensions(df): 
    return df.rename(columns={
        "Spatial unit": "county",
        "Countries": "country"
    }) 

# Ensure the dimension columns are not missing
def validate_required_columns(df): 
    required = {"county", "country"}
    missing = required - set(df.columns)

    if missing: 
        raise  ValueError(f"Missing columns: {missing} !")
    

# Remove aggregate rows (totals) - tables will contain only atomic values
def remove_aggregate_rows(df): 
    return df[~df["country"].astype(str).str.contains("total", case=False, na=False)] 


# Selects only monthly arrivals columns - no nights, averages, totals
def select_monthly_arrivals_columns(df):
    arrivals_cols = [
        col for col in df.columns 
        if col.endswith("Tourist arrivals") and ".-" not in col
    ] 

    if not arrivals_cols: 
        raise ValueError ("Monthly arrivals columns not found!")
    
    return arrivals_cols


# Reshape dataset from wide format to long format
def reshape_wide_to_long(df,arrivals_cols):
    return df.melt(id_vars=["county", "country"], value_vars=arrivals_cols, var_name="period", value_name="arrivals") 


# Extract year & month values from the period column, enforce data type
def extract_time_fields(df_long):
    period = df_long["period"].astype(str) #Convert to string (pattern extraction)

    # Extract the year & month from the period strings
    df_long["year"] = period.str.extract(r"^(\d{4})") # 4 digits for the year
    df_long["month"] = period.str.extract(r"^\d{4}\s+(\d{2})") # 4 digits to skip the year, add one space, get the next 2 digits = month

    # Convert year, month, & arrivals to numeric
    df_long["year"] = pd.to_numeric(df_long["year"], errors="coerce") 
    df_long["month"] = pd.to_numeric(df_long["month"], errors="coerce")
    df_long["arrivals"] = pd.to_numeric(df_long["arrivals"], errors="coerce") 

    # Check & remove rows with missing or invalid
    df_long.dropna(subset = ["year", "month", "arrivals"], inplace=True) 

    # Convert numeric to integers to insert into database
    df_long["year"] = df_long["year"].astype(int)
    df_long["month"] = df_long["month"].astype(int)
    df_long["arrivals"] =df_long["arrivals"].astype(int)
 
    return df_long


# Run the pipeline
def transform_arrivals(df):
    df = rename_dimensions(df)
    validate_required_columns(df)
    df = remove_aggregate_rows(df)
    arrivals_cols = select_monthly_arrivals_columns(df)
    df_long = reshape_wide_to_long(df, arrivals_cols)
    df_long =extract_time_fields(df_long)
    return  df_long 
