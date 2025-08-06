import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiZap,
  FiUsers,
  FiMail,
  FiBarChart2,
  FiImage,
  FiCpu,
  FiDollarSign,
  FiBookOpen,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
  limit?: string;
  upgradeNote?: string;
}

export default function FeatureAvailability() {
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const features: Feature[] = [
    {
      name: 'AI Agents',
      description: 'Access to all 16 AI agents for content creation, analysis, and automation',
      icon: FiCpu,
      available: true,
      limit: 'Limited tokens on free tier',
      upgradeNote: 'Unlimited tokens with paid plans',
    },
    {
      name: 'Campaign Management',
      description: 'Create and manage email campaigns with advanced targeting',
      icon: FiMail,
      available: true,
      limit: 'Limited contacts and sends',
      upgradeNote: 'Higher limits with paid plans',
    },
    {
      name: 'Contact Management',
      description: 'Manage your contact database with segmentation and automation',
      icon: FiUsers,
      available: true,
      limit: 'Limited contacts on free tier',
      upgradeNote: 'Unlimited contacts with paid plans',
    },
    {
      name: 'Design Studio',
      description: 'AI-powered design tools for logos, graphics, and brand assets',
      icon: FiImage,
      available: true,
      limit: 'Limited image generations',
      upgradeNote: 'More generations with paid plans',
    },
    {
      name: 'Analytics & Reporting',
      description: 'Comprehensive analytics and reporting tools',
      icon: FiBarChart2,
      available: true,
      limit: 'Basic analytics',
      upgradeNote: 'Advanced analytics with paid plans',
    },
    {
      name: 'Automations',
      description: 'Create automated workflows and sequences',
      icon: FiZap,
      available: true,
      limit: 'Limited workflows',
      upgradeNote: 'Unlimited workflows with paid plans',
    },
    {
      name: 'Budget Management',
      description: 'Track and manage marketing budgets',
      icon: FiDollarSign,
      available: true,
      limit: 'Basic budgeting',
      upgradeNote: 'Advanced budgeting with paid plans',
    },
    {
      name: 'Learning Center',
      description: 'Access to marketing education and resources',
      icon: FiBookOpen,
      available: true,
      limit: 'Basic resources',
      upgradeNote: 'Premium content with paid plans',
    },
    {
      name: 'Integrations',
      description: 'Connect with third-party tools and platforms',
      icon: FiLayers,
      available: true,
      limit: 'Limited integrations',
      upgradeNote: 'More integrations with paid plans',
    },
    {
      name: 'Templates',
      description: 'Access to email and marketing templates',
      icon: FiFileText,
      available: true,
      limit: 'Basic templates',
      upgradeNote: 'Premium templates with paid plans',
    },
  ];

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardHeader>
        <VStack align="start" spacing={2}>
          <Heading size="md" color="brand.primary">
            <Icon as={FiInfo} mr={2} />
            Feature Availability
          </Heading>
          <Text fontSize="sm" color="gray.600">
            All features are available for exploration. Upgrade for higher limits and priority support.
          </Text>
        </VStack>
      </CardHeader>
      
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {features.map((feature) => (
            <Box
              key={feature.name}
              p={4}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              bg={feature.available ? 'green.50' : 'gray.50'}
            >
              <HStack spacing={3} mb={2}>
                <Icon 
                  as={feature.icon} 
                  color={feature.available ? 'green.500' : 'gray.400'} 
                  boxSize={5} 
                />
                <Text fontWeight="bold" color={feature.available ? 'green.700' : 'gray.600'}>
                  {feature.name}
                </Text>
                <Badge 
                  colorScheme={feature.available ? 'green' : 'gray'} 
                  size="sm"
                >
                  {feature.available ? 'Available' : 'Coming Soon'}
                </Badge>
              </HStack>
              
              <Text fontSize="sm" color="gray.600" mb={2}>
                {feature.description}
              </Text>
              
              {feature.available && (
                <VStack align="start" spacing={1}>
                  {feature.limit && (
                    <HStack spacing={1}>
                      <Icon as={FiCheckCircle} color="green.500" boxSize={3} />
                      <Text fontSize="xs" color="gray.500">
                        {feature.limit}
                      </Text>
                    </HStack>
                  )}
                  {feature.upgradeNote && (
                    <Text fontSize="xs" color="brand.primary" fontWeight="medium">
                      💡 {feature.upgradeNote}
                    </Text>
                  )}
                </VStack>
              )}
            </Box>
          ))}
        </SimpleGrid>
        
        <Box mt={6} p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
          <HStack spacing={2} mb={2}>
            <Icon as={FiInfo} color="blue.500" />
            <Text fontWeight="bold" color="blue.700">
              Explore All Features
            </Text>
          </HStack>
          <Text fontSize="sm" color="blue.600">
            You can explore and test all features of DigiSol.AI regardless of your subscription status. 
            Upgrade to remove limits and get priority support.
          </Text>
        </Box>
      </CardBody>
    </Card>
  );
} 