# LLM Integration Setup Guide

## Overview

The `suggest_next_action` endpoint in `CampaignStepViewSet` has been enhanced with real Large Language Model (LLM) integration using OpenAI's GPT-4 model. This replaces the previous mock logic with actual AI-powered campaign step suggestions.

## Features

- **Real AI Suggestions**: Uses OpenAI's GPT-4 model for intelligent campaign step recommendations
- **Context-Aware**: Analyzes current step, campaign objective, and target audience
- **Structured Output**: Returns JSON-formatted suggestions with confidence scores
- **Error Handling**: Graceful fallback when API is not configured
- **Validation**: Ensures suggested step types are valid

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variable

Add the API key to your environment variables:

**Option A: Environment File (.env)**
```bash
# Add to your .env file
OPENAI_API_KEY=sk-your-api-key-here
```

**Option B: System Environment Variable**
```bash
# Windows
set OPENAI_API_KEY=sk-your-api-key-here

# Linux/Mac
export OPENAI_API_KEY=sk-your-api-key-here
```

**Option C: Django Settings**
```python
# In settings.py
import os
os.environ['OPENAI_API_KEY'] = 'sk-your-api-key-here'
```

### 3. Verify Installation

The required packages are already installed:
- `openai` - OpenAI Python client

## API Response Format

The `suggest_next_action` endpoint now returns:

```json
{
  "suggested_step_type": "Email",
  "suggested_config": {
    "subject": "Follow-up on your interest",
    "body": "Thank you for your interest. Here is additional information...",
    "delay_hours": 24
  },
  "suggestion_message": "Send a follow-up email with detailed information",
  "reasoning": "Email follow-up after initial contact increases engagement and provides detailed information that can drive conversions.",
  "confidence_score": 0.85
}
```

## Error Handling

The system gracefully handles various error scenarios:

- **No API Key**: Returns 500 error with helpful message
- **Invalid JSON Response**: Handles malformed LLM responses
- **Missing Fields**: Validates and provides defaults
- **Invalid Step Types**: Falls back to 'Email' step type
- **Network Issues**: Comprehensive exception handling

## Testing

To test the integration:

1. Set up your OpenAI API key
2. Use the frontend "Suggest Next Action" button in the campaign builder
3. Or make a POST request to `/campaigns/campaign-steps/{step_id}/suggest-next-action/`

## Cost Considerations

- Uses GPT-4 model (more expensive but better reasoning)
- Estimated cost: ~$0.03-0.06 per suggestion
- Consider implementing rate limiting for production use
- Monitor API usage in OpenAI dashboard

## Security Notes

- API key is stored in environment variables (not in code)
- Client initialization is conditional and safe
- No sensitive data is sent to OpenAI
- Consider using API key rotation for production

## Troubleshooting

**Common Issues:**

1. **"OpenAI API not properly configured"**
   - Check that OPENAI_API_KEY environment variable is set
   - Verify the API key is valid and has credits

2. **"Invalid JSON response from AI model"**
   - This is rare but can happen with malformed responses
   - The system will handle this gracefully

3. **"Client.__init__() got an unexpected keyword argument 'proxies'"**
   - This is a version compatibility warning
   - The system will still work correctly

## Future Enhancements

Potential improvements:
- Support for other LLM providers (Google Gemini, Anthropic Claude)
- Caching of similar suggestions
- A/B testing of AI suggestions
- Integration with campaign performance data
- Custom prompt templates per tenant 