import React, { useState } from 'react';
import api from '../services/api';
import {
  Box, Heading, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Badge, Avatar, List, ListItem, ListIcon, Icon, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea, Progress, Grid, GridItem, useToast, IconButton, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import {
  FiEdit, FiCalendar, FiFileText, FiMessageSquare, FiUpload, FiDownload, FiEye, FiTrash2, FiMoreVertical, FiCheckCircle, FiClock, FiTarget, FiZap, FiStar,
} from 'react-icons/fi';
 import type { Project } from '../types/project';

interface Milestone {
  id: string;
  name: string;
  description: string;
  due_date: string;
  status: 'upcoming' | 'completed' | 'overdue';
  completion_percentage: number;
}

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'comment_added' | 'file_uploaded' | 'status_changed' | 'promana_alert';
  user: string;
  message: string;
  timestamp: string;
  related_item?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  folder: string;
  version: number;
}

interface ProjectOverviewTabProps {
  project: Project;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(project.description || '');
  const [showPromanaGoals, setShowPromanaGoals] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Mock data - in real implementation, these would come from API
  const milestones: Milestone[] = [
    {
      id: '1',
      name: 'Project Kickoff',
      description: 'Initial project setup and team alignment',
      due_date: '2024-01-15',
      status: 'completed',
      completion_percentage: 100,
    },
    {
      id: '2',
      name: 'Requirements Gathering',
      description: 'Complete stakeholder interviews and requirements documentation',
      due_date: '2024-02-01',
      status: 'completed',
      completion_percentage: 100,
    },
    {
      id: '3',
      name: 'Design Phase',
      description: 'Complete UI/UX design and technical architecture',
      due_date: '2024-03-15',
      status: 'upcoming',
      completion_percentage: 75,
    },
    {
      id: '4',
      name: 'Development Phase',
      description: 'Core development and feature implementation',
      due_date: '2024-05-01',
      status: 'upcoming',
      completion_percentage: 30,
    },
    {
      id: '5',
      name: 'Testing & QA',
      description: 'Comprehensive testing and quality assurance',
      due_date: '2024-06-15',
      status: 'upcoming',
      completion_percentage: 0,
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      user: 'Sarah Johnson',
      message: 'completed task "Design Homepage Mockups"',
      timestamp: '2024-01-20T10:30:00Z',
      related_item: 'Task #123',
    },
    {
      id: '2',
      type: 'comment_added',
      user: 'Mike Chen',
      message: 'added a comment on "API Integration"',
      timestamp: '2024-01-20T09:15:00Z',
      related_item: 'Task #124',
    },
    {
      id: '3',
      type: 'file_uploaded',
      user: 'Lisa Wang',
      message: 'uploaded "Design System Guidelines.pdf"',
      timestamp: '2024-01-19T16:45:00Z',
      related_item: 'Files',
    },
    {
      id: '4',
      type: 'promana_alert',
      user: 'Promana AI',
      message: 'identified potential resource bottleneck in Design team',
      timestamp: '2024-01-19T14:20:00Z',
      related_item: 'Risk Alert',
    },
    {
      id: '5',
      type: 'status_changed',
      user: 'Project Manager',
      message: 'changed project status to "In Progress"',
      timestamp: '2024-01-19T11:00:00Z',
      related_item: 'Project Status',
    },
  ];

  const projectFiles: ProjectFile[] = [
    {
      id: '1',
      name: 'Project Charter.pdf',
      file_url: '/files/project-charter.pdf',
      file_size: 2048576,
      file_type: 'pdf',
      uploaded_by: 'Project Manager',
      uploaded_at: '2024-01-15T10:00:00Z',
      folder: 'Project Documents',
      version: 1,
    },
    {
      id: '2',
      name: 'Requirements Specification.docx',
      file_url: '/files/requirements.docx',
      file_size: 1048576,
      file_type: 'docx',
      uploaded_by: 'Business Analyst',
      uploaded_at: '2024-01-18T14:30:00Z',
      folder: 'Requirements',
      version: 2,
    },
    {
      id: '3',
      name: 'Design System Guidelines.pdf',
      file_url: '/files/design-system.pdf',
      file_size: 5120000,
      file_type: 'pdf',
      uploaded_by: 'UI/UX Designer',
      uploaded_at: '2024-01-19T16:45:00Z',
      folder: 'Design',
      version: 1,
    },
  ];

  const handleSaveDescription = () => {
    // In real implementation, this would call an API
    toast({
      title: 'Success',
      description: 'Project description updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsEditingDescription(false);
  };

  const handlePromanaSuggestGoals = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/project-management/projects/${project.id}/ask_promana/`, {
        query: `Suggest goals and scope for a project called "${project.name}". Consider the current description: ${project.description}`,
        context: {
          current_description: project.description
        }
      });
      
      toast({
        title: 'Promana AI Suggestion',
        description: response.data.response,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error getting Promana suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestion',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return FiCheckCircle;
      case 'comment_added':
        return FiMessageSquare;
      case 'file_uploaded':
        return FiUpload;
      case 'promana_alert':
        return FiZap;
      case 'status_changed':
        return FiTarget;
      default:
        return FiClock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'green';
      case 'promana_alert':
        return 'orange';
      case 'status_changed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={6}>
      {/* Left Column */}
      <GridItem colSpan={8}>
        {/* Project Description & Goals */}
        <Card mb={6}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Project Description & Goals</Heading>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FiZap} />}
                  size="sm"
                  variant="brand"
                  onClick={handlePromanaSuggestGoals}
                >
                  Promana: Suggest Goals
                </Button>
                <IconButton
                  icon={<Icon as={FiEdit} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingDescription(true)}
                  aria-label="Edit description"
                />
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            {isEditingDescription ? (
              <VStack spacing={4}>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Enter project description and goals..."
                />
                <HStack spacing={2}>
                  <Button size="sm" variant="brand" onClick={handleSaveDescription}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Text color="gray.700" lineHeight="tall">
                {description || 'No project description provided. Click the edit button to add a description and goals for this project.'}
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Key Milestones */}
        <Card mb={6}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Key Milestones</Heading>
              <Button
                leftIcon={<Icon as={FiZap} />}
                size="sm"
                variant="brand"
              >
                Promana: Flag Missed Milestones
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {milestones.map((milestone) => (
                <Box key={milestone.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box flex={1}>
                      <HStack spacing={2} mb={1}>
                        <Text fontWeight="medium">{milestone.name}</Text>
                        <Badge
                          colorScheme={
                            milestone.status === 'completed' ? 'green' :
                            milestone.status === 'overdue' ? 'red' : 'blue'
                          }
                          size="sm"
                        >
                          {milestone.status.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        {milestone.description}
                      </Text>
                      <HStack spacing={4}>
                        <HStack spacing={1}>
                          <Icon as={FiCalendar} color="gray.500" />
                          <Text fontSize="sm" color="gray.600">
                            Due: {formatDate(milestone.due_date)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {milestone.completion_percentage}% complete
                        </Text>
                      </HStack>
                    </Box>
                  </Flex>
                  <Progress
                    value={milestone.completion_percentage}
                    colorScheme={
                      milestone.status === 'completed' ? 'green' :
                      milestone.status === 'overdue' ? 'red' : 'blue'
                    }
                    size="sm"
                  />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {recentActivity.map((activity) => (
                <HStack key={activity.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
                  <Icon
                    as={getActivityIcon(activity.type)}
                    color={`${getActivityColor(activity.type)}.500`}
                    boxSize={5}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.user}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {activity.message}
                    </Text>
                    <HStack spacing={2} mt={1}>
                      <Text fontSize="xs" color="gray.500">
                        {formatTime(activity.timestamp)}
                      </Text>
                      {activity.related_item && (
                        <Badge size="sm" variant="outline" colorScheme="gray">
                          {activity.related_item}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </GridItem>

      {/* Right Column */}
      <GridItem colSpan={4}>
        {/* Team Members & Roles */}
        <Card mb={6}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Team Members</Heading>
              <Button
                leftIcon={<Icon as={FiZap} />}
                size="sm"
                variant="brand"
              >
                Promana: Suggest Team
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {project.team_members?.map((member) => (
                <HStack key={member.id} spacing={3}>
                  <Avatar
                    size="sm"
                    name={`${member.first_name} ${member.last_name}`}
                    src={member.avatar_url}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {member.first_name} {member.last_name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {member.role}
                    </Text>
                    <HStack spacing={1} mt={1}>
                      {member.skills?.slice(0, 2).map((skill) => (
                        <Badge key={skill} size="xs" colorScheme="brand" variant="subtle">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills?.length > 2 && (
                        <Badge size="xs" colorScheme="gray" variant="subtle">
                          +{member.skills.length - 2} more
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">File Attachments</Heading>
              <Button
                leftIcon={<Icon as={FiUpload} />}
                size="sm"
                variant="brand"
              >
                Upload Files
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {projectFiles.map((file) => (
                <HStack key={file.id} spacing={3} p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Icon as={FiFileText} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {file.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatFileSize(file.file_size)} • {file.uploaded_by}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<Icon as={FiMoreVertical} />}
                      size="sm"
                      variant="ghost"
                      aria-label="File actions"
                    />
                    <MenuList>
                      <MenuItem icon={<Icon as={FiEye} />}>Preview</MenuItem>
                      <MenuItem icon={<Icon as={FiDownload} />}>Download</MenuItem>
                      <MenuItem icon={<Icon as={FiEdit} />}>Rename</MenuItem>
                      <MenuItem icon={<Icon as={FiTrash2} />} color="red.500">Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </GridItem>

      {/* Promana Goals Modal */}
      <Modal isOpen={showPromanaGoals} onClose={() => setShowPromanaGoals(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Promana's Suggested Goals & Scope</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Card bg="blue.50" border="1px solid" borderColor="blue.200">
                <CardBody>
                  <Text fontSize="sm" color="blue.800">
                    Based on the project type and current context, Promana suggests the following goals and scope:
                  </Text>
                </CardBody>
              </Card>
              
              <Box>
                <Text fontWeight="medium" mb={2}>Suggested Project Goals:</Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FiTarget} color="blue.500" />
                    Deliver a fully functional web application within the specified timeline
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiTarget} color="blue.500" />
                    Ensure high user experience standards with intuitive interface design
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiTarget} color="blue.500" />
                    Implement robust security measures and data protection protocols
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiTarget} color="blue.500" />
                    Provide comprehensive documentation and training materials
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>Recommended Scope Adjustments:</Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FiStar} color="orange.500" />
                    Consider adding user feedback collection mechanism
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiStar} color="orange.500" />
                    Include performance monitoring and analytics integration
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiStar} color="orange.500" />
                    Plan for scalability and future feature expansion
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowPromanaGoals(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={() => setShowPromanaGoals(false)}>
              Apply Suggestions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default ProjectOverviewTab; 