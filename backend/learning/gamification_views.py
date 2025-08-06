from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from .models import (
    Badge, UserBadge, LearningAchievement, MarketingResource, UserResourceProgress
)
from .serializers import (
    BadgeSerializer, UserBadgeSerializer, LearningAchievementSerializer,
    MarketingResourceSerializer, UserResourceProgressSerializer,
    UserStatsSerializer, BadgeEarnedSerializer, AchievementProgressSerializer
)
from core.token_utils import get_token_cost_estimate


class BadgeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing badges.
    Supports both global and tenant-specific badges.
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'badge_type']
    ordering_fields = ['name', 'difficulty', 'created_at']
    ordering = ['difficulty', 'name']

    def get_queryset(self):
        """
        Override to return badges for the current tenant and global badges.
        """
        user = self.request.user
        queryset = Badge.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)  # Tenant-specific or global
        )
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by badge type
        badge_type = self.request.query_params.get('badge_type', None)
        if badge_type:
            queryset = queryset.filter(badge_type=badge_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset

    @action(detail=True, methods=['post'])
    def earn(self, request, pk=None):
        """Manually award a badge to the current user."""
        badge = self.get_object()
        user = request.user
        
        # Check if user already has this badge
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            return Response(
                {'detail': 'User already has this badge.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user badge
        user_badge = UserBadge.objects.create(user=user, badge=badge)
        
        return Response({
            'detail': f'Badge "{badge.name}" earned successfully!',
            'tokens_awarded': user_badge.tokens_awarded,
            'badge': BadgeSerializer(badge, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def earned(self, request):
        """Get badges earned by the current user."""
        user = request.user
        earned_badges = UserBadge.objects.filter(user=user)
        serializer = UserBadgeSerializer(earned_badges, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get badges available to the current user that haven't been earned."""
        user = request.user
        earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
        available_badges = self.get_queryset().exclude(id__in=earned_badge_ids)
        serializer = self.get_serializer(available_badges, many=True)
        return Response(serializer.data)


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user badges (read-only).
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['earned_at']
    ordering = ['-earned_at']

    def get_queryset(self):
        """Return badges earned by the current user."""
        return UserBadge.objects.filter(user=self.request.user)


class LearningAchievementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing learning achievements.
    """
    serializer_class = LearningAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'achievement_type']
    ordering_fields = ['title', 'earned_at']
    ordering = ['-earned_at']

    def get_queryset(self):
        """Return achievements for the current user."""
        return LearningAchievement.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update achievement progress."""
        achievement = self.get_object()
        serializer = AchievementProgressSerializer(data=request.data)
        
        if serializer.is_valid():
            new_value = serializer.validated_data['value']
            achievement.value = new_value
            
            # Check if achievement is completed
            if new_value >= achievement.target_value and not achievement.earned_at:
                achievement.earned_at = timezone.now()
            
            achievement.save()
            
            return Response({
                'detail': 'Achievement progress updated successfully.',
                'achievement': self.get_serializer(achievement).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def progress_summary(self, request):
        """Get achievement progress summary for the current user."""
        user = request.user
        achievements = self.get_queryset()
        
        summary = {
            'total_achievements': achievements.count(),
            'completed_achievements': achievements.filter(earned_at__isnull=False).count(),
            'total_tokens_earned': achievements.filter(earned_at__isnull=False).aggregate(
                total=Sum('token_reward')
            )['total'] or 0,
            'recent_achievements': achievements.filter(
                earned_at__gte=timezone.now() - timedelta(days=7)
            ).count()
        }
        
        return Response(summary)


class MarketingResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing marketing resources.
    Supports both global and tenant-specific resources.
    """
    queryset = MarketingResource.objects.all()
    serializer_class = MarketingResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['title', 'created_at', 'view_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Override to return resources for the current tenant and global resources.
        """
        user = self.request.user
        queryset = MarketingResource.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)  # Tenant-specific or global
        )
        
        # Filter by published status
        is_published = self.request.query_params.get('is_published', None)
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type', None)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by difficulty level
        difficulty = self.request.query_params.get('difficulty_level', None)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        # Filter featured resources
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(is_featured=featured.lower() == 'true')
        
        return queryset

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """Record a view of the resource."""
        resource = self.get_object()
        resource.increment_view_count()
        
        # Create or update user progress
        user = request.user
        progress, created = UserResourceProgress.objects.get_or_create(
            user=user,
            resource=resource,
            defaults={'time_spent': 0}
        )
        
        return Response({'detail': 'View recorded successfully.'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a resource as completed by the current user."""
        resource = self.get_object()
        user = request.user
        
        # Get or create user progress
        progress, created = UserResourceProgress.objects.get_or_create(
            user=user,
            resource=resource,
            defaults={'time_spent': 0}
        )
        
        if progress.is_completed:
            return Response(
                {'detail': 'Resource already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as completed
        progress.is_completed = True
        progress.save()
        
        # Award tokens (25 tokens for completing a resource)
        token_reward = 25
        tenant = user.tenant
        if tenant:
            tenant.tokens_purchased_additional += token_reward
            tenant.save()
        
        return Response({
            'detail': f'Resource "{resource.title}" completed successfully!',
            'tokens_awarded': token_reward
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update user progress on a resource."""
        resource = self.get_object()
        user = request.user
        time_spent = request.data.get('time_spent', 0)
        
        # Get or create user progress
        progress, created = UserResourceProgress.objects.get_or_create(
            user=user,
            resource=resource,
            defaults={'time_spent': 0}
        )
        
        # Update time spent
        progress.time_spent += time_spent
        progress.save()
        
        # Calculate progress percentage
        estimated_seconds = resource.estimated_read_time * 60
        progress_percentage = min(100, int((progress.time_spent / estimated_seconds) * 100)) if estimated_seconds > 0 else 0
        
        return Response({
            'detail': 'Progress updated successfully.',
            'time_spent': progress.time_spent,
            'progress_percentage': progress_percentage
        })

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available resource categories."""
        categories = MarketingResource.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available resource types."""
        types = MarketingResource.objects.values_list('resource_type', flat=True).distinct()
        return Response(list(types))


class UserResourceProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user resource progress (read-only).
    """
    serializer_class = UserResourceProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['last_accessed', 'created_at']
    ordering = ['-last_accessed']

    def get_queryset(self):
        """Return resource progress for the current user."""
        return UserResourceProgress.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed resources for the current user."""
        completed_progress = self.get_queryset().filter(is_completed=True)
        serializer = self.get_serializer(completed_progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get resources in progress for the current user."""
        in_progress = self.get_queryset().filter(is_completed=False, time_spent__gt=0)
        serializer = self.get_serializer(in_progress, many=True)
        return Response(serializer.data)


class GamificationStatsViewSet(viewsets.ViewSet):
    """
    ViewSet for gamification statistics and user progress.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get comprehensive user learning statistics."""
        user = request.user
        
        # Badge statistics
        total_badges = Badge.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)
        ).count()
        earned_badges = UserBadge.objects.filter(user=user).count()
        
        # Achievement statistics
        total_achievements = LearningAchievement.objects.filter(user=user).count()
        completed_achievements = LearningAchievement.objects.filter(
            user=user, earned_at__isnull=False
        ).count()
        
        # Resource statistics
        total_resources = MarketingResource.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)
        ).count()
        completed_resources = UserResourceProgress.objects.filter(
            user=user, is_completed=True
        ).count()
        
        # Token statistics
        tokens_from_badges = UserBadge.objects.filter(user=user).aggregate(
            total=Sum('tokens_awarded')
        )['total'] or 0
        tokens_from_achievements = LearningAchievement.objects.filter(
            user=user, earned_at__isnull=False
        ).aggregate(total=Sum('token_reward'))['total'] or 0
        tokens_from_resources = completed_resources * 25  # 25 tokens per resource
        total_tokens_earned = tokens_from_badges + tokens_from_achievements + tokens_from_resources
        
        # Learning streak (simplified - in production you'd track daily activity)
        learning_streak = 0  # This would be calculated based on daily activity
        
        # Total time spent learning
        total_time_spent = UserResourceProgress.objects.filter(user=user).aggregate(
            total=Sum('time_spent')
        )['total'] or 0
        
        stats = {
            'total_badges': total_badges,
            'earned_badges': earned_badges,
            'total_achievements': total_achievements,
            'completed_achievements': completed_achievements,
            'total_resources': total_resources,
            'completed_resources': completed_resources,
            'tokens_earned': total_tokens_earned,
            'learning_streak': learning_streak,
            'total_time_spent': total_time_spent,
            'recent_activity': self._get_recent_activity(user)
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)

    def _get_recent_activity(self, user):
        """Get recent learning activity for the user."""
        recent_activity = []
        
        # Recent badge earnings
        recent_badges = UserBadge.objects.filter(
            user=user,
            earned_at__gte=timezone.now() - timedelta(days=7)
        )[:5]
        
        for badge in recent_badges:
            recent_activity.append({
                'type': 'badge_earned',
                'title': f'Earned "{badge.badge.name}" badge',
                'description': f'+{badge.tokens_awarded} tokens',
                'timestamp': badge.earned_at,
                'icon': 'award'
            })
        
        # Recent resource completions
        recent_completions = UserResourceProgress.objects.filter(
            user=user,
            is_completed=True,
            last_accessed__gte=timezone.now() - timedelta(days=7)
        )[:5]
        
        for completion in recent_completions:
            recent_activity.append({
                'type': 'resource_completed',
                'title': f'Completed "{completion.resource.title}"',
                'description': '+25 tokens',
                'timestamp': completion.last_accessed,
                'icon': 'check'
            })
        
        # Sort by timestamp
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        return recent_activity[:10]  # Return top 10 activities

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get learning leaderboard for the tenant."""
        user = request.user
        tenant = user.tenant
        
        if not tenant:
            return Response({'detail': 'No tenant found.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get users in the same tenant
        tenant_users = tenant.users.all()
        
        leaderboard_data = []
        for tenant_user in tenant_users:
            # Calculate user stats
            earned_badges = UserBadge.objects.filter(user=tenant_user).count()
            completed_resources = UserResourceProgress.objects.filter(
                user=tenant_user, is_completed=True
            ).count()
            total_tokens = UserBadge.objects.filter(user=tenant_user).aggregate(
                total=Sum('tokens_awarded')
            )['total'] or 0
            total_tokens += completed_resources * 25
            
            leaderboard_data.append({
                'user_id': str(tenant_user.id),
                'user_name': tenant_user.get_full_name() or tenant_user.email,
                'badges_earned': earned_badges,
                'resources_completed': completed_resources,
                'total_tokens': total_tokens,
                'score': earned_badges * 10 + completed_resources * 5 + total_tokens
            })
        
        # Sort by score
        leaderboard_data.sort(key=lambda x: x['score'], reverse=True)
        
        return Response(leaderboard_data[:20])  # Return top 20 users 