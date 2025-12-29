# Loads time - unique combinations of time ID, year, & month
# Ignore duplicates

def load_time_dimension(cursor, time_df): 
    for _, row in time_df.iterrows():

        #Execute SQL 
        cursor.execute(
            """
            INSERT IGNORE INTO time (time_id, year, month) 
            VALUES (%s, %s, %s)
            """,
            (
                int(row.time_id),
                int(row.year), 
                int(row.month)
            )
        )