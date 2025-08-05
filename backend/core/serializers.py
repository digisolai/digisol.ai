from rest_framework import serializers
from django.db.models import Count, Avg, Sum
from .models import (
    Tenant, Contact, Campaign, EmailTemplate, 
    AutomationWorkflow, BrandProfile, AutomationExecution, BrandAsset
)
from accounts.models import CustomUser
from analytics.models import Event


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model."""
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'subdomain', 'is_active', 
            'ai_image_credits_used_current_period', 'ai_text_credits_used_current_period', 'ai_planning_requests_used_current_period',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for Contact model."""
    
    full_name = serializers.ReadOnlyField()
    assigned_to_user_name = serializers.StringRelatedField(source='assigned_to_user', read_only=True)
    assigned_to_department_name = serializers.StringRelatedField(source='assigned_to_department', read_only=True)
    assigned_to_team_name = serializers.StringRelatedField(source='assigned_to_team', read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'company', 'job_title', 'lead_source', 'lead_status',
            'last_contact_date', 'notes', 'tags', 'priority', 'score',
            'last_activity_summary', 'next_action_suggestion', 'suggested_persona',
            'phone', 'title', 'custom_fields', 'full_name', 'tenant',
            'assigned_to_user', 'assigned_to_user_name',
            'assigned_to_department', 'assigned_to_department_name',
            'assigned_to_team', 'assigned_to_team_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant']
    
    def validate_email(self, value):
        """Validate email uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and hasattr(request.user, 'tenant') and request.user.tenant:
            # Check if email already exists for this tenant
            existing_contact = Contact.objects.filter(
                email=value, 
                tenant=request.user.tenant
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_contact.exists():
                raise serializers.ValidationError(
                    "A contact with this email already exists in your organization."
                )
        return value


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign model."""
    
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        default=serializers.CurrentUserDefault()
    )
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    duration_days = serializers.ReadOnlyField()
    is_active_campaign = serializers.ReadOnlyField()
    
    # Campaign statistics fields
    total_emails_sent = serializers.SerializerMethodField()
    open_rate = serializers.SerializerMethodField()
    click_rate = serializers.SerializerMethodField()
    conversions = serializers.SerializerMethodField()
    total_social_posts = serializers.SerializerMethodField()
    social_engagement_rate = serializers.SerializerMethodField()
    total_sms_sent = serializers.SerializerMethodField()
    sms_delivery_rate = serializers.SerializerMethodField()
    conversion_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'campaign_type', 'status', 'start_date', 'end_date',
            'objective', 'budget_allocated', 'target_audience_description',
            'channel_details', 'expected_roi', 'kpis', 'notes',
            'created_by', 'created_by_name', 'duration_days', 'is_active_campaign',
            'total_emails_sent', 'open_rate', 'click_rate', 'conversions',
            'total_social_posts', 'social_engagement_rate', 'total_sms_sent',
            'sms_delivery_rate', 'conversion_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_budget_allocated(self, value):
        """Validate that budget is not negative."""
        if value < 0:
            raise serializers.ValidationError("Budget allocated cannot be negative.")
        return value
    
    def validate_expected_roi(self, value):
        """Validate that expected ROI is reasonable."""
        if value is not None:
            if value < 0:
                raise serializers.ValidationError("Expected ROI cannot be negative.")
            if value > 100:  # 10000% ROI seems unrealistic
                raise serializers.ValidationError("Expected ROI seems unrealistic. Please enter a value between 0 and 100.")
        return value
    
    def validate_channel_details(self, value):
        """Validate channel details JSON structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Channel details must be a valid JSON object.")
        return value
    
    def validate_kpis(self, value):
        """Validate KPIs JSON structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("KPIs must be a valid JSON object.")
        
        # Validate common KPI values
        for key, val in value.items():
            if isinstance(val, (int, float)) and val < 0:
                raise serializers.ValidationError(f"KPI value for '{key}' cannot be negative.")
            elif isinstance(val, float) and key.endswith('_rate') and val > 1:
                raise serializers.ValidationError(f"Rate KPI '{key}' should be between 0 and 1 (e.g., 0.05 for 5%).")
        
        return value
    
    def validate(self, data):
        """Validate campaign dates and other cross-field validations."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        
        # Validate that budget is reasonable for campaign type
        budget = data.get('budget_allocated', 0)
        campaign_type = data.get('campaign_type')
        
        if budget > 0 and campaign_type == 'email' and budget > 10000:
            raise serializers.ValidationError(
                "Email campaign budget seems unusually high. Please verify the amount."
            )
        
        return data

    # --- Methods to calculate campaign statistics ---
    
    def get_total_emails_sent(self, obj):
        """Get total number of emails sent for this campaign."""
        return Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='email_sent'
        ).count()

    def get_open_rate(self, obj):
        """Calculate email open rate as a percentage."""
        sent_count = self.get_total_emails_sent(obj)
        if sent_count == 0:
            return 0.0

        opened_count = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='email_opened'
        ).count()
        return round((opened_count / sent_count) * 100, 2)

    def get_click_rate(self, obj):
        """Calculate email click rate as a percentage."""
        sent_count = self.get_total_emails_sent(obj)
        if sent_count == 0:
            return 0.0

        clicked_count = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='email_clicked'
        ).count()
        return round((clicked_count / sent_count) * 100, 2)

    def get_conversions(self, obj):
        """Get total number of conversions for this campaign."""
        return Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='conversion_event'
        ).count()

    def get_total_social_posts(self, obj):
        """Get total number of social posts for this campaign."""
        return Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='social_post_viewed'
        ).values('details__post_id').distinct().count()

    def get_social_engagement_rate(self, obj):
        """Calculate social engagement rate as a percentage."""
        viewed_count = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='social_post_viewed'
        ).count()
        
        if viewed_count == 0:
            return 0.0

        clicked_count = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='social_post_clicked'
        ).count()
        return round((clicked_count / viewed_count) * 100, 2)

    def get_total_sms_sent(self, obj):
        """Get total number of SMS messages sent for this campaign."""
        return Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='sms_sent'
        ).count()

    def get_sms_delivery_rate(self, obj):
        """Calculate SMS delivery rate as a percentage."""
        sent_count = self.get_total_sms_sent(obj)
        if sent_count == 0:
            return 0.0

        delivered_count = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='sms_delivered'
        ).count()
        return round((delivered_count / sent_count) * 100, 2)

    def get_conversion_value(self, obj):
        """Get total conversion value for this campaign."""
        conversion_events = Event.objects.all_tenants().filter(
            tenant=obj.tenant,
            campaign=obj,
            event_type='conversion_event'
        )
        
        # Sum up the value field from conversion events
        total_value = conversion_events.aggregate(
            total=Sum('value')
        )['total'] or 0.0
        
        return round(float(total_value), 2)


class EmailTemplateSerializer(serializers.ModelSerializer):
    """Serializer for EmailTemplate model."""
    
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'subject', 'body_html',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate name uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.tenant:
            existing_template = EmailTemplate.objects.filter(
                name=value, 
                tenant=request.user.tenant
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_template.exists():
                raise serializers.ValidationError(
                    "A template with this name already exists in your organization."
                )
        return value


class AutomationWorkflowSerializer(serializers.ModelSerializer):
    """Serializer for AutomationWorkflow model."""
    
    class Meta:
        model = AutomationWorkflow
        fields = [
            'id', 'name', 'trigger_config', 'steps_config', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate name uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.tenant:
            existing_workflow = AutomationWorkflow.objects.filter(
                name=value, 
                tenant=request.user.tenant
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_workflow.exists():
                raise serializers.ValidationError(
                    "A workflow with this name already exists in your organization."
                )
        return value
    
    def validate_trigger_config(self, value):
        """Validate trigger configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Trigger configuration must be a valid JSON object."
            )
        return value
    
    def validate_steps_config(self, value):
        """Validate steps configuration JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Steps configuration must be a valid JSON object."
            )
        return value


class BrandProfileSerializer(serializers.ModelSerializer):
    """Serializer for BrandProfile model."""
    
    tenant_name = serializers.ReadOnlyField(source='tenant.name')
    last_updated_by_name = serializers.ReadOnlyField(source='last_updated_by.get_full_name')
    
    class Meta:
        model = BrandProfile
        fields = [
            'id', 'tenant', 'tenant_name',
            
            # Section 1: Branding Overview & Status
            'branding_status', 'last_updated_by', 'last_updated_by_name',
            
            # Basic brand information
            'name', 'description',
            
            # Section 2: Core Visual Identity
            'logo_url', 'dark_mode_logo_url', 'favicon_url', 'app_icon_url',
            'primary_color', 'secondary_color', 'background_color',
            'primary_text_color', 'secondary_text_color', 'link_color',
            'font_family', 'base_font_size', 'headings_font_family', 'font_weights',
            
            # Section 3: Interface Elements & Layout
            'nav_bar_bg_color', 'nav_bar_text_color', 'nav_bar_active_color',
            'button_primary_bg', 'button_primary_text', 'button_primary_border_radius', 'button_primary_hover_bg',
            'button_secondary_bg', 'button_secondary_text', 'button_secondary_border_radius',
            'input_border_color', 'input_bg_color', 'input_focus_color', 'input_border_radius',
            'scrollbar_thumb_color', 'scrollbar_track_color',
            
            # Section 4: Advanced Branding & Customization
            'custom_css', 'custom_js', 'custom_css_enabled', 'custom_js_enabled',
            'landing_page_bg_image', 'landing_page_overlay_color', 'landing_page_overlay_opacity',
            'landing_page_welcome_message', 'landing_page_footer_text',
            'email_header_logo', 'email_primary_color', 'email_footer_text',
            
            # Legacy fields for backward compatibility
            'brand_voice', 'tone_of_voice_description',
            'mission', 'vision',
            'target_audience', 'target_audience_description',
            'key_messaging', 'brand_values',
            'industry', 'website_url', 'contact_email', 'phone_number',
            'social_media_links', 'competitors',
            
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'last_updated_by_name']
    
    def validate_primary_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Primary color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_secondary_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Secondary color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_background_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_primary_text_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Primary text color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_secondary_text_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Secondary text color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_link_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Link color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_nav_bar_bg_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Navigation bar background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_nav_bar_text_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Navigation bar text color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_nav_bar_active_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Navigation bar active color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_button_primary_bg(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Primary button background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_button_primary_text(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Primary button text color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_button_primary_hover_bg(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Primary button hover background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_button_secondary_bg(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Secondary button background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_button_secondary_text(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Secondary button text color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_input_border_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Input border color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_input_bg_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Input background color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_input_focus_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Input focus color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_scrollbar_thumb_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Scrollbar thumb color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_scrollbar_track_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Scrollbar track color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_landing_page_overlay_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Landing page overlay color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_email_primary_color(self, value):
        """Validate hex color format."""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Email primary color must be a valid hex color (e.g., #FF0000)."
            )
        return value
    
    def validate_base_font_size(self, value):
        """Validate font size range."""
        if value < 8 or value > 32:
            raise serializers.ValidationError(
                "Base font size must be between 8 and 32 pixels."
            )
        return value
    
    def validate_button_primary_border_radius(self, value):
        """Validate border radius range."""
        if value < 0 or value > 50:
            raise serializers.ValidationError(
                "Primary button border radius must be between 0 and 50 pixels."
            )
        return value
    
    def validate_button_secondary_border_radius(self, value):
        """Validate border radius range."""
        if value < 0 or value > 50:
            raise serializers.ValidationError(
                "Secondary button border radius must be between 0 and 50 pixels."
            )
        return value
    
    def validate_input_border_radius(self, value):
        """Validate border radius range."""
        if value < 0 or value > 20:
            raise serializers.ValidationError(
                "Input border radius must be between 0 and 20 pixels."
            )
        return value
    
    def validate_landing_page_overlay_opacity(self, value):
        """Validate opacity range."""
        if value < 0.0 or value > 1.0:
            raise serializers.ValidationError(
                "Landing page overlay opacity must be between 0.0 and 1.0."
            )
        return value
    
    def validate_font_weights(self, value):
        """Validate font weights."""
        valid_weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
        for weight in value:
            if weight not in valid_weights:
                raise serializers.ValidationError(
                    f"Invalid font weight: {weight}. Must be one of {valid_weights}."
                )
        return value
    
    def validate_key_messaging(self, value):
        """Validate key messaging list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Key messaging must be a list.")
        return value
    
    def validate_brand_values(self, value):
        """Validate brand values list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Brand values must be a list.")
        return value
    
    def validate_social_media_links(self, value):
        """Validate social media links dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Social media links must be a dictionary.")
        return value
    
    def validate_competitors(self, value):
        """Validate competitors list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Competitors must be a list.")
        return value


class AutomationExecutionSerializer(serializers.ModelSerializer):
    """Serializer for AutomationExecution model."""
    
    workflow_name = serializers.ReadOnlyField(source='workflow.name')
    contact_name = serializers.ReadOnlyField(source='contact.full_name')
    current_step_info = serializers.ReadOnlyField(source='current_step')
    
    class Meta:
        model = AutomationExecution
        fields = [
            'id', 'tenant', 'workflow', 'workflow_name', 'contact', 'contact_name',
            'current_step_index', 'current_step_info', 'status', 'context_data',
            'started_at', 'last_executed_at', 'completed_at'
        ]
        read_only_fields = ['id', 'tenant', 'started_at', 'last_executed_at', 'completed_at']
    
    def validate_context_data(self, value):
        """Validate context data JSON."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Context data must be a valid JSON object."
            )
        return value
    
    def validate_current_step_index(self, value):
        """Validate current step index."""
        if value < 0:
            raise serializers.ValidationError(
                "Current step index cannot be negative."
            )
        return value 


class BrandAssetSerializer(serializers.ModelSerializer):
    """Serializer for BrandAsset model."""
    
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    is_ai_generated = serializers.ReadOnlyField()
    is_edited_version = serializers.ReadOnlyField()
    tag_list = serializers.ReadOnlyField()
    
    class Meta:
        model = BrandAsset
        fields = [
            'id', 'name', 'asset_type', 'asset_type_display', 'file_url',
            'description', 'tags', 'tag_list', 'is_shared_with_clients',
            'original_image_request', 'is_ai_generated', 'is_edited_version',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at', 
            'is_ai_generated', 'is_edited_version', 'tag_list'
        ]
    
    def validate_name(self, value):
        """Validate name uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.tenant:
            existing_asset = BrandAsset.objects.filter(
                name=value, 
                tenant=request.user.tenant
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_asset.exists():
                raise serializers.ValidationError(
                    "An asset with this name already exists in your organization."
                )
        return value
    
    def validate_file_url(self, value):
        """Validate file URL format."""
        if not value:
            raise serializers.ValidationError("File URL is required.")
        
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                "File URL must be a valid HTTP or HTTPS URL."
            )
        
        return value
    
    def validate_tags(self, value):
        """Validate tags format."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        
        # Validate each tag
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("Each tag must be a string.")
            if len(tag.strip()) == 0:
                raise serializers.ValidationError("Tags cannot be empty strings.")
            if len(tag) > 100:
                raise serializers.ValidationError("Each tag cannot exceed 100 characters.")
        
        # Remove duplicates and empty strings
        cleaned_tags = list(set([tag.strip() for tag in value if tag.strip()]))
        return cleaned_tags


class BrandAssetCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new brand assets."""
    
    class Meta:
        model = BrandAsset
        fields = [
            'name', 'asset_type', 'file_url', 'description', 'tags',
            'is_shared_with_clients', 'original_image_request'
        ]
    
    def validate_name(self, value):
        """Validate name uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.tenant:
            existing_asset = BrandAsset.objects.filter(
                name=value, 
                tenant=request.user.tenant
            )
            
            if existing_asset.exists():
                raise serializers.ValidationError(
                    "An asset with this name already exists in your organization."
                )
        return value
    
    def validate_file_url(self, value):
        """Validate file URL format."""
        if not value:
            raise serializers.ValidationError("File URL is required.")
        
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                "File URL must be a valid HTTP or HTTPS URL."
            )
        
        return value
    
    def validate_tags(self, value):
        """Validate tags format."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        
        # Validate each tag
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("Each tag must be a string.")
            if len(tag.strip()) == 0:
                raise serializers.ValidationError("Tags cannot be empty strings.")
            if len(tag) > 100:
                raise serializers.ValidationError("Each tag cannot exceed 100 characters.")
        
        # Remove duplicates and empty strings
        cleaned_tags = list(set([tag.strip() for tag in value if tag.strip()]))
        return cleaned_tags


class BrandAssetUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating brand assets."""
    
    class Meta:
        model = BrandAsset
        fields = [
            'name', 'description', 'tags', 'is_shared_with_clients'
        ]
    
    def validate_name(self, value):
        """Validate name uniqueness within tenant."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.tenant:
            existing_asset = BrandAsset.objects.filter(
                name=value, 
                tenant=request.user.tenant
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_asset.exists():
                raise serializers.ValidationError(
                    "An asset with this name already exists in your organization."
                )
        return value
    
    def validate_tags(self, value):
        """Validate tags format."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        
        # Validate each tag
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("Each tag must be a string.")
            if len(tag.strip()) == 0:
                raise serializers.ValidationError("Tags cannot be empty strings.")
            if len(tag) > 100:
                raise serializers.ValidationError("Each tag cannot exceed 100 characters.")
        
        # Remove duplicates and empty strings
        cleaned_tags = list(set([tag.strip() for tag in value if tag.strip()]))
        return cleaned_tags 