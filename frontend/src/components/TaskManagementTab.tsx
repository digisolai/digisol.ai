import React, { useState } from 'react';
import {
  Box, Heading, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Badge, Avatar, Progress, Grid, useToast, IconButton, Menu, MenuButton, MenuList, MenuItem, Table, Thead, Tbody, Tr, Th, Td, TableContainer, InputGroup, InputLeftElement, Checkbox, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Icon, Tooltip, Flex, Input, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Textarea,
} from '@chakra-ui/react';
import {
  FiPlus, FiCalendar, FiUser, FiClock, FiCheckCircle, FiAlertCircle, FiBarChart, FiGrid, FiList, FiSearch, FiEdit, FiTrash2, FiMoreVertical, FiMessageSquare, FiPaperclip, FiTrendingUp, FiZap, FiEye, FiFlag, FiFileText, FiDownload,
} from 'react-icons/fi';
import type { Project, ProjectTask } from '../types/project';

interface TaskManagementTabProps {
  project: Project;
  tasks: ProjectTask[];
  view: 'kanban' | 'list' | 'gantt';
  onViewChange: (view: 'kanban' | 'list' | 'gantt') => void;
  onTasksUpdate: () => void;
}

const TaskManagementTab: React.FC<TaskManagementTabProps> = ({
  project: _project,
  tasks,
  view,
  onViewChange,
  onTasksUpdate: _onTasksUpdate,
}) => {
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [showPromanaSmartAdd, setShowPromanaSmartAdd] = useState(false);
  const [smartTaskInput, setSmartTaskInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen: isTaskDetailOpen, onOpen: onTaskDetailOpen, onClose: onTaskDetailClose } = useDisclosure();
  const toast = useToast();

  // Mock data for team members - commented out as not currently used
  // const teamMembers = project.team_members || [
  //   { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com', role: 'UI/UX Designer' },
  //   { id: '2', first_name: 'Mike', last_name: 'Chen', email: 'mike@example.com', role: 'Frontend Developer' },
  //   { id: '3', first_name: 'Lisa', last_name: 'Wang', email: 'lisa@example.com', role: 'Backend Developer' },
  // ];

  const kanbanColumns = [
    { id: 'pending', title: 'To Do', color: 'yellow' },
    { id: 'in_progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'purple' },
    { id: 'completed', title: 'Done', color: 'green' },
    { id: 'blocked', title: 'Blocked', color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'review':
        return 'purple';
      case 'pending':
        return 'yellow';
      case 'blocked':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return FiCheckCircle;
      case 'in_progress':
        return FiClock;
      case 'review':
        return FiEye;
      case 'pending':
        return FiAlertCircle;
      case 'blocked':
        return FiAlertCircle;
      default:
        return FiAlertCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePromanaSmartAdd = () => {
    if (smartTaskInput.trim()) {
      // In real implementation, this would call Promana AI to parse the input
      toast({
        title: 'Promana AI',
        description: 'Parsing task details and creating task...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setShowPromanaSmartAdd(false);
      setSmartTaskInput('');
    }
  };

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task);
    onTaskDetailOpen();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderKanbanBoard = () => (
    <Box overflowX="auto">
      <HStack spacing={4} minW="max-content">
        {kanbanColumns.map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          return (
            <Box key={column.id} minW="300px" maxW="300px">
              <Card>
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <HStack>
                      <Badge colorScheme={column.color} variant="subtle">
                        {columnTasks.length}
                      </Badge>
                      <Text fontWeight="medium">{column.title}</Text>
                    </HStack>
                    <IconButton
                      icon={<Icon as={FiPlus} />}
                      size="sm"
                      variant="ghost"
                      aria-label={`Add task to ${column.title}`}
                      onClick={() => setShowPromanaSmartAdd(true)}
                    />
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    {columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        cursor="pointer"
                        _hover={{ shadow: 'md' }}
                        onClick={() => handleTaskClick(task)}
                        borderLeft="4px solid"
                        borderLeftColor={`${getStatusColor(task.status)}.500`}
                      >
                        <CardBody p={3}>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                                {task.name}
                              </Text>
                              <HStack spacing={1}>
                                {task.promana_risk_indicator && (
                                  <Tooltip label="Promana Risk Alert">
                                    <Icon as={FiFlag} color="red.500" boxSize={4} />
                                  </Tooltip>
                                )}
                                {task.promana_acceleration_opportunity && (
                                  <Tooltip label="Promana Acceleration Opportunity">
                                    <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                                  </Tooltip>
                                )}
                              </HStack>
                            </HStack>
                            
                            <Text fontSize="xs" color="gray.600" noOfLines={2}>
                              {task.description}
                            </Text>

                            <HStack justify="space-between">
                              <Avatar
                                size="xs"
                                name={`${task.assigned_to_info?.first_name} ${task.assigned_to_info?.last_name}`}
                              />
                              <Badge size="sm" colorScheme={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </HStack>

                            <Box>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" color="gray.600">
                                  Progress
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {task.progress_percentage}%
                                </Text>
                              </HStack>
                              <Progress
                                value={task.progress_percentage}
                                size="xs"
                                colorScheme={getStatusColor(task.status)}
                              />
                            </Box>

                            <HStack justify="space-between" fontSize="xs" color="gray.600">
                              <HStack spacing={1}>
                                <Icon as={FiCalendar} />
                                <Text>{formatDate(task.end_date)}</Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={FiClock} />
                                <Text>{task.estimated_hours}h</Text>
                              </HStack>
                            </HStack>

                            {task.sub_tasks.length > 0 && (
                              <HStack justify="space-between" fontSize="xs">
                                <Text color="gray.600">Sub-tasks</Text>
                                <Text color="gray.600">
                                  {task.sub_tasks.filter(st => st.completed).length}/{task.sub_tasks.length}
                                </Text>
                              </HStack>
                            )}

                            <HStack justify="space-between" fontSize="xs" color="gray.600">
                              <HStack spacing={1}>
                                <Icon as={FiMessageSquare} />
                                <Text>{task.comments.length}</Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={FiPaperclip} />
                                <Text>{task.attachments.length}</Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );

  const renderListView = () => (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Task Name</Th>
            <Th>Assigned To</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Timeline</Th>
            <Th>Progress</Th>
            <Th>Hours</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredTasks.map((task) => (
            <Tr key={task.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => handleTaskClick(task)}>
              <Td>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="medium">{task.name}</Text>
                    {task.promana_risk_indicator && (
                      <Icon as={FiFlag} color="red.500" boxSize={4} />
                    )}
                    {task.promana_acceleration_opportunity && (
                      <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {task.description}
                  </Text>
                  {task.dependency_names.length > 0 && (
                    <Text fontSize="xs" color="brand.primary">
                      Depends on: {task.dependency_names.join(', ')}
                    </Text>
                  )}
                </VStack>
              </Td>
              <Td>
                <HStack>
                  <Avatar
                    size="sm"
                    name={`${task.assigned_to_info?.first_name} ${task.assigned_to_info?.last_name}`}
                  />
                  <Text fontSize="sm">
                    {task.assigned_to_info?.first_name} {task.assigned_to_info?.last_name}
                  </Text>
                </HStack>
              </Td>
              <Td>
                <HStack spacing={1}>
                  <Icon as={getStatusIcon(task.status)} />
                  <Badge colorScheme={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>
              </Td>
              <Td>
                <Badge colorScheme={getPriorityColor(task.priority)}>
                  {task.priority.toUpperCase()}
                </Badge>
              </Td>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">
                    {formatDate(task.start_date)} - {formatDate(task.end_date)}
                  </Text>
                  {task.is_overdue && (
                    <Badge colorScheme="red" size="sm">
                      OVERDUE
                    </Badge>
                  )}
                </VStack>
              </Td>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">{task.progress_percentage}%</Text>
                  <Progress
                    value={task.progress_percentage}
                    size="sm"
                    width="100px"
                    colorScheme={getStatusColor(task.status)}
                  />
                </VStack>
              </Td>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">
                    {task.estimated_hours}h est.
                  </Text>
                  <Text fontSize="sm">
                    {task.actual_hours}h actual
                  </Text>
                  {task.remaining_hours > 0 && (
                    <Text fontSize="xs" color="orange.600">
                      {task.remaining_hours}h remaining
                    </Text>
                  )}
                </VStack>
              </Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Icon as={FiMoreVertical} />}
                    size="sm"
                    variant="ghost"
                    aria-label="Task actions"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList>
                    <MenuItem icon={<Icon as={FiEdit} />}>Edit Task</MenuItem>
                    <MenuItem icon={<Icon as={FiEye} />}>View Details</MenuItem>
                    <MenuItem icon={<Icon as={FiMessageSquare} />}>Add Comment</MenuItem>
                    <MenuItem icon={<Icon as={FiPaperclip} />}>Add Attachment</MenuItem>
                    <MenuItem icon={<Icon as={FiTrash2} />} color="red.500">Delete Task</MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );

  const renderGanttChart = () => (
    <Box>
      <Text>Gantt Chart View - Coming Soon</Text>
      <Text fontSize="sm" color="gray.600">
        Interactive Gantt chart with drag-and-drop functionality, dependency lines, and Promana's critical path highlighting.
      </Text>
    </Box>
  );

  return (
    <Box>
      {/* Header with View Selector and Actions */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Task Management</Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FiZap} />}
                variant="outline"
                onClick={() => setShowPromanaSmartAdd(true)}
              >
                Promana Smart Add
              </Button>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
                onClick={() => setShowPromanaSmartAdd(true)}
              >
                Add New Task
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <HStack justify="space-between" mb={4}>
            <HStack spacing={2}>
              <Button
                leftIcon={<Icon as={FiGrid} />}
                variant={view === 'kanban' ? 'solid' : 'outline'}
                onClick={() => onViewChange('kanban')}
                size="sm"
              >
                Kanban
              </Button>
              <Button
                leftIcon={<Icon as={FiList} />}
                variant={view === 'list' ? 'solid' : 'outline'}
                onClick={() => onViewChange('list')}
                size="sm"
              >
                List
              </Button>
              <Button
                leftIcon={<Icon as={FiBarChart} />}
                variant={view === 'gantt' ? 'solid' : 'outline'}
                onClick={() => onViewChange('gantt')}
                size="sm"
              >
                Gantt
              </Button>
            </HStack>

            <HStack spacing={3}>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </Select>
            </HStack>
          </HStack>

          {/* View Content */}
          {view === 'kanban' && renderKanbanBoard()}
          {view === 'list' && renderListView()}
          {view === 'gantt' && renderGanttChart()}
        </CardBody>
      </Card>

      {/* Promana Smart Add Modal */}
      <Modal isOpen={showPromanaSmartAdd} onClose={() => setShowPromanaSmartAdd(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiZap} color="brand.primary" />
              <Text>Promana Smart Add Task</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Card bg="brand.primary.50" border="1px solid" borderColor="brand.primary.200">
                <CardBody>
                  <Text fontSize="sm" color="brand.primary">
                    Describe your task naturally. Promana will automatically parse and populate all fields.
                  </Text>
                  <Text fontSize="sm" color="brand.primary" mt={2}>
                    Example: "Design mockups for landing page due next Friday assigned to Sarah"
                  </Text>
                </CardBody>
              </Card>

              <FormControl>
                <FormLabel>Task Description</FormLabel>
                <Textarea
                  value={smartTaskInput}
                  onChange={(e) => setSmartTaskInput(e.target.value)}
                  placeholder="Describe the task, assignee, due date, and any other details..."
                  rows={4}
                />
              </FormControl>

              <Card bg="gray.50" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Promana's Parsed Fields:
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Task Name</Text>
                      <Text fontSize="sm">Design mockups for landing page</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Assignee</Text>
                      <Text fontSize="sm">Sarah Johnson</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Due Date</Text>
                      <Text fontSize="sm">Next Friday</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">Priority</Text>
                      <Text fontSize="sm">Medium</Text>
                    </Box>
                  </Grid>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowPromanaSmartAdd(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handlePromanaSmartAdd}>
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Detail Drawer */}
      <Drawer isOpen={isTaskDetailOpen} placement="right" onClose={onTaskDetailClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedTask?.name}
          </DrawerHeader>
          <DrawerBody>
            {selectedTask && (
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Badge colorScheme={getStatusColor(selectedTask.status)}>
                          {selectedTask.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(selectedTask.priority)}>
                          {selectedTask.priority.toUpperCase()}
                        </Badge>
                      </HStack>

                      <Text>{selectedTask.description}</Text>

                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiUser} />
                          <Text fontSize="sm">
                            {selectedTask.assigned_to_info?.first_name} {selectedTask.assigned_to_info?.last_name}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiCalendar} />
                          <Text fontSize="sm">
                            {formatDate(selectedTask.start_date)} - {formatDate(selectedTask.end_date)}
                          </Text>
                        </HStack>
                      </HStack>

                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Progress</Text>
                          <Text fontSize="sm">{selectedTask.progress_percentage}%</Text>
                        </HStack>
                        <Progress
                          value={selectedTask.progress_percentage}
                          colorScheme={getStatusColor(selectedTask.status)}
                        />
                      </Box>

                      <HStack justify="space-between">
                        <Text fontSize="sm">Estimated: {selectedTask.estimated_hours}h</Text>
                        <Text fontSize="sm">Actual: {selectedTask.actual_hours}h</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Sub-tasks */}
                {selectedTask.sub_tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Sub-tasks</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {selectedTask.sub_tasks.map((subTask) => (
                          <HStack key={subTask.id} justify="space-between">
                            <Checkbox isChecked={subTask.completed}>
                              {subTask.name}
                            </Checkbox>
                            {subTask.assigned_to && (
                              <Text fontSize="sm" color="gray.600">
                                {subTask.assigned_to}
                              </Text>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Comments */}
                <Card>
                  <CardHeader>
                    <Heading size="sm">Comments</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {selectedTask.comments.map((comment) => (
                        <Box key={comment.id} p={3} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {comment.user}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {formatDate(comment.created_at)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm">{comment.message}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Attachments */}
                {selectedTask.attachments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Attachments</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {selectedTask.attachments.map((attachment) => (
                          <HStack key={attachment.id} justify="space-between">
                            <HStack>
                              <Icon as={FiFileText} />
                              <Text fontSize="sm">{attachment.name}</Text>
                            </HStack>
                            <IconButton
                              icon={<Icon as={FiDownload} />}
                              size="sm"
                              variant="ghost"
                              aria-label="Download attachment"
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default TaskManagementTab; 