import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import all pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import AIAgentsPage from './pages/AIAgentsPage';
import AIAgentDirectoryPage from './pages/AIAgentDirectoryPage';
import AIOverviewPage from './pages/AIOverviewPage';
import AIPlanningPage from './pages/AIPlanningPage';
import AIPlanningStudioPage from './pages/AIPlanningStudioPage';
import AITaskDetailPage from './pages/AITaskDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AutomationsPage from './pages/AutomationsPage';
import BillingPage from './pages/BillingPage';
import BrandHubPage from './pages/BrandHubPage';
import BudgetingPage from './pages/BudgetingPage';
import EnhancedBudgetingPage from './pages/EnhancedBudgetingPage';
import ContactsPage from './pages/ContactsPage';
import DesignStudioPage from './pages/DesignStudioPage';
import IntegrationsPage from './pages/IntegrationsPage';
import LearningPage from './pages/LearningPage';
import MarketingTemplatesPage from './pages/MarketingTemplatesPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import TutorialDetailPage from './pages/TutorialDetailPage';
import InfoCenterPage from './pages/InfoCenterPage';
import AboutPage from './pages/AboutPage';
import MyClientsPage from './pages/MyClientsPage';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-agents" element={
              <ProtectedRoute>
                <AIAgentsPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-agent-directory" element={
              <ProtectedRoute>
                <AIAgentDirectoryPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-overview" element={
              <ProtectedRoute>
                <AIOverviewPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-planning" element={
              <ProtectedRoute>
                <AIPlanningPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-planning-studio" element={
              <ProtectedRoute>
                <AIPlanningStudioPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-task/:id" element={
              <ProtectedRoute>
                <AITaskDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/automations" element={
              <ProtectedRoute>
                <AutomationsPage />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            } />
            <Route path="/brand-hub" element={
              <ProtectedRoute>
                <BrandHubPage />
              </ProtectedRoute>
            } />
            <Route path="/budgeting" element={
              <ProtectedRoute>
                <BudgetingPage />
              </ProtectedRoute>
            } />
            <Route path="/enhanced-budgeting" element={
              <ProtectedRoute>
                <EnhancedBudgetingPage />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <ContactsPage />
              </ProtectedRoute>
            } />
            <Route path="/design-studio" element={
              <ProtectedRoute>
                <DesignStudioPage />
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <IntegrationsPage />
              </ProtectedRoute>
            } />
            <Route path="/learning" element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            } />
            <Route path="/marketing-templates" element={
              <ProtectedRoute>
                <MarketingTemplatesPage />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/tutorial/:id" element={
              <ProtectedRoute>
                <TutorialDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/info-center" element={
              <ProtectedRoute>
                <InfoCenterPage />
              </ProtectedRoute>
            } />
            <Route path="/my-clients" element={
              <ProtectedRoute>
                <MyClientsPage />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
