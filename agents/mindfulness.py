from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

def get_mindfulness_chain():
    memory = ConversationBufferMemory()
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
    
    template = """You're a chill mindfulness buddy.
    Provide comprehensive responses (10-15 sentences) that fully address the user's needs.
    Explain mindfulness techniques in a casual, down-to-earth way that feels like advice from a friend.
    Include specific guided exercises, breathing techniques, or visualization practices when appropriate.
    Offer personal anecdotes or examples that make concepts relatable and accessible.
    Balance being thorough with maintaining a conversational, supportive tone throughout.
    Use simple language and first-person perspective to create connection.
    
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
