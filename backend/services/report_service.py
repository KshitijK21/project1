import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")


def generate_recommendations(profile_data: dict, warehouse_data: dict) -> list:
    prompt = f"""
You are a business intelligence analyst. Based on the following data profile and schema, provide 3-5 short, actionable business recommendations.

Data Health: {profile_data}
Schema: {warehouse_data}

Return each recommendation as a short bullet point, one per line, no numbering, no markdown.
"""
    response = model.generate_content(prompt)
    lines = [line.strip("-• ").strip() for line in response.text.strip().split("\n") if line.strip()]
    return lines


def generate_executive_summary(profile_data: dict, warehouse_data: dict, kpis: list) -> str:
    prompt = f"""
Write a concise executive summary (3-4 sentences) for a business dashboard, based on:

Data Health Score: {profile_data.get('health_score')}
Key Measures: {[k['measure'] for k in kpis]}
KPI values: {kpis}

Keep it professional, non-technical, and suitable for a business stakeholder.
"""
    response = model.generate_content(prompt)
    return response.text.strip()