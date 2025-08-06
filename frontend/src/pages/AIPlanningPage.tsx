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
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import {FiCpu, FiEye} from "react-icons/fi";

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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit AI planning request';
      
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

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>AI Planning & Orchestration</Heading>

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
          <Heading size="md" color="brand.primary" mb={4}>
            <Icon as={FiZap} mr={2} />
            Your AI Team
          </Heading>
          
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

        {/* Quick Plan Generation - Simplified */}
        <VStack spacing={6} align="stretch" as="form" onSubmit={handleGeneratePlan} p={6} bg="white" borderRadius="lg" boxShadow="md" mb={8}>
          <Heading size="md" color="brand.primary">Generate Strategic Plan</Heading>
          
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

          <Text fontSize="sm" color="brand.neutral.600" mb={3}>
            💡 The system will automatically select the most appropriate AI agents based on your objective.
          </Text>

          <Button
            type="submit"
            colorScheme="brand"
            bg="brand.primary"
            color="white"
            isLoading={isGenerating}
            loadingText="Generating Plan..."
            _hover={{ bg: "#163166" }}
            size="lg"
            leftIcon={<FiCpu />}
          >
            Generate AI-Powered Plan
          </Button>
        </VStack>

        {/* Tabs for Tasks and Recommendations */}
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Active Tasks ({aiTasks.length})</Tab>
            <Tab>AI Recommendations ({activeRecommendations.length})</Tab>
            <Tab>Dismissed ({dismissedRecommendations.length})</Tab>
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
                <Box textAlign="center" py={8}>
                  <Icon as={FiX} fontSize="4xl" color="brand.neutral.300" mb={4} />
                  <Text color="brand.neutral.500">No dismissed recommendations.</Text>
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