# Database utils - connection logic
import mysql.connector
from etl.config import DB_CONFIG 

# Create and return a msql db connection and cursor
def get_connection():
    # conn - active connection
    conn = mysql.connector.connect(
    host=DB_CONFIG["host"],
    user=DB_CONFIG["user"],
    password=DB_CONFIG["password"], 
    database=DB_CONFIG["database"],
    charset="utf8mb4",
    use_unicode=True 
)

    #Cursor object for executing SQL statements
    cursor = conn.cursor()
    return conn, cursor

# Close the connection
def close_connection(conn,cursor):
    cursor.close()
    conn.close()

