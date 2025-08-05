import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiMessageCircle, FiCpu } from 'react-icons/fi';

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  personality_description?: string;
  is_active: boolean;
}

interface StandardAIAgentProps {
  agent: AIAgent | null;
  loading?: boolean;
  error?: string | null;
  onAskQuestion: (question: string) => Promise<void>;
  title?: string;
  description?: string;
}

export const StandardAIAgent: React.FC<StandardAIAgentProps> = ({
  agent,
  loading = false,
  error = null,
  onAskQuestion,
  title,
  description,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAskQuestion(question);
      setQuestion('');
      onClose();
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
      >
        <HStack justify="center" spacing={3}>
          <Spinner size="sm" color="brand.accent" />
          <Text color="gray.600">Loading AI Assistant...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Failed to load AI Assistant: {error}</Text>
        </Alert>
      </Box>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <>
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <VStack align="center" spacing={4} textAlign="center">
          {/* Header */}
          <VStack spacing={3}>
            <Box
              p={3}
              bg="brand.accent"
              borderRadius="full"
            >
              <Icon as={FiCpu} boxSize={5} color="brand.primary" />
            </Box>
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                {title || agent.name}
              </Text>
              <Badge variant="brand" colorScheme="brand">
                {agent.specialization.replace('_', ' ')}
              </Badge>
            </VStack>
          </VStack>

          {/* Description */}
          {(description || agent.personality_description) && (
            <Text fontSize="sm" color="gray.600" lineHeight="1.6" maxW="600px">
              {description || agent.personality_description}
            </Text>
          )}

          {/* Action Button */}
          <Button
            leftIcon={<FiMessageCircle />}
            bg="brand.primary"
            color="brand.accent"
            fontWeight="bold"
            _hover={{ bg: "brand.600" }}
            _active={{ bg: "brand.700" }}
            onClick={onOpen}
            size="lg"
            px={8}
            py={4}
          >
            Ask {agent.name} A Question
          </Button>
        </VStack>
      </Box>

      {/* Question Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ask {agent.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Ask {agent.name} about {agent.specialization.replace('_', ' ')} or any related questions.
              </Text>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask ${agent.name} a question...`}
                rows={4}
                resize="vertical"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Sending..."
              isDisabled={!question.trim()}
            >
              Send Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 