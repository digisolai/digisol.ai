import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  Icon,
  useToast,
  Spinner,
  Card,
  CardBody,
  Flex,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiSend, FiUser, FiCpu, FiZap, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai_agent';
  timestamp: string;
  ai_profile?: {
    name: string;
    specialization: string;
  };
}

interface ContextualAIChatProps {
  agentId?: string;
  agentName?: string;
  agentSpecialization?: string;
  pageContext?: string; // e.g., 'campaigns', 'analytics', 'budgeting'
  pageData?: any; // Any relevant data from the current page
  onClose?: () => void;
  isModal?: boolean; // Whether to render as modal or inline
  triggerButton?: React.ReactNode; // Custom trigger button
}

export default function ContextualAIChat({
  agentId = 'general',
  agentName = 'AI Assistant',
  agentSpecialization = 'general',
  pageContext = 'general',
  pageData = {},
  onClose,
  isModal = false,
  triggerButton
}: ContextualAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use the AI chat feature.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Gemini API with context
      const response = await api.post('/ai-services/gemini-chat/', {
        message: inputMessage,
        agent_name: agentName,
        agent_specialization: agentSpecialization,
        page_context: pageContext,
        page_data: pageData,
        conversation_history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response || response.data.message || 'I apologize, but I encountered an issue processing your request.',
        role: 'ai_agent',
        timestamp: new Date().toISOString(),
        ai_profile: {
          name: agentName,
          specialization: agentSpecialization
        }
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error.response?.data?.detail || error.message || 'Sorry, I encountered an error. Please try again.',
        role: 'ai_agent',
        timestamp: new Date().toISOString(),
        ai_profile: {
          name: agentName,
          specialization: agentSpecialization
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Chat Error',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show authentication message if not logged in
  if (isAuthenticated === false) {
    return (
      <Card h="600px" display="flex" flexDirection="column">
        <CardBody p={0} display="flex" flexDirection="column">
          {/* Header */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="brand.50">
            <HStack>
              <Avatar size="sm" bg="brand.primary" icon={<Icon as={FiCpu} />} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{agentName}</Text>
                <Badge colorScheme="blue" size="sm">{agentSpecialization}</Badge>
              </VStack>
            </HStack>
          </Box>
          
          {/* Authentication Required Message */}
          <Box p={8} textAlign="center">
            <Icon as={FiZap} boxSize={12} color="brand.primary" mb={4} />
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Authentication Required
            </Text>
            <Text color="gray.600" mb={4}>
              Please log in to use the AI chat feature.
            </Text>
            <Button
              colorScheme="brand"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          </Box>
        </CardBody>
      </Card>
    );
  }

  const chatInterface = (
    <Card h="600px" display="flex" flexDirection="column">
      <CardBody p={0} display="flex" flexDirection="column">
        {/* Header */}
        <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="brand.50">
          <HStack>
            <Avatar size="sm" bg="brand.primary" icon={<Icon as={FiCpu} />} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{agentName}</Text>
              <Badge colorScheme="blue" size="sm">{agentSpecialization}</Badge>
              {pageContext !== 'general' && (
                <Badge colorScheme="green" size="xs" mt={1}>
                  {pageContext} context
                </Badge>
              )}
            </VStack>
          </HStack>
        </Box>

        {/* Messages */}
        <VStack 
          flex={1} 
          p={4} 
          spacing={4} 
          overflowY="auto"
          align="stretch"
        >
          {messages.length === 0 && (
            <Box textAlign="center" py={8}>
              <Icon as={FiZap} boxSize={8} color="brand.primary" mb={2} />
              <Text color="gray.600">
                Start a conversation with {agentName} about {agentSpecialization}!
                {pageContext !== 'general' && (
                  <Text as="span" fontWeight="bold"> I have context about your {pageContext} page.</Text>
                )}
              </Text>
            </Box>
          )}

          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
              maxW="80%"
            >
              <HStack spacing={2} align="start">
                {message.role === 'ai_agent' && (
                  <Avatar size="sm" bg="brand.primary" icon={<Icon as={FiCpu} />} />
                )}
                <Box
                  bg={message.role === 'user' ? 'brand.primary' : 'gray.100'}
                  color={message.role === 'user' ? 'white' : 'black'}
                  p={3}
                  borderRadius="lg"
                  maxW="100%"
                >
                  <Text fontSize="sm">{message.content}</Text>
                  <Text fontSize="xs" opacity={0.7} mt={1}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </Box>
                {message.role === 'user' && (
                  <Avatar size="sm" bg="gray.400" icon={<Icon as={FiUser} />} />
                )}
              </HStack>
            </Box>
          ))}

          {isLoading && (
            <Box alignSelf="flex-start">
              <HStack spacing={2}>
                <Avatar size="sm" bg="brand.primary" icon={<Icon as={FiCpu} />} />
                <Box bg="gray.100" p={3} borderRadius="lg">
                  <HStack>
                    <Spinner size="sm" color="brand.primary" />
                    <Text fontSize="sm">Thinking...</Text>
                  </HStack>
                </Box>
              </HStack>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </VStack>

        {/* Input */}
        <Box p={4} borderTop="1px solid" borderColor="gray.200">
          <HStack>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${agentName} about ${agentSpecialization}...`}
              disabled={isLoading}
            />
            <Button
              colorScheme="brand"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              leftIcon={<Icon as={FiSend} />}
            >
              Send
            </Button>
          </HStack>
        </Box>
      </CardBody>
    </Card>
  );

  // If modal mode, wrap in modal
  if (isModal) {
    return (
      <>
        {triggerButton || (
          <Button
            leftIcon={<Icon as={FiMessageSquare} />}
            colorScheme="brand"
            onClick={onOpen}
          >
            Ask {agentName}
          </Button>
        )}

        <Modal isOpen={isOpen} onClose={onModalClose} size="6xl" maxW="90vw">
          <ModalOverlay />
          <ModalContent maxH="90vh">
            <ModalHeader>
              <HStack>
                <Icon as={FiCpu} color="brand.primary" />
                <Text>Chat with {agentName}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              {chatInterface}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  // Return inline chat interface
  return chatInterface;
}
