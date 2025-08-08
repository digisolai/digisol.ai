import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spacer,
  Avatar,
  AvatarGroup,
  Tooltip,
  Divider,
  SimpleGrid,
  useToast,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiSend,
  FiUserPlus,
  FiActivity,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
} from 'react-icons/fi';
import api from '../services/api';

interface ClientPortal {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  client_website?: string;
  is_active: boolean;
  access_level: 'basic' | 'standard' | 'premium' | 'enterprise';
  custom_branding: boolean;
  custom_domain?: string;
  portal_theme?: any;
  features_enabled?: any;
  billing_cycle: 'monthly' | 'quarterly' | 'annually' | 'custom';
  monthly_fee: number;
  setup_fee: number;
  contacts_limit: number;
  contacts_used: number;
  campaigns_limit: number;
  campaigns_used: number;
  automations_limit: number;
  automations_used: number;
  usage_percentage: {
    contacts: number;
    campaigns: number;
    automations: number;
  };
  is_over_limit: boolean;
  total_users: number;
  created_at: string;
}

interface ClientUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer' | 'editor';
  is_active: boolean;
  last_login?: string;
}

interface ClientActivity {
  id: string;
  activity_type: string;
  description: string;
  client_user_name?: string;
  created_at: string;
}

interface ClientBilling {
  id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string;
}

const MyClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientPortal[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientPortal | null>(null);
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [clientActivities, setClientActivities] = useState<ClientActivity[]>([]);
  const [clientBilling, setClientBilling] = useState<ClientBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    averageMonthlyFee: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const toast = useToast();

  // Form states
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    client_website: '',
    access_level: 'standard' as const,
    monthly_fee: 0,
    setup_fee: 0,
    contacts_limit: 1000,
    campaigns_limit: 10,
    automations_limit: 5,
    custom_branding: false,
    custom_domain: '',
  });

  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'viewer' as const,
    can_view_analytics: true,
    can_manage_campaigns: false,
    can_manage_contacts: false,
    can_manage_automations: false,
    can_export_data: false,
  });

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/core/client-portals/');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/core/client-portals/');
      const clientsData = response.data;
      
      setStats({
        totalClients: clientsData.length,
        activeClients: clientsData.filter((c: ClientPortal) => c.is_active).length,
        totalRevenue: clientsData.reduce((sum: number, c: ClientPortal) => sum + c.monthly_fee, 0),
        averageMonthlyFee: clientsData.length > 0 
          ? clientsData.reduce((sum: number, c: ClientPortal) => sum + c.monthly_fee, 0) / clientsData.length 
          : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClientDetails = async (clientId: string) => {
    try {
      const [usersResponse, activitiesResponse, billingResponse] = await Promise.all([
        api.get(`/core/client-users/?client_portal=${clientId}`),
        api.get(`/core/client-activities/?client_portal=${clientId}`),
        api.get(`/core/client-billing/?client_portal=${clientId}`),
      ]);
      
      setClientUsers(usersResponse.data);
      setClientActivities(activitiesResponse.data);
      setClientBilling(billingResponse.data);
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleCreateClient = async () => {
    try {
      await api.post('/core/client-portals/', formData);
      toast({
        title: 'Success',
        description: 'Client portal created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      fetchClients();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client portal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateUser = async () => {
    if (!selectedClient) return;
    
    try {
      await api.post('/core/client-users/', {
        ...userFormData,
        client_portal: selectedClient.id,
      });
      toast({
        title: 'Success',
        description: 'Client user created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onUserModalClose();
      fetchClientDetails(selectedClient.id);
      resetUserForm();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_company: '',
      client_website: '',
      access_level: 'standard',
      monthly_fee: 0,
      setup_fee: 0,
      contacts_limit: 1000,
      campaigns_limit: 10,
      automations_limit: 5,
      custom_branding: false,
      custom_domain: '',
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'viewer',
      can_view_analytics: true,
      can_manage_campaigns: false,
      can_manage_contacts: false,
      can_manage_automations: false,
      can_export_data: false,
    });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'gray';
      case 'standard': return 'blue';
      case 'premium': return 'purple';
      case 'enterprise': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'sent': return 'blue';
      case 'overdue': return 'red';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">My Clients Portal</Heading>
            <Text color="gray.600">
              Manage your client relationships and provide them with access to DigiSol.AI
            </Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onOpen}
          >
            Add New Client
          </Button>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Clients</StatLabel>
                <StatNumber>{stats.totalClients}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Clients</StatLabel>
                <StatNumber>{stats.activeClients}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Monthly Revenue</StatLabel>
                <StatNumber>${stats.totalRevenue.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  15% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Avg. Monthly Fee</StatLabel>
                <StatNumber>${stats.averageMonthlyFee.toFixed(0)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Clients Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={6}>
          {clients.map((client) => (
            <Card key={client.id} cursor="pointer" onClick={() => setSelectedClient(client)}>
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{client.client_name}</Heading>
                    <Text color="gray.600" fontSize="sm">
                      {client.client_company || 'No company specified'}
                    </Text>
                  </VStack>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FiEye />}>View Details</MenuItem>
                      <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                      <MenuItem icon={<FiUserPlus />}>Add User</MenuItem>
                      <MenuItem icon={<FiDownload />}>Export Data</MenuItem>
                      <MenuItem icon={<FiTrash2 />} color="red.500">Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </CardHeader>
              
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* Client Info */}
                  <HStack spacing={4}>
                    <HStack>
                      <FiMail size={16} />
                      <Text fontSize="sm">{client.client_email}</Text>
                    </HStack>
                    {client.client_phone && (
                      <HStack>
                        <FiPhone size={16} />
                        <Text fontSize="sm">{client.client_phone}</Text>
                      </HStack>
                    )}
                  </HStack>

                  {/* Status and Access Level */}
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={client.is_active ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {client.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge colorScheme={getAccessLevelColor(client.access_level)}>
                      {client.access_level.charAt(0).toUpperCase() + client.access_level.slice(1)}
                    </Badge>
                  </HStack>

                  {/* Usage Progress */}
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Contacts</Text>
                      <Text fontSize="sm">{client.contacts_used}/{client.contacts_limit}</Text>
                    </HStack>
                    <Progress
                      value={client.usage_percentage.contacts}
                      colorScheme={client.usage_percentage.contacts > 90 ? 'red' : 'blue'}
                      size="sm"
                    />
                  </VStack>

                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Campaigns</Text>
                      <Text fontSize="sm">{client.campaigns_used}/{client.campaigns_limit}</Text>
                    </HStack>
                    <Progress
                      value={client.usage_percentage.campaigns}
                      colorScheme={client.usage_percentage.campaigns > 90 ? 'red' : 'blue'}
                      size="sm"
                    />
                  </VStack>

                  {/* Revenue */}
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Monthly Fee:</Text>
                    <Text fontWeight="bold">${client.monthly_fee}</Text>
                  </HStack>

                  {/* Users */}
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Active Users:</Text>
                    <AvatarGroup size="sm" max={3}>
                      {Array.from({ length: client.total_users }, (_, i) => (
                        <Avatar key={i} name={`User ${i + 1}`} />
                      ))}
                    </AvatarGroup>
                  </HStack>

                  {client.is_over_limit && (
                    <Alert status="warning" size="sm">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Usage Limit Exceeded!</AlertTitle>
                        <AlertDescription>
                          This client has exceeded one or more usage limits.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </VStack>

      {/* Create Client Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Client Portal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Client Name</FormLabel>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Enter client name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Client Email</FormLabel>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  placeholder="Enter client email"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Company</FormLabel>
                  <Input
                    value={formData.client_company}
                    onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                    placeholder="Enter company name"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  value={formData.client_website}
                  onChange={(e) => setFormData({ ...formData, client_website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Access Level</FormLabel>
                  <Select
                    value={formData.access_level}
                    onChange={(e) => setFormData({ ...formData, access_level: e.target.value as any })}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Monthly Fee ($)</FormLabel>
                  <NumberInput
                    value={formData.monthly_fee}
                    onChange={(_, value) => setFormData({ ...formData, monthly_fee: value })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Setup Fee ($)</FormLabel>
                  <NumberInput
                    value={formData.setup_fee}
                    onChange={(_, value) => setFormData({ ...formData, setup_fee: value })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Contacts Limit</FormLabel>
                  <NumberInput
                    value={formData.contacts_limit}
                    onChange={(_, value) => setFormData({ ...formData, contacts_limit: value })}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="custom-branding" mb="0">
                  Custom Branding
                </FormLabel>
                <Switch
                  id="custom-branding"
                  isChecked={formData.custom_branding}
                  onChange={(e) => setFormData({ ...formData, custom_branding: e.target.checked })}
                />
              </FormControl>
              <FormHelperText>
                Enable white-label branding for this client portal
              </FormHelperText>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreateClient}>
              Create Client Portal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Client Details Modal */}
      {selectedClient && (
        <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FiUsers />
                <Text>{selectedClient.client_name} - Client Portal</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Users</Tab>
                  <Tab>Activity</Tab>
                  <Tab>Billing</Tab>
                  <Tab>Settings</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      {/* Client Info */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">Client Information</Heading>
                        </CardHeader>
                        <CardBody>
                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold">Name:</Text>
                              <Text>{selectedClient.client_name}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold">Email:</Text>
                              <Text>{selectedClient.client_email}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold">Company:</Text>
                              <Text>{selectedClient.client_company || 'N/A'}</Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold">Phone:</Text>
                              <Text>{selectedClient.client_phone || 'N/A'}</Text>
                            </VStack>
                          </Grid>
                        </CardBody>
                      </Card>

                      {/* Usage Stats */}
                      <Card>
                        <CardHeader>
                          <Heading size="md">Usage Statistics</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={3} spacing={6}>
                            <VStack>
                              <Text fontSize="lg" fontWeight="bold">Contacts</Text>
                              <Text fontSize="2xl">{selectedClient.contacts_used}/{selectedClient.contacts_limit}</Text>
                              <Progress
                                value={selectedClient.usage_percentage.contacts}
                                colorScheme={selectedClient.usage_percentage.contacts > 90 ? 'red' : 'blue'}
                                w="full"
                              />
                            </VStack>
                            <VStack>
                              <Text fontSize="lg" fontWeight="bold">Campaigns</Text>
                              <Text fontSize="2xl">{selectedClient.campaigns_used}/{selectedClient.campaigns_limit}</Text>
                              <Progress
                                value={selectedClient.usage_percentage.campaigns}
                                colorScheme={selectedClient.usage_percentage.campaigns > 90 ? 'red' : 'blue'}
                                w="full"
                              />
                            </VStack>
                            <VStack>
                              <Text fontSize="lg" fontWeight="bold">Automations</Text>
                              <Text fontSize="2xl">{selectedClient.automations_used}/{selectedClient.automations_limit}</Text>
                              <Progress
                                value={selectedClient.usage_percentage.automations}
                                colorScheme={selectedClient.usage_percentage.automations > 90 ? 'red' : 'blue'}
                                w="full"
                              />
                            </VStack>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Heading size="md">Client Users</Heading>
                        <Button
                          leftIcon={<FiUserPlus />}
                          colorScheme="brand"
                          size="sm"
                          onClick={onUserModalOpen}
                        >
                          Add User
                        </Button>
                      </HStack>

                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Status</Th>
                            <Th>Last Login</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {clientUsers.map((user) => (
                            <Tr key={user.id}>
                              <Td>{user.first_name} {user.last_name}</Td>
                              <Td>{user.email}</Td>
                              <Td>
                                <Badge colorScheme={getAccessLevelColor(user.role)}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={user.is_active ? 'green' : 'red'}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </Td>
                              <Td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiSend />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Send invitation"
                                  />
                                  <IconButton
                                    icon={<FiEdit />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Edit user"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Recent Activity</Heading>
                      <VStack align="stretch" spacing={3}>
                        {clientActivities.map((activity) => (
                          <Card key={activity.id}>
                            <CardBody>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">{activity.description}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {activity.client_user_name || 'System'} • {new Date(activity.created_at).toLocaleString()}
                                  </Text>
                                </VStack>
                                <Badge colorScheme="brand">{activity.activity_type}</Badge>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Heading size="md">Billing & Invoices</Heading>
                        <Button
                          leftIcon={<FiCreditCard />}
                          colorScheme="brand"
                          size="sm"
                        >
                          Generate Invoice
                        </Button>
                      </HStack>

                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Invoice #</Th>
                            <Th>Period</Th>
                            <Th>Amount</Th>
                            <Th>Status</Th>
                            <Th>Payment Date</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {clientBilling.map((billing) => (
                            <Tr key={billing.id}>
                              <Td>{billing.invoice_number}</Td>
                              <Td>
                                {new Date(billing.billing_period_start).toLocaleDateString()} - {new Date(billing.billing_period_end).toLocaleDateString()}
                              </Td>
                              <Td>${billing.total_amount}</Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(billing.status)}>
                                  {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                                </Badge>
                              </Td>
                              <Td>
                                {billing.payment_date ? new Date(billing.payment_date).toLocaleDateString() : '-'}
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiDownload />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Download invoice"
                                  />
                                  <IconButton
                                    icon={<FiSend />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Send invoice"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      <Heading size="md">Portal Settings</Heading>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="sm">Access & Limits</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <Text>Access Level</Text>
                              <Badge colorScheme={getAccessLevelColor(selectedClient.access_level)}>
                                {selectedClient.access_level.charAt(0).toUpperCase() + selectedClient.access_level.slice(1)}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Monthly Fee</Text>
                              <Text fontWeight="bold">${selectedClient.monthly_fee}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Setup Fee</Text>
                              <Text fontWeight="bold">${selectedClient.setup_fee}</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardHeader>
                          <Heading size="sm">Customization</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <Text>Custom Branding</Text>
                              <Badge colorScheme={selectedClient.custom_branding ? 'green' : 'gray'}>
                                {selectedClient.custom_branding ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </HStack>
                            {selectedClient.custom_domain && (
                              <HStack justify="space-between">
                                <Text>Custom Domain</Text>
                                <Text>{selectedClient.custom_domain}</Text>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Add User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Client User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={userFormData.first_name}
                    onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={userFormData.last_name}
                    onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </Select>
              </FormControl>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Permissions</Text>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="view-analytics" mb="0">
                    View Analytics
                  </FormLabel>
                  <Switch
                    id="view-analytics"
                    isChecked={userFormData.can_view_analytics}
                    onChange={(e) => setUserFormData({ ...userFormData, can_view_analytics: e.target.checked })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="manage-campaigns" mb="0">
                    Manage Campaigns
                  </FormLabel>
                  <Switch
                    id="manage-campaigns"
                    isChecked={userFormData.can_manage_campaigns}
                    onChange={(e) => setUserFormData({ ...userFormData, can_manage_campaigns: e.target.checked })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="manage-contacts" mb="0">
                    Manage Contacts
                  </FormLabel>
                  <Switch
                    id="manage-contacts"
                    isChecked={userFormData.can_manage_contacts}
                    onChange={(e) => setUserFormData({ ...userFormData, can_manage_contacts: e.target.checked })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="manage-automations" mb="0">
                    Manage Automations
                  </FormLabel>
                  <Switch
                    id="manage-automations"
                    isChecked={userFormData.can_manage_automations}
                    onChange={(e) => setUserFormData({ ...userFormData, can_manage_automations: e.target.checked })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="export-data" mb="0">
                    Export Data
                  </FormLabel>
                  <Switch
                    id="export-data"
                    isChecked={userFormData.can_export_data}
                    onChange={(e) => setUserFormData({ ...userFormData, can_export_data: e.target.checked })}
                  />
                </FormControl>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUserModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreateUser}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyClientsPage; 