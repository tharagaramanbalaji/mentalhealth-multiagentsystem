import os
import streamlit as st
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_google_genai import ChatGoogleGenerativeAI

# Set your Gemini API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyAO_E7vq9JDwZDcEoHRX2zGx0yREasuhJ4"  # Replace this

# Streamlit app setup
st.set_page_config(page_title="Mental Health AI Agent", layout="centered")
st.title("🧠 Mental Health AI Companion")
st.write("Feel free to talk, and I’ll listen. You’re not alone. 💬")

# Setup memory + chat agent
if "memory" not in st.session_state:
    st.session_state.memory = ConversationBufferMemory()
    st.session_state.chat = ConversationChain(
        llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7),
        memory=st.session_state.memory
    )

# Initialize messages in session state if not present
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message("user"):
        st.markdown(msg["user"])
    with st.chat_message("assistant"):
        st.markdown(msg["ai"])

# Input box
user_input = st.chat_input("Drop your text here")
if user_input:
    with st.chat_message("user"):
        st.markdown(user_input)

    response = st.session_state.chat.run(user_input)
    with st.chat_message("assistant"):
        st.markdown(response)

    # Save messages to session state
    st.session_state.messages.append({"user": user_input, "ai": response})