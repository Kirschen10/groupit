import pyodbc

connection_string = (
    'DRIVER={ODBC Driver 18 for SQL Server};'
    'SERVER=tcp:groupitserver.database.windows.net,1433;'
    'DATABASE=groupit_db;'
    'UID=groupit_admin;'
    'PWD=Group123it;'
    'Encrypt=yes;'
    'TrustServerCertificate=no;'
    'Connection Timeout=30;'
)

# Create a connection
connection = pyodbc.connect(connection_string)
cursor = connection.cursor()

# Execute a query to get the list of tables
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")

# Fetch all results from the executed query
tables = cursor.fetchall()

# Close the cursor and connection
cursor.close()
connection.close()
