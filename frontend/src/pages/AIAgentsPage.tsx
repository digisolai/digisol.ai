// frontend/src/pages/AIAgentsPage.tsx
import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon,
  SimpleGrid,
  Icon,
  Badge,
  Button,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import api from "../services/api";
import {FiCpu, FiBarChart, FiGlobe, FiBook, FiZap, FiTrendingUp, FiUsers, FiSettings} from "react-icons/fi";

interface AIProfile {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  api_model_name: string;
  is_active: boolean;
  is_global: boolean;
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

  const getSpecializationLabel = (specialization: string) => {
    return specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAgentIcon = (agentName: string) => {
    const icons = {
    
      'Pecunia': FiZap, // Changed from FiDollarSign to FiZap
      'Scriptor': FiBook, // Changed from FiEdit3 to FiBook
      'Catalyst': FiTrendingUp,
      'Prospero': FiUsers,
    
      'Metrika': FiBarChart,
    
      'Connectus': FiGlobe, // Changed from FiLink to FiGlobe
      'Mentor': FiSettings // Changed from FiBookOpen to FiSettings
    };
    return icons[agentName as keyof typeof icons] || FiCpu;
  };

  const getAgentGreeting = (agent: AIProfile) => {
    const greetings = {
    
      'Pecunia': "Your budget guardian is here! I'll help optimize your spending and maximize ROI across all channels.",
      'Scriptor': "Content creation specialist at your service! I'll generate engaging, brand-aligned content that converts.",
      'Catalyst': "Performance optimization expert ready to boost your campaigns! Let me analyze and improve your results.",
      'Prospero': "Lead nurturing specialist here! I'll develop personalized engagement strategies to convert prospects.",
    
      'Metrika': "Data analysis expert at your service! I'll identify hidden patterns and key insights from your analytics.",
    
      'Connectus': "Integration specialist ready to bridge your digital ecosystem! Let me ensure seamless data flow.",
      'Mentor': "Your patient guide through DigiSol.AI! I'll help you master every feature and optimize your workflow."
    };
    return greetings[agent.name as keyof typeof greetings] || "Ready to assist with your objectives!";
  };

  const getAgentStatus = (agent: AIProfile) => {
    if (agent.is_active) {
      return { color: "green", text: "Active & Ready", variant: "solid" };
    } else {
      return { color: "gray", text: "Inactive", variant: "outline" };
    }
  };

  const stats = {
    total: agents.length,
    active: agents.filter(p => p.is_active).length,
    global: agents.filter(p => p.is_global).length,
    tenant: agents.filter(p => !p.is_global).length,
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <HStack justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="brand.primary">
            <Icon as={FiZap} mr={2} />
            AI Agent Directory
          </Heading>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Failed to load AI agents</Text>
              <Text fontSize="sm">{error}</Text>
              <Button 
                size="sm" 
                variant="brandSolid" 
                mt={2}
                onClick={() => fetchAgents()}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        )}

        {isLoading && (
          <Box textAlign="center" py={8}>
            <Text>Loading AI agents...</Text>
          </Box>
        )}

        {/* Statistics */}
        {!isLoading && !error && (
          <>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
              <Card boxShadow="md" bg="white">
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="brand.primary">{stats.total}</Text>
                  <Text fontSize="sm" color="brand.neutral.600">Total Agents</Text>
                </CardBody>
              </Card>
              <Card boxShadow="md" bg="white">
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="brand.accent">{stats.active}</Text>
                  <Text fontSize="sm" color="brand.neutral.600">Active Agents</Text>
                </CardBody>
              </Card>
              <Card boxShadow="md" bg="white">
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="brand.primary">{stats.global}</Text>
                  <Text fontSize="sm" color="brand.neutral.600">Global Agents</Text>
                </CardBody>
              </Card>
              <Card boxShadow="md" bg="white">
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="brand.primary">{stats.tenant}</Text>
                  <Text fontSize="sm" color="brand.neutral.600">Tenant Agents</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* AI Agents Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {agents.map((profile) => {
            const status = getAgentStatus(profile);
            const AgentIcon = getAgentIcon(profile.name);
            
            return (
              <Card key={profile.id} boxShadow="lg" border="1px solid" borderColor="brand.neutral.100" _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }} transition="all 0.2s">
                <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                  <HStack>
                    <Icon as={AgentIcon} />
                    <Box>
                      <Heading size="md">{profile.name}</Heading>
                      <Text fontSize="sm" opacity={0.8}>
                        {getSpecializationLabel(profile.specialization)}
                      </Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme={status.color} variant={status.variant} fontSize="xs">
                    {status.text}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="brand.neutral.700" lineHeight="1.6">
                      {getAgentGreeting(profile)}
                    </Text>
                    
                    <HStack justify="space-between">
                      <Badge colorScheme="brand" variant="outline" fontSize="xs">
                        {profile.is_global ? "Global" : "Tenant"}
                      </Badge>
                      <Text fontSize="xs" color="brand.neutral.500">
                        Model: {profile.api_model_name}
                      </Text>
                    </HStack>
                    
                    <Box>
                      <Text fontSize="xs" color="brand.neutral.500" fontWeight="medium" mb={1}>
                        Specialization:
                      </Text>
                      <Badge colorScheme="brand" variant="subtle" fontSize="xs">
                        {getSpecializationLabel(profile.specialization)}
                      </Badge>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>

            {agents.length === 0 && (
              <Box textAlign="center" py={12}>
                <Icon as={FiCpu} fontSize="6xl" color="brand.neutral.300" mb={4} />
                <Text fontSize="lg" color="brand.neutral.500" mb={2}>No AI Agents Available</Text>
                <Text fontSize="sm" color="brand.neutral.400">
                  AI agents will appear here once they are configured.
                </Text>
              </Box>
            )}
          </>
        )}
      </Box>
    </Layout>
  );
} 