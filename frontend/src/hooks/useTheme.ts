import {useEffect, useState, useCallback} from 'react';

export interface BrandTheme {
  primary_color: string;
  accent_color: string;
  header_font: string;
  body_font: string;
  brand_name: string;
  logo_url: string;
  updated_at: string;
}

export const useTheme = () => {
  const [theme, setTheme] = useState<BrandTheme | null>(null);

  // Function to apply theme to the current page
  const applyThemeToPage = useCallback((themeData: BrandTheme) => {
    try {
      // Apply CSS custom properties to document root
      const root = document.documentElement;
      root.style.setProperty('--brand-primary-color', themeData.primary_color);
      root.style.setProperty('--brand-accent-color', themeData.accent_color);
      root.style.setProperty('--brand-header-font', themeData.header_font);
      root.style.setProperty('--brand-body-font', themeData.body_font);

      // Update page title with brand name
      if (themeData.brand_name) {
        const currentTitle = document.title;
        if (!currentTitle.includes(themeData.brand_name)) {
          document.title = `${themeData.brand_name} - ${currentTitle.split(' - ').pop() || 'DigiSol.AI'}`;
        }
      }

      // Update favicon if logo URL is provided
      if (themeData.logo_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = themeData.logo_url;
        }
      }

      console.log('Theme applied successfully:', themeData);
    } catch (error) {
      console.error('Error applying theme to page:', error);
    }
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        // Try to load complete theme object first
        const themeData = localStorage.getItem('client_theme_data');
        if (themeData) {
          const parsedTheme = JSON.parse(themeData);
          setTheme(parsedTheme);
          applyThemeToPage(parsedTheme);
          return;
        }

        // Fallback to individual localStorage items for backward compatibility
        const fallbackTheme: BrandTheme = {
          primary_color: localStorage.getItem('client_primary_color') || '#1F4287',
          accent_color: localStorage.getItem('client_accent_color') || '#FFC300',
          header_font: localStorage.getItem('client_header_font') || 'Lato, sans-serif',
          body_font: localStorage.getItem('client_body_font') || 'Open Sans, sans-serif',
          brand_name: localStorage.getItem('client_brand_name') || 'DigiSol.AI',
          logo_url: localStorage.getItem('client_logo_url') || '',
          updated_at: new Date().toISOString(),
        };
        setTheme(fallbackTheme);
        applyThemeToPage(fallbackTheme);
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
      }
    };

    loadTheme();
  }, [applyThemeToPage]);

  // Listen for theme updates from other components
  useEffect(() => {
    const handleThemeUpdate = (event: CustomEvent<BrandTheme>) => {
      setTheme(event.detail);
      applyThemeToPage(event.detail);
    };

    window.addEventListener('themeUpdated', handleThemeUpdate as EventListener);
    
    return () => {
      window.removeEventListener('themeUpdated', handleThemeUpdate as EventListener);
    };
  }, [applyThemeToPage]);

  // Function to manually update theme
  const updateTheme = useCallback((newTheme: Partial<BrandTheme>) => {
    const updatedTheme = { ...theme, ...newTheme, updated_at: new Date().toISOString() };
    setTheme(updatedTheme as BrandTheme);
    
    // Store in localStorage
    localStorage.setItem('client_theme_data', JSON.stringify(updatedTheme));
    
    // Apply to page
    applyThemeToPage(updatedTheme as BrandTheme);
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('themeUpdated', { 
      detail: updatedTheme 
    }));
  }, [theme, applyThemeToPage]);

  // Function to reset theme to defaults
  const resetTheme = useCallback(() => {
    const defaultTheme: BrandTheme = {
      primary_color: '#1F4287',
      accent_color: '#FFC300',
      header_font: 'Lato, sans-serif',
      body_font: 'Open Sans, sans-serif',
      brand_name: 'DigiSol.AI',
      logo_url: '',
      updated_at: new Date().toISOString(),
    };
    
    setTheme(defaultTheme);
    localStorage.setItem('client_theme_data', JSON.stringify(defaultTheme));
    applyThemeToPage(defaultTheme);
    
    window.dispatchEvent(new CustomEvent('themeUpdated', { 
      detail: defaultTheme 
    }));
  }, [applyThemeToPage]);

  return {
    theme,
    updateTheme,
    resetTheme,
    applyThemeToPage,
  };
}; 