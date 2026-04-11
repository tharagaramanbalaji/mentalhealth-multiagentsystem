import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.cache import SQLiteCache
from langchain_core.globals import set_llm_cache
from langchain_core.rate_limiters import InMemoryRateLimiter

# Central configuration for all agents
# Switching to gemini-flash-latest to find a model with available quota
DEFAULT_MODEL = "gemini-2.5-flash-lite"

# Initialize Global SQLite Cache (survives restarts)
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# Initialize Global Rate Limiter
# Defaulting to 1 request every 2 seconds (30 RPM) to be safe for free tiers
rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.5, 
    check_every_n_seconds=0.1,
    max_bucket_size=10,  # Allow small bursts
)

def get_llm(temperature=0.7):
    """
    Returns a configured LLM instance with rate limiting, retries, and caching.
    Standardizes on the DEFAULT_MODEL but allows for task-specific temperature.
    """
    return ChatGoogleGenerativeAI(
        model=DEFAULT_MODEL,
        temperature=temperature,
        rate_limiter=rate_limiter,
        max_retries=6,  # Increased retries with exponential backoff
        timeout=60,     # 60 second timeout for reliability
    )
