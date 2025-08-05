# Campaigns App - Conditional Step Branching & Templates

This app provides marketing campaign management with support for conditional logic, branching workflows, and campaign templates.

## Conditional Step Branching

The `CampaignStep` model supports explicit true/false branching paths for conditional steps, allowing you to create sophisticated marketing automation workflows.

### New Fields

- `true_path_next_step`: ForeignKey to another CampaignStep that executes when the condition evaluates to True
- `false_path_next_step`: ForeignKey to another CampaignStep that executes when the condition evaluates to False

### Usage Example

```python
from campaigns.models import MarketingCampaign, CampaignStep

# Create a campaign
campaign = MarketingCampaign.objects.create(
    tenant=tenant,
    name="Lead Nurturing Campaign",
    status="Draft"
)

# Create steps
welcome_email = CampaignStep.objects.create(
    campaign=campaign,
    step_type="Email",
    name="Welcome Email",
    order=1
)

conditional_check = CampaignStep.objects.create(
    campaign=campaign,
    step_type="Conditional",
    name="Check Email Opened",
    order=2,
    config={
        "condition_type": "email_opened",
        "condition_value": "True",
        "true_path_label": "Opened Email",
        "false_path_label": "Did Not Open"
    }
)

follow_up_email = CampaignStep.objects.create(
    campaign=campaign,
    step_type="Email",
    name="Follow-up Email",
    order=3
)

sms_reminder = CampaignStep.objects.create(
    campaign=campaign,
    step_type="SMS",
    name="SMS Reminder",
    order=4
)

# Set up branching paths
conditional_check.true_path_next_step = follow_up_email  # If email opened, send follow-up
conditional_check.false_path_next_step = sms_reminder    # If email not opened, send SMS
conditional_check.save()
```

### API Response

When you retrieve a conditional step via the API, you'll get both the step IDs and human-readable names:

```json
{
  "id": 2,
  "name": "Check Email Opened",
  "step_type": "Conditional",
  "config": {
    "condition_type": "email_opened",
    "condition_value": "True",
    "true_path_label": "Opened Email",
    "false_path_label": "Did Not Open"
  },
  "true_path_next_step": 3,
  "true_path_next_step_name": "Follow-up Email (Lead Nurturing Campaign)",
  "false_path_next_step": 4,
  "false_path_next_step_name": "SMS Reminder (Lead Nurturing Campaign)"
}
```

### Reverse Relationships

You can also query which conditional steps point to a specific step:

```python
# Find all conditional steps that have this step as their true path
true_parents = follow_up_email.conditional_true_parent.all()

# Find all conditional steps that have this step as their false path
false_parents = sms_reminder.conditional_false_parent.all()
```

## Campaign Templates

The `MarketingCampaign` model now supports templates that can be used to quickly create new campaigns with predefined steps and configurations.

### Template Features

- **Template Marking**: Campaigns can be marked as templates using the `is_template` field
- **Complete Copying**: Templates copy all campaign properties and steps
- **Relationship Preservation**: Maintains all step relationships including conditional branching
- **Tenant Isolation**: Templates are tenant-specific for security

### Creating Templates

```python
# Create a template campaign
template_campaign = MarketingCampaign.objects.create(
    tenant=tenant,
    name="Welcome Series Template",
    description="A template for welcome email series",
    status="Draft",
    is_template=True,
    target_audience_segment="New Users",
    objective="Onboarding"
)

# Add steps to the template
welcome_email = CampaignStep.objects.create(
    campaign=template_campaign,
    step_type="Email",
    name="Welcome Email",
    order=1,
    config={"subject": "Welcome to our platform"}
)

conditional_check = CampaignStep.objects.create(
    campaign=template_campaign,
    step_type="Conditional",
    name="Check Email Opened",
    order=2,
    config={
        "condition_type": "email_opened",
        "true_path_label": "Opened",
        "false_path_label": "Not Opened"
    }
)

follow_up_email = CampaignStep.objects.create(
    campaign=template_campaign,
    step_type="Email",
    name="Follow-up Email",
    order=3,
    config={"subject": "Here's more information"}
)

sms_reminder = CampaignStep.objects.create(
    campaign=template_campaign,
    step_type="SMS",
    name="SMS Reminder",
    order=4,
    config={"message": "Don't forget to check your email"}
)

# Set up branching relationships
conditional_check.true_path_next_step = follow_up_email
conditional_check.false_path_next_step = sms_reminder
conditional_check.save()
```

### Creating Campaigns from Templates

#### API Usage

```bash
# Create a new campaign from a template
POST /api/campaigns/campaigns/{template_id}/create-from-template/
Content-Type: application/json

{
  "name": "My New Welcome Campaign"
}
```

#### Response

```json
{
  "id": 123,
  "name": "My New Welcome Campaign",
  "description": "A template for welcome email series",
  "status": "Draft",
  "is_template": false,
  "target_audience_segment": "New Users",
  "objective": "Onboarding",
  "created_at": "2025-08-02T19:42:00Z",
  "updated_at": "2025-08-02T19:42:00Z"
}
```

#### Python Usage

```python
import requests

# Create campaign from template
response = requests.post(
    f'/api/campaigns/campaigns/{template_campaign.id}/create-from-template/',
    json={'name': 'My New Welcome Campaign'},
    headers={'Authorization': 'Bearer your_token'}
)

if response.status_code == 201:
    new_campaign = response.json()
    print(f"Created campaign: {new_campaign['name']}")
    
    # The new campaign will have all the same steps as the template
    # with preserved relationships and configurations
```

### Template Validation

The API includes several validation checks:

1. **Template Verification**: Only campaigns marked as `is_template=True` can be used as templates
2. **Name Uniqueness**: New campaign names must be unique within the tenant
3. **Name Validation**: Campaign names cannot be empty
4. **Tenant Isolation**: Users can only create campaigns from templates in their own tenant

### Error Responses

```json
// Non-template campaign
{
  "detail": "The specified campaign is not marked as a template and cannot be used to create from."
}

// Duplicate name
{
  "detail": "A campaign with the name 'My Campaign' already exists for your tenant. Please choose a different name."
}

// Empty name
{
  "detail": "New campaign name cannot be empty."
}
```

## Migration

The new fields were added in migrations:
- `0002_campaignstep_false_path_next_step_and_more.py` - Added branching fields
- `0003_marketingcampaign_is_template.py` - Added template field

If you're upgrading from a previous version, run:

```bash
python manage.py migrate campaigns
```

## Testing

Run the tests to verify the functionality:

```bash
# Test conditional branching
python manage.py test campaigns.tests.CampaignStepBranchingTest

# Test campaign templates
python manage.py test campaigns.tests.CampaignTemplateTest

# Test all campaign functionality
python manage.py test campaigns.tests
``` 