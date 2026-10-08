# Build the Schengen membership fact table - returns country id, time id, and schengen membership flag  

import pandas as pd
from datetime import date

def build_schengen_membership(time_df, country_df,entry_df): 

    rows = [] #Store the generated records

    # Loop through countries 
    for _, country in country_df.iterrows(): 

        # Find the schengen entry data for the country
        entry = entry_df[entry_df["country_name"]==country.country_name]

        # Skip if no Schengen entry date
        if entry.empty:
            continue 

        # Extract and convert the date
        start_date = pd.to_datetime( 
            entry.iloc[0]["schengen_start_date"]
        ).date() 

        #Loop through time periods (year - month)
        for _, t in time_df.iterrows():

            # Create first day of the month (the dataset is monthly so the exact date is not relevant)
            month_date = date(int(t.year), int(t.month),1)

            # Add one record that indicates schengen membership for this country and month 
            rows.append({
                "country_id": int(country.country_id),
                "time_id": int(t.time_id), 
                "is_schengen": int(month_date>=start_date) # 1 if country was a member in that month, else 0
            })

    # Return the rows as a dataframe
    return pd.DataFrame(rows)

