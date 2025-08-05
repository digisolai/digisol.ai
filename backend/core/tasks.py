"""
Celery tasks for workflow execution engine.
Handles asynchronous execution of automation workflows.
"""
import logging
from typing import Dict, Any, Optional
from celery import shared_task
from django.utils import timezone
from .models import AutomationExecution, AutomationWorkflow, Contact
from .utils import execute_workflow_step, determine_next_action

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def start_workflow_execution(self, workflow_id: str, contact_id: Optional[str] = None, context_data: Optional[Dict[str, Any]] = None):
    """
    Start a new workflow execution.
    
    Args:
        workflow_id: UUID of the AutomationWorkflow
        contact_id: Optional UUID of the Contact
        context_data: Optional context data for the execution
    """
    try:
        workflow = AutomationWorkflow.objects.get(id=workflow_id)
        
        if not workflow.is_active:
            logger.warning(f"Workflow {workflow_id} is not active")
            return {
                'success': False,
                'message': 'Workflow is not active'
            }
        
        # Get contact if provided
        contact = None
        if contact_id:
            try:
                contact = Contact.objects.get(id=contact_id, tenant=workflow.tenant)
            except Contact.DoesNotExist:
                logger.error(f"Contact {contact_id} not found")
                return {
                    'success': False,
                    'message': 'Contact not found'
                }
        
        # Create execution
        execution = AutomationExecution.objects.create(
            tenant=workflow.tenant,
            workflow=workflow,
            contact=contact,
            context_data=context_data or {}
        )
        
        logger.info(f"Created workflow execution {execution.id} for workflow {workflow.name}")
        
        # Start processing the first step
        result = process_workflow_step.delay(str(execution.id))
        
        return {
            'success': True,
            'message': f'Workflow execution started: {execution.id}',
            'execution_id': str(execution.id),
            'task_id': result.id
        }
        
    except AutomationWorkflow.DoesNotExist:
        logger.error(f"Workflow {workflow_id} not found")
        return {
            'success': False,
            'message': 'Workflow not found'
        }
    except Exception as e:
        logger.error(f"Error starting workflow execution: {str(e)}")
        # Retry the task
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def process_workflow_step(self, execution_id: str):
    """
    Process a single workflow step.
    
    Args:
        execution_id: UUID of the AutomationExecution
    """
    try:
        logger.info(f"Processing workflow step for execution {execution_id}")
        
        # Execute the step
        result = execute_workflow_step(execution_id)
        
        if not result['success']:
            logger.error(f"Step execution failed for {execution_id}: {result['message']}")
            return result
        
        # Handle next action
        next_action = result.get('next_action')
        if next_action:
            if next_action['action'] == 'schedule':
                # Schedule next execution at specific time
                scheduled_time = next_action['scheduled_time']
                if isinstance(scheduled_time, str):
                    scheduled_time = timezone.datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
                
                delay_seconds = (scheduled_time - timezone.now()).total_seconds()
                if delay_seconds > 0:
                    process_workflow_step.apply_async(
                        args=[execution_id],
                        countdown=int(delay_seconds)
                    )
                    logger.info(f"Scheduled next step for execution {execution_id} in {delay_seconds} seconds")
                else:
                    # Execute immediately if scheduled time has passed
                    process_workflow_step.delay(execution_id)
            
            elif next_action['action'] == 'continue':
                # Continue with next step immediately
                process_workflow_step.delay(execution_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing workflow step {execution_id}: {str(e)}")
        # Retry the task
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def trigger_workflow_by_event(self, event_type: str, event_data: Dict[str, Any], tenant_id: str):
    """
    Trigger workflows based on events.
    
    Args:
        event_type: Type of event (e.g., 'contact_created', 'email_opened')
        event_data: Event data
        tenant_id: UUID of the tenant
    """
    try:
        logger.info(f"Processing event {event_type} for tenant {tenant_id}")
        
        # Find workflows that match this event type
        workflows = AutomationWorkflow.objects.filter(
            tenant_id=tenant_id,
            is_active=True,
            trigger_config__event_type=event_type
        )
        
        triggered_count = 0
        for workflow in workflows:
            # Check if workflow should be triggered based on trigger conditions
            if should_trigger_workflow(workflow, event_data):
                # Start workflow execution
                contact_id = event_data.get('contact_id')
                context_data = {
                    'event_type': event_type,
                    'event_data': event_data,
                    'triggered_at': timezone.now().isoformat()
                }
                
                result = start_workflow_execution.delay(
                    str(workflow.id),
                    contact_id,
                    context_data
                )
                
                if result.get('success'):
                    triggered_count += 1
                    logger.info(f"Triggered workflow {workflow.name} for event {event_type}")
        
        return {
            'success': True,
            'message': f'Processed event {event_type}, triggered {triggered_count} workflows',
            'triggered_count': triggered_count
        }
        
    except Exception as e:
        logger.error(f"Error processing event {event_type}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def cleanup_failed_executions(self):
    """
    Clean up failed executions older than a certain threshold.
    """
    try:
        from datetime import timedelta
        
        # Clean up executions that failed more than 7 days ago
        cutoff_date = timezone.now() - timedelta(days=7)
        
        failed_executions = AutomationExecution.objects.filter(
            status='failed',
            last_executed_at__lt=cutoff_date
        )
        
        count = failed_executions.count()
        failed_executions.delete()
        
        logger.info(f"Cleaned up {count} failed executions")
        
        return {
            'success': True,
            'message': f'Cleaned up {count} failed executions',
            'cleaned_count': count
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up failed executions: {str(e)}")
        raise self.retry(countdown=3600, exc=e)  # Retry in 1 hour


def should_trigger_workflow(workflow: AutomationWorkflow, event_data: Dict[str, Any]) -> bool:
    """
    Determine if a workflow should be triggered based on event data.
    
    Args:
        workflow: AutomationWorkflow instance
        event_data: Event data
        
    Returns:
        True if workflow should be triggered
    """
    trigger_config = workflow.trigger_config
    conditions = trigger_config.get('conditions', [])
    
    if not conditions:
        return True  # No conditions means trigger always
    
    for condition in conditions:
        field = condition.get('field')
        operator = condition.get('operator', 'equals')
        value = condition.get('value')
        
        # Get field value from event data
        field_value = event_data.get(field)
        
        # Evaluate condition
        if not evaluate_condition(field_value, operator, value):
            return False
    
    return True


def evaluate_condition(field_value: Any, operator: str, expected_value: Any) -> bool:
    """
    Evaluate a condition (simplified version from utils.py).
    """
    if operator == 'equals':
        return field_value == expected_value
    elif operator == 'not_equals':
        return field_value != expected_value
    elif operator == 'contains':
        return str(expected_value) in str(field_value)
    elif operator == 'not_contains':
        return str(expected_value) not in str(field_value)
    elif operator == 'is_empty':
        return not field_value or str(field_value).strip() == ''
    elif operator == 'is_not_empty':
        return field_value and str(field_value).strip() != ''
    else:
        return False 