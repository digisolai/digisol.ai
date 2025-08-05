// frontend/src/pages/AutomationsPage.tsx
import {useEffect, useState} from "react";
import { 
  Box, Button, Heading, Spinner, Text, VStack, HStack, Card, CardHeader, CardBody, 
  SimpleGrid, Badge, Icon, Alert, AlertIcon, useToast, Progress, Flex, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Switch, useDisclosure
} from "@chakra-ui/react";
import { FiPlay, FiEdit3, FiPlus } from "react-icons/fi"; // Icons for status
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import WorkflowEditor from "../components/WorkflowEditor";
import type { AIProfile } from "../types/ai";
import type { AutomationWorkflow, AutomationExecution } from "../types/automation";

export default function AutomationsPage() {
  const toast = useToast();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [automatixAgent, setAutomatixAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // NEW: Workflow selection and creation states
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowActive, setNewWorkflowActive] = useState(true);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

  // Fetch AI Agent for Automations
  useEffect(() => {
    async function fetchAutomatixAgent() {
      setLoadingAgent(true);
      setAgentError(null);
      try {
        console.log("🔍 Fetching Automatix agent...");
        const res = await api.get('/ai-services/profiles/?specialization=automation_design&is_global=true');
        console.log("📡 API Response:", res.data);
        console.log("📊 Response length:", res.data?.length);
        
        if (res.data && res.data.length > 0) {
          console.log("✅ Setting Automatix agent:", res.data[0]);
          setAutomatixAgent(res.data[0]);
        } else {
          console.log("❌ No Automatix agent found in response");
          setAgentError("No AI assistant found");
        }
      } catch (err: unknown) {
        console.error("❌ Failed to fetch Automatix agent:", err);
        const error = err as { response?: { data?: unknown } };
        console.error("Error details:", error.response?.data);
        setAgentError("Failed to load AI assistant");
      } finally {
        setLoadingAgent(false);
      }
    }
    fetchAutomatixAgent();
  }, []);

  // Fetch workflows and executions on mount
  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();
  }, []);

  // Polling for executions (simple example, more robust polling can be added)
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchExecutions();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(pollingInterval);
  }, []);

  async function fetchWorkflows() {
    setWorkflowsLoading(true);
    try {
      const response = await api.get('/core/automation-workflows/');
      setWorkflows(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      console.error('Failed to fetch workflows:', error.response?.data);
      setError('Failed to load workflows');
    } finally {
      setWorkflowsLoading(false);
    }
  }

  async function fetchExecutions() {
    setExecutionsLoading(true);
    try {
      const response = await api.get('/core/automation-executions/');
      setExecutions(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      console.error('Failed to fetch executions:', error.response?.data);
      // Don't set error for executions as they're not critical
    } finally {
      setExecutionsLoading(false);
    }
  }

  async function handleTestRun(workflowId: string) {
    try {
      await api.post(`/core/automation-executions/`, {
        workflow: workflowId,
        contact: null, // For test runs, we might not have a specific contact
        context_data: { test_run: true }
      });
      toast({
        title: "Test run started",
        description: "The workflow is now executing in test mode.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh executions to show the new test run
      fetchExecutions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      console.error('Failed to start test run:', error.response?.data);
      toast({
        title: "Test run failed",
        description: "Could not start the workflow test run.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      case 'failed': return 'red';
      case 'in_progress': return 'purple';
      default: return 'gray';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'blue';
      case 'failed': return 'red';
      case 'in_progress': return 'purple';
      default: return 'gray';
    }
  };

  function handleAskAutomatixQuestion() {
    toast({ title: "Interacting with Automatix is coming soon!", status: "info", duration: 2000, isClosable: true });
  }

  // NEW: Handle workflow selection
  const handleEditWorkflow = (workflow: AutomationWorkflow) => {
    setSelectedWorkflow(workflow);
  };

  // NEW: Handle create new workflow
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the workflow.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreatingWorkflow(true);
    try {
      const response = await api.post('/core/automation-workflows/', {
        name: newWorkflowName.trim(),
        is_active: newWorkflowActive,
        trigger_config: {},
        steps_config: { nodes: [], edges: [] }
      });

      toast({
        title: "Workflow created!",
        description: "Your new workflow has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Close modal and reset form
      onCreateModalClose();
      setNewWorkflowName('');
      setNewWorkflowActive(true);
      
      // Refresh workflows list
      await fetchWorkflows();
      
      // Set the newly created workflow as selected
      setSelectedWorkflow(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      console.error('Failed to create workflow:', error.response?.data);
      toast({
        title: "Creation failed",
        description: "Could not create the workflow. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  // NEW: Handle save workflow
  const handleSaveWorkflow = async (workflowData: { id?: string; nodes: unknown[]; edges: unknown[] }) => {
    if (!workflowData.id) {
      toast({
        title: "No workflow selected",
        description: "Please select a workflow to save.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.patch(`/core/automation-workflows/${workflowData.id}/`, {
        steps_config: {
          nodes: workflowData.nodes,
          edges: workflowData.edges
        }
      });

      toast({
        title: "Workflow saved!",
        description: "Your workflow changes have been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh workflows to get updated data
      await fetchWorkflows();
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      console.error('Failed to save workflow:', error.response?.data);
      toast({
        title: "Save failed",
        description: "Could not save the workflow. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={4}>Automations</Heading>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Automatix AI Agent Section */}
        <AIAgentSection
          agent={automatixAgent}
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskAutomatixQuestion}
        />

        {/* Visual Workflow Builder Section */}
        <Box mb={8}>
          <HStack justifyContent="space-between" mb={4}>
            <Heading size="md" color="brand.primary">Workflow Builder</Heading>
            <Button 
              bg="brand.primary" 
              color="brand.accent" 
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              leftIcon={<FiPlus />}
              onClick={onCreateModalOpen}
            >
              Create New Workflow
            </Button>
          </HStack>
          
          {/* WorkflowEditor with save/load functionality */}
          <WorkflowEditor 
            workflow={selectedWorkflow} 
            onSave={handleSaveWorkflow}
          />
        </Box>

        {/* Existing Workflows Section */}
        <Box mb={8}>
          <Heading size="md" color="brand.primary" mb={4}>Existing Workflows</Heading>
          {workflowsLoading ? (
            <Spinner />
          ) : workflows.length === 0 ? (
            <Text color="brand.neutral.300">No workflows created yet. Create one above!</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {workflows.map((workflow) => (
                <Card key={workflow.id} boxShadow="md">
                  <CardHeader bg="brand.neutral.50" borderBottom="1px solid" borderColor="brand.neutral.100">
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" color="brand.primary">{workflow.name}</Heading>
                      <Badge colorScheme={getWorkflowStatusColor(workflow.status || 'active')}>
                        {(workflow.status || 'active').replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color="brand.neutral.700">
                        Created: {new Date(workflow.created_at).toLocaleString()}
                      </Text>
                      <HStack spacing={2} justifyContent="flex-end">
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          variant="outline" 
                          leftIcon={<Icon as={FiEdit3} />}
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          Edit Workflow
                        </Button>
                        <Button
                          size="sm"
                          bg="brand.primary"
                          color="brand.accent"
                          fontWeight="bold"
                          _hover={{ bg: "brand.600" }}
                          _active={{ bg: "brand.700" }}
                          leftIcon={<Icon as={FiPlay} />}
                          onClick={() => handleTestRun(workflow.id)}
                          isDisabled={!workflow.is_active} // Disable test run if workflow is inactive
                        >
                          Test Run
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Create New Workflow Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Workflow</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Workflow Name</FormLabel>
                  <Input
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="Enter workflow name..."
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="workflow-active" mb="0">
                    Active
                  </FormLabel>
                  <Switch
                    id="workflow-active"
                    isChecked={newWorkflowActive}
                    onChange={(e) => setNewWorkflowActive(e.target.checked)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreateWorkflow}
                isLoading={isCreatingWorkflow}
                loadingText="Creating..."
              >
                Create Workflow
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Active Executions Section */}
        <Box mb={8}>
          <Heading size="md" color="brand.primary" mb={4}>Active Executions</Heading>
          {executionsLoading ? (
            <Spinner />
          ) : executions.length === 0 ? (
            <Text color="brand.neutral.300">No active executions.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {executions.map((execution) => (
                <Card key={execution.id} boxShadow="md">
                  <CardHeader bg="brand.neutral.50" borderBottom="1px solid" borderColor="brand.neutral.100">
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" color="brand.primary">{execution.workflow.name}</Heading>
                      <Badge colorScheme={getExecutionStatusColor(execution.status)}>
                        {execution.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color="brand.neutral.700">
                        Contact: {execution.contact ? `${execution.contact.first_name} ${execution.contact.last_name}` : 'Test Run'}
                      </Text>
                      <Text fontSize="sm" color="brand.neutral.700">
                        Step: {execution.current_step_index + 1}
                        </Text>
                      <Text fontSize="sm" color="brand.neutral.700">
                        Started: {new Date(execution.started_at).toLocaleString()}
                        </Text>
                      {execution.status === 'in_progress' && (
                        <Progress size="sm" colorScheme="blue" isIndeterminate />
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Layout>
  );
}