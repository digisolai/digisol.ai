# backend/accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from core.models import Tenant
from .models import CustomUser
from core.models import Tenant, BrandProfile # Ensure BrandProfile is imported!
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

import uuid



class CustomUserSerializer(serializers.ModelSerializer):
    """Basic serializer for CustomUser model."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'job_title', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        confirm_password = validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        validated_data['username'] = validated_data['email']

        user = CustomUser.objects.create(
            **validated_data
        )
        user.set_password(password)

        # Handle tenant creation
        if not user.tenant:
            tenant_name = validated_data['email'].split('@')[0] + "-tenant"
            try:
                tenant = Tenant.objects.get(name=tenant_name)
            except Tenant.DoesNotExist:
                tenant = Tenant.objects.create(name=tenant_name)

            user.tenant = tenant
            user.is_tenant_admin = True
            user.role = 'tenant_admin'

            # --- CRITICAL ADDITION: Create default BrandProfile for new tenant ---
            BrandProfile.objects.create(
                tenant=tenant,
                primary_color="#1F4287",  # Default primary color
                secondary_color="#FFC300",   # Default secondary color
                font_family="Inter", # Default font
                tone_of_voice_description="Professional, yet approachable. We communicate clearly and concisely." # Default tone
            )
            # --- END CRITICAL ADDITION ---

        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'tenant', 
            'is_tenant_admin', 'role', 'role_display',
            'job_title', 'is_hr_admin', 'profile_picture', 'bio', 'phone_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'tenant', 'is_tenant_admin', 'role', 'role_display',
            'created_at', 'updated_at'
        ]

    tenant = serializers.StringRelatedField(read_only=True)

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin user management - allows updating user details."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'tenant', 
            'is_tenant_admin', 'role', 'role_display',
            'job_title', 'is_hr_admin', 'is_active', 'profile_picture', 'bio', 'phone_number'
        ]
        read_only_fields = [
            'id', 'email', 'tenant', 'is_tenant_admin'
        ]

class UserInviteSerializer(serializers.ModelSerializer):
    """Serializer for inviting new users to the tenant."""
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'role', 'job_title']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True}
        }

    def validate_email(self, value):
        """Check if user already exists in the tenant."""
        request = self.context.get('request')
        if request and CustomUser.objects.filter(email=value, tenant=request.user.tenant).exists():
            raise serializers.ValidationError("A user with this email already exists in your organization.")
        return value

    def create(self, validated_data):
        """Create a new user with a temporary password."""
        request = self.context.get('request')
        
        # Generate a temporary password
        temp_password = CustomUser.objects.make_random_password()
        
        # Create user with temporary credentials
        user = CustomUser.objects.create(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            tenant=request.user.tenant,
            role=validated_data.get('role', 'viewer'),
            job_title=validated_data.get('job_title', ''),
            department=validated_data.get('department'),
            team=validated_data.get('team'),
            is_active=True
        )
        user.set_password(temp_password)
        user.save()
        
        # TODO: Send invitation email with temporary password
        # For now, we'll just return the user data
        return user