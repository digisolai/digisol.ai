export interface AIProfile {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  api_model_name?: string;
  is_active: boolean;
  is_global?: boolean;
  tenant?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AITask {
  id: string;
  objective: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'delegated';
  assignee_agent: AIProfile;
  requester: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  context_data: Record<string, unknown>;
  result_data: Record<string, unknown> | null;
  has_sub_tasks: boolean;
  all_sub_tasks_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  type: string;
  recommendation_text: string;
  context_data: Record<string, unknown>;
  is_actionable: boolean;
  is_dismissed: boolean;
  is_actioned: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  generated_by_agent?: AIProfile;
  created_at: string;
} 