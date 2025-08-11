// frontend/src/pages/AIOverviewPage.tsx
import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Icon,
  Avatar,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import api from "../services/api";
import ContextualAIChat from "../components/ContextualAIChat";
import { 
  FiCpu, 
  FiZap, 
  FiEye, 
  FiTarget, 
  FiTrendingUp, 
  FiShield, 
  FiGlobe, 
  FiBook, 
  FiSettings,
  FiBarChart,
  FiUsers,
  FiDollarSign,
  FiSend,
  FiActivity,
  FiAlertTriangle,

  FiStar,
  FiArrowRight,
  FiCommand,

  FiMonitor,

  FiMapPin,

  FiRefreshCw,

} from "react-icons/fi";

interface AIProfile {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  api_model_name: string;
  is_active: boolean;
  is_global: boolean;
}

interface AITask {
  id: string;
  objective: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'delegated';
  assignee_agent: AIProfile;
  requester: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  context_data: Record<string, unknown>;
  result_data: Record<string, unknown> | null;
  has_sub_tasks: boolean;
  all_sub_tasks_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AIRecommendation {
  id: string;
  type: string;
  recommendation_text: string;
  context_data: Record<string, unknown>;
  is_dismissed: boolean;
  is_actioned: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  generated_by_agent?: AIProfile;
  created_at: string;
}

interface StructuraInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  created_at: string;
  actionable: boolean;
  action_text?: string;
}

interface AIEcosystemHealth {
  overall_score: number;
  active_agents: number;
  total_agents: number;
  system_status: 'optimal' | 'good' | 'attention' | 'critical';
  last_updated: string;
  agent_statuses: Array<{
    agent_id: string;
    agent_name: string;
    status: 'active' | 'learning' | 'optimizing' | 'needs_attention';
    performance_score: number;
    last_activity: string;
  }>;
}

export default function AIOverviewPage() {
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [activeRecommendations, setActiveRecommendations] = useState<AIRecommendation[]>([]);
  const [structuraInsights, setStructuraInsights] = useState<StructuraInsight[]>([]);
  const [ecosystemHealth, setEcosystemHealth] = useState<AIEcosystemHealth | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [askStructuraQuestion, setAskStructuraQuestion] = useState("");
  const [isAskingStructura, setIsAskingStructura] = useState(false);
  const [structuraResponse, setStructuraResponse] = useState<string | null>(null);

  // Modal states
  const { isOpen: isTaskDetailOpen, onOpen: onTaskDetailOpen, onClose: onTaskDetailClose } = useDisclosure();
  const { isOpen: isStructuraChatOpen, onOpen: onStructuraChatOpen, onClose: onStructuraChatClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [objective, setObjective] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAIProfiles(),
        fetchAITasks(),
        fetchRecommendations(),
        fetchStructuraAgent(),
        fetchStructuraInsights(),
        fetchEcosystemHealth(),
      ]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load AI Overview data");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAIProfiles() {
    try {
      const res = await api.get("/ai-services/profiles/");
      setAiProfiles(res.data);
      console.log(`✅ Loaded ${res.data.length} AI agents`);
    } catch (err: unknown) {
      console.error("Failed to fetch AI profiles:", err);
      throw err;
    }
  }

  async function fetchAITasks() {
    try {
      const res = await api.get("/ai-services/tasks/");
      setAiTasks(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch AI tasks:", err);
      throw err;
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await api.get("/ai-services/recommendations/");
      const allRecommendations = res.data;
      setActiveRecommendations(allRecommendations.filter((rec: AIRecommendation) => !rec.is_dismissed));
    } catch (err: unknown) {
      console.error("Failed to fetch recommendations:", err);
      throw err;
    }
  }

  async function fetchStructuraAgent() {
    try {
      const res = await api.get('/ai-services/profiles/?specialization=general_orchestration&is_global=true');
      if (res.data && res.data.length > 0) {
        console.log("✅ Loaded Structura agent");
      } else {
        console.log("⚠️ No Structura agent found, using fallback");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Structura agent:", err);
    }
  }

  async function fetchStructuraInsights() {
    try {
      const res = await api.get("/ai-services/structura-insights/");
      setStructuraInsights(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch Structura insights:", err);
      // Fallback to mock data if API fails
      const mockInsights: StructuraInsight[] = [
        {
          id: "1",
          type: "prediction",
          title: "Q4 Customer Engagement Surge",
          description: "Structura predicts a 15% increase in customer engagement for Q4 based on current campaign trends and social sentiment analysis.",
          confidence: 87,
          impact: "high",
          category: "engagement",
          created_at: new Date().toISOString(),
          actionable: true,
          action_text: "Review & Apply"
        },
        {
          id: "2",
          type: "recommendation",
          title: "Social Media Budget Reallocation",
          description: "Structura advises reallocating 10% of social media budget from Platform A to Platform B, as Sentiment AI detects higher positive brand mentions on B.",
          confidence: 92,
          impact: "medium",
          category: "budget",
          created_at: new Date().toISOString(),
          actionable: true,
          action_text: "Review & Apply"
        },
        {
          id: "3",
          type: "alert",
          title: "Churn Risk in Segment X",
          description: "Identified potential churn risk in Segment X (Retention AI). Structura suggests triggering proactive re-engagement campaigns via Catalyst, personalized by Engage.",
          confidence: 78,
          impact: "critical",
          category: "retention",
          created_at: new Date().toISOString(),
          actionable: true,
          action_text: "Take Action"
        }
      ];
      setStructuraInsights(mockInsights);
    }
  }

  async function fetchEcosystemHealth() {
    try {
      const res = await api.get("/ai-services/ecosystem-health/current/");
      setEcosystemHealth(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch ecosystem health:", err);
      // Fallback to mock data if API fails
      const mockHealth: AIEcosystemHealth = {
        overall_score: 92,
        active_agents: aiProfiles.filter(a => a.is_active).length,
        total_agents: aiProfiles.length,
        system_status: "optimal",
        last_updated: new Date().toISOString(),
        agent_statuses: aiProfiles.map(agent => ({
          agent_id: agent.id,
          agent_name: agent.name,
          status: agent.is_active ? "active" : "needs_attention",
          performance_score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          last_activity: new Date().toISOString()
        }))
      };
      setEcosystemHealth(mockHealth);
    }
  }

  async function handleAskStructura(e: React.FormEvent) {
    e.preventDefault();
    if (!askStructuraQuestion.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question for Structura.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAskingStructura(true);
    setStructuraResponse(null);

    try {
      // Call the AI planning API with Structura
      const response = await api.post('/ai-services/planning/', {
        objective: askStructuraQuestion,
        recommendation_type: 'strategic_analysis',
        priority: 'high',
        context: {
          user_question: askStructuraQuestion,
          timestamp: new Date().toISOString(),
          source: 'structura_chat'
        }
      });
      
      if (response.data) {
        setStructuraResponse(response.data.result?.analysis || "Structura has processed your question and provided strategic insights.");
        toast({
          title: "Structura Response",
          description: "Your question has been analyzed by Structura.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: unknown) {
      console.error('Structura chat error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get response from Structura';
      
      toast({
        title: "Structura Chat Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAskingStructura(false);
    }
  }

  async function handleGeneratePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!objective.trim()) {
      toast({
        title: "Objective required",
        description: "Please enter an objective for your AI plan.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log("Creating AI task with objective:", objective);
      const response = await api.post("/ai-services/tasks/", {
        objective: objective.trim(),
        context_data: {
          auto_delegate: true,
          priority: "medium"
        }
      });

      console.log("AI task created:", response.data);
      
      // Immediately update the UI with the new task
      const newTask: AITask = response.data;
      setAiTasks(prevTasks => [newTask, ...prevTasks]);
      
      setObjective("");
      toast({
        title: "AI Plan Generated!",
        description: "Your AI team is now working on your objective.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate AI plan";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleViewTaskDetail(task: AITask) {
    setSelectedTask(task);
    onTaskDetailOpen();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getAgentIcon = (agentName: string) => {
    const icons: Record<string, any> = {
    
      'Pecunia': FiDollarSign,
      'Scriptor': FiBook,
      'Catalyst': FiTrendingUp,
      'Prospero': FiUsers,
      'Structura': FiCpu,
      'Metrika': FiBarChart,
    
      'Connectus': FiGlobe,
      'Mentor': FiSettings
    };
    return icons[agentName] || FiCpu;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return FiTrendingUp;
      case 'recommendation': return FiTarget;
      case 'alert': return FiAlertTriangle;
      case 'opportunity': return FiStar;
      default: return FiActivity;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'blue';
      case 'recommendation': return 'green';
      case 'alert': return 'red';
      case 'opportunity': return 'yellow';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.primary" />
            <Text>Loading AI Overview...</Text>
          </VStack>
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>
          <Icon as={FiCpu} mr={2} />
          AI Overview: Structura Command Center
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Section 1: Structura's Command Center */}
        <Card mb={8} boxShadow="lg" border="1px solid" borderColor="brand.neutral.100">
          <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiCpu} fontSize="2xl" />
                <Box>
                  <Heading size="md">Structura - Central Intelligence Hub</Heading>
                  <Text fontSize="sm" opacity={0.8}>
                    Orchestrating {aiProfiles.length} AI agents across your digital ecosystem
                  </Text>
                </Box>
              </HStack>
              <Button
                size="sm"
                colorScheme="yellow"
                bg="brand.accent"
                color="brand.primary"
                leftIcon={<FiCommand />}
                onClick={onStructuraChatOpen}
              >
                Ask Structura
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              {/* Status & Summary */}
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">System Health & Performance</Text>
                  <Button size="sm" leftIcon={<FiRefreshCw />} onClick={fetchAllData} variant="brand">
                    Refresh
                  </Button>
                </HStack>
                
                {ecosystemHealth && (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                      <StatLabel>Overall Health</StatLabel>
                      <StatNumber color={ecosystemHealth.system_status === 'optimal' ? 'brand.accent' : 'orange.500'}>
                        {ecosystemHealth.overall_score}%
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type={ecosystemHealth.overall_score > 90 ? 'increase' : 'decrease'} />
                        {ecosystemHealth.system_status}
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Active Agents</StatLabel>
                      <StatNumber>{ecosystemHealth.active_agents}/{ecosystemHealth.total_agents}</StatNumber>
                      <StatHelpText>All systems operational</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Active Tasks</StatLabel>
                      <StatNumber>{aiTasks.filter(t => t.status === 'in_progress').length}</StatNumber>
                      <StatHelpText>Currently processing</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Insights</StatLabel>
                      <StatNumber>{structuraInsights.length}</StatNumber>
                      <StatHelpText>Strategic recommendations</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                )}

                {/* Top Structura Insights */}
                <Box>
                  <Text fontWeight="bold" mb={3}>Latest Strategic Insights</Text>
                  <VStack spacing={3} align="stretch">
                    {structuraInsights.slice(0, 3).map((insight) => {
                      const InsightIcon = getInsightIcon(insight.type);
                      return (
                        <Card key={insight.id} size="sm" borderLeft="4px solid" borderLeftColor={`${getInsightColor(insight.type)}.500`}>
                          <CardBody py={3}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={InsightIcon} color={`${getInsightColor(insight.type)}.500`} />
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm">{insight.title}</Text>
                                  <Text fontSize="xs" color="brand.neutral.600">{insight.description}</Text>
                                </Box>
                              </HStack>
                              <VStack spacing={1}>
                                <Badge colorScheme={getInsightColor(insight.type)} size="sm">
                                  {insight.confidence}% confidence
                                </Badge>
                                {insight.actionable && (
                                  <Button size="xs" colorScheme={getInsightColor(insight.type)}>
                                    {insight.action_text}
                                  </Button>
                                )}
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                </Box>
              </VStack>

              {/* Ask Structura Interface */}
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold">Ask Structura</Text>
                <Text fontSize="sm" color="brand.neutral.600">
                  Get strategic insights, predictions, and recommendations from your central AI intelligence.
                </Text>
                
                <VStack spacing={3}>
                  <Button
                    size="sm"
                    variant="brand"
                    leftIcon={<FiTarget />}
                    onClick={() => setAskStructuraQuestion("What are the top three growth opportunities for next year?")}
                  >
                    Growth Opportunities
                  </Button>
                  <Button
                    size="sm"
                    variant="brand"
                    leftIcon={<FiDollarSign />}
                    onClick={() => setAskStructuraQuestion("How can we reduce customer acquisition cost across all channels?")}
                  >
                    Cost Optimization
                  </Button>
                  <Button
                    size="sm"
                    variant="brand"
                    leftIcon={<FiTrendingUp />}
                    onClick={() => setAskStructuraQuestion("Analyze our social media performance and suggest improvements")}
                  >
                    Social Media Analysis
                  </Button>
                  <Button
                    size="sm"
                    variant="brand"
                    leftIcon={<FiMapPin />}
                    onClick={() => setAskStructuraQuestion("Generate a strategic plan for entering a new market")}
                  >
                    Market Entry Strategy
                  </Button>
                </VStack>

                <FormControl as="form" onSubmit={handleAskStructura}>
                  <FormLabel fontSize="sm">Custom Question</FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="Ask Structura anything..."
                      value={askStructuraQuestion}
                      onChange={(e) => setAskStructuraQuestion(e.target.value)}
                    />
                    <InputRightElement>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        isLoading={isAskingStructura}
                        onClick={handleAskStructura}
                      >
                        <Icon as={FiSend} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </VStack>
            </Grid>
          </CardBody>
        </Card>

        {/* Section 2: AI Agent Ecosystem Health & Performance */}
        <Card mb={8} boxShadow="lg" border="1px solid" borderColor="brand.neutral.100">
          <CardHeader bg="brand.neutral.50" borderBottom="1px solid" borderColor="brand.neutral.100">
            <Heading size="md" color="brand.primary">
              <Icon as={FiMonitor} mr={2} />
              AI Agent Ecosystem Health & Performance
            </Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {aiProfiles.map((agent) => {
                const AgentIcon = getAgentIcon(agent.name);
                const status = agent.is_active ? "Active" : "Inactive";
                const statusColor = agent.is_active ? "brand.accent" : "gray";
                
                return (
                  <Card key={agent.id} size="sm" _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }} transition="all 0.2s">
                    <CardHeader py={3}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={AgentIcon} color="brand.primary" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">{agent.name}</Text>
                            <Text fontSize="xs" color="brand.neutral.600">
                              {agent.specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme={statusColor} size="sm">
                          {status}
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody py={2}>
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="xs" color="brand.neutral.700" noOfLines={2}>
                          {agent.personality_description}
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="brand.neutral.500">
                            Model: {agent.api_model_name}
                          </Text>
                          <Badge bg="brand.accent" color="brand.primary" variant="outline" fontSize="xs">
                            {agent.is_global ? "Global" : "Tenant"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Section 3: Quick Plan Generation */}
        <Card mb={8} boxShadow="lg" border="1px solid" borderColor="brand.neutral.100">
          <CardHeader bg="brand.neutral.50" borderBottom="1px solid" borderColor="brand.neutral.100">
            <Heading size="md" color="brand.primary">
              <Icon as={FiTarget} mr={2} />
              Generate Strategic Plan with AI Team
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch" as="form" onSubmit={handleGeneratePlan}>
              <FormControl isRequired>
                <FormLabel htmlFor="plan-objective">What would you like your AI team to help you with?</FormLabel>
                <Textarea
                  id="plan-objective"
                  placeholder="e.g., Increase lead conversion rate for Q3 by 10% in SaaS. Or, Plan content strategy for a new product launch targeting SMBs."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={4}
                  bg="brand.neutral.50"
                />
              </FormControl>

              <Text fontSize="sm" color="brand.neutral.600">
                💡 Structura will automatically select the most appropriate AI agents based on your objective.
              </Text>

              <Button
                type="submit"
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.700" }}
                isLoading={isGenerating}
                loadingText="Generating Plan..."
                size="lg"
                leftIcon={<FiCpu />}
              >
                Generate AI-Powered Plan
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Section 4: Tabs for Tasks and Recommendations */}
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Active Tasks ({aiTasks.length})</Tab>
            <Tab>AI Recommendations ({activeRecommendations.length})</Tab>
            <Tab>Structura Insights ({structuraInsights.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Active Tasks Tab */}
            <TabPanel>
              {aiTasks.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiZap} fontSize="4xl" color="brand.neutral.300" mb={4} />
                  <Text color="brand.neutral.500">No active AI tasks. Create your first plan above!</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {aiTasks.map((task) => (
                    <Card key={task.id} boxShadow="md">
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm" color="brand.primary">{task.objective.substring(0, 50)}...</Heading>
                          <Badge colorScheme={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack>
                            <Avatar size="xs" name={task.assignee_agent?.name} />
                            <Text fontSize="sm" color="brand.neutral.600">
                              Assigned to: {task.assignee_agent?.name || 'Auto-assigned'}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="brand.neutral.700">
                            {task.objective}
                          </Text>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => handleViewTaskDetail(task)}
                            >
                              View Details
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* AI Recommendations Tab */}
            <TabPanel>
              {activeRecommendations.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiZap} fontSize="4xl" color="brand.neutral.300" mb={4} />
                  <Text color="brand.neutral.500">No active recommendations. Generate a plan to see AI insights!</Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {activeRecommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onDismiss={() => {}}
                      onActioned={() => {}}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* Structura Insights Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {structuraInsights.map((insight) => {
                  const InsightIcon = getInsightIcon(insight.type);
                  return (
                    <Card key={insight.id} borderLeft="4px solid" borderLeftColor={`${getInsightColor(insight.type)}.500`}>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Icon as={InsightIcon} color={`${getInsightColor(insight.type)}.500`} />
                              <Badge colorScheme={getInsightColor(insight.type)}>
                                {insight.type}
                              </Badge>
                              <Badge colorScheme={insight.impact === 'critical' ? 'red' : 'blue'} variant="outline">
                                {insight.impact} impact
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="brand.neutral.600">
                              {insight.confidence}% confidence
                            </Text>
                          </HStack>
                          
                          <Box>
                            <Text fontWeight="bold" mb={2}>{insight.title}</Text>
                            <Text>{insight.description}</Text>
                          </Box>
                          
                          {insight.actionable && (
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme={getInsightColor(insight.type)}
                                leftIcon={<FiArrowRight />}
                              >
                                {insight.action_text}
                              </Button>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Task Detail Modal */}
        <Modal isOpen={isTaskDetailOpen} onClose={onTaskDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Task Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedTask && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" color="brand.primary">Objective:</Text>
                    <Text>{selectedTask.objective}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="brand.primary">Status:</Text>
                    <Badge colorScheme={getStatusColor(selectedTask.status)}>
                      {selectedTask.status.replace('_', ' ')}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="brand.primary">Assigned AI Agent:</Text>
                    <Text>{selectedTask.assignee_agent?.name || 'Auto-assigned'}</Text>
                  </Box>
                  {selectedTask.result_data && (
                    <Box>
                      <Text fontWeight="bold" color="brand.primary">Results:</Text>
                      <Text>{JSON.stringify(selectedTask.result_data, null, 2)}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="brand" onClick={onTaskDetailClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Structura Chat Modal */}
        <Modal isOpen={isStructuraChatOpen} onClose={onStructuraChatClose} size="full">
          <ModalOverlay />
          <ModalContent maxW="90vw" maxH="70vh">
            <ModalHeader>
              <HStack>
                <Icon as={FiCpu} color="brand.primary" />
                <Text>Ask Structura</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <ContextualAIChat
                agentId="structura"
                agentName="Structura"
                agentSpecialization="strategic_planning"
                pageContext="ai_overview"
                pageData={{ 
                  aiProfiles, 
                  aiTasks, 
                  activeRecommendations, 
                  structuraInsights,
                  ecosystemHealth 
                }}
                onClose={onStructuraChatClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}

// Recommendation Card Component
const RecommendationCard = ({ recommendation, onDismiss, onActioned }: { 
  recommendation: AIRecommendation; 
  onDismiss: (id: string) => void; 
  onActioned: (id: string) => void 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Card boxShadow="md" border="1px solid" borderColor="brand.neutral.100">
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <HStack>
              <Badge colorScheme={getPriorityColor(recommendation.priority)}>
                {recommendation.priority}
              </Badge>
              <Badge colorScheme="blue" variant="outline">
                {recommendation.type.replace('_', ' ')}
              </Badge>
            </HStack>
            {recommendation.generated_by_agent && (
              <Text fontSize="sm" color="brand.neutral.600">
                by {recommendation.generated_by_agent.name}
              </Text>
            )}
          </HStack>
          
          <Text>{recommendation.recommendation_text}</Text>
          
          <HStack spacing={2}>
            {!recommendation.is_dismissed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDismiss(recommendation.id)}
              >
                Dismiss
              </Button>
            )}
            {!recommendation.is_actioned && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => onActioned(recommendation.id)}
              >
                Mark Actioned
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}; 