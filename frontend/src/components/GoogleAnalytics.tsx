import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Declare gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GoogleAnalytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);

  return null; // This component doesn't render anything
};

// Utility functions for tracking events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track specific events
export const trackLogin = (method: string) => {
  trackEvent('login', 'authentication', method);
};

export const trackSignUp = (method: string) => {
  trackEvent('sign_up', 'authentication', method);
};

export const trackAITaskCreation = (taskType: string) => {
  trackEvent('ai_task_created', 'ai_services', taskType);
};

export const trackCampaignCreation = (campaignType: string) => {
  trackEvent('campaign_created', 'campaigns', campaignType);
};

export const trackFeatureUsage = (feature: string) => {
  trackEvent('feature_used', 'engagement', feature);
};

export default GoogleAnalytics;
