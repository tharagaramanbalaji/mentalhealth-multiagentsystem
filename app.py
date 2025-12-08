import os
import streamlit as st
from dotenv import load_dotenv
from agents.therapist import get_therapist_chain
from agents.mindfulness import get_mindfulness_chain
from agents.knowledge import get_knowledge_chain
from agents.journal import get_journal_chain
from router import route_user_input
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

# If a key is found, set it for LangChain to use. Otherwise, show an error.
if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key
else:
    st.error("GOOGLE_API_KEY not found. Please create a .env file and add your API key to it.")
    st.stop()


# Streamlit page config
st.set_page_config(page_title="Multi Agent Mental Health Assistant", layout="centered")
st.title("Multi Agent Mental Health Assistant")
st.write("Talk your thoughts out")

# Initialize agents
if "agents" not in st.session_state:
    st.session_state.agents = {
        "therapist": get_therapist_chain(),
        "mindfulness": get_mindfulness_chain(),
        "knowledge": get_knowledge_chain(),
        "journal": get_journal_chain()
    }

# Initialize messages
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message("user"):
        st.markdown(msg["user"])
    with st.chat_message("assistant"):
        st.markdown(msg["ai"])

# Input box
user_input = st.chat_input("How can I help you today?")
if user_input:
    with st.chat_message("user"):
        st.markdown(user_input)
    
    with st.status("Selecting the right agent for you...", expanded=False) as status:
        # Let the AI decide which agent to use
        agent_key = route_user_input(user_input)
        status.update(label=f"Using {agent_key.title()} agent to respond...", state="running")
        
        # Get response from the chosen agent
        agent = st.session_state.agents[agent_key]
        response = agent.run(user_input)
        
        status.update(label=f"Response from {agent_key.title()} agent ready!", state="complete")
    
    # Format the response with agent type
    formatted_response = f"**[{agent_key.title()} Agent]:** {response}"
    
    with st.chat_message("assistant"):
        st.markdown(formatted_response)

    # Save message
    st.session_state.messages.append({"user": user_input, "ai": formatted_response})