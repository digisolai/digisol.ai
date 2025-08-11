import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProtectionProps {
  children: React.ReactNode;
}

export default function SEOProtection({ children }: SEOProtectionProps) {
  const location = useLocation();
  
  useEffect(() => {
    // Check if we're in a test environment or on test pages
    const isTestEnvironment = import.meta.env.DEV || 
                             window.location.hostname.includes('test') ||
                             window.location.hostname.includes('staging');
    
    const isTestPage = location.pathname.includes('/test') ||
                      location.pathname.includes('/dev') ||
                      location.pathname.includes('/debug') ||
                      location.pathname.includes('/ai-overview') ||
                      location.pathname.includes('/ai-agent-directory');
    
    // Add noindex meta tag for test environments or test pages
    if (isTestEnvironment || isTestPage) {
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'noindex, nofollow');
      
      console.log('🔒 SEO Protection: Added noindex for test environment/page');
    } else {
      // Remove noindex for production pages
      const meta = document.querySelector('meta[name="robots"]');
      if (meta && meta.getAttribute('content')?.includes('noindex')) {
        meta.remove();
      }
    }
    
    // Cleanup function
    return () => {
      const meta = document.querySelector('meta[name="robots"]');
      if (meta && meta.getAttribute('content')?.includes('noindex')) {
        meta.remove();
      }
    };
  }, [location.pathname]);
  
  return <>{children}</>;
}
