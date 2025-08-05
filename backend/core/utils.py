"""
Core workflow execution engine utilities.
Handles the execution of automation workflow steps.
"""
import logging
from typing import Dict, Any, Optional
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import AutomationExecution, Contact, EmailTemplate

logger = logging.getLogger(__name__)


def execute_workflow_step(execution_id: str) -> Dict[str, Any]:
    """
    Execute a single step in a workflow execution.
    
    Args:
        execution_id: UUID of the AutomationExecution instance
        
    Returns:
        Dict containing execution result and next action
    """
    try:
        execution = AutomationExecution.objects.get(id=execution_id)
        
        if not execution.can_proceed:
            logger.warning(f"Execution {execution_id} cannot proceed. Status: {execution.status}")
            return {
                'success': False,
                'message': f"Execution cannot proceed. Status: {execution.status}",
                'next_action': None
            }
        
        current_step = execution.current_step
        if not current_step:
            logger.info(f"Execution {execution_id} completed - no more steps")
            execution.mark_completed()
            return {
                'success': True,
                'message': 'Workflow completed successfully',
                'next_action': None
            }
        
        step_type = current_step.get('type')
        step_config = current_step.get('config', {})
        
        logger.info(f"Executing step {execution.current_step_index} ({step_type}) for execution {execution_id}")
        
        # Execute the step based on its type
        result = execute_step_by_type(step_type, step_config, execution)
        
        if result['success']:
            # Advance to next step
            execution.advance_step()
            
            # Determine next action
            next_action = determine_next_action(execution, result)
            
            return {
                'success': True,
                'message': result.get('message', 'Step executed successfully'),
                'next_action': next_action,
                'execution_id': str(execution.id)
            }
        else:
            # Mark execution as failed
            execution.mark_failed(result.get('message', 'Step execution failed'))
            return {
                'success': False,
                'message': result.get('message', 'Step execution failed'),
                'next_action': None
            }
            
    except AutomationExecution.DoesNotExist:
        logger.error(f"Execution {execution_id} not found")
        return {
            'success': False,
            'message': 'Execution not found',
            'next_action': None
        }
    except Exception as e:
        logger.error(f"Error executing workflow step {execution_id}: {str(e)}")
        try:
            execution = AutomationExecution.objects.get(id=execution_id)
            execution.mark_failed(str(e))
        except:
            pass
        return {
            'success': False,
            'message': f'Execution error: {str(e)}',
            'next_action': None
        }


def execute_step_by_type(step_type: str, config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """
    Execute a step based on its type.
    
    Args:
        step_type: Type of step to execute
        config: Step configuration
        execution: AutomationExecution instance
        
    Returns:
        Dict containing execution result
    """
    step_handlers = {
        'send_email': send_email_action,
        'wait': wait_action,
        'condition': evaluate_condition,
        'call_ai': call_ai_action,
        'update_crm': update_crm_action,
        'webhook': webhook_action,
    }
    
    handler = step_handlers.get(step_type)
    if not handler:
        return {
            'success': False,
            'message': f'Unknown step type: {step_type}'
        }
    
    try:
        return handler(config, execution)
    except Exception as e:
        logger.error(f"Error in {step_type} step: {str(e)}")
        return {
            'success': False,
            'message': f'Step execution error: {str(e)}'
        }


def send_email_action(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute send email step."""
    try:
        template_id = config.get('template_id')
        subject = config.get('subject', '')
        body = config.get('body', '')
        
        if not execution.contact:
            return {
                'success': False,
                'message': 'No contact associated with execution'
            }
        
        # Get email template if template_id is provided
        if template_id:
            try:
                template = EmailTemplate.objects.get(id=template_id, tenant=execution.tenant)
                subject = template.subject
                body = template.body_html
            except EmailTemplate.DoesNotExist:
                return {
                    'success': False,
                    'message': f'Email template {template_id} not found'
                }
        
        # TODO: Integrate with actual email sending service
        # For now, just log the email
        logger.info(f"Sending email to {execution.contact.email}: {subject}")
        
        # Update context with email sent info
        execution.context_data.setdefault('emails_sent', []).append({
            'to': execution.contact.email,
            'subject': subject,
            'sent_at': timezone.now().isoformat()
        })
        execution.save()
        
        return {
            'success': True,
            'message': f'Email sent to {execution.contact.email}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Email sending failed: {str(e)}'
        }


def wait_action(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute wait step."""
    try:
        wait_duration = config.get('duration', 0)  # in minutes
        wait_until = config.get('wait_until')  # specific datetime
        
        if wait_until:
            # Wait until specific datetime
            wait_time = timezone.datetime.fromisoformat(wait_until.replace('Z', '+00:00'))
            if timezone.now() < wait_time:
                return {
                    'success': True,
                    'message': f'Waiting until {wait_until}',
                    'schedule_next': wait_time
                }
        elif wait_duration > 0:
            # Wait for specified duration
            wait_time = timezone.now() + timezone.timedelta(minutes=wait_duration)
            return {
                'success': True,
                'message': f'Waiting for {wait_duration} minutes',
                'schedule_next': wait_time
            }
        
        return {
            'success': True,
            'message': 'Wait step completed'
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Wait step failed: {str(e)}'
        }


def evaluate_condition(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute condition step."""
    try:
        condition_type = config.get('type', 'simple')
        field = config.get('field')
        operator = config.get('operator', 'equals')
        value = config.get('value')
        
        if not execution.contact:
            return {
                'success': False,
                'message': 'No contact associated with execution'
            }
        
        # Get the field value from contact or context
        if field.startswith('contact.'):
            # Contact field
            contact_field = field.split('.')[1]
            field_value = getattr(execution.contact, contact_field, None)
        elif field.startswith('context.'):
            # Context data field
            context_field = field.split('.')[1]
            field_value = execution.context_data.get(context_field)
        else:
            field_value = execution.context_data.get(field)
        
        # Evaluate condition
        condition_met = evaluate_operator(field_value, operator, value)
        
        # Update context with condition result
        execution.context_data['last_condition'] = {
            'field': field,
            'operator': operator,
            'value': value,
            'actual_value': field_value,
            'result': condition_met,
            'evaluated_at': timezone.now().isoformat()
        }
        execution.save()
        
        # Determine next step based on condition result
        if condition_met:
            next_step = config.get('if_true', execution.current_step_index + 1)
        else:
            next_step = config.get('if_false', execution.current_step_index + 1)
        
        # Set next step index
        execution.current_step_index = next_step - 1  # -1 because advance_step will add 1
        execution.save()
        
        return {
            'success': True,
            'message': f'Condition evaluated: {condition_met}',
            'condition_result': condition_met
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Condition evaluation failed: {str(e)}'
        }


def call_ai_action(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute AI call step."""
    try:
        ai_service = config.get('service', 'openai')
        prompt = config.get('prompt', '')
        context_vars = config.get('context_variables', {})
        
        # Replace context variables in prompt
        for var_name, var_path in context_vars.items():
            if var_path.startswith('contact.'):
                contact_field = var_path.split('.')[1]
                var_value = getattr(execution.contact, contact_field, '') if execution.contact else ''
            else:
                var_value = execution.context_data.get(var_path, '')
            prompt = prompt.replace(f'{{{var_name}}}', str(var_value))
        
        # TODO: Integrate with actual AI service
        # For now, just log the AI call
        logger.info(f"AI call to {ai_service}: {prompt[:100]}...")
        
        # Simulate AI response
        ai_response = f"AI response for: {prompt[:50]}..."
        
        # Store AI response in context
        execution.context_data['ai_responses'] = execution.context_data.get('ai_responses', [])
        execution.context_data['ai_responses'].append({
            'service': ai_service,
            'prompt': prompt,
            'response': ai_response,
            'timestamp': timezone.now().isoformat()
        })
        execution.save()
        
        return {
            'success': True,
            'message': f'AI call completed via {ai_service}',
            'ai_response': ai_response
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'AI call failed: {str(e)}'
        }


def update_crm_action(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute CRM update step."""
    try:
        if not execution.contact:
            return {
                'success': False,
                'message': 'No contact associated with execution'
            }
        
        updates = config.get('updates', {})
        
        # Update contact fields
        for field, value in updates.items():
            if hasattr(execution.contact, field):
                setattr(execution.contact, field, value)
        
        execution.contact.save()
        
        # Update context
        execution.context_data['crm_updates'] = execution.context_data.get('crm_updates', [])
        execution.context_data['crm_updates'].append({
            'contact_id': str(execution.contact.id),
            'updates': updates,
            'timestamp': timezone.now().isoformat()
        })
        execution.save()
        
        return {
            'success': True,
            'message': f'CRM updated for contact {execution.contact.email}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'CRM update failed: {str(e)}'
        }


def webhook_action(config: Dict[str, Any], execution: AutomationExecution) -> Dict[str, Any]:
    """Execute webhook step."""
    try:
        url = config.get('url')
        method = config.get('method', 'POST')
        headers = config.get('headers', {})
        payload = config.get('payload', {})
        
        if not url:
            return {
                'success': False,
                'message': 'Webhook URL not provided'
            }
        
        # TODO: Integrate with actual HTTP client
        # For now, just log the webhook call
        logger.info(f"Webhook {method} to {url}")
        
        # Update context
        execution.context_data['webhooks'] = execution.context_data.get('webhooks', [])
        execution.context_data['webhooks'].append({
            'url': url,
            'method': method,
            'headers': headers,
            'payload': payload,
            'timestamp': timezone.now().isoformat()
        })
        execution.save()
        
        return {
            'success': True,
            'message': f'Webhook {method} to {url} completed'
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Webhook failed: {str(e)}'
        }


def evaluate_operator(field_value: Any, operator: str, expected_value: Any) -> bool:
    """Evaluate a condition operator."""
    if operator == 'equals':
        return field_value == expected_value
    elif operator == 'not_equals':
        return field_value != expected_value
    elif operator == 'contains':
        return str(expected_value) in str(field_value)
    elif operator == 'not_contains':
        return str(expected_value) not in str(field_value)
    elif operator == 'greater_than':
        try:
            return float(field_value) > float(expected_value)
        except (ValueError, TypeError):
            return False
    elif operator == 'less_than':
        try:
            return float(field_value) < float(expected_value)
        except (ValueError, TypeError):
            return False
    elif operator == 'is_empty':
        return not field_value or str(field_value).strip() == ''
    elif operator == 'is_not_empty':
        return field_value and str(field_value).strip() != ''
    else:
        return False


def determine_next_action(execution: AutomationExecution, step_result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Determine the next action after step execution."""
    if execution.is_completed:
        return None
    
    # Check if we need to schedule a delayed execution
    if 'schedule_next' in step_result:
        return {
            'action': 'schedule',
            'execution_id': str(execution.id),
            'scheduled_time': step_result['schedule_next']
        }
    
    # Continue with next step immediately
    return {
        'action': 'continue',
        'execution_id': str(execution.id)
    } 