import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {FiGlobe, FiUsers, FiTrendingUp, FiEye} from 'react-icons/fi';

interface GoogleAnalyticsData {
  propertyId: string;
  isConnected: boolean;
  lastSync?: string;
  metrics?: {
    users: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
}

interface GoogleAnalyticsIntegrationProps {
  onDataUpdate?: (data: unknown) => void;
}

export const GoogleAnalyticsIntegration: React.FC<GoogleAnalyticsIntegrationProps> = ({
  onDataUpdate,
}) => {
  const [analyticsData, setAnalyticsData] = useState<GoogleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Load saved analytics data from localStorage
    const savedData = localStorage.getItem('googleAnalyticsData');
    if (savedData) {
      try {
        setAnalyticsData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved analytics data:', error);
      }
    }
  }, []);

  const handleConnect = async () => {
    if (!propertyId.trim()) {
      toast({
        title: 'Property ID Required',
        description: 'Please enter your Google Analytics Property ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate Google Analytics connection
      // In a real implementation, you would:
      // 1. Use Google OAuth to authenticate
      // 2. Call Google Analytics API to fetch data
      // 3. Store the access token securely

      const mockData: GoogleAnalyticsData = {
        propertyId: propertyId,
        isConnected: true,
        lastSync: new Date().toISOString(),
        metrics: {
          users: Math.floor(Math.random() * 10000) + 1000,
          sessions: Math.floor(Math.random() * 15000) + 2000,
          pageviews: Math.floor(Math.random() * 25000) + 5000,
          bounceRate: Math.random() * 0.5 + 0.2,
          avgSessionDuration: Math.floor(Math.random() * 300) + 60,
        },
      };

      setAnalyticsData(mockData);
      localStorage.setItem('googleAnalyticsData', JSON.stringify(mockData));
      
      toast({
        title: 'Connected Successfully',
        description: 'Google Analytics data is now available',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      
      // Notify parent component
      if (onDataUpdate) {
        onDataUpdate(mockData);
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Google Analytics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAnalyticsData(null);
    localStorage.removeItem('googleAnalyticsData');
    toast({
      title: 'Disconnected',
      description: 'Google Analytics connection removed',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRefresh = async () => {
    if (!analyticsData) return;

    setLoading(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedData = {
        ...analyticsData,
        lastSync: new Date().toISOString(),
        metrics: {
          users: Math.floor(Math.random() * 10000) + 1000,
          sessions: Math.floor(Math.random() * 15000) + 2000,
          pageviews: Math.floor(Math.random() * 25000) + 5000,
          bounceRate: Math.random() * 0.5 + 0.2,
          avgSessionDuration: Math.floor(Math.random() * 300) + 60,
        },
      };

      setAnalyticsData(updatedData);
      localStorage.setItem('googleAnalyticsData', JSON.stringify(updatedData));
      
      toast({
        title: 'Data Refreshed',
        description: 'Google Analytics data updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh analytics data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack>
                <FiGlobe size={24} color="#3182CE" />
                <Box>
                  <Heading size="md">Google Analytics</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Connect your Google Analytics account
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme={analyticsData?.isConnected ? 'green' : 'gray'}>
                {analyticsData?.isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </HStack>

            {analyticsData?.isConnected ? (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.600">Property ID: {analyticsData.propertyId}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Last sync: {analyticsData.lastSync ? new Date(analyticsData.lastSync).toLocaleString() : 'Never'}
                  </Text>
                </Box>

                {analyticsData.metrics && (
                  <Box>
                    <Heading size="sm" mb={3}>Key Metrics</Heading>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <FiUsers size={16} />
                          <Text fontSize="sm">Users</Text>
                        </HStack>
                        <Text fontWeight="bold">{analyticsData.metrics.users.toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <FiTrendingUp size={16} />
                          <Text fontSize="sm">Sessions</Text>
                        </HStack>
                        <Text fontWeight="bold">{analyticsData.metrics.sessions.toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack>
                          <FiEye size={16} />
                          <Text fontSize="sm">Pageviews</Text>
                        </HStack>
                        <Text fontWeight="bold">{analyticsData.metrics.pageviews.toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Bounce Rate</Text>
                        <Text fontWeight="bold">{(analyticsData.metrics.bounceRate * 100).toFixed(1)}%</Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                <HStack spacing={3}>
                  <Button
                    size="sm"
                    onClick={handleRefresh}
                    isLoading={loading}
                    leftIcon={<FiTrendingUp />}
                  >
                    Refresh Data
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Button
                onClick={onOpen}
                colorScheme="blue"
                leftIcon={<FiGlobe />}
              >
                Connect Google Analytics
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Connection Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Google Analytics</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  To connect Google Analytics, you'll need your Property ID (GA4-XXXXXXXXX or UA-XXXXXXXX-X)
                </Text>
              </Alert>
              
              <FormControl>
                <FormLabel>Property ID</FormLabel>
                <Input
                  placeholder="GA4-XXXXXXXXX or UA-XXXXXXXX-X"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                />
              </FormControl>

              <HStack spacing={3} width="full" justify="flex-end">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  colorScheme="blue"
                  onClick={handleConnect}
                  isLoading={loading}
                >
                  Connect
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 