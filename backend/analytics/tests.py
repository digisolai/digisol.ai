from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import LeadFunnelEvent
from core.models import Tenant, Contact
from campaigns.models import MarketingCampaign

User = get_user_model()


class LeadFunnelEventModelTest(TestCase):
    """Test the LeadFunnelEvent model."""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(name="Test Tenant")
        self.contact = Contact.objects.create(
            tenant=self.tenant,
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        self.campaign = MarketingCampaign.objects.create(
            tenant=self.tenant,
            name="Test Campaign",
            status="Draft"
        )
    
    def test_lead_funnel_event_creation(self):
        """Test creating a LeadFunnelEvent."""
        event = LeadFunnelEvent.objects.create(
            tenant=self.tenant,
            contact=self.contact,
            event_type="Email_Opened",
            campaign=self.campaign,
            event_data={"email_subject": "Test Email"}
        )
        
        self.assertEqual(event.contact.email, "test@example.com")
        self.assertEqual(event.event_type, "Email_Opened")
        self.assertEqual(event.campaign.name, "Test Campaign")
        self.assertEqual(event.event_data["email_subject"], "Test Email")
        self.assertTrue(event.has_campaign_context)
    
    def test_event_summary_property(self):
        """Test the event_summary property."""
        event = LeadFunnelEvent.objects.create(
            tenant=self.tenant,
            contact=self.contact,
            event_type="MQL_Achieved",
            campaign=self.campaign
        )
        
        expected_summary = f"MQL Achieved - {self.campaign.name}"
        self.assertEqual(event.event_summary, expected_summary)


class LeadFunnelEventAPITest(APITestCase):
    """Test the LeadFunnelEvent API endpoints."""
    
    def setUp(self):
        self.tenant = Tenant.objects.create(name="Test Tenant")
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            tenant=self.tenant
        )
        self.contact = Contact.objects.create(
            tenant=self.tenant,
            email="contact@example.com",
            first_name="Contact",
            last_name="User"
        )
        self.campaign = MarketingCampaign.objects.create(
            tenant=self.tenant,
            name="Test Campaign",
            status="Draft"
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_lead_funnel_event(self):
        """Test creating a lead funnel event via API."""
        data = {
            "contact": str(self.contact.id),
            "event_type": "Email_Opened",
            "campaign": str(self.campaign.id),
            "event_data": {"email_subject": "Test Email"}
        }
        
        response = self.client.post('/api/analytics/lead-funnel-events/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeadFunnelEvent.objects.count(), 1)
        
        event = LeadFunnelEvent.objects.first()
        self.assertEqual(event.event_type, "Email_Opened")
        self.assertEqual(event.tenant, self.tenant)
    
    def test_list_lead_funnel_events(self):
        """Test listing lead funnel events."""
        # Create a test event
        LeadFunnelEvent.objects.create(
            tenant=self.tenant,
            contact=self.contact,
            event_type="Email_Opened",
            campaign=self.campaign
        )
        
        response = self.client.get('/api/analytics/lead-funnel-events/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['event_type'], "Email_Opened")
    
    def test_funnel_summary_endpoint(self):
        """Test the funnel summary endpoint."""
        # Create some test events
        LeadFunnelEvent.objects.create(
            tenant=self.tenant,
            contact=self.contact,
            event_type="Email_Opened",
            campaign=self.campaign
        )
        LeadFunnelEvent.objects.create(
            tenant=self.tenant,
            contact=self.contact,
            event_type="MQL_Achieved",
            campaign=self.campaign
        )
        
        response = self.client.get('/api/analytics/lead-funnel-events/funnel_summary/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_events'], 2)
        self.assertEqual(response.data['funnel_progression']['email_opens'], 1)
        self.assertEqual(response.data['funnel_progression']['mql_count'], 1)
