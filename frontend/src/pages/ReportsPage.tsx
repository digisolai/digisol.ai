import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Spinner,
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
  StatHelpText,
  useToast,
  Alert,
  AlertIcon,
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
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiDownload,
  FiShare2,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlay,
  FiRefreshCw,
  FiDollarSign,
  FiEdit,
} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { StandardPageLayout, StandardPageHeader } from "../components/StandardPageLayout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import type { AIProfile } from "../types/ai";

// Types for Quantia Reports
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  template_type_display: string;
  configuration: unknown;
  is_global: boolean;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  template?: ReportTemplate;
  configuration: unknown;
  schedule_config: unknown;
  is_scheduled: boolean;
  created_at: string;
  updated_at: string;
  last_generated?: string;
}

interface QuantiaInsight {
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  recommendations: string[];
  related_data: unknown;
}

interface DashboardSummary {
  email_open_rate: number;
  click_through_rate: number;
  conversion_rate: number;
  total_campaigns: number;
  active_leads: number;
  revenue_generated: number;
}

interface ReportExecution {
  id: string;
  report: SavedReport;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: unknown;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantiaAgent, setQuantiaAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // Quantia Reports State
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ReportExecution[]>([]);
  const [quantiaInsights, setQuantiaInsights] = useState<QuantiaInsight[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  
  const toast = useToast();

  useEffect(() => {
    fetchReportData();
    fetchQuantiaAgent();
    fetchReportTemplates();
    fetchSavedReports();
    fetchRecentExecutions();
    fetchQuantiaInsights();
  }, []);

  async function fetchQuantiaAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=reporting_insights&is_global=true');
      if (res.data && res.data.length > 0) {
        setQuantiaAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setQuantiaAgent({
          id: "quantia",
          name: "Quantia",
          specialization: "reporting_insights",
          personality_description: "Analytical, precise, and visually-oriented. Quantia excels at presenting complex data clearly and extracting actionable insights from your marketing reports.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Quantia agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setQuantiaAgent({
        id: "quantia",
        name: "Quantia",
        specialization: "reporting_insights",
        personality_description: "Analytical, precise, and visually-oriented. Quantia excels at presenting complex data clearly and extracting actionable insights from your marketing reports.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskQuantia = async (question: string) => {
    try {
      const response = await api.post('/analytics/quantia/insights/', { question });
      toast({
        title: "Quantia's Analysis",
        description: response.data.answer,
        status: "success",
        duration: 8000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to get Quantia's analysis at this time.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  async function fetchReportData() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/analytics/dashboard-summary/");
      setSummary(res.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load report data.";
      setError(errorMessage);
      // Placeholder data if API fails
      setSummary({
        email_open_rate: 24.5,
        click_through_rate: 3.2,
        conversion_rate: 1.8,
        total_campaigns: 12,
        active_leads: 847,
        revenue_generated: 45600,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchReportTemplates() {
    try {
      const res = await api.get('/analytics/report-templates/');
      setReportTemplates(res.data);
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
    }
  }

  async function fetchSavedReports() {
    try {
      const res = await api.get('/analytics/saved-reports/');
      setSavedReports(res.data);
    } catch (error) {
      console.error('Failed to fetch saved reports:', error);
    }
  }

  async function fetchRecentExecutions() {
    try {
      const res = await api.get('/analytics/report-executions/');
      setRecentExecutions(res.data.slice(0, 5)); // Get last 5 executions
    } catch (error) {
      console.error('Failed to fetch recent executions:', error);
    }
  }

  async function fetchQuantiaInsights() {
    try {
      const res = await api.get('/analytics/quantia/insights/');
      setQuantiaInsights(res.data);
    } catch (error) {
      console.error('Failed to fetch Quantia insights:', error);
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    try {
      await api.post(`/analytics/saved-reports/${reportId}/generate/`);
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated. You'll be notified when it's ready.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      fetchRecentExecutions();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle />;
      case 'running': return <FiRefreshCw />;
      case 'failed': return <FiAlertTriangle />;
      default: return <FiClock />;
    }
  };

  return (
    <Layout>
      <StandardPageLayout
        title=""
        breadcrumbItems={[{ label: "Reports & Analytics" }]}
      >
        <StandardPageHeader
          title="Reports & Analytics"
          actionButton={
            <Button
              leftIcon={<FiPlus />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              onClick={onCreateOpen}
              size="md"
            >
              Create New Report
            </Button>
          }
        />
        
        {/* Quantia AI Agent Section */}
        <AIAgentSection
          agent={quantiaAgent} 
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskQuantia}
        />
        
        {loading ? (
          <Spinner />
        ) : error ? (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Tabs index={parseInt(activeTab)} onChange={(index) => setActiveTab(index.toString())}>
            <TabList mb={6}>
              <Tab>Dashboard</Tab>
              <Tab>Report Library</Tab>
              <Tab>Recent Reports</Tab>
              <Tab>Insights Hub</Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Key Metrics */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Key Performance Metrics</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      <Stat>
                        <StatLabel>Email Open Rate</StatLabel>
                        <StatNumber color="brand.accent">{summary?.email_open_rate}%</StatNumber>
                        <StatHelpText>Last 30 days</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Click-Through Rate</StatLabel>
                        <StatNumber color="brand.accent">{summary?.click_through_rate}%</StatNumber>
                        <StatHelpText>Last 30 days</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Conversion Rate</StatLabel>
                        <StatNumber color="brand.accent">{summary?.conversion_rate}%</StatNumber>
                        <StatHelpText>Last 30 days</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Campaigns</StatLabel>
                        <StatNumber color="brand.accent">{summary?.total_campaigns}</StatNumber>
                        <StatHelpText>Active campaigns</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Active Leads</StatLabel>
                        <StatNumber color="brand.accent">{summary?.active_leads}</StatNumber>
                        <StatHelpText>In pipeline</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Revenue Generated</StatLabel>
                        <StatNumber color="brand.accent">${summary?.revenue_generated?.toLocaleString()}</StatNumber>
                        <StatHelpText>This month</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </Box>

                  {/* Quick Actions */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Quick Actions</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Card cursor="pointer" onClick={onCreateOpen} _hover={{ shadow: "lg" }}>
                        <CardBody textAlign="center">
                          <FiBarChart2 size={32} color="#3182CE" />
                          <Text mt={2} fontWeight="medium">Create Report</Text>
                        </CardBody>
                      </Card>
                      <Card cursor="pointer" _hover={{ shadow: "lg" }}>
                        <CardBody textAlign="center">
                          <FiTrendingUp size={32} color="#38A169" />
                          <Text mt={2} fontWeight="medium">View Trends</Text>
                        </CardBody>
                      </Card>
                      <Card cursor="pointer" _hover={{ shadow: "lg" }}>
                        <CardBody textAlign="center">
                          <FiUsers size={32} color="#D69E2E" />
                          <Text mt={2} fontWeight="medium">Audience Analysis</Text>
                        </CardBody>
                      </Card>
                      <Card cursor="pointer" _hover={{ shadow: "lg" }}>
                        <CardBody textAlign="center">
                          <FiDollarSign size={32} color="#E53E3E" />
                          <Text mt={2} fontWeight="medium">ROI Report</Text>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </Box>

                  {/* Recent Activity */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Recent Report Activity</Heading>
                    <Card>
                      <CardBody>
                        {recentExecutions.length > 0 ? (
                          <VStack spacing={3} align="stretch">
                            {recentExecutions.map((execution) => (
                              <HStack key={execution.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{execution.report.name}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {new Date(execution.started_at).toLocaleDateString()}
                                  </Text>
                                </VStack>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(execution.status)}>
                                    {execution.status}
                                  </Badge>
                                  {getStatusIcon(execution.status)}
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.500" textAlign="center">No recent report activity</Text>
                        )}
                      </CardBody>
                    </Card>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Report Library Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Report Templates */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Report Templates</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {reportTemplates.map((template) => (
                        <Card key={template.id} cursor="pointer" onClick={onCreateOpen} _hover={{ shadow: "lg" }}>
                          <CardHeader>
                            <HStack justify="space-between">
                              <Heading size="sm">{template.name}</Heading>
                              <Badge colorScheme="brand">{template.template_type_display}</Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                              {template.description}
                            </Text>
                            <Button size="sm" variant="brand" width="full">
                              Use Template
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>

                  {/* Saved Reports */}
                  <Box>
                    <Heading size="md" color="brand.primary" mb={4}>Your Saved Reports</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {savedReports.map((report) => (
                        <Card key={report.id}>
                          <CardHeader>
                            <HStack justify="space-between">
                              <Heading size="sm">{report.name}</Heading>
                              {report.is_scheduled && (
                                <Badge colorScheme="green">Scheduled</Badge>
                              )}
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                              {report.description || "No description"}
                            </Text>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="brand"
                                leftIcon={<FiPlay />}
                                onClick={() => handleGenerateReport(report.id)}
                              >
                                Generate
                              </Button>
                              <IconButton
                                size="sm"
                                icon={<FiEye />}
                                aria-label="View report"
                                onClick={() => {
                                  setSelectedReport(report);
                                  onReportOpen();
                                }}
                              />
                              <IconButton
                                size="sm"
                                icon={<FiEdit />}
                                aria-label="Edit report"
                              />
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Recent Reports Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="brand.primary" mb={4}>Recently Generated Reports</Heading>
                  <Card>
                    <CardBody>
                      {recentExecutions.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {recentExecutions.map((execution) => (
                            <Box key={execution.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={3}>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{execution.report.name}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Generated on {new Date(execution.started_at).toLocaleDateString()}
                                  </Text>
                                </VStack>
                                <HStack>
                                  <Badge colorScheme={getStatusColor(execution.status)}>
                                    {execution.status}
                                  </Badge>
                                  {getStatusIcon(execution.status)}
                                </HStack>
                              </HStack>
                              
                              {execution.status === 'completed' && (
                                <HStack spacing={2}>
                                  <Button size="sm" leftIcon={<FiDownload />}>
                                    Download PDF
                                  </Button>
                                  <Button size="sm" leftIcon={<FiShare2 />}>
                                    Share
                                  </Button>
                                  <Button size="sm" leftIcon={<FiEye />}>
                                    View
                                  </Button>
                                </HStack>
                              )}
                              
                              {execution.status === 'failed' && (
                                <Alert status="error" mt={3}>
                                  <AlertIcon />
                                  {execution.error_message || 'Report generation failed'}
                                </Alert>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500" textAlign="center">No recent reports generated</Text>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Insights Hub Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="brand.primary" mb={4}>Quantia's Insights Hub</Heading>
                  
                  {/* Top Insights */}
                  <Box>
                    <Heading size="sm" color="brand.primary" mb={4}>Top Insights</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {quantiaInsights.map((insight, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <HStack justify="space-between">
                              <Heading size="sm">{insight.title}</Heading>
                                                                <Badge colorScheme="brand">{insight.insight_type}</Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <Text fontSize="sm" mb={4}>{insight.description}</Text>
                            <Progress value={insight.confidence_score * 100} mb={3} />
                            <Text fontSize="xs" color="gray.600">
                              Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                            </Text>
                            <Box mt={4}>
                              <Text fontSize="sm" fontWeight="medium" mb={2}>Recommendations:</Text>
                              <List spacing={1}>
                                {insight.recommendations.map((rec, recIndex) => (
                                  <ListItem key={recIndex} fontSize="sm">
                                    <ListIcon as={FiCheckCircle} color="green.500" />
                                    {rec}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>

                  {/* Ask Quantia */}
                  <Box>
                    <Heading size="sm" color="brand.primary" mb={4}>Ask Quantia</Heading>
                    <Card>
                      <CardBody>
                        <VStack spacing={4}>
                          <Text fontSize="sm" color="gray.600">
                            Ask Quantia any question about your data and get AI-powered insights.
                          </Text>
                          <HStack width="full">
                            <Input placeholder="e.g., Why did my conversion rate drop last week?" />
                            <Button variant="brand">Ask</Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

        {/* Create Report Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Report</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Report Name</Text>
                  <Input placeholder="Enter report name" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Description</Text>
                  <Textarea placeholder="Enter report description" />
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Template Type</Text>
                  <Select placeholder="Select template">
                    {reportTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box width="full">
                  <Text mb={2} fontWeight="medium">Date Range</Text>
                  <Select placeholder="Select date range">
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="custom">Custom range</option>
                  </Select>
                </Box>
                <HStack width="full" justify="flex-end" spacing={3}>
                  <Button onClick={onCreateClose}>Cancel</Button>
                  <Button variant="brand">Create Report</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* View Report Modal */}
        <Modal isOpen={isReportOpen} onClose={onReportClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedReport?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedReport && (
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Description</Text>
                    <Text>{selectedReport.description || "No description available"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>Configuration</Text>
                    <Card>
                      <CardBody>
                        <Text fontSize="sm" fontFamily="mono">
                          {JSON.stringify(selectedReport.configuration, null, 2)}
                        </Text>
                      </CardBody>
                    </Card>
                  </Box>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Created: {new Date(selectedReport.created_at).toLocaleDateString()}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Last updated: {new Date(selectedReport.updated_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </StandardPageLayout>
    </Layout>
  );
} 