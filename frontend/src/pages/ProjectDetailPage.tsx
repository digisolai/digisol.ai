import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  HStack,
  VStack,

  Icon,
  Avatar,
  AvatarGroup,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react';
import {
  FiArrowLeft, FiGrid, FiDownload,
  FiShare2, FiCopy, FiArchive, FiEye, FiEdit, FiMoreVertical,
  FiTrendingUp, FiTrendingDown,
  FiGlobe, FiPieChart, FiSettings as FiSettingsIcon,
  FiUpload, FiSend, FiLock, FiUnlock, FiTrash2,
  FiUsers as FiTeam, FiHome, FiFile
} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import ProjectOverviewTab from '../components/ProjectOverviewTab';
import TaskManagementTab from '../components/TaskManagementTab';
import ResourceManagementTab from '../components/ResourceManagementTab';
import ReportsAnalyticsTab from '../components/ReportsAnalyticsTab';
import ProjectSettingsTab from '../components/ProjectSettingsTab';
import api from '../services/api';
import type { Project, ProjectTask } from '../types/project';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isOpen, onClose } = useDisclosure();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [taskView, setTaskView] = useState<'kanban' | 'list' | 'gantt'>('kanban');

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-management/projects/${projectId}/`);
      setProject(response.data);
    } catch (err) {
      setError('Failed to fetch project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/project-management/tasks/?project=${projectId}`);
      setTasks(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleTasksUpdate = () => {
    fetchTasks();
    fetchProject(); // Refresh project data
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Box>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <Container maxW="full" px={6} py={6}>
          <Alert status="error">
            <AlertIcon />
            {error || 'Project not found'}
          </Alert>
          <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/projects')} mt={4}>
            Back to Projects
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="full" px={6} py={6}>
        {/* Header */}
        <Box mb={6}>
          <Breadcrumb mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                <Icon as={FiHome} mr={2} />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">
                Project Manager
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{project.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Flex justify="space-between" align="start" mb={6}>
            <Box flex="1">
              <Flex align="center" mb={2}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  mr={4}
                >
                  Back
                </Button>
                <Heading size="lg" color={textColor}>
                  {project.name}
                </Heading>
              </Flex>
              <Text fontSize="sm" color="gray.500" mb={2}>
                {project.project_code}
              </Text>
              <HStack spacing={4}>
                <Badge colorScheme={getStatusColor(project.status)} variant="subtle">
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {project.is_overdue && (
                  <Badge colorScheme="red" variant="solid">
                    OVERDUE
                  </Badge>
                )}
                {project.health_score < 70 && (
                  <Badge colorScheme="orange" variant="solid">
                    AT RISK
                  </Badge>
                )}
              </HStack>
            </Box>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<FiShare2 />}
                variant="outline"
                size="sm"
              >
                Share
              </Button>
              <Button
                leftIcon={<FiCopy />}
                variant="outline"
                size="sm"
              >
                Duplicate
              </Button>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="outline"
                  size="sm"
                />
                <MenuList>
                  <MenuItem icon={<FiEdit />}>Edit Project</MenuItem>
                  <MenuItem icon={<FiArchive />}>Archive</MenuItem>
                  <MenuItem icon={<FiDownload />}>Export</MenuItem>
                  <MenuItem icon={<FiTrash2 />} color="red.500">Delete</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Project Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
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
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Health Score</StatLabel>
                <StatNumber color={project.health_score > 80 ? 'green.500' : project.health_score > 60 ? 'yellow.500' : 'red.500'}>
                  {project.health_score}/100
                </StatNumber>
                <StatHelpText>
                  <Icon as={project.health_score > 80 ? FiTrendingUp : FiTrendingDown} color={project.health_score > 80 ? 'green.500' : 'red.500'} />
                  {project.health_score > 80 ? 'Excellent' : project.health_score > 60 ? 'Good' : 'Needs Attention'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Budget Used</StatLabel>
                <StatNumber color={textColor}>
                  {formatCurrency(project.actual_cost)}
                </StatNumber>
                <StatHelpText>
                  of {formatCurrency(project.budget)} ({Math.round((project.actual_cost / project.budget) * 100)}%)
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Team Members</StatLabel>
                <StatNumber color={textColor}>{project.team_members?.length || 0}</StatNumber>
                <StatHelpText>
                  <AvatarGroup size="xs" max={3}>
                    {project.team_members?.slice(0, 3).map((member) => (
                      <Avatar
                        key={member.id}
                        name={`${member.first_name} ${member.last_name}`}
                        src={member.avatar_url}
                        size="xs"
                      />
                    ))}
                  </AvatarGroup>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content Tabs */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>
                <Icon as={FiEye} mr={2} />
                Overview
              </Tab>
              <Tab>
                <Icon as={FiGrid} mr={2} />
                Tasks
              </Tab>
              <Tab>
                <Icon as={FiTeam} mr={2} />
                Resources
              </Tab>
              <Tab>
                <Icon as={FiFile} mr={2} />
                Files
              </Tab>
              <Tab>
                <Icon as={FiGlobe} mr={2} />
                Client Portal
              </Tab>
              <Tab>
                <Icon as={FiPieChart} mr={2} />
                Reports
              </Tab>
              <Tab>
                <Icon as={FiSettingsIcon} mr={2} />
                Settings
              </Tab>
            </TabList>

            <TabPanels>
              {/* Project Overview Tab */}
              <TabPanel>
                <ProjectOverviewTab project={project} />
              </TabPanel>

              {/* Task Management Tab */}
              <TabPanel>
                <TaskManagementTab
                  project={project}
                  tasks={tasks}
                  view={taskView}
                  onViewChange={setTaskView}
                  onTasksUpdate={handleTasksUpdate}
                />
              </TabPanel>

              {/* Resource Management Tab */}
              <TabPanel>
                <ResourceManagementTab project={project} />
              </TabPanel>

              {/* Files & Documents Tab */}
              <TabPanel>
                <Box>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md" color={textColor}>
                      Files & Documents
                    </Heading>
                    <Button
                      leftIcon={<FiUpload />}
                      colorScheme="brand"
                      size="sm"
                    >
                      Upload Files
                    </Button>
                  </Flex>
                  
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardBody>
                      <Text color="gray.500" textAlign="center" py={8}>
                        File management interface will be implemented here
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Client/Stakeholder Collaboration Tab */}
              <TabPanel>
                <Box>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md" color={textColor}>
                      Client Portal
                    </Heading>
                    <HStack>
                      <Button
                        leftIcon={project.client_portal_enabled ? <FiLock /> : <FiUnlock />}
                        colorScheme={project.client_portal_enabled ? 'green' : 'gray'}
                        size="sm"
                      >
                        {project.client_portal_enabled ? 'Portal Active' : 'Enable Portal'}
                      </Button>
                      <Button
                        leftIcon={<FiSend />}
                        colorScheme="brand"
                        size="sm"
                      >
                        Send Update
                      </Button>
                    </HStack>
                  </Flex>
                  
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardBody>
                      <Text color="gray.500" textAlign="center" py={8}>
                        Client portal interface will be implemented here
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Reports & Analytics Tab */}
              <TabPanel>
                <ReportsAnalyticsTab project={project} />
              </TabPanel>

              {/* Project Settings Tab */}
              <TabPanel>
                <ProjectSettingsTab project={project} onProjectUpdate={fetchProject} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>

        {/* Edit Project Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Project Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Project Name</FormLabel>
                  <Input defaultValue={project.name} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea defaultValue={project.description} rows={3} />
                </FormControl>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Start Date</FormLabel>
                    <Input type="date" defaultValue={project.start_date} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <Input type="date" defaultValue={project.end_date} />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select defaultValue={project.status}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Budget (USD)</FormLabel>
                  <Input type="number" defaultValue={project.budget} />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand">
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ProjectDetailPage; 