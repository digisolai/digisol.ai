import React from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiZap, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  variant?: 'info' | 'warning' | 'success';
  showUpgradeButton?: boolean;
  compact?: boolean;
  feature?: string;
}

export default function UpgradePrompt({
  title = "Upgrade Your Plan",
  description = "Unlock unlimited access to this feature and many more with a premium plan.",
  variant = "info",
  showUpgradeButton = true,
  compact = false,
  feature
}: UpgradePromptProps) {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('blue.800', 'blue.100');

  const handleUpgrade = () => {
    navigate('/billing');
  };

  if (compact) {
    return (
      <Box
        p={3}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        mb={4}
      >
        <HStack spacing={2} align="center">
          <Icon as={FiStar} color="brand.primary" boxSize={4} />
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            {feature ? `${feature} available with upgrade` : "Upgrade for unlimited access"}
          </Text>
          {showUpgradeButton && (
            <Button
              size="xs"
              colorScheme="brand.primary"
              variant="outline"
              onClick={handleUpgrade}
              ml="auto"
            >
              Upgrade
            </Button>
          )}
        </HStack>
      </Box>
    );
  }

  return (
    <Alert
      status={variant}
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={6}
      px={4}
      borderRadius="lg"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
    >
      <AlertIcon boxSize="24px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg" color={textColor}>
        {title}
      </AlertTitle>
      <AlertDescription maxWidth="sm" color={textColor}>
        {description}
      </AlertDescription>
      
      {showUpgradeButton && (
        <VStack mt={4} spacing={3}>
                     <Button
             colorScheme="brand.primary"
             size="md"
             onClick={handleUpgrade}
             leftIcon={<FiZap />}
           >
            View Plans & Upgrade
          </Button>
          <Text fontSize="xs" color={textColor} opacity={0.8}>
            All features are available for exploration. Upgrade for higher limits and priority support.
          </Text>
        </VStack>
      )}
    </Alert>
  );
}

// Feature-specific upgrade prompts
export function FeatureUpgradePrompt({ feature }: { feature: string }) {
  const featurePrompts: Record<string, { title: string; description: string }> = {
    'ai_agents': {
      title: "Unlock All AI Agents",
      description: "Access to all 16 specialized AI agents for content creation, analysis, and automation."
    },
    'automations': {
      title: "Unlimited Automations",
      description: "Create unlimited automation workflows to streamline your marketing processes."
    },
    'design_studio': {
      title: "Advanced Design Studio",
      description: "Unlimited AI-powered design generation for logos, graphics, and brand assets."
    },
    'analytics': {
      title: "Advanced Analytics",
      description: "Comprehensive analytics and predictive insights to optimize your campaigns."
    },
    'client_portals': {
      title: "Client Portal Management",
      description: "Manage client portals, billing, and analytics for your agency clients."
    },
    'integrations': {
      title: "More Integrations",
      description: "Connect with more platforms and automate data flow across your marketing stack."
    },
    'contacts': {
      title: "Unlimited Contacts",
      description: "Manage unlimited contacts and build larger audiences for your campaigns."
    },
    'emails': {
      title: "Unlimited Email Sends",
      description: "Send unlimited emails and reach more customers with your campaigns."
    }
  };

  const prompt = featurePrompts[feature] || {
    title: "Upgrade for More Features",
    description: "Unlock unlimited access to this feature and many more with a premium plan."
  };

  return (
    <UpgradePrompt
      title={prompt.title}
      description={prompt.description}
      variant="info"
      showUpgradeButton={true}
    />
  );
}

// Usage limit upgrade prompt
export function UsageLimitPrompt({ 
  current, 
  limit, 
  feature 
}: { 
  current: number; 
  limit: number; 
  feature: string;
}) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <Box
      p={4}
      bg={isNearLimit ? 'orange.50' : 'blue.50'}
      border="1px solid"
      borderColor={isNearLimit ? 'orange.200' : 'blue.200'}
      borderRadius="md"
      mb={4}
    >
      <HStack spacing={3} align="center">
                 <Icon 
           as={isNearLimit ? FiTrendingUp : FiStar} 
           color={isNearLimit ? 'orange.500' : 'brand.primary'} 
           boxSize={5} 
         />
        <VStack align="start" spacing={1} flex={1}>
                     <Text fontSize="sm" fontWeight="medium" color={isNearLimit ? 'orange.800' : 'brand.primary'}>
             {isNearLimit ? 'Approaching Limit' : 'Usage Limit'}
           </Text>
           <Text fontSize="xs" color={isNearLimit ? 'orange.700' : 'brand.primary'}>
            {feature}: {current} / {limit} used
          </Text>
        </VStack>
                 <Button
           size="sm"
           colorScheme={isNearLimit ? 'orange' : 'brand.primary'}
           variant="outline"
           onClick={() => window.location.href = '/billing'}
         >
          Upgrade
        </Button>
      </HStack>
    </Box>
  );
}
