import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
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
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import api from "../services/api";
import {FiCpu, FiCheck} from "react-icons/fi";

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

export default function AITaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<AITask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  async function fetchTask() {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ai-services/tasks/${taskId}/`);
      setTask(res.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load task details";
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

  async function handleUpdateStatus(newStatus: AITask['status']) {
    if (!task) return;

    try {
      await api.patch(`/ai-services/tasks/${task.id}/`, {
        status: newStatus
      });
      
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus.replace('_', ' ')}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onUpdateModalClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task status";
      toast({
        title: "Update Failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return FiCheck;
      case 'in_progress': return FiClock;
      case 'failed': return FiX;
      default: return FiClock;
    }
  };

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.primary" />
        </Box>
      </Layout>
    );
  }

  if (error || !task) {
    return (
      <Layout>
        <Box py={4} px={{ base: 0, md: 4 }}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error || "Task not found"}
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Header */}
        <HStack justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="brand.primary">
              AI Task Details
            </Heading>
            <Text color="gray.600">
              Task ID: {task.id}
            </Text>
          </VStack>
          <Button
            variant="ghost"
            leftIcon={<Icon as={FiCpu} />}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </HStack>

        {/* Task Overview */}
        <Card mb={6}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color="brand.primary">Task Overview</Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getStatusColor(task.status)} size="lg">
                  <Icon as={getStatusIcon(task.status)} mr={1} />
                  {task.status.replace('_', ' ')}
                </Badge>
                <Button size="sm" onClick={onUpdateModalOpen}>
                  Update Status
                </Button>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Objective:</Text>
                <Text>{task.objective}</Text>
              </Box>
              
              <HStack spacing={6}>
                <Box>
                  <Text fontWeight="bold" mb={1}>Requester:</Text>
                  <Text>{task.requester?.first_name} {task.requester?.last_name}</Text>
                </Box>
                
                {task.assignee_agent && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Assigned Agent:</Text>
                    <Text>{task.assignee_agent.name}</Text>
                  </Box>
                )}
              </HStack>
              
              <HStack spacing={6}>
                <Box>
                  <Text fontWeight="bold" mb={1}>Created:</Text>
                  <Text>{formatTimestamp(task.created_at)}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Last Updated:</Text>
                  <Text>{formatTimestamp(task.updated_at)}</Text>
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        {task.result_data && (
          <Card mb={6}>
            <CardHeader>
              <Heading size="md" color="brand.primary">Results</Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                {JSON.stringify(task.result_data, null, 2)}
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Context Data */}
        {task.context_data && Object.keys(task.context_data).length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md" color="brand.primary">Context Data</Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                {JSON.stringify(task.context_data, null, 2)}
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Update Status Modal */}
        <Modal isOpen={isUpdateModalOpen} onClose={onUpdateModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Task Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text>Select new status for this task:</Text>
                <VStack spacing={2} w="full">
                  {(['pending', 'in_progress', 'completed', 'failed', 'delegated'] as const).map((status) => (
                    <Button
                      key={status}
                      w="full"
                      variant={task.status === status ? "solid" : "outline"}
                      colorScheme={getStatusColor(status)}
                      onClick={() => handleUpdateStatus(status)}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </VStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
} 