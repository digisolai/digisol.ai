import React from 'react';
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
} from '@chakra-ui/react';
import { FiMessageCircle } from 'react-icons/fi';
import type { AIProfile } from '../types/ai';

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

  const handleAskQuestion = () => {
    if (onAskQuestion) {
      onAskQuestion("How can you help me with this page?");
    } else {
      toast({
        title: `${agent?.name || 'AI Agent'} is ready to assist`,
        description: "This feature is coming soon!",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
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

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" mb={6}>
      <Flex direction="column" gap={4} align="center" textAlign="center">
        <Flex align="center" gap={3}>
          <Flex
            w={12}
            h={12}
            bg="brand.primary"
            borderRadius="full"
            align="center"
            justify="center"
          >
            <FiMessageCircle color="white" size={20} />
          </Flex>
          <Box>
            <Heading size="md" color="brand.primary">
              {agent.name}
            </Heading>
            <Text fontSize="sm" color="brand.neutral.600" textTransform="capitalize">
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
          leftIcon={<FiMessageCircle />}
          bg="brand.primary"
          color="brand.accent"
          fontWeight="bold"
          _hover={{ bg: "brand.600" }}
          _active={{ bg: "brand.700" }}
          onClick={handleAskQuestion}
          size="lg"
          px={8}
          py={4}
        >
          Ask {agent.name} A Question
        </Button>
      </Flex>
    </Box>
  );
}; 