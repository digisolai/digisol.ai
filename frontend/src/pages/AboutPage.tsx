import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Container,
  Divider,
} from "@chakra-ui/react";
import {
  FiTarget,
  FiZap,
  FiBarChart2,
  FiUsers,
  FiDollarSign,
  FiImage,
  FiMessageSquare,
  FiTrendingUp,
} from "react-icons/fi";
import { Layout } from "../components/Layout";

interface Capability {
  icon: React.ElementType;
  title: string;
  description: string;
}

const capabilities: Capability[] = [
  {
    icon: FiMessageSquare,
    title: "AI Content Generation",
    description: "Generate compelling marketing copy, emails, and social media content with advanced AI assistance.",
  },
  {
    icon: FiZap,
    title: "Campaign Automation",
    description: "Automate your marketing workflows with intelligent triggers and multi-channel campaigns.",
  },
  {
    icon: FiDollarSign,
    title: "Budget Management",
    description: "Track and optimize your marketing spend with detailed budgeting and ROI analytics.",
  },
  {
    icon: FiUsers,
    title: "Organizational Tools",
    description: "Manage teams, departments, and internal communications with comprehensive organizational features.",
  },
  {
    icon: FiBarChart2,
    title: "Advanced Analytics",
    description: "Get deep insights into campaign performance with custom reports and AI-driven recommendations.",
  },
  {
    icon: FiImage,
    title: "Design Studio",
    description: "Create stunning visuals and brand assets with our integrated design tools and AI assistance.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Main Heading */}
          <Box textAlign="center" py={8}>
            <Heading
              size="2xl"
              color="brand.primary"
              mb={4}
              fontWeight="bold"
            >
              About DigiSol.AI
            </Heading>
            <Text
              fontSize="xl"
              color="brand.neutral.600"
              maxW="3xl"
              mx="auto"
              lineHeight="1.6"
            >
              Empowering B2B marketers with AI-driven insights and no-code automation 
              to create hyper-personalized customer experiences at scale.
            </Text>
          </Box>

          {/* Mission Section */}
          <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="brand.primary" textAlign="center">
                  Our Mission
                </Heading>
                <Text
                  fontSize="lg"
                  color="brand.neutral.700"
                  textAlign="center"
                  lineHeight="1.7"
                  maxW="4xl"
                  mx="auto"
                >
                  We're revolutionizing B2B marketing by democratizing AI-powered tools that were 
                  previously only accessible to enterprise organizations. Our platform enables 
                  marketing teams to create personalized, data-driven campaigns that drive real 
                  business results, all while maintaining the human touch that builds lasting 
                  customer relationships.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* USP Section */}
          <Card bg="white" border="1px solid" borderColor="brand.neutral.200">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="brand.primary" textAlign="center">
                  What Makes Us Different
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiTarget} color="brand.accent" boxSize={6} />
                      <Text fontWeight="semibold" color="brand.primary">
                        Hyper-Personalized AI Engagement
                      </Text>
                    </HStack>
                    <Text color="brand.neutral.600" pl={9}>
                      Our AI understands your audience's behavior patterns and creates 
                      content that resonates with each individual prospect.
                    </Text>
                  </VStack>
                  
                  <VStack align="start" spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiUsers} color="brand.accent" boxSize={6} />
                      <Text fontWeight="semibold" color="brand.primary">
                        Multi-Tenant Agency Support
                      </Text>
                    </HStack>
                    <Text color="brand.neutral.600" pl={9}>
                      Built for agencies managing multiple clients, with complete 
                      data isolation and white-label capabilities.
                    </Text>
                  </VStack>
                  
                  <VStack align="start" spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiZap} color="brand.accent" boxSize={6} />
                      <Text fontWeight="semibold" color="brand.primary">
                        No-Code Automation
                      </Text>
                    </HStack>
                    <Text color="brand.neutral.600" pl={9}>
                      Powerful automation workflows that don't require technical 
                      expertise to set up and manage.
                    </Text>
                  </VStack>
                  
                  <VStack align="start" spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={FiTrendingUp} color="brand.accent" boxSize={6} />
                      <Text fontWeight="semibold" color="brand.primary">
                        Integrated Growth Platform
                      </Text>
                    </HStack>
                    <Text color="brand.neutral.600" pl={9}>
                      Everything you need for modern B2B marketing in one unified 
                      platform - no more juggling multiple tools.
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Key Capabilities Section */}
          <Box>
            <Heading size="lg" color="brand.primary" textAlign="center" mb={8}>
              Key Capabilities
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {capabilities.map((capability, index) => (
                <Card
                  key={index}
                  bg="white"
                  border="1px solid"
                  borderColor="brand.neutral.200"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    borderColor: "brand.primary",
                  }}
                  transition="all 0.2s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <Icon
                        as={capability.icon}
                        color="brand.accent"
                        boxSize={8}
                      />
                      <Heading size="md" color="brand.primary">
                        {capability.title}
                      </Heading>
                      <Text color="brand.neutral.600" fontSize="sm">
                        {capability.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Divider borderColor="brand.neutral.300" />

          {/* Vision Section */}
          <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="brand.primary" textAlign="center">
                  Our Vision
                </Heading>
                <Text
                  fontSize="lg"
                  color="brand.neutral.700"
                  textAlign="center"
                  lineHeight="1.7"
                  maxW="4xl"
                  mx="auto"
                >
                  We envision a future where every B2B marketer has access to enterprise-grade 
                  AI tools that amplify their creativity and strategic thinking. By combining 
                  human insight with artificial intelligence, we're building a world where 
                  marketing teams can focus on what they do best - building meaningful 
                  relationships with customers - while AI handles the heavy lifting of 
                  personalization, optimization, and scale.
                </Text>
                <Text
                  fontSize="md"
                  color="brand.neutral.500"
                  textAlign="center"
                  fontStyle="italic"
                >
                  Join us in shaping the future of B2B marketing.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
} 