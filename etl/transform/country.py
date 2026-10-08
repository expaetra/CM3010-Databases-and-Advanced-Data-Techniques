# Make country dimension table from the tourism data
## Extract country names, sort them, assign them country ID

def build_country_dimension(df_long):
    # Select the 'country' column, remove duplicates, sort
    country_df = (
        df_long[["country"]].drop_duplicates().sort_values("country").reset_index(drop=True) 
    )

    #Generate a key 
    country_df["country_id"] = country_df.index+ 1
    # Rename to match the database naming system
    country_df["country_name"] = country_df["country"]

    #Return the ID and name columns - required for the country table
    return country_df[["country_id","country_name"]] 