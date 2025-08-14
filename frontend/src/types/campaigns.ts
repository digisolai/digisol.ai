export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'social' | 'paid_ads' | 'content' | 'event' | 'product_launch' | 'lead_nurturing' | 'retention' | 'multi_channel';
  objective: 'awareness' | 'traffic' | 'leads' | 'sales' | 'engagement' | 'conversion' | 'retention' | 'loyalty';
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived';
  start_date?: string;
  end_date?: string;
  target_audience_segment?: string;
  audience_criteria: Record<string, any>;
  estimated_reach?: number;
  budget?: number;
  spent_budget: number;
  target_roi?: number;
  catalyst_health_score?: number;
  catalyst_recommendations: any[];
  auto_optimization_enabled: boolean;
  last_optimized?: string;
  is_template: boolean;
  template_category?: string;
  performance_metrics: Record<string, any>;
  conversion_goals: any[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  steps?: CampaignStep[];
}

export interface CampaignStep {
  id: string;
  campaign: string;
  step_type: 'Email' | 'SMS' | 'Ad' | 'Conditional' | 'Delay' | 'Goal' | 'AI_Insight' | 'Trigger' | 'Social_Post' | 'Landing_Page' | 'Webhook' | 'A_B_Test';
  name: string;
  description?: string;
  order: number;
  config: Record<string, any>;
  content_data: Record<string, any>;
  metadata: Record<string, any>;
  parent_steps: string[];
  true_path_next_step?: string;
  false_path_next_step?: string;
  catalyst_optimized: boolean;
  catalyst_suggestions: any[];
  performance_score?: number;
  is_enabled: boolean;
  execution_count: number;
  last_executed?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateData {
  name: string;
  description?: string;
  campaign_type: MarketingCampaign['campaign_type'];
  objective: MarketingCampaign['objective'];
  target_audience_segment?: string;
  audience_criteria?: Record<string, any>;
  budget?: number;
  target_roi?: number;
  start_date?: string;
  end_date?: string;
}

export interface CampaignUpdateData extends Partial<CampaignCreateData> {
  status?: MarketingCampaign['status'];
  auto_optimization_enabled?: boolean;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  revenue_generated: number;
  cost_per_click: number;
  cost_per_conversion: number;
  roi: number;
  performance_trend: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  }>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  campaign_type: MarketingCampaign['campaign_type'];
  objective: MarketingCampaign['objective'];
  template_data: Record<string, any>;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
}

export interface CampaignFilters {
  status?: MarketingCampaign['status'];
  campaign_type?: MarketingCampaign['campaign_type'];
  objective?: MarketingCampaign['objective'];
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  draft_campaigns: number;
  completed_campaigns: number;
  total_budget: number;
  total_spent: number;
  average_roi: number;
  total_reach: number;
}
