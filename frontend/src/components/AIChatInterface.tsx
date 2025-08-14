import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  Card,
  CardBody,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiSend, FiUser, FiCpu, FiZap } from 'react-icons/fi';
import api from '../services/api';
import { getAgentConfig, AI_BRAND_COLORS } from '../utils/aiAgentConfig';

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

interface AIChatInterfaceProps {
  agentId?: string;
  agentName?: string;
  agentSpecialization?: string;
  onClose?: () => void;
}

export default function AIChatInterface({
  agentId,
  agentName = 'AI Assistant',
  agentSpecialization = 'general',
  onClose
}: AIChatInterfaceProps) {
  // Get agent configuration from centralized config
  const agentConfig = getAgentConfig(agentName);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Verify token is still valid by making a test request
          await api.get('/accounts/user-profile/');
          setIsAuthenticated(true);
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            toast({
              title: 'Session Expired',
              description: 'Please log in again to use the AI chat feature.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          } else {
            // If it's not an auth error, assume we're authenticated
            setIsAuthenticated(true);
          }
        }
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
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Gemini API directly for chat
      const response = await api.post('/ai-services/gemini-chat/', {
        message: currentInput,
        agent_name: agentName,
        agent_specialization: agentSpecialization,
        conversation_history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (response.data && response.data.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          role: 'ai_agent',
          timestamp: new Date().toISOString(),
          ai_profile: {
            name: agentName,
            specialization: agentSpecialization,
          },
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Invalid response from AI service');
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to send message. Please try again.';
      let errorTitle = 'Error';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
        errorTitle = 'Authentication Required';
        setIsAuthenticated(false);
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        errorTitle = 'Rate Limit Exceeded';
      } else if (error.response?.status === 503) {
        errorMessage = 'AI service temporarily unavailable. Please check your Gemini API key configuration.';
        errorTitle = 'Service Unavailable';
      } else if (error.response?.status === 500) {
        errorMessage = 'AI service error. Please try again later.';
        errorTitle = 'Server Error';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Remove the user message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
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

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <Card h="300px" display="flex" flexDirection="column">
        <CardBody p={0} display="flex" flexDirection="column">
          {/* Header */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg={AI_BRAND_COLORS.light}>
            <VStack align="start" spacing={2}>
              <HStack>
                <Avatar size="sm" bg={AI_BRAND_COLORS.primary} icon={<Icon as={agentConfig.icon} color={AI_BRAND_COLORS.accent} />} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={AI_BRAND_COLORS.primary}>{agentName}</Text>
                  <Badge colorScheme="blue" variant="subtle" size="sm">
                    {agentConfig.assignedPage}
                  </Badge>
                </VStack>
              </HStack>
              <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                {agentConfig.personality_description}
              </Text>
            </VStack>
          </Box>
          
          {/* Loading State */}
          <Box p={8} textAlign="center">
            <Spinner size="lg" color="brand.primary" mb={4} />
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Checking Authentication
            </Text>
            <Text color="gray.600">
              Please wait while we verify your login status...
            </Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  // Show authentication message if not logged in
  if (isAuthenticated === false) {
    return (
      <Card h="300px" display="flex" flexDirection="column">
        <CardBody p={0} display="flex" flexDirection="column">
          {/* Header */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg={AI_BRAND_COLORS.light}>
            <VStack align="start" spacing={2}>
              <HStack>
                <Avatar size="sm" bg={AI_BRAND_COLORS.primary} icon={<Icon as={agentConfig.icon} color={AI_BRAND_COLORS.accent} />} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={AI_BRAND_COLORS.primary}>{agentName}</Text>
                  <Badge colorScheme="blue" variant="subtle" size="sm">
                    {agentConfig.assignedPage}
                  </Badge>
                </VStack>
              </HStack>
              <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                {agentConfig.personality_description}
              </Text>
            </VStack>
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

  return (
    <Card h="300px" display="flex" flexDirection="column">
      <CardBody p={0} display="flex" flexDirection="column">
        {/* Header */}
        <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg={AI_BRAND_COLORS.light}>
          <VStack align="start" spacing={2}>
            <HStack>
              <Avatar size="sm" bg={AI_BRAND_COLORS.primary} icon={<Icon as={agentConfig.icon} color={AI_BRAND_COLORS.accent} />} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={AI_BRAND_COLORS.primary}>{agentName}</Text>
                <Badge colorScheme="blue" variant="subtle" size="sm">
                  {agentConfig.assignedPage}
                </Badge>
              </VStack>
            </HStack>
            <Text fontSize="sm" color="gray.600" lineHeight="1.4">
              {agentConfig.personality_description}
            </Text>
          </VStack>
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
                  <Avatar size="sm" bg={AI_BRAND_COLORS.primary} icon={<Icon as={agentConfig.icon} color={AI_BRAND_COLORS.accent} />} />
                )}
                <Box
                  bg={message.role === 'user' ? AI_BRAND_COLORS.primary : 'gray.100'}
                  color={message.role === 'user' ? AI_BRAND_COLORS.accent : 'black'}
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
                <Avatar size="sm" bg={AI_BRAND_COLORS.primary} icon={<Icon as={agentConfig.icon} color={AI_BRAND_COLORS.accent} />} />
                <Box bg="gray.100" p={3} borderRadius="lg">
                  <HStack>
                    <Spinner size="sm" color={AI_BRAND_COLORS.primary} />
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
}
