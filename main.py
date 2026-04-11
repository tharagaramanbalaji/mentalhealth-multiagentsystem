import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY not found. Please set it in your .env file.")
os.environ["GOOGLE_API_KEY"] = api_key

# Import agents and router AFTER env is set
from agents.therapist import get_therapist_chain, analyze_session_start, identify_problems
from agents.mindfulness import get_mindfulness_chain
from agents.knowledge import get_knowledge_chain
from agents.journal import get_journal_chain
from router import route_user_input

app = FastAPI(title="Mental Health Multi-Agent API")

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000",
        "http://localhost:3001"
    ],
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
    agent: Optional[str] = None  # If set, skip router and use this agent directly

class SessionRequest(BaseModel):
    mood: int
    energy: int
    text: Optional[str] = ""

class ProblemRequest(BaseModel):
    q1: str
    q2: str
    q3: str

class CBTRequest(BaseModel):
    situation: str
    thought: str
    intensity: int

class ReframeRequest(BaseModel):
    thought: str
    distortion: str
    believable: Optional[bool] = False

class ActionPlanRequest(BaseModel):
    core_issue: str
    mood: str

class ChatResponse(BaseModel):
    reply: str
    agent: str

@app.get("/")
def root():
    return {"status": "Mental Health Multi-Agent API is running"}

@app.post("/api/session/checkin")
def session_checkin(request: SessionRequest):
    summary_raw = analyze_session_start(request.mood, request.energy, request.text)
    import json
    try:
        summary = json.loads(summary_raw)
        return {"reply": summary["summary"], "data": {"category": summary["category"]}, "type": "checkin_summary"}
    except:
        return {"reply": summary_raw, "type": "text"}

@app.post("/api/session/problem-identification")
def session_problem(request: ProblemRequest):
    analysis_raw = identify_problems(request.q1, request.q2, request.q3)
    import json
    try:
        analysis = json.loads(analysis_raw)
        return {"data": analysis, "type": "problem_summary"}
    except:
        return {"reply": analysis_raw, "type": "text"}

@app.post("/api/session/thought-breakdown")
def session_cbt(request: CBTRequest):
    from agents.therapist import analyze_cbt_thought
    analysis_raw = analyze_cbt_thought(request.situation, request.thought, request.intensity)
    import json
    try:
        analysis = json.loads(analysis_raw)
        return {"data": analysis, "type": "cbt_analysis"}
    except:
        return {"reply": analysis_raw, "type": "text"}

@app.post("/api/session/reframe")
def session_reframe(request: ReframeRequest):
    from agents.therapist import generate_reframe
    analysis_raw = generate_reframe(request.thought, request.distortion, request.believable)
    import json
    try:
        analysis = json.loads(analysis_raw)
        return {"data": analysis, "type": "reframe_suggestion"}
    except:
        return {"reply": analysis_raw, "type": "text"}

@app.post("/api/session/action-plan")
def session_action_plan(request: ActionPlanRequest):
    from agents.therapist import generate_action_plan
    analysis_raw = generate_action_plan(request.core_issue, request.mood)
    import json
    try:
        analysis = json.loads(analysis_raw)
        return {"data": analysis, "type": "action_plan"}
    except:
        return {"reply": analysis_raw, "type": "text"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_message = request.message.strip()

    # If a pinned agent is provided by the client, use it directly — skip routing
    if request.agent and request.agent in agents:
        agent_key = request.agent
    else:
        agent_key = route_user_input(user_message)

    agent = agents[agent_key]
    response_text = agent.run(user_message)

    return ChatResponse(reply=response_text, agent=agent_key)
