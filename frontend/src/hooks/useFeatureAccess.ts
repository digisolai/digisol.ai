import { useAuth } from './useAuth';

export const useFeatureAccess = () => {
  const { user } = useAuth();

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;
    
    // Superusers have access to everything
    if (user.is_superuser) return true;
    
    // Check subscription features
    const subscription = user.subscription;
    if (!subscription) return false;
    
    const planFeatures = subscription.features;
    if (!planFeatures) return false;
    
    // Map feature names to subscription features
    const featureMap: { [key: string]: keyof typeof planFeatures } = {
      'ai-agents': 'includes_ai_agents',
      'design-studio': 'includes_design_studio',
      'analytics': 'includes_analytics',
      'automations': 'includes_automations',
      'integrations': 'includes_integrations',
      'team-collaboration': 'includes_team_collaboration',
      'white-label': 'includes_white_label',
      'learning-center': 'includes_learning_center',
      'project-management': 'includes_project_management'
    };
    
    const featureKey = featureMap[feature];
    return featureKey ? planFeatures[featureKey] : false;
  };

  const getRequiredPlan = (feature: string): string => {
    const planRequirements: { [key: string]: string } = {
      'ai-agents': 'Pro',
      'design-studio': 'Pro',
      'analytics': 'Business',
      'automations': 'Pro',
      'integrations': 'Business',
      'team-collaboration': 'Business',
      'white-label': 'Enterprise',
      'learning-center': 'Pro',
      'project-management': 'Pro'
    };
    
    return planRequirements[feature] || 'Pro';
  };

  const getFeatureInfo = (feature: string) => {
    const featureInfo = {
      'ai-agents': {
        title: 'AI Agents',
        description: 'Advanced AI agents that generate content, optimize campaigns, and provide strategic insights'
      },
      'design-studio': {
        title: 'Design Studio',
        description: 'AI-assisted design tools for creating stunning visuals, logos, and brand assets'
      },
      'analytics': {
        title: 'Advanced Analytics',
        description: 'Comprehensive analytics with AI-driven insights and predictive performance modeling'
      },
      'automations': {
        title: 'Automations',
        description: 'Multi-channel campaign orchestration with automated workflows and real-time optimization'
      },
      'integrations': {
        title: 'Integrations',
        description: 'Connect with your favorite tools and platforms for seamless workflow integration'
      },
      'team-collaboration': {
        title: 'Team Collaboration',
        description: 'Built-in project management, team coordination, and client portal features'
      },
      'white-label': {
        title: 'White Label',
        description: 'White-label solutions for agencies to manage multiple clients with custom branding'
      },
      'learning-center': {
        title: 'Learning Center',
        description: 'Comprehensive marketing education with badges, achievements, and personalized learning paths'
      },
      'project-management': {
        title: 'Project Management',
        description: 'AI-powered project management tools for marketing campaigns and team coordination'
      }
    };
    
    return featureInfo[feature as keyof typeof featureInfo];
  };

  return {
    hasFeatureAccess,
    getRequiredPlan,
    getFeatureInfo,
    user
  };
};
