from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

def get_journal_chain():
    memory = ConversationBufferMemory()
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
    
    template = """You're a journaling buddy, not a formal writing instructor.
    Provide detailed, thoughtful responses (10-15 sentences) that help the user explore their thoughts deeply.
    Use a casual, encouraging tone like a supportive friend who's genuinely interested in their journey.
    Ask a series of reflective questions that build upon each other to guide deeper self-exploration.
    Suggest specific journaling prompts or exercises tailored to their situation.
    Share insights about the benefits of their journaling practice or patterns you notice.
    Offer personal-sounding examples of how journaling techniques have helped others.
    Balance providing structure with encouraging free expression and authentic reflection.
    Use casual language and first-person perspective to create connection.
    
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
