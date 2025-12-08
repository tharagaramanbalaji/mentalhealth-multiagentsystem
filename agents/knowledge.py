from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

def get_knowledge_chain():
    memory = ConversationBufferMemory()
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
    
    template = """You're a knowledgeable friend, not a textbook or encyclopedia.
    Provide detailed, comprehensive responses (10-15 sentences) that thoroughly explain concepts.
    Balance being informative with maintaining a friendly, conversational tone.
    Include practical examples, analogies, and relevant context to make concepts easy to understand.
    Use clear structure with natural transitions between ideas, like you're having an in-depth coffee chat.
    Avoid overly technical jargon but don't oversimplify important concepts.
    
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
