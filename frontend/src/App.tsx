import {useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import the theme CSS for CSS custom properties
import './styles/theme.css';

// Import your pages
import LoginPage from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import CampaignsPage from './pages/CampaignsPage';
import BrandHubPage from './pages/BrandHubPage';
import DesignStudioPage from './pages/DesignStudioPage';
import AutomationsPage from './pages/AutomationsPage';
import ReportsPage from './pages/ReportsPage';
import IntegrationsPage from './pages/IntegrationsPage';

import EnhancedBudgetingPage from './pages/EnhancedBudgetingPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIOverviewPage from './pages/AIOverviewPage';
import AboutPage from './pages/AboutPage';
import LearningPage from './pages/LearningPage';
import TutorialDetailPage from './pages/TutorialDetailPage';
import AIPlanningStudioPage from './pages/AIPlanningStudioPage';
import AITaskDetailPage from './pages/AITaskDetailPage';
import MarketingTemplatesPage from './pages/MarketingTemplatesPage';
import BillingPage from './pages/BillingPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  const [dynamicTheme, setDynamicTheme] = useState(() => {
    // Initial theme state: read from local storage or use DigiSol.AI defaults
    const primaryColor = localStorage.getItem('client_primary_color') || '#1F4287'; // Default Deep Sapphire Blue
    const accentColor = localStorage.getItem('client_accent_color') || '#FFC300'; // Default Vibrant Golden Yellow
    const headerFont = localStorage.getItem('client_header_font') || 'Lato, sans-serif'; // Default Lato for headings
    const bodyFont = localStorage.getItem('client_body_font') || 'Open Sans, sans-serif'; // Default Open Sans for body

    return extendTheme({
      // Define your brand colors
      colors: {
        brand: {
          primary: primaryColor,
          accent: accentColor,
          // Define other neutral shades for a full palette, for consistency
          neutral: {
              50: '#f7fafc', 100: '#edf2f7', 200: '#e2e8f0', 300: '#cbd5e0',
              400: '#a0aec0', 500: '#718096', 600: '#4a5568', 700: '#2d3748',
              800: '#1a202c', 900: '#171923',
          },
        },
        // Add any other custom colors you define in your base theme if they exist
      },
      // Define your brand fonts
      fonts: {
        heading: headerFont,
        body: bodyFont,
      },
      // You might have other theme extensions here (components, styles, etc.)
      // These will be merged with the dynamic colors/fonts.
      // Example: components: { Button: { baseStyle: { _focus: { boxShadow: 'outline' } } } }
    });
  });

  // Effect to listen for changes in local storage (e.g., from BrandHubPage)
  useEffect(() => {
    const handleStorageChange = () => {
      const newPrimary = localStorage.getItem('client_primary_color');
      const newAccent = localStorage.getItem('client_accent_color');
      const newHeaderFont = localStorage.getItem('client_header_font');
      const newBodyFont = localStorage.getItem('client_body_font');

      // Only update theme if values have actually changed and are different from current theme
      setDynamicTheme(prevTheme => {
        const currentPrimary = prevTheme.colors.brand.primary;
        const currentAccent = prevTheme.colors.brand.accent;
        const currentHeaderFont = prevTheme.fonts.heading;
        const currentBodyFont = prevTheme.fonts.body;

        if (
          newPrimary !== currentPrimary ||
          newAccent !== currentAccent ||
          newHeaderFont !== currentHeaderFont ||
          newBodyFont !== currentBodyFont
        ) {
          // If changes detected, create a new theme object to trigger re-render
          return extendTheme({
            colors: {
              brand: {
                primary: newPrimary || '#1F4287',
                accent: newAccent || '#FFC300',
                neutral: { /* ... Neutral colors, ensure they match the full set as above ... */
                    50: '#f7fafc', 100: '#edf2f7', 200: '#e2e8f0', 300: '#cbd5e0',
                    400: '#a0aec0', 500: '#718096', 600: '#4a5568', 700: '#2d3748',
                    800: '#1a202c', 900: '#171923',
                }
              },
            },
            fonts: {
              heading: newHeaderFont || 'Lato, sans-serif',
              body: newBodyFont || 'Open Sans, sans-serif',
            },
            // ... (include any other static theme extensions from your base theme) ...
          });
        }
        return prevTheme; // No change, return current theme object
      });
    };

    // Enhanced theme change handler that also listens for custom events
    const handleThemeUpdate = (event: CustomEvent) => {
      if (event.detail) {
        const themeData = event.detail;
        // Update localStorage with new theme data
        localStorage.setItem('client_primary_color', themeData.primary_color);
        localStorage.setItem('client_accent_color', themeData.accent_color);
        localStorage.setItem('client_header_font', themeData.header_font);
        localStorage.setItem('client_body_font', themeData.body_font);
        localStorage.setItem('client_brand_name', themeData.brand_name);
        localStorage.setItem('client_logo_url', themeData.logo_url);
        localStorage.setItem('client_theme_data', JSON.stringify(themeData));
        
        // Trigger the storage change handler to update Chakra theme
        handleStorageChange();
      }
    };

    // Add event listener for 'storage' changes (fires when local storage is updated in another tab/window)
    window.addEventListener('storage', handleStorageChange);
    
    // Add event listener for custom theme updates from useTheme hook
    window.addEventListener('themeUpdated', handleThemeUpdate as EventListener);

    // Cleanup function: remove the event listeners when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeUpdated', handleThemeUpdate as EventListener);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <ChakraProvider theme={dynamicTheme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes (requires authentication) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ContactsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/brand-hub"
              element={
                <ProtectedRoute>
                  <BrandHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/design-studio"
              element={
                <ProtectedRoute>
                  <DesignStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/automations"
              element={
                <ProtectedRoute>
                  <AutomationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgeting"
              element={
                <ProtectedRoute>
                  <EnhancedBudgetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-overview"
              element={
                <ProtectedRoute>
                  <AIOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-planning-studio"
              element={
                <ProtectedRoute>
                  <AIPlanningStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-planning/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <AITaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <LearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning/tutorials/:tutorialId"
              element={
                <ProtectedRoute>
                  <TutorialDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <MarketingTemplatesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Fallback for any unknown route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
