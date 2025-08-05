import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react';

interface GanttChartProps {
  projectName?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ projectName = "Project Timeline" }) => {
  // Define the tasks
  const tasks = [
    'Market Research',
    'Define Specifications',
    'Overall Architecture',
    'Project Planning',
    'Detail Design',
    'Software Development',
    'Test Plan',
    'Testing Q&A',
    'User Documentation'
  ];

  // Define the months and weeks
  const months = [
    { name: 'Month 1', weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] },
    { name: 'Month 2', weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] },
    { name: 'Month 3', weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] }
  ];

  // Define task durations (which weeks each task spans)
  const taskDurations = {
    'Market Research': { start: 0, end: 1, color: 'blue' },
    'Define Specifications': { start: 1, end: 2, color: 'green' },
    'Overall Architecture': { start: 2, end: 4, color: 'purple' },
    'Project Planning': { start: 3, end: 5, color: 'orange' },
    'Detail Design': { start: 5, end: 7, color: 'teal' },
    'Software Development': { start: 7, end: 11, color: 'red' },
    'Test Plan': { start: 10, end: 12, color: 'yellow' },
    'Testing Q&A': { start: 12, end: 14, color: 'pink' },
    'User Documentation': { start: 13, end: 15, color: 'cyan' }
  };

  const renderWeekCell = (taskIndex: number, weekIndex: number) => {
    const task = tasks[taskIndex];
    const duration = taskDurations[task as keyof typeof taskDurations];
    const globalWeekIndex = weekIndex + (Math.floor(taskIndex / 3) * 5);
    
    if (globalWeekIndex >= duration.start && globalWeekIndex <= duration.end) {
      return (
        <Box
          bg={`${duration.color}.500`}
          color="white"
          p={1}
          borderRadius="sm"
          fontSize="xs"
          textAlign="center"
          fontWeight="bold"
        >
          ●
        </Box>
      );
    }
    return <Box p={1} />;
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" textAlign="center">{projectName}</Heading>
          
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th minW="200px" bg="gray.50">Task</Th>
                  {months.map((month) => (
                    <Th key={month.name} colSpan={5} textAlign="center" bg="gray.50">
                      <VStack spacing={0}>
                        <Text fontWeight="bold">{month.name}</Text>
                        <HStack spacing={1}>
                          {month.weeks.map((week, index) => (
                            <Text key={index} fontSize="xs" color="gray.600">
                              {week}
                            </Text>
                          ))}
                        </HStack>
                      </VStack>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {tasks.map((task, taskIndex) => (
                  <Tr key={task}>
                    <Td fontWeight="medium" bg="gray.50">
                      <Text fontSize="sm">{task}</Text>
                    </Td>
                    {months.map((month, monthIndex) => (
                      month.weeks.map((_, weekIndex) => (
                        <Td key={`${monthIndex}-${weekIndex}`} p={1} border="1px solid" borderColor="gray.200">
                          {renderWeekCell(taskIndex, weekIndex)}
                        </Td>
                      ))
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Legend */}
          <Box mt={4}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Legend:</Text>
            <HStack spacing={4} flexWrap="wrap">
              {Object.entries(taskDurations).map(([task, duration]) => (
                <HStack key={task} spacing={1}>
                  <Box
                    w={3}
                    h={3}
                    bg={`${duration.color}.500`}
                    borderRadius="sm"
                  />
                  <Text fontSize="xs">{task}</Text>
                </HStack>
              ))}
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default GanttChart; 