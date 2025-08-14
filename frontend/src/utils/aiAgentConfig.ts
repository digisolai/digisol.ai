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
    color: 'blue',
    assignedPage: 'Automation Workflows',
    personality_description: 'Your automation workflow specialist. Automatix helps you design, optimize, and manage complex automation workflows to streamline your marketing processes.'
  },
  'Scriptor': {
    name: 'Scriptor',
    specialization: 'content_creation',
    icon: FiEdit3,
    color: 'purple',
    assignedPage: 'Content Creation',
    personality_description: 'Your creative content specialist. Scriptor helps you generate compelling copy, social media posts, email content, and marketing materials that resonate with your audience.'
  },
  'Prospero': {
    name: 'Prospero',
    specialization: 'lead_nurturing',
    icon: FiUsers,
    color: 'green',
    assignedPage: 'Lead Nurturing',
    personality_description: 'Your intelligent lead nurturing assistant. Prospero analyzes contact data, identifies engagement opportunities, and provides personalized recommendations to help you convert prospects into loyal customers.'
  },
  'Pecunia': {
    name: 'Pecunia',
    specialization: 'budget_analysis',
    icon: FiDollarSign,
    color: 'orange',
    assignedPage: 'Budget Analysis',
    personality_description: 'Your financial analysis expert. Pecunia helps you optimize budgets, analyze spending patterns, and make data-driven financial decisions for your marketing campaigns.'
  },
  'Metrika': {
    name: 'Metrika',
    specialization: 'data_analysis',
    icon: FiBarChart,
    color: 'teal',
    assignedPage: 'Data Analytics',
    personality_description: 'Your data analytics specialist. Metrika transforms raw data into actionable insights, helping you understand performance metrics and optimize your marketing strategies.'
  },
  'Quantia': {
    name: 'Quantia',
    specialization: 'reporting_insights',
    icon: FiPieChart,
    color: 'cyan',
    assignedPage: 'Reporting & Insights',
    personality_description: 'Your reporting and insights expert. Quantia creates comprehensive reports, identifies trends, and provides strategic insights to improve your marketing performance.'
  },
  'Structura': {
    name: 'Structura',
    specialization: 'organizational_planning',
    icon: FiGrid,
    color: 'indigo',
    assignedPage: 'Organizational Planning',
    personality_description: 'Your organizational planning specialist. Structura helps you structure campaigns, organize workflows, and create strategic plans for your marketing initiatives.'
  },
  'Icona': {
    name: 'Icona',
    specialization: 'brand_identity',
    icon: FiImage,
    color: 'pink',
    assignedPage: 'Brand Identity',
    personality_description: 'Your brand identity expert. Icona helps you develop and maintain consistent brand messaging, visual identity, and brand guidelines across all channels.'
  },
  'Connectus': {
    name: 'Connectus',
    specialization: 'integrations_management',
    icon: FiGlobe,
    color: 'blue',
    assignedPage: 'Integrations',
    personality_description: 'Your integrations specialist. Connectus helps you connect and optimize third-party tools, manage API integrations, and streamline your tech stack.'
  },
  'Mentor': {
    name: 'Mentor',
    specialization: 'learning_guidance',
    icon: FiBookOpen,
    color: 'green',
    assignedPage: 'Learning & Training',
    personality_description: 'Your learning and development guide. Mentor provides training resources, best practices, and guidance to help you and your team improve marketing skills.'
  },
  'Orchestra': {
    name: 'Orchestra',
    specialization: 'general_orchestration',
    icon: FiLayers,
    color: 'purple',
    assignedPage: 'AI Orchestration',
    personality_description: 'Your AI orchestration expert. Orchestra coordinates multiple AI agents, manages complex workflows, and ensures seamless collaboration between different AI systems.'
  },
  'Curator': {
    name: 'Curator',
    specialization: 'template_curation',
    icon: FiAward,
    color: 'yellow',
    assignedPage: 'Template Curation',
    personality_description: 'Your template and resource curator. Curator helps you discover, organize, and optimize marketing templates, resources, and best practices.'
  },
  'Promana': {
    name: 'Promana',
    specialization: 'project_management',
    icon: FiBriefcase,
    color: 'gray',
    assignedPage: 'Project Management',
    personality_description: 'Your project management specialist. Promana helps you plan, track, and manage marketing projects, ensuring timely delivery and optimal resource allocation.'
  },
  'Strategist': {
    name: 'Strategist',
    specialization: 'marketing_strategy',
    icon: FiTarget,
    color: 'red',
    assignedPage: 'Marketing Strategy',
    personality_description: 'Your strategic marketing advisor. Strategist helps you develop comprehensive marketing strategies, identify opportunities, and create long-term growth plans.'
  },
  'Catalyst': {
    name: 'Catalyst',
    specialization: 'campaign_optimization',
    icon: FiTrendingUp,
    color: 'green',
    assignedPage: 'Campaign Optimization',
    personality_description: 'Your intelligent campaign optimization assistant. Catalyst analyzes campaign performance, identifies optimization opportunities, and provides data-driven recommendations to improve your marketing ROI.'
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

// AI brand colors (blue background, yellow text)
export const AI_BRAND_COLORS = {
  primary: '#1E40AF', // Blue background
  accent: '#FCD34D',  // Yellow text
  hover: '#1D4ED8',   // Darker blue for hover
  light: '#DBEAFE'    // Light blue for backgrounds
};
