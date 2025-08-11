import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import ContextualAIChat from './ContextualAIChat';
import { 
  FiMessageCircle,
  FiTarget,
  FiDollarSign,
  FiEdit3,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiBarChart,
  FiUserCheck,
  FiSettings,
  FiBookOpen,
  FiPieChart,
  FiGrid,
  FiCpu,
  FiImage,
  FiFileText,
  FiFolder,
  FiActivity
} from 'react-icons/fi';
import type { AIProfile } from '../types/ai';

interface AIAgentSectionProps {
  agent: AIProfile | null;
  loading: boolean;
  error: string | null;
  onAskQuestion?: (question: string) => void;
}

// Icon mapping for AI agent specializations
const getAgentIcon = (specialization: string) => {
  switch (specialization) {
    case 'marketing_strategy':
      return FiTarget;
    case 'budget_analysis':
      return FiDollarSign;
    case 'content_creation':
      return FiEdit3;
    case 'campaign_optimization':
      return FiTrendingUp;
    case 'lead_nurturing':
      return FiUsers;
    case 'general_orchestration':
      return FiZap;
    case 'data_analysis':
      return FiBarChart;
    case 'hr_management':
      return FiUserCheck;
    case 'integrations_management':
      return FiSettings;
    case 'learning_guidance':
      return FiBookOpen;
    case 'reporting_insights':
      return FiPieChart;
    case 'organizational_planning':
      return FiGrid;
    case 'automation_design':
      return FiCpu;
    case 'brand_identity':
      return FiImage;
    case 'template_curation':
      return FiFileText;
    case 'project_management':
      return FiFolder;
    default:
      return FiActivity;
  }
};

// Color mapping for AI agent specializations
const getAgentColor = (specialization: string) => {
  switch (specialization) {
    case 'marketing_strategy':
      return 'blue.500';
    case 'budget_analysis':
      return 'green.500';
    case 'content_creation':
      return 'purple.500';
    case 'campaign_optimization':
      return 'orange.500';
    case 'lead_nurturing':
      return 'teal.500';
    case 'general_orchestration':
      return 'brand.primary';
    case 'data_analysis':
      return 'cyan.500';
    case 'hr_management':
      return 'pink.500';
    case 'integrations_management':
      return 'gray.500';
    case 'learning_guidance':
      return 'yellow.500';
    case 'reporting_insights':
      return 'indigo.500';
    case 'organizational_planning':
      return 'brand.primary';
    case 'automation_design':
      return 'red.500';
    case 'brand_identity':
      return 'brand.accent';
    case 'template_curation':
      return 'blue.400';
    case 'project_management':
      return 'green.400';
    default:
      return 'brand.primary';
  }
};

export const AIAgentSection: React.FC<AIAgentSectionProps> = ({
  agent,
  loading,
  error,
  onAskQuestion,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAskQuestion = () => {
    onOpen();
  };

  if (loading) {
    return (
      <Box p={4} bg="white" borderRadius="lg" shadow="sm" mb={6}>
        <Flex align="center" justify="center" py={8}>
          <Spinner size="md" color="brand.primary" mr={3} />
          <Text>Loading AI assistant...</Text>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="white" borderRadius="lg" shadow="sm" mb={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Failed to load AI assistant: {error}</Text>
        </Alert>
      </Box>
    );
  }

  if (!agent) {
    return null;
  }

  const AgentIcon = getAgentIcon(agent.specialization);
  const agentColor = getAgentColor(agent.specialization);

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" mb={6} _hover={{ shadow: "md" }} transition="all 0.2s">
      <Flex direction="column" gap={4} align="center" textAlign="center">
        <Flex align="center" gap={3}>
          <Flex
            w={12}
            h={12}
            bg={agentColor}
            borderRadius="full"
            align="center"
            justify="center"
            boxShadow="md"
          >
            <Icon as={AgentIcon} color="white" boxSize={6} />
          </Flex>
          <Box>
            <Heading size="md" color="brand.primary">
              {agent.name}
            </Heading>
            <Text fontSize="sm" color="brand.neutral.600" textTransform="capitalize" fontWeight="medium">
              {agent.specialization.replace('_', ' ')} Specialist
            </Text>
          </Box>
        </Flex>
        
        <Text color="brand.neutral.600" fontSize="md" lineHeight="1.6" maxW="600px">
          {agent.name === "Prospero" 
            ? "Your intelligent lead nurturing assistant. Prospero analyzes contact data, identifies engagement opportunities, and provides personalized recommendations to help you convert prospects into loyal customers. Ask me anything about your contacts, lead strategies, or sales processes."
            : agent.personality_description
          }
        </Text>
        
        <Button
          leftIcon={<Icon as={FiMessageCircle} />}
          bg="brand.primary"
          color="white"
          fontWeight="bold"
          _hover={{ bg: "brand.600" }}
          _active={{ bg: "brand.700" }}
          onClick={handleAskQuestion}
          size="lg"
          px={8}
          py={4}
        >
          Chat with {agent.name}
        </Button>
      </Flex>

      {/* AI Chat Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px" h="700px">
          <ModalHeader>
            Chat with {agent?.name} - {agent?.specialization.replace('_', ' ')} Specialist
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <ContextualAIChat
              agentId={agent?.id}
              agentName={agent?.name}
              agentSpecialization={agent?.specialization}
              pageContext={agent?.specialization}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 