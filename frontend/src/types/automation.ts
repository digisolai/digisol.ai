// frontend/src/types/automation.ts
export interface AutomationWorkflow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  trigger_config: Record<string, unknown>;
  steps_config: Record<string, unknown>;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'in_progress';
}

export interface AutomationExecution {
  id: string;
  workflow: {
    id: string;
    name: string;
  };
  contact: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  current_step_index: number;
  current_step_info: Record<string, unknown>;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'in_progress';
  context_data: Record<string, unknown>;
  started_at: string;
  last_executed_at: string | null;
  completed_at: string | null;
} 