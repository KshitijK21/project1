import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")


def generate_sql(question: str, table_name: str, columns: list) -> str:
    prompt = f"""
You are a SQL expert. Convert the following natural language question into a valid PostgreSQL SELECT query.

Table name: {table_name}
Columns: {', '.join(columns)}

Rules:
- Only generate SELECT statements. Never generate INSERT, UPDATE, DELETE, DROP, or ALTER.
- Always wrap every column name in double quotes exactly as given (e.g. "Sales", "Region"), since PostgreSQL is case-sensitive for mixed-case column names.
- Return ONLY the raw SQL query, no explanation, no markdown formatting, no backticks.

Question: {question}
"""
    response = model.generate_content(prompt)
    sql = response.text.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()
    return sql


def explain_result(question: str, result: list) -> str:
    prompt = f"""
Explain the following query result in simple, clear natural language for a business user.

Question asked: {question}
Result data: {result}

Keep it to 2-3 sentences, no technical jargon.
"""
    response = model.generate_content(prompt)
    return response.text.strip()