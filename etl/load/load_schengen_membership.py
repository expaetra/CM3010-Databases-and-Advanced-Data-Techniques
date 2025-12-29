# Loads Schengen membership data into the database - country and time period are needed to know if the country has membership status
# Insertes country ID, time ID, and the Schengen flag

def load_schengen_membership(cursor,schengen_df): 
    for _, row in schengen_df.iterrows():

        #Loop though Schengen membership dataframe, execute SQL
        cursor.execute(
            """ 
            INSERT IGNORE INTO schengen_membership
            (country_id, time_id, is_schengen)
            VALUES (%s, %s, %s)
            """,
            (
                int(row.country_id),
                int(row.time_id),
                int(row.is_schengen) # 0 or 1 (Schengen  or non-Schengen)
            ) 
        )