# backend/accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
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
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'job_title', 'department', 'profile_picture', 'bio', 'phone_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'role_display',
            'created_at', 'updated_at'
        ]

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin user management - allows updating user details."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'job_title', 'department', 'is_active', 'profile_picture', 'bio', 'phone_number'
        ]
        read_only_fields = [
            'id', 'email'
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
        """Check if user already exists."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """Create a new user with a temporary password."""
        
        # Generate a temporary password
        temp_password = CustomUser.objects.make_random_password()
        
        # Create user with temporary credentials
        user = CustomUser.objects.create(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'user'),
            job_title=validated_data.get('job_title', ''),
            department=validated_data.get('department'),
            is_active=True
        )
        user.set_password(temp_password)
        user.save()
        
        # TODO: Send invitation email with temporary password
        # For now, we'll just return the user data
        return user