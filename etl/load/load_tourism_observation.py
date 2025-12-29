# Load tourism observation data into the fact table: country, county, and time
# Joins the corresponding tables using foreign keys and inserts arrivals
# Ignores duplicates

def load_tourism_observations(cursor, df_long): 
    for _, row in df_long.iterrows():

        # Execute SQL
        cursor.execute(
            # county id, country id, time id, numbers of tourist arrivals
            """
            INSERT IGNORE INTO tourism_observation
            (county_id, country_id, time_id, arrivals)
            SELECT
                c.county_id,
                co.country_id,
                t.time_id,
                %s
            FROM county c 
            JOIN country co ON co.country_name = %s 
            JOIN time t ON t.year = %s AND t.month = %s
            WHERE c.county_name = %s 
            """, 
            (
                int(row.arrivals),
                row.country,
                int(row.year),
                int(row.month),
                row.county
            )
        )

