from rest_framework import serializers
from .models import TemplateCategory, MarketingTemplate


class TemplateCategorySerializer(serializers.ModelSerializer):
    """Serializer for TemplateCategory model"""
    
    class Meta:
        model = TemplateCategory
        fields = [
            'id', 'tenant', 'name', 'description', 
            'created_at', 'updated_at', 'is_global'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Custom validation for category creation"""
        request = self.context.get('request')
        
        # Ensure global categories have no tenant
        if data.get('is_global', False) and data.get('tenant') is not None:
            raise serializers.ValidationError("Global categories must have tenant=None")
        
        # Ensure non-global categories have a tenant
        if not data.get('is_global', False) and data.get('tenant') is None:
            if request and request.user:
                data['tenant'] = request.user.tenant
            else:
                raise serializers.ValidationError("Non-global categories must have a tenant")
        
        return data


class MarketingTemplateSerializer(serializers.ModelSerializer):
    """Serializer for MarketingTemplate model"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    
    class Meta:
        model = MarketingTemplate
        fields = [
            'id', 'tenant', 'category', 'category_name', 'name', 'template_type',
            'template_type_display', 'content_json', 'preview_image_url', 'is_global',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_name']

    def validate(self, data):
        """Custom validation for template creation"""
        request = self.context.get('request')
        
        # Ensure global templates have no tenant
        if data.get('is_global', False) and data.get('tenant') is not None:
            raise serializers.ValidationError("Global templates must have tenant=None")
        
        # Ensure non-global templates have a tenant
        if not data.get('is_global', False) and data.get('tenant') is None:
            if request and request.user:
                data['tenant'] = request.user.tenant
            else:
                raise serializers.ValidationError("Non-global templates must have a tenant")
        
        # Validate content_json structure based on template_type
        template_type = data.get('template_type')
        content_json = data.get('content_json', {})
        
        if template_type == 'email' and not content_json.get('html_content'):
            raise serializers.ValidationError("Email templates must include 'html_content' in content_json")
        
        if template_type == 'social' and not content_json.get('text_content'):
            raise serializers.ValidationError("Social templates must include 'text_content' in content_json")
        
        return data

    def create(self, validated_data):
        """Override create to set created_by"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class MarketingTemplateListSerializer(serializers.ModelSerializer):
    """Simplified serializer for template listing"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = MarketingTemplate
        fields = [
            'id', 'name', 'template_type', 'template_type_display', 
            'category_name', 'preview_image_url', 'is_global', 
            'created_by_name', 'created_at'
        ] 