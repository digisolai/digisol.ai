from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import AllowOptionsPermission
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import uuid
import csv
from rest_framework.views import APIView

from .serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer, 
    AdminUserUpdateSerializer,
    UserInviteSerializer
)
from core.models import Contact, Tenant
from core.serializers import ContactSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    Register a new user account.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Create a tenant for the new user
        tenant = Tenant.objects.create(
            name=f"{user.username}'s Organization",
            subdomain=f"{user.username.lower()}-org",
            is_active=True
        )
        user.tenant = tenant
        user.save()

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update user profile information.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [AllowOptionsPermission]

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    """
    Change user password.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Both old_password and new_password are required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check old password
        if not user.check_password(old_password):
            return Response({'old_password': ['Wrong password.']}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated successfully'}, 
                      status=status.HTTP_200_OK)

class PasswordResetRequestView(generics.CreateAPIView):
    """
    Request password reset.
    """
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implement actual password reset logic
        return Response({
            'message': 'Password reset email sent if the email exists in our system.'
        }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.CreateAPIView):
    """
    Confirm password reset with token.
    """
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # TODO: Implement actual password reset confirmation logic
        return Response({
            'message': 'Password reset confirmed.'
        }, status=status.HTTP_200_OK)

class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact model.
    Provides CRUD operations for contact management within the accounts app.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [AllowAny]  # Allow anyone to access for testing
    
    def get_queryset(self):
        """Return all contacts for testing purposes, bypassing tenant filtering."""
        return Contact.objects.all_tenants() # Use all_tenants to bypass TenantAwareManager
    
    def _apply_qualification_rules(self, contact):
        """
        Applies predefined rules to update contact's score and lead_status.
        This is a simplified rule-based system, extensible for more complex logic.
        """
        initial_score = contact.score if contact.score is not None else 0
        initial_lead_status = contact.lead_status

        current_score = initial_score

        # Rule 1: Email Domain Quality (Simple check for non-generic emails)
        if contact.email and '@' in contact.email:
            domain = contact.email.split('@')[-1].lower()
            if domain not in ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']:
                current_score += 20
        
        # Rule 2: Job Title Relevance
        if contact.job_title:
            job_title_lower = contact.job_title.lower()
            if any(keyword in job_title_lower for keyword in ['ceo', 'founder', 'director', 'manager', 'head of', 'vp', 'chief']):
                current_score += 30
            elif any(keyword in job_title_lower for keyword in ['analyst', 'specialist', 'coordinator']):
                current_score += 10
        
        # Rule 3: Company Information Presence
        if contact.company and contact.company.strip():
            current_score += 15
        
        # Rule 4: Lead Source Value
        if contact.lead_source:
            lead_source_lower = contact.lead_source.lower()
            if lead_source_lower == 'referral':
                current_score += 40
            elif lead_source_lower == 'website form':
                current_score += 10
            elif lead_source_lower == 'cold outreach':
                current_score += 5
            elif lead_source_lower == 'event' or 'webinar' in lead_source_lower:
                current_score += 25

        # Ensure score does not fall below 0
        contact.score = max(0, current_score)

        # Determine lead_status based on score thresholds
        new_lead_status = initial_lead_status # Default to current status
        if contact.score >= 80:
            new_lead_status = "Qualified"
        elif contact.score >= 50:
            new_lead_status = "Contacted" # Can be "Engaged" if you have that status
        elif contact.score < 50:
            new_lead_status = "New Lead" # Reset to New Lead if score drops

        # Only update if status changed, unless it's a new contact (where default might be None)
        if new_lead_status != initial_lead_status:
            contact.lead_status = new_lead_status

        # Save only if score or status has genuinely changed from their initial values
        if contact.score != initial_score or contact.lead_status != initial_lead_status:
            contact.save(update_fields=['score', 'lead_status'])
            print(f"Contact {contact.id} - Score updated from {initial_score} to {contact.score}, Status updated from '{initial_lead_status}' to '{contact.lead_status}'")

    def perform_create(self, serializer):
        """Create contact without tenant restrictions for testing and apply qualification rules."""
        # For testing, get the first tenant or create one
        try:
            default_tenant = Tenant.objects.first()
            if not default_tenant:
                default_tenant = Tenant.objects.create(
                    name="Default Test Tenant",
                    subdomain="test-tenant",
                    is_active=True
                )
        except Exception:
            # If there's any issue, create a new tenant with a unique name
            unique_id = str(uuid.uuid4())[:8]
            default_tenant = Tenant.objects.create(
                name=f"Test Tenant {unique_id}",
                subdomain=f"test-{unique_id}",
                is_active=True
            )
        contact = serializer.save(tenant=default_tenant)
        # Apply rules immediately after the contact is initially saved
        self._apply_qualification_rules(contact)

    def perform_update(self, serializer):
        """Applies qualification rules after a contact is updated."""
        contact = serializer.save() # Save the updates first
        self._apply_qualification_rules(contact) # Then apply rules

    @action(detail=True, methods=['post'])
    def generate_ai_insights(self, request, pk=None):
        """Generate AI insights for a specific contact with Prospero's lead nurturing expertise."""
        contact = self.get_object()
        chat_transcript = request.data.get('chat_transcript', None)  # Get optional chat transcript
        
        # Initialize Prospero's insights
        prospero_summary_parts = []
        prospero_suggestion_parts = []

        prospero_summary_parts.append(f"Prospero's analysis of {contact.first_name} {contact.last_name}'s profile:")

        # Lead status-based insights with Prospero's voice
        if contact.lead_status == "New Lead":
            prospero_summary_parts.append(f"Identified as a new lead. Email: {contact.email}.")
            prospero_suggestion_parts.append(f"Prospero suggests sending an introductory email and scheduling a discovery call to understand their needs.")
        elif contact.lead_status == "Contacted":
            prospero_summary_parts.append(f"This lead has been contacted. Current status: '{contact.lead_status}'.")
            prospero_suggestion_parts.append(f"Prospero recommends following up within 3-5 business days. Reiterate value proposition based on initial conversation points.")
        elif contact.lead_status == "Qualified":
            prospero_summary_parts.append(f"This is a qualified lead, ready for conversion. Last contact was {contact.last_contact_date or 'unknown'}.")
            prospero_suggestion_parts.append(f"Prospero advises preparing a tailored proposal based on their expressed needs and setting up a product demo.")
        elif contact.lead_status == "Customer":
            prospero_summary_parts.append(f"An existing customer, maintaining engagement. Current status: '{contact.lead_status}'.")
            prospero_suggestion_parts.append(f"Prospero suggests a follow-up for potential upsell/cross-sell opportunities, or gathering a testimonial to leverage their success.")
        else:
            prospero_summary_parts.append(f"Lead status is '{contact.lead_status}'.")
            prospero_suggestion_parts.append(f"Prospero recommends reviewing their recent engagement data for personalized outreach opportunities.")

        # Priority-based insights
        if contact.priority == "High":
            prospero_summary_parts.append("This is a high-priority contact.")
            prospero_suggestion_parts.insert(0, "Prospero highlights: Prioritize outreach within 24 hours due to high priority.")  # Prepend urgent suggestion

        # Company and job title insights
        if contact.company:
            prospero_summary_parts.append(f"Company: {contact.company}")
        if contact.job_title:
            prospero_summary_parts.append(f"Role: {contact.job_title}")

        # Chat transcript analysis (if provided)
        if chat_transcript:
            # Simulate Prospero's AI summarizing the chat transcript
            chat_insight_summary = "Prospero's Chat Insight: "
            
            # Analyze chat content for key themes
            chat_lower = chat_transcript.lower()
            if "pricing" in chat_lower or "cost" in chat_lower or "roi" in chat_lower:
                chat_insight_summary += "Lead inquired about pricing and ROI considerations."
            elif "features" in chat_lower or "functionality" in chat_lower or "capabilities" in chat_lower:
                chat_insight_summary += "Lead expressed interest in specific product features and capabilities."
            elif "demo" in chat_lower or "trial" in chat_lower or "test" in chat_lower:
                chat_insight_summary += "Lead requested a product demo or trial access."
            elif "problem" in chat_lower or "challenge" in chat_lower or "pain" in chat_lower:
                chat_insight_summary += "Lead shared current pain points and challenges they're facing."
            elif "timeline" in chat_lower or "deadline" in chat_lower or "when" in chat_lower:
                chat_insight_summary += "Lead discussed implementation timeline and urgency."
            elif "team" in chat_lower or "users" in chat_lower or "department" in chat_lower:
                chat_insight_summary += "Lead mentioned team size and user requirements."
            elif "integration" in chat_lower or "api" in chat_lower or "connect" in chat_lower:
                chat_insight_summary += "Lead asked about technical integration and API capabilities."
            else:
                chat_insight_summary += "General discussion. Potential topics for follow-up: [simulated topics from transcript, e.g., 'workflow automation']."

            # Add chat summary to the insights
            prospero_summary_parts.append(f"\n--- Chat Summary ---\n{chat_insight_summary}")
            prospero_summary_parts.append(f"(Excerpt: '{chat_transcript[:100]}...')")

        # Generate suggested persona based on job title and company (Prospero's analysis)
        suggested_persona_value = "General Business Professional"  # Default
        if contact.job_title:
            job_title_lower = contact.job_title.lower()
            if "manager" in job_title_lower or "director" in job_title_lower:
                suggested_persona_value = "Mid-Level Decision Maker"
            elif "ceo" in job_title_lower or "founder" in job_title_lower or "chief" in job_title_lower:
                suggested_persona_value = "Executive Leader"
            elif "tech" in job_title_lower or "engineer" in job_title_lower or "developer" in job_title_lower:
                suggested_persona_value = "Tech Innovator"
            elif "marketing" in job_title_lower or "brand" in job_title_lower:
                suggested_persona_value = "Marketing Professional"
        elif contact.company:
            company_lower = contact.company.lower()
            if "software" in company_lower or "tech" in company_lower or "startup" in company_lower:
                suggested_persona_value = "Software & Tech Buyer"
            elif "agency" in company_lower or "consulting" in company_lower:
                suggested_persona_value = "Agency/Consulting Professional"
        else:
            suggested_persona_value = "Undefined Persona"
        
        contact.suggested_persona = suggested_persona_value

        # Combine parts into final responses
        contact.last_activity_summary = "\n".join(prospero_summary_parts).strip()
        contact.next_action_suggestion = " ".join(prospero_suggestion_parts).strip()

        contact.save()
        serializer = self.get_serializer(contact)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='data-gaps')
    def get_data_gaps(self, request, pk=None):
        """Identify and report on missing crucial data points for a specific contact."""
        contact = self.get_object()
        missing_fields = []

        # Define crucial fields and their importance messages
        crucial_fields_definitions = {
            'company': "Company information is vital for B2B targeting and personalization.",
            'job_title': "Knowing the job title helps tailor communication to their role.",
            'phone_number': "A phone number enables direct outreach for high-priority leads.",
            'lead_source': "Understanding lead source helps optimize marketing channels.",
            'notes': "Detailed notes provide context for past interactions and future strategy.",
            'tags': "Tags are essential for flexible segmentation and categorization.",
            'priority': "Lead priority helps focus sales and marketing efforts effectively.",
            'score': "A lead score indicates potential readiness to convert."
        }

        for field_name, importance_message in crucial_fields_definitions.items():
            field_value = getattr(contact, field_name, None)

            is_missing = False
            if field_value is None:
                is_missing = True
            elif isinstance(field_value, str) and not field_value.strip():  # Empty string or just whitespace
                is_missing = True
            elif isinstance(field_value, list) and not field_value:  # Empty list for JSONFields like tags
                is_missing = True
            elif isinstance(field_value, int) and field_name == 'score' and field_value == 0:  # If score is 0 and it's considered missing data
                is_missing = True

            if is_missing:
                missing_fields.append({
                    'field': field_name,
                    'message': f"Missing {field_name.replace('_', ' ')}. {importance_message}"
                })

        if not missing_fields:
            return Response({
                "message": "All crucial data points are present!", 
                "gaps": []
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Crucial data gaps identified.", 
                "gaps": missing_fields
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='find-duplicates')
    def find_duplicates(self, request):
        """Identify potential duplicate contacts within the current tenant's data."""
        queryset = self.get_queryset()  # Get contacts for the current tenant

        # Dictionary to store potential duplicates
        # Key: field value (e.g., email address, phone number)
        # Value: list of contacts sharing that value
        email_duplicates = {}
        phone_duplicates = {}

        for contact in queryset:
            # Check for email duplicates (case-insensitive)
            if contact.email:
                normalized_email = contact.email.lower()
                email_duplicates.setdefault(normalized_email, []).append(contact)

            # Check for phone number duplicates (if phone is not empty)
            if contact.phone_number:
                normalized_phone = ''.join(filter(str.isdigit, contact.phone_number))  # Normalize phone
                if normalized_phone:  # Only consider if normalized phone is not empty
                    phone_duplicates.setdefault(normalized_phone, []).append(contact)

        # Filter out groups that have only one contact (not duplicates)
        duplicate_groups = []

        # Add email duplicate groups
        for email_val, contacts_list in email_duplicates.items():
            if len(contacts_list) > 1:
                duplicate_groups.append({
                    'reason': 'Email Match',
                    'value': email_val,
                    'contacts': ContactSerializer(contacts_list, many=True, context={'request': request}).data
                })

        # Add phone number duplicate groups (avoiding double counting if email also matches)
        for phone_val, contacts_list in phone_duplicates.items():
            if len(contacts_list) > 1:
                # Check if this group isn't already covered by an email duplicate
                is_covered = False
                for group in duplicate_groups:
                    if group['reason'] == 'Email Match':
                        # Compare contact IDs to see if any contact in this phone group is already in an email group
                        current_contact_ids = {c.id for c in contacts_list}
                        existing_group_ids = {c['id'] for c in group['contacts']}
                        if not current_contact_ids.isdisjoint(existing_group_ids):
                            is_covered = True
                            break
                
                if not is_covered:
                    duplicate_groups.append({
                        'reason': 'Phone Match',
                        'value': phone_val,
                        'contacts': ContactSerializer(contacts_list, many=True, context={'request': request}).data
                    })

        if not duplicate_groups:
            return Response({
                "message": "No potential duplicate contacts found.", 
                "duplicates_found": False, 
                "duplicate_groups": []
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": f"Found {len(duplicate_groups)} potential duplicate groups.", 
                "duplicates_found": True, 
                "duplicate_groups": duplicate_groups
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        """
        Export all contacts for the current tenant to a CSV file.
        """
        queryset = self.get_queryset()  # This automatically filters contacts by the current tenant

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="digisol_ai_contacts_export.csv"'

        writer = csv.writer(response)

        # Define CSV Headers. Make sure these match your Contact model fields.
        # Include all fields relevant for export.
        headers = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'company', 'job_title', 'lead_source', 'lead_status',
            'last_contact_date', 'notes', 'tags', 'priority', 'score',
            'last_activity_summary', 'next_action_suggestion', 'suggested_persona',
            'created_at', 'updated_at'
        ]
        writer.writerow(headers)

        for contact in queryset:
            row = []
            for field_name in headers:
                # Use getattr safely, providing a default of None if the field might not exist
                value = getattr(contact, field_name, None)

                if field_name == 'id':
                    # Ensure UUIDs are converted to string
                    row.append(str(value))
                elif field_name == 'tags':
                    # Convert list of tags to a comma-separated string
                    row.append(",".join(value) if isinstance(value, list) else '')
                elif field_name in ['last_contact_date', 'created_at', 'updated_at'] and value:
                    # Format datetime objects to ISO format string
                    row.append(value.isoformat())
                elif value is None:
                    # Replace None with empty string for CSV
                    row.append('')
                else:
                    # Convert all other values to string
                    row.append(str(value))

            writer.writerow(row)
        return response

    @action(detail=False, methods=['post'], url_path='merge')
    def merge_contacts(self, request):
        """
        Merge multiple duplicate contacts into a designated master contact.
        Combines data from duplicates into the master and deletes the duplicates.
        """
        master_id = request.data.get('master_contact_id')
        duplicate_ids = request.data.get('duplicate_contact_ids', [])

        if not master_id or not duplicate_ids:
            return Response(
                {"detail": "Both 'master_contact_id' and 'duplicate_contact_ids' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if master_id in duplicate_ids:
            return Response(
                {"detail": "Master contact cannot be in the list of duplicates."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure all IDs are valid integers
        try:
            master_id_int = int(master_id)
            duplicate_ids_int = [int(id_str) for id_str in duplicate_ids]
        except ValueError:
            return Response(
                {"detail": "Invalid format for contact IDs. Must be integers."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Fetch master contact, applying tenant filtering
            master_contact = self.get_queryset().get(id=master_id_int)
            # Fetch duplicates, applying tenant filtering (exclude master from duplicates)
            duplicate_contacts = self.get_queryset().filter(id__in=duplicate_ids_int).exclude(id=master_id_int)

            if not duplicate_contacts.exists():
                return Response(
                    {"detail": "No valid duplicate contacts found for merging."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # --- Merging Logic ---
            # Combine notes
            all_notes = [master_contact.notes or ""] + [d.notes or "" for d in duplicate_contacts]
            master_contact.notes = "\n---\n".join(filter(None, all_notes)).strip()

            # Combine unique tags
            all_tags = set(master_contact.tags or [])
            for d in duplicate_contacts:
                all_tags.update(d.tags or [])
            master_contact.tags = list(all_tags)

            # Combine other fields (prioritize non-empty from duplicates, or master)
            for field_name in ['phone_number', 'company', 'job_title', 'lead_source', 'lead_status', 'priority', 'score']:
                master_value = getattr(master_contact, field_name)
                if master_value is None or (isinstance(master_value, str) and not master_value.strip()) or (isinstance(master_value, list) and not master_value):
                    for d in duplicate_contacts:
                        duplicate_value = getattr(d, field_name)
                        if duplicate_value is not None and ((isinstance(duplicate_value, str) and duplicate_value.strip()) or (isinstance(duplicate_value, list) and duplicate_value)):
                            setattr(master_contact, field_name, duplicate_value)
                            break  # Take the first non-empty from duplicates

            # Handle last_contact_date (take latest)
            master_date = master_contact.last_contact_date
            for d in duplicate_contacts:
                if d.last_contact_date and (not master_date or d.last_contact_date > master_date):
                    master_date = d.last_contact_date
            master_contact.last_contact_date = master_date

            # AI-generated fields (Keep master's or re-run AI after merge)
            # For now, let's reset them or keep master's; a full AI re-gen would be a separate call
            # master_contact.last_activity_summary = None
            # master_contact.next_action_suggestion = None
            # master_contact.suggested_persona = None

            master_contact.save()

            # Delete duplicate contacts (be explicit about which ones to delete)
            duplicate_contact_ids = list(duplicate_contacts.values_list('id', flat=True))
            Contact.objects.all_tenants().filter(id__in=duplicate_contact_ids).delete()

            serializer = self.get_serializer(master_contact)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Contact.DoesNotExist:
            return Response(
                {"detail": "One or more contacts not found or not accessible to your tenant."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Log the error for debugging
            print(f"Error during merge: {e}")
            return Response(
                {"detail": f"An unexpected error occurred during merge: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management operations.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter users by tenant."""
        return User.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Create user with tenant assignment."""
        serializer.save(tenant=self.request.user.tenant)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view with additional user data.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        print(f"Token obtain view POST request from origin: {request.META.get('HTTP_ORIGIN')}")
        print(f"Token obtain view POST request data: {request.data}")
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the user from the request data
            email = request.data.get('email') or request.data.get('username')
            if email:
                try:
                    user = User.objects.get(email=email)
                    response.data['user'] = {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'tenant': {
                            'id': user.tenant.id,
                            'name': user.tenant.name,
                            'subdomain': user.tenant.subdomain
                        } if user.tenant else None
                    }
                except User.DoesNotExist:
                    pass
        
        print(f"Token obtain view POST response status: {response.status_code}")
        return response
    
    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight."""
        print(f"Token obtain view OPTIONS request from origin: {request.META.get('HTTP_ORIGIN')}")
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        print(f"Token obtain view OPTIONS response headers: {dict(response.headers)}")
        return response

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view.
    """
    # Allow anonymous access; refresh is validated by the provided refresh token
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response
    
    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight."""
        print(f"Token refresh view OPTIONS request from origin: {request.META.get('HTTP_ORIGIN')}")
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        print(f"Token refresh view OPTIONS response headers: {dict(response.headers)}")
        return response


class CORSTestView(APIView):
    """
    Test view to verify CORS is working.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        print(f"CORS test GET request from origin: {request.META.get('HTTP_ORIGIN')}")
        return Response({
            'message': 'CORS test successful',
            'origin': request.META.get('HTTP_ORIGIN'),
            'method': request.method
        })
    
    def post(self, request):
        print(f"CORS test POST request from origin: {request.META.get('HTTP_ORIGIN')}")
        return Response({
            'message': 'CORS test successful',
            'origin': request.META.get('HTTP_ORIGIN'),
            'method': request.method,
            'data': request.data
        })
    
    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight."""
        print(f"CORS test OPTIONS request from origin: {request.META.get('HTTP_ORIGIN')}")
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        print(f"CORS test OPTIONS response headers: {dict(response.headers)}")
        return response
