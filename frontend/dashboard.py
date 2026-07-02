import os

import streamlit as st
import requests
import pandas as pd

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000").rstrip("/")


st.set_page_config(page_title="API Optimizer AI Dashboard", layout="wide")

st.title("🚀 API Optimizer AI Dashboard")


# -------------------------
# LOAD DATA FROM BACKEND
# -------------------------
@st.cache_data
def load_users():
    try:
        res = requests.get(f"{API_URL}/users/", timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception:
        st.warning("Backend API is unavailable. Make sure the backend service is running.")
        return []


@st.cache_data
def load_ai():
    try:
        res = requests.get(f"{API_URL}/ai/insights", timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception:
        st.warning("AI insights endpoint is unavailable.")
        return []


# -------------------------
# DATA
# -------------------------
users = load_users()
ai_data = load_ai()


# -------------------------
# METRICS
# -------------------------
col1, col2 = st.columns(2)

col1.metric("👥 Total Users", len(users))
col2.metric("🧠 AI Insights", len(ai_data))


st.divider()


# -------------------------
# USERS TABLE
# -------------------------
st.subheader("📊 Users Data")

df = pd.DataFrame(users)
st.dataframe(df)


st.divider()


# -------------------------
# AI INSIGHTS
# -------------------------
st.subheader("🧠 AI Insights Engine")

for item in ai_data:
    st.write("### 🔹", item["type"])
    st.write(item["message"])
    st.write("💡", item.get("recommendation", "N/A"))
    st.write("---")


# -------------------------
# SIMPLE CHART
# -------------------------
st.subheader("📈 Endpoint Usage (AI Summary)")

if ai_data:
    for item in ai_data:
        if item["type"] == "traffic":
            chart_data = pd.DataFrame(item["data"], columns=["endpoint", "count"])
            st.bar_chart(chart_data.set_index("endpoint"))