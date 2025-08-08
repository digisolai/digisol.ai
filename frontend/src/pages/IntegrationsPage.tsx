import {useState, useEffect} from "react"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { StandardPageLayout, StandardPageHeader } from "../components/StandardPageLayout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import { 
  FiSettings, FiPlus, FiActivity, FiZap, FiDatabase, FiRefreshCw
} from "react-icons/fi";
import type { AIProfile } from "../types/ai";

// Simple interfaces for the frontend
interface IntegrationProvider {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string;
  auth_type: string;
  webhook_support: boolean;
  is_active: boolean;
}

interface Integration {
  id: string;
  name: string;
  provider: IntegrationProvider;
  status: string;
  health_score: number;
  health_status: string;
  sync_status: string;
  api_usage_percentage: number;
}

interface HealthSummary {
  total_integrations: number;
  connected_integrations: number;
  error_integrations: number;
  overall_health_score: number;
  api_usage_summary: {
    total_calls: number;
    total_limit: number;
    near_limit: number;
  };
  recommendations: unknown[];
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const [aiAgent, setAiAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const iconBg = "brand.primary.50";

  useEffect(() => {
    fetchData();
    fetchAIAgent();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const [integrationsRes, providersRes, healthRes] = await Promise.all([
        api.get("/integrations/integrations/"),
        api.get("/integrations/providers/"),
        api.get("/integrations/integrations/health_summary/"),
      ]);

      setIntegrations(integrationsRes.data.results || integrationsRes.data || []);
      setProviders(providersRes.data.results || providersRes.data || []);
      setHealthSummary(healthRes.data);
    } catch (err: unknown) {
      console.error("Failed to fetch integrations data:", err);
      setError(err.response?.data?.message || "Failed to load integrations");
      loadPlaceholderData();
    } finally {
      setLoading(false);
    }
  }

  function loadPlaceholderData() {
    const placeholderProviders: IntegrationProvider[] = [
      {
        id: "1",
        name: "hubspot",
        display_name: "HubSpot",
        category: "crm",
        description: "CRM and marketing automation platform",
        auth_type: "oauth2",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "2",
        name: "salesforce",
        display_name: "Salesforce",
        category: "crm",
        description: "Customer relationship management platform",
        auth_type: "oauth2",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "3",
        name: "mailchimp",
        display_name: "Mailchimp",
        category: "email",
        description: "Email marketing platform",
        auth_type: "api_key",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "4",
        name: "slack",
        display_name: "Slack",
        category: "communication",
        description: "Team communication platform",
        auth_type: "oauth2",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "5",
        name: "google_ads",
        display_name: "Google Ads",
        category: "advertising",
        description: "Digital advertising platform",
        auth_type: "oauth2",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "6",
        name: "facebook_ads",
        display_name: "Facebook Ads",
        category: "advertising",
        description: "Social media advertising platform",
        auth_type: "oauth2",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "7",
        name: "zapier",
        display_name: "Zapier",
        category: "automation",
        description: "Workflow automation platform",
        auth_type: "api_key",
        webhook_support: true,
        is_active: true,
      },
      {
        id: "8",
        name: "legacy",
        display_name: "Legacy Integration",
        category: "other",
        description: "Legacy system integration",
        auth_type: "api_key",
        webhook_support: false,
        is_active: true,
      }
    ];

    const placeholderIntegrations: Integration[] = [
      {
        id: "1",
        name: "Salesforce CRM",
        provider: placeholderProviders[1],
        status: "connected",
        health_score: 95,
        health_status: "healthy",
        sync_status: "Last sync: 2 hours ago",
        api_usage_percentage: 65,
      },
      {
        id: "2",
        name: "HubSpot Marketing",
        provider: placeholderProviders[0],
        status: "connected",
        health_score: 88,
        health_status: "healthy",
        sync_status: "Last sync: 3 hours ago",
        api_usage_percentage: 42,
      },
    ];

    const placeholderHealthSummary: HealthSummary = {
      total_integrations: 2,
      connected_integrations: 2,
      error_integrations: 0,
      overall_health_score: 91.5,
      api_usage_summary: {
        total_calls: 1250,
        total_limit: 5000,
        near_limit: 0,
      },
      recommendations: [
        {
          title: "Optimize API Usage",
          description: "Consider implementing caching to reduce API calls",
        },
      ],
    };

    setIntegrations(placeholderIntegrations);
    setHealthSummary(placeholderHealthSummary);
    setProviders(placeholderProviders);
  }

  async function fetchAIAgent() {
    try {
      setLoadingAgent(true);
      setAgentError(null);
      
      const response = await api.get("/ai-services/profiles/");
      const agents = response.data.results || response.data;
      
      const connectusAgent = agents.find(
        (agent: unknown) => agent.name === "Connectus" && agent.specialization === "integrations_management"
      );
      
      if (connectusAgent) {
        setAiAgent(connectusAgent);
      } else {
        const fallbackAgent: AIProfile = {
          id: "connectus-fallback",
          name: "Connectus",
          specialization: "integrations_management",
          personality_description: "The bridge builder of your digital ecosystem. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.",
          is_active: true,
          is_global: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAiAgent(fallbackAgent);
        console.log("Using fallback Connectus agent");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch AI agent:", err);
      const fallbackAgent: AIProfile = {
        id: "connectus-fallback",
        name: "Connectus",
        specialization: "integrations_management",
        personality_description: "The bridge builder of your digital ecosystem. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.",
        is_active: true,
        is_global: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAiAgent(fallbackAgent);
      setAgentError("Using fallback Connectus agent");
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskConnectus = async (question: string) => {
    if (!question.trim()) return;

    try {
      setLoadingAgent(true);
      const response = await api.post("/integrations/connectus/ask_connectus/", {
        query: question,
      });

      toast({
        title: "Connectus Response",
        description: response.data.answer,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: "Failed to get response from Connectus",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      const response = await api.post(`/integrations/integrations/${integrationId}/test_connection/`);
      toast({
        title: "Connection Test",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      toast({
        title: "Connection Test Failed",
        description: "Failed to test connection",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    try {
      const response = await api.post(`/integrations/integrations/${integrationId}/sync_now/`);
      toast({
        title: "Sync Initiated",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      toast({
        title: "Sync Failed",
        description: "Failed to initiate sync",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      case 'pending': return 'yellow';
      case 'error': return 'red';
      case 'configuring': return 'blue';
      default: return 'gray';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'green.500';
    if (score >= 70) return 'yellow.500';
    return 'red.500';
  };

  return (
    <Layout>
      <StandardPageLayout
        title=""
        breadcrumbItems={[{ label: "Integrations" }]}
      >
        <StandardPageHeader
          title="Integration-Digital Ecosystem Bridge"
          actionButton={
            <Button
              leftIcon={<FiPlus />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              onClick={onOpen}
            >
              Add Integration
            </Button>
          }
        />

          {/* Connectus AI Assistant */}
          <AIAgentSection
            agent={aiAgent} 
            loading={loadingAgent}
            error={agentError}
            onAskQuestion={handleAskConnectus}
          />

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Health Summary Cards */}
          {healthSummary && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Overall Health</StatLabel>
                    <StatNumber color={getHealthColor(healthSummary.overall_health_score)}>
                      {healthSummary.overall_health_score}%
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      System health
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Connected</StatLabel>
                    <StatNumber>{healthSummary.connected_integrations}</StatNumber>
                    <StatHelpText>
                      Active integrations
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total</StatLabel>
                    <StatNumber>{healthSummary.total_integrations}</StatNumber>
                    <StatHelpText>
                      All integrations
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>API Usage</StatLabel>
                    <StatNumber>
                      {Math.round((healthSummary.api_usage_summary.total_calls / healthSummary.api_usage_summary.total_limit) * 100)}%
                    </StatNumber>
                    <StatHelpText>
                      {healthSummary.api_usage_summary.total_calls} / {healthSummary.api_usage_summary.total_limit} calls
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList>
              <Tab>Integrations</Tab>
              <Tab>Data Flows</Tab>
              <Tab>Workflows</Tab>
              <Tab>Health Logs</Tab>
            </TabList>

            <TabPanels>
              {/* Integrations Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {loading ? (
                    <Box textAlign="center" py={8}>
                      <Spinner size="lg" color="brand.primary" />
                      <Text mt={4} color="brand.neutral.600">Loading integrations...</Text>
                    </Box>
                  ) : integrations.length === 0 ? (
                    <Card>
                      <CardBody textAlign="center" py={12}>
                        <VStack spacing={4}>
                          <FiDatabase size={48} color="gray.400" />
                          <Text color="gray.500" fontSize="lg">
                            No integrations connected yet
                          </Text>
                          <Text color="gray.400">
                            Start by adding your first integration to connect your digital ecosystem
                          </Text>
                                                     <Button
                             leftIcon={<FiPlus />}
                             bg="brand.primary"
                             color="brand.accent"
                             fontWeight="bold"
                             _hover={{ bg: "brand.600" }}
                             _active={{ bg: "brand.700" }}
                             onClick={onOpen}
                           >
                             Add Your First Integration
                           </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {integrations.map((integration) => (
                        <Card key={integration.id} variant="outline" cursor="pointer" 
                              onClick={() => setSelectedIntegration(integration)}
                              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} 
                              transition="all 0.2s">
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">{integration.name}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {integration.provider.display_name}
                                  </Text>
                                </VStack>
                                <Box
                                  w={10}
                                  h={10}
                                  bg={iconBg}
                                  borderRadius="md"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Text fontSize="xs" fontWeight="bold" color="brand.primary">
                                    {integration.provider.display_name.charAt(0)}
                                  </Text>
                                </Box>
                              </HStack>

                              <HStack spacing={2}>
                                <Badge colorScheme={getStatusColor(integration.status)} size="sm">
                                  {integration.status}
                                </Badge>
                                <Badge colorScheme={getHealthColor(integration.health_score)} size="sm">
                                  {integration.health_status}
                                </Badge>
                              </HStack>

                              <Text fontSize="sm" color="brand.neutral.600">
                                {integration.provider.description}
                              </Text>

                              <VStack spacing={2} align="stretch">
                                <Text fontSize="xs" color="brand.neutral.500">
                                  {integration.sync_status}
                                </Text>
                                
                                <Box>
                                  <Text fontSize="xs" color="brand.neutral.500" mb={1}>
                                    API Usage: {integration.api_usage_percentage.toFixed(1)}%
                                  </Text>
                                  <Progress 
                                    value={integration.api_usage_percentage} 
                                    size="sm" 
                                    colorScheme={integration.api_usage_percentage > 80 ? "red" : "blue"}
                                  />
                                </Box>

                                                                 <HStack spacing={2}>
                                   <Button
                                     size="sm"
                                     bg="brand.primary"
                                     color="brand.accent"
                                     fontWeight="bold"
                                     _hover={{ bg: "brand.600" }}
                                     _active={{ bg: "brand.700" }}
                                     leftIcon={<FiActivity />}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleTestConnection(integration.id);
                                     }}
                                   >
                                     Test
                                   </Button>
                                   <Button
                                     size="sm"
                                     bg="brand.primary"
                                     color="brand.accent"
                                     fontWeight="bold"
                                     _hover={{ bg: "brand.600" }}
                                     _active={{ bg: "brand.700" }}
                                     leftIcon={<FiRefreshCw />}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleSyncNow(integration.id);
                                     }}
                                   >
                                     Sync
                                   </Button>
                                  <IconButton
                                    size="sm"
                                    icon={<FiSettings />}
                                    aria-label="Configure integration"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedIntegration(integration);
                                    }}
                                  />
                                </HStack>
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>

              {/* Data Flows Tab */}
              <TabPanel>
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <FiDatabase size={48} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No data flows configured yet
                      </Text>
                      <Text color="gray.400">
                        Data flows will appear here once you configure integrations
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Workflows Tab */}
              <TabPanel>
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <FiZap size={48} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No workflows configured yet
                      </Text>
                      <Text color="gray.400">
                        Workflow automations will appear here once you set them up
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Health Logs Tab */}
              <TabPanel>
                <Card>
                  <CardBody textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <FiActivity size={48} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No health logs available
                      </Text>
                      <Text color="gray.400">
                        Health logs will appear here as integrations are monitored
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
                     </Tabs>

      {/* Integration Detail Drawer */}
      <Drawer isOpen={!!selectedIntegration} placement="right" onClose={() => setSelectedIntegration(null)} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedIntegration?.name} - Details
          </DrawerHeader>
          <DrawerBody>
            {selectedIntegration && (
              <VStack spacing={6} align="stretch">
                {/* Integration Info */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Integration Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Provider:</Text>
                        <Text>{selectedIntegration.provider.display_name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Status:</Text>
                        <Badge colorScheme={getStatusColor(selectedIntegration.status)}>
                          {selectedIntegration.status}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Health Score:</Text>
                        <Text color={getHealthColor(selectedIntegration.health_score)}>
                          {selectedIntegration.health_score}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Last Sync:</Text>
                        <Text>{selectedIntegration.sync_status}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Actions</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3}>
                                             <Button
                         leftIcon={<FiActivity />}
                         colorScheme="blue"
                         width="full"
                         onClick={() => selectedIntegration && handleTestConnection(selectedIntegration.id)}
                       >
                         Test Connection
                       </Button>
                       <Button
                         leftIcon={<FiRefreshCw />}
                         colorScheme="green"
                         width="full"
                         onClick={() => selectedIntegration && handleSyncNow(selectedIntegration.id)}
                       >
                         Sync Now
                       </Button>
                      <Button
                        leftIcon={<FiSettings />}
                        variant="outline"
                        width="full"
                      >
                        Configure
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Add Integration Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add New Integration</DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch">
              <Text color="gray.600">
                Choose an integration provider to connect to your DigiSol.AI ecosystem.
              </Text>
              
              {providers.length === 0 ? (
                <Card>
                  <CardBody textAlign="center" py={8}>
                    <VStack spacing={4}>
                      <FiDatabase size={48} color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        No integration providers available
                      </Text>
                      <Text color="gray.400">
                        Integration providers will appear here once they are configured
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {providers.map((provider) => (
                    <Card key={provider.id} variant="outline" cursor="pointer" 
                          onClick={() => {
                            toast({
                              title: "Coming Soon",
                              description: `Integration with ${provider.display_name} will be available soon!`,
                              status: "info",
                              duration: 3000,
                              isClosable: true,
                            });
                          }}
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                          transition="all 0.2s">
                      <CardBody>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="bold">{provider.display_name}</Text>
                            <Badge colorScheme="blue" size="sm">
                              {provider.auth_type}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {provider.description}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="gray" size="sm">
                              {provider.category}
                            </Badge>
                            {provider.webhook_support && (
                              <Badge colorScheme="green" size="sm">
                                Webhooks
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      </StandardPageLayout>
    </Layout>
  );
} 