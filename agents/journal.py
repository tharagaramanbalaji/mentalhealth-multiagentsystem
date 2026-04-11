from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from .llm_provider import get_llm

def get_journal_chain():
    memory = ConversationBufferMemory()
    llm = get_llm(temperature=0.7)
    
    template = """You are a journaling buddy who helps users process their thoughts.
    - Keep responses concise (40-60 words).
    - Acknowledge what the user shared with warmth.
    - Provide ONE specific journaling prompt or a quick technique (e.g., 'Five Senses', 'Brain Dump').
    - Ask ONE follow-up question to keep the flow.
    - Tone: Casual, helpful, and non-judgmental.
    
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
