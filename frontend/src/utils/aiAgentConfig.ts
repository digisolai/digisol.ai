import {
  FiTarget,
  FiDollarSign,
  FiEdit3,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiBarChart,
  FiUserCheck,
  FiSettings,
  FiBookOpen,
  FiPieChart,
  FiGrid,
  FiCpu,
  FiImage,
  FiFileText,
  FiFolder,
  FiActivity,
  FiGlobe,
  FiLayers,
  FiAward,
  FiBriefcase,
  FiMessageSquare
} from 'react-icons/fi';

export interface AIAgentConfig {
  name: string;
  specialization: string;
  icon: any;
  color: string;
  assignedPage: string;
  personality_description: string;
}

// Centralized AI agent configuration
export const AI_AGENT_CONFIG: Record<string, AIAgentConfig> = {
  'Automatix': {
    name: 'Automatix',
    specialization: 'automation_design',
    icon: FiSettings,
    color: 'brand.primary',
    assignedPage: 'Automation Workflows',
    personality_description: 'Your automation workflow specialist. Automatix designs, optimizes, and manages complex automation workflows to streamline marketing processes with trigger-based automation and conditional logic.'
  },
  'Scriptor': {
    name: 'Scriptor',
    specialization: 'content_creation',
    icon: FiEdit3,
    color: 'purple',
    assignedPage: 'Content Creation',
    personality_description: 'Your creative content specialist. Scriptor generates compelling copy, social media posts, email content, and marketing materials that resonate with your audience using psychology and storytelling techniques.'
  },
  'Prospero': {
    name: 'Prospero',
    specialization: 'lead_nurturing',
    icon: FiUsers,
    color: 'green',
    assignedPage: 'Lead Nurturing',
    personality_description: 'Your intelligent lead nurturing assistant. Prospero analyzes contact data, identifies engagement opportunities, and provides personalized recommendations to convert prospects into loyal customers.'
  },
  'Pecunia': {
    name: 'Pecunia',
    specialization: 'budget_analysis',
    icon: FiDollarSign,
    color: 'orange',
    assignedPage: 'Budget Analysis',
    personality_description: 'Your financial analysis expert. Pecunia optimizes budgets, analyzes spending patterns, and makes data-driven financial decisions through ROI calculations and budget allocation optimization.'
  },
  'Metrika': {
    name: 'Metrika',
    specialization: 'data_analysis',
    icon: FiBarChart,
    color: 'teal',
    assignedPage: 'Data Analytics',
    personality_description: 'Your data analytics specialist. Metrika transforms raw data into actionable insights, helping you understand performance metrics and optimize marketing strategies through pattern analysis.'
  },
  'Quantia': {
    name: 'Quantia',
    specialization: 'reporting_insights',
    icon: FiPieChart,
    color: 'cyan',
    assignedPage: 'Reporting & Insights',
    personality_description: 'Your reporting and insights expert. Quantia creates comprehensive reports, identifies trends, and provides strategic insights to improve marketing performance with data visualization.'
  },
  'Structura': {
    name: 'Structura',
    specialization: 'organizational_planning',
    icon: FiActivity,
    color: 'indigo',
    assignedPage: 'Organizational Planning',
    personality_description: 'Your organizational planning specialist. Structura helps structure campaigns, organize workflows, and create strategic plans by analyzing team dynamics and resource allocation.'
  },
  'Icona': {
    name: 'Icona',
    specialization: 'brand_identity',
    icon: FiImage,
    color: 'pink',
    assignedPage: 'Brand Identity',
    personality_description: 'Your brand identity expert. Icona develops and maintains consistent brand messaging, visual identity, and brand guidelines across all channels through comprehensive brand audits.'
  },
  'Connectus': {
    name: 'Connectus',
    specialization: 'integrations_management',
    icon: FiGlobe,
    color: 'brand.primary',
    assignedPage: 'Integrations',
    personality_description: 'Your integrations specialist. Connectus connects and optimizes third-party tools, manages API integrations, and streamlines your tech stack for seamless connectivity.'
  },
  'Mentor': {
    name: 'Mentor',
    specialization: 'learning_guidance',
    icon: FiBookOpen,
    color: 'green',
    assignedPage: 'Learning & Training',
    personality_description: 'Your learning and development guide. Mentor provides training resources, best practices, and guidance to improve marketing skills through personalized learning paths.'
  },
  'Curator': {
    name: 'Curator',
    specialization: 'template_curation',
    icon: FiAward,
    color: 'brand.accent',
    assignedPage: 'Template Curation',
    personality_description: 'Your template and resource curator. Curator discovers, organizes, and optimizes marketing templates and resources through intelligent categorization and quality assessment.'
  },
  'Promana': {
    name: 'Promana',
    specialization: 'project_management',
    icon: FiBriefcase,
    color: 'gray',
    assignedPage: 'Project Management',
    personality_description: 'Your project management specialist. Promana plans, tracks, and manages marketing projects with expertise in agile methodologies and team coordination.'
  },
  'Strategist': {
    name: 'Strategist',
    specialization: 'marketing_strategy',
    icon: FiTarget,
    color: 'red',
    assignedPage: 'Marketing Strategy',
    personality_description: 'Your strategic marketing advisor. Strategist develops comprehensive marketing strategies, identifies opportunities, and creates long-term growth plans through market analysis.'
  },
  'Optimizer': {
    name: 'Optimizer',
    specialization: 'campaign_optimization',
    icon: FiTrendingUp,
    color: 'green',
    assignedPage: 'Campaign Optimization',
    personality_description: 'Your intelligent campaign optimization assistant. Optimizer analyzes campaign performance, identifies optimization opportunities, and provides data-driven recommendations to improve ROI.'
  }
};

// Helper functions
export const getAgentConfig = (agentName: string): AIAgentConfig => {
  return AI_AGENT_CONFIG[agentName] || {
    name: agentName,
    specialization: 'general',
    icon: FiCpu,
    color: 'gray',
    assignedPage: 'General Assistance',
    personality_description: 'Your AI assistant for general tasks and support.'
  };
};

export const getAgentIcon = (agentName: string) => {
  return getAgentConfig(agentName).icon;
};

export const getAgentColor = (agentName: string) => {
  return getAgentConfig(agentName).color;
};

export const getAgentPage = (agentName: string) => {
  return getAgentConfig(agentName).assignedPage;
};

export const getSpecializationLabel = (specialization: string) => {
  return specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// AI brand colors (DigiSol deep sapphire blue, golden yellow)
export const AI_BRAND_COLORS = {
  primary: '#1F4287', // DigiSol Deep Sapphire Blue
  accent: '#FFC300',  // DigiSol Golden Yellow
  hover: '#1A3A7A',   // Darker sapphire for hover
  light: '#E6F0FF'    // Light blue for backgrounds
};
