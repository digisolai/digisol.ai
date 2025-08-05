import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Badge, 
  FormControl, FormLabel, Input, Textarea, Select, Switch, useToast, Icon, Flex,
  Divider, SimpleGrid, Alert, AlertIcon, Spinner, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Checkbox,
  CheckboxGroup, Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue,
  IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar, AvatarGroup
} from '@chakra-ui/react';
import {
  FiEdit, FiSave, FiTrash2, FiUsers, FiBell, FiLock, FiUnlock, FiGlobe, FiSettings,
  FiPlus, FiMoreVertical, FiEye, FiEyeOff, FiDownload, FiUpload, FiShield,
  FiCalendar, FiDollarSign, FiTarget, FiZap, FiStar
} from 'react-icons/fi';
import api from '../services/api';
import type { Project, TeamMember } from '../types/project';

interface ProjectSettingsTabProps {
  project: Project;
  onProjectUpdate: () => void;
}

const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({ project, onProjectUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    project_type: project.project_type,
    start_date: project.start_date,
    end_date: project.end_date,
    status: project.status,
    budget: project.budget,
    client_name: project.client_name || '',
    client_email: project.client_email || '',
    client_portal_enabled: project.client_portal_enabled,
    notification_settings: project.notification_settings || {},
    custom_fields: project.custom_fields || {},
    integration_settings: project.integration_settings || {}
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchTeamMembers();
  }, [project.id]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get(`/project-management/projects/${project.id}/resource_management/`);
      setTeamMembers(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(`/project-management/projects/${project.id}/`, formData);
      
      toast({
        title: 'Success',
        description: 'Project settings updated successfully',
        status: 'success',
        duration: 3000,
      });
      
      setIsEditing(false);
      onProjectUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project settings',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color={textColor}>
          Project Settings
        </Heading>
        <HStack spacing={3}>
          {isEditing ? (
            <>
              <Button
                leftIcon={<FiSave />}
                variant="brand"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: project.name,
                    description: project.description,
                    project_type: project.project_type,
                    start_date: project.start_date,
                    end_date: project.end_date,
                    status: project.status,
                    budget: project.budget,
                    client_name: project.client_name || '',
                    client_email: project.client_email || '',
                    client_portal_enabled: project.client_portal_enabled,
                    notification_settings: project.notification_settings || {},
                    custom_fields: project.custom_fields || {},
                    integration_settings: project.integration_settings || {}
                  });
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              leftIcon={<FiEdit />}
              variant="brand"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Settings
            </Button>
          )}
        </HStack>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>General</Tab>
          <Tab>Team & Permissions</Tab>
          <Tab>Notifications</Tab>
          <Tab>Integrations</Tab>
          <Tab>Custom Fields</Tab>
        </TabList>

        <TabPanels>
          {/* General Settings Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Basic Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Project Name</FormLabel>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      ) : (
                        <Text fontWeight="bold">{project.name}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Project Code</FormLabel>
                      <Text color="gray.600">{project.project_code}</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      {isEditing ? (
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <Text>{project.description || 'No description provided'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Project Type</FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.project_type}
                          onChange={(e) => handleInputChange('project_type', e.target.value)}
                        >
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
                          <option value="custom">Custom</option>
                        </Select>
                      ) : (
                        <Badge colorScheme="blue" variant="subtle">
                          {project.project_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="on_hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Select>
                      ) : (
                        <Badge colorScheme={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Timeline & Budget</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <FormControl>
                        <FormLabel>Start Date</FormLabel>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                          />
                        ) : (
                          <Text>{new Date(project.start_date).toLocaleDateString()}</Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>End Date</FormLabel>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                          />
                        ) : (
                          <Text>{new Date(project.end_date).toLocaleDateString()}</Text>
                        )}
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Budget</FormLabel>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', parseFloat(e.target.value))}
                        />
                      ) : (
                        <Text fontWeight="bold">{formatCurrency(project.budget)}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Project Manager</FormLabel>
                      <HStack>
                        <Avatar size="sm" name={`${project.manager_info.first_name} ${project.manager_info.last_name}`} />
                        <Text>{project.manager_info.first_name} {project.manager_info.last_name}</Text>
                      </HStack>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card bg={cardBg} border="1px solid" borderColor={borderColor} mt={6}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Client Information</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Client Name</FormLabel>
                    {isEditing ? (
                      <Input
                        value={formData.client_name}
                        onChange={(e) => handleInputChange('client_name', e.target.value)}
                        placeholder="Enter client name"
                      />
                    ) : (
                      <Text>{project.client_name || 'Not specified'}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Client Email</FormLabel>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => handleInputChange('client_email', e.target.value)}
                        placeholder="Enter client email"
                      />
                    ) : (
                      <Text>{project.client_email || 'Not specified'}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Client Portal</FormLabel>
                    <HStack>
                      <Switch
                        isChecked={formData.client_portal_enabled}
                        onChange={(e) => handleInputChange('client_portal_enabled', e.target.checked)}
                        isDisabled={!isEditing}
                      />
                      <Text>{formData.client_portal_enabled ? 'Enabled' : 'Disabled'}</Text>
                    </HStack>
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Team & Permissions Tab */}
          <TabPanel>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color={textColor}>Team Members</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="brand"
                    size="sm"
                  >
                    Add Member
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {teamMembers.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No team members assigned to this project.
                  </Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {teamMembers.map((member) => (
                      <Box
                        key={member.id}
                        p={4}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                      >
                        <Flex justify="space-between" align="center">
                          <HStack>
                            <Avatar size="sm" name={`${member.first_name} ${member.last_name}`} />
                            <Box>
                              <Text fontWeight="bold">
                                {member.first_name} {member.last_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {member.email}
                              </Text>
                              <Badge colorScheme="blue" variant="subtle" mt={1}>
                                {member.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </Box>
                          </HStack>
                          
                          <HStack spacing={2}>
                            <Switch
                              isChecked={member.is_active}
                              size="sm"
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                              />
                              <MenuList>
                                <MenuItem icon={<FiEdit />}>Edit Permissions</MenuItem>
                                <MenuItem icon={<FiEye />}>View Profile</MenuItem>
                                <MenuItem icon={<FiTrash2 />} color="red.500">Remove</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Notification Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={3}>Email Notifications</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text>Task assignments</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Status changes</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Due date reminders</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Project updates</Text>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Risk alerts</Text>
                        <Switch defaultChecked />
                      </HStack>
                    </VStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={3}>In-App Notifications</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text>New comments</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>File uploads</Text>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Milestone completions</Text>
                        <Switch defaultChecked />
                      </HStack>
                    </VStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={3}>Client Notifications</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text>Progress updates</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Approval requests</Text>
                        <Switch defaultChecked />
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Deliverable notifications</Text>
                        <Switch />
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Integrations Tab */}
          <TabPanel>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>External Integrations</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={3}>Development Tools</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>GitHub</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>GitLab</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Jira</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                    </VStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={3}>Communication Tools</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Slack</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Microsoft Teams</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Discord</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                    </VStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={3}>File Storage</Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Google Drive</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>Dropbox</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiGlobe} color="brand.500" />
                          <Text>OneDrive</Text>
                        </HStack>
                        <Switch />
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Custom Fields Tab */}
          <TabPanel>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color={textColor}>Custom Fields</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="brand"
                    size="sm"
                  >
                    Add Field
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text color="gray.500" textAlign="center" py={8}>
                  Custom fields allow you to add project-specific data points.
                  <br />
                  <Text fontSize="sm" mt={2}>
                    This feature will be implemented to allow custom field creation and management.
                  </Text>
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ProjectSettingsTab; 