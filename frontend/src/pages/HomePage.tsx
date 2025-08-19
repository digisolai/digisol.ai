import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  List,
  ListItem,
  ListIcon,
  Flex,
  Grid,
  GridItem,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Link,
  useToast,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import Logo from "../components/Logo";
import {
  FiZap,
  FiBarChart2,
  FiUsers,
  FiDollarSign,
  FiImage,
  FiMessageSquare,
  FiTrendingUp,
  FiTarget,
  FiShield,
  FiGlobe,
  FiSmartphone,
  FiMail,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiPlay,
  FiStar,
  FiAward,
  FiHeadphones,
  FiBookOpen,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiMonitor,
  FiPieChart,
  FiSettings,
  FiLink,
  FiGift,
  FiBook,
  FiBriefcase,
  FiTrendingDown,
  FiUserCheck,
  FiBarChart,
  FiVideo,
  FiFileText,
  FiClock,
  FiEye,
  FiCheck,
  FiMenu,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const features: Feature[] = [
  {
    icon: FiCpu,
    title: "AI-Powered Marketing",
    description: "Advanced AI agents that generate content, optimize campaigns, and provide strategic insights",
    color: "brand.primary",
  },
  {
    icon: FiTarget,
    title: "Campaign Management",
    description: "Multi-channel campaign orchestration with automated workflows and real-time optimization",
    color: "green.500",
  },
  {
    icon: FiBarChart2,
    title: "Advanced Analytics",
    description: "Comprehensive analytics with AI-driven insights and predictive performance modeling",
    color: "purple.500",
  },
  {
    icon: FiImage,
    title: "Design Studio",
    description: "AI-assisted design tools for creating stunning visuals, logos, and brand assets",
    color: "orange.500",
  },
  {
    icon: FiDollarSign,
    title: "Budget Management",
    description: "Intelligent budget allocation, ROI tracking, and automated spend optimization",
    color: "teal.500",
  },
  {
    icon: FiUsers,
    title: "Team Collaboration",
    description: "Built-in project management, team coordination, and client portal features",
    color: "pink.500",
  },
  {
    icon: FiBookOpen,
    title: "Learning Center",
    description: "Comprehensive marketing education with badges, achievements, and personalized learning paths",
    color: "indigo.500",
  },
  {
    icon: FiUsers,
    title: "Client Portal Partnership",
    description: "White-label client portals for agencies to manage multiple clients with custom branding",
    color: "cyan.500",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechFlow Solutions",
    content: "DigiSol.AI transformed our marketing operations. The AI insights helped us increase conversion rates by 40% in just 3 months.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "InnovateCorp",
    content: "The campaign automation features saved us countless hours. Our team can now focus on strategy instead of manual tasks.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Digital Marketing Manager",
    company: "GrowthFirst",
    content: "The design studio and AI content generation capabilities are game-changers. We've never been more productive.",
    rating: 5,
  },
];

const pricingTiers: PricingTier[] = [
  {
    name: "Explorer",
    price: "$0",
    period: "14-day trial",
    features: [
      "Up to 100 contacts",
      "1 email campaign",
      "500 tokens included",
      "Basic AI access",
      "1 social media integration",
      "No credit card required",
      "Full platform access",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Ignite",
    price: "$129",
    period: "per month",
    features: [
      "Up to 3,000 contacts",
      "Unlimited email campaigns",
      "10 automation workflows",
      "30,000 tokens/month",
      "Content Creation Agent",
      "5 social media integrations",
      "Email support",
      "Additional tokens: $25/10K",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Growth Accelerator",
    price: "$499",
    period: "per month",
    features: [
      "Up to 20,000 contacts",
      "50 automation workflows",
      "150,000 tokens/month",
      "All AI agents included",
      "Full design studio access",
      "15 integrations",
      "Priority support",
      "Project management & budgeting",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Elite Strategist",
    price: "$1,199",
    period: "per month",
    features: [
      "Unlimited contacts",
      "Unlimited automations",
      "500,000 tokens/month",
      "All 16 AI agents",
      "Client portal management",
      "Unlimited integrations",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Corporate Core",
    price: "$1,999",
    period: "per month",
    features: [
      "Unlimited everything",
      "1,000,000 tokens/month",
      "Corporate Suite included",
      "HR management tools",
      "250 user seats",
      "White-label solutions",
      "Dedicated account manager",
      "Custom AI training",
    ],
    cta: "Contact Sales",
  },
];

const stats = [
  { label: "Active Users", value: "10,000+", help: "Growing daily" },
  { label: "Campaigns Created", value: "50,000+", help: "Successfully executed" },
  { label: "AI Insights Generated", value: "1M+", help: "Data-driven decisions" },
  { label: "Customer Satisfaction", value: "98%", help: "Based on reviews" },
];

const learningFeatures = [
  {
    icon: FiBookOpen,
    title: "Marketing Resources",
    description: "Comprehensive library of articles, videos, and templates",
    color: "brand.primary",
  },
  {
    icon: FiAward,
    title: "Badges & Achievements",
    description: "Gamified learning with token rewards and progress tracking",
            color: "brand.accent",
  },
  {
    icon: FiAward,
    title: "Personalized Learning",
    description: "AI-driven learning paths tailored to your skill level",
    color: "green.500",
  },
  {
    icon: FiAward,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics",
    color: "purple.500",
  },
];

const clientPortalFeatures = [
  {
    icon: FiUsers,
    title: "Multi-Client Management",
    description: "Manage unlimited clients with individual portals",
    color: "brand.primary",
  },
  {
    icon: FiShield,
    title: "White-Label Branding",
    description: "Custom branding and domain for each client portal",
    color: "green.500",
  },
  {
    icon: FiBarChart,
    title: "Client Analytics",
    description: "Track client usage, performance, and billing",
    color: "purple.500",
  },
  {
    icon: FiDollarSign,
    title: "Revenue Generation",
    description: "Create new revenue streams with client portal subscriptions",
    color: "orange.500",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      navigate("/signup");
      setIsLoading(false);
    }, 1000);
  };

  const handleDemo = () => {
    // Open demo scheduling modal or redirect to demo page
    navigate("/demo-schedule");
  };

  const handleLearningCenter = () => {
    navigate("/info-center");
  };

  const handleClientPortal = () => {
    navigate("/my-clients");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        as={FiStar}
        color={i < rating ? "brand.accent" : "gray.300"}
        boxSize={4}
      />
    ));
  };

  return (
    <Box bg={bgColor}>
             {/* Header */}
       <Box
         bg="white"
         px={4}
         borderBottom={1}
         borderStyle={'solid'}
         borderColor="gray.200"
         position="sticky"
         top={0}
         zIndex={1000}
         boxShadow="sm"
       >
         <Container maxW="container.xl">
           <Flex
             color="gray.600"
             minH={'50px'}
             py={{ base: 1 }}
             px={{ base: 4 }}
             align={'center'}
             justify="space-between"
           >
                          <Flex align="center">
                <HStack spacing={2}>
                  <Logo size={32} />
                </HStack>
              </Flex>

                         <Flex display={{ base: 'none', md: 'flex' }} ml={10} align="center">
               <HStack spacing={8}>
                 <Link 
                   color="#1F4287" 
                   _hover={{ color: "#163a6f" }}
                   onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                   cursor="pointer"
                 >
                   Features
                 </Link>
                 <Link 
                   color="#1F4287" 
                   _hover={{ color: "#163a6f" }}
                   onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                   cursor="pointer"
                 >
                   Pricing
                 </Link>
                 <Link 
                   color="#1F4287" 
                   _hover={{ color: "#163a6f" }}
                   onClick={() => navigate('/blog')}
                   cursor="pointer"
                 >
                   Blog
                 </Link>
                 <Link 
                   color="#1F4287" 
                   _hover={{ color: "#163a6f" }}
                   onClick={() => navigate('/about')}
                   cursor="pointer"
                 >
                   About
                 </Link>
                 <Link 
                   color="#1F4287" 
                   _hover={{ color: "#163a6f" }}
                   onClick={() => navigate('/contact-us')}
                   cursor="pointer"
                 >
                   Contact Us
                 </Link>
               </HStack>
             </Flex>

            <HStack spacing={4}>
              <Button
                variant="ghost"
                color="gray.600"
                _hover={{ color: "#1F4287" }}
                onClick={() => navigate('/login')}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                Log In
              </Button>
              <Button
                bg="#1F4287"
                color="#FFC300"
                _hover={{ bg: "#163a6f" }}
                onClick={() => navigate('/signup')}
                display={{ base: 'none', md: 'inline-flex' }}
              >
                Sign Up
              </Button>
              <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                icon={<FiMenu />}
                variant="ghost"
                aria-label="Open menu"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

             {/* Hero Section */}
       <Box
         bgGradient="linear(to-r, #1F4287, #1F4287)"
         color="white"
         py={12}
         position="relative"
         overflow="hidden"
       >
                 <Container maxW="container.xl">
           <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="start">
                           <GridItem>
                <VStack align="start" spacing={4}>
                 <Badge
                   bg="#FFC300"
                   color="white"
                   px={3}
                   py={1}
                   borderRadius="full"
                   fontSize="sm"
                   fontWeight="bold"
                 >
                   🚀 AI-Powered Marketing Platform
                 </Badge>
                                   <Text
                    color="#FFC300"
                    fontSize="5xl"
                    fontWeight="bold"
                    textAlign="center"
                    mt={4}
                    mb={2}
                  >
                    AI Intelligence
                  </Text>
                
                                 <Text fontSize="lg" opacity={0.9} lineHeight="1.6">
                   The complete marketing platform that combines AI-powered insights, 
                   campaign automation, design tools, analytics, and learning resources 
                   to drive unprecedented growth for B2B organizations.
                 </Text>
                 
                 <HStack spacing={8}>
                  <HStack>
                    <Icon as={FiCheckCircle} color="#FFC300" />
                    <Text fontSize="sm">No credit card required</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCheckCircle} color="#FFC300" />
                    <Text fontSize="sm">14-day free trial</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCheckCircle} color="#FFC300" />
                    <Text fontSize="sm">Cancel anytime</Text>
                  </HStack>
                </HStack>
                
                                     <Heading
                     size="xl"
                     fontWeight="bold"
                     lineHeight="1.2"
                   >
                     Transform Your B2B Marketing with AI Intelligence
                   </Heading>
                
                                 <HStack spacing={4}>
                   <Button
                     size="lg"
                     bg="#1F4287"
                     color="#FFC300"
                     _hover={{ bg: "#163a6f", transform: "translateY(-2px)" }}
                     onClick={handleGetStarted}
                     isLoading={isLoading}
                     leftIcon={<FiArrowRight />}
                     transition="all 0.2s"
                   >
                     Start Free Trial
                   </Button>
                   <Button
                     size="lg"
                     bg="#1F4287"
                     color="#FFC300"
                     borderColor="#FFC300"
                     onClick={handleDemo}
                     leftIcon={<FiPlay />}
                     _hover={{ bg: "#163a6f" }}
                   >
                     Watch Demo
                   </Button>
                 </HStack>
             </VStack>
           </GridItem>
            
            <GridItem>
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="2xl"
                position="relative"
              >
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.700">Campaign Performance</Text>
                    <Badge colorScheme="green">+127% ROI</Badge>
                  </HStack>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatNumber color="#1F4287" fontSize="2xl">$2.4M</StatNumber>
                      <StatLabel color="gray.600">Revenue Generated</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber color="#FFC300" fontSize="2xl">15.2K</StatNumber>
                      <StatLabel color="gray.600">Leads Acquired</StatLabel>
                    </Stat>
                  </SimpleGrid>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>AI Recommendations Applied</Text>
                    <Box bg="gray.100" h={2} borderRadius="full" overflow="hidden">
                      <Box bg="#FFC300" h="100%" w="87%" />
                    </Box>
                  </Box>
                  
                  <HStack justify="space-between" fontSize="sm">
                    <Text color="gray.600">Conversion Rate</Text>
                                          <Text fontWeight="bold" color="#1F4287">8.7%</Text>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat, index) => (
              <Stat key={index} textAlign="center">
                <StatNumber fontSize="3xl" color="#1F4287" fontWeight="bold">
                  {stat.value}
                </StatNumber>
                <StatLabel color="gray.600" fontSize="lg">
                  {stat.label}
                </StatLabel>
                <StatHelpText color="gray.500">{stat.help}</StatHelpText>
              </Stat>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} id="features">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl">
              <Heading size="xl" color="#1F4287" mb={4}>
                Everything You Need for Modern B2B Marketing
              </Heading>
              <Text fontSize="lg" color="gray.600">
                From AI-powered content generation to advanced analytics, 
                DigiSol.AI provides all the tools you need to scale your marketing operations.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {features.slice(0, 6).map((feature, index) => (
                <Card
                  key={index}
                  bg="gray.50"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg={`${feature.color}10`}
                        borderRadius="lg"
                        color={feature.color}
                      >
                        <Icon as={feature.icon} boxSize={6} />
                      </Box>
                                             <Heading size="md" color="#1F4287">
                         {feature.title}
                       </Heading>
                      <Text color="gray.600" lineHeight="1.6">
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            
            {/* Learning Center and Client Portal Features - Centered */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="800px" mx="auto">
              {features.slice(6).map((feature, index) => (
                <Card
                  key={index + 6}
                  bg="gray.50"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                  transition="all 0.3s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="center" textAlign="center">
                      <Box
                        p={3}
                        bg={`${feature.color}10`}
                        borderRadius="lg"
                        color={feature.color}
                      >
                        <Icon as={feature.icon} boxSize={6} />
                      </Box>
                      <Heading size="md" color="#1F4287">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" lineHeight="1.6">
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>



      {/* How It Works Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl">
                             <Heading size="xl" color="#1F4287" mb={4}>
                 How DigiSol.AI Works
               </Heading>
              <Text fontSize="lg" color="gray.600">
                Get started in minutes with our simple 3-step process
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <VStack spacing={4} textAlign="center">
                                 <Box
                   w={16}
                   h={16}
                   bg="#1F4287"
                   color="white"
                   borderRadius="full"
                   display="flex"
                   alignItems="center"
                   justifyContent="center"
                   fontSize="2xl"
                   fontWeight="bold"
                 >
                   1
                 </Box>
                 <Heading size="md" color="#1F4287">
                   Connect & Import
                 </Heading>
                <Text color="gray.600">
                  Connect your existing tools and import your data. 
                  Our AI analyzes your current marketing performance.
                </Text>
              </VStack>

              <VStack spacing={4} textAlign="center">
                                 <Box
                   w={16}
                   h={16}
                   bg="#FFC300"
                   color="white"
                   borderRadius="full"
                   display="flex"
                   alignItems="center"
                   justifyContent="center"
                   fontSize="2xl"
                   fontWeight="bold"
                 >
                   2
                 </Box>
                 <Heading size="md" color="#1F4287">
                   AI Analysis & Recommendations
                 </Heading>
                <Text color="gray.600">
                  Our AI provides personalized recommendations for 
                  campaigns, content, and optimization strategies.
                </Text>
              </VStack>

              <VStack spacing={4} textAlign="center">
                                 <Box
                   w={16}
                   h={16}
                   bg="#1F4287"
                   color="white"
                   borderRadius="full"
                   display="flex"
                   alignItems="center"
                   justifyContent="center"
                   fontSize="2xl"
                   fontWeight="bold"
                 >
                   3
                 </Box>
                                 <Heading size="md" color="#1F4287">
                   Execute & Optimize
                 </Heading>
                <Text color="gray.600">
                  Launch campaigns with AI assistance and watch 
                  real-time optimization drive better results.
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl">
                             <Heading size="xl" color="#1F4287" mb={4}>
                 Trusted by Marketing Teams Worldwide
               </Heading>
              <Text fontSize="lg" color="gray.600">
                See what our customers are saying about DigiSol.AI
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  bg="gray.50"
                  border="1px solid"
                  borderColor={borderColor}
                  p={6}
                >
                  <VStack spacing={4} align="start">
                    <HStack>
                      {renderStars(testimonial.rating)}
                    </HStack>
                    <Text color="gray.700" lineHeight="1.6" fontSize="lg">
                      "{testimonial.content}"
                    </Text>
                    <VStack align="start" spacing={1}>
                                             <Text fontWeight="bold" color="#1F4287">
                         {testimonial.name}
                       </Text>
                      <Text fontSize="sm" color="gray.600">
                        {testimonial.role} at {testimonial.company}
                      </Text>
                    </VStack>
                  </VStack>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box py={20} bg="gray.50" id="pricing">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl">
                             <Heading size="xl" color="#1F4287" mb={4}>
                 Simple, Transparent Pricing
               </Heading>
              <Text fontSize="lg" color="gray.600">
                Choose the plan that fits your business needs. 
                All plans include our core AI features and token-based usage.
              </Text>
            </Box>

            <Box>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mb={8}>
                {pricingTiers.slice(0, 3).map((tier, index) => (
                  <Card
                    key={index}
                    bg={cardBg}
                    border="2px solid"
                    borderColor={tier.popular ? "#FFC300" : borderColor}
                    position="relative"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                    transition="all 0.3s"
                  >
                    {tier.popular && (
                      <Badge
                        position="absolute"
                        top={-3}
                        left="50%"
                        transform="translateX(-50%)"
                        colorScheme="brand.accent"
                        px={4}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader textAlign="center" pt={tier.popular ? 8 : 6}>
                      <Heading size="lg" color="#1F4287" mb={2}>
                        {tier.name}
                      </Heading>
                      <HStack justify="center" align="baseline">
                        <Text fontSize="3xl" fontWeight="bold" color="#1F4287">
                          {tier.price}
                        </Text>
                        <Text color="gray.600">{tier.period}</Text>
                      </HStack>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      <VStack spacing={4} align="stretch">
                        <List spacing={3}>
                          {tier.features.map((feature, featureIndex) => (
                            <ListItem key={featureIndex}>
                              <ListIcon as={FiCheckCircle} color="#FFC300" />
                              {feature}
                            </ListItem>
                          ))}
                        </List>
                        
                        <Button
                          bg="#1F4287"
                          color="#FFC300"
                          _hover={{ bg: "#163a6f" }}
                          size="lg"
                          mt={6}
                          onClick={handleGetStarted}
                        >
                          {tier.cta}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="800px" mx="auto">
                {pricingTiers.slice(3).map((tier, index) => (
                  <Card
                    key={index + 3}
                    bg={cardBg}
                    border="2px solid"
                    borderColor={borderColor}
                    position="relative"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                    transition="all 0.3s"
                  >
                    <CardHeader textAlign="center" pt={6}>
                      <Heading size="lg" color="#1F4287" mb={2}>
                        {tier.name}
                      </Heading>
                      <HStack justify="center" align="baseline">
                        <Text fontSize="3xl" fontWeight="bold" color="#1F4287">
                          {tier.price}
                        </Text>
                        <Text color="gray.600">{tier.period}</Text>
                      </HStack>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      <VStack spacing={4} align="stretch">
                        <List spacing={3}>
                          {tier.features.map((feature, featureIndex) => (
                            <ListItem key={featureIndex}>
                              <ListIcon as={FiCheckCircle} color="#FFC300" />
                              {feature}
                            </ListItem>
                          ))}
                        </List>
                        
                        <Button
                          bg="#1F4287"
                          color="#FFC300"
                          _hover={{ bg: "#163a6f" }}
                          size="lg"
                          mt={6}
                          onClick={handleGetStarted}
                        >
                          {tier.cta}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Partnership Program Section */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl">
              <Heading size="xl" color="#1F4287" mb={4}>
                <Text as="span" color="#1F4287">DigiSol</Text>
                <Text as="span" color="brand.accent">.AI</Text> Partnership Program
              </Heading>
              <Text fontSize="lg" color="gray.600">
                For marketing agencies, consultants, and strategic partners. 
                Manage multiple client accounts from a single dashboard with significant financial benefits.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg="gray.50" border="2px solid" borderColor="#1F4287">
                <CardHeader>
                  <VStack align="start" spacing={2}>
                    <Heading size="lg" color="#1F4287">Base Partner Fee</Heading>
                    <Text fontSize="3xl" fontWeight="bold" color="#1F4287">$299</Text>
                    <Text color="gray.600">per month</Text>
                  </VStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <List spacing={3}>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Access to multi-client portal
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Partner-exclusive resources
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Unified dashboard for all clients
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Pooled resources across accounts
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Dedicated partnership support
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheckCircle} color="#FFC300" />
                        Co-branded reporting
                      </ListItem>
                    </List>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.50" border="2px solid" borderColor="#FFC300">
                <CardHeader>
                  <VStack align="start" spacing={2}>
                    <Heading size="lg" color="#1F4287">Client Pricing</Heading>
                    <Text fontSize="lg" color="gray.600">Discounted rates for your clients</Text>
                  </VStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box p={4} bg="brand.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Ignite Plan Clients</Text>
                        <Text fontWeight="bold" color="brand.primary">$79/month</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">per client (vs. $129 regular)</Text>
                    </Box>
                    <Box p={4} bg="brand.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Growth Accelerator Clients</Text>
                        <Text fontWeight="bold" color="brand.primary">$299/month</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">per client (vs. $499 regular)</Text>
                    </Box>
                    <Box p={4} bg="brand.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Elite Strategist Clients</Text>
                        <Text fontWeight="bold" color="brand.primary">$799/month</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">per client (vs. $1,199 regular)</Text>
                    </Box>
                                         <Button
                       variant="brandSolid"
                       size="lg"
                       mt={4}
                       onClick={handleClientPortal}
                       leftIcon={<FiUsers />}
                     >
                       Join Partnership Program
                     </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
             <Box py={20} bg="brand.primary" color="white">
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" mb={4}>
              Ready to Transform Your Marketing?
            </Heading>
            <Text fontSize="xl" opacity={0.9} maxW="2xl">
              Join thousands of B2B marketers who are already using 
              DigiSol.AI to drive growth and scale their operations.
            </Text>
                         <HStack spacing={4}>
                              <Button
                  size="lg"
                  variant="brand"
                  onClick={handleGetStarted}
                  leftIcon={<FiArrowRight />}
                >
                  Start Your Free Trial
                </Button>
               <Button
                 size="lg"
                 variant="brandOutline"
                 onClick={handleDemo}
                 leftIcon={<FiHeadphones />}
               >
                 Schedule Demo
               </Button>
             </HStack>
            <Text fontSize="sm" opacity={0.7}>
              No credit card required • 14-day free trial • Cancel anytime
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box py={16} bg="gray.50" id="contact">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" color="brand.primary">
                Get in Touch
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Ready to transform your marketing with AI? Contact us today to learn how DigiSol.AI can help your business grow.
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
                <Icon as={FiMail} boxSize={8} color="#FFC300" />
                <Heading size="md" color="brand.primary">Email</Heading>
                <Text color="gray.600" textAlign="center">admin@digisolai.ca</Text>
                <Button
                  leftIcon={<FiMail />}
                  colorScheme="brand"
                  onClick={() => window.open('mailto:admin@digisolai.ca', '_blank')}
                >
                  Send Email
                </Button>
              </VStack>
              
              <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
                <Icon as={FiPhone} boxSize={8} color="#FFC300" />
                <Heading size="md" color="brand.primary">Phone</Heading>
                <Text color="gray.600" textAlign="center">+1 (587) 577-0782</Text>
                <Button
                  leftIcon={<FiPhone />}
                  colorScheme="brand"
                  onClick={() => window.open('tel:+15875770782', '_blank')}
                >
                  Call Now
                </Button>
              </VStack>
              
              <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
                <Icon as={FiMapPin} boxSize={8} color="#FFC300" />
                <Heading size="md" color="brand.primary">Address</Heading>
                <Text color="gray.600" textAlign="center">
                  Box 1764<br />
                  Carstairs, Alberta<br />
                  T0M 0N0
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg="gray.900" color="white">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }} gap={8}>
            <GridItem>
                             <VStack align="start" spacing={4}>
                 <HStack spacing={3}>
                   <Logo size={32} />
                   <Heading size="lg">
                     <Text as="span" color="brand.primary">DigiSol</Text>
                     <Text as="span" color="brand.accent">.AI</Text>
                   </Heading>
                 </HStack>
                <Text color="brand.accent" maxW="md">
                  The complete AI-powered marketing platform for B2B organizations. 
                  Transform your marketing operations with intelligent automation and insights.
                </Text>
                <VStack align="start" spacing={2} color="brand.accent" fontSize="sm">
                  <HStack spacing={2}>
                    <Icon as={FiMail} boxSize={4} color="#FFC300" />
                    <Text>admin@digisolai.ca</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiPhone} boxSize={4} color="#FFC300" />
                    <Text>+1 (587) 577-0782</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiMapPin} boxSize={4} color="#FFC300" />
                    <Text>Box 1764, Carstairs, Alberta T0M 0N0</Text>
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md">Product</Heading>
                <VStack align="start" spacing={2}>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    cursor="pointer"
                  >
                    Features
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    cursor="pointer"
                  >
                    Pricing
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    onClick={() => navigate('/integrations')}
                    cursor="pointer"
                  >
                    Integrations
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    API
                  </Link>
                </VStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md">Company</Heading>
                <VStack align="start" spacing={2}>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    onClick={() => navigate('/about')}
                    cursor="pointer"
                  >
                    About
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Blog
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Careers
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    cursor="pointer"
                  >
                    Contact
                  </Link>
                </VStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md">Support</Heading>
                <VStack align="start" spacing={2}>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Help Center
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Documentation
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Community
                  </Link>
                  <Link 
                    color="brand.accent" 
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Status
                  </Link>
                </VStack>
              </VStack>
            </GridItem>
          </Grid>
          
          <Divider my={8} borderColor="gray.700" />
          
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={4}
          >
            <Text color="brand.accent" fontSize="sm">
              © 2024 DigiSol.AI. All rights reserved.
            </Text>
            <HStack spacing={6} mt={{ base: 4, md: 0 }}>
              <Link color="brand.accent" fontSize="sm" _hover={{ color: "white" }} cursor="pointer">
                Privacy Policy
              </Link>
              <Link color="brand.accent" fontSize="sm" _hover={{ color: "white" }} cursor="pointer">
                Terms of Service
              </Link>
              <Link color="brand.accent" fontSize="sm" _hover={{ color: "white" }} cursor="pointer">
                Cookie Policy
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Logo size={30} />
              <Text
                fontFamily={'heading'}
                fontWeight="bold"
                fontSize="lg"
              >
                <Text as="span" color="#1F4287">DigiSol</Text>
                <Text as="span" color="#FFC300">.AI</Text>
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" pt={4}>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" color="gray.700">Navigation</Text>
                <VStack spacing={3} align="stretch">
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      onClose();
                    }}
                  >
                    Features
                  </Button>
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                      onClose();
                    }}
                  >
                    Pricing
                  </Button>
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      navigate('/blog');
                      onClose();
                    }}
                  >
                    Blog
                  </Button>
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      navigate('/about');
                      onClose();
                    }}
                  >
                    About
                  </Button>
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      navigate('/contact-us');
                      onClose();
                    }}
                  >
                    Contact Us
                  </Button>
                </VStack>
              </VStack>
              
              <Divider />
              
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" color="gray.700">Account</Text>
                <VStack spacing={3} align="stretch">
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    onClick={() => {
                      navigate('/login');
                      onClose();
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    bg="#1F4287"
                    color="#FFC300"
                    _hover={{ bg: "#163a6f" }}
                    onClick={() => {
                      navigate('/signup');
                      onClose();
                    }}
                  >
                    Sign Up
                  </Button>
                </VStack>
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 