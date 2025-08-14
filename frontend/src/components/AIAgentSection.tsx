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
  FiCpu
} from 'react-icons/fi';
import type { AIProfile } from '../types/ai';
import { getAgentConfig, AI_BRAND_COLORS } from '../utils/aiAgentConfig';

interface AIAgentSectionProps {
  agent: AIProfile | null;
  loading: boolean;
  error: string | null;
  onAskQuestion?: (question: string) => void;
}

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
          <Spinner size="md" color={AI_BRAND_COLORS.primary} mr={3} />
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

  const agentConfig = getAgentConfig(agent.name);
  const AgentIcon = agentConfig.icon;

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" mb={6} _hover={{ shadow: "md" }} transition="all 0.2s">
      <Flex direction="column" gap={4} align="center" textAlign="center">
        <Flex align="center" gap={3}>
          <Flex
            w={12}
            h={12}
            bg={AI_BRAND_COLORS.primary}
            borderRadius="full"
            align="center"
            justify="center"
            boxShadow="md"
          >
            <Icon as={AgentIcon} color={AI_BRAND_COLORS.accent} boxSize={6} />
          </Flex>
          <Box>
            <Heading size="md" color={AI_BRAND_COLORS.primary}>
              {agent.name}
            </Heading>
            <Text fontSize="sm" color="gray.600" textTransform="capitalize" fontWeight="medium">
              {agentConfig.assignedPage}
            </Text>
          </Box>
        </Flex>
        
        <Text color="gray.600" fontSize="md" lineHeight="1.6" maxW="600px">
          {agentConfig.personality_description}
        </Text>
        
        <Button
          leftIcon={<Icon as={FiMessageCircle} color={AI_BRAND_COLORS.accent} />}
          bg={AI_BRAND_COLORS.primary}
          color={AI_BRAND_COLORS.accent}
          fontWeight="bold"
          _hover={{ bg: AI_BRAND_COLORS.hover }}
          _active={{ bg: AI_BRAND_COLORS.hover }}
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
        <ModalContent maxW="800px" h="500px">
          <ModalHeader>
            Chat with {agent?.name} - {agentConfig.assignedPage}
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