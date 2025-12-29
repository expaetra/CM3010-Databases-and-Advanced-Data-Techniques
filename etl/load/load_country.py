# load country data ffrom a dataframe into the database 
# Insert each country is country table, use its ID and name, ignore duplicates

def load_country_dimension(cursor, country_df): 
    # Loop through the rows in the datframe
    for _, row in country_df.iterrows():

        # Execute SQL: INSERT the values, IGNORE if already exists:
        cursor.execute(
            """ 
            INSERT IGNORE INTO country (country_id, country_name)
            VALUES (%s, %s) 
            """,
            # Country ID is an integer, county name is a string 
            (int(row.country_id),row.country_name) 
        ) 