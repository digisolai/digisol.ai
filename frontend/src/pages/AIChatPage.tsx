import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import AIChatInterface from '../components/AIChatInterface';
import {
  FiCpu,
  FiZap,
  FiMessageSquare,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiBarChart,
  FiImage,
  FiBook,
} from 'react-icons/fi';

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  description: string;
  icon: any;
  color: string;
}

export default function AIChatPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const toast = useToast();

  const aiAgents: AIAgent[] = [
    {
      id: 'catalyst',
      name: 'Catalyst',
      specialization: 'campaign_optimization',
      description: 'AI-powered campaign optimization and performance analysis',
      icon: FiZap,
      color: 'blue',
    },
    {
      id: 'structura',
      name: 'Structura',
      specialization: 'strategic_planning',
      description: 'Strategic business intelligence and planning assistant',
      icon: FiCpu,
      color: 'purple',
    },
    {
      id: 'marketing',
      name: 'Marketing Pro',
      specialization: 'marketing_strategy',
      description: 'Marketing strategy and campaign development expert',
      icon: FiTarget,
      color: 'green',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      specialization: 'data_analysis',
      description: 'Data analysis and performance insights specialist',
      icon: FiBarChart,
      color: 'orange',
    },
    {
      id: 'creative',
      name: 'Creative',
      specialization: 'content_creation',
      description: 'Creative content and design assistance',
      icon: FiImage,
      color: 'pink',
    },
    {
      id: 'learning',
      name: 'Learning',
      specialization: 'educational_support',
      description: 'Educational content and learning assistance',
      icon: FiBook,
      color: 'teal',
    },
  ];

  const handleAgentSelect = (agent: AIAgent) => {
    setSelectedAgent(agent);
    onOpen();
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Header */}
        <Box mb={6}>
          <Heading size="lg" color="brand.primary" mb={2}>
            AI Chat Center
          </Heading>
          <Text color="gray.600">
            Chat with specialized AI agents to get insights, recommendations, and assistance
          </Text>
        </Box>

        {/* AI Agents Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {aiAgents.map((agent) => (
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
                    <Icon
                      as={agent.icon}
                      boxSize={8}
                      color={`${agent.color}.500`}
                    />
                    <VStack align="start" spacing={0}>
                      <Heading size="md">{agent.name}</Heading>
                      <Badge colorScheme={agent.color} variant="subtle">
                        {agent.specialization.replace('_', ' ')}
                      </Badge>
                    </VStack>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    {agent.description}
                  </Text>
                  
                  <Button
                    leftIcon={<Icon as={FiMessageSquare} />}
                    colorScheme={agent.color}
                    variant="outline"
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

        {/* Quick Actions */}
        <Box mt={8}>
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="brand.primary">
                  Quick Actions
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Button
                    leftIcon={<Icon as={FiZap} />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => handleAgentSelect(aiAgents[0])}
                  >
                    Optimize Campaigns
                  </Button>
                  
                  <Button
                    leftIcon={<Icon as={FiCpu} />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleAgentSelect(aiAgents[1])}
                  >
                    Strategic Planning
                  </Button>
                  
                  <Button
                    leftIcon={<Icon as={FiTarget} />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => handleAgentSelect(aiAgents[2])}
                  >
                    Marketing Strategy
                  </Button>
                  
                  <Button
                    leftIcon={<Icon as={FiBarChart} />}
                    colorScheme="orange"
                    variant="outline"
                    onClick={() => handleAgentSelect(aiAgents[3])}
                  >
                    Data Analysis
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* AI Chat Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" maxW="90vw">
          <ModalOverlay />
          <ModalContent maxH="90vh">
            <ModalHeader>
              <HStack>
                {selectedAgent && (
                  <Icon
                    as={selectedAgent.icon}
                    color={`${selectedAgent.color}.500`}
                  />
                )}
                <Text>
                  Chat with {selectedAgent?.name} - {selectedAgent?.specialization.replace('_', ' ')}
                </Text>
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
