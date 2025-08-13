import React from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Icon,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock, FiStar, FiZap, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

interface FeatureAccessGateProps {
  feature: string;
  requiredPlan?: string;
  children: React.ReactNode;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
}

const featureInfo = {
  'ai-agents': {
    title: 'AI Agents',
    description: 'Advanced AI agents that generate content, optimize campaigns, and provide strategic insights',
    icon: FiZap,
    benefits: [
      'Content generation with AI',
      'Campaign optimization',
      'Strategic insights',
      'Automated workflows'
    ],
    plans: ['Pro', 'Business', 'Enterprise']
  },
  'design-studio': {
    title: 'Design Studio',
    description: 'AI-assisted design tools for creating stunning visuals, logos, and brand assets',
    icon: FiStar,
    benefits: [
      'AI-powered design tools',
      'Brand asset creation',
      'Logo generation',
      'Visual content creation'
    ],
    plans: ['Pro', 'Business', 'Enterprise']
  },
  'analytics': {
    title: 'Advanced Analytics',
    description: 'Comprehensive analytics with AI-driven insights and predictive performance modeling',
    icon: FiTrendingUp,
    benefits: [
      'AI-driven insights',
      'Predictive analytics',
      'Performance tracking',
      'Custom reports'
    ],
    plans: ['Business', 'Enterprise']
  },
  'automations': {
    title: 'Automations',
    description: 'Multi-channel campaign orchestration with automated workflows and real-time optimization',
    icon: FiZap,
    benefits: [
      'Workflow automation',
      'Multi-channel campaigns',
      'Real-time optimization',
      'Trigger-based actions'
    ],
    plans: ['Pro', 'Business', 'Enterprise']
  },
  'integrations': {
    title: 'Integrations',
    description: 'Connect with your favorite tools and platforms for seamless workflow integration',
    icon: FiZap,
    benefits: [
      'Third-party integrations',
      'API connections',
      'Data synchronization',
      'Workflow automation'
    ],
    plans: ['Business', 'Enterprise']
  },
  'team-collaboration': {
    title: 'Team Collaboration',
    description: 'Built-in project management, team coordination, and client portal features',
    icon: FiStar,
    benefits: [
      'Team management',
      'Client portals',
      'Project collaboration',
      'Role-based access'
    ],
    plans: ['Business', 'Enterprise']
  },
  'white-label': {
    title: 'White Label',
    description: 'White-label solutions for agencies to manage multiple clients with custom branding',
    icon: FiStar,
    benefits: [
      'Custom branding',
      'Client portals',
      'Agency tools',
      'Multi-client management'
    ],
    plans: ['Enterprise']
  }
};

export const FeatureAccessGate: React.FC<FeatureAccessGateProps> = ({
  feature,
  requiredPlan = 'Pro',
  children,
  showPreview = true,
  previewContent
}) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const info = featureInfo[feature as keyof typeof featureInfo];
  
  // Check if user has access to this feature
  const hasAccess = () => {
    if (!user) return false;
    
    // Superusers have access to everything
    if (user.is_superuser) return true;
    
    // Check subscription features
    const subscription = user.subscription;
    if (!subscription) return false;
    
    const planFeatures = subscription.features;
    if (!planFeatures) return false;
    
    // Map feature names to subscription features
    const featureMap: { [key: string]: keyof typeof planFeatures } = {
      'ai-agents': 'includes_ai_agents',
      'design-studio': 'includes_design_studio',
      'analytics': 'includes_analytics',
      'automations': 'includes_automations',
      'integrations': 'includes_integrations',
      'team-collaboration': 'includes_team_collaboration',
      'white-label': 'includes_white_label'
    };
    
    const featureKey = featureMap[feature];
    return featureKey ? planFeatures[featureKey] : false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (!showPreview) {
    return (
      <Box textAlign="center" py={10}>
        <Icon as={FiLock} boxSize={12} color="gray.400" mb={4} />
        <Heading size="md" color="gray.600" mb={2}>
          {info?.title || feature} Access Required
        </Heading>
        <Text color="gray.500" mb={4}>
          Upgrade to {requiredPlan} plan to access this feature
        </Text>
        <Button colorScheme="blue" as="a" href="/pricing">
          View Plans
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Feature Preview */}
      <Box mb={6}>
        {previewContent}
      </Box>
      
      {/* Upgrade CTA */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3}>
              <Icon as={info?.icon || FiStar} boxSize={6} color="blue.500" />
              <Box>
                <Heading size="md" color="blue.600">
                  {info?.title || feature}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {info?.description || 'Upgrade to access this feature'}
                </Text>
              </Box>
            </HStack>
            
            {info?.benefits && (
              <Box>
                <Text fontWeight="semibold" mb={2} color="gray.700">
                  What you'll get:
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {info.benefits.map((benefit, index) => (
                    <HStack key={index} spacing={2}>
                      <Icon as={FiZap} boxSize={3} color="green.500" />
                      <Text fontSize="sm" color="gray.600">{benefit}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>
            )}
            
            <Box>
              <Text fontWeight="semibold" mb={2} color="gray.700">
                Available in:
              </Text>
              <HStack spacing={2}>
                {info?.plans.map((plan) => (
                  <Badge key={plan} colorScheme="blue" variant="subtle">
                    {plan}
                  </Badge>
                ))}
              </HStack>
            </Box>
            
            <HStack spacing={3} pt={2}>
              <Button colorScheme="blue" size="lg" as="a" href="/pricing">
                Upgrade Now
              </Button>
              <Button variant="outline" size="lg" as="a" href="/features">
                Learn More
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};
