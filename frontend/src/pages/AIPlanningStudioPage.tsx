import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Heading,
  Spinner,
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
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { Layout } from "../components/Layout";
import api from "../services/api";

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
  assignee_agent: AIProfile | null;
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

export default function AIPlanningStudioPage() {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
    fetchAIProfiles();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/ai-services/tasks/");
      setTasks(res.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load AI tasks";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchAIProfiles() {
    try {
      const res = await api.get("/ai-services/profiles/");
      setAiProfiles(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch AI profiles:", err);
    }
  }

  async function handleViewTaskDetail(task: AITask) {
    setSelectedTask(task);
    onDetailOpen();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      case 'delegated': return 'purple';
      default: return 'gray';
    }
  };

  const activeAgents = aiProfiles.filter(agent => agent.is_active);
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>
          AI Planning Studio
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">Active Agents</Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                {activeAgents.length}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">Pending</Text>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {pendingTasks.length}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">In Progress</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {inProgressTasks.length}
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.600">Completed</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {completedTasks.length}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <Heading size="md" color="brand.primary">AI Tasks</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="brand.primary" />
                <Text mt={4} color="gray.600">Loading tasks...</Text>
              </Box>
            ) : tasks.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No AI tasks found. Create a plan in the AI Planning page to get started.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {tasks.map((task) => (
                  <Card key={task.id} variant="outline">
                    <CardBody>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontWeight="bold">{task.objective}</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            {task.assignee_agent && (
                              <Badge colorScheme="blue" variant="subtle">
                                {task.assignee_agent.name}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Requested by: {task.requester?.first_name} {task.requester?.last_name}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={() => handleViewTaskDetail(task)}
                          >
                            View
                          </Button>
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Task Detail Modal */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Task Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTask && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>Objective:</Text>
                    <Text>{selectedTask.objective}</Text>
                  </Box>
                  
                  <HStack spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={1}>Status:</Text>
                      <Badge colorScheme={getStatusColor(selectedTask.status)}>
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                    </Box>
                    
                    {selectedTask.assignee_agent && (
                      <Box>
                        <Text fontWeight="bold" mb={1}>Assigned Agent:</Text>
                        <Text>{selectedTask.assignee_agent.name}</Text>
                      </Box>
                    )}
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Requester:</Text>
                    <Text>{selectedTask.requester?.first_name} {selectedTask.requester?.last_name}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Created:</Text>
                    <Text>{new Date(selectedTask.created_at).toLocaleString()}</Text>
                  </Box>
                  
                  {selectedTask.result_data && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Results:</Text>
                      <Text fontSize="sm" color="gray.600">
                        {JSON.stringify(selectedTask.result_data, null, 2)}
                      </Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}