import {useState, useEffect} from "react";
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  Progress,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Select,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiBarChart,
  FiDollarSign,
  FiTarget,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiMousePointer,
  FiShoppingCart,
} from 'react-icons/fi';
import api from '../services/api';

interface CampaignAnalyticsProps {
  campaignId: string;
  dateRange?: number; // days
}

interface AnalyticsData {
  campaign_id: string;
  date_range: {
    start_date: string;
    end_date: string;
    days: number;
  };
  metrics: {
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_revenue: number;
    total_cost: number;
    ctr: number;
    conversion_rate: number;
    roi: number;
  };
  trends: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
  }>;
  comparisons: {
    previous_period: {
      impressions_change: number;
      clicks_change: number;
      conversions_change: number;
      revenue_change: number;
    };
  };
  catalyst_insights: unknown[];
  recommendations: unknown[];
}

export default function CampaignAnalytics({ campaignId, dateRange = 30 }: CampaignAnalyticsProps) {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange);

  const loadAnalytics = async (days: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/campaigns/campaigns/${campaignId}/analytics/?days=${days}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign analytics.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      loadAnalytics(selectedPeriod);
    }
  }, [campaignId, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="lg" color="brand.primary" />
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500" textAlign="center">
            No analytics data available
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Heading size="md">Campaign Analytics</Heading>
        <HStack spacing={3}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            size="sm"
            w="auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </Select>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            variant="outline"
            onClick={() => loadAnalytics(selectedPeriod)}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiDownload />}
            size="sm"
            variant="outline"
            onClick={() => {
              toast({
                title: 'Export',
                description: 'Analytics export feature coming soon!',
                status: 'info',
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Export
          </Button>
        </HStack>
      </HStack>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <FiEye />
                  <Text>Impressions</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{formatNumber(analyticsData.metrics.total_impressions)}</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={analyticsData.comparisons.previous_period.impressions_change >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(analyticsData.comparisons.previous_period.impressions_change)}% from previous period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <FiMousePointer />
                  <Text>Clicks</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{formatNumber(analyticsData.metrics.total_clicks)}</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={analyticsData.comparisons.previous_period.clicks_change >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(analyticsData.comparisons.previous_period.clicks_change)}% from previous period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <FiShoppingCart />
                  <Text>Conversions</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{formatNumber(analyticsData.metrics.total_conversions)}</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={analyticsData.comparisons.previous_period.conversions_change >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(analyticsData.comparisons.previous_period.conversions_change)}% from previous period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <FiDollarSign />
                  <Text>Revenue</Text>
                </HStack>
              </StatLabel>
              <StatNumber>{formatCurrency(analyticsData.metrics.total_revenue)}</StatNumber>
              <StatHelpText>
                <StatArrow
                  type={analyticsData.comparisons.previous_period.revenue_change >= 0 ? 'increase' : 'decrease'}
                />
                {Math.abs(analyticsData.comparisons.previous_period.revenue_change)}% from previous period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Performance Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <FiBarChart />
                <Text fontWeight="medium">Click-Through Rate (CTR)</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                {(analyticsData.metrics.ctr || 0).toFixed(2)}%
              </Text>
              <Progress
                value={analyticsData.metrics.ctr || 0}
                colorScheme="brand"
                size="sm"
                w="full"
              />
              <Text fontSize="sm" color="gray.600">
                Industry average: 2.35%
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <FiTarget />
                <Text fontWeight="medium">Conversion Rate</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                {(analyticsData.metrics.conversion_rate || 0).toFixed(2)}%
              </Text>
              <Progress
                value={analyticsData.metrics.conversion_rate || 0}
                colorScheme="green"
                size="sm"
                w="full"
              />
              <Text fontSize="sm" color="gray.600">
                Industry average: 2.9%
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <FiDollarSign />
                <Text fontWeight="medium">Return on Investment (ROI)</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                {(analyticsData.metrics.roi || 0).toFixed(1)}%
              </Text>
              <Progress
                value={Math.min(analyticsData.metrics.roi || 0, 100)}
                colorScheme={(analyticsData.metrics.roi || 0) >= 0 ? 'green' : 'red'}
                size="sm"
                w="full"
              />
              <Text fontSize="sm" color="gray.600">
                Cost: {formatCurrency(analyticsData.metrics.total_cost)}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Performance Trends */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Performance Trends</Heading>
          <Box overflowX="auto">
            <Box minW="600px">
              {/* Simple trend visualization */}
              <VStack spacing={4} align="stretch">
                {analyticsData.trends.slice(-7).map((trend, index) => (
                  <Box
                    key={index}
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={bgColor}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">
                        {new Date(trend.date).toLocaleDateString()}
                      </Text>
                      <Badge colorScheme="brand">
                        {formatCurrency(trend.revenue)}
                      </Badge>
                    </HStack>
                    
                    <SimpleGrid columns={4} spacing={4}>
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="gray.600">Impressions</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatNumber(trend.impressions)}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="gray.600">Clicks</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatNumber(trend.clicks)}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="gray.600">Conversions</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatNumber(trend.conversions)}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="xs" color="gray.600">Revenue</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(trend.revenue)}
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Catalyst Insights */}
      {analyticsData.catalyst_insights.length > 0 && (
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Catalyst AI Insights</Heading>
            <VStack spacing={3} align="stretch">
              {analyticsData.catalyst_insights.slice(0, 3).map((insight, index) => (
                <Box
                  key={index}
                  p={3}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={bgColor}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">{insight.title}</Text>
                    <Badge
                      colorScheme={
                        insight.priority === 'critical' ? 'red' :
                        insight.priority === 'high' ? 'orange' :
                        insight.priority === 'medium' ? 'brand.accent' : 'green'
                      }
                    >
                      {insight.priority}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {insight.description}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
} 