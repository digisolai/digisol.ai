import logging
import base64
import boto3
from io import BytesIO
from PIL import Image
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import (
    ContentGenerationRequest, ImageGenerationRequest, AIProfile, AITask, AIInteractionLog, AIRecommendation
)
from core.models import BrandProfile, BrandAsset, Campaign
from .gemini_utils import call_gemini_for_content_generation, call_gemini_for_ai_agent, call_gemini_for_insights
import time
import json
from django.db import models
from django.utils import timezone
from project_management.models import Project, ProjectTask, ProjectRisk, PromanaInsight

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_content_task(self, request_id):
    """
    Celery task to generate AI content using OpenAI API.
    
    Args:
        request_id: UUID of the ContentGenerationRequest
    """
    try:
        # Get the content generation request
        request = ContentGenerationRequest.objects.get(id=request_id)
        
        # Mark as processing
        request.mark_as_processing()
        
        # Get brand profile for the tenant
        try:
            brand_profile = BrandProfile.objects.get(tenant=request.tenant)
        except BrandProfile.DoesNotExist:
            brand_profile = None
            logger.warning(f"No brand profile found for tenant {request.tenant.id}")
        
        # Construct the prompt with branding context
        enhanced_prompt, brand_context = _build_enhanced_prompt(request, brand_profile)
        
        # Call Gemini API (disabled for automatic processes to prevent quota issues)
        # response = call_gemini_for_content_generation(
        #     prompt=enhanced_prompt,
        #     content_type=request.content_type,
        #     brand_context=brand_context
        # )
        
        # For now, return a placeholder response to prevent quota issues
        response = f"Content generation temporarily disabled to prevent API quota issues. Your request was: {enhanced_prompt}"
        
        # Update the request with generated content
        request.mark_as_completed(response, credits_used=1)
        
        logger.info(f"Successfully generated content for request {request_id}")
        return True
        
    except ContentGenerationRequest.DoesNotExist:
        logger.error(f"ContentGenerationRequest {request_id} not found")
        return False
        
    except Exception as exc:
        logger.error(f"Error generating content for request {request_id}: {str(exc)}")
        
        # Update request with error
        try:
            request = ContentGenerationRequest.objects.get(id=request_id)
            request.mark_as_failed(str(exc))
        except ContentGenerationRequest.DoesNotExist:
            pass
        
        # Retry the task
        raise self.retry(countdown=60, exc=exc)


def _build_enhanced_prompt(request, brand_profile):
    """
    Build an enhanced prompt using brand profile and context data.
    
    Args:
        request: ContentGenerationRequest instance
        brand_profile: BrandProfile instance or None
    
    Returns:
        tuple: (enhanced_prompt, brand_context) for AI generation
    """
    base_prompt = request.prompt_text
    
    # Add brand context if available
    brand_context = ""
    if brand_profile:
        brand_context = f"""
Brand Guidelines:
- Primary Color: {brand_profile.primary_color}
- Accent Color: {brand_profile.accent_color}
- Font Family: {brand_profile.font_family}
- Tone of Voice: {brand_profile.tone_of_voice_description or 'Professional and friendly'}
"""
    
    # Add content type specific instructions
    content_type_instructions = {
        'email_subject': "Create a compelling email subject line that is engaging and encourages opens.",
        'email_body': "Write a professional email body that is engaging and drives action.",
        'social_post': "Create an engaging social media post that resonates with the audience.",
        'blog_title': "Create a compelling blog title that is SEO-friendly and click-worthy.",
        'blog_content': "Write comprehensive blog content that provides value to readers.",
        'ad_copy': "Create persuasive advertisement copy that drives conversions.",
        'landing_page': "Write compelling landing page content that converts visitors.",
        'product_description': "Create an engaging product description that highlights benefits.",
    }
    
    instruction = content_type_instructions.get(request.content_type, "Create engaging content.")
    
    # Add context data if available
    context_info = ""
    if request.context_data:
        context_info = f"\nAdditional Context: {request.context_data}"
    
    enhanced_prompt = f"""
{instruction}

{brand_context}

User Request: {base_prompt}
{context_info}

Please generate high-quality, engaging content that aligns with the brand guidelines and user requirements.
"""
    
    return enhanced_prompt.strip()


# OpenAI API function removed - now using Gemini API


@shared_task
def cleanup_old_requests():
    """
    Clean up old completed requests to manage database size.
    """
    from datetime import timedelta
    
    # Delete requests older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    
    deleted_count = ContentGenerationRequest.objects.filter(
        created_at__lt=cutoff_date,
        status__in=['completed', 'failed', 'cancelled']
    ).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old content generation requests")
    return deleted_count 


@shared_task
def generate_image_task(request_id):
    try:
        req = ImageGenerationRequest.objects.get(id=request_id)
        req.status = 'processing'
        req.save(update_fields=['status'])
        
        # Build enhanced prompt based on design type and parameters
        full_prompt = _build_design_specific_prompt(req)
        
        # Placeholder: Call external LLM API (simulate with sleep)
        time.sleep(3)  # Simulate API call
        
        # Placeholder: Upload to cloud storage (simulate URL)
        generated_image_url = f"https://example-bucket.s3.amazonaws.com/generated/{request_id}.png"
        req.generated_image_url = generated_image_url
        req.status = 'completed'
        req.save(update_fields=['generated_image_url', 'status'])
        
        logger.info(f"Image generation completed for request {request_id} with design type: {req.design_type}")
        
    except Exception as e:
        logger.error(f"Image generation failed for request {request_id}: {str(e)}")
        req = ImageGenerationRequest.objects.get(id=request_id)
        req.status = 'failed'
        req.save(update_fields=['status'])


def _build_design_specific_prompt(image_request):
    """
    Build a sophisticated prompt based on design type and parameters.
    """
    base_prompt = image_request.prompt_text
    design_type = image_request.design_type
    design_params = image_request.design_parameters or {}
    brand_profile = image_request.brand_profile
    
    # Start with base prompt
    full_prompt = base_prompt
    
    # Add design type specific instructions
    if design_type == 'logo':
        brand_name = design_params.get('brand_name', 'the brand')
        style = design_params.get('style', 'modern')
        full_prompt = f"Create a {style} logo for {brand_name}. {base_prompt}. The logo should be clean, scalable, and suitable for various applications."
        
    elif design_type == 'ad_banner':
        dimensions = design_params.get('dimensions', '1200x628')
        cta_text = design_params.get('cta_text', 'Learn More')
        full_prompt = f"Design an advertising banner with dimensions {dimensions}. {base_prompt}. Include a call-to-action button with text '{cta_text}'. Make it eye-catching and conversion-focused."
        
    elif design_type == 'social_post':
        platform = design_params.get('platform', 'general')
        aspect_ratio = design_params.get('aspect_ratio', '1:1')
        full_prompt = f"Create a social media post for {platform} platform with aspect ratio {aspect_ratio}. {base_prompt}. Optimize for social media engagement and sharing."
        
    elif design_type == 'business_card':
        full_prompt = f"Design a professional business card. {base_prompt}. Include space for name, title, company, contact information, and logo placement. Use standard business card dimensions."
        
    elif design_type == 'flyer':
        full_prompt = f"Create a promotional flyer. {base_prompt}. Include headline, body text, contact information, and call-to-action. Design for print and digital distribution."
        
    elif design_type == 'presentation_slide':
        full_prompt = f"Design a presentation slide. {base_prompt}. Include title, content area, and visual elements. Make it professional and engaging for business presentations."
    
    # Add brand profile information if available
    if brand_profile:
        brand_info = []
        if brand_profile.primary_color:
            brand_info.append(f"primary color: {brand_profile.primary_color}")
        if brand_profile.secondary_color:
            brand_info.append(f"secondary color: {brand_profile.secondary_color}")
        if brand_profile.brand_voice:
            brand_info.append(f"brand voice: {brand_profile.brand_voice}")
        if brand_profile.font_family:
            brand_info.append(f"font family: {brand_profile.font_family}")
        
        if brand_info:
            full_prompt += f" Use brand guidelines: {', '.join(brand_info)}."
    
    # Add design parameters if specified
    if design_params:
        param_descriptions = []
        for key, value in design_params.items():
            if key not in ['brand_name', 'style', 'dimensions', 'cta_text', 'platform', 'aspect_ratio']:
                param_descriptions.append(f"{key}: {value}")
        
        if param_descriptions:
            full_prompt += f" Additional specifications: {', '.join(param_descriptions)}."
    
    return full_prompt


# @shared_task(bind=True, max_retries=3)
# def orchestrate_ai_task(self, task_id):
#     """
#     Celery task to orchestrate complex AI tasks involving multiple agents.
#     
#     Args:
#         task_id: UUID of the AICoordinatorTask
#     """
#     # This function is deprecated - use process_ai_task_step instead
#     pass


# def _simulate_agent_collaboration(task, agents):
#     """
#     Simulate collaboration between multiple AI agents.
#     
#     Args:
#         task: AICoordinatorTask instance
#         agents: QuerySet of AIAgentProfile instances
#     
#     Returns:
#         dict: Compiled results from all agents
#     """
#     # This function is deprecated - use _process_task_by_specialization instead
#     pass


# def _simulate_agent_response(task, agent, prompt, response_type):
#     """
#     Simulate an AI agent's response to a prompt.
#     
#     Args:
#         task: AICoordinatorTask instance
#         agent: AIAgentProfile instance
#         prompt: The prompt for the agent
#         response_type: Type of response being generated
#     
#     Returns:
#         dict: Simulated agent response
#     """
#     # This function is deprecated - use _process_task_by_specialization instead
#     pass


@shared_task(bind=True, max_retries=3)
def process_ai_task_step(self, task_id):
    """
    Process an AI task step by the assigned AI agent.
    
    Args:
        task_id: UUID of the AITask
    """
    try:
        # Get the AI task
        task = AITask.objects.get(id=task_id)
        
        # Update status to in progress
        task.status = 'in_progress'
        task.save(update_fields=['status', 'updated_at'])
        
        # Log task start
        AIInteractionLog.objects.create(
            tenant=task.tenant,
            ai_profile=task.assignee_agent,
            ai_task=task,
            role='ai_agent',
            message_content=f"Starting to process task: {task.objective}"
        )
        
        # Process based on agent specialization
        result = _process_task_by_specialization(task)
        
        # Update task with results
        task.result_data = result
        task.status = 'completed'
        task.save(update_fields=['status', 'result_data', 'updated_at'])
        
        # Log completion
        AIInteractionLog.objects.create(
            tenant=task.tenant,
            ai_profile=task.assignee_agent,
            ai_task=task,
            role='ai_agent',
            message_content=f"Task completed successfully. Results: {str(result)[:200]}..."
        )
        
        logger.info(f"AI task {task_id} completed by {task.assignee_agent.name}")
        return True
        
    except AITask.DoesNotExist:
        logger.error(f"AITask {task_id} not found")
        return False
        
    except Exception as exc:
        logger.error(f"Error processing AI task {task_id}: {str(exc)}")
        
        # Update task with error
        try:
            task = AITask.objects.get(id=task_id)
            task.status = 'failed'
            task.result_data = {'error': str(exc)}
            task.save(update_fields=['status', 'result_data', 'updated_at'])
            
            # Log error
            AIInteractionLog.objects.create(
                tenant=task.tenant,
                ai_profile=task.assignee_agent,
                ai_task=task,
                role='ai_agent',
                message_content=f"Task failed with error: {str(exc)}"
            )
        except AITask.DoesNotExist:
            pass
        
        # Retry the task
        raise self.retry(countdown=60, exc=exc)


@shared_task
def delegate_ai_task(task_id, target_agent_id):
    """
    Delegate an AI task to another AI agent.
    
    Args:
        task_id: UUID of the AITask
        target_agent_id: UUID of the target AIProfile
    """
    try:
        task = AITask.objects.get(id=task_id)
        target_agent = AIProfile.objects.get(id=target_agent_id)
        
        # Create sub-task
        sub_task = AITask.objects.create(
            tenant=task.tenant,
            requester=task.requester,
            assignee_agent=target_agent,
            parent_task=task,
            objective=f"Sub-task delegated from {task.assignee_agent.name}: {task.objective}",
            context_data=task.context_data
        )
        
        # Log delegation
        AIInteractionLog.objects.create(
            tenant=task.tenant,
            ai_profile=task.assignee_agent,
            ai_task=task,
            role='ai_agent',
            message_content=f"Delegating sub-task to {target_agent.name}"
        )
        
        # Process the sub-task
        process_ai_task_step.delay(str(sub_task.id))
        
        logger.info(f"Task {task_id} delegated to {target_agent.name}")
        return True
        
    except (AITask.DoesNotExist, AIProfile.DoesNotExist) as e:
        logger.error(f"Error delegating task: {str(e)}")
        return False


@shared_task
def trigger_workflow_by_event(event_type, event_data, tenant_id):
    """
    Trigger AI workflows based on system events.
    
    Args:
        event_type: Type of event (e.g., 'campaign_created', 'lead_converted')
        event_data: Data associated with the event
        tenant_id: UUID of the tenant
    """
    try:
        from core.models import Tenant
        tenant = Tenant.objects.get(id=tenant_id)
        
        # Find workflows that should be triggered by this event
        # This would integrate with the automation workflow system
        logger.info(f"Triggering workflows for event {event_type} in tenant {tenant_id}")
        
        # Example: Create AI task for campaign optimization when campaign is created
        if event_type == 'campaign_created':
            # Find marketing strategy agent
            agent = AIProfile.objects.filter(
                models.Q(tenant=tenant) | models.Q(tenant__isnull=True),
                specialization='marketing_strategy',
                is_active=True
            ).first()
            
            if agent:
                task = AITask.objects.create(
                    tenant=tenant,
                    assignee_agent=agent,
                    objective=f"Analyze and optimize newly created campaign: {event_data.get('campaign_name', 'Unknown')}",
                    context_data={
                        'event_type': event_type,
                        'event_data': event_data,
                        'trigger_type': 'automatic'
                    }
                )
                
                # Process the task
                process_ai_task_step.delay(str(task.id))
        
        return True
        
    except Exception as e:
        logger.error(f"Error triggering workflow for event {event_type}: {str(e)}")
        return False


def _process_task_by_specialization(task):
    """
    Process AI task based on the agent's specialization.
    
    Args:
        task: AITask instance
    
    Returns:
        dict: Processing results
    """
    agent = task.assignee_agent
    specialization = agent.specialization
    objective = task.objective
    context = task.context_data
    
    # Simulate AI processing based on specialization
    if specialization == 'marketing_strategy':
        return {
            'analysis': f"Marketing strategy analysis for: {objective}",
            'recommendations': [
                "Focus on customer segmentation",
                "Implement personalized messaging",
                "Optimize channel mix"
            ],
            'metrics_to_track': ['conversion_rate', 'customer_lifetime_value', 'acquisition_cost'],
            'estimated_impact': '15-25% improvement in conversion rates'
        }
    
    elif specialization == 'budget_analysis':
        return {
            'analysis': f"Budget analysis for: {objective}",
            'recommendations': [
                "Reallocate budget to high-performing channels",
                "Implement automated budget optimization",
                "Set up performance-based budget allocation"
            ],
            'cost_savings': '20-30% reduction in inefficient spending',
            'roi_improvement': 'Expected 25% increase in overall ROI'
        }
    
    elif specialization == 'content_creation':
        return {
            'analysis': f"Content strategy for: {objective}",
            'recommendations': [
                "Create pillar content pieces",
                "Develop content calendar",
                "Implement content repurposing strategy"
            ],
            'content_ideas': [
                "How-to guides for target audience",
                "Case studies showcasing success",
                "Industry trend analysis"
            ],
            'estimated_engagement': '40-60% increase in content engagement'
        }
    
    elif specialization == 'campaign_optimization':
        return {
            'analysis': f"Campaign optimization for: {objective}",
            'recommendations': [
                "A/B test landing pages",
                "Optimize ad copy and creatives",
                "Implement retargeting strategies"
            ],
            'optimization_opportunities': [
                "Improve conversion rate by 20%",
                "Reduce cost per acquisition by 15%",
                "Increase click-through rate by 25%"
            ]
        }
    
    elif specialization == 'lead_nurturing':
        return {
            'analysis': f"Lead nurturing strategy for: {objective}",
            'recommendations': [
                "Create personalized nurture sequences",
                "Implement lead scoring",
                "Set up automated follow-up workflows"
            ],
            'nurture_sequences': [
                "Welcome series for new leads",
                "Educational content for prospects",
                "Re-engagement campaigns for cold leads"
            ],
            'expected_conversion': '30-50% improvement in lead conversion'
        }
    
    else:  # general_orchestration
        return {
            'analysis': f"General orchestration analysis for: {objective}",
            'recommendations': [
                "Coordinate cross-channel strategy",
                "Align team efforts and resources",
                "Implement comprehensive tracking"
            ],
            'next_steps': [
                "Schedule stakeholder review",
                "Create implementation timeline",
                "Set up measurement framework"
            ],
            'overall_strategy': 'Holistic approach to achieve objectives'
        }


@shared_task(bind=True, max_retries=3)
def upload_edited_image_task(self, request_id, image_data, save_as_asset=True, 
                           asset_name=None, asset_description=None, asset_tags=None):
    """
    Upload an edited image to cloud storage and optionally create a brand asset.
    
    Args:
        request_id: UUID of the ImageGenerationRequest
        image_data: Base64 encoded image data or URL
        save_as_asset: Whether to save as a brand asset
        asset_name: Name for the brand asset
        asset_description: Description for the brand asset
        asset_tags: Tags for the brand asset
    """
    try:
        # Get the image generation request
        image_request = ImageGenerationRequest.objects.get(id=request_id)
        
        # Upload image to cloud storage
        uploaded_url = _upload_image_to_storage(image_data, str(request_id))
        
        # Update the image request
        image_request.edited_image_url = uploaded_url
        image_request.is_edited = True
        image_request.save(update_fields=['edited_image_url', 'is_edited', 'updated_at'])
        
        # Create brand asset if requested
        if save_as_asset:
            _create_brand_asset(
                image_request, uploaded_url, asset_name, 
                asset_description, asset_tags or []
            )
        
        logger.info(f"Successfully uploaded edited image for request {request_id}")
        return True
        
    except ImageGenerationRequest.DoesNotExist:
        logger.error(f"ImageGenerationRequest {request_id} not found")
        return False
        
    except Exception as exc:
        logger.error(f"Error uploading edited image for request {request_id}: {str(exc)}")
        
        # Retry the task
        raise self.retry(countdown=60, exc=exc)


def _upload_image_to_storage(image_data, request_id):
    """
    Upload image data to cloud storage (S3).
    
    Args:
        image_data: Base64 encoded image data or URL
        request_id: Request ID for file naming
    
    Returns:
        str: URL of uploaded image
    """
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        
        # Handle different image data formats
        if image_data.startswith('data:image/'):
            # Base64 data URL
            header, encoded = image_data.split(",", 1)
            image_bytes = base64.b64decode(encoded)
        elif image_data.startswith(('http://', 'https://')):
            # URL - download the image
            import requests
            response = requests.get(image_data)
            response.raise_for_status()
            image_bytes = response.content
        else:
            # Assume it's base64 without data URL prefix
            image_bytes = base64.b64decode(image_data)
        
        # Generate unique filename
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f"edited_images/{request_id}_{timestamp}.png"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=image_bytes,
            ContentType='image/png',
            ACL='public-read'
        )
        
        # Return the public URL
        return f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        
    except Exception as e:
        logger.error(f"Error uploading image to S3: {str(e)}")
        raise Exception(f"Failed to upload image to cloud storage: {str(e)}")


def _create_brand_asset(image_request, file_url, asset_name, asset_description, asset_tags):
    """
    Create a brand asset from the edited image.
    
    Args:
        image_request: ImageGenerationRequest instance
        file_url: URL of the uploaded image
        asset_name: Name for the asset
        asset_description: Description for the asset
        asset_tags: Tags for the asset
    """
    try:
        # Generate asset name if not provided
        if not asset_name:
            asset_name = f"Edited Image - {image_request.prompt_text[:50]}..."
        
        # Create the brand asset
        BrandAsset.objects.create(
            tenant=image_request.tenant,
            created_by=image_request.requested_by,
            name=asset_name,
            asset_type='image',
            file_url=file_url,
            description=asset_description or f"Edited version of AI-generated image: {image_request.prompt_text}",
            tags=asset_tags,
            original_image_request=image_request,
            is_shared_with_clients=False
        )
        
        logger.info(f"Created brand asset for edited image {image_request.id}")
        
    except Exception as e:
        logger.error(f"Error creating brand asset: {str(e)}")
        # Don't raise exception here as the main upload was successful


@shared_task(bind=True, max_retries=3)
def generate_campaign_insights_task(self, campaign_id, campaign_stats_data, ai_profile_id, user_id):
    """
    Generate AI-driven insights for a campaign based on its performance data.
    
    Args:
        campaign_id: UUID of the Campaign
        campaign_stats_data: Serialized campaign statistics data
        ai_profile_id: UUID of the AIProfile generating the insights
        user_id: UUID of the user requesting the insights
    """
    try:
        # Fetch the campaign
        campaign = Campaign.objects.get(id=campaign_id)
        
        # Fetch the AI profile
        ai_profile = AIProfile.objects.get(id=ai_profile_id)
        
        # Fetch the user
        from accounts.models import CustomUser
        user = CustomUser.objects.get(id=user_id)
        
        # Construct a detailed prompt for the LLM
        prompt = _build_campaign_insights_prompt(campaign, campaign_stats_data)
        
        # Call the external LLM API
        # insights_text = _call_gemini_api_for_insights(prompt)
        insights_text = "AI insights temporarily disabled to prevent API quota issues."
        
        # Find the existing placeholder recommendation and update it
        recommendation = AIRecommendation.objects.filter(
            campaign=campaign,
            generated_by_agent=ai_profile,
            type='campaign_optimization',
            recommendation_text='AI insights are being generated...'
        ).first()
        
        if recommendation:
            # Update the existing recommendation
            recommendation.recommendation_text = insights_text
            recommendation.is_actionable = True
            recommendation.context_data.update({
                'campaign_stats': campaign_stats_data,
                'generated_at': timezone.now().isoformat()
            })
            recommendation.save(update_fields=['recommendation_text', 'is_actionable', 'context_data', 'updated_at'])
        else:
            # Create a new recommendation if placeholder doesn't exist
            recommendation = AIRecommendation.objects.create(
                tenant=campaign.tenant,
                user=user,
                type='campaign_optimization',
                recommendation_text=insights_text,
                context_data={
                    'campaign_id': str(campaign_id),
                    'campaign_stats': campaign_stats_data,
                    'generated_at': timezone.now().isoformat()
                },
                generated_by_agent=ai_profile,
                campaign=campaign,
                is_actionable=True
            )
        
        logger.info(f"Successfully generated campaign insights for campaign {campaign_id}")
        return True
        
    except Campaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found")
        return False
        
    except AIProfile.DoesNotExist:
        logger.error(f"AIProfile {ai_profile_id} not found")
        return False
        
    except Exception as exc:
        logger.error(f"Error generating campaign insights for campaign {campaign_id}: {str(exc)}")
        
        # Try to refund credits if the task fails
        try:
            campaign = Campaign.objects.get(id=campaign_id)
            tenant = campaign.tenant
            tenant.ai_planning_requests_used_current_period = max(0, tenant.ai_planning_requests_used_current_period - 1)
            tenant.save(update_fields=['ai_planning_requests_used_current_period'])
            logger.info(f"Refunded 1 AI planning credit to tenant {tenant.id}")
        except Exception as refund_error:
            logger.error(f"Failed to refund credits: {str(refund_error)}")
        
        # Retry the task
        raise self.retry(countdown=60, exc=exc)


def _build_campaign_insights_prompt(campaign, campaign_stats):
    """
    Build a detailed prompt for campaign insights generation.
    
    Args:
        campaign: Campaign instance
        campaign_stats: Serialized campaign statistics
    
    Returns:
        str: Detailed prompt for LLM
    """
    # Extract key metrics
    open_rate = campaign_stats.get('open_rate', 0)
    click_rate = campaign_stats.get('click_rate', 0)
    conversions = campaign_stats.get('conversions', 0)
    conversion_value = campaign_stats.get('conversion_value', 0)
    total_emails_sent = campaign_stats.get('total_emails_sent', 0)
    social_engagement_rate = campaign_stats.get('social_engagement_rate', 0)
    sms_delivery_rate = campaign_stats.get('sms_delivery_rate', 0)
    
    # Build the prompt
    prompt = f"""
You are an expert marketing strategist and campaign optimization specialist. Analyze the following campaign performance data and provide 3 actionable insights for improvement.

CAMPAIGN DETAILS:
- Name: {campaign.name}
- Type: {campaign.campaign_type}
- Status: {campaign.status}
- Objective: {campaign.objective or 'Not specified'}
- Budget: ${campaign.budget_allocated}

PERFORMANCE METRICS:
- Total Emails Sent: {total_emails_sent}
- Open Rate: {open_rate}%
- Click Rate: {click_rate}%
- Conversions: {conversions}
- Conversion Value: ${conversion_value}
- Social Engagement Rate: {social_engagement_rate}%
- SMS Delivery Rate: {sms_delivery_rate}%

Based on these statistics, provide 3 specific, actionable insights for campaign improvement. Focus on:
1. Performance optimization opportunities
2. Audience targeting improvements
3. Content and messaging enhancements

Each insight should be practical, measurable, and include specific recommendations for implementation. Consider industry benchmarks and best practices.

Format your response as a clear, structured analysis with numbered insights.
"""
    
    return prompt.strip()


def _call_gemini_api_for_insights(prompt):
    """
    Call Gemini API to generate campaign insights.
    
    Args:
        prompt: The detailed prompt for insights generation
    
    Returns:
        str: Generated insights from Gemini
    
    Raises:
        Exception: If API call fails
    """
    return call_gemini_for_insights(prompt=prompt) 


def analyze_project_health(project_id: str) -> dict:
    """
    Analyze project health using Promana AI.
    
    Args:
        project_id: ID of the project to analyze
    
    Returns:
        dict: Health analysis results
    """
    try:
        project = Project.objects.get(id=project_id)
        
        # Gather project data for analysis
        project_data = {
            'name': project.name,
            'status': project.status,
            'progress_percentage': project.progress_percentage,
            'budget_utilization': project.budget_utilization,
            'days_remaining': project.days_remaining,
            'is_overdue': project.is_overdue,
            'total_tasks': project.tasks.count(),
            'completed_tasks': project.tasks.filter(status='completed').count(),
            'overdue_tasks': project.tasks.filter(
                end_date__lt=timezone.now().date(),
                status__in=['pending', 'in_progress']
            ).count(),
            'team_size': project.team_memberships.count(),
            'risks_count': project.risks.filter(status='active').count()
        }
        
        # Create analysis prompt
        prompt = f"""
        Analyze the following project data and provide a comprehensive health assessment:
        
        Project: {project_data['name']}
        Status: {project_data['status']}
        Progress: {project_data['progress_percentage']}%
        Budget Utilization: {project_data['budget_utilization']}%
        Days Remaining: {project_data['days_remaining']}
        Is Overdue: {project_data['is_overdue']}
        Total Tasks: {project_data['total_tasks']}
        Completed Tasks: {project_data['completed_tasks']}
        Overdue Tasks: {project_data['overdue_tasks']}
        Team Size: {project_data['team_size']}
        Active Risks: {project_data['risks_count']}
        
        Please provide:
        1. Overall health score (0-100)
        2. Risk level assessment (low/medium/high/critical)
        3. Predicted completion date
        4. Top 3 key risks
        5. Top recommendation for improvement
        6. Budget burn rate analysis
        """
        
        # Call Promana AI (disabled for automatic processes to prevent quota issues)
        # response = call_gemini_for_ai_agent(
        #     prompt=prompt,
        #     agent_name="Promana",
        #     agent_personality="A project management expert who specializes in planning, scheduling, resource allocation, and progress tracking. Promana ensures projects stay on time, within budget, and meet quality standards.",
        #     specialization="project_management",
        #     context=project_data
        # )
        response = f"Project analysis temporarily disabled to prevent API quota issues. Your request was: {prompt}"
        
        # Parse response and update project
        analysis_result = parse_promana_analysis(response, project_data)
        
        # Update project with analysis results
        project.health_score = analysis_result.get('health_score', project.health_score)
        project.risk_level = analysis_result.get('risk_level', project.risk_level)
        project.predicted_completion_date = analysis_result.get('predicted_completion_date')
        project.last_promana_analysis = timezone.now()
        project.save()
        
        # Create insights
        create_promana_insights(project, analysis_result)
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing project health: {str(e)}")
        return {'error': str(e)}

def suggest_task_assignee(task_id: str) -> dict:
    """
    Suggest the best assignee for a task using Promana AI.
    
    Args:
        task_id: ID of the task
    
    Returns:
        dict: Assignment recommendation
    """
    try:
        task = ProjectTask.objects.get(id=task_id)
        project = task.project
        
        # Gather team member data
        team_members = []
        for member in project.team_memberships.filter(is_active=True):
            assigned_hours = member.user.assigned_tasks.filter(
                project=project,
                status__in=['pending', 'in_progress']
            ).aggregate(total=models.Sum('estimated_hours'))['total'] or 0
            
            team_members.append({
                'id': member.user.id,
                'name': f"{member.user.first_name} {member.user.last_name}",
                'email': member.user.email,
                'role': member.role,
                'skills': member.skills,
                'capacity_hours': float(member.capacity_hours),
                'assigned_hours': float(assigned_hours),
                'utilization': round((assigned_hours / member.capacity_hours) * 100, 2) if member.capacity_hours > 0 else 0
            })
        
        # Create recommendation prompt
        prompt = f"""
        Analyze the following task and team members to suggest the best assignee:
        
        Task: {task.name}
        Description: {task.description}
        Priority: {task.priority}
        Estimated Hours: {task.estimated_hours}
        Start Date: {task.start_date}
        End Date: {task.end_date}
        
        Team Members:
        {json.dumps(team_members, indent=2)}
        
        Please recommend the best assignee based on:
        1. Skills match
        2. Current workload
        3. Availability
        4. Experience with similar tasks
        
        Provide:
        1. Recommended assignee ID
        2. Confidence score (0-100)
        3. Reasoning
        4. Alternative suggestions
        """
        
        # Call Promana AI (disabled for automatic processes to prevent quota issues)
        # response = call_gemini_for_ai_agent(
        #     prompt=prompt,
        #     agent_name="Promana",
        #     agent_personality="A project management expert who specializes in planning, scheduling, resource allocation, and progress tracking.",
        #     specialization="project_management",
        #     context={'task': task.name, 'team_size': len(team_members)}
        # )
        response = f"Task assignment temporarily disabled to prevent API quota issues. Your request was: {prompt}"
        
        return parse_assignee_recommendation(response, team_members)
        
    except Exception as e:
        logger.error(f"Error suggesting task assignee: {str(e)}")
        return {'error': str(e)}

def generate_project_insights(project_id: str) -> dict:
    """
    Generate comprehensive project insights using Promana AI.
    
    Args:
        project_id: ID of the project
    
    Returns:
        dict: Generated insights
    """
    try:
        project = Project.objects.get(id=project_id)
        
        # Gather comprehensive project data
        project_data = {
            'basic_info': {
                'name': project.name,
                'status': project.status,
                'progress': project.progress_percentage,
                'budget_utilization': project.budget_utilization,
                'days_remaining': project.days_remaining
            },
            'tasks': {
                'total': project.tasks.count(),
                'completed': project.tasks.filter(status='completed').count(),
                'in_progress': project.tasks.filter(status='in_progress').count(),
                'overdue': project.tasks.filter(
                    end_date__lt=timezone.now().date(),
                    status__in=['pending', 'in_progress']
                ).count(),
                'blocked': project.tasks.filter(status='blocked').count()
            },
            'team': {
                'size': project.team_memberships.count(),
                'utilization': project.team_memberships.aggregate(
                    avg_utilization=models.Avg('capacity_hours')
                )['avg_utilization'] or 0
            },
            'risks': {
                'active': project.risks.filter(status='active').count(),
                'high_priority': project.risks.filter(
                    status='active',
                    probability__in=['high', 'critical']
                ).count()
            }
        }
        
        # Create insights prompt
        prompt = f"""
        Analyze this project data and provide comprehensive insights:
        
        {json.dumps(project_data, indent=2)}
        
        Please provide:
        1. Performance analysis
        2. Risk assessment
        3. Resource utilization insights
        4. Timeline analysis
        5. Budget analysis
        6. Top 3 actionable recommendations
        7. Success probability
        8. Areas of concern
        """
        
        # Call Promana AI
        response = call_gemini_for_insights(
            prompt=prompt,
            data_context=f"Project: {project.name}, Type: {project.project_type}"
        )
        
        return parse_project_insights(response, project_data)
        
    except Exception as e:
        logger.error(f"Error generating project insights: {str(e)}")
        return {'error': str(e)}

def predict_project_completion(project_id: str) -> dict:
    """
    Predict project completion date and identify critical path using Promana AI.
    
    Args:
        project_id: ID of the project
    
    Returns:
        dict: Prediction results
    """
    try:
        project = Project.objects.get(id=project_id)
        
        # Gather task dependency data
        tasks_data = []
        for task in project.tasks.all():
            dependencies = [dep.name for dep in task.dependencies.all()]
            tasks_data.append({
                'name': task.name,
                'status': task.status,
                'start_date': str(task.start_date),
                'end_date': str(task.end_date),
                'estimated_hours': float(task.estimated_hours) if task.estimated_hours else 0,
                'actual_hours': float(task.actual_hours),
                'dependencies': dependencies,
                'priority': task.priority,
                'assigned_to': task.assigned_to.email if task.assigned_to else None
            })
        
        # Create prediction prompt
        prompt = f"""
        Analyze the project timeline and predict completion:
        
        Project: {project.name}
        Current Progress: {project.progress_percentage}%
        Original End Date: {project.end_date}
        Days Remaining: {project.days_remaining}
        
        Tasks:
        {json.dumps(tasks_data, indent=2)}
        
        Please provide:
        1. Predicted completion date
        2. Critical path analysis
        3. Bottleneck identification
        4. Schedule variance
        5. Recommendations for acceleration
        6. Risk factors affecting timeline
        """
        
        # Call Promana AI
        response = call_gemini_for_ai_agent(
            prompt=prompt,
            agent_name="Promana",
            agent_personality="A project management expert specializing in scheduling and timeline optimization.",
            specialization="project_management",
            context={'project_name': project.name, 'task_count': len(tasks_data)}
        )
        
        return parse_completion_prediction(response, project_data)
        
    except Exception as e:
        logger.error(f"Error predicting project completion: {str(e)}")
        return {'error': str(e)}

def analyze_resource_utilization(project_id: str) -> dict:
    """
    Analyze resource utilization and suggest optimizations using Promana AI.
    
    Args:
        project_id: ID of the project
    
    Returns:
        dict: Resource analysis results
    """
    try:
        project = Project.objects.get(id=project_id)
        
        # Gather resource data
        resources_data = []
        for member in project.team_memberships.filter(is_active=True):
            assigned_tasks = member.user.assigned_tasks.filter(project=project)
            total_assigned_hours = assigned_tasks.aggregate(
                total=models.Sum('estimated_hours')
            )['total'] or 0
            
            completed_hours = assigned_tasks.filter(status='completed').aggregate(
                total=models.Sum('actual_hours')
            )['total'] or 0
            
            resources_data.append({
                'name': f"{member.user.first_name} {member.user.last_name}",
                'role': member.role,
                'skills': member.skills,
                'capacity_hours': float(member.capacity_hours),
                'assigned_hours': float(total_assigned_hours),
                'completed_hours': float(completed_hours),
                'utilization': round((total_assigned_hours / member.capacity_hours) * 100, 2) if member.capacity_hours > 0 else 0,
                'hourly_rate': float(member.hourly_rate) if member.hourly_rate else 0
            })
        
        # Create analysis prompt
        prompt = f"""
        Analyze resource utilization for this project:
        
        Resources:
        {json.dumps(resources_data, indent=2)}
        
        Please provide:
        1. Overall resource utilization analysis
        2. Over-allocated resources
        3. Under-utilized resources
        4. Skill gap analysis
        5. Cost optimization opportunities
        6. Resource reallocation recommendations
        7. Capacity planning insights
        """
        
        # Call Promana AI
        response = call_gemini_for_insights(
            prompt=prompt,
            data_context=f"Project: {project.name}, Team Size: {len(resources_data)}"
        )
        
        return parse_resource_analysis(response, resources_data)
        
    except Exception as e:
        logger.error(f"Error analyzing resource utilization: {str(e)}")
        return {'error': str(e)}

# Helper functions for parsing AI responses
def parse_promana_analysis(response: str, project_data: dict) -> dict:
    """Parse Promana analysis response."""
    try:
        # This is a simplified parser - in production, you'd use more sophisticated parsing
        lines = response.split('\n')
        result = {
            'health_score': 75,  # Default
            'risk_level': 'medium',
            'predicted_completion_date': None,
            'key_risks': [],
            'top_recommendation': '',
            'budget_analysis': ''
        }
        
        for line in lines:
            if 'health score' in line.lower():
                # Extract score
                import re
                score_match = re.search(r'(\d+)', line)
                if score_match:
                    result['health_score'] = int(score_match.group(1))
            elif 'risk level' in line.lower():
                if 'high' in line.lower():
                    result['risk_level'] = 'high'
                elif 'critical' in line.lower():
                    result['risk_level'] = 'critical'
                elif 'low' in line.lower():
                    result['risk_level'] = 'low'
        
        return result
    except Exception as e:
        logger.error(f"Error parsing Promana analysis: {str(e)}")
        return {'health_score': 75, 'risk_level': 'medium'}

def parse_assignee_recommendation(response: str, team_members: list) -> dict:
    """Parse assignee recommendation response."""
    try:
        # Simplified parsing - extract key information
        result = {
            'recommended_assignee_id': None,
            'confidence_score': 75,
            'reasoning': response,
            'alternatives': []
        }
        
        # Look for user IDs in the response
        for member in team_members:
            if member['name'] in response or member['email'] in response:
                result['recommended_assignee_id'] = member['id']
                break
        
        return result
    except Exception as e:
        logger.error(f"Error parsing assignee recommendation: {str(e)}")
        return {'error': str(e)}

def parse_project_insights(response: str, project_data: dict) -> dict:
    """Parse project insights response."""
    return {
        'insights': response,
        'project_data': project_data,
        'generated_at': timezone.now().isoformat()
    }

def parse_completion_prediction(response: str, project_data: dict) -> dict:
    """Parse completion prediction response."""
    return {
        'prediction': response,
        'project_data': project_data,
        'generated_at': timezone.now().isoformat()
    }

def parse_resource_analysis(response: str, resources_data: list) -> dict:
    """Parse resource analysis response."""
    return {
        'analysis': response,
        'resources_data': resources_data,
        'generated_at': timezone.now().isoformat()
    }

def create_promana_insights(project: Project, analysis_result: dict):
    """Create Promana insights based on analysis."""
    try:
        # Create risk insights
        if analysis_result.get('risk_level') in ['high', 'critical']:
            PromanaInsight.objects.create(
                tenant=project.tenant,
                project=project,
                insight_type='risk_alert',
                title=f'High Risk Level: {analysis_result.get("risk_level", "unknown")}',
                description=f'Project "{project.name}" has been identified as high risk by Promana analysis.',
                confidence_score=90,
                is_actionable=True
            )
        
        # Create health score insights
        health_score = analysis_result.get('health_score', 75)
        if health_score < 70:
            PromanaInsight.objects.create(
                tenant=project.tenant,
                project=project,
                insight_type='risk_alert',
                title='Low Health Score',
                description=f'Project health score is {health_score}/100. Immediate attention recommended.',
                confidence_score=85,
                is_actionable=True
            )
        
        # Create recommendation insights
        if analysis_result.get('top_recommendation'):
            PromanaInsight.objects.create(
                tenant=project.tenant,
                project=project,
                insight_type='recommendation',
                title='Promana Recommendation',
                description=analysis_result['top_recommendation'],
                confidence_score=80,
                is_actionable=True
            )
            
    except Exception as e:
        logger.error(f"Error creating Promana insights: {str(e)}") 