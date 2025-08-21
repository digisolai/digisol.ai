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
  useColorModeValue,
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
    name: "Cameron Brown",
    role: "CEO",
    description: "Full Stack Developer and Digital Marketing and Social Media Expert with extensive experience in AI-powered marketing solutions.",
  },
];

export default function AboutPage() {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-r, #1F4287, #1F4287)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              maxW="3xl"
              textAlign="center"
              color="white"
            >
              About{" "}
              <Text as="span" color="#FFC300">
                DigiSol.AI
              </Text>
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              We're revolutionizing B2B marketing with AI-powered automation, 
              intelligent insights, and comprehensive tools that scale with your business.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={16}>
          {/* Mission Section */}
          <Box>
            <VStack spacing={8} textAlign="center">
              <Heading size="xl" color="#1F4287">
                Our Mission
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl" lineHeight="1.8">
                To democratize AI-powered marketing for B2B organizations of all sizes. 
                We believe every business deserves access to enterprise-grade marketing 
                automation and intelligence that drives real results.
              </Text>
            </VStack>
          </Box>

          {/* Stats Section */}
          <Box w="full">
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody p={8}>
                <StatGroup>
                  <Stat textAlign="center">
                    <StatNumber color="#1F4287" fontSize="3xl">500+</StatNumber>
                    <StatLabel color="gray.600">Active Users</StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber color="#FFC300" fontSize="3xl">$2.4M</StatNumber>
                    <StatLabel color="gray.600">Revenue Generated</StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber color="#1F4287" fontSize="3xl">15.2K</StatNumber>
                    <StatLabel color="gray.600">Leads Acquired</StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber color="#FFC300" fontSize="3xl">98%</StatNumber>
                    <StatLabel color="gray.600">Customer Satisfaction</StatLabel>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>
          </Box>

          {/* Capabilities Section */}
          <Box>
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Heading size="xl" color="#1F4287">
                  What We Do
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl">
                  DigiSol.AI provides a comprehensive suite of AI-powered marketing tools 
                  designed specifically for B2B organizations.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                {capabilities.map((capability, index) => (
                  <Card key={index} bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }} transition="all 0.3s">
                    <CardBody p={6}>
                      <VStack spacing={4} align="start">
                        <Box
                          p={3}
                          bg="#1F4287"
                          color="#FFC300"
                          borderRadius="lg"
                        >
                          <Icon as={capability.icon} boxSize={6} />
                        </Box>
                        <VStack spacing={2} align="start">
                          <Heading size="md" color="#1F4287">
                            {capability.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.600" lineHeight="1.5">
                            {capability.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Team Section */}
          <Box>
            <Heading size="xl" color="#1F4287" textAlign="center" mb={8}>
              Founder & CEO
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {teamMembers.map((member, index) => (
                <Card key={index} bg={cardBg} border="1px" borderColor={borderColor} shadow="md" _hover={{ shadow: 'lg' }} transition="all 0.3s">
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <HStack spacing={4}>
                        <Box
                          w={16}
                          h={16}
                          bg="#1F4287"
                          color="#FFC300"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xl"
                          fontWeight="bold"
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="#1F4287">
                            {member.name}
                          </Heading>
                          <Badge bg="#1F4287" color="#FFC300" variant="solid">
                            {member.role}
                          </Badge>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" lineHeight="1.5">
                        {member.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Contact Section */}
          <Card bg="gray.50" border="1px solid" borderColor="gray.200">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="#1F4287" textAlign="center">
                  Get in Touch
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <VStack spacing={3} align="center">
                    <Icon as={FiMail} boxSize={6} color="#FFC300" />
                    <Text fontSize="sm" fontWeight="medium">Email</Text>
                    <Text fontSize="sm" color="gray.600">admin@digisolai.ca</Text>
                  </VStack>
                  <VStack spacing={3} align="center">
                    <Icon as={FiPhone} boxSize={6} color="#FFC300" />
                    <Text fontSize="sm" fontWeight="medium">Phone</Text>
                    <Text fontSize="sm" color="gray.600">+1 (587) 577-0782</Text>
                  </VStack>
                  <VStack spacing={3} align="center">
                    <Icon as={FiMapPin} boxSize={6} color="#FFC300" />
                    <Text fontSize="sm" fontWeight="medium">Address</Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">Box 1764<br />Carstairs, Alberta<br />T0M 0N0</Text>
                  </VStack>
                </SimpleGrid>
                <HStack justify="center" pt={4}>
                  <Button
                    leftIcon={<FiMail />}
                    bg="#1F4287"
                    color="#FFC300"
                    _hover={{ bg: "#163a6f" }}
                    _active={{ bg: "#163a6f" }}
                    size="lg"
                    onClick={() => window.open('mailto:admin@digisolai.ca', '_blank')}
                  >
                    Contact Us
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
} 