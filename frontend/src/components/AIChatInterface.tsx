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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
      // Call Gemini API directly for chat
      const response = await api.post('/ai-services/gemini-chat/', {
        message: inputMessage,
        agent_name: agentName,
        agent_specialization: agentSpecialization,
        conversation_history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

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
      setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
}
