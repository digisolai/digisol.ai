import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  Select,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Divider,
  List,
  ListItem,
  ListIcon,
  Grid,
  Icon,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiStar,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiSettings,
  FiSearch,
  FiPlay,
  FiCpu,
  FiTarget,
  FiGlobe,
  FiGrid,
} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { StandardPageLayout, StandardPageHeader } from "../components/StandardPageLayout";
import { StandardAIAgent } from "../components/StandardAIAgent";
import { AnalyticsCharts, generateSampleData } from "../components/AnalyticsCharts";
import { GoogleAnalyticsIntegration } from "../components/GoogleAnalyticsIntegration";
import api from "../services/api";
import type { AIProfile } from "../types/ai";

// Types for Metrika Advanced Analytics
interface AnalyticsModel {
  id: string;
  name: string;
  model_type: string;
  model_type_display: string;
  description: string;
  is_active: boolean;
  performance_metrics: unknown;
  last_trained?: string;
}

interface AnalyticsInsight {
  id: string;
  insight_type: string;
  insight_type_display: string;
  title: string;
  description: string;
  confidence_score: number;
  impact_score: number;
  recommendations: string[];
  is_actioned: boolean;
  created_at: string;
}

interface SEOAnalysis {
  id: string;
  domain: string;
  analysis_date: string;
  gsc_data: unknown;
  ga_data: unknown;
  technical_seo: unknown;
  keyword_data: unknown;
  insights: unknown[];
  recommendations: string[];
}

interface SWOTAnalysis {
  id: string;
  analysis_date: string;
  analysis_period: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategic_recommendations: unknown[];
}

interface IndustryAnalysis {
  id: string;
  industry: string;
  sub_industry: string;
  analysis_date: string;
  market_size: unknown;
  competitors: unknown[];
  trends: string[];
  strategic_implications: unknown[];
}

function AnalyticsPage() {

  const [metrikaAgent, setMetrikaAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // Metrika Analytics State
  const [analyticsModels, setAnalyticsModels] = useState<AnalyticsModel[]>([]);
  const [analyticsInsights, setAnalyticsInsights] = useState<AnalyticsInsight[]>([]);
  const [seoAnalyses, setSeoAnalyses] = useState<SEOAnalysis[]>([]);
  const [swotAnalyses, setSwotAnalyses] = useState<SWOTAnalysis[]>([]);
  const [industryAnalyses, setIndustryAnalyses] = useState<IndustryAnalysis[]>([]);

  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle Google Analytics data updates
  const handleGoogleAnalyticsUpdate = (data: unknown) => {
    // You can add additional logic here to update charts with real GA data
    console.log('Google Analytics data updated:', data);
  };
  
  // Modal states
  const { isOpen: isAnalysisOpen, onOpen: onAnalysisOpen, onClose: onAnalysisClose } = useDisclosure();
  const { isOpen: isModelOpen, onOpen: onModelOpen, onClose: onModelClose } = useDisclosure();

  const { isOpen: isSwotOpen, onOpen: onSwotOpen, onClose: onSwotClose } = useDisclosure();
  const { isOpen: isSeoOpen, onOpen: onSeoOpen, onClose: onSeoClose } = useDisclosure();
  const { isOpen: isIndustryOpen, onOpen: onIndustryOpen, onClose: onIndustryClose } = useDisclosure();
  
  const toast = useToast();

  useEffect(() => {
    fetchMetrikaAgent();
    fetchAnalyticsModels();
    fetchAnalyticsInsights();
    fetchSeoAnalyses();
    fetchSwotAnalyses();
    fetchIndustryAnalyses();
  }, []);

  async function fetchMetrikaAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=advanced_analytics&is_global=true');
      if (res.data && res.data.length > 0) {
        setMetrikaAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setMetrikaAgent({
          id: "metrika",
          name: "Metrika",
          specialization: "advanced_analytics",
          personality_description: "Deep analytical and predictive intelligence. Metrika excels at complex data analysis, pattern recognition, and strategic insights for advanced business decisions.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Metrika agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setMetrikaAgent({
        id: "metrika",
        name: "Metrika",
        specialization: "advanced_analytics",
        personality_description: "Deep analytical and predictive intelligence. Metrika excels at complex data analysis, pattern recognition, and strategic insights for advanced business decisions.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskMetrika = async (question: string) => {
    try {
      const response = await api.post('/analytics/metrika/analysis/', {
        analysis_type: 'nlp_query',
        problem_statement: question,
        data_sources: ['all']
      });
      toast({
        title: "Metrika's Analysis",
        description: response.data.results?.key_findings?.[0] || "Analysis completed successfully.",
        status: "success",
        duration: 8000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to get Metrika's analysis at this time.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // --- Data Fetching Functions ---
  async function fetchAnalyticsModels() {
    try {
      // Mock analytics models data
      const mockModels: AnalyticsModel[] = [
        {
          id: "1",
          name: "Lead Scoring Model",
          model_type: "classification",
          model_type_display: "Classification",
          description: "Predicts lead conversion probability based on behavioral patterns",
          is_active: true,
          performance_metrics: {
            accuracy: 0.87,
            precision: 0.82,
            recall: 0.91,
            f1_score: 0.86
          },
          last_trained: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          name: "Customer Churn Predictor",
          model_type: "classification",
          model_type_display: "Classification",
          description: "Identifies customers at risk of churning",
          is_active: true,
          performance_metrics: {
            accuracy: 0.92,
            precision: 0.89,
            recall: 0.94,
            f1_score: 0.91
          },
          last_trained: "2024-01-14T14:20:00Z"
        },
        {
          id: "3",
          name: "Revenue Forecasting",
          model_type: "regression",
          model_type_display: "Regression",
          description: "Predicts monthly revenue based on historical data and market trends",
          is_active: true,
          performance_metrics: {
            mse: 0.023,
            mae: 0.156,
            r2_score: 0.89
          },
          last_trained: "2024-01-13T09:15:00Z"
        }
      ];
      
      setAnalyticsModels(mockModels);
      console.log('✅ Loaded analytics models:', mockModels.length);
    } catch (error) {
      console.error('Failed to fetch analytics models:', error);
    }
  }

  async function fetchAnalyticsInsights() {
    try {
      // Mock analytics insights data
      const mockInsights: AnalyticsInsight[] = [
        {
          id: "1",
          insight_type: "trend_analysis",
          insight_type_display: "Trend Analysis",
          title: "Email Engagement Declining",
          description: "Email open rates have decreased by 15% over the last 30 days. This correlates with changes in send times and subject line patterns.",
          confidence_score: 0.92,
          impact_score: 0.78,
          recommendations: [
            "A/B test new subject line formats",
            "Optimize send times based on user activity",
            "Review email content quality"
          ],
          is_actioned: false,
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          insight_type: "anomaly_detection",
          insight_type_display: "Anomaly Detection",
          title: "Unusual Traffic Spike Detected",
          description: "Website traffic increased by 200% on January 12th. Analysis shows this was driven by a viral social media post.",
          confidence_score: 0.95,
          impact_score: 0.85,
          recommendations: [
            "Capitalize on viral content momentum",
            "Prepare for potential follow-up traffic",
            "Monitor conversion rates during high traffic"
          ],
          is_actioned: true,
          created_at: "2024-01-12T16:45:00Z"
        },
        {
          id: "3",
          insight_type: "segmentation",
          insight_type_display: "Segmentation",
          title: "High-Value Customer Segment Identified",
          description: "Customers who engage with product demos and case studies show 3x higher lifetime value than average.",
          confidence_score: 0.88,
          impact_score: 0.92,
          recommendations: [
            "Create targeted campaigns for demo viewers",
            "Develop case study content strategy",
            "Implement lead scoring for demo engagement"
          ],
          is_actioned: false,
          created_at: "2024-01-14T11:20:00Z"
        },
        {
          id: "4",
          insight_type: "correlation",
          insight_type_display: "Correlation Analysis",
          title: "Social Media Impact on Sales",
          description: "Strong correlation found between LinkedIn engagement and B2B sales conversions. 40% of closed deals had LinkedIn touchpoints.",
          confidence_score: 0.85,
          impact_score: 0.89,
          recommendations: [
            "Increase LinkedIn content frequency",
            "Train sales team on LinkedIn engagement",
            "Allocate more budget to LinkedIn ads"
          ],
          is_actioned: false,
          created_at: "2024-01-13T14:10:00Z"
        }
      ];
      
      setAnalyticsInsights(mockInsights);
      console.log('✅ Loaded analytics insights:', mockInsights.length);
    } catch (error) {
      console.error('Failed to fetch analytics insights:', error);
    }
  }

  async function fetchSeoAnalyses() {
    try {
      // Mock SEO analyses data
      const mockSeoAnalyses: SEOAnalysis[] = [
        {
          id: "1",
          domain: "digisolai.ca",
          analysis_date: "2024-01-15",
          gsc_data: {
            total_clicks: 15420,
            total_impressions: 89200,
            average_position: 12.5,
            average_ctr: 0.017
          },
          ga_data: {
            organic_traffic: 12500,
            organic_conversions: 234,
            organic_conversion_rate: 0.019
          },
          technical_seo: {
            page_speed_score: 85,
            mobile_friendly: true,
            ssl_secure: true,
            broken_links: 3
          },
          keyword_data: {
            top_keywords: [
              { keyword: "ai marketing", position: 8, volume: 1200 },
              { keyword: "digital marketing automation", position: 15, volume: 800 },
              { keyword: "b2b marketing tools", position: 22, volume: 600 }
            ]
          },
          insights: [
            "Page speed needs improvement for better rankings",
            "Mobile optimization is excellent",
            "High-potential keywords identified for targeting"
          ],
          recommendations: [
            "Optimize images and reduce page load time",
            "Create content targeting 'ai marketing' keyword",
            "Fix 3 broken internal links"
          ]
        }
      ];
      
      setSeoAnalyses(mockSeoAnalyses);
    } catch (error) {
      console.error('Failed to fetch SEO analyses:', error);
    }
  }

  async function fetchSwotAnalyses() {
    try {
      // Mock SWOT analyses data
      const mockSwotAnalyses: SWOTAnalysis[] = [
        {
          id: "1",
          analysis_date: "2024-01-15",
          analysis_period: "Q1 2024",
          strengths: [
            "Strong AI-powered marketing automation platform",
            "Experienced team with deep industry expertise",
            "Proven track record with enterprise clients",
            "Comprehensive feature set covering all marketing needs"
          ],
          weaknesses: [
            "Limited brand recognition compared to competitors",
            "Higher pricing than some competitors",
            "Limited integrations with third-party tools",
            "Smaller marketing budget than major players"
          ],
          opportunities: [
            "Growing demand for AI-powered marketing solutions",
            "Expansion into new geographic markets",
            "Partnership opportunities with major platforms",
            "Emerging trends in marketing automation"
          ],
          threats: [
            "Increasing competition from established players",
            "Economic uncertainty affecting marketing budgets",
            "Rapidly changing technology landscape",
            "Potential regulatory changes in data privacy"
          ],
          strategic_recommendations: [
            "Invest in brand awareness campaigns",
            "Develop strategic partnerships",
            "Expand product integrations",
            "Focus on competitive differentiation"
          ]
        }
      ];
      
      setSwotAnalyses(mockSwotAnalyses);
    } catch (error) {
      console.error('Failed to fetch SWOT analyses:', error);
    }
  }

  async function fetchIndustryAnalyses() {
    try {
      // Mock industry analyses data
      const mockIndustryAnalyses: IndustryAnalysis[] = [
        {
          id: "1",
          industry: "Marketing Technology",
          sub_industry: "Marketing Automation",
          analysis_date: "2024-01-15",
          market_size: {
            total_size: "25.6B USD",
            growth_rate: "12.5%",
            projected_size_2025: "28.9B USD"
          },
          competitors: [
            {
              name: "HubSpot",
              market_share: "18.2%",
              strengths: ["Strong brand recognition", "Comprehensive platform"],
              weaknesses: ["Complex pricing", "Steep learning curve"]
            },
            {
              name: "Marketo",
              market_share: "12.8%",
              strengths: ["Enterprise focus", "Advanced features"],
              weaknesses: ["High cost", "Limited SMB appeal"]
            },
            {
              name: "Pardot",
              market_share: "8.5%",
              strengths: ["Salesforce integration", "B2B focus"],
              weaknesses: ["Limited standalone features", "Complex setup"]
            }
          ],
          trends: [
            "AI and machine learning integration",
            "Personalization at scale",
            "Account-based marketing focus",
            "Multi-channel attribution",
            "Privacy-first marketing"
          ],
          strategic_implications: [
            "Focus on AI differentiation",
            "Develop privacy-compliant features",
            "Target mid-market segment",
            "Build strong integration ecosystem"
          ]
        }
      ];
      
      setIndustryAnalyses(mockIndustryAnalyses);
    } catch (error) {
      console.error('Failed to fetch industry analyses:', error);
    }
  }

  const handleTrainModel = async (modelId: string) => {
    try {
      await api.post(`/analytics/analytics-models/${modelId}/train/`);
      toast({
        title: "Model Training Started",
        description: "Your model is being trained. This may take several minutes.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      fetchAnalyticsModels();
    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Failed to start model training. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateSwot = async (analysisId: string) => {
    try {
      await api.post(`/analytics/swot-analyses/${analysisId}/generate_swot/`);
      toast({
        title: "SWOT Analysis Started",
        description: "Metrika is generating your SWOT analysis using AI.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      fetchSwotAnalyses();
    } catch (error) {
      toast({
        title: "SWOT Generation Failed",
        description: "Failed to generate SWOT analysis. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRunSeoAnalysis = async (analysisId: string) => {
    try {
      await api.post(`/analytics/seo-analyses/${analysisId}/run_analysis/`);
      toast({
        title: "SEO Analysis Started",
        description: "Metrika is running comprehensive SEO analysis.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      fetchSeoAnalyses();
    } catch (error) {
      toast({
        title: "SEO Analysis Failed",
        description: "Failed to run SEO analysis. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRunIndustryAnalysis = async (analysisId: string) => {
    try {
      await api.post(`/analytics/industry-analyses/${analysisId}/run_industry_analysis/`);
      toast({
        title: "Industry Analysis Started",
        description: "Metrika is analyzing industry trends and competitive landscape.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      fetchIndustryAnalyses();
    } catch (error) {
      toast({
        title: "Industry Analysis Failed",
        description: "Failed to run industry analysis. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // --- Action Handlers ---
  const handleMarkAsActioned = async (insightId: string) => {
    try {
      // Mock API call to mark insight as actioned
      setAnalyticsInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, is_actioned: true }
          : insight
      ));
      
      toast({
        title: "Insight Actioned",
        description: "Insight has been marked as actioned successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to mark insight as actioned:', error);
      toast({
        title: "Error",
        description: "Failed to mark insight as actioned. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getInsightIcon = (insightType: string) => {
    switch (insightType) {
      case 'anomaly': return <FiAlertTriangle />;
      case 'trend': return <FiTrendingUp />;
      case 'prediction': return <FiTarget />;
      case 'recommendation': return <FiStar />;
      case 'segmentation': return <FiUsers />;
      case 'root_cause': return <FiSearch />;
      default: return <FiInfo />;
    }
  };

  const getInsightColor = (insightType: string) => {
    switch (insightType) {
      case 'anomaly': return 'red';
              case 'trend': return 'brand.primary';
      case 'prediction': return 'purple';
      case 'recommendation': return 'green';
      case 'segmentation': return 'orange';
              case 'root_cause': return 'brand.accent';
      default: return 'gray';
    }
  };

  return (
    <Layout>
      <StandardPageLayout
        title="Advanced Analytics"
        breadcrumbItems={[{ label: "Analytics" }]}
      >
        <StandardPageHeader
          actionButton={
            <Button
              leftIcon={<FiPlus />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              onClick={onAnalysisOpen}
              size="lg"
            >
              Start New Analysis
            </Button>
          }
        />
        
        {/* Metrika AI Agent Section */}
        <StandardAIAgent
          agent={metrikaAgent} 
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskMetrika}
          title="Metrika"
          description="Your intelligent analytics assistant. Metrika analyzes complex data patterns, generates predictive insights, and provides strategic recommendations to optimize your business performance. Ask me anything about your analytics, trends, or data-driven decisions."
        />
        
        <Tabs index={parseInt(activeTab)} onChange={(index) => setActiveTab(index.toString())}>
            <TabList mb={6}>
              <Tab>Overview</Tab>
              <Tab>ML Models</Tab>
              <Tab>Insights</Tab>
              <Tab>SWOT Analysis</Tab>
              <Tab>SEO Analysis</Tab>
              <Tab>Industry Analysis</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Google Analytics Integration */}
                  <GoogleAnalyticsIntegration onDataUpdate={handleGoogleAnalyticsUpdate} />
                  
                  {/* Analytics Charts */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Analytics Dashboard</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <AnalyticsCharts
                        data={generateSampleData('traffic', 7)}
                        type="line"
                        title="Website Traffic"
                        description="Daily website visitors over the last 7 days"
                        height={250}
                      />
                      <AnalyticsCharts
                        data={generateSampleData('revenue', 6)}
                        type="bar"
                        title="Monthly Revenue"
                        description="Revenue trends over the last 6 months"
                        height={250}
                      />
                      <AnalyticsCharts
                        data={generateSampleData('sources')}
                        type="pie"
                        title="Traffic Sources"
                        description="Distribution of traffic by source"
                        height={250}
                      />
                      <AnalyticsCharts
                        data={generateSampleData('traffic', 7)}
                        type="area"
                        title="User Engagement"
                        description="User engagement metrics over time"
                        height={250}
                      />
                    </SimpleGrid>
                  </Box>

                  {/* Strategic Insights Hub */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Strategic Insights & Diagnostics</Heading>
                    <Card>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text fontWeight="medium" mb={2}>Business Performance Outlook</Text>
                            <Text fontSize="sm" color="gray.600">
                              Metrika predicts a 20% growth in qualified leads next quarter, but identifies a 5% churn risk in your 'Mid-Tier' customer segment.
                            </Text>
                          </Box>
                          <Divider />
                          <Box>
                            <Text fontWeight="medium" mb={2}>Top Strategic Recommendations</Text>
                            <List spacing={2}>
                              <ListItem fontSize="sm">
                                <ListIcon as={FiTarget} color="brand.primary" />
                                Launch targeted retention campaign for customers with engagement score below threshold
                              </ListItem>
                              <ListItem fontSize="sm">
                                <ListIcon as={FiTrendingUp} color="#FFC300" />
                                Shift 5% of budget from display ads to influencer marketing for 12% brand awareness increase
                              </ListItem>
                              <ListItem fontSize="sm">
                                <ListIcon as={FiGlobe} color="purple.500" />
                                Proactive social media campaign focusing on emerging trends to capture market share
                              </ListItem>
                            </List>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Box>

                  {/* Quick Analytics Actions */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Quick Analytics Actions</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Button
                        height="120px"
                        variant="outline"
                        colorScheme="brand"
                        onClick={onAnalysisOpen}
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'lg',
                          bg: 'brand.primary',
                          color: 'white'
                        }}
                        transition="all 0.2s"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                      >
                        <FiCpu size={32} />
                        <Text fontWeight="medium">Run Analysis</Text>
                      </Button>
                      
                      <Button
                        height="120px"
                        variant="outline"
                        colorScheme="brand"
                        onClick={onSwotOpen}
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'lg',
                          bg: 'brand.primary',
                          color: 'white'
                        }}
                        transition="all 0.2s"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                      >
                        <FiGrid size={32} />
                        <Text fontWeight="medium">SWOT Analysis</Text>
                      </Button>
                      
                      <Button
                        height="120px"
                        variant="outline"
                        colorScheme="brand"
                        onClick={onSeoOpen}
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'lg',
                          bg: 'brand.primary',
                          color: 'white'
                        }}
                        transition="all 0.2s"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                      >
                        <FiSearch size={32} />
                        <Text fontWeight="medium">SEO Analysis</Text>
                      </Button>
                      
                      <Button
                        height="120px"
                        variant="outline"
                        colorScheme="brand"
                        onClick={onIndustryOpen}
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'lg',
                          bg: 'brand.primary',
                          color: 'white'
                        }}
                        transition="all 0.2s"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                      >
                        <FiGlobe size={32} />
                        <Text fontWeight="medium">Industry Analysis</Text>
                      </Button>
                    </SimpleGrid>
                  </Box>

                  {/* Recent Insights */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Recent AI Insights</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {analyticsInsights.slice(0, 4).map((insight) => (
                        <Card key={insight.id}>
                          <CardHeader>
                            <HStack justify="space-between">
                              <Heading size="sm">{insight.title}</Heading>
                              <Badge colorScheme={getInsightColor(insight.insight_type)}>
                                {insight.insight_type_display}
                              </Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <Text fontSize="sm" mb={4}>{insight.description}</Text>
                            <HStack justify="space-between" mb={3}>
                              <Progress value={insight.confidence_score * 100} flex={1} />
                              <Text fontSize="xs" color="gray.600">
                                {(insight.confidence_score * 100).toFixed(0)}%
                              </Text>
                            </HStack>
                            {!insight.is_actioned && (
                              <Button size="sm" variant="brand" width="full">
                                Mark as Actioned
                              </Button>
                            )}
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* ML Models Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">Machine Learning Models</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      colorScheme="brand.primary" 
                      size="md" 
                      onClick={onModelOpen}
                      bg="brand.primary"
                      color="white"
                      _hover={{ bg: "brand.600" }}
                      _active={{ bg: "brand.700" }}
                    >
                      Create Model
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {analyticsModels.length === 0 ? (
                      <Box
                        gridColumn="1 / -1"
                        border="2px dashed"
                        borderColor="brand.accent"
                        borderRadius="lg"
                        p={16}
                        textAlign="center"
                        bg="brand.neutral.50"
                        color="brand.neutral.300"
                        fontSize="xl"
                        fontWeight="bold"
                        minH="300px"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiCpu} boxSize={16} mb={4} color="brand.primary" />
                        <Text fontSize="2xl" mb={2} color="brand.primary">Create Your First ML Model</Text>
                        <Text fontSize="md" color="brand.neutral.400">
                          Start building machine learning models to gain predictive insights.
                        </Text>
                      </Box>
                    ) : (
                      analyticsModels.map((model) => (
                      <Card key={model.id}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="sm">{model.name}</Heading>
                            <Badge colorScheme={model.is_active ? "green" : "gray"}>
                              {model.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <Text fontSize="sm" color="gray.600" mb={4}>
                            {model.description}
                          </Text>
                          <Badge colorScheme="brand.primary" mb={4}>
                            {model.model_type_display}
                          </Badge>
                          
                          {model.performance_metrics && typeof model.performance_metrics === 'object' && (
                            <Box mb={4}>
                              <Text fontSize="sm" fontWeight="medium" mb={2}>Performance:</Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <Stat size="sm">
                                  <StatLabel>Accuracy</StatLabel>
                                  <StatNumber fontSize="sm">
                                    {('accuracy' in model.performance_metrics && typeof model.performance_metrics.accuracy === 'number' ? (model.performance_metrics.accuracy * 100).toFixed(1) : 0)}%
                                  </StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>F1 Score</StatLabel>
                                  <StatNumber fontSize="sm">
                                    {('f1_score' in model.performance_metrics && typeof model.performance_metrics.f1_score === 'number' ? (model.performance_metrics.f1_score * 100).toFixed(1) : 0)}%
                                  </StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </Box>
                          ) as React.ReactNode}
                          
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              leftIcon={<FiPlay />}
                              onClick={() => handleTrainModel(model.id)}
                            >
                              Train
                            </Button>
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              aria-label="View model details"
                            />
                            <IconButton
                              size="sm"
                              icon={<FiSettings />}
                              aria-label="Configure model"
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Insights Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">AI-Generated Insights</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      colorScheme="brand.primary" 
                      size="md" 
                      onClick={onAnalysisOpen}
                      bg="brand.primary"
                      color="white"
                      _hover={{ bg: "brand.600" }}
                      _active={{ bg: "brand.700" }}
                    >
                      Generate Insight
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {analyticsInsights.map((insight) => (
                      <Card key={insight.id}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="sm">{insight.title}</Heading>
                            <HStack>
                              {getInsightIcon(insight.insight_type)}
                              <Badge colorScheme={getInsightColor(insight.insight_type)}>
                                {insight.insight_type_display}
                              </Badge>
                            </HStack>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <Text fontSize="sm" mb={4}>{insight.description}</Text>
                          
                          <HStack justify="space-between" mb={3}>
                            <Text fontSize="sm" fontWeight="medium">Confidence:</Text>
                            <Text fontSize="sm">{(insight.confidence_score * 100).toFixed(0)}%</Text>
                          </HStack>
                          <Progress value={insight.confidence_score * 100} mb={4} />
                          
                          <HStack justify="space-between" mb={3}>
                            <Text fontSize="sm" fontWeight="medium">Impact Score:</Text>
                            <Text fontSize="sm">{(insight.impact_score * 100).toFixed(0)}%</Text>
                          </HStack>
                          <Progress value={insight.impact_score * 100} mb={4} colorScheme="green" />
                          
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>Recommendations:</Text>
                            <List spacing={1}>
                              {insight.recommendations.map((rec, index) => (
                                <ListItem key={index} fontSize="sm">
                                  <ListIcon as={FiCheckCircle} color="#FFC300" />
                                  {rec}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                          
                          <HStack justify="space-between" mt={4}>
                            <Text fontSize="xs" color="gray.600">
                              {new Date(insight.created_at).toLocaleDateString()}
                            </Text>
                            {!insight.is_actioned && (
                              <Button size="sm" variant="brand" onClick={() => handleMarkAsActioned(insight.id)}>
                                Mark Actioned
                              </Button>
                            )}
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* SWOT Analysis Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">SWOT Analysis</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      variant="brand" 
                      size="md" 
                      onClick={onSwotOpen}
                    >
                      New SWOT Analysis
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {swotAnalyses.map((analysis) => (
                      <Card key={analysis.id}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="sm">SWOT Analysis</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {analysis.analysis_period}
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <Box>
                              <Text fontWeight="medium" color="green.600" mb={2}>Strengths</Text>
                              <List spacing={1}>
                                {analysis.strengths.slice(0, 3).map((strength, index) => (
                                  <ListItem key={index} fontSize="sm">
                                    <ListIcon as={FiCheckCircle} color="#FFC300" />
                                    {strength}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                            <Box>
                              <Text fontWeight="medium" color="red.600" mb={2}>Weaknesses</Text>
                              <List spacing={1}>
                                {analysis.weaknesses.slice(0, 3).map((weakness, index) => (
                                  <ListItem key={index} fontSize="sm">
                                    <ListIcon as={FiAlertTriangle} color="red.500" />
                                    {weakness}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                            <Box>
                              <Text fontWeight="medium" color="brand.primary" mb={2}>Opportunities</Text>
                              <List spacing={1}>
                                {analysis.opportunities.slice(0, 3).map((opportunity, index) => (
                                  <ListItem key={index} fontSize="sm">
                                    <ListIcon as={FiTrendingUp} color="brand.primary" />
                                    {opportunity}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                            <Box>
                              <Text fontWeight="medium" color="orange.600" mb={2}>Threats</Text>
                              <List spacing={1}>
                                {analysis.threats.slice(0, 3).map((threat, index) => (
                                  <ListItem key={index} fontSize="sm">
                                    <ListIcon as={FiAlertTriangle} color="orange.500" />
                                    {threat}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Grid>
                          
                          <HStack spacing={2} mt={4}>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              leftIcon={<FiCpu />}
                              onClick={() => handleGenerateSwot(analysis.id)}
                            >
                              Regenerate with AI
                            </Button>
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              aria-label="View full analysis"
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* SEO Analysis Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">SEO Analysis</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      variant="brand"
                      size="md" 
                      onClick={onSeoOpen}
                    >
                      New SEO Analysis
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {seoAnalyses.map((analysis) => (
                      <Card key={analysis.id}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="sm">{analysis.domain}</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(analysis.analysis_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          {analysis.gsc_data && (
                            <Box mb={4}>
                              <Text fontWeight="medium" mb={2}>Google Search Console</Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <Stat size="sm">
                                  <StatLabel>Clicks</StatLabel>
                                  <StatNumber fontSize="sm">{analysis.gsc_data.total_clicks}</StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>Impressions</StatLabel>
                                  <StatNumber fontSize="sm">{analysis.gsc_data.total_impressions}</StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </Box>
                          )}
                          
                          {analysis.technical_seo && (
                            <Box mb={4}>
                              <Text fontWeight="medium" mb={2}>Technical SEO</Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <Stat size="sm">
                                  <StatLabel>Mobile Issues</StatLabel>
                                  <StatNumber fontSize="sm">{analysis.technical_seo.mobile_usability_issues}</StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>Page Speed</StatLabel>
                                  <StatNumber fontSize="sm">{analysis.technical_seo.page_speed_score}/100</StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </Box>
                          )}
                          
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="brand"
                              leftIcon={<FiSearch />}
                              onClick={() => handleRunSeoAnalysis(analysis.id)}
                            >
                              Run Analysis
                            </Button>
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              aria-label="View full analysis"
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Industry Analysis Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">Industry Analysis</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      variant="brand"
                      size="md" 
                      onClick={onIndustryOpen}
                    >
                      New Industry Analysis
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {industryAnalyses.map((analysis) => (
                      <Card key={analysis.id}>
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="sm">{analysis.industry}</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(analysis.analysis_date).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          {analysis.market_size && (
                            <Box mb={4}>
                              <Text fontWeight="medium" mb={2}>Market Size</Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <Stat size="sm">
                                  <StatLabel>Current</StatLabel>
                                  <StatNumber fontSize="sm">
                                    ${(analysis.market_size.current_size / 1000000000).toFixed(1)}B
                                  </StatNumber>
                                </Stat>
                                <Stat size="sm">
                                  <StatLabel>Growth Rate</StatLabel>
                                  <StatNumber fontSize="sm">{analysis.market_size.growth_rate}%</StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </Box>
                          )}
                          
                          {analysis.trends && analysis.trends.length > 0 && (
                            <Box mb={4}>
                              <Text fontWeight="medium" mb={2}>Key Trends</Text>
                              <List spacing={1}>
                                {analysis.trends.slice(0, 3).map((trend, index) => (
                                  <ListItem key={index} fontSize="sm">
                                    <ListIcon as={FiTrendingUp} color="brand.primary" />
                                    {trend}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                          
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="brand"
                              leftIcon={<FiGlobe />}
                              onClick={() => handleRunIndustryAnalysis(analysis.id)}
                            >
                              Run Analysis
                            </Button>
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              aria-label="View full analysis"
                            />
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

        {/* Start New Analysis Modal */}
        <Modal isOpen={isAnalysisOpen} onClose={onAnalysisClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Start New Analysis</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Analysis Type</Text>
                  <Select placeholder="Select analysis type">
                    <option value="regression">Regression Analysis</option>
                    <option value="classification">Classification Analysis</option>
                    <option value="clustering">Clustering Analysis</option>
                    <option value="time_series">Time Series Forecasting</option>
                    <option value="churn_prediction">Churn Prediction</option>
                    <option value="attribution">Attribution Modeling</option>
                  </Select>
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Problem Statement</Text>
                  <Textarea placeholder="Describe what you want to analyze..." />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Data Sources</Text>
                  <Select placeholder="Select data sources" multiple>
                    <option value="campaigns">Campaign Data</option>
                    <option value="analytics">Analytics Data</option>
                    <option value="crm">CRM Data</option>
                    <option value="social">Social Media Data</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onAnalysisClose}>Cancel</Button>
                                          <Button variant="brand">Start Analysis</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* SWOT Analysis Modal */}
        <Modal isOpen={isSwotOpen} onClose={onSwotClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create SWOT Analysis</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Analysis Period</Text>
                  <Select placeholder="Select analysis period">
                    <option value="Q1 2025">Q1 2025</option>
                    <option value="Q2 2025">Q2 2025</option>
                    <option value="Last 6 months">Last 6 months</option>
                    <option value="Last year">Last year</option>
                  </Select>
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Data Sources</Text>
                  <Select placeholder="Select data sources" multiple>
                    <option value="internal">Internal Data</option>
                    <option value="external">External Data</option>
                    <option value="market">Market Research</option>
                    <option value="competitor">Competitor Analysis</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onSwotClose}>Cancel</Button>
                  <Button variant="brand">Generate SWOT</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* SEO Analysis Modal */}
        <Modal isOpen={isSeoOpen} onClose={onSeoClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create SEO Analysis</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Domain</Text>
                  <Input placeholder="Enter domain (e.g., example.com)" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Analysis Type</Text>
                  <Select placeholder="Select analysis type">
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="technical">Technical SEO</option>
                    <option value="keyword">Keyword Analysis</option>
                    <option value="competitor">Competitor Analysis</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onSeoClose}>Cancel</Button>
                  <Button variant="brand">Run SEO Analysis</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Industry Analysis Modal */}
        <Modal isOpen={isIndustryOpen} onClose={onIndustryClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Industry Analysis</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Industry</Text>
                  <Input placeholder="Enter industry name" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Sub-Industry</Text>
                  <Input placeholder="Enter sub-industry (optional)" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Analysis Focus</Text>
                  <Select placeholder="Select analysis focus">
                    <option value="market_size">Market Size & Growth</option>
                    <option value="competitors">Competitive Landscape</option>
                    <option value="trends">Market Trends</option>
                    <option value="regulations">Regulatory Environment</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onIndustryClose}>Cancel</Button>
                  <Button variant="brand">Run Industry Analysis</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Create ML Model Modal */}
        <Modal isOpen={isModelOpen} onClose={onModelClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Machine Learning Model</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Model Name</Text>
                  <Input placeholder="Enter model name" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Model Type</Text>
                  <Select placeholder="Select model type">
                    <option value="regression">Regression Model</option>
                    <option value="classification">Classification Model</option>
                    <option value="clustering">Clustering Model</option>
                    <option value="time_series">Time Series Model</option>
                    <option value="recommendation">Recommendation Model</option>
                    <option value="anomaly_detection">Anomaly Detection</option>
                  </Select>
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Description</Text>
                  <Textarea placeholder="Describe what this model will predict or analyze..." />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Data Sources</Text>
                  <Select placeholder="Select data sources" multiple>
                    <option value="campaigns">Campaign Data</option>
                    <option value="analytics">Analytics Data</option>
                    <option value="crm">CRM Data</option>
                    <option value="social">Social Media Data</option>
                    <option value="sales">Sales Data</option>
                    <option value="customer">Customer Data</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onModelClose}>Cancel</Button>
                  <Button variant="brand">Create Model</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
              </StandardPageLayout>
      </Layout>
    );
  }

export default AnalyticsPage;