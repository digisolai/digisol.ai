# Superuser Unlimited Access Setup Guide

## Overview
This guide will help you set up your superuser account to appear as a fully paid customer with unlimited access to all features. This is perfect for marketing and demonstration purposes.

## What This Accomplishes

### For Your Superuser Account:
- ✅ Appears as a fully paid customer
- ✅ Unlimited access to all features
- ✅ No upgrade prompts shown
- ✅ Perfect for marketing demonstrations
- ✅ Shows "Unlimited Marketing" plan status

### For Regular Users:
- ✅ All features remain visible and explorable
- ✅ Upgrade prompts guide them to paid plans
- ✅ No features are hidden - just limited usage
- ✅ Better user experience with clear upgrade paths

## Setup Instructions

### Step 1: Run the Setup Script

Navigate to your project root directory and run:

```bash
# Option 1: Run the Python script directly
python setup_superuser_unlimited.py

# Option 2: Run the Django management command
cd backend
python manage.py setup_superuser_unlimited --email cam.r.brown82@gmail.com
```

### Step 2: Verify the Setup

After running the script, you should see output like:

```
🚀 Setting up superuser with unlimited access...
==================================================
✅ Successfully set up cam.r.brown82@gmail.com with unlimited access
Tenant: Your Tenant Name
Plan: Unlimited Marketing
Status: Active (10-year subscription)
All features: Unlimited access
```

### Step 3: Test Your Unlimited Access

1. **Log into your superuser account** at `https://digisolai.ca`
2. **Check the subscription status** - it should show "Unlimited Marketing" plan
3. **Navigate through all features** - no upgrade prompts should appear
4. **Test AI features** - unlimited tokens and credits
5. **Test automations** - unlimited workflows
6. **Test design studio** - unlimited image generation

## What You'll See as a Superuser

### Subscription Status:
- **Plan Name**: "Unlimited Marketing"
- **Status**: "Unlimited" (purple badge)
- **Cost**: $0.00/month
- **Description**: "Unlimited access for marketing and demonstration purposes"

### Feature Access:
- **AI Agents**: Unlimited access to all 16 agents
- **Automations**: Unlimited workflow creation
- **Design Studio**: Unlimited image generation
- **Analytics**: Full access to advanced analytics
- **Client Portals**: Unlimited portal management
- **Integrations**: Unlimited platform connections
- **Contacts**: Unlimited contact management
- **Emails**: Unlimited email campaigns

### UI Changes:
- Crown icon instead of award icon
- "Unlimited Access" instead of "Subscription Status"
- Purple "Unlimited" badge
- "Manage Unlimited Access" button
- No upgrade prompts anywhere in the app

## What Regular Users Will See

### Free Trial Users:
- **Plan Name**: "Free Trial"
- **Status**: "Trial"
- **Limited Usage**: 100 contacts, 1000 emails, 100 AI credits, etc.
- **Upgrade Prompts**: Friendly prompts encouraging upgrades
- **All Features Visible**: Can explore everything with limits

### Paid Users:
- **Their Actual Plan**: Shows their real subscription
- **Usage Limits**: Based on their plan
- **No Upgrade Prompts**: Unless approaching limits
- **Full Feature Access**: Based on their plan level

## Marketing Benefits

### For Demonstrations:
1. **Show Full Power**: Demonstrate every feature without restrictions
2. **Professional Appearance**: Appears as a premium customer
3. **No Interruptions**: No upgrade prompts during demos
4. **Unlimited Testing**: Test any feature combination

### For User Experience:
1. **Transparency**: Users can see all features upfront
2. **Clear Value**: Upgrade prompts explain benefits clearly
3. **No Hidden Features**: Everything is visible and explorable
4. **Better Conversion**: Users understand what they're missing

## Troubleshooting

### If the script fails:

1. **Check Django setup**:
   ```bash
   cd backend
   python manage.py check
   ```

2. **Verify superuser exists**:
   ```bash
   python manage.py shell
   >>> from accounts.models import CustomUser
   >>> CustomUser.objects.filter(is_superuser=True).first()
   ```

3. **Check tenant association**:
   ```bash
   python manage.py shell
   >>> from core.models import Tenant
   >>> Tenant.objects.all()
   ```

### If unlimited access doesn't work:

1. **Clear browser cache** and log out/in
2. **Check subscription data** in the browser console
3. **Verify the API response** shows unlimited limits (-1 values)
4. **Check if user is actually a superuser** in the database

## Customization

### To modify the unlimited plan:

Edit `backend/subscription_billing/management/commands/setup_superuser_unlimited.py`:

```python
# Change plan name
'name': 'Your Custom Plan Name',

# Modify limits
'contact_limit': -1,  # Keep unlimited
'email_send_limit': 50000,  # Set specific limit

# Add custom features
'includes_custom_feature': True,
```

### To set up different superusers:

```bash
python manage.py setup_superuser_unlimited --email another@email.com
```

## Security Notes

- This setup is for **marketing and demonstration purposes only**
- The unlimited plan has **no cost** and **10-year duration**
- **Regular users cannot access this plan** - it's superuser-only
- **Production data is safe** - this only affects the superuser account

## Next Steps

1. **Test all features** as your superuser account
2. **Create marketing materials** showcasing the full platform
3. **Demonstrate to prospects** without upgrade interruptions
4. **Monitor regular user experience** with the new upgrade prompts
5. **Adjust upgrade messaging** based on user feedback

---

**Need Help?** If you encounter any issues, check the troubleshooting section above or review the Django logs for error messages.
