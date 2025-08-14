// frontend/src/pages/AIAgentsPage.tsx
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
  SimpleGrid,
  Badge,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { 
  getAgentConfig, 
  getSpecializationLabel, 
  AI_BRAND_COLORS 
} from '../utils/aiAgentConfig';

interface AIProfile {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  api_model_name?: string;
  is_active: boolean;
  is_global?: boolean;
  tenant?: string;
  created_at: string;
  updated_at: string;
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setError(null);
    setIsLoading(true);
    try {
      console.log("🔄 Fetching AI agents...");
      const res = await api.get("/ai-services/profiles/");
      console.log(`✅ Loaded ${res.data.length} AI agents:`, res.data);
      setAgents(res.data);
    } catch (err: unknown) {
      console.error("❌ Failed to fetch AI agents:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load AI agents";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const getAgentGreeting = (agent: AIProfile) => {
    const config = getAgentConfig(agent.name);
    return config.personality_description;
  };

  const handleChatWithAgent = (agent: AIProfile) => {
    // Navigate to AI chat page with the specific agent
    window.location.href = `/ai-chat?agent=${agent.name}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <Box py={4} px={{ base: 0, md: 4 }}>
          <Box textAlign="center" py={20}>
            <Spinner size="xl" color={AI_BRAND_COLORS.primary} />
            <Text mt={4} color="gray.600">Loading AI agents...</Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box py={4} px={{ base: 0, md: 4 }}>
          <Alert status="error" borderRadius="md">
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
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Header */}
        <Box mb={6}>
          <Heading size="lg" color={AI_BRAND_COLORS.primary} mb={2}>
            AI Agents Directory
          </Heading>
          <Text color="gray.600">
            Meet your specialized AI assistants, each designed to help with specific aspects of your marketing operations
          </Text>
        </Box>

        {/* AI Agents Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {agents.map((agent) => {
            const config = getAgentConfig(agent.name);
            const AgentIcon = config.icon;
            
            return (
              <Card
                key={agent.id}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
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
                      <VStack align="start" spacing={0} flex={1}>
                        <Heading size="md" color={AI_BRAND_COLORS.primary}>{agent.name}</Heading>
                        <Badge colorScheme="blue" variant="subtle" mb={1}>
                          {getSpecializationLabel(agent.specialization)}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {config.assignedPage}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600" noOfLines={3}>
                      {getAgentGreeting(agent)}
                    </Text>
                    
                    <HStack justify="space-between">
                      <Badge 
                        colorScheme={agent.is_active ? 'green' : 'gray'} 
                        variant="subtle"
                      >
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {agent.is_global && (
                        <Badge colorScheme="purple" variant="subtle">
                          Global
                        </Badge>
                      )}
                    </HStack>
                    
                    <Button
                      bg={AI_BRAND_COLORS.primary}
                      color={AI_BRAND_COLORS.accent}
                      _hover={{ bg: AI_BRAND_COLORS.hover }}
                      variant="solid"
                      size="sm"
                      onClick={() => handleChatWithAgent(agent)}
                      isDisabled={!agent.is_active}
                    >
                      Chat with {agent.name}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Quick Stats */}
        {agents.length > 0 && (
          <Box mt={8}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={AI_BRAND_COLORS.primary}>
                    AI Agents Overview
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color={AI_BRAND_COLORS.primary}>
                        {agents.length}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Total Agents</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {agents.filter(a => a.is_active).length}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Active Agents</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        {agents.filter(a => a.is_global).length}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Global Agents</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {new Set(agents.map(a => a.specialization)).size}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Specializations</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}
      </Box>
    </Layout>
  );
} 