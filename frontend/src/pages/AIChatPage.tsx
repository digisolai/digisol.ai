import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
  Badge,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import AIChatInterface from '../components/AIChatInterface';
import api from '../services/api';
import type { AIProfile } from '../types/ai';
import { FiMessageSquare } from 'react-icons/fi';
import { 
  getAgentConfig, 
  getSpecializationLabel, 
  AI_BRAND_COLORS,
  type AIAgentConfig 
} from '../utils/aiAgentConfig';

interface AIAgent extends AIProfile {
  icon: any;
  color: string;
  assignedPage: string;
}

export default function AIChatPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/ai-services/profiles/');
      const fetchedAgents = response.data;
      
      // Transform fetched agents to include UI configuration
      const configuredAgents: AIAgent[] = fetchedAgents.map((agent: AIProfile) => {
        const config = getAgentConfig(agent.name);
        
        return {
          ...agent,
          icon: config.icon,
          color: config.color,
          assignedPage: config.assignedPage,
        };
      });
      
      setAgents(configuredAgents);
      console.log(`✅ Loaded ${configuredAgents.length} AI agents`);
    } catch (err: any) {
      console.error('❌ Failed to fetch AI agents:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load AI agents');
      toast({
        title: 'Error',
        description: 'Failed to load AI agents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSelect = (agent: AIAgent) => {
    setSelectedAgent(agent);
    onOpen();
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Header */}
        <Box mb={6}>
          <Heading size="lg" color={AI_BRAND_COLORS.primary} mb={2}>
            AI Chat Center
          </Heading>
          <Text color="gray.600">
            Chat with specialized AI agents to get insights, recommendations, and assistance
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Failed to load AI agents</Text>
              <Text fontSize="sm">{error}</Text>
              <Button 
                size="sm" 
                bg={AI_BRAND_COLORS.primary}
                color={AI_BRAND_COLORS.accent}
                _hover={{ bg: AI_BRAND_COLORS.hover }}
                mt={2}
                onClick={fetchAgents}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color={AI_BRAND_COLORS.primary} />
            <Text mt={4} color="gray.600">Loading AI agents...</Text>
          </Box>
        )}

        {/* AI Agents Grid */}
        {!isLoading && !error && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {agents.map((agent) => (
              <Card
                key={agent.id}
                cursor="pointer"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
                onClick={() => handleAgentSelect(agent)}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Flex
                        w={10}
                        h={10}
                        bg={AI_BRAND_COLORS.primary}
                        borderRadius="full"
                        align="center"
                        justify="center"
                        boxShadow="md"
                      >
                        <Icon
                          as={agent.icon}
                          boxSize={5}
                          color={AI_BRAND_COLORS.accent}
                        />
                      </Flex>
                      <VStack align="start" spacing={0} flex={1}>
                        <Heading size="md" color={AI_BRAND_COLORS.primary}>{agent.name}</Heading>
                        <Badge colorScheme="blue" variant="subtle" mb={1}>
                          {getSpecializationLabel(agent.specialization)}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {agent.assignedPage}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600">
                      {getAgentConfig(agent.name).personality_description}
                    </Text>
                    
                    <Button
                      leftIcon={<Icon as={FiMessageSquare} />}
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentSelect(agent);
                      }}
                    >
                      Start Chat
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Quick Actions */}
        {!isLoading && !error && agents.length > 0 && (
          <Box mt={8}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={AI_BRAND_COLORS.primary}>
                    Quick Actions
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Button
                      leftIcon={<Icon as={getAgentConfig('Catalyst').icon} />}
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      onClick={() => {
                        const catalyst = agents.find(a => a.name === 'Catalyst');
                        if (catalyst) handleAgentSelect(catalyst);
                      }}
                    >
                      Optimize Campaigns
                    </Button>
                    
                    <Button
                      leftIcon={<Icon as={getAgentConfig('Structura').icon} />}
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      onClick={() => {
                        const structura = agents.find(a => a.name === 'Structura');
                        if (structura) handleAgentSelect(structura);
                      }}
                    >
                      Strategic Planning
                    </Button>
                    
                    <Button
                      leftIcon={<Icon as={getAgentConfig('Strategist').icon} />}
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      onClick={() => {
                        const strategist = agents.find(a => a.name === 'Strategist');
                        if (strategist) handleAgentSelect(strategist);
                      }}
                    >
                      Marketing Strategy
                    </Button>
                    
                    <Button
                      leftIcon={<Icon as={getAgentConfig('Metrika').icon} />}
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      onClick={() => {
                        const metrika = agents.find(a => a.name === 'Metrika');
                        if (metrika) handleAgentSelect(metrika);
                      }}
                    >
                      Data Analysis
                    </Button>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* AI Chat Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent maxH="70vh" maxW="90vw">
            <ModalHeader>
              <HStack>
                {selectedAgent && (
                  <Flex
                    w={8}
                    h={8}
                    bg={AI_BRAND_COLORS.primary}
                    borderRadius="full"
                    align="center"
                    justify="center"
                  >
                    <Icon
                      as={selectedAgent.icon}
                      color={AI_BRAND_COLORS.accent}
                      boxSize={4}
                    />
                  </Flex>
                )}
                <VStack align="start" spacing={0}>
                  <Text color={AI_BRAND_COLORS.primary}>
                    Chat with {selectedAgent?.name} - {selectedAgent?.assignedPage}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {getSpecializationLabel(selectedAgent?.specialization || '')}
                  </Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              {selectedAgent && (
                <AIChatInterface
                  agentId={selectedAgent.id}
                  agentName={selectedAgent.name}
                  agentSpecialization={selectedAgent.specialization}
                  onClose={onClose}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}
