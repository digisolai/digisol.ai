# backend/accounts/serializers_minimal.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Simplified user registration serializer without tenant creation.
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')  # Remove password2 from validated_data
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    email = serializers.EmailField(read_only=True)  # Email should not be editable via profile

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'bio', 'phone_number', 'job_title', 'role', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'role']  # These shouldn't be editable

    def update(self, instance, validated_data):
        # Update user instance with validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance