# Construct the county dimension table
## Extract county names, assign them keys, add flag to specify whether they are coastal or inland

import pandas as pd


## ========== Define coastal counties ==========

COASTAL_COUNTIES = {
    "Istria",
    "Primorje-Gorski kotar",
    "Lika-Senj", 
    "Zadar",
    "Šibenik-Knin",
    "Split-Dalmatia",
    "Dubrovnik-Neretva"
}

# Check if the county is coastal or inland
def is_coastal(county_name):
    # Check if it matches any entity in the coastal list
    for coastal_county in COASTAL_COUNTIES:
        if coastal_county in county_name: 
            return 1
    # If not found, return inland
    return 0

## ===============================================


# Build the county table
def build_county_dimension(df_long):
    # Select county column, remove duplicates, exclude country-level rows, sort, reset the index
    county_df= (
        df_long[["county"]].drop_duplicates().query("county!='Croatia'").sort_values("county").reset_index(drop=True)
    )

    # Assign keys to counties
    county_df["county_id"] = county_df.index + 1

    # Rename to match the database naming system
    county_df["county_name"] = county_df["county"]

    # Run the coastal check
    county_df["coastal_flag"] = county_df["county"].apply(is_coastal)

    # Return the columns required for the county table
    return county_df[["county_id", "county_name", "coastal_flag"]]
