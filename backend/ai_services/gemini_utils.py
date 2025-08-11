import logging
import google.generativeai as genai
from django.conf import settings
from typing import Dict, Any, Optional
from django.core.cache import cache
import time

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)

# Available Gemini models
GEMINI_MODELS = {
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-1.0-pro': 'gemini-1.0-pro',
}

# Quota management settings
QUOTA_CACHE_KEY = 'gemini_api_quota'
QUOTA_LIMIT_PER_DAY = 50  # Conservative daily limit
QUOTA_LIMIT_PER_MINUTE = 2  # Conservative per-minute limit

def check_api_quota() -> bool:
    """
    Check if we're within API quota limits.
    
    Returns:
        bool: True if within limits, False if quota exceeded
    """
    try:
        # Check daily quota
        daily_key = f"{QUOTA_CACHE_KEY}_daily_{time.strftime('%Y-%m-%d')}"
        daily_count = cache.get(daily_key, 0)
        
        if daily_count >= QUOTA_LIMIT_PER_DAY:
            logger.warning(f"Daily quota exceeded: {daily_count}/{QUOTA_LIMIT_PER_DAY}")
            return False
        
        # Check per-minute quota
        minute_key = f"{QUOTA_CACHE_KEY}_minute_{int(time.time() // 60)}"
        minute_count = cache.get(minute_key, 0)
        
        if minute_count >= QUOTA_LIMIT_PER_MINUTE:
            logger.warning(f"Per-minute quota exceeded: {minute_count}/{QUOTA_LIMIT_PER_MINUTE}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking quota: {str(e)}")
        return False  # Fail safe - don't allow API calls if quota check fails

def increment_api_quota():
    """
    Increment API quota counters.
    """
    try:
        # Increment daily counter
        daily_key = f"{QUOTA_CACHE_KEY}_daily_{time.strftime('%Y-%m-%d')}"
        daily_count = cache.get(daily_key, 0) + 1
        cache.set(daily_key, daily_count, 86400)  # 24 hours
        
        # Increment per-minute counter
        minute_key = f"{QUOTA_CACHE_KEY}_minute_{int(time.time() // 60)}"
        minute_count = cache.get(minute_key, 0) + 1
        cache.set(minute_key, minute_count, 60)  # 1 minute
        
        logger.info(f"API quota incremented - Daily: {daily_count}/{QUOTA_LIMIT_PER_DAY}, Minute: {minute_count}/{QUOTA_LIMIT_PER_MINUTE}")
        
    except Exception as e:
        logger.error(f"Error incrementing quota: {str(e)}")

def get_quota_status() -> Dict[str, Any]:
    """
    Get current quota status.
    
    Returns:
        dict: Quota status information
    """
    try:
        daily_key = f"{QUOTA_CACHE_KEY}_daily_{time.strftime('%Y-%m-%d')}"
        minute_key = f"{QUOTA_CACHE_KEY}_minute_{int(time.time() // 60)}"
        
        daily_count = cache.get(daily_key, 0)
        minute_count = cache.get(minute_key, 0)
        
        return {
            'daily_used': daily_count,
            'daily_limit': QUOTA_LIMIT_PER_DAY,
            'daily_remaining': max(0, QUOTA_LIMIT_PER_DAY - daily_count),
            'minute_used': minute_count,
            'minute_limit': QUOTA_LIMIT_PER_MINUTE,
            'minute_remaining': max(0, QUOTA_LIMIT_PER_MINUTE - minute_count),
            'quota_exceeded': daily_count >= QUOTA_LIMIT_PER_DAY or minute_count >= QUOTA_LIMIT_PER_MINUTE
        }
    except Exception as e:
        logger.error(f"Error getting quota status: {str(e)}")
        return {
            'daily_used': 0,
            'daily_limit': QUOTA_LIMIT_PER_DAY,
            'daily_remaining': QUOTA_LIMIT_PER_DAY,
            'minute_used': 0,
            'minute_limit': QUOTA_LIMIT_PER_MINUTE,
            'minute_remaining': QUOTA_LIMIT_PER_MINUTE,
            'quota_exceeded': False
        }

def get_gemini_model(model_name: str = 'gemini-1.5-flash'):
    """
    Get a Gemini model instance.
    
    Args:
        model_name: Name of the Gemini model to use
    
    Returns:
        GenerativeModel: Configured Gemini model
    """
    if model_name not in GEMINI_MODELS:
        model_name = 'gemini-1.5-flash'  # Default fallback
    
    try:
        return genai.GenerativeModel(GEMINI_MODELS[model_name])
    except Exception as e:
        logger.error(f"Failed to initialize Gemini model {model_name}: {str(e)}")
        raise

def call_gemini_api(
    prompt: str, 
    system_prompt: str = None,
    model_name: str = 'gemini-1.5-flash',
    max_tokens: int = 1000,
    temperature: float = 0.7,
    check_quota: bool = True,
    **kwargs
) -> str:
    """
    Call Gemini API to generate content.
    
    Args:
        prompt: The user prompt to send to Gemini
        system_prompt: Optional system prompt for context
        model_name: Gemini model to use
        max_tokens: Maximum tokens to generate
        temperature: Creativity level (0.0 to 1.0)
        check_quota: Whether to check quota before making API call
        **kwargs: Additional parameters
    
    Returns:
        str: Generated content from Gemini
    
    Raises:
        Exception: If API call fails or quota exceeded
    """
    if not settings.GOOGLE_GEMINI_API_KEY:
        raise Exception("Gemini API key not configured")
    
    # Check quota if enabled
    if check_quota and not check_api_quota():
        quota_status = get_quota_status()
        raise Exception(f"API quota exceeded. Daily: {quota_status['daily_used']}/{quota_status['daily_limit']}, Minute: {quota_status['minute_used']}/{quota_status['minute_limit']}")
    
    try:
        model = get_gemini_model(model_name)
        
        # Build the conversation
        conversation = []
        
        if system_prompt:
            conversation.append({
                "role": "user",
                "parts": [system_prompt]
            })
            conversation.append({
                "role": "model",
                "parts": ["I understand. I'll follow these guidelines in my responses."]
            })
        
        conversation.append({
            "role": "user",
            "parts": [prompt]
        })
        
        # Generate content
        response = model.generate_content(
            conversation,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
        )
        
        generated_content = response.text.strip()
        
        if not generated_content:
            raise Exception("Gemini returned empty content")
        
        # Increment quota counter
        increment_api_quota()
        
        return generated_content
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise Exception(f"Gemini API error: {str(e)}")

def call_gemini_for_content_generation(
    prompt: str, 
    content_type: str,
    brand_context: str = None,
    check_quota: bool = True
) -> str:
    """
    Call Gemini API specifically for content generation with marketing context.
    
    Args:
        prompt: The user prompt
        content_type: Type of content being generated
        brand_context: Optional brand context
        check_quota: Whether to check quota before making API call
    
    Returns:
        str: Generated content
    """
    # Set model based on content type
    model_name = "gemini-1.5-pro" if content_type in ['blog_content', 'landing_page'] else "gemini-1.5-flash"
    
    # Build system prompt
    system_prompt = "You are a professional marketing content writer. Generate high-quality, engaging content that drives results."
    
    if brand_context:
        system_prompt += f"\n\nBrand Context:\n{brand_context}"
    
    # Add content type specific instructions
    content_type_instructions = {
        'email_subject': "Create a compelling email subject line that is engaging and encourages opens.",
        'email_body': "Write a professional email body that is engaging and drives action.",
        'social_post': "Create an engaging social media post that resonates with the audience.",
        'blog_title': "Create a compelling blog title that is SEO-friendly and click-worthy.",
        'blog_content': "Write comprehensive, engaging blog content that provides value to readers.",
        'ad_copy': "Create persuasive ad copy that drives conversions.",
        'landing_page': "Write compelling landing page content that converts visitors.",
        'product_description': "Write engaging product descriptions that highlight benefits and features."
    }
    
    if content_type in content_type_instructions:
        system_prompt += f"\n\nContent Type Instructions: {content_type_instructions[content_type]}"
    
    # Set appropriate parameters
    max_tokens = 1500 if content_type in ['blog_content', 'landing_page'] else 800
    temperature = 0.8 if content_type in ['social_post', 'ad_copy'] else 0.7
    
    return call_gemini_api(
        prompt=prompt,
        system_prompt=system_prompt,
        model_name=model_name,
        max_tokens=max_tokens,
        temperature=temperature
    )

def call_gemini_for_ai_agent(
    prompt: str,
    agent_name: str,
    agent_personality: str,
    specialization: str,
    context: Dict[str, Any] = None,
    check_quota: bool = True
) -> str:
    """
    Call Gemini API for AI agent interactions.
    
    Args:
        prompt: The user's question or request
        agent_name: Name of the AI agent
        agent_personality: Personality description of the agent
        specialization: Agent's specialization
        context: Additional context data
        check_quota: Whether to check quota before making API call
    
    Returns:
        str: Agent's response
    """
    # Build system prompt for the agent
    system_prompt = f"""You are {agent_name}, an AI agent specialized in {specialization}.

Personality: {agent_personality}

You should:
1. Respond in a helpful, professional manner
2. Provide actionable advice and insights
3. Ask clarifying questions when needed
4. Use your specialization to provide expert guidance
5. Be concise but thorough in your responses

Current context: {context or 'No additional context provided'}"""

    return call_gemini_api(
        prompt=prompt,
        system_prompt=system_prompt,
        model_name="gemini-1.5-pro",
        max_tokens=1200,
        temperature=0.7,
        check_quota=check_quota
    )

def call_gemini_for_insights(
    prompt: str,
    data_context: str = None,
    check_quota: bool = True
) -> str:
    """
    Call Gemini API for generating insights and recommendations.
    
    Args:
        prompt: The analysis request
        data_context: Context about the data being analyzed
        check_quota: Whether to check quota before making API call
    
    Returns:
        str: Generated insights
    """
    system_prompt = """You are an expert data analyst and business strategist. 
Your role is to analyze data and provide actionable insights and recommendations.

Focus on:
1. Identifying key trends and patterns
2. Providing data-driven recommendations
3. Explaining the business impact
4. Suggesting next steps
5. Highlighting opportunities and risks"""

    if data_context:
        system_prompt += f"\n\nData Context:\n{data_context}"

    return call_gemini_api(
        prompt=prompt,
        system_prompt=system_prompt,
        model_name="gemini-1.5-pro",
        max_tokens=1500,
        temperature=0.6,
        check_quota=check_quota
    ) 