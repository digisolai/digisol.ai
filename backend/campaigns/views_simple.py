from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def campaigns_list_simple(request):
    """
    Simple campaigns endpoint that's production-ready
    """
    try:
        # Test database connection first
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Import models safely
        from campaigns.models import MarketingCampaign
        
        # Get campaigns with minimal fields
        campaigns = MarketingCampaign.objects.values(
            'id', 'name', 'description', 'campaign_type', 
            'objective', 'status', 'budget', 'actual_spent',
            'created_at', 'updated_at'
        )
        
        # Convert to list and handle any serialization issues
        campaigns_list = []
        for campaign in campaigns:
            try:
                # Ensure all values are serializable
                campaign_data = {
                    'id': str(campaign['id']),
                    'name': campaign['name'] or '',
                    'description': campaign['description'] or '',
                    'campaign_type': campaign['campaign_type'] or '',
                    'objective': campaign['objective'] or '',
                    'status': campaign['status'] or '',
                    'budget': float(campaign['budget'] or 0),
                    'actual_spent': float(campaign['actual_spent'] or 0),
                    'created_at': campaign['created_at'].isoformat() if campaign['created_at'] else None,
                    'updated_at': campaign['updated_at'].isoformat() if campaign['updated_at'] else None,
                }
                campaigns_list.append(campaign_data)
            except Exception as e:
                logger.warning(f"Error serializing campaign {campaign.get('id', 'unknown')}: {e}")
                continue
        
        return Response({
            'success': True,
            'count': len(campaigns_list),
            'campaigns': campaigns_list
        })
        
    except Exception as e:
        logger.error(f"Error in campaigns_list_simple: {e}")
        return Response({
            'success': False,
            'error': 'Failed to fetch campaigns',
            'detail': str(e) if settings.DEBUG else 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_campaign_simple(request):
    """
    Simple campaign creation endpoint
    """
    try:
        from campaigns.models import MarketingCampaign
        
        # Get data from request
        data = request.data
        
        # Create campaign with minimal required fields
        campaign = MarketingCampaign.objects.create(
            name=data.get('name', 'New Campaign'),
            description=data.get('description', ''),
            campaign_type=data.get('campaign_type', 'email'),
            objective=data.get('objective', 'leads'),
            status=data.get('status', 'Draft'),
            budget=data.get('budget', 0),
        )
        
        return Response({
            'success': True,
            'campaign': {
                'id': str(campaign.id),
                'name': campaign.name,
                'status': campaign.status,
                'created_at': campaign.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        return Response({
            'success': False,
            'error': 'Failed to create campaign',
            'detail': str(e) if settings.DEBUG else 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def campaigns_stats_simple(request):
    """
    Simple campaigns statistics endpoint
    """
    try:
        from campaigns.models import MarketingCampaign
        from django.db.models import Sum, Count
        
        # Get basic stats
        total_campaigns = MarketingCampaign.objects.count()
        active_campaigns = MarketingCampaign.objects.filter(status='Active').count()
        
        # Get budget stats
        budget_stats = MarketingCampaign.objects.aggregate(
            total_budget=Sum('budget'),
            total_spent=Sum('actual_spent')
        )
        
        return Response({
            'success': True,
            'stats': {
                'total_campaigns': total_campaigns,
                'active_campaigns': active_campaigns,
                'total_budget': float(budget_stats['total_budget'] or 0),
                'total_spent': float(budget_stats['total_spent'] or 0),
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting campaign stats: {e}")
        return Response({
            'success': False,
            'error': 'Failed to get campaign statistics',
            'detail': str(e) if settings.DEBUG else 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
