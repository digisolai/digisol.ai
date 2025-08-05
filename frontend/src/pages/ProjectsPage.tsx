import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  Grid,
  Flex,
  Icon,
  HStack,
  VStack,
  Divider,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Progress,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useColorModeValue,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  FiPlus, FiCalendar, FiUser, FiClock, FiCheckCircle, FiAlertCircle,
  FiBarChart2, FiGrid, FiList, FiSearch, FiFilter, FiDownload,
  FiShare2, FiCopy, FiArchive, FiEye, FiEdit, FiTrash2, FiMoreVertical,
  FiTrendingUp, FiTrendingDown, FiTarget, FiZap, FiStar, FiUsers,
  FiFolder, FiFileText, FiMessageSquare, FiSettings, FiHome
} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import { StandardPageLayout, StandardPageHeader } from '../components/StandardPageLayout';
import { StandardAIAgent } from '../components/StandardAIAgent';
import api from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  project_code: string;
  manager_info: {
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  actual_cost: number;
  tasks_count: number;
  progress_percentage: number;
  is_overdue: boolean;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_rate: number;
  duration_days: number;
  health_score: number;
  risk_level: string;
  predicted_completion_date: string;
  team_members: TeamMember[];
  risks: ProjectRisk[];
  promana_recommendations: PromanaRecommendation[];
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  capacity_hours: number;
  assigned_hours: number;
  skills: string[];
  hourly_rate?: number;
}

interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'active' | 'mitigated' | 'closed';
  mitigation_strategy?: string;
}

interface PromanaRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_actionable: boolean;
  is_dismissed: boolean;
  is_actioned: boolean;
  created_at: string;
}

interface CreateProjectData {
  name: string;
  description: string;
  project_type: string;
  start_date: string;
  end_date: string;
  budget: string;
  manager_id: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [promanaAgent, setPromanaAgent] = useState<any>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    project_type: 'custom',
    start_date: '',
    end_date: '',
    budget: '',
    manager_id: '',
  });

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchProjects();
    fetchPromanaAgent();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/project-management/projects/');
      setProjects(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromanaAgent = async () => {
    try {
      setLoadingAgent(true);
      const response = await api.get('/ai-services/agents/');
      const promanaAgent = response.data.results?.find((agent: unknown) => 
        agent.name.toLowerCase().includes('promana')
      );
      setPromanaAgent(promanaAgent);
    } catch (err) {
      console.error('Error fetching Promana agent:', err);
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setCreating(true);
      const response = await api.post('/project-management/projects/', formData);
      toast({
        title: 'Project created successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setFormData({
        name: '',
        description: '',
        project_type: 'custom',
        start_date: '',
        end_date: '',
        budget: '',
        manager_id: '',
      });
      fetchProjects();
    } catch (err) {
      toast({
        title: 'Failed to create project',
        status: 'error',
        duration: 3000,
      });
      console.error('Error creating project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleAskPromana = async (question: string) => {
    if (!promanaAgent) return;
    
    try {
      const response = await api.post(`/ai-services/agents/${promanaAgent.id}/chat/`, {
        message: question,
        context: {
          projects: projects.length,
          active_projects: projects.filter(p => p.status === 'active').length,
          overdue_projects: projects.filter(p => p.is_overdue).length
        }
      });
      
      toast({
        title: 'Promana Response',
        description: response.data.response,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to get Promana response',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'on_hold': return 'yellow';
      case 'at_risk': return 'orange';
      case 'cancelled': return 'red';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return FiCheckCircle;
      case 'completed': return FiCheckCircle;
      case 'on_hold': return FiClock;
      case 'at_risk': return FiAlertCircle;
      case 'cancelled': return FiAlertCircle;
      case 'draft': return FiFileText;
      default: return FiFileText;
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

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderProjectCard = (project: Project) => (
    <Card
      key={project.id}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="start">
          <Box flex="1">
            <Heading size="md" color={textColor} mb={1}>
              {project.name}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={2}>
              {project.project_code}
            </Text>
            <Badge colorScheme={getStatusColor(project.status)} variant="subtle">
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </Box>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem icon={<FiEye />} onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${project.id}`);
              }}>
                View Details
              </MenuItem>
              <MenuItem icon={<FiEdit />} onClick={(e) => e.stopPropagation()}>
                Edit Project
              </MenuItem>
              <MenuItem icon={<FiCopy />} onClick={(e) => e.stopPropagation()}>
                Duplicate
              </MenuItem>
              <MenuItem icon={<FiArchive />} onClick={(e) => e.stopPropagation()}>
                Archive
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {project.description || 'No description provided'}
          </Text>

          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.600">Progress</Text>
              <Text fontSize="sm" fontWeight="medium">{project.progress_percentage}%</Text>
            </Flex>
            <Progress
              value={project.progress_percentage}
              colorScheme={project.progress_percentage > 80 ? 'green' : project.progress_percentage > 50 ? 'yellow' : 'red'}
              size="sm"
              borderRadius="full"
            />
          </Box>

          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500">Health Score</Text>
              <Text fontSize="sm" fontWeight="medium" color={project.health_score > 80 ? 'green.500' : project.health_score > 60 ? 'yellow.500' : 'red.500'}>
                {project.health_score}/100
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">Risk Level</Text>
              <Text fontSize="sm" fontWeight="medium" color={project.risk_level === 'low' ? 'green.500' : project.risk_level === 'medium' ? 'yellow.500' : 'red.500'}>
                {project.risk_level.toUpperCase()}
              </Text>
            </Box>
          </SimpleGrid>

          <Divider />

          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FiCalendar} color="gray.400" />
              <Text fontSize="sm" color="gray.600">
                {formatDate(project.end_date)}
              </Text>
            </HStack>
            <AvatarGroup size="sm" max={3}>
              {project.team_members?.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  name={`${member.first_name} ${member.last_name}`}
                  src={member.avatar_url}
                  size="sm"
                />
              ))}
            </AvatarGroup>
          </Flex>

          {project.is_overdue && (
            <Alert status="warning" size="sm" borderRadius="md">
              <AlertIcon />
              <Text fontSize="xs">Project is overdue</Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderProjectList = (project: Project) => (
    <Card
      key={project.id}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardBody>
        <Grid templateColumns="1fr auto auto auto auto auto" gap={4} alignItems="center">
          <Box>
            <Heading size="sm" color={textColor} mb={1}>
              {project.name}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {project.project_code}
            </Text>
          </Box>
          
          <Badge colorScheme={getStatusColor(project.status)} variant="subtle">
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>
          
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="medium">{project.progress_percentage}%</Text>
            <Progress
              value={project.progress_percentage}
              colorScheme={project.progress_percentage > 80 ? 'green' : project.progress_percentage > 50 ? 'yellow' : 'red'}
              size="sm"
              width="60px"
            />
          </Box>
          
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="medium">{project.health_score}/100</Text>
            <Text fontSize="xs" color="gray.500">Health</Text>
          </Box>
          
          <Box textAlign="center">
            <Text fontSize="sm" fontWeight="medium">{formatDate(project.end_date)}</Text>
            <Text fontSize="xs" color="gray.500">Due Date</Text>
          </Box>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem icon={<FiEye />}>View Details</MenuItem>
              <MenuItem icon={<FiEdit />}>Edit Project</MenuItem>
              <MenuItem icon={<FiCopy />}>Duplicate</MenuItem>
              <MenuItem icon={<FiArchive />}>Archive</MenuItem>
            </MenuList>
          </Menu>
        </Grid>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <StandardPageLayout
        title=""
        breadcrumbItems={[{ label: "Project Manager" }]}
      >
        <StandardPageHeader
          title="Project Manager"
          actionButton={
            <Button
              leftIcon={<FiPlus />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              onClick={onOpen}
              size="lg"
            >
              Create Project
            </Button>
          }
        />

        {/* Ask Promana Section */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
          <CardBody>
            <VStack align="center" spacing={4} textAlign="center">
              <Box>
                <Heading size="md" color="brand.primary" mb={2}>
                  Ask Promana
                </Heading>
                <Text fontSize="sm" color="gray.600" maxW="600px">
                  Your intelligent project management assistant. Promana analyzes project data, identifies risks, 
                  optimizes resource allocation, and provides strategic recommendations to ensure your projects 
                  stay on track and within budget. Ask me anything about project timelines, team performance, 
                  risk mitigation, or strategic planning.
                </Text>
              </Box>
              <Button
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.700" }}
                leftIcon={<FiMessageSquare />}
                onClick={() => handleAskPromana("What are the top 3 risks in my current projects and how can I mitigate them?")}
              >
                Ask Promana A Question
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Dashboard Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Total Projects</StatLabel>
                <StatNumber color={textColor}>{projects.length}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Active Projects</StatLabel>
                <StatNumber color="green.500">
                  {projects.filter(p => p.status === 'active').length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">At Risk</StatLabel>
                <StatNumber color="orange.500">
                  {projects.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Overdue</StatLabel>
                <StatNumber color="red.500">
                  {projects.filter(p => p.is_overdue).length}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters and Search */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
          <CardBody>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
              <HStack flex="1" maxW="400px">
                <Icon as={FiSearch} color="gray.400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="filled"
                />
              </HStack>
              
              <HStack>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  variant="filled"
                  minW="150px"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="at_risk">At Risk</option>
                  <option value="draft">Draft</option>
                </Select>
                
                <IconButton
                  icon={selectedView === 'grid' ? <FiList /> : <FiGrid />}
                  onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
                  variant="outline"
                  aria-label="Toggle view"
                />
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Projects Grid/List */}
        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {filteredProjects.length === 0 ? (
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody textAlign="center" py={12}>
              <Icon as={FiFolder} size="48px" color="gray.400" mb={4} />
              <Text fontSize="lg" color="gray.600" mb={2}>
                No projects found
              </Text>
              <Text color="gray.500" mb={4}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first project'
                }
              </Text>
              
            </CardBody>
          </Card>
        ) : (
          <Stack spacing={4}>
            {selectedView === 'grid' ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {filteredProjects.map(renderProjectCard)}
              </Grid>
            ) : (
              <VStack spacing={3} align="stretch">
                {filteredProjects.map(renderProjectList)}
              </VStack>
            )}
          </Stack>
                 )}

        {/* Promana AI Agent */}
        {promanaAgent && (
          <Box mt={8}>
            <StandardAIAgent
              agent={promanaAgent}
              onAskQuestion={handleAskPromana}
              title="Promana AI Assistant"
              description="Get AI-powered insights and recommendations for your projects"
            />
          </Box>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Project Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Project Type</FormLabel>
                  <Select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  >
                    <option value="custom">Custom</option>
                    <option value="website_redesign">Website Redesign</option>
                    <option value="marketing_campaign">Marketing Campaign</option>
                    <option value="app_development">App Development</option>
                    <option value="social_media_strategy">Social Media Strategy</option>
                    <option value="seo_audit">SEO Audit</option>
                    <option value="brand_identity">Brand Identity</option>
                    <option value="content_creation">Content Creation</option>
                    <option value="email_campaign">Email Campaign</option>
                    <option value="event_planning">Event Planning</option>
                    <option value="product_launch">Product Launch</option>
                  </Select>
                </FormControl>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Budget (USD)</FormLabel>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Enter budget amount"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={handleCreateProject}
                isLoading={creating}
                loadingText="Creating..."
              >
                Create Project
              </Button>
            </ModalFooter>
          </ModalContent>
                 </Modal>
       </StandardPageLayout>
     </Layout>
   );
 };

export default ProjectsPage; 