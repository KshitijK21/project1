from database.db import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM organizations"))
        for row in result:
            print(row)
    print("✅ Connected successfully!")
except Exception as e:
    print("❌ Connection failed:", e)