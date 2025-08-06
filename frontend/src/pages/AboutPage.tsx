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
  Badge,
  Button,
  Image,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  List,
  ListItem,
  ListIcon,
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
  FiCheck,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiAward,
  FiShield,
  FiCpu,
  FiBookOpen,
  FiSettings,
} from "react-icons/fi";
import { Layout } from "../components/Layout";

interface Capability {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar?: string;
}

const capabilities: Capability[] = [
  {
    icon: FiCpu,
    title: "AI-Powered Marketing",
    description: "Advanced AI agents that generate content, optimize campaigns, and provide strategic insights.",
  },
  {
    icon: FiZap,
    title: "Campaign Automation",
    description: "Intelligent workflow automation with multi-channel campaigns and smart triggers.",
  },
  {
    icon: FiDollarSign,
    title: "Budget Management",
    description: "Comprehensive budgeting tools with ROI tracking and spend optimization.",
  },
  {
    icon: FiUsers,
    title: "Team Collaboration",
    description: "Built-in organizational tools for teams, departments, and client management.",
  },
  {
    icon: FiBarChart2,
    title: "Advanced Analytics",
    description: "Deep insights with custom reports, AI recommendations, and performance tracking.",
  },
  {
    icon: FiImage,
    title: "Design Studio",
    description: "Integrated design tools with AI assistance for creating stunning brand assets.",
  },
  {
    icon: FiBookOpen,
    title: "Learning Center",
    description: "Comprehensive learning resources, courses, and AI-guided mentorship.",
  },
  {
    icon: FiSettings,
    title: "Customizable Platform",
    description: "Flexible platform that adapts to your brand and business requirements.",
  },
];

const teamMembers: TeamMember[] = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    description: "Former VP of Marketing at Fortune 500 companies with 15+ years in digital marketing.",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    description: "AI/ML expert with experience building scalable platforms for enterprise clients.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Product",
    description: "Product leader focused on creating intuitive user experiences and innovative features.",
  },
  {
    name: "David Kim",
    role: "Head of Customer Success",
    description: "Dedicated to ensuring customer success and building long-term partnerships.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center" py={12}>
            <Heading
              size="2xl"
              color="brand.primary"
              mb={6}
              fontWeight="bold"
            >
              About DigiSol.AI
            </Heading>
            <Text
              fontSize="xl"
              color="brand.neutral.600"
              maxW="4xl"
              mx="auto"
              lineHeight="1.6"
              mb={8}
            >
              Empowering B2B marketers with AI-driven insights and no-code automation 
              to create hyper-personalized customer experiences at scale.
            </Text>
            <HStack spacing={4} justify="center">
              <Badge bg="brand.primary" color="white" variant="solid" fontSize="md" px={4} py={2}>
                <Icon as={FiAward} mr={2} color="brand.accent" />
                Trusted by 500+ Companies
              </Badge>
              <Badge bg="brand.primary" color="white" variant="solid" fontSize="md" px={4} py={2}>
                <Icon as={FiShield} mr={2} color="brand.accent" />
                Enterprise Security
              </Badge>
              <Badge bg="brand.primary" color="white" variant="solid" fontSize="md" px={4} py={2}>
                <Icon as={FiCpu} mr={2} color="brand.accent" />
                AI-Powered
              </Badge>
            </HStack>
          </Box>

          {/* Mission & Vision */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color="brand.primary" textAlign="center">
                    Our Mission
                  </Heading>
                  <Text fontSize="lg" color="brand.neutral.700" lineHeight="1.6">
                    To democratize AI-powered marketing by providing enterprise-grade tools 
                    that make sophisticated marketing automation accessible to businesses of all sizes.
                  </Text>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      Simplify complex marketing workflows
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      Reduce time-to-market for campaigns
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      Increase ROI through AI optimization
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color="brand.primary" textAlign="center">
                    Our Vision
                  </Heading>
                  <Text fontSize="lg" color="brand.neutral.700" lineHeight="1.6">
                    To become the leading AI-powered marketing platform that transforms 
                    how businesses connect with their customers through intelligent, 
                    personalized experiences.
                  </Text>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      AI-first approach to marketing
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      Seamless integration ecosystem
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="brand.accent" />
                      Continuous innovation and learning
                    </ListItem>
                  </List>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Stats Section */}
          <Card bg="brand.primary" color="white">
            <CardBody p={8}>
              <StatGroup>
                <Stat textAlign="center">
                  <StatLabel fontSize="lg">Active Users</StatLabel>
                  <StatNumber fontSize="3xl">10,000+</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="lg">Campaigns Created</StatLabel>
                  <StatNumber fontSize="3xl">50,000+</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="lg">AI Agents</StatLabel>
                  <StatNumber fontSize="3xl">25+</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="lg">Customer Satisfaction</StatLabel>
                  <StatNumber fontSize="3xl">98%</StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>

          {/* Features Section */}
          <Box>
            <Heading size="xl" color="brand.primary" textAlign="center" mb={8}>
              Platform Features
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {capabilities.map((capability, index) => (
                <Card key={index} shadow="md" _hover={{ shadow: 'lg' }} transition="all 0.3s">
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <Icon
                        as={capability.icon}
                        boxSize={8}
                        color="brand.accent"
                      />
                      <Heading size="md" color="brand.primary">
                        {capability.title}
                      </Heading>
                      <Text fontSize="sm" color="brand.neutral.600" lineHeight="1.5">
                        {capability.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Team Section */}
          <Box>
            <Heading size="xl" color="brand.primary" textAlign="center" mb={8}>
              Leadership Team
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {teamMembers.map((member, index) => (
                <Card key={index} shadow="md" _hover={{ shadow: 'lg' }} transition="all 0.3s">
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <HStack spacing={4}>
                        <Box
                          w={16}
                          h={16}
                          bg="brand.primary"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontSize="xl"
                          fontWeight="bold"
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="brand.primary">
                            {member.name}
                          </Heading>
                          <Badge bg="brand.primary" color="white" variant="solid">
                            {member.role}
                          </Badge>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="brand.neutral.600" lineHeight="1.5">
                        {member.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Contact Section */}
          <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="brand.primary" textAlign="center">
                  Get in Touch
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <VStack spacing={3} align="center">
                    <Icon as={FiMail} boxSize={6} color="brand.accent" />
                    <Text fontSize="sm" fontWeight="medium">Email</Text>
                    <Text fontSize="sm" color="brand.neutral.600">hello@digisol.ai</Text>
                  </VStack>
                  <VStack spacing={3} align="center">
                    <Icon as={FiPhone} boxSize={6} color="brand.accent" />
                    <Text fontSize="sm" fontWeight="medium">Phone</Text>
                    <Text fontSize="sm" color="brand.neutral.600">+1 (555) 123-4567</Text>
                  </VStack>
                  <VStack spacing={3} align="center">
                    <Icon as={FiGlobe} boxSize={6} color="brand.accent" />
                    <Text fontSize="sm" fontWeight="medium">Website</Text>
                    <Text fontSize="sm" color="brand.neutral.600">www.digisol.ai</Text>
                  </VStack>
                </SimpleGrid>
                <HStack justify="center" pt={4}>
                  <Button
                    leftIcon={<FiMail />}
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: "brand.600" }}
                    _active={{ bg: "brand.700" }}
                    size="lg"
                    onClick={() => window.open('mailto:hello@digisol.ai', '_blank')}
                  >
                    Contact Us
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
} 