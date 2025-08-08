import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Badge, 
  Progress, Grid, useToast, Icon, Flex, Tabs, TabList, TabPanels, Tab, TabPanel,
  Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Alert, AlertIcon, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, Checkbox, CheckboxGroup,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Menu, MenuButton, MenuList, MenuItem,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiBarChart2, FiDownload, FiBell, FiUsers, FiClock, FiDollarSign, FiAlertTriangle,
  FiEye, FiRefreshCw, FiMoreVertical, FiFileText, FiPlus, FiTrendingUp
} from 'react-icons/fi';
import api from '../services/api';
import type { Project } from '../types/project';

interface ReportData {
  id: string;
  name: string;
  report_type: string;
  report_data: unknown;
  generated_at: string;
  parameters: unknown;
}

interface PromanaInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  confidence_score: number;
  is_actionable: boolean;
  action_taken: boolean;
  created_at: string;
}

interface ReportsAnalyticsTabProps {
  project: Project;
}

const ReportsAnalyticsTab: React.FC<ReportsAnalyticsTabProps> = ({ project }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [insights, setInsights] = useState<PromanaInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportParameters, setReportParameters] = useState({});
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchReports();
    fetchInsights();
  }, [project.id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-management/reports/?project=${project.id}`);
      setReports(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reports',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await api.get(`/project-management/promana-insights/?project=${project.id}`);
      setInsights(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await api.post(`/project-management/reports/`, {
        project: project.id,
        name: `${selectedReportType} Report - ${new Date().toLocaleDateString()}`,
        report_type: selectedReportType,
        parameters: reportParameters
      });
      
      toast({
        title: 'Success',
        description: 'Report generated successfully',
        status: 'success',
        duration: 3000,
      });
      
      fetchReports();
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const generatePromanaInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project-management/projects/${project.id}/generate_insights/`);
      
      toast({
        title: 'Success',
        description: 'Promana insights generated successfully',
        status: 'success',
        duration: 3000,
      });
      
      fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportId: string, format: string = 'json') => {
    try {
      const response = await api.get(`/project-management/reports/${reportId}/export/?format=${format}`);
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Report exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'progress': return FiBarChart2;
      case 'budget': return FiDollarSign;
      case 'time_tracking': return FiClock;
      case 'team_performance': return FiUsers;
      case 'variance_analysis': return FiTrendingUp;
      case 'risk_hotspot': return FiAlertTriangle;
      case 'resource_utilization': return FiUsers;
      default: return FiFileText;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'risk_alert': return 'red';
      case 'opportunity': return 'green';
      case 'recommendation': return 'blue';
      case 'prediction': return 'purple';
      case 'optimization': return 'orange';
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color={textColor}>
          Reports & Analytics
        </Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="brand"
            size="sm"
            onClick={generatePromanaInsights}
            isLoading={loading}
          >
            Generate Promana Insights
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="brand"
            size="sm"
          >
            Export All
          </Button>
          <Button
            leftIcon={<FiBell />}
            variant="brand"
            size="sm"
          >
            Schedule Report
          </Button>
          <Button
            leftIcon={<FiPlus />}
            variant="brand"
            size="sm"
            onClick={onOpen}
          >
            Generate Report
          </Button>
        </HStack>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>Standard Reports</Tab>
          <Tab>Promana Insights</Tab>
          <Tab>Predictive Analytics</Tab>
          <Tab>Custom Reports</Tab>
        </TabList>

        <TabPanels>
          {/* Standard Reports Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} mb={6}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.600">Progress Report</StatLabel>
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
                    <StatLabel color="gray.600">Budget Report</StatLabel>
                    <StatNumber color={textColor}>
                      {formatCurrency(project.actual_cost)} / {formatCurrency(project.budget)}
                    </StatNumber>
                    <StatHelpText>
                      {((project.actual_cost / project.budget) * 100).toFixed(1)}% spent
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.600">Health Score</StatLabel>
                    <StatNumber color={textColor}>{project.health_score}/100</StatNumber>
                    <StatHelpText>
                      <Badge colorScheme={project.health_score > 80 ? 'green' : project.health_score > 60 ? 'yellow' : 'red'}>
                        {project.risk_level.toUpperCase()}
                      </Badge>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>

            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Generated Reports</Heading>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Box textAlign="center" py={8}>
                    <Spinner size="lg" color="brand.500" />
                  </Box>
                ) : reports.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No reports generated yet. Create your first report to get started.
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Report Name</Th>
                        <Th>Type</Th>
                        <Th>Generated</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reports.map((report) => (
                        <Tr key={report.id}>
                          <Td>
                            <HStack>
                              <Icon as={getReportTypeIcon(report.report_type)} color="brand.500" />
                              <Text>{report.name}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="brand" variant="subtle">
                              {report.report_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>{formatDate(report.generated_at)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                aria-label="View report"
                              />
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FiMoreVertical />}
                                  size="sm"
                                  variant="ghost"
                                />
                                <MenuList>
                                  <MenuItem icon={<FiDownload />} onClick={() => exportReport(report.id, 'json')}>
                                    Export JSON
                                  </MenuItem>
                                  <MenuItem icon={<FiDownload />} onClick={() => exportReport(report.id, 'pdf')}>
                                    Export PDF
                                  </MenuItem>
                                  <MenuItem icon={<FiDownload />} onClick={() => exportReport(report.id, 'excel')}>
                                    Export Excel
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Promana Insights Tab */}
          <TabPanel>
            <Alert status="info" mb={6}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Promana AI Insights</Text>
                <Text fontSize="sm">
                  AI-powered analysis and recommendations for your project
                </Text>
              </Box>
            </Alert>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Recent Insights</Heading>
                </CardHeader>
                <CardBody>
                  {insights.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No insights available. Generate insights to see Promana's recommendations.
                    </Text>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {insights.slice(0, 5).map((insight) => (
                        <Box key={insight.id} p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Badge colorScheme={getInsightTypeColor(insight.insight_type)}>
                              {insight.insight_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {insight.confidence_score}% confidence
                            </Text>
                          </HStack>
                          <Text fontWeight="bold" mb={1}>{insight.title}</Text>
                          <Text fontSize="sm" color="gray.600">{insight.description}</Text>
                          {insight.is_actionable && !insight.action_taken && (
                            <Button size="sm" variant="brand" mt={2}>
                              Take Action
                            </Button>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Insight Summary</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel>Total Insights</StatLabel>
                      <StatNumber>{insights.length}</StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Actionable Insights</StatLabel>
                      <StatNumber>{insights.filter(i => i.is_actionable).length}</StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Actions Taken</StatLabel>
                      <StatNumber>{insights.filter(i => i.action_taken).length}</StatNumber>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Average Confidence</StatLabel>
                      <StatNumber>
                        {insights.length > 0 
                          ? Math.round(insights.reduce((sum, i) => sum + i.confidence_score, 0) / insights.length)
                          : 0}%
                      </StatNumber>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Predictive Analytics Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Completion Prediction</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Original End Date</Text>
                      <Text fontWeight="bold">{formatDate(project.end_date)}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.600">Predicted Completion</Text>
                      <Text fontWeight="bold" color={project.predicted_completion_date ? 'green.500' : 'gray.500'}>
                        {project.predicted_completion_date ? formatDate(project.predicted_completion_date) : 'Not available'}
                      </Text>
                    </Box>
                    
                    <Button size="sm" variant="brand">
                      Update Prediction
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Risk Forecast</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Current Risk Level</Text>
                      <Badge colorScheme={project.risk_level === 'high' ? 'red' : project.risk_level === 'medium' ? 'yellow' : 'green'}>
                        {project.risk_level.toUpperCase()}
                      </Badge>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.600">Success Probability</Text>
                      <Text fontWeight="bold">
                        {project.health_score > 80 ? 'High' : project.health_score > 60 ? 'Medium' : 'Low'}
                      </Text>
                    </Box>
                    
                    <Button size="sm" variant="brand">
                      Analyze Risks
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm" color={textColor}>Resource Forecast</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Current Utilization</Text>
                      <Text fontWeight="bold">
                        {((project.actual_cost / project.budget) * 100).toFixed(1)}%
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color="gray.600">Projected Cost</Text>
                      <Text fontWeight="bold">
                        {formatCurrency(project.budget * (project.progress_percentage / 100))}
                      </Text>
                    </Box>
                    
                    <Button size="sm" variant="brand">
                      Forecast Resources
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Custom Reports Tab */}
          <TabPanel>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Custom Report Builder</Heading>
              </CardHeader>
              <CardBody>
                <Text color="gray.500" textAlign="center" py={8}>
                  Drag-and-drop interface for creating personalized reports will be implemented here.
                  <br />
                  <Text fontSize="sm" mt={2}>
                    This will allow you to create custom reports with Promana AI suggesting relevant metrics.
                  </Text>
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Generate Report Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate New Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Report Type</FormLabel>
                <Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  placeholder="Select report type"
                >
                  <option value="progress">Progress Report</option>
                  <option value="budget">Budget Report</option>
                  <option value="time_tracking">Time Tracking Report</option>
                  <option value="team_performance">Team Performance Report</option>
                  <option value="variance_analysis">Variance Analysis Report</option>
                  <option value="risk_hotspot">Risk Hotspot Report</option>
                  <option value="resource_utilization">Resource Utilization Report</option>
                  <option value="custom">Custom Report</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Report Name</FormLabel>
                <Input
                  placeholder={`${selectedReportType ? selectedReportType.replace('_', ' ').toUpperCase() : 'Custom'} Report`}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Date Range</FormLabel>
                <HStack>
                  <Input type="date" />
                  <Text>to</Text>
                  <Input type="date" />
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>Include Data</FormLabel>
                <CheckboxGroup>
                  <VStack align="start">
                    <Checkbox value="tasks">Tasks</Checkbox>
                    <Checkbox value="time_entries">Time Entries</Checkbox>
                    <Checkbox value="budget_data">Budget Data</Checkbox>
                    <Checkbox value="team_performance">Team Performance</Checkbox>
                    <Checkbox value="risks">Risks</Checkbox>
                    <Checkbox value="promana_insights">Promana Insights</Checkbox>
                  </VStack>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={generateReport}
              isLoading={generatingReport}
              isDisabled={!selectedReportType}
            >
              Generate Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReportsAnalyticsTab; 