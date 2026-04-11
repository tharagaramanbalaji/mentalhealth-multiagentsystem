from agents.llm_provider import get_llm

def route_user_input(user_input: str) -> str:
    """
    Uses an LLM to determine which agent should handle the user's query.
    
    Args:
        user_input: The user's message
        
    Returns:
        String indicating which agent to use ("therapist", "mindfulness", "knowledge", or "journal")
    """
    router_llm = get_llm(temperature=0.1)
    
    prompt = f"""
    You are a router for a mental health multi-agent system. Your job is to determine which 
    specialized agent should handle the user's query. Choose exactly one of the following agents:
    
    - therapist: For emotional support, therapy-like conversations, discussing feelings or personal challenges
    - mindfulness: For meditation guidance, breathing exercises, relaxation techniques, stress reduction
    - knowledge: For factual questions about mental health, psychology, disorders, treatments, or scientific information
    - journal: For helping users document thoughts, reflect on experiences, or maintain a diary
    
    User query: {user_input}
    
    Respond with only one word - the name of the most appropriate agent.
    """
    
    response = router_llm.invoke(prompt).content.strip().lower()
    
    # Ensure we get one of our valid agent names
    valid_agents = ["therapist", "mindfulness", "knowledge", "journal"]
    if response not in valid_agents:
        return "therapist"  # Default to therapist if response is invalid
    
    return response
