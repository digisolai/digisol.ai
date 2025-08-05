import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Badge,
  Icon,
  Flex,
  Progress,
  useToast,
  Input,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  StatHelpText,
  Avatar,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
} from '@chakra-ui/react';
import {
  FiGlobe, FiSend, FiLock, FiUnlock, FiEye, FiCheckCircle, FiXCircle,
  FiMessageSquare, FiSettings, FiTarget, FiPlus
} from 'react-icons/fi';
import api from '../services/api';

interface Project {
  id: string;
  name: string;
  project_code: string;
  client_name?: string;
  client_email?: string;
  client_portal_enabled: boolean;
  progress_percentage: number;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  actual_cost: number;
}

interface ClientPortal {
  id: string;
  client_name: string;
  client_email: string;
  access_code: string;
  is_active: boolean;
  permissions: {
    view_progress: boolean;
    view_files: boolean;
    view_milestones: boolean;
    approve_deliverables: boolean;
    send_messages: boolean;
  };
  last_access?: string;
  notification_preferences: {
    email_updates: boolean;
    milestone_notifications: boolean;
    deliverable_approvals: boolean;
  };
}

interface Deliverable {
  id: string;
  name: string;
  description: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  assigned_to: string;
  client_approval_required: boolean;
  client_feedback?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
}

interface ClientMessage {
  id: string;
  sender: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  attachments?: string[];
}

interface ClientPortalTabProps {
  project: Project;
}

const ClientPortalTab: React.FC<ClientPortalTabProps> = ({ project }) => {
  const [clientPortal, setClientPortal] = useState<ClientPortal | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  


  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isMessageOpen, onOpen: onMessageOpen, onClose: onMessageClose } = useDisclosure();
  
  const [newMessage, setNewMessage] = useState('');
  const [portalSettings, setPortalSettings] = useState({
    client_name: project.client_name || '',
    client_email: project.client_email || '',
    permissions: {
      view_progress: true,
      view_files: true,
      view_milestones: true,
      approve_deliverables: true,
      send_messages: true,
    },
    notification_preferences: {
      email_updates: true,
      milestone_notifications: true,
      deliverable_approvals: true,
    },
  });
  
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchClientPortalData();
  }, [project.id]);

  const fetchClientPortalData = async () => {
    try {
      setLoading(true);
      
      // Fetch client portal data
      const portalResponse = await api.get(`/project-management/projects/${project.id}/client_portal_data/`);
      setClientPortal(portalResponse.data.client_portal);
      
      // Fetch deliverables
      const deliverablesResponse = await api.get(`/project-management/milestones/?project=${project.id}&client_approval_required=true`);
      setDeliverables(deliverablesResponse.data.results || deliverablesResponse.data);
      
      // Fetch messages
      const messagesResponse = await api.get(`/project-management/comments/?project=${project.id}&is_internal=false`);
      setMessages(messagesResponse.data.results || messagesResponse.data);
    } catch (err) {
      console.error('Error fetching client portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePortal = async () => {
    try {
      const newStatus = !project.client_portal_enabled;
      await api.patch(`/project-management/projects/${project.id}/`, {
        client_portal_enabled: newStatus
      });
      
      toast({
        title: 'Success',
        description: `Client portal ${newStatus ? 'enabled' : 'disabled'} successfully`,
        status: 'success',
        duration: 3000,
      });
      
      // Refresh project data
      window.location.reload();
    } catch (err) {
      console.error('Error toggling portal:', err);
      toast({
        title: 'Error',
        description: 'Failed to update portal status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post('/project-management/comments/', {
        project: project.id,
        content: newMessage,
        is_internal: false,
      });
      
      toast({
        title: 'Success',
        description: 'Message sent successfully',
        status: 'success',
        duration: 3000,
      });
      
      setNewMessage('');
      onMessageClose();
      fetchClientPortalData();
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeliverableAction = async (deliverableId: string, action: 'approve' | 'reject', feedback?: string) => {
    try {
      await api.post(`/project-management/milestones/${deliverableId}/client_approve/`, {
        action,
        feedback,
      });
      
      toast({
        title: 'Success',
        description: `Deliverable ${action}d successfully`,
        status: 'success',
        duration: 3000,
      });
      
      fetchClientPortalData();
    } catch (err) {
      console.error('Error updating deliverable:', err);
      toast({
        title: 'Error',
        description: 'Failed to update deliverable',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/project-management/client-portals/', {
        project: project.id,
        ...portalSettings,
      });
      
      toast({
        title: 'Success',
        description: 'Portal settings saved successfully',
        status: 'success',
        duration: 3000,
      });
      
      onSettingsClose();
      fetchClientPortalData();
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'submitted': return 'blue';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="lg" color="brand.500" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="md" color={textColor} mb={2}>
            Client Portal
          </Heading>
          <Text color="gray.600">
            Manage client access and collaboration
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={project.client_portal_enabled ? <FiLock /> : <FiUnlock />}
            colorScheme={project.client_portal_enabled ? 'green' : 'gray'}
            size="sm"
            onClick={handleTogglePortal}
          >
            {project.client_portal_enabled ? 'Portal Active' : 'Enable Portal'}
          </Button>
          <Button
            leftIcon={<FiSettings />}
            variant="outline"
            size="sm"
            onClick={onSettingsOpen}
          >
            Settings
          </Button>
          <Button
            leftIcon={<FiSend />}
            colorScheme="brand"
            size="sm"
            onClick={onMessageOpen}
          >
            Send Update
          </Button>
        </HStack>
      </Flex>

      {/* Portal Status */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
        <CardBody>
          <HStack justify="space-between">
            <HStack spacing={4}>
              <Icon
                as={project.client_portal_enabled ? FiGlobe : FiLock}
                color={project.client_portal_enabled ? 'green.500' : 'gray.500'}
                boxSize={6}
              />
              <Box>
                <Text fontSize="lg" fontWeight="medium" color={textColor}>
                  {project.client_portal_enabled ? 'Client Portal Active' : 'Client Portal Disabled'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {project.client_portal_enabled 
                    ? 'Clients can access project information and collaborate'
                    : 'Enable portal to allow client access'
                  }
                </Text>
              </Box>
            </HStack>
            {clientPortal && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">Access Code:</Text>
                <Badge colorScheme="brand" variant="subtle">
                  {clientPortal.access_code}
                </Badge>
              </HStack>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab>
              <Icon as={FiEye} mr={2} />
              Shared Dashboard
            </Tab>
            <Tab>
              <Icon as={FiTarget} mr={2} />
              Deliverables
            </Tab>
            <Tab>
              <Icon as={FiMessageSquare} mr={2} />
              Messages
            </Tab>
          </TabList>

          <TabPanels>
            {/* Shared Dashboard Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Project Overview */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>
                      Project Overview
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Stat>
                        <StatLabel color="gray.600">Progress</StatLabel>
                        <StatNumber color={textColor}>{project.progress_percentage}%</StatNumber>
                        <StatHelpText>
                          <Progress
                            value={project.progress_percentage}
                            colorScheme={project.progress_percentage > 80 ? 'green' : project.progress_percentage > 50 ? 'yellow' : 'red'}
                            size="sm"
                            mt={2}
                          />
                        </StatHelpText>
                      </Stat>
                      
                      <Stat>
                        <StatLabel color="gray.600">Status</StatLabel>
                        <StatNumber color={textColor}>
                          <Badge colorScheme={getStatusColor(project.status)} variant="subtle">
                            {project.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </StatNumber>
                      </Stat>
                      
                      <Stat>
                        <StatLabel color="gray.600">Budget Used</StatLabel>
                        <StatNumber color={textColor}>
                          {formatCurrency(project.actual_cost)}
                        </StatNumber>
                        <StatHelpText>
                          of {formatCurrency(project.budget)}
                        </StatHelpText>
                      </Stat>
                      
                      <Stat>
                        <StatLabel color="gray.600">Timeline</StatLabel>
                        <StatNumber color={textColor}>
                          {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Recent Activity */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md" color={textColor}>
                      Recent Activity
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {messages.slice(0, 5).map((message) => (
                        <HStack key={message.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
                          <Avatar size="sm" name={message.sender} />
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {message.sender}
                            </Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {message.message}
                            </Text>
                          </Box>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(message.created_at)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Deliverables Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md" color={textColor}>
                    Deliverables & Approvals
                  </Heading>
                  <Badge colorScheme="brand" variant="subtle">
                    {deliverables.filter(d => d.status === 'pending').length} Pending
                  </Badge>
                </Flex>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Deliverable</Th>
                        <Th>Due Date</Th>
                        <Th>Status</Th>
                        <Th>Assigned To</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {deliverables.map((deliverable) => (
                        <Tr key={deliverable.id}>
                          <Td>
                            <Box>
                              <Text fontWeight="medium" color={textColor}>
                                {deliverable.name}
                              </Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                {deliverable.description}
                              </Text>
                            </Box>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatDate(deliverable.due_date)}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(deliverable.status)} variant="subtle">
                              {deliverable.status.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{deliverable.assigned_to}</Text>
                          </Td>
                          <Td>
                            {deliverable.status === 'submitted' && deliverable.client_approval_required && (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleDeliverableAction(deliverable.id, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleDeliverableAction(deliverable.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </HStack>
                            )}
                            {deliverable.status === 'approved' && (
                              <HStack spacing={1}>
                                <Icon as={FiCheckCircle} color="green.500" />
                                <Text fontSize="sm" color="green.500">Approved</Text>
                              </HStack>
                            )}
                            {deliverable.status === 'rejected' && (
                              <HStack spacing={1}>
                                <Icon as={FiXCircle} color="red.500" />
                                <Text fontSize="sm" color="red.500">Rejected</Text>
                              </HStack>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </TabPanel>

            {/* Messages Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md" color={textColor}>
                    Client Communication
                  </Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="brand"
                    size="sm"
                    onClick={onMessageOpen}
                  >
                    New Message
                  </Button>
                </Flex>

                <VStack spacing={3} align="stretch">
                  {messages.map((message) => (
                    <Card key={message.id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                      <CardBody>
                        <HStack spacing={3} align="start">
                          <Avatar size="sm" name={message.sender} />
                          <Box flex="1">
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                {message.sender}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatDate(message.created_at)}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.700">
                              {message.message}
                            </Text>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Client Portal Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Client Name</FormLabel>
                <Input
                  value={portalSettings.client_name}
                  onChange={(e) => setPortalSettings({
                    ...portalSettings,
                    client_name: e.target.value
                  })}
                  placeholder="Enter client name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Client Email</FormLabel>
                <Input
                  type="email"
                  value={portalSettings.client_email}
                  onChange={(e) => setPortalSettings({
                    ...portalSettings,
                    client_email: e.target.value
                  })}
                  placeholder="Enter client email"
                />
              </FormControl>
              
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>Permissions</Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">View Progress</Text>
                    <Switch
                      isChecked={portalSettings.permissions.view_progress}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        permissions: {
                          ...portalSettings.permissions,
                          view_progress: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">View Files</Text>
                    <Switch
                      isChecked={portalSettings.permissions.view_files}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        permissions: {
                          ...portalSettings.permissions,
                          view_files: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">View Milestones</Text>
                    <Switch
                      isChecked={portalSettings.permissions.view_milestones}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        permissions: {
                          ...portalSettings.permissions,
                          view_milestones: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Approve Deliverables</Text>
                    <Switch
                      isChecked={portalSettings.permissions.approve_deliverables}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        permissions: {
                          ...portalSettings.permissions,
                          approve_deliverables: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Send Messages</Text>
                    <Switch
                      isChecked={portalSettings.permissions.send_messages}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        permissions: {
                          ...portalSettings.permissions,
                          send_messages: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                </VStack>
              </Box>
              
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>Notification Preferences</Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Email Updates</Text>
                    <Switch
                      isChecked={portalSettings.notification_preferences.email_updates}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        notification_preferences: {
                          ...portalSettings.notification_preferences,
                          email_updates: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Milestone Notifications</Text>
                    <Switch
                      isChecked={portalSettings.notification_preferences.milestone_notifications}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        notification_preferences: {
                          ...portalSettings.notification_preferences,
                          milestone_notifications: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Deliverable Approvals</Text>
                    <Switch
                      isChecked={portalSettings.notification_preferences.deliverable_approvals}
                      onChange={(e) => setPortalSettings({
                        ...portalSettings,
                        notification_preferences: {
                          ...portalSettings.notification_preferences,
                          deliverable_approvals: e.target.checked
                        }
                      })}
                    />
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSettingsClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Send Message Modal */}
      <Modal isOpen={isMessageOpen} onClose={onMessageClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Client Update</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message to the client..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMessageClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSendMessage}
              isDisabled={!newMessage.trim()}
            >
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ClientPortalTab; 