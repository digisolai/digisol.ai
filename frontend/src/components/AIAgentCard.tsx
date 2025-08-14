import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { FiCpu } from 'react-icons/fi';
import { 
  getAgentConfig, 
  getSpecializationLabel, 
  AI_BRAND_COLORS 
} from '../utils/aiAgentConfig';

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  is_active: boolean;
}

interface AIAgentCardProps {
  agent: AIAgent;
  onAskQuestion?: (question: string) => void;
}

export const AIAgentCard: React.FC<AIAgentCardProps> = ({ 
  agent, 
  onAskQuestion
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [question, setQuestion] = React.useState('');
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const agentConfig = getAgentConfig(agent.name);
  const AgentIcon = agentConfig.icon;

  // Debug logging
  React.useEffect(() => {
    console.log(`AIAgentCard rendered for: ${agent.name} (Active: ${agent.is_active})`);
  }, [agent.name, agent.is_active]);

  const handleAskQuestion = () => {
    if (!question.trim()) {
      toast({
        title: 'Question required',
        description: 'Please enter a question for the AI agent.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onAskQuestion) {
      onAskQuestion(question);
    } else {
      // Default behavior - show a toast
      toast({
        title: `${agent.name} is processing your question`,
        description: 'Your question has been submitted to the AI agent.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
    
    setQuestion('');
    onClose();
  };

  return (
    <>
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Flex
                w={10}
                h={10}
                bg={AI_BRAND_COLORS.primary}
                borderRadius="full"
                align="center"
                justify="center"
                boxShadow="md"
              >
                <Icon as={AgentIcon} boxSize={5} color={AI_BRAND_COLORS.accent} />
              </Flex>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg" color={AI_BRAND_COLORS.primary}>
                  {agent.name}
                </Text>
                <Badge bg="blue.100" color="blue.800" variant="subtle">
                  {getSpecializationLabel(agent.specialization)}
                </Badge>
              </VStack>
            </HStack>
            <Badge
              bg={agent.is_active ? 'green.100' : 'gray.100'}
              color={agent.is_active ? 'green.800' : 'gray.600'}
              variant="subtle"
            >
              {agent.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>

          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
            {agentConfig.personality_description}
          </Text>

          {/* Always show the Ask Question button */}
          <HStack spacing={2} w="full">
            <Button
              size="sm"
              bg={AI_BRAND_COLORS.primary}
              color={AI_BRAND_COLORS.accent}
              variant="solid"
              onClick={onOpen}
              flex={1}
              _hover={{ bg: AI_BRAND_COLORS.hover }}
            >
              Ask Question
            </Button>
            <Tooltip label="View detailed profile">
              <Button size="sm" variant="ghost" color={AI_BRAND_COLORS.primary}>
                <Icon as={FiCpu} />
              </Button>
            </Tooltip>
          </HStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Flex
                w={8}
                h={8}
                bg={AI_BRAND_COLORS.primary}
                borderRadius="full"
                align="center"
                justify="center"
              >
                <Icon as={AgentIcon} boxSize={4} color={AI_BRAND_COLORS.accent} />
              </Flex>
              <Text>Ask {agent.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {agentConfig.personality_description}
              </Text>
              <Textarea
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
              <HStack spacing={3} w="full">
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
                <Button 
                  bg={AI_BRAND_COLORS.primary} 
                  color={AI_BRAND_COLORS.accent} 
                  onClick={handleAskQuestion} 
                  flex={1} 
                  _hover={{ bg: AI_BRAND_COLORS.hover }}
                >
                  Ask {agent.name}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 