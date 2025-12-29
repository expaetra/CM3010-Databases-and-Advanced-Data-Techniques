# Insert each county's ID, name, and coastal status (coasstal or inland county) into the datase
# Ignore duplicates

def load_county_dimension(cursor, county_df): 
    for _, row in county_df.iterrows(): 

        # Execute SQL: INSERT values, IGNORE duplicates
        cursor.execute(
            """
            INSERT IGNORE INTO county (county_id, county_name, coastal_flag)  
            VALUES (%s, %s, %s)
            """,
            (
                int(row.county_id), 
                row.county_name,
                int(row.coastal_flag)
            ) 
        )
