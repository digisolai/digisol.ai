import { useAuth } from '../hooks/useAuth';

export interface FeatureAccess {
  hasAccess: boolean;
  isUnlimited: boolean;
  showUpgradePrompt: boolean;
  currentUsage?: number;
  limit?: number;
  feature: string;
}

export interface SubscriptionData {
  is_superuser?: boolean;
  show_upgrade_prompt?: boolean;
  contact_limit: number;
  email_send_limit: number;
  ai_text_credits_per_month: number;
  ai_image_credits_per_month: number;
  ai_planning_requests_per_month: number;
  contacts_used_current_period: number;
  emails_sent_current_period: number;
  ai_text_credits_used_current_period: number;
  ai_image_credits_used_current_period: number;
  ai_planning_requests_used_current_period: number;
}

// Feature definitions with their limits and upgrade messages
export const FEATURES = {
  AI_AGENTS: {
    key: 'ai_agents',
    name: 'AI Agents',
    description: 'Access to all 16 AI agents',
    upgradeMessage: 'Unlock unlimited AI agent access and higher token limits'
  },
  AUTOMATIONS: {
    key: 'automations',
    name: 'Automation Workflows',
    description: 'Create automation workflows',
    upgradeMessage: 'Create unlimited automation workflows'
  },
  DESIGN_STUDIO: {
    key: 'design_studio',
    name: 'Design Studio',
    description: 'AI-powered design generation',
    upgradeMessage: 'Unlimited design generation and advanced tools'
  },
  ANALYTICS: {
    key: 'analytics',
    name: 'Advanced Analytics',
    description: 'Comprehensive analytics and insights',
    upgradeMessage: 'Access advanced analytics and predictive insights'
  },
  CLIENT_PORTALS: {
    key: 'client_portals',
    name: 'Client Portals',
    description: 'Manage client portals and billing',
    upgradeMessage: 'Manage unlimited client portals with white-label options'
  },
  INTEGRATIONS: {
    key: 'integrations',
    name: 'Integrations',
    description: 'Connect with external platforms',
    upgradeMessage: 'Connect with unlimited platforms and custom integrations'
  },
  CONTACTS: {
    key: 'contacts',
    name: 'Contact Management',
    description: 'Manage your contact database',
    upgradeMessage: 'Manage unlimited contacts and advanced segmentation'
  },
  EMAILS: {
    key: 'emails',
    name: 'Email Campaigns',
    description: 'Send email campaigns',
    upgradeMessage: 'Send unlimited emails with advanced automation'
  }
} as const;

// Hook to check feature access
export function useFeatureAccess(feature: keyof typeof FEATURES): FeatureAccess {
  const { user } = useAuth();
  
  // Default access for all features (show everything, prompt for upgrades)
  const defaultAccess: FeatureAccess = {
    hasAccess: true,
    isUnlimited: false,
    showUpgradePrompt: true,
    feature: FEATURES[feature].key
  };

  // If no user, return default access
  if (!user) {
    return defaultAccess;
  }

  // Superusers have unlimited access
  if (user.is_superuser) {
    return {
      hasAccess: true,
      isUnlimited: true,
      showUpgradePrompt: false,
      feature: FEATURES[feature].key
    };
  }

  // For regular users, check subscription data if available
  // This would typically come from a subscription context or API call
  // For now, return default access that shows features with upgrade prompts
  return defaultAccess;
}

// Utility function to check if a limit is unlimited
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

// Utility function to format usage display
export function formatUsage(used: number, limit: number): string {
  if (isUnlimited(limit)) {
    return `${used} / Unlimited`;
  }
  if (limit === 0) {
    return `${used} / No Limit`;
  }
  return `${used} / ${limit}`;
}

// Utility function to calculate usage percentage
export function getUsagePercentage(used: number, limit: number): number {
  if (isUnlimited(limit) || limit === 0) {
    return 0;
  }
  return Math.min((used / limit) * 100, 100);
}

// Utility function to get progress color based on usage
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'red';
  if (percentage >= 75) return 'orange';
  return 'green';
}

// Utility function to check if user is approaching limits
export function isApproachingLimit(used: number, limit: number, threshold: number = 80): boolean {
  if (isUnlimited(limit) || limit === 0) {
    return false;
  }
  return (used / limit) * 100 >= threshold;
}

// Hook to get subscription data (placeholder for now)
export function useSubscriptionData(): SubscriptionData | null {
  // This would typically fetch from an API or context
  // For now, return null to indicate no subscription data available
  return null;
}

// Utility to determine if upgrade prompt should be shown
export function shouldShowUpgradePrompt(
  subscriptionData: SubscriptionData | null,
  feature: keyof typeof FEATURES
): boolean {
  // Superusers never see upgrade prompts
  if (subscriptionData?.is_superuser) {
    return false;
  }

  // If no subscription data, show upgrade prompt
  if (!subscriptionData) {
    return true;
  }

  // If explicitly set to show upgrade prompt, show it
  if (subscriptionData.show_upgrade_prompt) {
    return true;
  }

  // Check specific feature limits
  switch (feature) {
    case 'CONTACTS':
      return !isUnlimited(subscriptionData.contact_limit);
    case 'EMAILS':
      return !isUnlimited(subscriptionData.email_send_limit);
    case 'AI_AGENTS':
      return !isUnlimited(subscriptionData.ai_text_credits_per_month);
    default:
      return true; // Default to showing upgrade prompt
  }
}
