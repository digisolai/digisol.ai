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
    personality_description: 'Efficient, systematic, and workflow-optimized. Automatix specializes in designing and implementing automated marketing workflows that save time and increase conversions.'
  },
  'Scriptor': {
    name: 'Scriptor',
    specialization: 'content_creation',
    icon: FiEdit3,
    color: 'purple',
    assignedPage: 'Content Creation',
    personality_description: 'Creative, engaging, and brand-conscious. Scriptor excels at creating compelling content that resonates with your target audience and drives engagement.'
  },
  'Prospero': {
    name: 'Prospero',
    specialization: 'lead_nurturing',
    icon: FiUsers,
    color: 'green',
    assignedPage: 'Lead Nurturing',
    personality_description: 'Patient, strategic, and relationship-focused. Prospero develops personalized lead nurturing strategies that convert prospects into loyal customers.'
  },
  'Pecunia': {
    name: 'Pecunia',
    specialization: 'budget_analysis',
    icon: FiDollarSign,
    color: 'orange',
    assignedPage: 'Budget Analysis',
    personality_description: 'Meticulous, cost-conscious, and ROI-focused. Pecunia provides intelligent budget analysis and optimization recommendations for maximum marketing efficiency.'
  },
  'Metrika': {
    name: 'Metrika',
    specialization: 'data_analysis',
    icon: FiBarChart,
    color: 'teal',
    assignedPage: 'Data Analytics',
    personality_description: 'Analytical, precise, and insight-driven. Metrika excels at complex data analysis, pattern recognition, and strategic insights for data-driven decisions.'
  },
  'Quantia': {
    name: 'Quantia',
    specialization: 'reporting_insights',
    icon: FiPieChart,
    color: 'cyan',
    assignedPage: 'Reporting & Insights',
    personality_description: 'Clear, visual, and actionable. Quantia transforms complex data into clear, actionable insights and beautiful reports that drive decision-making.'
  },
  'Structura': {
    name: 'Structura',
    specialization: 'organizational_planning',
    icon: FiActivity,
    color: 'indigo',
    assignedPage: 'Organizational Planning',
    personality_description: 'Orderly, collaborative, and efficiency-driven. Structura helps optimize team structures, roles, and workflows for peak performance.'
  },
  'Icona': {
    name: 'Icona',
    specialization: 'brand_identity',
    icon: FiImage,
    color: 'pink',
    assignedPage: 'Brand Identity',
    personality_description: 'Creative, visually-driven, and brand-conscious. Icona helps develop and maintain cohesive brand identity across all touchpoints.'
  },
  'Connectus': {
    name: 'Connectus',
    specialization: 'integrations_management',
    icon: FiGlobe,
    color: 'brand.primary',
    assignedPage: 'Integrations',
    personality_description: 'Technical, bridge-building, and ecosystem-focused. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.'
  },
  'Mentor': {
    name: 'Mentor',
    specialization: 'learning_guidance',
    icon: FiBookOpen,
    color: 'green',
    assignedPage: 'Learning & Training',
    personality_description: 'Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills at your own pace.'
  },
  'Curator': {
    name: 'Curator',
    specialization: 'template_curation',
    icon: FiAward,
    color: 'brand.accent',
    assignedPage: 'Template Curation',
    personality_description: 'Organized, quality-focused, and user-centric. Curator helps you find, organize, and customize the perfect templates for your campaigns.'
  },
  'Promana': {
    name: 'Promana',
    specialization: 'project_management',
    icon: FiBriefcase,
    color: 'gray',
    assignedPage: 'Project Management',
    personality_description: 'Organized, deadline-driven, and team-focused. Promana helps you manage marketing projects efficiently and keep teams aligned.'
  },
  'Optimizer': {
    name: 'Optimizer',
    specialization: 'campaign_optimization',
    icon: FiTrendingUp,
    color: 'green',
    assignedPage: 'Campaign Optimization',
    personality_description: 'Data-driven, performance-focused, and continuously improving. Optimizer analyzes campaign performance and suggests optimizations for better results.'
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
