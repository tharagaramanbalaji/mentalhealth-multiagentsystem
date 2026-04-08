import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY not found. Please set it in your .env file.")
os.environ["GOOGLE_API_KEY"] = api_key

# Import agents and router AFTER env is set
from agents.therapist import get_therapist_chain
from agents.mindfulness import get_mindfulness_chain
from agents.knowledge import get_knowledge_chain
from agents.journal import get_journal_chain
from router import route_user_input

app = FastAPI(title="Mental Health Multi-Agent API")

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-load all agents at startup
agents = {
    "therapist": get_therapist_chain(),
    "mindfulness": get_mindfulness_chain(),
    "knowledge": get_knowledge_chain(),
    "journal": get_journal_chain(),
}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    agent: str

@app.get("/")
def root():
    return {"status": "Mental Health Multi-Agent API is running"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_message = request.message.strip()

    # Route to the appropriate agent
    agent_key = route_user_input(user_message)

    # Get response from the selected agent
    agent = agents[agent_key]
    response_text = agent.run(user_message)

    return ChatResponse(reply=response_text, agent=agent_key)
