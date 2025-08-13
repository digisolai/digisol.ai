"""
PERMANENT DIGISOL.AI ADMIN ACCESS
=================================

This file contains hard-coded access rules for DigiSol.AI internal users.
These users will ALWAYS have unlimited access to all features regardless of subscription status.

IMPORTANT: This is for DigiSol.AI's own business use - we don't pay for our own service!
"""

# Hard-coded list of DigiSol.AI admin emails that get unlimited access
DIGISOL_ADMIN_EMAILS = [
    'admin@digisolai.ca',
    'cameron@digisolai.ca',  # Add your email here
    'info@digisolai.ca',
    'support@digisolai.ca',
    'dev@digisolai.ca',
]

# DigiSol.AI domain patterns for automatic admin access
DIGISOL_DOMAINS = [
    '@digisolai.ca',
    '@digisol.ai',
]

def is_digisol_admin(user):
    """
    Check if a user is a DigiSol.AI admin with unlimited access.
    This bypasses all subscription checks.
    """
    if not user or not user.is_authenticated:
        return False
    
    # Check if user is a Django superuser
    if user.is_superuser:
        return True
    
    # Check if user email is in the hard-coded admin list
    if user.email in DIGISOL_ADMIN_EMAILS:
        return True
    
    # Check if user email domain matches DigiSol.AI domains
    for domain in DIGISOL_DOMAINS:
        if user.email.endswith(domain):
            return True
    
    return False

def get_digisol_admin_plan():
    """
    Returns the unlimited plan data for DigiSol.AI admins.
    This is what gets returned when subscription checks are bypassed.
    """
    return {
        "plan_name": "DigiSol.AI Internal",
        "subscription_status": "active",
        "monthly_cost": "0.00",
        "annual_cost": "0.00",
        "description": "Internal DigiSol.AI access - unlimited features for business use",
        "contact_limit": -1,  # Unlimited
        "email_send_limit": -1,  # Unlimited
        "ai_text_credits_per_month": -1,  # Unlimited
        "ai_image_credits_per_month": -1,  # Unlimited
        "ai_planning_requests_per_month": -1,  # Unlimited
        "user_seats": -1,  # Unlimited
        "support_level": "priority",
        "contacts_used_current_period": 0,
        "emails_sent_current_period": 0,
        "ai_text_credits_used_current_period": 0,
        "ai_image_credits_used_current_period": 0,
        "ai_planning_requests_used_current_period": 0,
        "current_period_end": None,
        "cancel_at_period_end": False,
        "remaining_text_credits": -1,  # Unlimited
        "remaining_image_credits": -1,  # Unlimited
        "remaining_planning_requests": -1,  # Unlimited
        "remaining_contacts": -1,  # Unlimited
        "remaining_emails": -1,  # Unlimited
        "is_digisol_admin": True,
        "show_upgrade_prompt": False,
        "includes_design_studio": True,
        "includes_advanced_analytics": True,
        "includes_project_management": True,
        "includes_budgeting": True,
        "includes_learning_center": True,
        "includes_dedicated_support": True,
        "includes_white_label": True,
        "includes_custom_integrations": True,
        "includes_client_portals": True,
        "includes_client_billing": True,
        "includes_client_analytics": True,
        "includes_white_label_portals": True,
        "includes_client_support": True,
    }
