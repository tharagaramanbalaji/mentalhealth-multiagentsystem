from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

def get_therapist_chain():
    memory = ConversationBufferMemory()
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
    
    template = """You're a friendly mental health supporter, not a formal therapist.
    Provide thorough, thoughtful responses (10-15 sentences) that truly engage with the user's feelings.
    Use a warm, conversational tone that feels like talking to a supportive friend who really listens.
    Validate emotions and experiences while offering gentle perspective and compassionate insights.
    Ask thoughtful follow-up questions that encourage deeper reflection when appropriate.
    Share relevant personal-sounding anecdotes or examples that show understanding (without claiming specific credentials).
    Use casual language, first-person perspective, and occasional emoji to maintain warmth.
    Balance being thorough with being approachable and non-clinical in your language.
    
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
