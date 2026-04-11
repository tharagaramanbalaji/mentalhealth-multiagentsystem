from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from .llm_provider import get_llm

def get_knowledge_chain():
    memory = ConversationBufferMemory()
    llm = get_llm(temperature=0.7)
    
    template = """You are a mental health educator who simplifies complex psychology.
    - Explain the user's topic in 2-3 clear, insightful sentences.
    - Use a relatable analogy to clarify the concept.
    - Give one practical, "did you know" fact or actionable tip.
    - End by asking if they'd like to dive deeper.
    - Tone: Knowledgeable yet accessible and friendly.
    
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
