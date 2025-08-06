// frontend/src/pages/AIPlanningPage.tsx
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
  AlertTitle,
  AlertDescription,
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
  Progress,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import {
  FiCpu, 
  FiEye, 
  FiZap, 
  FiX, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiUsers,
  FiTarget,
  FiBarChart,
  FiMessageSquare,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiDollarSign,
  FiEdit3,
  FiUserCheck,
  FiSettings,
  FiBookOpen,
  FiPieChart,
  FiGrid,
  FiFolder,
  FiActivity,
  FiImage,
  FiFileText,
  FiInfo
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
  is_actionable: boolean;
  is_dismissed: boolean;
  is_actioned: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  generated_by_agent?: AIProfile;
  created_at: string;
}

export default function AIPlanningPage() {
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [activeRecommendations, setActiveRecommendations] = useState<AIRecommendation[]>([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<AIRecommendation[]>([]);
  const [aiAgent, setAiAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Modal states
  const { isOpen: isTaskDetailOpen, onOpen: onTaskDetailOpen, onClose: onTaskDetailClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [objective, setObjective] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Dashboard statistics
  const completedTasks = aiTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = aiTasks.filter(task => task.status === 'in_progress').length;
  const pendingTasks = aiTasks.filter(task => task.status === 'pending').length;
  const criticalRecommendations = activeRecommendations.filter(rec => rec.priority === 'critical').length;
  const highPriorityRecommendations = activeRecommendations.filter(rec => rec.priority === 'high').length;
  const completionRate = aiTasks.length > 0 ? (completedTasks / aiTasks.length) * 100 : 0;

  useEffect(() => {
    fetchAIProfiles();
    fetchAITasks();
    fetchRecommendations();
    fetchAIAgent();
  }, []);

  async function fetchAIProfiles() {
    try {
      setIsLoadingAgents(true);
      setError(null);
      const res = await api.get("/ai-services/profiles/");
      setAiProfiles(res.data);
      console.log(`✅ Loaded ${res.data.length} AI agents`);
    } catch (err: unknown) {
      console.error("Failed to fetch AI profiles:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load AI agents";
      setError(errorMessage);
      
      // Show toast notification
      toast({
        title: "Failed to load AI agents",
        description: "Please check your authentication and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingAgents(false);
    }
  }

  async function fetchAITasks() {
    try {
      const res = await api.get("/ai-services/tasks/");
      setAiTasks(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch AI tasks:", err);
    }
  }

  async function fetchRecommendations() {
    try {
      const res = await api.get("/ai-services/recommendations/");
      const allRecommendations = res.data;
      setActiveRecommendations(allRecommendations.filter((rec: AIRecommendation) => !rec.is_dismissed));
      setDismissedRecommendations(allRecommendations.filter((rec: AIRecommendation) => rec.is_dismissed));
    } catch (err: unknown) {
      console.error("Failed to fetch recommendations:", err);
    }
  }

  async function fetchAIAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=organizational_planning&is_global=true');
      if (res.data && res.data.length > 0) {
        setAiAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setAiAgent({
        id: "structura",
        name: "Structura",
        specialization: "organizational_planning",
        personality_description: "Orderly, collaborative, and efficiency-driven. Structura helps optimize your team structures, roles, and internal workflows for peak performance.",
        is_active: true,
        api_model_name: "gpt-4",
        is_global: true
      });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Structura agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setAiAgent({
        id: "structura",
        name: "Structura",
        specialization: "organizational_planning",
        personality_description: "Orderly, collaborative, and efficiency-driven. Structura helps optimize your team structures, roles, and internal workflows for peak performance.",
        is_active: true,
        api_model_name: "gpt-4",
        is_global: true
      });
    } finally {
      setLoadingAgent(false);
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

  async function handleDismiss(id: string) {
    try {
      await api.patch(`/ai-services/recommendations/${id}/`, {
        is_dismissed: true
      });
      
      setActiveRecommendations(prev => prev.filter(rec => rec.id !== id));
      setDismissedRecommendations(prev => {
        const dismissed = prev.find(rec => rec.id === id);
        return dismissed ? [...prev] : [...prev, { ...dismissed!, is_dismissed: true }];
      });
      
      toast({
        title: "Recommendation dismissed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to dismiss recommendation";
      toast({
        title: "Failed to dismiss",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function handleMarkActioned(id: string) {
    try {
      await api.patch(`/ai-services/recommendations/${id}/`, {
        is_actioned: true
      });
      
      setActiveRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, is_actioned: true } : rec
        )
      );
      
      toast({
        title: "Recommendation marked as actioned",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark as actioned";
      toast({
        title: "Failed to mark as actioned",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const handleAskAIAgent = async (question: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Call the AI planning API
      const response = await api.post('/ai-services/planning/', {
        objective: question,
        recommendation_type: 'campaign_optimization', // Default type
        priority: 'high',
        context: {
          user_question: question,
          timestamp: new Date().toISOString()
        }
      });
      
      if (response.data) {
        toast({
          title: "AI Planning Request Submitted",
          description: `Your question has been sent to the AI team. Task ID: ${response.data.task_id}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh the tasks list
        await fetchAITasks();
      }
    } catch (error: unknown) {
      console.error('AI Planning error:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to submit AI planning request';
      
      toast({
        title: "AI Planning Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  // Icon mapping for AI agent specializations (same as AIAgentSection)
  const getAgentIcon = (specialization: string) => {
    switch (specialization) {
      case 'marketing_strategy':
        return FiTarget;
      case 'budget_analysis':
        return FiDollarSign;
      case 'content_creation':
        return FiEdit3;
      case 'campaign_optimization':
        return FiTrendingUp;
      case 'lead_nurturing':
        return FiUsers;
      case 'general_orchestration':
        return FiZap;
      case 'data_analysis':
        return FiBarChart;
      case 'hr_management':
        return FiUserCheck;
      case 'integrations_management':
        return FiSettings;
      case 'learning_guidance':
        return FiBookOpen;
      case 'reporting_insights':
        return FiPieChart;
      case 'organizational_planning':
        return FiGrid;
      case 'automation_design':
        return FiCpu;
          case 'brand_identity':
      return FiImage;
      case 'template_curation':
        return FiFileText;
      case 'project_management':
        return FiFolder;
      default:
        return FiActivity;
    }
  };

  // Color mapping for AI agent specializations (same as AIAgentSection)
  const getAgentColor = (specialization: string) => {
    switch (specialization) {
      case 'marketing_strategy':
        return 'blue.500';
      case 'budget_analysis':
        return 'green.500';
      case 'content_creation':
        return 'purple.500';
      case 'campaign_optimization':
        return 'orange.500';
      case 'lead_nurturing':
        return 'teal.500';
      case 'general_orchestration':
        return 'brand.primary';
      case 'data_analysis':
        return 'cyan.500';
      case 'hr_management':
        return 'pink.500';
      case 'integrations_management':
        return 'gray.500';
      case 'learning_guidance':
        return 'yellow.500';
      case 'reporting_insights':
        return 'indigo.500';
      case 'organizational_planning':
        return 'brand.primary';
      case 'automation_design':
        return 'red.500';
      case 'brand_identity':
        return 'brand.accent';
      case 'template_curation':
        return 'blue.400';
      case 'project_management':
        return 'green.400';
      default:
        return 'brand.primary';
    }
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Header Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="lg" color="brand.primary" mb={2}>
                <Icon as={FiZap} mr={3} color="brand.accent" />
                AI Planning & Orchestration
              </Heading>
              <Text color="brand.neutral.600" fontSize="lg">
                Intelligent automation and strategic planning powered by your AI team
              </Text>
            </Box>
            <Tooltip label="Refresh dashboard data">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCw />}
                colorScheme="brand"
                variant="outline"
                onClick={() => {
                  fetchAIProfiles();
                  fetchAITasks();
                  fetchRecommendations();
                }}
              />
            </Tooltip>
          </Flex>
        </Box>

        {/* Dashboard Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg="white" boxShadow="md" borderLeft="4px solid" borderLeftColor="brand.primary">
            <CardBody>
              <Stat>
                <StatLabel color="brand.neutral.600" fontSize="sm">
                  <Icon as={FiTarget} mr={2} />
                  Total Tasks
                </StatLabel>
                <StatNumber color="brand.primary" fontSize="2xl">{aiTasks.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {completionRate.toFixed(1)}% completion rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="white" boxShadow="md" borderLeft="4px solid" borderLeftColor="green.500">
            <CardBody>
              <Stat>
                <StatLabel color="brand.neutral.600" fontSize="sm">
                  <Icon as={FiCheckCircle} mr={2} />
                  Completed
                </StatLabel>
                <StatNumber color="green.500" fontSize="2xl">{completedTasks}</StatNumber>
                <StatHelpText>
                  Successfully delivered
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="white" boxShadow="md" borderLeft="4px solid" borderLeftColor="blue.500">
            <CardBody>
              <Stat>
                <StatLabel color="brand.neutral.600" fontSize="sm">
                  <Icon as={FiClock} mr={2} />
                  In Progress
                </StatLabel>
                <StatNumber color="blue.500" fontSize="2xl">{inProgressTasks}</StatNumber>
                <StatHelpText>
                  Currently being processed
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg="white" boxShadow="md" borderLeft="4px solid" borderLeftColor="orange.500">
            <CardBody>
              <Stat>
                <StatLabel color="brand.neutral.600" fontSize="sm">
                  <Icon as={FiAlertTriangle} mr={2} />
                  Critical Alerts
                </StatLabel>
                <StatNumber color="orange.500" fontSize="2xl">{criticalRecommendations}</StatNumber>
                <StatHelpText>
                  High priority recommendations
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Progress Overview */}
        <Card bg="white" boxShadow="md" mb={8}>
          <CardHeader>
            <Heading size="md" color="brand.primary">
              <Icon as={FiBarChart} mr={2} />
              Task Progress Overview
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="brand.neutral.600">Overall Completion</Text>
                  <Text fontSize="sm" fontWeight="bold" color="brand.primary">
                    {completionRate.toFixed(1)}%
                  </Text>
                </Flex>
                <Progress 
                  value={completionRate} 
                  colorScheme="brand" 
                  size="lg" 
                  borderRadius="full"
                  bg="brand.neutral.100"
                />
              </Box>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box textAlign="center" p={3} bg="green.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="green.600">{completedTasks}</Text>
                  <Text fontSize="sm" color="green.600">Completed</Text>
                </Box>
                <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">{inProgressTasks}</Text>
                  <Text fontSize="sm" color="blue.600">In Progress</Text>
                </Box>
                <Box textAlign="center" p={3} bg="yellow.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" color="yellow.600">{pendingTasks}</Text>
                  <Text fontSize="sm" color="yellow.600">Pending</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Structura - AI Orchestrator */}
        <AIAgentSection
          agent={aiAgent} 
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskAIAgent}
        />

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* AI Agents Overview - Always Visible */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color="brand.primary">
              <Icon as={FiUsers} mr={2} />
              Your AI Team
            </Heading>
            <Tooltip label="View AI agent specializations">
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                leftIcon={<Icon as={FiInfo} />}
                onClick={() => {
                  toast({
                    title: "AI Agent Specializations",
                    description: "Each AI agent has a unique specialization and personalized icon. Hover over agents to see their expertise areas.",
                    status: "info",
                    duration: 6000,
                    isClosable: true,
                  });
                }}
              >
                View Specializations
              </Button>
            </Tooltip>
          </Flex>
          
          {isLoadingAgents ? (
            <Box textAlign="center" py={8}>
              <Icon as={FiZap} fontSize="4xl" color="brand.neutral.300" mb={4} />
              <Text color="brand.neutral.500">Loading AI agents...</Text>
            </Box>
          ) : error ? (
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Failed to load AI agents</AlertTitle>
                <AlertDescription>
                  {error}. Please check your authentication and try again.
                </AlertDescription>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  mt={2}
                  onClick={() => {
                    setError(null);
                    fetchAIProfiles();
                  }}
                >
                  Retry Loading AI Agents
                </Button>
              </Box>
            </Alert>
          ) : aiProfiles.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Icon as={FiZap} fontSize="4xl" color="brand.neutral.300" mb={4} />
              <Text color="brand.neutral.500">No AI agents available. Please contact support.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {aiProfiles.map((agent) => (
                <AIAgentSection
                  key={agent.id} 
                  agent={agent}
                  loading={false}
                  error={null}
                  onAskQuestion={handleAskAIAgent}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Quick Plan Generation - Enhanced */}
        <Card bg="white" boxShadow="md" mb={8}>
          <CardHeader>
            <Heading size="md" color="brand.primary">
              <Icon as={FiTarget} mr={2} />
              Generate Strategic Plan
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch" as="form" onSubmit={handleGeneratePlan}>
              <FormControl isRequired>
                <FormLabel htmlFor="plan-objective" color="brand.primary" fontWeight="semibold">
                  What would you like your AI team to help you with?
                </FormLabel>
                <Textarea
                  id="plan-objective"
                  placeholder="e.g., Increase lead conversion rate for Q3 by 10% in SaaS. Or, Plan content strategy for a new product launch targeting SMBs."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={4}
                  bg="brand.neutral.50"
                  borderColor="brand.neutral.200"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                  }}
                />
              </FormControl>

              <Box p={4} bg="brand.50" borderRadius="md" border="1px solid" borderColor="brand.100">
                <HStack>
                  <Icon as={FiMessageSquare} color="brand.accent" />
                  <Text fontSize="sm" color="brand.neutral.700">
                    💡 The system will automatically select the most appropriate AI agents based on your objective.
                  </Text>
                </HStack>
              </Box>

              <Button
                type="submit"
                colorScheme="brand"
                bg="brand.primary"
                color="white"
                isLoading={isGenerating}
                loadingText="Generating Plan..."
                _hover={{ bg: "brand.600" }}
                size="lg"
                leftIcon={<FiCpu />}
                height="50px"
                fontSize="md"
                fontWeight="semibold"
              >
                Generate AI-Powered Plan
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabs for Tasks and Recommendations - Enhanced */}
        <Card bg="white" boxShadow="md">
          <CardHeader>
            <Heading size="md" color="brand.primary">
              <Icon as={FiBarChart} mr={2} />
              AI Operations Center
            </Heading>
          </CardHeader>
          <CardBody p={0}>
            <Tabs variant="enclosed" colorScheme="brand">
              <TabList px={6} pt={2}>
                <Tab>
                  <HStack>
                    <Icon as={FiPlay} />
                    <Text>Active Tasks ({aiTasks.length})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <Icon as={FiTrendingUp} />
                    <Text>AI Recommendations ({activeRecommendations.length})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <Icon as={FiX} />
                    <Text>Dismissed ({dismissedRecommendations.length})</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Active Tasks Tab */}
                <TabPanel>
                  {aiTasks.length === 0 ? (
                    <Box textAlign="center" py={12}>
                      <Icon as={FiZap} fontSize="6xl" color="brand.neutral.300" mb={4} />
                      <Text color="brand.neutral.500" fontSize="lg" mb={2}>No active AI tasks</Text>
                      <Text color="brand.neutral.400" fontSize="sm">Create your first plan above to get started!</Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {aiTasks.map((task) => (
                        <Card key={task.id} boxShadow="sm" border="1px solid" borderColor="brand.neutral.100" _hover={{ boxShadow: "md" }}>
                          <CardHeader pb={3}>
                            <Flex justify="space-between" align="center">
                              <Heading size="sm" color="brand.primary" noOfLines={1}>
                                {task.objective.substring(0, 50)}...
                              </Heading>
                              <Badge colorScheme={getStatusColor(task.status)} variant="solid">
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </Flex>
                          </CardHeader>
                          <CardBody pt={0}>
                                                          <VStack align="start" spacing={3}>
                                <HStack>
                                  <Flex
                                    w={6}
                                    h={6}
                                    bg={getAgentColor(task.assignee_agent?.specialization || 'general_orchestration')}
                                    borderRadius="full"
                                    align="center"
                                    justify="center"
                                    boxShadow="sm"
                                  >
                                    <Icon 
                                      as={getAgentIcon(task.assignee_agent?.specialization || 'general_orchestration')} 
                                      color="white" 
                                      boxSize={3} 
                                    />
                                  </Flex>
                                  <Text fontSize="sm" color="brand.neutral.600">
                                    Assigned to: {task.assignee_agent?.name || 'Auto-assigned'}
                                  </Text>
                                </HStack>
                                <Text fontSize="sm" color="brand.neutral.700" noOfLines={2}>
                                  {task.objective}
                                </Text>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiEye />}
                                    onClick={() => handleViewTaskDetail(task)}
                                    colorScheme="brand"
                                    variant="outline"
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
                    <Box textAlign="center" py={12}>
                      <Icon as={FiTrendingUp} fontSize="6xl" color="brand.neutral.300" mb={4} />
                      <Text color="brand.neutral.500" fontSize="lg" mb={2}>No active recommendations</Text>
                      <Text color="brand.neutral.400" fontSize="sm">Generate a plan to see AI insights!</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {activeRecommendations.map((recommendation) => (
                        <RecommendationCard
                          key={recommendation.id}
                          recommendation={recommendation}
                          onDismiss={handleDismiss}
                          onActioned={handleMarkActioned}
                        />
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                {/* Dismissed Recommendations Tab */}
                <TabPanel>
                  {dismissedRecommendations.length === 0 ? (
                    <Box textAlign="center" py={12}>
                      <Icon as={FiX} fontSize="6xl" color="brand.neutral.300" mb={4} />
                      <Text color="brand.neutral.500" fontSize="lg">No dismissed recommendations</Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {dismissedRecommendations.map((recommendation) => (
                        <RecommendationCard
                          key={recommendation.id}
                          recommendation={recommendation}
                          onDismiss={handleDismiss}
                          onActioned={handleMarkActioned}
                        />
                      ))}
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Task Detail Modal */}
        <Modal isOpen={isTaskDetailOpen} onClose={onTaskDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="brand.primary">Task Details</ModalHeader>
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return FiAlertTriangle;
      case 'high': return FiTrendingUp;
      case 'medium': return FiTarget;
      case 'low': return FiCheckCircle;
      default: return FiMessageSquare;
    }
  };

  return (
    <Card 
      boxShadow="sm" 
      border="1px solid" 
      borderColor="brand.neutral.100" 
      _hover={{ boxShadow: "md", borderColor: "brand.primary" }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="start" spacing={4}>
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Icon 
                as={getPriorityIcon(recommendation.priority)} 
                color={`${getPriorityColor(recommendation.priority)}.500`}
                boxSize={5}
              />
              <Badge 
                colorScheme={getPriorityColor(recommendation.priority)} 
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
              >
                {recommendation.priority}
              </Badge>
              <Badge 
                colorScheme="brand" 
                variant="outline"
                px={3}
                py={1}
                borderRadius="full"
              >
                {recommendation.type.replace('_', ' ')}
              </Badge>
            </HStack>
            {recommendation.generated_by_agent && (
              <HStack>
                <Avatar size="xs" name={recommendation.generated_by_agent.name} bg="brand.primary" />
                <Text fontSize="sm" color="brand.neutral.600" fontWeight="medium">
                  {recommendation.generated_by_agent.name}
                </Text>
              </HStack>
            )}
          </HStack>
          
          <Box>
            <Text 
              color="brand.neutral.700" 
              fontSize="md" 
              lineHeight="1.6"
              fontWeight="medium"
            >
              {recommendation.recommendation_text}
            </Text>
          </Box>
          
          <HStack spacing={3} pt={2}>
            {!recommendation.is_dismissed && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={() => onDismiss(recommendation.id)}
                leftIcon={<FiX />}
              >
                Dismiss
              </Button>
            )}
            {!recommendation.is_actioned && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => onActioned(recommendation.id)}
                leftIcon={<FiCheckCircle />}
              >
                Mark Actioned
              </Button>
            )}
            {recommendation.is_actioned && (
              <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                <Icon as={FiCheckCircle} mr={1} />
                Actioned
              </Badge>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}; 