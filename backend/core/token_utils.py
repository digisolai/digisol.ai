"""
Token consumption utilities for DigiSol.AI pricing model.

This module handles token consumption for various operations according to the new pricing model.
Token costs are designed to be predictable and fair for users while covering operational costs.
"""

import logging
from typing import Optional
from core.models import Tenant, CustomUser

logger = logging.getLogger(__name__)

class TokenConsumption:
    """Constants for token consumption rates."""
    
    # AI Operations
    AI_IMAGE_GENERATION = 500  # tokens per image
    AI_CONTENT_GENERATION = 100  # tokens per 1,000 words
    AI_RECOMMENDATION = 50  # tokens per recommendation
    AI_PLANNING_REQUEST = 200  # tokens per planning request
    
    # Integration Operations
    INTEGRATION_API_REQUEST = 1  # tokens per 10 API requests (0.1 per request)
    
    # Content Operations
    EMAIL_SEND = 5  # tokens per email sent
    CAMPAIGN_CREATION = 100  # tokens per campaign
    AUTOMATION_WORKFLOW = 250  # tokens per workflow creation
    
    # Analytics Operations
    ANALYTICS_REPORT = 25  # tokens per report generation
    PREDICTIVE_ANALYSIS = 150  # tokens per analysis


def is_superuser_bypass_enabled(user: Optional[CustomUser] = None) -> bool:
    """
    Check if superuser bypass is enabled for testing.
    Superusers can bypass all token restrictions.
    """
    if user and user.is_superuser:
        return True
    return False


def consume_tokens_for_ai_image(tenant: Tenant, image_count: int = 1, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for AI image generation.
    
    Args:
        tenant: The tenant consuming tokens
        image_count: Number of images to generate
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: AI image generation for {image_count} images")
        return True
    
    token_cost = TokenConsumption.AI_IMAGE_GENERATION * image_count
    return tenant.use_tokens(token_cost)


def consume_tokens_for_ai_content(tenant: Tenant, word_count: int, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for AI content generation.
    
    Args:
        tenant: The tenant consuming tokens
        word_count: Number of words to generate
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: AI content generation for {word_count} words")
        return True
    
    token_cost = (word_count // 1000 + (1 if word_count % 1000 > 0 else 0)) * TokenConsumption.AI_CONTENT_GENERATION
    return tenant.use_tokens(token_cost)


def consume_tokens_for_ai_recommendation(tenant: Tenant, recommendation_count: int = 1, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for AI recommendation generation.
    
    Args:
        tenant: The tenant consuming tokens
        recommendation_count: Number of recommendations to generate
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: AI recommendation generation for {recommendation_count} recommendations")
        return True
    
    token_cost = TokenConsumption.AI_RECOMMENDATION * recommendation_count
    return tenant.use_tokens(token_cost)


def consume_tokens_for_integration_api(tenant: Tenant, api_request_count: int, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for integration API requests.
    
    Args:
        tenant: The tenant consuming tokens
        api_request_count: Number of API requests
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: Integration API requests for {api_request_count} requests")
        return True
    
    token_cost = (api_request_count // 10 + (1 if api_request_count % 10 > 0 else 0)) * TokenConsumption.INTEGRATION_API_REQUEST
    return tenant.use_tokens(token_cost)


def consume_tokens_for_email_send(tenant: Tenant, email_count: int = 1, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for email sending.
    
    Args:
        tenant: The tenant consuming tokens
        email_count: Number of emails to send
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: Email sending for {email_count} emails")
        return True
    
    token_cost = TokenConsumption.EMAIL_SEND * email_count
    return tenant.use_tokens(token_cost)


def consume_tokens_for_campaign_creation(tenant: Tenant, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for campaign creation.
    
    Args:
        tenant: The tenant consuming tokens
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info("Superuser bypass: Campaign creation")
        return True
    
    return tenant.use_tokens(TokenConsumption.CAMPAIGN_CREATION)


def consume_tokens_for_automation_workflow(tenant: Tenant, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for automation workflow creation.
    
    Args:
        tenant: The tenant consuming tokens
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info("Superuser bypass: Automation workflow creation")
        return True
    
    return tenant.use_tokens(TokenConsumption.AUTOMATION_WORKFLOW)


def consume_tokens_for_analytics_report(tenant: Tenant, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for analytics report generation.
    
    Args:
        tenant: The tenant consuming tokens
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info("Superuser bypass: Analytics report generation")
        return True
    
    return tenant.use_tokens(TokenConsumption.ANALYTICS_REPORT)


def consume_tokens_for_predictive_analysis(tenant: Tenant, user: Optional[CustomUser] = None) -> bool:
    """
    Consume tokens for predictive analysis.
    
    Args:
        tenant: The tenant consuming tokens
        user: Optional user for superuser bypass
        
    Returns:
        bool: True if tokens were successfully consumed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info("Superuser bypass: Predictive analysis")
        return True
    
    return tenant.use_tokens(TokenConsumption.PREDICTIVE_ANALYSIS)


def get_token_cost_estimate(operation: str, **kwargs) -> int:
    """
    Get estimated token cost for an operation without consuming tokens.
    
    Args:
        operation: The operation type ('ai_image', 'ai_content', 'ai_recommendation', etc.)
        **kwargs: Operation-specific parameters
        
    Returns:
        int: Estimated token cost
    """
    if operation == 'ai_image':
        image_count = kwargs.get('image_count', 1)
        return TokenConsumption.AI_IMAGE_GENERATION * image_count
    
    elif operation == 'ai_content':
        word_count = kwargs.get('word_count', 0)
        return (word_count // 1000 + (1 if word_count % 1000 > 0 else 0)) * TokenConsumption.AI_CONTENT_GENERATION
    
    elif operation == 'ai_recommendation':
        recommendation_count = kwargs.get('recommendation_count', 1)
        return TokenConsumption.AI_RECOMMENDATION * recommendation_count
    
    elif operation == 'integration_api':
        api_request_count = kwargs.get('api_request_count', 0)
        return (api_request_count // 10 + (1 if api_request_count % 10 > 0 else 0)) * TokenConsumption.INTEGRATION_API_REQUEST
    
    elif operation == 'email_send':
        email_count = kwargs.get('email_count', 1)
        return TokenConsumption.EMAIL_SEND * email_count
    
    elif operation == 'campaign_creation':
        return TokenConsumption.CAMPAIGN_CREATION
    
    elif operation == 'automation_workflow':
        return TokenConsumption.AUTOMATION_WORKFLOW
    
    elif operation == 'analytics_report':
        return TokenConsumption.ANALYTICS_REPORT
    
    elif operation == 'predictive_analysis':
        return TokenConsumption.PREDICTIVE_ANALYSIS
    
    else:
        return 0


def can_perform_operation(tenant: Tenant, operation: str, user: Optional[CustomUser] = None, **kwargs) -> bool:
    """
    Check if tenant can perform an operation based on available tokens.
    
    Args:
        tenant: The tenant to check
        operation: The operation type
        user: Optional user for superuser bypass
        **kwargs: Operation-specific parameters
        
    Returns:
        bool: True if operation can be performed, False otherwise
    """
    # Superuser bypass for testing
    if is_superuser_bypass_enabled(user):
        logger.info(f"Superuser bypass: Operation {operation} allowed")
        return True
    
    estimated_cost = get_token_cost_estimate(operation, **kwargs)
    return tenant.can_use_tokens(estimated_cost) 