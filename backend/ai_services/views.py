import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db import transaction, models
from django.utils import timezone
from django.core.management import call_command
from django.conf import settings
from .models import (
    ContentGenerationRequest, ImageGenerationRequest, AIRecommendation,
    AIProfile, AITask, AIInteractionLog, StructuraInsight, AIEcosystemHealth
)
from .serializers import (
    ContentGenerationRequestSerializer,
    ContentGenerationRequestCreateSerializer,
    ContentGenerationStatusSerializer,
    ImageGenerationRequestSerializer,
    ImageGenerationRequestCreateSerializer,
    ImageEditRequestSerializer,
    AIRecommendationSerializer,
    AIRecommendationCreateSerializer,
    AIPlanningRequestSerializer,
    AIProfileSerializer,
    AITaskSerializer,
    AITaskCreateSerializer,
    AIInteractionLogSerializer,
    AIOrchestrationRequestSerializer,
    StructuraInsightSerializer,
    StructuraInsightCreateSerializer,
    AIEcosystemHealthSerializer
)
from .tasks import generate_content_task, generate_image_task, upload_edited_image_task
from .gemini_utils import call_gemini_for_ai_agent, get_quota_status
from core.models import BrandProfile, Tenant, BrandAsset
from accounts.models import CustomUser

logger = logging.getLogger(__name__)


class GeminiChatView(APIView):
    """
    API view for real-time chat with AI agents using Gemini.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    def get(self, request):
        """
        Get available AI agents for chat.
        """
        try:
            # Check if Gemini API is configured
            if not settings.GOOGLE_GEMINI_API_KEY:
                return Response(
                    {
                        'available_agents': [
                            {
                                'id': 1,
                                'name': 'Marketing Assistant',
                                'specialization': 'Marketing Strategy',
                                'personality_description': 'Professional marketing expert',
                                'api_model_name': 'gemini-1.5-pro',
                                'status': 'demo_mode'
                            }
                        ],
                        'message': 'Demo mode - AI features will be available once API key is configured'
                    },
                    status=status.HTTP_200_OK
                )
            
            # Get available AI agents (global agents have tenant=None)
            agents = AIProfile.objects.filter(is_active=True, tenant__isnull=True)
            agent_list = []
            
            for agent in agents:
                agent_list.append({
                    'id': agent.id,
                    'name': agent.name,
                    'specialization': agent.specialization,
                    'personality_description': agent.personality_description,
                    'api_model_name': agent.api_model_name
                })
            
            return Response({
                'available_agents': agent_list,
                'message': 'Available AI agents for chat'
            })
            
        except Exception as e:
            logger.error(f"Error getting AI agents: {str(e)}")
            return Response(
                {
                    'error': 'Failed to get AI agents',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """
        Handle chat messages with AI agents using Gemini.
        
        Expected JSON body:
        {
            "message": "string",
            "agent_name": "string",
            "agent_specialization": "string",
            "conversation_history": [{"role": "user|ai_agent", "content": "string"}]
        }
        """
        try:
            # Check if Gemini API key is configured
            if not settings.GOOGLE_GEMINI_API_KEY:
                return Response(
                    {
                        'response': 'I\'m currently in demo mode. To enable full AI chat functionality, please configure the Gemini API key in the backend settings.',
                        'agent_name': agent_name or 'Demo Assistant',
                        'demo_mode': True,
                        'message': 'Demo mode - AI features will be available once API key is configured'
                    },
                    status=status.HTTP_200_OK
                )
            
            # Check quota status
            quota_status = get_quota_status()
            if quota_status['quota_exceeded']:
                return Response(
                    {
                        'error': 'API quota exceeded',
                        'message': f"Daily quota: {quota_status['daily_used']}/{quota_status['daily_limit']}, Minute quota: {quota_status['minute_used']}/{quota_status['minute_limit']}",
                        'quota_status': quota_status
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Get request data
            message = request.data.get('message')
            agent_name = request.data.get('agent_name')
            agent_specialization = request.data.get('agent_specialization')
            conversation_history = request.data.get('conversation_history', [])
            
            if not message or not agent_name:
                return Response(
                    {
                        'error': 'Missing required fields',
                        'message': 'message and agent_name are required'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Build context from conversation history
            context = {
                'conversation_history': conversation_history,
                'user': request.user.email
            }
            
            # Call Gemini API
            response = call_gemini_for_ai_agent(
                prompt=message,
                agent_name=agent_name,
                agent_personality=f"Professional AI agent specializing in {agent_specialization}",
                specialization=agent_specialization,
                context=context
            )
            
            return Response({
                'response': response,
                'agent_name': agent_name,
                'quota_status': get_quota_status()
            })
            
        except Exception as e:
            logger.error(f"Error processing chat message: {str(e)}")
            return Response(
                {
                    'error': 'Failed to process chat message',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

            context = {
                'conversation_length': len(conversation_history),
                'previous_messages': conversation_history[-5:] if conversation_history else []  # Last 5 messages for context
            }
            
            # Get agent personality based on specialization
            agent_personalities = {
                'lead_nurturing': 'A lead nurturing specialist who develops personalized engagement strategies to convert prospects into customers through targeted communication.',
                'brand_identity': 'Creative, visually-driven, and brand-conscious. Helps develop and maintain a cohesive brand identity across all touchpoints.',
                'campaign_optimization': 'Data-driven campaign optimization assistant who analyzes performance metrics and provides actionable recommendations to improve ROI.',
                'budget_analysis': 'Financial expert who provides insights on budget allocation, cost optimization, and ROI analysis.',
                'content_creation': 'Creative content specialist who crafts engaging, brand-aligned content across all channels.',
                'general': 'A helpful AI assistant specializing in marketing and business strategy.'
            }
            
            agent_personality = agent_personalities.get(agent_specialization, agent_personalities['general'])
            
            # Call Gemini API
            response = call_gemini_for_ai_agent(
                prompt=message,
                agent_name=agent_name,
                agent_personality=agent_personality,
                specialization=agent_specialization,
                context=context
            )
            
            # Log the interaction (skip tenant requirement for now)
            try:
                # Skip logging for now since tenant field is required but we removed tenant restrictions
                # TODO: Update AIInteractionLog model to make tenant optional
                pass
            except Exception as e:
                logger.warning(f"Failed to log AI interaction: {str(e)}")
            
            return Response({
                'response': response,
                'agent_name': agent_name,
                'agent_specialization': agent_specialization,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Gemini chat error: {str(e)}")
            return Response(
                {
                    'error': 'Failed to process chat message',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContentGenerationView(APIView):
    """
    API view for generating AI content.
    Accepts content generation requests and dispatches async tasks.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    def post(self, request):
        """
        Create a new content generation request and dispatch async task.
        
        Expected JSON body:
        {
            "prompt": "string",
            "content_type": "email_subject|email_body|social_post|...",
            "context_data": {} (optional)
        }
        """
        try:
            # Validate request data
            serializer = ContentGenerationRequestCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Check if user has sufficient credits (placeholder logic)
            if not self._check_user_credits(request.user):
                return Response(
                    {
                        'error': 'Insufficient credits',
                        'message': 'You need at least 1 credit to generate content.'
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )
            
            # Create the content generation request
            content_request = ContentGenerationRequest.objects.create(
                requested_by=request.user,
                prompt_text=serializer.validated_data['prompt_text'],
                content_type=serializer.validated_data['content_type'],
                context_data=serializer.validated_data.get('context_data', {})
            )
            
            # Dispatch async task
            task = generate_content_task.delay(str(content_request.id))
            
            logger.info(f"Content generation task dispatched: {task.id} for request {content_request.id}")
            
            # Return immediate response
            return Response(
                {
                    'request_id': str(content_request.id),
                    'status': 'pending',
                    'message': 'Content generation request submitted successfully.',
                    'task_id': task.id
                },
                status=status.HTTP_202_ACCEPTED
            )
            
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating content generation request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'message': 'Failed to create content generation request.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _check_user_credits(self, user):
        """
        Check if user has sufficient credits for content generation.
        This is a placeholder implementation - replace with actual credit system.
        """
        # TODO: Implement actual credit checking logic
        # For now, assume all users have sufficient credits
        return True


class ContentGenerationStatusView(APIView):
    """
    API view for checking content generation status.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    def get(self, request, request_id):
        """
        Get the status and results of a content generation request.
        
        Args:
            request_id: UUID of the ContentGenerationRequest
        """
        try:
            # Get the content generation request
            content_request = get_object_or_404(
                ContentGenerationRequest,
                id=request_id
            )
            
            # Serialize the response
            serializer = ContentGenerationStatusSerializer(content_request)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ContentGenerationRequest.DoesNotExist:
            return Response(
                {'error': 'Request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving content generation status: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def content_generation_history(request):
    """
    Get the user's content generation history.
    """
    try:
        # Get user's content generation requests
        requests = ContentGenerationRequest.objects.filter(
            requested_by=request.user
        ).order_by('-created_at')[:50]  # Limit to last 50 requests
        
        serializer = ContentGenerationRequestSerializer(requests, many=True)
        
        return Response({
            'requests': serializer.data,
            'total_count': requests.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error retrieving content generation history: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_content_generation(request, request_id):
    """
    Cancel a pending content generation request.
    """
    try:
        # Get the content generation request
        content_request = get_object_or_404(
            ContentGenerationRequest,
            id=request_id,
            requested_by=request.user
        )
        
        # Check if request can be cancelled
        if content_request.status not in ['pending', 'processing']:
            return Response(
                {
                    'error': 'Cannot cancel request',
                    'message': f'Request is already {content_request.status}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the request
        content_request.status = 'cancelled'
        content_request.save(update_fields=['status', 'updated_at'])
        
        # TODO: Cancel the Celery task if it's still running
        # This would require storing the task ID and using Celery's revoke functionality
        
        return Response(
            {
                'message': 'Content generation request cancelled successfully',
                'request_id': str(content_request.id),
                'status': 'cancelled'
            },
            status=status.HTTP_200_OK
        )
        
    except ContentGenerationRequest.DoesNotExist:
        return Response(
            {'error': 'Request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error cancelling content generation: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class GenerateImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def post(self, request):
        user = request.user
        prompt = request.data.get('prompt')
        brand_profile_id = request.data.get('brand_profile_id')
        design_type = request.data.get('design_type', 'general')
        design_parameters = request.data.get('design_parameters', {})
        credits_cost = 1  # Placeholder: 1 credit per image
        
        if not prompt:
            return Response({'detail': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Skip credit checking for now since tenant system was simplified
        # TODO: Implement user-based credit system
        
        brand_profile = None
        if brand_profile_id:
            brand_profile = get_object_or_404(BrandProfile, id=brand_profile_id)
        
        req = ImageGenerationRequest.objects.create(
            requested_by=user,
            prompt_text=prompt,
            brand_profile=brand_profile,
            design_type=design_type,
            design_parameters=design_parameters,
            credits_cost=credits_cost,
            status='pending',
        )
        # Dispatch Celery task with enhanced parameters
        generate_image_task.delay(str(req.id))
        return Response({'id': str(req.id), 'status': req.status}, status=status.HTTP_201_CREATED)

class ImageGenerationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get(self, request, request_id):
        req = get_object_or_404(ImageGenerationRequest, id=request_id)
        serializer = ImageGenerationRequestSerializer(req)
        return Response(serializer.data)


class AIRecommendationViewSet(ModelViewSet):
    """
    ViewSet for managing AI recommendations.
    """
    queryset = AIRecommendation.objects.all()
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type', 'is_actionable', 'is_dismissed', 'is_actioned', 'priority']
    search_fields = ['recommendation_text']
    ordering_fields = ['created_at', 'priority', 'type']
    ordering = ['-created_at']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return user's recommendations - bypass tenant filtering."""
        user = self.request.user
        return AIRecommendation.objects.all_tenants().filter(user=user)

    def perform_create(self, serializer):
        """Set user automatically - no tenant required."""
        user = self.request.user
        serializer.save(user=user)

    def perform_update(self, serializer):
        """Ensure user cannot be changed."""
        user = self.request.user
        serializer.save(user=user)

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a recommendation."""
        recommendation = self.get_object()
        recommendation.dismiss()
        return Response({'message': 'Recommendation dismissed successfully'})

    @action(detail=True, methods=['post'])
    def mark_actioned(self, request, pk=None):
        """Mark a recommendation as actioned."""
        recommendation = self.get_object()
        recommendation.mark_as_actioned()
        return Response({'message': 'Recommendation marked as actioned'})

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active (non-dismissed) recommendations."""
        queryset = self.get_queryset().filter(is_dismissed=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def actionable(self, request):
        """Get only actionable recommendations."""
        queryset = self.get_queryset().filter(is_actionable=True, is_dismissed=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AIPlanningView(APIView):
    """
    API view for AI strategic planning and recommendation generation.
    Enhanced to incorporate AI agent selection and task delegation.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    def post(self, request):
        """
        Create AI planning request with agent selection and task delegation.
        
        Expected JSON body:
        {
            "objective": "string",
            "context": {},
            "recommendation_type": "campaign_optimization|...",
            "priority": "low|medium|high|critical",
            "selected_agent_id": "uuid" (optional),
            "auto_delegate": true (optional)
        }
        """
        try:
            # Validate request data
            serializer = AIPlanningRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Check if user has sufficient credits
            if not self._check_user_credits(request.user):
                return Response(
                    {
                        'error': 'Insufficient credits',
                        'message': 'You need at least 1 planning credit for AI planning.'
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )
            
            objective = serializer.validated_data['objective']
            context = serializer.validated_data.get('context', {})
            recommendation_type = serializer.validated_data.get('recommendation_type')
            priority = serializer.validated_data.get('priority', 'medium')
            selected_agent_id = request.data.get('selected_agent_id')
            auto_delegate = request.data.get('auto_delegate', True)
            
            # Select AI agent
            ai_agent = self._select_ai_agent(selected_agent_id, recommendation_type, None)
            
            if not ai_agent:
                return Response(
                    {
                        'error': 'No suitable AI agent found',
                        'message': 'No AI agent available for this type of planning.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create AI task
            ai_task = AITask.objects.create(
                requester=request.user,
                assignee_agent=ai_agent,
                objective=objective,
                context_data={
                    'planning_type': 'strategic_planning',
                    'recommendation_type': recommendation_type,
                    'priority': priority,
                    'original_context': context
                }
            )
            
            # Log initial interaction (skip tenant requirement for now)
            # TODO: Update AIInteractionLog model to make tenant optional
            pass
            
            # Log AI agent assignment (skip tenant requirement for now)
            # TODO: Update AIInteractionLog model to make tenant optional
            pass
            
            # Process the task immediately (without Celery for now)
            from .tasks import _process_task_by_specialization
            
            # Update task status to in progress
            ai_task.status = 'in_progress'
            ai_task.save(update_fields=['status', 'updated_at'])
            
            # Process the task
            result = _process_task_by_specialization(ai_task)
            
            # Update task with results
            ai_task.result_data = result
            ai_task.status = 'completed'
            ai_task.save(update_fields=['status', 'result_data', 'updated_at'])
            
            # Create AI recommendation
            from .models import AIRecommendation
            recommendation = AIRecommendation.objects.create(
                user=request.user,
                type=recommendation_type or 'campaign_optimization',
                recommendation_text=result.get('analysis', f"Analysis completed for: {objective}"),
                context_data=result,
                is_actionable=True,
                priority=priority,
                generated_by_agent=ai_agent
            )
            
            # Log completion (skip tenant requirement for now)
            # TODO: Update AIInteractionLog model to make tenant optional
            pass
            
            # Deduct credits
            self._deduct_credits(request.user)
            
            logger.info(f"AI planning task completed: {ai_task.id} by {ai_agent.name}")
            
            return Response(
                {
                    'task_id': str(ai_task.id),
                    'recommendation_id': str(recommendation.id),
                    'assigned_agent': {
                        'id': str(ai_agent.id),
                        'name': ai_agent.name,
                        'specialization': ai_agent.get_specialization_display()
                    },
                    'status': 'completed',
                    'message': f'AI planning completed by {ai_agent.name}',
                    'result': result,
                    'recommendation': {
                        'id': str(recommendation.id),
                        'text': recommendation.recommendation_text,
                        'type': recommendation.type,
                        'priority': recommendation.priority
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in AI planning: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _select_ai_agent(self, selected_agent_id, recommendation_type, tenant):
        """Select appropriate AI agent for the planning task."""
        if selected_agent_id:
            # Use manually selected agent
            try:
                return AIProfile.objects.get(
                    id=selected_agent_id,
                    is_active=True
                )
            except AIProfile.DoesNotExist:
                return None
        
        # Auto-select based on recommendation type
        specialization_mapping = {
            'campaign_optimization': 'campaign_optimization',
            'lead_nurturing': 'lead_nurturing',
            'content_strategy': 'content_creation',
            'budget_allocation': 'budget_analysis',
            'audience_targeting': 'marketing_strategy',
        }
        
        specialization = specialization_mapping.get(recommendation_type, 'general_orchestration')
        
        # Find best matching agent
        agent = AIProfile.objects.filter(
            specialization=specialization,
            is_active=True
        ).first()
        
        # Fallback to general orchestration agent
        if not agent:
            agent = AIProfile.objects.filter(
                specialization='general_orchestration',
                is_active=True
            ).first()
        
        return agent

    def _check_user_credits(self, user):
        """Check if user has sufficient credits for AI planning."""
        # TODO: Implement actual credit checking logic
        return True

    def _deduct_credits(self, user):
        """Deduct credits for AI planning service."""
        # TODO: Implement actual credit deduction logic
        pass

    def _generate_recommendation_text(self, objective, context, recommendation_type):
        """Generate recommendation text based on objective and context."""
        # This is a placeholder implementation
        # In a real implementation, this would call an AI service
        
        base_text = f"Based on your objective: '{objective}', here are my strategic recommendations:"
        
        if recommendation_type == 'campaign_optimization':
            return f"{base_text} Focus on A/B testing your email subject lines and optimizing your call-to-action buttons. Consider segmenting your audience based on engagement levels."
        elif recommendation_type == 'lead_nurturing':
            return f"{base_text} Implement a multi-touch nurturing campaign with personalized content. Use lead scoring to prioritize high-value prospects."
        elif recommendation_type == 'content_strategy':
            return f"{base_text} Develop a content calendar with educational blog posts and case studies. Leverage user-generated content to build trust."
        elif recommendation_type == 'audience_targeting':
            return f"{base_text} Analyze your current audience demographics and create lookalike audiences. Consider retargeting campaigns for website visitors."
        else:
            return f"{base_text} Review your current marketing performance and identify areas for improvement. Consider implementing automation workflows to increase efficiency."


class AIProfileViewSet(ModelViewSet):
    """
    ViewSet for managing AI agent profiles.
    """
    queryset = AIProfile.objects.all()
    serializer_class = AIProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['specialization', 'is_active']
    search_fields = ['name', 'personality_description']
    ordering_fields = ['name', 'specialization', 'created_at']
    ordering = ['specialization', 'name']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return AI agents based on filters."""
        # Use all_tenants() to bypass tenant filtering for AI agents
        queryset = AIProfile.objects.all_tenants().filter(is_active=True)
        
        # Handle specialization filter
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        
        # Handle is_global filter
        is_global = self.request.query_params.get('is_global', None)
        if is_global is not None:
            if is_global.lower() == 'true':
                # Return global agents (tenant=None)
                queryset = queryset.filter(tenant__isnull=True)
            elif is_global.lower() == 'false':
                # Return tenant-specific agents
                queryset = queryset.filter(tenant__isnull=False)
        
        return queryset

    def perform_create(self, serializer):
        """Set tenant automatically on creation."""
        user = self.request.user
        serializer.save(tenant=user.tenant)

    def perform_update(self, serializer):
        """Ensure tenant is set correctly on update."""
        user = self.request.user
        serializer.save(tenant=user.tenant)

    @action(detail=False, methods=['get'])
    def global_agents(self, request):
        """Get global AI agents available to all tenants."""
        global_agents = AIProfile.objects.all_tenants().filter(
            tenant__isnull=True, 
            is_active=True
        )
        serializer = self.get_serializer(global_agents, many=True)
        return Response(serializer.data)


class AITaskViewSet(ModelViewSet):
    """
    ViewSet for managing AI tasks.
    """
    queryset = AITask.objects.all()
    serializer_class = AITaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'requester', 'assignee_agent']
    search_fields = ['objective']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return user's tasks - no tenant restrictions."""
        user = self.request.user
        return AITask.objects.filter(
            requester=user
        ).select_related('requester', 'assignee_agent')

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return AITaskCreateSerializer
        return AITaskSerializer

    def perform_create(self, serializer):
        """Set requester and tenant automatically on creation."""
        user = self.request.user
        
        # Extract auto_delegate and priority from validated data
        auto_delegate = serializer.validated_data.pop('auto_delegate', True)
        priority = serializer.validated_data.pop('priority', 'medium')
        
        # Create the task with tenant and requester
        task = serializer.save(tenant=user.tenant, requester=user)
        
        # If auto_delegate is True, assign the most appropriate agent
        if auto_delegate and not task.assignee_agent:
            # Assign a random active agent
            from .models import AIProfile
            available_agents = AIProfile.objects.filter(is_active=True).first()
            
            if available_agents:
                task.assignee_agent = available_agents
                task.save()
        
        # Store priority in context_data for future reference
        if task.context_data is None:
            task.context_data = {}
        task.context_data['priority'] = priority
        task.save()


class AIInteractionLogViewSet(ModelViewSet):
    """
    ViewSet for AI interaction logs (read-only for most operations).
    """
    queryset = AIInteractionLog.objects.all()
    serializer_class = AIInteractionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'ai_profile', 'ai_task']
    search_fields = ['message_content']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    http_method_names = ['get', 'head', 'options']  # Read-only
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """
        Return user's interaction logs - no tenant restrictions.
        """
        user = self.request.user
        queryset = AIInteractionLog.objects.filter(user=user)
        
        # Add prefetch for related objects
        queryset = queryset.select_related(
            'ai_profile', 'user', 'ai_task'
        ).prefetch_related(
            'ai_task__assignee_agent'
        )
        
        return queryset


class ImageGenerationRequestViewSet(ModelViewSet):
    """
    ViewSet for managing image generation requests.
    """
    queryset = ImageGenerationRequest.objects.all()
    serializer_class = ImageGenerationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'requested_by', 'brand_profile']
    search_fields = ['prompt_text']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """
        Return user's image generation requests - no tenant restrictions.
        """
        user = self.request.user
        queryset = ImageGenerationRequest.objects.filter(requested_by=user)
        
        # Add prefetch for related objects
        queryset = queryset.select_related(
            'requested_by', 'brand_profile'
        )
        
        return queryset

    def get_serializer_class(self):
        """
        Use different serializers for different actions.
        """
        if self.action == 'create':
            return ImageGenerationRequestCreateSerializer
        return ImageGenerationRequestSerializer

    def perform_create(self, serializer):
        """
        Set the requested_by field automatically and dispatch the image generation task.
        """
        user = self.request.user
        image_request = serializer.save(requested_by=user)
        
        # Dispatch Celery task with enhanced parameters
        generate_image_task.delay(str(image_request.id))

    @action(detail=True, methods=['post'])
    def save_edited_image(self, request, pk=None):
        """
        Save an edited version of the generated image.
        
        Expected JSON body:
        {
            "image_data": "base64_encoded_image_or_url",
            "save_as_asset": true,
            "asset_name": "Edited Image Name",
            "asset_description": "Description of the edited image",
            "asset_tags": ["tag1", "tag2"]
        }
        """
        try:
            # Get the image generation request
            image_request = self.get_object()
            
            # Validate the request data
            serializer = ImageEditRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Extract validated data
            image_data = serializer.validated_data['image_data']
            save_as_asset = serializer.validated_data.get('save_as_asset', True)
            asset_name = serializer.validated_data.get('asset_name')
            asset_description = serializer.validated_data.get('asset_description')
            asset_tags = serializer.validated_data.get('asset_tags', [])
            
            # Dispatch async task to upload the edited image
            task = upload_edited_image_task.delay(
                str(image_request.id),
                image_data,
                save_as_asset,
                asset_name,
                asset_description,
                asset_tags
            )
            
            logger.info(f"Image edit task dispatched: {task.id} for request {image_request.id}")
            
            return Response(
                {
                    'task_id': task.id,
                    'message': 'Image edit request submitted successfully.',
                    'status': 'processing'
                },
                status=status.HTTP_202_ACCEPTED
            )
            
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error saving edited image: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def brand_assets(self, request, pk=None):
        """
        Get brand assets linked to this image generation request.
        """
        image_request = self.get_object()
        brand_assets = BrandAsset.objects.filter(
            original_image_request=image_request
        )
        
        from core.serializers import BrandAssetSerializer
        serializer = BrandAssetSerializer(brand_assets, many=True)
        
        return Response(serializer.data)


class AIOrchestrationView(APIView):
    """
    API view for AI orchestration requests.
    Handles complex multi-agent coordination tasks.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def post(self, request):
        """
        Create a new AI orchestration task.
        
        Expected JSON body:
        {
            "objective": "string",
            "context_data": {} (optional)
        }
        """
        try:
            # Validate request data
            serializer = AIOrchestrationRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = request.user
            
            # Skip credit checking for now since tenant system was simplified
            # TODO: Implement user-based credit system
            
            # Create the coordinator task
            task = AITask.objects.create(
                requester=user,
                objective=serializer.validated_data['objective'],
                status='pending'
            )
            
            # Log initial user interaction
            AIInteractionLog.objects.create(
                coordinator_task=task,
                role='user',
                message=serializer.validated_data['objective'],
                token_cost=0
            )
            
            # Dispatch async orchestration task
            from .tasks import orchestrate_ai_task
            orchestrate_ai_task.delay(str(task.id))
            
            logger.info(f"AI orchestration task created: {task.id} by {user.email}")
            
            return Response(
                {
                                    'task_id': str(task.id),
                'status': 'pending',
                'message': 'AI orchestration task submitted successfully.'
                },
                status=status.HTTP_202_ACCEPTED
            )
            
        except ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating AI orchestration task: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'message': 'Failed to create AI orchestration task.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StructuraInsightViewSet(ModelViewSet):
    """
    ViewSet for managing Structura insights.
    """
    queryset = StructuraInsight.objects.all()
    serializer_class = StructuraInsightSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type', 'impact', 'category', 'actionable']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'confidence', 'impact']
    ordering = ['-created_at']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return all insights."""
        return StructuraInsight.objects.all()

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return StructuraInsightCreateSerializer
        return StructuraInsightSerializer

    def perform_create(self, serializer):
        """Create without tenant requirement."""
        serializer.save()

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active insights."""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get insights filtered by type."""
        insight_type = request.query_params.get('type')
        if insight_type:
            queryset = self.get_queryset().filter(type=insight_type)
        else:
            queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AIEcosystemHealthViewSet(ModelViewSet):
    """
    ViewSet for managing AI ecosystem health.
    """
    queryset = AIEcosystemHealth.objects.all()
    serializer_class = AIEcosystemHealthSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']  # No delete
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return all ecosystem health records."""
        return AIEcosystemHealth.objects.all()

    def perform_create(self, serializer):
        """Create without tenant requirement."""
        serializer.save()

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current ecosystem health status."""
        health = self.get_queryset().first()
        if not health:
            # Create default health status if none exists
            health = AIEcosystemHealth.objects.create(
                overall_score=100,
                active_agents=0,
                total_agents=0,
                system_status='optimal',
                agent_statuses=[]
            )
        serializer = self.get_serializer(health)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_health(self, request):
        """Update ecosystem health status."""
        health = self.get_queryset().first()
        if not health:
            health = AIEcosystemHealth.objects.create(
                overall_score=100,
                active_agents=0,
                total_agents=0,
                system_status='optimal',
                agent_statuses=[]
            )
        
        # Update health based on request data
        if 'agent_statuses' in request.data:
            health.agent_statuses = request.data['agent_statuses']
            health.update_health_score()
        
        serializer = self.get_serializer(health)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_quota_status_view(request):
    """
    Get current Gemini API quota status.
    """
    try:
        from .gemini_utils import get_quota_status
        quota_status = get_quota_status()
        
        return Response({
            'quota_status': quota_status,
            'message': 'Current quota status retrieved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error getting quota status: {str(e)}")
        return Response(
            {
                'error': 'Failed to get quota status',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def setup_ai_agents(request):
    """
    Set up AI agents for the current tenant.
    This endpoint creates the necessary AI agents if they don't exist.
    """
    try:
        # Check if agents already exist (global agents have tenant=None)
        existing_count = AIProfile.objects.filter(tenant__isnull=True).count()
        if existing_count > 0:
            return Response({
                'message': f'✅ {existing_count} global AI agents already exist',
                'status': 'already_setup',
                'agent_count': existing_count
            }, status=status.HTTP_200_OK)
        
        # Run the setup command
        call_command('setup_production_ai')
        
        # Get updated count
        total_agents = AIProfile.objects.filter(tenant__isnull=True).count()
        active_agents = AIProfile.objects.filter(tenant__isnull=True, is_active=True).count()
        
        return Response({
            'message': '✅ AI agents setup completed successfully!',
            'status': 'setup_complete',
            'total_agents': total_agents,
            'active_agents': active_agents
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error setting up AI agents: {e}")
        return Response({
            'error': f'Failed to setup AI agents: {str(e)}',
            'status': 'setup_failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
