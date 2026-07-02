import streamlit as st
import requests
import pandas as pd

# -----------------------------------
# BACKEND API URL (Render Backend)
# -----------------------------------
API_URL = "https://api-optimizer-ai-backend.onrender.com"


st.set_page_config(
    page_title="API Optimizer AI Dashboard",
    layout="wide"
)

st.title("🚀 API Optimizer AI Dashboard")


# -----------------------------------
# LOAD USERS
# -----------------------------------
@st.cache_data(ttl=30)
def load_users():
    try:
        response = requests.get(f"{API_URL}/users/", timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Failed to connect to Backend API.\n\nError: {e}")
        return []


# -----------------------------------
# LOAD AI INSIGHTS
# -----------------------------------
@st.cache_data(ttl=30)
def load_ai():
    try:
        response = requests.get(f"{API_URL}/ai/insights", timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"❌ Failed to load AI Insights.\n\nError: {e}")
        return []


# -----------------------------------
# FETCH DATA
# -----------------------------------
users = load_users()
ai_data = load_ai()


# -----------------------------------
# METRICS
# -----------------------------------
col1, col2 = st.columns(2)

col1.metric("👥 Total Users", len(users))
col2.metric("🧠 AI Insights", len(ai_data))

st.divider()


# -----------------------------------
# USERS TABLE
# -----------------------------------
st.subheader("📊 Users")

if users:
    users_df = pd.DataFrame(users)
    st.dataframe(users_df, use_container_width=True)
else:
    st.info("No users found in the database.")


st.divider()


# -----------------------------------
# AI INSIGHTS
# -----------------------------------
st.subheader("🧠 AI Insights")

if ai_data:
    for insight in ai_data:
        st.markdown(f"### 🔹 {insight.get('type', 'Unknown').title()}")
        st.write(insight.get("message", "No message"))
        st.success(f"💡 Recommendation: {insight.get('recommendation', 'No recommendation')}")
        st.write("---")
else:
    st.info("No AI insights available.")


# -----------------------------------
# ENDPOINT USAGE CHART
# -----------------------------------
st.subheader("📈 Endpoint Usage")

traffic_found = False

for insight in ai_data:
    if insight.get("type") == "traffic":
        traffic_found = True

        chart_df = pd.DataFrame(
            insight.get("data", []),
            columns=["Endpoint", "Requests"]
        )

        if not chart_df.empty:
            st.bar_chart(chart_df.set_index("Endpoint"))

if not traffic_found:
    st.info("No traffic statistics available.")


# -----------------------------------
# FOOTER
# -----------------------------------
st.divider()

st.caption("🚀 API Optimizer AI | Cloud Monitoring Dashboard")
