import React, { useState } from 'react';
import {
  Box, Heading, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Badge, Avatar, Progress, Grid, useToast, Icon, Flex, Stat, StatLabel, StatNumber, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Alert, AlertIcon, AlertTitle, AlertDescription, IconButton, Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
} from '@chakra-ui/react';
import {
  FiUsers, FiAlertTriangle, FiCheckCircle, FiClock, FiDollarSign, FiMoreVertical, FiEdit, FiEye, FiZap,
} from 'react-icons/fi';
import type { Project, TeamMember, ProjectRisk, PromanaRecommendation } from '../types/project';

interface ResourceManagementTabProps {
  project: Project;
}

const ResourceManagementTab: React.FC<ResourceManagementTabProps> = ({ project }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showSkillGapAnalysis, setShowSkillGapAnalysis] = useState(false);
  const toast = useToast();

  // Mock data for team members with enhanced information
  const teamMembers: TeamMember[] = project.team_members || [
    {
      id: '1',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah@example.com',
      role: 'UI/UX Designer',
      capacity_hours: 40,
      assigned_hours: 35,
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      hourly_rate: 75,
      utilization_percentage: 87.5,
      status: 'optimal',
      current_tasks: ['Design Homepage', 'Create Style Guide'],
      availability: 'busy',
    },
    {
      id: '2',
      first_name: 'Mike',
      last_name: 'Chen',
      email: 'mike@example.com',
      role: 'Frontend Developer',
      capacity_hours: 40,
      assigned_hours: 45,
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      hourly_rate: 85,
      utilization_percentage: 112.5,
      status: 'over_allocated',
      current_tasks: ['Implement Homepage', 'Fix Bugs', 'Code Review'],
      availability: 'busy',
    },
    {
      id: '3',
      first_name: 'Lisa',
      last_name: 'Wang',
      email: 'lisa@example.com',
      role: 'Backend Developer',
      capacity_hours: 40,
      assigned_hours: 30,
      skills: ['Node.js', 'Python', 'Database Design', 'API Development'],
      hourly_rate: 90,
      utilization_percentage: 75,
      status: 'under_allocated',
      current_tasks: ['API Development'],
      availability: 'available',
    },
    {
      id: '4',
      first_name: 'David',
      last_name: 'Brown',
      email: 'david@example.com',
      role: 'Project Manager',
      capacity_hours: 40,
      assigned_hours: 38,
      skills: ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Communication'],
      hourly_rate: 100,
      utilization_percentage: 95,
      status: 'optimal',
      current_tasks: ['Project Coordination', 'Client Communication'],
      availability: 'busy',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_allocated':
        return 'green';
      case 'optimal':
        return 'blue';
      case 'over_allocated':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'green';
      case 'busy':
        return 'yellow';
      case 'unavailable':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return FiCheckCircle;
      case 'busy':
        return FiClock;
      case 'unavailable':
        return FiAlertTriangle;
      default:
        return FiClock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePromanaOverloadAlerts = () => {
    const overloadedMembers = teamMembers.filter(member => member.status === 'over_allocated');
    if (overloadedMembers.length > 0) {
      toast({
        title: 'Promana Overload Alert',
        description: `${overloadedMembers.length} team member(s) are over-allocated`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePromanaUnderUtilizationAlerts = () => {
    const underUtilizedMembers = teamMembers.filter(member => member.status === 'under_allocated');
    if (underUtilizedMembers.length > 0) {
      toast({
        title: 'Promana Under-utilization Alert',
        description: `${underUtilizedMembers.length} team member(s) have available capacity`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSkillGapAnalysis = () => {
    setShowSkillGapAnalysis(true);
    toast({
      title: 'Promana Skill Gap Analysis',
      description: 'Analyzing project requirements against team skills...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const totalCapacity = teamMembers.reduce((sum, member) => sum + member.capacity_hours, 0);
  const totalAssigned = teamMembers.reduce((sum, member) => sum + member.assigned_hours, 0);
  const overallUtilization = (totalAssigned / totalCapacity) * 100;
  const totalCost = teamMembers.reduce((sum, member) => sum + (member.assigned_hours * (member.hourly_rate || 0)), 0);

  const overloadedMembers = teamMembers.filter(member => member.status === 'over_allocated');
  const underUtilizedMembers = teamMembers.filter(member => member.status === 'under_allocated');

  return (
    <Box>
      {/* Team Capacity Dashboard */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Team Capacity Dashboard</Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FiZap} />}
                variant="outline"
                onClick={handlePromanaOverloadAlerts}
              >
                Promana: Overload Alerts
              </Button>
              <Button
                leftIcon={<Icon as={FiZap} />}
                variant="outline"
                onClick={handlePromanaUnderUtilizationAlerts}
              >
                Promana: Under-utilization Alerts
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6} mb={6}>
            <Stat>
              <StatLabel>Total Capacity</StatLabel>
              <StatNumber>{totalCapacity}h</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Assigned Hours</StatLabel>
              <StatNumber>{totalAssigned}h</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Utilization Rate</StatLabel>
              <StatNumber>{overallUtilization.toFixed(1)}%</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Cost</StatLabel>
              <StatNumber>{formatCurrency(totalCost)}</StatNumber>
            </Stat>
          </Grid>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                Overall Team Utilization
              </Text>
              <Text fontSize="sm" color="gray.600">
                {overallUtilization.toFixed(1)}%
              </Text>
            </HStack>
            <Progress
              value={overallUtilization}
              colorScheme={overallUtilization > 100 ? 'red' : overallUtilization > 80 ? 'blue' : 'green'}
              size="lg"
              borderRadius="full"
            />
          </Box>

          {/* Alerts */}
          {overloadedMembers.length > 0 && (
            <Alert status="warning" mt={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Resource Overload Detected!</AlertTitle>
                <AlertDescription>
                  {overloadedMembers.length} team member(s) are over-allocated. Consider redistributing tasks.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {underUtilizedMembers.length > 0 && (
            <Alert status="info" mt={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Available Capacity</AlertTitle>
                <AlertDescription>
                  {underUtilizedMembers.length} team member(s) have available capacity for additional tasks.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Individual Member Workload */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Individual Member Workload</Heading>
            <Button
              leftIcon={<Icon as={FiZap} />}
              variant="outline"
              onClick={handleSkillGapAnalysis}
            >
              Promana: Skill Gap Analysis
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Team Member</Th>
                  <Th>Role</Th>
                  <Th>Capacity</Th>
                  <Th>Assigned</Th>
                  <Th>Utilization</Th>
                  <Th>Status</Th>
                  <Th>Availability</Th>
                  <Th>Cost</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {teamMembers.map((member) => (
                  <Tr key={member.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => setSelectedMember(member)}>
                    <Td>
                      <HStack>
                        <Avatar
                          size="sm"
                          name={`${member.first_name} ${member.last_name}`}
                          src={member.avatar_url}
                        />
                        <Box>
                          <Text fontWeight="medium">
                            {member.first_name} {member.last_name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {member.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{member.role}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{member.capacity_hours}h</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{member.assigned_hours}h</Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{member.utilization_percentage}%</Text>
                        <Progress
                          value={member.utilization_percentage}
                          size="sm"
                          width="80px"
                          colorScheme={getStatusColor(member.status || 'optimal')}
                        />
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(member.status || 'optimal')}>
                        {(member.status || 'optimal').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Icon as={getAvailabilityIcon(member.availability || 'available')} color={`${getAvailabilityColor(member.availability || 'available')}.500`} />
                        <Badge colorScheme={getAvailabilityColor(member.availability || 'available')} size="sm">
                          {(member.availability || 'available').toUpperCase()}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {formatCurrency(member.assigned_hours * (member.hourly_rate || 0))}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon as={FiMoreVertical} />}
                          size="sm"
                          variant="ghost"
                          aria-label="Member actions"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <MenuList>
                          <MenuItem icon={<Icon as={FiEye} />}>View Details</MenuItem>
                          <MenuItem icon={<Icon as={FiEdit} />}>Edit Capacity</MenuItem>
                          <MenuItem icon={<Icon as={FiUsers} />}>Reassign Tasks</MenuItem>
                          <MenuItem icon={<Icon as={FiDollarSign} />}>View Cost Analysis</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Skills Matrix */}
      <Card>
        <CardHeader>
          <Heading size="md">Skills Matrix</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
            {teamMembers.map((member) => (
              <Card key={member.id} variant="outline">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="medium">
                        {member.first_name} {member.last_name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {member.role}
                      </Text>
                    </HStack>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Skills:
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {member.skills.map((skill) => (
                          <Badge key={skill} colorScheme="blue" variant="subtle">
                            {skill}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Current Tasks:
                      </Text>
                      <VStack align="start" spacing={1}>
                        {member.current_tasks?.map((task, index) => (
                          <Text key={index} fontSize="sm" color="gray.600">
                            • {task}
                          </Text>
                        ))}
                      </VStack>
                    </Box>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Rate: {formatCurrency(member.hourly_rate || 0)}/h
                      </Text>
                      <Badge colorScheme={getStatusColor(member.status || 'optimal')}>
                        {member.utilization_percentage}% utilized
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Member Detail Modal */}
      <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMember && `${selectedMember.first_name} ${selectedMember.last_name}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMember && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Role:</Text>
                  <Text>{selectedMember.role}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Capacity:</Text>
                  <Text>{selectedMember.capacity_hours}h</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Assigned:</Text>
                  <Text>{selectedMember.assigned_hours}h</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Utilization:</Text>
                  <Text>{selectedMember.utilization_percentage}%</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Hourly Rate:</Text>
                  <Text>{formatCurrency(selectedMember.hourly_rate || 0)}</Text>
                </HStack>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Skills:</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {selectedMember.skills.map((skill) => (
                      <Badge key={skill} colorScheme="blue">
                        {skill}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Current Tasks:</Text>
                  <VStack align="start" spacing={1}>
                    {selectedMember.current_tasks?.map((task, index) => (
                      <Text key={index} fontSize="sm">
                        • {task}
                      </Text>
                    )) || (
                      <Text fontSize="sm" color="gray.500">
                        No current tasks
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setSelectedMember(null)}>
              Close
            </Button>
            <Button variant="brand">
              Edit Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Skill Gap Analysis Modal */}
      <Modal isOpen={showSkillGapAnalysis} onClose={() => setShowSkillGapAnalysis(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Promana's Skill Gap Analysis</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Analysis Complete</AlertTitle>
                  <AlertDescription>
                    Promana has analyzed the project requirements against your team's skills.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Card bg="green.50" border="1px solid" borderColor="green.200">
                <CardBody>
                  <Text fontSize="sm" fontWeight="medium" color="green.800" mb={2}>
                    Strong Skills Coverage:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="green.700">• Frontend Development (React, TypeScript)</Text>
                    <Text fontSize="sm" color="green.700">• UI/UX Design (Figma, Prototyping)</Text>
                    <Text fontSize="sm" color="green.700">• Project Management (Agile, Scrum)</Text>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="orange.50" border="1px solid" borderColor="orange.200">
                <CardBody>
                  <Text fontSize="sm" fontWeight="medium" color="orange.800" mb={2}>
                    Skills Gaps Identified:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="orange.700">• DevOps & CI/CD (Jenkins, Docker)</Text>
                    <Text fontSize="sm" color="orange.700">• Mobile Development (React Native)</Text>
                    <Text fontSize="sm" color="orange.700">• Data Analytics (Python, SQL)</Text>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="blue.50" border="1px solid" borderColor="blue.200">
                <CardBody>
                  <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
                    Recommendations:
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="blue.700">• Consider hiring a DevOps specialist</Text>
                    <Text fontSize="sm" color="blue.700">• Provide training for mobile development</Text>
                    <Text fontSize="sm" color="blue.700">• Upskill team in data analytics</Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowSkillGapAnalysis(false)}>
              Close
            </Button>
            <Button variant="brand">
              View Detailed Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResourceManagementTab; 