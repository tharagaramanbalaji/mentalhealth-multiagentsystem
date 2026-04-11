from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from .llm_provider import get_llm

def get_mindfulness_chain():
    memory = ConversationBufferMemory()
    llm = get_llm(temperature=0.7)
    
    template = """You are a calm, grounded mindfulness guide.
    - Provide a brief (under 50 words) mindfulness technique or breathing exercise.
    - Format the practice as clear, numbered steps.
    - Explain the benefit of the practice in one sentence.
    - End with a prompt to start now.
    - Tone: Peaceful, steady, and encouraging.
    
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
