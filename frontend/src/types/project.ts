export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  capacity_hours: number;
  assigned_hours: number;
  skills: string[];
  hourly_rate?: number;
  // Optional fields for resource management
  utilization_percentage?: number;
  status?: string;
  current_tasks?: string[];
  availability?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'active' | 'mitigated' | 'closed';
  mitigation_strategy?: string;
}

export interface PromanaRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_actionable: boolean;
  is_dismissed: boolean;
  is_actioned: boolean;
  created_at: string;
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
  assigned_to?: string;
}

export interface TaskComment {
  id: string;
  user: string;
  message: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'review';
  assigned_to_info: {
    first_name: string;
    last_name: string;
    email: string;
  };
  estimated_hours: number;
  actual_hours: number;
  progress_percentage: number;
  is_overdue: boolean;
  can_start: boolean;
  remaining_hours: number;
  efficiency_ratio: number;
  dependency_names: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  sub_tasks: SubTask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  promana_risk_indicator: boolean;
  promana_acceleration_opportunity: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  project_code: string;
  manager_info: {
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  actual_cost: number;
  tasks_count: number;
  progress_percentage: number;
  is_overdue: boolean;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_rate: number;
  duration_days: number;
  health_score: number;
  risk_level: string;
  predicted_completion_date: string;
  team_members: TeamMember[];
  risks: ProjectRisk[];
  promana_recommendations: PromanaRecommendation[];
  client_name?: string;
  client_email?: string;
  client_portal_enabled: boolean;
  // Optional fields for settings
  notification_settings?: unknown;
  custom_fields?: unknown;
  integration_settings?: unknown;
}