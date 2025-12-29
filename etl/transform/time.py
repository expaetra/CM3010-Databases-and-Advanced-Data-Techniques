# Build a reusable time dimension table
## Table contains all unique year-month combinations inn the dataset and assigns each and ID

def build_time_dimension(df_long): 

    #Select tyear & month, remove duplicates, sort chronologically
    time_df = (
        df_long[["year", "month"]].drop_duplicates().sort_values(["year","month"]).reset_index(drop=True) 
    )

    # Assign each combination a surrogate key
    time_df["time_id"]=time_df.index + 1

    # Return the table
    return time_df