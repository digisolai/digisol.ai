import api from './api';

export interface IntegrationProvider {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string;
  logo_url?: string;
  auth_type: string;
  oauth_config: unknown;
  api_endpoints: unknown;
  rate_limits: unknown;
  webhook_support: boolean;
  webhook_events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  tenant: string;
  provider: IntegrationProvider;
  name: string;
  status: string;
  auth_credentials: unknown;
  auth_expires_at?: string;
  settings: unknown;
  data_mappings: unknown;
  sync_config: unknown;
  last_sync?: string;
  last_sync_status: string;
  sync_error_count: number;
  health_score: number;
  api_calls_today: number;
  api_calls_limit: number;
  data_synced_today: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Frontend-compatible fields
  category: string;
  is_connected: boolean;
  connection_date?: string;
  description: string;
  logo_url?: string;
  health_status: string;
  sync_status: string;
  api_usage_percentage: number;
  data_flows: DataFlow[];
  workflows: WorkflowAutomation[];
  recent_health_logs: HealthLog[];
}

export interface DataFlow {
  id: string;
  integration: string;
  name: string;
  description: string;
  direction: string;
  status: string;
  source_fields: string[];
  target_fields: string[];
  transformation_rules: unknown;
  sync_frequency: string;
  last_sync?: string;
  next_sync?: string;
  records_processed: number;
  records_failed: number;
  last_error: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAutomation {
  id: string;
  integration: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: unknown;
  actions: unknown[];
  conditions: unknown;
  status: string;
  last_executed?: string;
  execution_count: number;
  success_count: number;
  failure_count: number;
  last_error: string;
  created_at: string;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  integration: string;
  event_type: string;
  severity: string;
  message: string;
  details: unknown;
  timestamp: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ConnectusInsight {
  id: string;
  tenant: string;
  integration?: string;
  insight_type: string;
  priority: string;
  title: string;
  description: string;
  recommendation: string;
  action_items: string[];
  metadata: unknown;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthSummary {
  total_integrations: number;
  connected_integrations: number;
  error_integrations: number;
  overall_health_score: number;
  recent_alerts: HealthLog[];
  api_usage_summary: {
    total_calls: number;
    total_limit: number;
    near_limit: number;
  };
  recommendations: unknown[];
}

export interface ConnectusQuery {
  query: string;
  context?: unknown;
  integration_id?: string;
}

export interface ConnectusResponse {
  answer: string;
  confidence: number;
  sources: string[];
  suggested_actions: string[];
}

export interface IntegrationTestRequest {
  provider_id: string;
  auth_credentials: unknown;
  test_type: 'connection' | 'data_sync' | 'webhook';
}

export interface IntegrationTestResponse {
  success: boolean;
  message: string;
  details?: unknown;
}

export interface IntegrationCreateRequest {
  provider_id: string;
  name: string;
  auth_credentials: unknown;
  settings?: unknown;
  sync_config?: unknown;
}

export interface IntegrationUpdateRequest {
  name?: string;
  settings?: unknown;
  data_mappings?: unknown;
  sync_config?: unknown;
  is_active?: boolean;
}

export interface DataFlowCreateRequest {
  integration: string;
  name: string;
  description?: string;
  direction: string;
  source_fields: string[];
  target_fields: string[];
  transformation_rules?: unknown;
  sync_frequency: string;
}

export interface WorkflowCreateRequest {
  integration: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: unknown;
  actions: unknown[];
  conditions?: unknown;
}

class IntegrationService {
  // Integration Providers
  async getProviders(params?: {
    category?: string;
    auth_type?: string;
    webhook_support?: boolean;
    search?: string;
  }): Promise<IntegrationProvider[]> {
    const response = await api.get('/integrations/providers/', { params });
    return response.data;
  }

  async getProvider(id: string): Promise<IntegrationProvider> {
    const response = await api.get(`/integrations/providers/${id}/`);
    return response.data;
  }

  async getProviderCapabilities(id: string): Promise<any> {
    const response = await api.get(`/integrations/providers/${id}/capabilities/`);
    return response.data;
  }

  async getProviderCategories(): Promise<{ categories: string[]; category_choices: Record<string, string> }> {
    const response = await api.get('/integrations/providers/categories/');
    return response.data;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    const response = await api.get('/integrations/integrations/');
    return response.data;
  }

  async getIntegration(id: string): Promise<Integration> {
    const response = await api.get(`/integrations/integrations/${id}/`);
    return response.data;
  }

  async createIntegration(data: IntegrationCreateRequest): Promise<Integration> {
    const response = await api.post('/integrations/integrations/', data);
    return response.data;
  }

  async updateIntegration(id: string, data: IntegrationUpdateRequest): Promise<Integration> {
    const response = await api.patch(`/integrations/integrations/${id}/`, data);
    return response.data;
  }

  async deleteIntegration(id: string): Promise<void> {
    await api.delete(`/integrations/integrations/${id}/`);
  }

  async testConnection(id: string, data: IntegrationTestRequest): Promise<IntegrationTestResponse> {
    const response = await api.post(`/integrations/integrations/${id}/test_connection/`, data);
    return response.data;
  }

  async syncNow(id: string): Promise<any> {
    const response = await api.post(`/integrations/integrations/${id}/sync_now/`);
    return response.data;
  }

  async getIntegrationDataFlows(id: string): Promise<DataFlow[]> {
    const response = await api.get(`/integrations/integrations/${id}/data_flows/`);
    return response.data;
  }

  async getIntegrationWorkflows(id: string): Promise<WorkflowAutomation[]> {
    const response = await api.get(`/integrations/integrations/${id}/workflows/`);
    return response.data;
  }

  async getIntegrationHealthLogs(id: string): Promise<HealthLog[]> {
    const response = await api.get(`/integrations/integrations/${id}/health_logs/`);
    return response.data;
  }

  async getHealthSummary(): Promise<HealthSummary> {
    const response = await api.get('/integrations/integrations/health_summary/');
    return response.data;
  }

  // Data Flows
  async getDataFlows(): Promise<DataFlow[]> {
    const response = await api.get('/integrations/data-flows/');
    return response.data;
  }

  async getDataFlow(id: string): Promise<DataFlow> {
    const response = await api.get(`/integrations/data-flows/${id}/`);
    return response.data;
  }

  async createDataFlow(data: DataFlowCreateRequest): Promise<DataFlow> {
    const response = await api.post('/integrations/data-flows/', data);
    return response.data;
  }

  async updateDataFlow(id: string, data: Partial<DataFlowCreateRequest>): Promise<DataFlow> {
    const response = await api.patch(`/integrations/data-flows/${id}/`, data);
    return response.data;
  }

  async deleteDataFlow(id: string): Promise<void> {
    await api.delete(`/integrations/data-flows/${id}/`);
  }

  async testDataFlowMapping(id: string, testData: unknown): Promise<any> {
    const response = await api.post(`/integrations/data-flows/${id}/test_mapping/`, { test_data: testData });
    return response.data;
  }

  // Workflow Automations
  async getWorkflows(): Promise<WorkflowAutomation[]> {
    const response = await api.get('/integrations/workflows/');
    return response.data;
  }

  async getWorkflow(id: string): Promise<WorkflowAutomation> {
    const response = await api.get(`/integrations/workflows/${id}/`);
    return response.data;
  }

  async createWorkflow(data: WorkflowCreateRequest): Promise<WorkflowAutomation> {
    const response = await api.post('/integrations/workflows/', data);
    return response.data;
  }

  async updateWorkflow(id: string, data: Partial<WorkflowCreateRequest>): Promise<WorkflowAutomation> {
    const response = await api.patch(`/integrations/workflows/${id}/`, data);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/integrations/workflows/${id}/`);
  }

  async executeWorkflow(id: string): Promise<any> {
    const response = await api.post(`/integrations/workflows/${id}/execute/`);
    return response.data;
  }

  // Connectus AI
  async getConnectusInsights(): Promise<ConnectusInsight[]> {
    const response = await api.get('/integrations/connectus/');
    return response.data;
  }

  async getConnectusInsight(id: string): Promise<ConnectusInsight> {
    const response = await api.get(`/integrations/connectus/${id}/`);
    return response.data;
  }

  async createConnectusInsight(data: Partial<ConnectusInsight>): Promise<ConnectusInsight> {
    const response = await api.post('/integrations/connectus/', data);
    return response.data;
  }

  async updateConnectusInsight(id: string, data: Partial<ConnectusInsight>): Promise<ConnectusInsight> {
    const response = await api.patch(`/integrations/connectus/${id}/`, data);
    return response.data;
  }

  async deleteConnectusInsight(id: string): Promise<void> {
    await api.delete(`/integrations/connectus/${id}/`);
  }

  async askConnectus(query: ConnectusQuery): Promise<ConnectusResponse> {
    const response = await api.post('/integrations/connectus/ask_connectus/', query);
    return response.data;
  }

  async getConnectusRecommendations(): Promise<any[]> {
    const response = await api.get('/integrations/connectus/recommendations/');
    return response.data;
  }

  // Health Logs
  async getHealthLogs(params?: {
    integration?: string;
    event_type?: string;
    severity?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<HealthLog[]> {
    const response = await api.get('/integrations/health-logs/', { params });
    return response.data;
  }

  async getHealthLog(id: string): Promise<HealthLog> {
    const response = await api.get(`/integrations/health-logs/${id}/`);
    return response.data;
  }

  async createHealthLog(data: Partial<HealthLog>): Promise<HealthLog> {
    const response = await api.post('/integrations/health-logs/', data);
    return response.data;
  }

  async updateHealthLog(id: string, data: Partial<HealthLog>): Promise<HealthLog> {
    const response = await api.patch(`/integrations/health-logs/${id}/`, data);
    return response.data;
  }

  async deleteHealthLog(id: string): Promise<void> {
    await api.delete(`/integrations/health-logs/${id}/`);
  }

  // Utility methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return 'green';
      case 'error': return 'red';
      case 'pending': return 'yellow';
      case 'disconnected': return 'gray';
      default: return 'gray';
    }
  }

  getHealthColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'red';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  }

  getHealthStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  formatSyncStatus(lastSync?: string): string {
    if (!lastSync) return 'Never synced';
    
    const now = new Date();
    const syncTime = new Date(lastSync);
    const diffMs = now.getTime() - syncTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 7) return `Last sync: ${diffDays} days ago`;
    if (diffDays > 0) return `Last sync: ${diffDays} day(s) ago`;
    if (diffHours > 0) return `Last sync: ${diffHours} hour(s) ago`;
    return `Last sync: ${diffMinutes} minute(s) ago`;
  }

  calculateApiUsagePercentage(callsToday: number, callsLimit: number): number {
    if (callsLimit === 0) return 0;
    return Math.min(100, (callsToday / callsLimit) * 100);
  }
}

export const integrationService = new IntegrationService();
export default integrationService; 