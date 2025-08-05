from rest_framework import serializers
from .models import Tutorial, TutorialSection, TutorialStep, UserTutorialProgress


class TutorialStepSerializer(serializers.ModelSerializer):
    """Serializer for TutorialStep model."""
    
    class Meta:
        model = TutorialStep
        fields = [
            'id', 'title', 'content_type', 'content', 'order', 
            'page_path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TutorialSectionSerializer(serializers.ModelSerializer):
    """Serializer for TutorialSection model with nested steps."""
    
    steps = TutorialStepSerializer(many=True, read_only=True)
    step_count = serializers.ReadOnlyField()
    
    class Meta:
        model = TutorialSection
        fields = [
            'id', 'title', 'description', 'order', 'steps', 
            'step_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TutorialSerializer(serializers.ModelSerializer):
    """Serializer for Tutorial model with nested sections."""
    
    sections = TutorialSectionSerializer(many=True, read_only=True)
    section_count = serializers.ReadOnlyField()
    step_count = serializers.ReadOnlyField()
    is_global = serializers.ReadOnlyField()
    
    class Meta:
        model = Tutorial
        fields = [
            'id', 'title', 'description', 'order', 'is_published',
            'sections', 'section_count', 'step_count', 'is_global',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        """Ensure tutorial title is unique per tenant (or global)."""
        tenant = self.context.get('request').user.tenant if self.context.get('request') else None
        existing = Tutorial.objects.filter(title=value, tenant=tenant)
        
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                f"A tutorial with the title '{value}' already exists for this tenant."
            )
        
        return value


class UserTutorialProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserTutorialProgress model."""
    
    tutorial_title = serializers.CharField(source='tutorial.title', read_only=True)
    tutorial_description = serializers.CharField(source='tutorial.description', read_only=True)
    last_completed_step_title = serializers.CharField(
        source='last_completed_step.title', 
        read_only=True
    )
    progress_percentage = serializers.ReadOnlyField()
    next_step_id = serializers.SerializerMethodField()
    next_step_title = serializers.SerializerMethodField()
    
    class Meta:
        model = UserTutorialProgress
        fields = [
            'id', 'tutorial', 'tutorial_title', 'tutorial_description',
            'last_completed_step', 'last_completed_step_title',
            'is_completed', 'progress_percentage', 'next_step_id', 'next_step_title',
            'started_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'tutorial_title', 'tutorial_description', 
            'last_completed_step_title', 'progress_percentage',
            'next_step_id', 'next_step_title', 'started_at', 'completed_at'
        ]

    def get_next_step_id(self, obj):
        """Get the ID of the next step the user should complete."""
        next_step = obj.next_step
        return str(next_step.id) if next_step else None

    def get_next_step_title(self, obj):
        """Get the title of the next step the user should complete."""
        next_step = obj.next_step
        return next_step.title if next_step else None

    def validate(self, data):
        """Ensure user can only create progress for their own account."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['user'] = request.user
        return data


class TutorialStepCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TutorialStep instances."""
    
    class Meta:
        model = TutorialStep
        fields = [
            'id', 'section', 'title', 'content_type', 'content', 
            'order', 'page_path'
        ]
        read_only_fields = ['id']


class TutorialSectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TutorialSection instances."""
    
    steps = TutorialStepCreateSerializer(many=True, required=False)
    
    class Meta:
        model = TutorialSection
        fields = [
            'id', 'tutorial', 'title', 'description', 'order', 'steps'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        """Create section and its steps."""
        steps_data = validated_data.pop('steps', [])
        section = TutorialSection.objects.create(**validated_data)
        
        for step_data in steps_data:
            step_data['section'] = section
            TutorialStep.objects.create(**step_data)
        
        return section

    def update(self, instance, validated_data):
        """Update section and its steps."""
        steps_data = validated_data.pop('steps', [])
        
        # Update section fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle steps (this is a simplified approach - in production you might want more sophisticated handling)
        if steps_data:
            # Clear existing steps and recreate
            instance.steps.all().delete()
            for step_data in steps_data:
                step_data['section'] = instance
                TutorialStep.objects.create(**step_data)
        
        return instance


class TutorialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Tutorial instances with nested sections."""
    
    sections = TutorialSectionCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Tutorial
        fields = [
            'id', 'tenant', 'title', 'description', 'order', 
            'is_published', 'sections'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        """Create tutorial and its sections."""
        sections_data = validated_data.pop('sections', [])
        
        # Set tenant if not provided
        if 'tenant' not in validated_data:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.tenant:
                validated_data['tenant'] = request.user.tenant
        
        tutorial = Tutorial.objects.create(**validated_data)
        
        for section_data in sections_data:
            steps_data = section_data.pop('steps', [])
            section_data['tutorial'] = tutorial
            section = TutorialSection.objects.create(**section_data)
            
            for step_data in steps_data:
                step_data['section'] = section
                TutorialStep.objects.create(**step_data)
        
        return tutorial


class TutorialProgressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tutorial progress."""
    
    class Meta:
        model = UserTutorialProgress
        fields = ['last_completed_step', 'is_completed']

    def validate_last_completed_step(self, value):
        """Ensure the step belongs to the tutorial."""
        tutorial = self.instance.tutorial if self.instance else None
        if tutorial and value and value.tutorial != tutorial:
            raise serializers.ValidationError(
                "The step must belong to the same tutorial."
            )
        return value

    def update(self, instance, validated_data):
        """Update progress and handle completion logic."""
        last_completed_step = validated_data.get('last_completed_step')
        
        if last_completed_step:
            instance.mark_step_completed(last_completed_step)
        else:
            # Manual completion
            instance.is_completed = validated_data.get('is_completed', instance.is_completed)
            if instance.is_completed and not instance.completed_at:
                from django.utils import timezone
                instance.completed_at = timezone.now()
            instance.save()
        
        return instance 