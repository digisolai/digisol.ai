export interface CatalystInsight {
  id: string;
  campaign: string;
  campaign_name: string;
  step?: string;
  step_name?: string;
  insight_type: string;
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  predicted_impact: Record<string, any>;
  confidence_score?: number;
  is_actioned: boolean;
  is_dismissed: boolean;
  action_taken: string;
  context_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface CatalystRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  impact_score: number;
  confidence_score: number;
  action_items: string[];
  estimated_improvement: Record<string, any>;
  priority: string;
}
