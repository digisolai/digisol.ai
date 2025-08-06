from rest_framework import serializers
from .models import (
    Tutorial, TutorialSection, TutorialStep, UserTutorialProgress,
    Badge, UserBadge, LearningAchievement, MarketingResource, UserResourceProgress
)


class TutorialSerializer(serializers.ModelSerializer):
    """Serializer for Tutorial model."""
    section_count = serializers.ReadOnlyField()
    step_count = serializers.ReadOnlyField()
    is_global = serializers.ReadOnlyField()

    class Meta:
        model = Tutorial
        fields = [
            'id', 'title', 'description', 'order', 'is_published',
            'section_count', 'step_count', 'is_global', 'created_at', 'updated_at'
        ]


class TutorialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Tutorial instances."""
    
    class Meta:
        model = Tutorial
        fields = ['title', 'description', 'order', 'is_published']


class TutorialSectionSerializer(serializers.ModelSerializer):
    """Serializer for TutorialSection model."""
    step_count = serializers.ReadOnlyField()

    class Meta:
        model = TutorialSection
        fields = [
            'id', 'tutorial', 'title', 'description', 'order',
            'step_count', 'created_at', 'updated_at'
        ]


class TutorialSectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TutorialSection instances."""
    
    class Meta:
        model = TutorialSection
        fields = ['tutorial', 'title', 'description', 'order']


class TutorialStepSerializer(serializers.ModelSerializer):
    """Serializer for TutorialStep model."""
    tutorial = serializers.ReadOnlyField(source='section.tutorial.id')

    class Meta:
        model = TutorialStep
        fields = [
            'id', 'section', 'tutorial', 'title', 'content_type', 'content',
            'order', 'page_path', 'created_at', 'updated_at'
        ]


class TutorialStepCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TutorialStep instances."""
    
    class Meta:
        model = TutorialStep
        fields = ['section', 'title', 'content_type', 'content', 'order', 'page_path']


class UserTutorialProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserTutorialProgress model."""
    tutorial_title = serializers.ReadOnlyField(source='tutorial.title')
    progress_percentage = serializers.ReadOnlyField()
    next_step = serializers.ReadOnlyField()

    class Meta:
        model = UserTutorialProgress
        fields = [
            'id', 'user', 'tutorial', 'tutorial_title', 'last_completed_step',
            'is_completed', 'progress_percentage', 'next_step',
            'started_at', 'completed_at'
        ]


class TutorialProgressUpdateSerializer(serializers.Serializer):
    """Serializer for updating tutorial progress."""
    step_id = serializers.UUIDField()
    completed = serializers.BooleanField(default=True)


# New Gamification Serializers

class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model."""
    is_global = serializers.ReadOnlyField()
    is_earned = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'description', 'badge_type', 'difficulty',
            'icon_url', 'token_reward', 'requirements', 'is_active',
            'is_global', 'is_earned', 'created_at', 'updated_at'
        ]

    def get_is_earned(self, obj):
        """Check if the current user has earned this badge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.earned_by_users.filter(user=request.user).exists()
        return False


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model."""
    badge_name = serializers.ReadOnlyField(source='badge.name')
    badge_description = serializers.ReadOnlyField(source='badge.description')
    badge_type = serializers.ReadOnlyField(source='badge.badge_type')
    difficulty = serializers.ReadOnlyField(source='badge.difficulty')

    class Meta:
        model = UserBadge
        fields = [
            'id', 'user', 'badge', 'badge_name', 'badge_description',
            'badge_type', 'difficulty', 'tokens_awarded', 'earned_at'
        ]


class LearningAchievementSerializer(serializers.ModelSerializer):
    """Serializer for LearningAchievement model."""
    progress_percentage = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = LearningAchievement
        fields = [
            'id', 'user', 'achievement_type', 'title', 'description',
            'value', 'target_value', 'token_reward', 'progress_percentage',
            'is_completed', 'earned_at'
        ]

    def get_progress_percentage(self, obj):
        """Calculate progress percentage."""
        if obj.target_value == 0:
            return 0
        return min(100, int((obj.value / obj.target_value) * 100))

    def get_is_completed(self, obj):
        """Check if achievement is completed."""
        return obj.value >= obj.target_value


class MarketingResourceSerializer(serializers.ModelSerializer):
    """Serializer for MarketingResource model."""
    is_global = serializers.ReadOnlyField()
    is_completed = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MarketingResource
        fields = [
            'id', 'title', 'description', 'content', 'resource_type',
            'category', 'difficulty_level', 'estimated_read_time',
            'tags', 'featured_image_url', 'external_url', 'is_featured',
            'is_published', 'view_count', 'is_global', 'is_completed',
            'progress_percentage', 'created_at', 'updated_at'
        ]

    def get_is_completed(self, obj):
        """Check if the current user has completed this resource."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            return progress.is_completed if progress else False
        return False

    def get_progress_percentage(self, obj):
        """Get user's progress percentage for this resource."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            if progress:
                # Calculate progress based on time spent vs estimated time
                estimated_seconds = obj.estimated_read_time * 60
                if estimated_seconds > 0:
                    return min(100, int((progress.time_spent / estimated_seconds) * 100))
        return 0


class UserResourceProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserResourceProgress model."""
    resource_title = serializers.ReadOnlyField(source='resource.title')
    resource_type = serializers.ReadOnlyField(source='resource.resource_type')
    estimated_read_time = serializers.ReadOnlyField(source='resource.estimated_read_time')

    class Meta:
        model = UserResourceProgress
        fields = [
            'id', 'user', 'resource', 'resource_title', 'resource_type',
            'is_completed', 'time_spent', 'estimated_read_time',
            'last_accessed', 'created_at'
        ]


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user learning statistics."""
    total_badges = serializers.IntegerField()
    total_achievements = serializers.IntegerField()
    tokens_earned = serializers.IntegerField()
    resources_completed = serializers.IntegerField()
    learning_streak = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()
    recent_activity = serializers.ListField(child=serializers.DictField(), required=False)


class BadgeEarnedSerializer(serializers.Serializer):
    """Serializer for badge earning events."""
    badge_id = serializers.UUIDField()
    user_id = serializers.UUIDField()
    tokens_awarded = serializers.IntegerField()
    earned_at = serializers.DateTimeField()


class AchievementProgressSerializer(serializers.Serializer):
    """Serializer for achievement progress updates."""
    achievement_type = serializers.CharField()
    value = serializers.IntegerField()
    target_value = serializers.IntegerField()
    progress_percentage = serializers.IntegerField()
    is_completed = serializers.BooleanField() 