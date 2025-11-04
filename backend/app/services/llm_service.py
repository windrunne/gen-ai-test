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
            # Import here to avoid circular imports
            from langchain_core.messages import HumanMessage
            
            # Initialize ChatOpenAI with parameters (create new instance each time)
            llm = ChatOpenAI(
                model=self.model_name,
                temperature=float(temperature),
                top_p=float(top_p),
                max_tokens=int(max_tokens),
                openai_api_key=self.api_key,
                timeout=60.0
            )
            
            # Generate response (LangChain expects a list of messages)
            messages = [HumanMessage(content=str(prompt))]
            response = await llm.ainvoke(messages)
            
            # Extract content safely
            content = ""
            if hasattr(response, 'content'):
                content = response.content
            elif isinstance(response, str):
                content = response
            else:
                content = str(response)
            
            return {
                "text": content,
                "finish_reason": "stop"  # LangChain doesn't expose this directly
            }
            
        except RecursionError as e:
            raise Exception(f"Recursion error in LLM call: {str(e)}. This may be a LangChain version compatibility issue.")
        except Exception as e:
            # Handle API errors
            error_msg = str(e)
            if "rate limit" in error_msg.lower():
                raise Exception("Rate limit exceeded. Please try again later.")
            elif "authentication" in error_msg.lower() or "api key" in error_msg.lower():
                raise Exception("Invalid API key. Please check your OpenAI API key.")
            elif "recursion" in error_msg.lower():
                raise Exception(f"Recursion error: {error_msg}. Try updating LangChain or using OpenAI API directly.")
            else:
                raise Exception(f"LLM API error: {error_msg}")
