import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Alert,
  AlertIcon,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { 
  FiUsers, FiTarget, FiSettings, FiGlobe, FiShield, 
  FiZap, FiTrendingUp, FiDollarSign, FiBarChart2, FiEdit3 
} from "react-icons/fi";
import { Layout } from "../components/Layout";
import api from "../services/api";
import { AIAgentCard } from "../components/AIAgentCard";
import { getAgentConfig, getSpecializationLabel, AI_BRAND_COLORS } from '../utils/aiAgentConfig';

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  is_active: boolean;
  api_model_name: string;
  tenant: string | null;
  created_at: string;
  updated_at: string;
}

export default function AIAgentDirectoryPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/ai-services/profiles/");
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      console.error("API error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to load AI agents.");
    } finally {
      setLoading(false);
    }
  }

  const activeAgents = agents.filter(agent => agent.is_active);
  const globalAgents = agents.filter(agent => !agent.tenant);
  const tenantAgents = agents.filter(agent => agent.tenant);
  const marketingAgents = agents.filter(agent => agent.specialization === 'marketing_strategy');
  const budgetingAgents = agents.filter(agent => agent.specialization === 'budget_analysis');
  const campaignAgents = agents.filter(agent => agent.specialization === 'campaign_optimization');
  const contentAgents = agents.filter(agent => agent.specialization === 'content_creation');
  const dataAgents = agents.filter(agent => agent.specialization === 'data_analysis');
  const orchestratorAgents = agents.filter(agent => agent.specialization === 'general_orchestration');

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center" py={6}>
            <Heading size="xl" color="brand.primary" mb={4}>
              AI Agent Directory
            </Heading>
            <Text fontSize="lg" color="brand.neutral.600" maxW="2xl" mx="auto">
              Explore our specialized AI agents designed to collaborate on complex business challenges
            </Text>
          </Box>

          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Stat>
              <StatLabel color="brand.neutral.600">Total Agents</StatLabel>
              <StatNumber color="brand.primary">{agents.length}</StatNumber>
              <StatHelpText>Available AI agents</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="brand.neutral.600">Active Agents</StatLabel>
              <StatNumber color="brand.accent">{activeAgents.length}</StatNumber>
              <StatHelpText>Currently available</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="brand.neutral.600">Global Agents</StatLabel>
              <StatNumber color="brand.primary">{globalAgents.length}</StatNumber>
              <StatHelpText>Available to all tenants</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel color="brand.neutral.600">Custom Agents</StatLabel>
              <StatNumber color="orange.500">{tenantAgents.length}</StatNumber>
              <StatHelpText>Tenant-specific agents</StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Main Content */}
          {loading ? (
            <Box textAlign="center" py={20}>
              <Spinner size="xl" color="brand.primary" />
              <Text mt={4} color="brand.neutral.600">Loading AI agents...</Text>
            </Box>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Tabs variant="enclosed" colorScheme="brand">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiUsers} />
                    <Text>All Agents</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiGlobe} />
                    <Text>Global Agents</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiShield} />
                    <Text>Custom Agents</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* All Agents Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="brand.primary">
                      All AI Agents ({agents.length})
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Global Agents Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="brand.primary">
                      Global AI Agents ({globalAgents.length})
                    </Heading>
                    <Text color="brand.neutral.600">
                      These agents are available to all tenants and provide core AI capabilities.
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {globalAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Custom Agents Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="brand.primary">
                      Custom AI Agents ({tenantAgents.length})
                    </Heading>
                    <Text color="brand.neutral.600">
                      These agents are specific to your organization and tailored to your business needs.
                    </Text>
                    {tenantAgents.length === 0 ? (
                      <Card border="1px solid" borderColor="brand.neutral.200">
                        <CardBody textAlign="center" py={8}>
                          <Icon as={FiSettings} boxSize={12} color="brand.neutral.400" mb={4} />
                          <Text fontSize="lg" color="brand.neutral.600" mb={2}>
                            No custom agents yet
                          </Text>
                          <Text color="brand.neutral.500">
                            Contact your administrator to create custom AI agents for your organization.
                          </Text>
                        </CardBody>
                      </Card>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {tenantAgents.map((agent) => (
                          <AgentCard key={agent.id} agent={agent} />
                        ))}
                      </SimpleGrid>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}

          {/* Specialization Overview */}
          {agents.length > 0 && (
            <Box>
              <Heading size="lg" color="brand.primary" mb={6}>
                Agent Specializations
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <SpecializationCard
                  title="Marketing Strategy"
                  count={marketingAgents.length}
                  description="Strategic marketing planning and customer acquisition"
                  icon={FiTrendingUp}
                  color="green"
                />
                <SpecializationCard
                  title="Financial Planning"
                  count={budgetingAgents.length}
                  description="Budget optimization and financial analysis"
                  icon={FiDollarSign}
                  color="blue"
                />
                <SpecializationCard
                  title="Campaign Optimization"
                  count={campaignAgents.length}
                  description="Campaign performance and conversion optimization"
                  icon={FiTarget}
                  color="purple"
                />
                <SpecializationCard
                  title="Content Generation"
                  count={contentAgents.length}
                  description="Content strategy and creative development"
                  icon={FiEdit3}
                  color="orange"
                />
                <SpecializationCard
                  title="Data Analysis"
                  count={dataAgents.length}
                  description="Data insights and performance analytics"
                  icon={FiBarChart2}
                  color="teal"
                />
                <SpecializationCard
                  title="Orchestration"
                  count={orchestratorAgents.length}
                  description="Multi-agent coordination and strategy synthesis"
                  icon={FiZap}
                  color="red"
                />
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Box>
    </Layout>
  );
}

// Agent Card Component
function AgentCard({ agent }: { agent: AIAgent }) {
  return (
    <AIAgentCard 
      agent={agent}
      onAskQuestion={(question) => {
        // Handle question for directory view
        console.log(`Question for ${agent.name}:`, question);
        // You can implement specific logic here if needed
      }}
    />
  );
}

// Specialization Card Component
function SpecializationCard({ 
  title, 
  count, 
  description, 
  icon, 
  color 
}: { 
  title: string; 
  count: number; 
  description: string; 
  icon: unknown; 
  color: string; 
}) {
  return (
    <Card border="1px solid" borderColor={`${color}.200`}>
      <CardHeader bg={`${color}.50`} borderBottom="1px solid" borderColor={`${color}.100`}>
        <HStack spacing={3}>
          <Icon as={icon} color={`${color}.500`} boxSize={5} />
          <VStack spacing={1} align="start">
            <Text fontWeight="semibold" color="brand.primary">
              {title}
            </Text>
            <Badge colorScheme={color} variant="subtle">
              {count} agent{count !== 1 ? 's' : ''}
            </Badge>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text fontSize="sm" color="brand.neutral.600" lineHeight="1.5">
          {description}
        </Text>
      </CardBody>
    </Card>
  );
} 