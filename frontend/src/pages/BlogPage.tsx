import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Icon,
  Container,
  Divider,
  Button,
  Link,
  useColorModeValue,
  Badge,
  Flex,
  Tag,
  TagLabel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Image,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowRight,
  FiChevronRight,
  FiZap,
  FiTarget,
  FiBarChart2,
  FiUsers,
  FiMessageSquare,
  FiCpu,
  FiShield,
  FiTrendingUp,
  FiCheck,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const BlogPage = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-r, #1F4287, #1F4287)"
        color="white"
        py={12}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center">
            <HStack spacing={4}>
              <Logo size={40} />
              <VStack spacing={1} align="start">
                <Text fontSize="sm" opacity={0.8}>DigiSol.AI Blog</Text>
                <Text fontSize="xs" opacity={0.6}>AI-Powered Marketing Insights</Text>
              </VStack>
            </HStack>
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              maxW="4xl"
            >
              The Future of AI-Powered Marketing Automation
            </Heading>
            <Text fontSize="xl" maxW="3xl" opacity={0.9}>
              Discover how artificial intelligence is revolutionizing marketing automation 
              and transforming the way businesses connect with their customers.
            </Text>

            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                AI Marketing
              </Badge>
              <Badge colorScheme="green" variant="solid" px={3} py={1}>
                Automation
              </Badge>
              <Badge colorScheme="purple" variant="solid" px={3} py={1}>
                Digital Transformation
              </Badge>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Breadcrumb */}
      <Container maxW="container.xl" py={4}>
        <Breadcrumb
          spacing="8px"
          separator={<FiChevronRight color="gray.500" />}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')} cursor="pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Blog</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Container>

      {/* Article Content */}
      <Container maxW="container.lg" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Article Body */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={8} align="stretch">
                {/* Introduction */}
                <Box>
                  <Text fontSize="lg" color="gray.700" lineHeight="tall">
                    AI-powered marketing automation represents the next evolution in digital marketing. 
                    By leveraging machine learning algorithms, businesses can now create highly 
                    personalized customer experiences at scale, optimize campaigns in real-time, 
                    and drive unprecedented levels of engagement and conversion.
                  </Text>
                </Box>

                {/* Key Benefits Section */}
                <Box>
                  <Heading size="lg" color="#1F4287" mb={6}>
                    The Transformative Power of AI in Marketing
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Box p={2} borderRadius="full" bg="#1F4287" color="white">
                          <Icon as={FiZap} boxSize={5} />
                        </Box>
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" color="#1F4287">Real-Time Optimization</Text>
                          <Text fontSize="sm" color="gray.600">
                            AI continuously analyzes performance data and automatically adjusts 
                            campaigns for maximum effectiveness.
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={3}>
                        <Box p={2} borderRadius="full" bg="#1F4287" color="white">
                          <Icon as={FiUsers} boxSize={5} />
                        </Box>
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" color="#1F4287">Personalization at Scale</Text>
                          <Text fontSize="sm" color="gray.600">
                            Deliver tailored content and experiences to individual customers 
                            across all touchpoints automatically.
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Box p={2} borderRadius="full" bg="#1F4287" color="white">
                          <Icon as={FiBarChart2} boxSize={5} />
                        </Box>
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" color="#1F4287">Predictive Analytics</Text>
                          <Text fontSize="sm" color="gray.600">
                            Anticipate customer behavior and market trends to stay ahead 
                            of the competition.
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={3}>
                        <Box p={2} borderRadius="full" bg="#1F4287" color="white">
                          <Icon as={FiTarget} boxSize={5} />
                        </Box>
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" color="#1F4287">Intelligent Targeting</Text>
                          <Text fontSize="sm" color="gray.600">
                            Identify and reach the most valuable prospects with precision 
                            targeting algorithms.
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Main Content */}
                <Box>
                  <Heading size="lg" color="#1F4287" mb={6}>
                    How AI Marketing Automation Works
                  </Heading>
                  <Text fontSize="md" color="gray.700" lineHeight="tall" mb={6}>
                    At its core, AI marketing automation combines the power of artificial intelligence 
                    with sophisticated marketing workflows to create a system that learns, adapts, 
                    and optimizes continuously. Here's how it transforms your marketing efforts:
                  </Text>
                  
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Heading size="md" color="#1F4287" mb={3}>
                        1. Data Collection and Analysis
                      </Heading>
                      <Text fontSize="md" color="gray.700" lineHeight="tall">
                        AI systems gather data from multiple sources including website interactions, 
                        email engagement, social media activity, and customer behavior patterns. 
                        This data is then analyzed to identify trends, preferences, and opportunities 
                        that human marketers might miss.
                      </Text>
                    </Box>

                    <Box>
                      <Heading size="md" color="#1F4287" mb={3}>
                        2. Intelligent Content Creation
                      </Heading>
                      <Text fontSize="md" color="gray.700" lineHeight="tall">
                        AI can generate personalized content, email subject lines, ad copy, and 
                        social media posts that resonate with specific audience segments. It learns 
                        what works best for different demographics and continuously improves its output.
                      </Text>
                    </Box>

                    <Box>
                      <Heading size="md" color="#1F4287" mb={3}>
                        3. Automated Campaign Management
                      </Heading>
                      <Text fontSize="md" color="gray.700" lineHeight="tall">
                        Campaigns are automatically triggered based on customer behavior, 
                        optimized in real-time based on performance metrics, and scaled up or 
                        down according to predefined business rules and AI recommendations.
                      </Text>
                    </Box>

                    <Box>
                      <Heading size="md" color="#1F4287" mb={3}>
                        4. Predictive Customer Journey Mapping
                      </Heading>
                      <Text fontSize="md" color="gray.700" lineHeight="tall">
                        AI predicts the optimal path each customer should take through your 
                        marketing funnel, automatically delivering the right message at the 
                        right time to maximize conversion probability.
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* ROI Section */}
                <Box>
                  <Heading size="lg" color="#1F4287" mb={6}>
                    Measurable Results and ROI
                  </Heading>
                  <Text fontSize="md" color="gray.700" lineHeight="tall" mb={6}>
                    The impact of AI-powered marketing automation is measurable and significant. 
                    Businesses implementing these solutions typically see:
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Card bg="blue.50" border="1px" borderColor="blue.200">
                      <CardBody textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" color="#1F4287">40%</Text>
                        <Text fontSize="sm" color="gray.600">Increase in Conversion Rates</Text>
                      </CardBody>
                    </Card>
                    <Card bg="green.50" border="1px" borderColor="green.200">
                      <CardBody textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" color="green.600">60%</Text>
                        <Text fontSize="sm" color="gray.600">Reduction in Customer Acquisition Cost</Text>
                      </CardBody>
                    </Card>
                    <Card bg="purple.50" border="1px" borderColor="purple.200">
                      <CardBody textAlign="center">
                        <Text fontSize="3xl" fontWeight="bold" color="purple.600">3x</Text>
                        <Text fontSize="sm" color="gray.600">Faster Campaign Optimization</Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </Box>

                {/* Call to Action */}
                <Box textAlign="center" py={8}>
                  <VStack spacing={6}>
                    <Heading size="lg" color="#1F4287">
                      Ready to Transform Your Marketing with AI?
                    </Heading>
                    <Text fontSize="lg" color="gray.600" maxW="2xl">
                      Join thousands of marketers who are already leveraging AI to automate 
                      their campaigns and drive unprecedented results.
                    </Text>
                    <HStack spacing={4}>
                      <Button
                        size="lg"
                        bg="#1F4287"
                        color="#FFC300"
                        _hover={{ bg: "#163a6f" }}
                        onClick={() => navigate('/signup')}
                      >
                        Start Free Trial
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        color="#1F4287"
                        borderColor="#1F4287"
                        _hover={{ bg: "#1F4287", color: "white" }}
                        onClick={() => navigate('/contact-us')}
                      >
                        Schedule Demo
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Newsletter Signup */}
      <Box bg={cardBg} borderTop="1px" borderColor={borderColor} py={16}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Logo size={32} />
                <Text fontSize="lg" fontWeight="bold" color="#1F4287">
                  Stay Updated with AI Marketing Insights
                </Text>
              </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Get the latest articles, tips, and strategies delivered directly to your inbox. 
                Join thousands of marketers who are already transforming their campaigns with AI.
              </Text>
            </VStack>
            <VStack spacing={4} maxW="md" w="full">
              <HStack spacing={4} w="full">
                <Button
                  size="lg"
                  bg="#1F4287"
                  color="#FFC300"
                  _hover={{ bg: "#163a6f" }}
                  flex={1}
                  leftIcon={<FiMail />}
                >
                  Subscribe to Newsletter
                </Button>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                No spam, unsubscribe at any time. We respect your privacy.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default BlogPage;
