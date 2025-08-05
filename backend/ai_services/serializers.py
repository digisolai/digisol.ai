from rest_framework import serializers
from .models import (
    ContentGenerationRequest, ImageGenerationRequest, AIRecommendation,
    AIProfile, AITask, AIInteractionLog, StructuraInsight, AIEcosystemHealth
)
from accounts.models import CustomUser # Assuming CustomUser is accessible here
# Import other necessary serializers if they are defined in other files
# For instance, if AIProfileSerializer is defined elsewhere, ensure it's imported.

# Re-declare AIProfileSerializer here for direct use, assuming it exists
class AIProfileSerializer(serializers.ModelSerializer):
    """Serializer for AIProfile model."""
    
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    is_global = serializers.ReadOnlyField()
    
    class Meta:
        model = AIProfile
        fields = [
            'id', 'name', 'personality_description', 'specialization', 
            'specialization_display', 'api_model_name', 'is_active',
            'is_global', 'tenant', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Ensure agent name is unique per tenant (or global)."""
        tenant = self.context.get('request').user.tenant if self.context.get('request') else None
        existing = AIProfile.objects.filter(name=value, tenant=tenant)
        
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                f"An AI agent with the name '{value}' already exists for this tenant."
            )
        
        return value




class ContentGenerationRequestSerializer(serializers.ModelSerializer):
    """Serializer for ContentGenerationRequest model."""
    
    requested_by_name = serializers.ReadOnlyField(source='requested_by.get_full_name')
    processing_time = serializers.ReadOnlyField()
    
    class Meta:
        model = ContentGenerationRequest
        fields = [
            'id', 'prompt_text', 'content_type', 'context_data',
            'generated_content', 'status', 'credits_used', 'error_message',
            'requested_by', 'requested_by_name', 'created_at', 'updated_at',
            'completed_at', 'processing_time'
        ]
        read_only_fields = [
            'id', 'generated_content', 'status', 'credits_used', 
            'error_message', 'requested_by', 'created_at', 'updated_at',
            'completed_at', 'processing_time'
        ]
    
    def validate_content_type(self, value):
        """Validate content type."""
        valid_types = [choice[0] for choice in ContentGenerationRequest.CONTENT_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid content type. Must be one of: {', '.join(valid_types)}"
            )
        return value
    
    def validate_prompt_text(self, value):
        """Validate prompt text length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Prompt text must be at least 10 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Prompt text cannot exceed 2000 characters."
            )
        return value.strip()


class ContentGenerationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new content generation requests."""
    
    class Meta:
        model = ContentGenerationRequest
        fields = ['prompt_text', 'content_type', 'context_data']
    
    def validate_content_type(self, value):
        """Validate content type."""
        valid_types = [choice[0] for choice in ContentGenerationRequest.CONTENT_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid content type. Must be one of: {', '.join(valid_types)}"
            )
        return value
    
    def validate_prompt_text(self, value):
        """Validate prompt text length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Prompt text must be at least 10 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Prompt text cannot exceed 2000 characters."
            )
        return value.strip()
    
    def validate_context_data(self, value):
        """Validate context data is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Context data must be a valid JSON object."
            )
        return value


class ContentGenerationStatusSerializer(serializers.ModelSerializer):
    """Serializer for content generation status responses."""
    
    requested_by_name = serializers.ReadOnlyField(source='requested_by.get_full_name')
    processing_time = serializers.ReadOnlyField()
    
    class Meta:
        model = ContentGenerationRequest
        fields = [
            'id', 'status', 'generated_content', 'error_message',
            'credits_used', 'requested_by_name', 'created_at', 
            'completed_at', 'processing_time'
        ]
        read_only_fields = fields 


class ImageGenerationRequestSerializer(serializers.ModelSerializer):
    """Serializer for ImageGenerationRequest model."""
    
    requested_by_name = serializers.ReadOnlyField(source='requested_by.get_full_name')
    final_image_url = serializers.ReadOnlyField()
    has_edits = serializers.ReadOnlyField()
    
    class Meta:
        model = ImageGenerationRequest
        fields = [
            'id', 'prompt_text', 'brand_profile', 'design_type', 'design_parameters',
            'generated_image_url', 'edited_image_url', 'is_edited', 'final_image_url', 'has_edits',
            'status', 'credits_cost', 'requested_by', 'requested_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'generated_image_url', 'status', 'credits_cost', 
            'requested_by', 'created_at', 'updated_at', 'final_image_url', 'has_edits'
        ]


class ImageGenerationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new image generation requests."""
    
    class Meta:
        model = ImageGenerationRequest
        fields = ['prompt_text', 'brand_profile', 'design_type', 'design_parameters']
    
    def validate_prompt_text(self, value):
        """Validate prompt text length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Prompt text must be at least 10 characters long."
            )
        if len(value) > 1000:
            raise serializers.ValidationError(
                "Prompt text cannot exceed 1000 characters."
            )
        return value.strip()
    
    def validate_design_type(self, value):
        """Validate design type."""
        valid_types = ['general', 'logo', 'ad_banner', 'social_post', 'business_card', 'flyer', 'presentation_slide']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid design type. Must be one of: {', '.join(valid_types)}"
            )
        return value
    
    def validate_design_parameters(self, value):
        """Validate design parameters."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Design parameters must be a dictionary.")
        
        # Validate specific parameters based on design type
        design_type = self.initial_data.get('design_type', 'general')
        
        if design_type == 'logo':
            if 'brand_name' in value and not isinstance(value['brand_name'], str):
                raise serializers.ValidationError("brand_name must be a string.")
            if 'style' in value and not isinstance(value['style'], str):
                raise serializers.ValidationError("style must be a string.")
        
        elif design_type == 'ad_banner':
            if 'dimensions' in value and not isinstance(value['dimensions'], str):
                raise serializers.ValidationError("dimensions must be a string.")
            if 'cta_text' in value and not isinstance(value['cta_text'], str):
                raise serializers.ValidationError("cta_text must be a string.")
        
        elif design_type == 'social_post':
            if 'platform' in value and not isinstance(value['platform'], str):
                raise serializers.ValidationError("platform must be a string.")
            if 'aspect_ratio' in value and not isinstance(value['aspect_ratio'], str):
                raise serializers.ValidationError("aspect_ratio must be a string.")
        
        return value


class ImageEditRequestSerializer(serializers.Serializer):
    """Serializer for image editing requests."""
    
    image_data = serializers.CharField(
        help_text="Base64 encoded image data or temporary URL from frontend editor"
    )
    save_as_asset = serializers.BooleanField(
        default=True,
        help_text="Whether to save the edited image as a brand asset"
    )
    asset_name = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Name for the brand asset (if save_as_asset is True)"
    )
    asset_description = serializers.CharField(
        max_length=1000,
        required=False,
        help_text="Description for the brand asset (if save_as_asset is True)"
    )
    asset_tags = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        help_text="Tags for the brand asset (if save_as_asset is True)"
    )
    
    def validate_image_data(self, value):
        """Validate image data format."""
        if not value:
            raise serializers.ValidationError("Image data is required.")
        
        # Check if it's a URL
        if value.startswith(('http://', 'https://')):
            return value
        
        # Check if it's base64 data
        if value.startswith('data:image/'):
            return value
        
        # Check if it's just base64 without data URL prefix
        if len(value) > 100:  # Reasonable minimum for base64 image
            return value
        
        raise serializers.ValidationError(
            "Image data must be a valid URL or base64 encoded image data."
        )
    
    def validate_asset_name(self, value):
        """Validate asset name if provided."""
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Asset name must be at least 3 characters long."
            )
        return value.strip() if value else value


class AIRecommendationSerializer(serializers.ModelSerializer):
    """
    Serializer for the AIRecommendation model.
    """
    user_info = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_active = serializers.ReadOnlyField()
    recommendation_summary = serializers.ReadOnlyField()
    generated_by_agent = AIProfileSerializer(read_only=True) # Nested serializer for the agent

    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'user', 'user_info', 'type', 'type_display', 'recommendation_text',
            'context_data', 'is_actionable', 'is_dismissed', 'is_actioned',
            'priority', 'priority_display', 'created_at', 'updated_at',
            'is_active', 'recommendation_summary', 'generated_by_agent'
        ]
        read_only_fields = ['id', 'user', 'user_info', 'created_at', 'updated_at', 'is_active', 'recommendation_summary']

    def get_user_info(self, obj):
        """Return user information."""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': obj.user.get_full_name()
            }
        return None

    def validate_recommendation_text(self, value):
        """Validate recommendation text."""
        if not value.strip():
            raise serializers.ValidationError("Recommendation text cannot be empty.")
        return value.strip()

    def validate_context_data(self, value):
        """Validate context data is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Context data must be a valid JSON object.")
        return value


class AIRecommendationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new AI recommendations.
    """
    class Meta:
        model = AIRecommendation
        fields = ['type', 'recommendation_text', 'context_data', 'is_actionable', 'priority'] # Fields frontend sends
        extra_kwargs = {
            'is_actionable': {'required': False} # Frontend might not send this
        }
        read_only_fields = ['id', 'tenant', 'user', 'created_at', 'updated_at', 'generated_by_agent'] # Ensure generated_by_agent is read-only for creation

    def validate_type(self, value):
        """Validate recommendation type."""
        valid_types = [choice[0] for choice in AIRecommendation.RECOMMENDATION_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid recommendation type. Must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate_recommendation_text(self, value):
        """Validate recommendation text."""
        if not value.strip():
            raise serializers.ValidationError("Recommendation text cannot be empty.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Recommendation text must be at least 10 characters long.")
        return value.strip()


class AIPlanningRequestSerializer(serializers.Serializer):
    """
    Serializer for AI planning requests.
    """
    objective = serializers.CharField()
    recommendation_type = serializers.CharField()
    priority = serializers.CharField()
    context = serializers.JSONField(required=False)
    selected_agent_id = serializers.UUIDField(required=False, allow_null=True) # For manual selection
    auto_delegate = serializers.BooleanField(required=False, default=True) # For auto delegation

    # You might need to add a method to get the requester if it's not automatically derived in the view
    # Example: def get_requester(self): return self.context['request'].user

    def validate_objective(self, value):
        """Validate objective text."""
        if not value.strip():
            raise serializers.ValidationError("Objective cannot be empty.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Objective must be at least 10 characters long.")
        return value.strip()

    def validate_context(self, value):
        """Validate context data."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Context must be a valid JSON object.")
        return value


class AIInteractionLogSerializer(serializers.ModelSerializer):
    """Serializer for AIInteractionLog model."""
    
    ai_profile_name = serializers.CharField(source='ai_profile.name', read_only=True)
    ai_profile_specialization = serializers.CharField(source='ai_profile.specialization', read_only=True)
    user_name = serializers.CharField(source='user.email', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    message_preview = serializers.ReadOnlyField()
    
    class Meta:
        model = AIInteractionLog
        fields = [
            'id', 'ai_profile', 'ai_profile_name', 'ai_profile_specialization',
            'user', 'user_name', 'ai_task', 'role', 'role_display', 
            'message_content', 'message_preview', 'timestamp'
        ]
        read_only_fields = [
            'id', 'ai_profile_name', 'ai_profile_specialization', 'user_name', 
            'role_display', 'message_preview', 'timestamp'
        ]


class AITaskSerializer(serializers.ModelSerializer):
    """Serializer for AITask model."""
    
    # Explicitly nest the AIProfileSerializer for assignee_agent
    assignee_agent = AIProfileSerializer(read_only=True)
    # Add requester_info if you want nested requester details
    requester = serializers.PrimaryKeyRelatedField(read_only=True) # Assuming frontend only needs ID or handles requester_name from CustomUser directly
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_completed = serializers.ReadOnlyField()
    has_sub_tasks = serializers.ReadOnlyField()
    all_sub_tasks_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = AITask
        fields = [
            'id', 'requester', 'assignee_agent',
            'parent_task', 'objective', 'status', 'status_display', 'context_data',
            'result_data', 'is_completed', 'has_sub_tasks', 'all_sub_tasks_completed',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'tenant', 'requester', 'status', 'created_at', 'updated_at', 'assignee_agent'
        ] # Ensure assignee_agent is read-only here
    
    def validate_objective(self, value):
        """Validate objective field."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Objective cannot be empty."
            )
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Objective must be at least 10 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Objective cannot exceed 2000 characters."
            )
        return value.strip()
    
    def validate_context_data(self, value):
        """Validate context_data field."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Context data must be a valid JSON object."
            )
        return value
    
    def validate_result_data(self, value):
        """Validate result_data field."""
        if value is not None and not isinstance(value, dict):
            raise serializers.ValidationError(
                "Result data must be a valid JSON object or null."
            )
        return value


class AITaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new AI tasks."""
    
    auto_delegate = serializers.BooleanField(required=False, default=True)
    priority = serializers.ChoiceField(
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
        required=False,
        default='medium'
    )
    
    class Meta:
        model = AITask
        fields = ['objective', 'assignee_agent', 'parent_task', 'context_data', 'auto_delegate', 'priority']

    def validate_objective(self, value):
        """Validate objective length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Objective must be at least 10 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Objective cannot exceed 2000 characters."
            )
        return value.strip()

    def validate_context_data(self, value):
        """Validate context data is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Context data must be a valid JSON object."
            )
        return value


class AIOrchestrationRequestSerializer(serializers.Serializer):
    """Serializer for AI orchestration requests."""
    
    objective = serializers.CharField(max_length=2000)
    context_data = serializers.JSONField(default=dict)
    
    def validate_objective(self, value):
        """Validate objective length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Objective must be at least 10 characters long."
            )
        if len(value) > 2000:
            raise serializers.ValidationError(
                "Objective cannot exceed 2000 characters."
            )
        return value.strip()
    
    def validate_context_data(self, value):
        """Validate context data."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Context data must be a valid JSON object."
            )
        return value


class StructuraInsightSerializer(serializers.ModelSerializer):
    """Serializer for StructuraInsight model."""
    
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    impact_display = serializers.CharField(source='get_impact_display', read_only=True)
    is_active = serializers.ReadOnlyField()
    generated_by_agent = AIProfileSerializer(read_only=True)
    
    class Meta:
        model = StructuraInsight
        fields = [
            'id', 'type', 'type_display', 'title', 'description', 'confidence',
            'impact', 'impact_display', 'category', 'actionable', 'action_text',
            'context_data', 'generated_by_agent', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'tenant', 'is_active', 'created_at', 'updated_at'
        ]
    
    def validate_title(self, value):
        """Validate title length."""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description length."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value.strip()
    
    def validate_confidence(self, value):
        """Validate confidence score."""
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Confidence must be between 0 and 100.")
        return value


class StructuraInsightCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new Structura insights."""
    
    class Meta:
        model = StructuraInsight
        fields = [
            'type', 'title', 'description', 'confidence', 'impact', 'category',
            'actionable', 'action_text', 'context_data', 'generated_by_agent'
        ]
    
    def validate_type(self, value):
        """Validate insight type."""
        valid_types = [choice[0] for choice in StructuraInsight.INSIGHT_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid insight type. Must be one of: {', '.join(valid_types)}"
            )
        return value
    
    def validate_impact(self, value):
        """Validate impact level."""
        valid_impacts = [choice[0] for choice in StructuraInsight.IMPACT_CHOICES]
        if value not in valid_impacts:
            raise serializers.ValidationError(
                f"Invalid impact level. Must be one of: {', '.join(valid_impacts)}"
            )
        return value


class AIEcosystemHealthSerializer(serializers.ModelSerializer):
    """Serializer for AIEcosystemHealth model."""
    
    system_status_display = serializers.CharField(source='get_system_status_display', read_only=True)
    health_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = AIEcosystemHealth
        fields = [
            'id', 'overall_score', 'active_agents', 'total_agents', 'system_status',
            'system_status_display', 'agent_statuses', 'health_percentage', 'last_updated'
        ]
        read_only_fields = [
            'id', 'tenant', 'health_percentage', 'last_updated'
        ]
    
    def validate_overall_score(self, value):
        """Validate overall score."""
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Overall score must be between 0 and 100.")
        return value
    
    def validate_agent_statuses(self, value):
        """Validate agent statuses structure."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Agent statuses must be a list.")
        
        for status in value:
            if not isinstance(status, dict):
                raise serializers.ValidationError("Each agent status must be a dictionary.")
            
            required_fields = ['agent_id', 'agent_name', 'status', 'performance_score', 'last_activity']
            for field in required_fields:
                if field not in status:
                    raise serializers.ValidationError(f"Agent status missing required field: {field}")
        
        return value