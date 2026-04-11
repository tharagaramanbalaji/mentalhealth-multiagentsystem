from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from .llm_provider import get_llm

def get_therapist_chain():
    memory = ConversationBufferMemory()
    llm = get_llm(temperature=0.7)
    
    template = """You are a warm, empathetic therapist and a supportive friend.
    - Keep your response under 100 words (3-5 sentences).
    - Start by validating the user's emotion with deep empathy.
    - Provide one clear, actionable coping strategy or psychological perspective.
    - End with a single, thoughtful question that invites reflection.
    - Tone: Kind, direct, and supportive. Use emojis sparingly but warmly.

    Current conversation:
    {history}
    Friend: {input}
    You:"""
    
    prompt = PromptTemplate(
        input_variables=["history", "input"], 
        template=template
    )
    
    return ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False
    )

def _invoke_json(llm, prompt: str) -> str:
    """
    Helper to invoke LLM and extract JSON content from potential markdown blocks.
    """
    response = llm.invoke(prompt).content.strip()
    # Remove markdown code blocks if present
    if response.startswith("```json"):
        response = response[7:-3].strip()
    elif response.startswith("```"):
        response = response[3:-3].strip()
    return response

def analyze_session_start(mood: int, energy: int, text: str = ""):
    """
    Analyzes a session check-in to provide a summary of the user's state.
    Mood: 1 (Sad) to 5 (Happy)
    Energy: 1 (Low) to 5 (High)
    """
    llm = get_llm(temperature=0.3)
    
    prompt = f"""
    You are a compassionate therapist conducting a session check-in.
    The user provided the following data:
    - Mood: {mood}/5 (1 is very low/sad, 5 is very high/happy)
    - Energy Level: {energy}/5 (1 is exhausted, 5 is vibrant)
    - What's on their mind: "{text if text else 'Nothing specific shared'}"
    
    Respond STRICTLY in the following JSON format:
    {{
      "category": "One of: Anxiety, Overthinking, Sadness, Anger, Burnout",
      "summary": "The empathetic summary sentence"
    }}
    """
    
    response = _invoke_json(llm, prompt)
    return response

def identify_problems(q1: str, q2: str, q3: str):
    """
    Extracts structured problem data from user answers.
    q1: What happened?
    q2: When did this start?
    q3: What triggered it?
    """
    llm = get_llm(temperature=0.1)
    
    prompt = f"""
    You are an AI therapist assistant. Analyze the following user responses to identify the core issue and triggers.
    
    - Question: What happened? 
      Answer: "{q1}"
    - Question: When did this start?
      Answer: "{q2}"
    - Question: What triggered it?
      Answer: "{q3}"
    
    Respond STRICTLY in the following JSON format:
    {{
      "core_issue": "summary of the problem",
      "trigger": "what set it off",
      "context": "when/how it affects them",
      "closing": "an empathetic closing sentence"
    }}
    """
    
    response = _invoke_json(llm, prompt)
    return response

def analyze_cbt_thought(situation: str, thought: str, intensity: int):
    """
    Analyzes a thought for cognitive distortions.
    """
    llm = get_llm(temperature=0.1)
    
    prompt = f"""
    You are a CBT-focused therapist. Analyze the user's situation and automatic thought to detect cognitive distortions.
    
    - Situation: "{situation}"
    - Automatic Thought: "{thought}"
    - Emotion Intensity: {intensity}/10
    
    Role:
    1. Identify the primary cognitive distortion (e.g., Catastrophizing, Overgeneralizing, Mind Reading, All-or-Nothing Thinking, Emotional Reasoning).
    2. Provide a one-sentence empathetic explanation of why this thought matches that distortion.
    3. Output EXACTLY in this JSON format:
    {{
      "distortion": "Name of distortion",
      "explanation": "Empathetic explanation",
      "severity": "{intensity}/10",
      "closing": "Short supportive sentence"
    }}
    """
    
    response = _invoke_json(llm, prompt)
    return response

def generate_reframe(thought: str, distortion: str, believable: bool = False):
    """
    Generates a balanced reframe for a negative thought.
    """
    llm = get_llm(temperature=0.2)
    
    tone_instruction = "Make the reframe extremely grounded, realistic, and 'dialed down'. Avoid toxic positivity." if believable else "Provide a balanced, healthy, and positive alternative perspective."
    
    prompt = f"""
    You are a CBT therapist. Reframe the following negative thought.
    
    - Negative Thought: "{thought}"
    - Distortion Identified: "{distortion}"
    
    Instruction:
    {tone_instruction}
    
    Output EXACTLY in this JSON format:
    {{
      "reframe": "The reframed thought",
      "rationale": "One brief sentence on why this is more balanced"
    }}
    """
    
    response = _invoke_json(llm, prompt)
    return response

def generate_action_plan(core_issue: str, mood: str):
    """
    Generates 2-3 realistic action steps based on the session findings.
    """
    llm = get_llm(temperature=0.3)
    
    prompt = f"""
    Based on the following session findings, suggest 2-3 simple, actionable steps for the user.
    
    - Core Issue: "{core_issue}"
    - Current State: "{mood}"
    
    Instruction:
    Keep actions small, specific, and realistic for someone struggling.
    
    Output EXACTLY in this JSON format:
    {{
      "actions": [
        "Action 1",
        "Action 2",
        "Action 3 (optional)"
      ]
    }}
    """
    
    response = _invoke_json(llm, prompt)
    return response

