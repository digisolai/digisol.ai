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
    personality_description: 'Your automation workflow specialist. Automatix helps you design, optimize, and manage complex automation workflows to streamline your marketing processes. With expertise in trigger-based automation, conditional logic, and performance optimization, Automatix ensures your marketing campaigns run smoothly and efficiently while maximizing engagement and conversion rates.'
  },
  'Scriptor': {
    name: 'Scriptor',
    specialization: 'content_creation',
    icon: FiEdit3,
    color: 'purple',
    assignedPage: 'Content Creation',
    personality_description: 'Your creative content specialist. Scriptor helps you generate compelling copy, social media posts, email content, and marketing materials that resonate with your audience. Drawing from psychology, storytelling techniques, and brand voice guidelines, Scriptor crafts engaging narratives that drive action and build meaningful connections with your target market.'
  },
  'Prospero': {
    name: 'Prospero',
    specialization: 'lead_nurturing',
    icon: FiUsers,
    color: 'green',
    assignedPage: 'Lead Nurturing',
    personality_description: 'Your intelligent lead nurturing assistant. Prospero analyzes contact data, identifies engagement opportunities, and provides personalized recommendations to help you convert prospects into loyal customers. Using behavioral analysis and predictive modeling, Prospero creates tailored nurturing sequences that guide prospects through the buyer journey with the right content at the right time.'
  },
  'Pecunia': {
    name: 'Pecunia',
    specialization: 'budget_analysis',
    icon: FiDollarSign,
    color: 'orange',
    assignedPage: 'Budget Analysis',
    personality_description: 'Your financial analysis expert. Pecunia helps you optimize budgets, analyze spending patterns, and make data-driven financial decisions for your marketing campaigns. Through advanced ROI calculations, cost-per-acquisition analysis, and budget allocation optimization, Pecunia ensures every marketing dollar is invested strategically for maximum return.'
  },
  'Metrika': {
    name: 'Metrika',
    specialization: 'data_analysis',
    icon: FiBarChart,
    color: 'teal',
    assignedPage: 'Data Analytics',
    personality_description: 'Your data analytics specialist. Metrika transforms raw data into actionable insights, helping you understand performance metrics and optimize your marketing strategies. By identifying patterns, trends, and correlations across multiple data sources, Metrika provides deep analytical insights that drive informed decision-making and strategic marketing improvements.'
  },
  'Quantia': {
    name: 'Quantia',
    specialization: 'reporting_insights',
    icon: FiPieChart,
    color: 'cyan',
    assignedPage: 'Reporting & Insights',
    personality_description: 'Your reporting and insights expert. Quantia creates comprehensive reports, identifies trends, and provides strategic insights to improve your marketing performance. With expertise in data visualization, KPI tracking, and executive reporting, Quantia transforms complex data into clear, actionable insights that stakeholders can easily understand and act upon.'
  },
  'Structura': {
    name: 'Structura',
    specialization: 'organizational_planning',
    icon: FiActivity,
    color: 'indigo',
    assignedPage: 'Organizational Planning',
    personality_description: 'Your organizational planning specialist. Structura helps you structure campaigns, organize workflows, and create strategic plans for your marketing initiatives. By analyzing team dynamics, resource allocation, and process efficiency, Structura optimizes your organizational structure to maximize productivity and ensure seamless collaboration across all marketing activities.'
  },
  'Icona': {
    name: 'Icona',
    specialization: 'brand_identity',
    icon: FiImage,
    color: 'pink',
    assignedPage: 'Brand Identity',
    personality_description: 'Your brand identity expert. Icona helps you develop and maintain consistent brand messaging, visual identity, and brand guidelines across all channels. Through comprehensive brand audits, visual consistency analysis, and creative direction, Icona ensures your brand maintains a cohesive and memorable presence that resonates with your target audience.'
  },
  'Connectus': {
    name: 'Connectus',
    specialization: 'integrations_management',
    icon: FiGlobe,
    color: 'blue',
    assignedPage: 'Integrations',
    personality_description: 'Your integrations specialist. Connectus helps you connect and optimize third-party tools, manage API integrations, and streamline your tech stack. By evaluating compatibility, performance optimization, and data flow efficiency, Connectus ensures seamless connectivity between all your marketing tools while maintaining data integrity and operational efficiency.'
  },
  'Mentor': {
    name: 'Mentor',
    specialization: 'learning_guidance',
    icon: FiBookOpen,
    color: 'green',
    assignedPage: 'Learning & Training',
    personality_description: 'Your learning and development guide. Mentor provides training resources, best practices, and guidance to help you and your team improve marketing skills. Through personalized learning paths, skill assessments, and adaptive training recommendations, Mentor accelerates your team\'s professional development and ensures everyone stays current with the latest marketing trends and techniques.'
  },
  'Orchestra': {
    name: 'Orchestra',
    specialization: 'general_orchestration',
    icon: FiLayers,
    color: 'purple',
    assignedPage: 'AI Orchestration',
    personality_description: 'Your AI orchestration expert. Orchestra coordinates multiple AI agents, manages complex workflows, and ensures seamless collaboration between different AI systems. By orchestrating the right AI agents at the right time with the right context, Orchestra maximizes the collective intelligence of your AI ecosystem and delivers comprehensive solutions to complex marketing challenges.'
  },
  'Curator': {
    name: 'Curator',
    specialization: 'template_curation',
    icon: FiAward,
    color: 'yellow',
    assignedPage: 'Template Curation',
    personality_description: 'Your template and resource curator. Curator helps you discover, organize, and optimize marketing templates, resources, and best practices. Through intelligent categorization, quality assessment, and performance tracking, Curator ensures you have access to the most effective templates and resources that align with your brand guidelines and campaign objectives.'
  },
  'Promana': {
    name: 'Promana',
    specialization: 'project_management',
    icon: FiBriefcase,
    color: 'gray',
    assignedPage: 'Project Management',
    personality_description: 'Your project management specialist. Promana helps you plan, track, and manage marketing projects, ensuring timely delivery and optimal resource allocation. With expertise in agile methodologies, risk assessment, and team coordination, Promana keeps your marketing projects on track while adapting to changing priorities and ensuring all stakeholders stay aligned.'
  },
  'Strategist': {
    name: 'Strategist',
    specialization: 'marketing_strategy',
    icon: FiTarget,
    color: 'red',
    assignedPage: 'Marketing Strategy',
    personality_description: 'Your strategic marketing advisor. Strategist helps you develop comprehensive marketing strategies, identify opportunities, and create long-term growth plans. By analyzing market trends, competitive landscapes, and customer insights, Strategist crafts data-driven strategies that position your brand for sustainable growth and competitive advantage.'
  },
  'Optimizer': {
    name: 'Optimizer',
    specialization: 'campaign_optimization',
    icon: FiTrendingUp,
    color: 'green',
    assignedPage: 'Campaign Optimization',
    personality_description: 'Your intelligent campaign optimization assistant. Optimizer analyzes campaign performance, identifies optimization opportunities, and provides data-driven recommendations to improve your marketing ROI. Through A/B testing analysis, performance benchmarking, and predictive modeling, Optimizer continuously refines your campaigns to maximize conversion rates and minimize acquisition costs.'
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

// AI brand colors (deep sapphire background, yellow text)
export const AI_BRAND_COLORS = {
  primary: '#1F4287', // Deep sapphire background (same as sidebar)
  accent: '#FCD34D',  // Yellow text
  hover: '#1E3A8A',   // Darker sapphire for hover
  light: '#DBEAFE'    // Light blue for backgrounds
};
