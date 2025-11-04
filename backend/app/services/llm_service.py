"""
LLM Service - Handles OpenAI API calls using LangChain
"""
import os
from typing import Dict, Optional
from langchain_openai import ChatOpenAI

from app.core.config import settings


class LLMService:
    """Service for interacting with LLM APIs"""
    
    def __init__(self):
        """Initialize LLM service with API key"""
        api_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set")
        
        self.model_name = settings.OPENAI_MODEL
        self.api_key = api_key
    
    async def generate_response(
        self,
        prompt: str,
        temperature: float = 0.7,
        top_p: float = 1.0,
        max_tokens: int = 1000
    ) -> Dict[str, any]:
        """
        Generate a response from the LLM with specified parameters
        
        Args:
            prompt: Input prompt
            temperature: Sampling temperature (0.0 to 2.0)
            top_p: Nucleus sampling parameter (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            
        Returns:
            Dictionary with 'text' and 'finish_reason'
        """
        try:
            # Initialize ChatOpenAI with parameters
            llm = ChatOpenAI(
                model=self.model_name,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                openai_api_key=self.api_key
            )
            
            # Generate response (LangChain expects a list of messages)
            from langchain_core.messages import HumanMessage
            messages = [HumanMessage(content=prompt)]
            response = await llm.ainvoke(messages)
            
            return {
                "text": response.content if hasattr(response, 'content') else str(response),
                "finish_reason": "stop"  # LangChain doesn't expose this directly
            }
            
        except Exception as e:
            # Handle API errors
            error_msg = str(e)
            if "rate limit" in error_msg.lower():
                raise Exception("Rate limit exceeded. Please try again later.")
            elif "authentication" in error_msg.lower() or "api key" in error_msg.lower():
                raise Exception("Invalid API key. Please check your OpenAI API key.")
            else:
                raise Exception(f"LLM API error: {error_msg}")
