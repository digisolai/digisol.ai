import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Container,
  Divider,
  Button,
  Link,
  useColorModeValue,
  Badge,
  Avatar,
  Flex,
  Tag,
  TagLabel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowRight,
  FiTrendingUp,
  FiZap,
  FiTarget,
  FiBarChart2,
  FiUsers,
  FiMessageSquare,
  FiBookOpen,
  FiCpu,
  FiShield,
  FiGlobe,
  FiAward,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featured?: boolean;
  imageUrl?: string;
}

const BlogPage = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Future of AI-Powered Marketing Automation",
      excerpt: "Discover how artificial intelligence is revolutionizing marketing automation and transforming the way businesses connect with their customers.",
      content: "AI-powered marketing automation represents the next evolution in digital marketing. By leveraging machine learning algorithms, businesses can now create highly personalized customer experiences at scale...",
      author: "DigiSol.AI Team",
      publishDate: "2024-01-15",
      readTime: "8 min read",
      category: "AI Marketing",
      tags: ["AI Automation", "Marketing", "Personalization"],
      featured: true,
    },
    {
      id: "2",
      title: "Building Intelligent Campaign Workflows with AI",
      excerpt: "Learn how to design and implement intelligent marketing workflows that adapt and optimize in real-time using AI technology.",
      content: "Intelligent campaign workflows are the backbone of modern marketing success. With AI at the helm, these workflows can automatically adjust strategies based on real-time performance data...",
      author: "Sarah Johnson",
      publishDate: "2024-01-12",
      readTime: "6 min read",
      category: "Campaign Management",
      tags: ["Workflows", "Campaigns", "Optimization"],
    },
    {
      id: "3",
      title: "The Power of Predictive Analytics in Marketing",
      excerpt: "Explore how predictive analytics can help you anticipate customer behavior and make data-driven marketing decisions.",
      content: "Predictive analytics has become a game-changer in marketing, allowing businesses to forecast trends, identify opportunities, and optimize their strategies before competitors even react...",
      author: "Michael Chen",
      publishDate: "2024-01-10",
      readTime: "7 min read",
      category: "Analytics",
      tags: ["Predictive Analytics", "Data Science", "ROI"],
    },
    {
      id: "4",
      title: "AI-Driven Content Generation: Beyond Basic Automation",
      excerpt: "Discover advanced AI content generation techniques that create engaging, personalized content that resonates with your audience.",
      content: "Modern AI content generation goes far beyond simple text creation. It involves understanding context, audience preferences, and brand voice to produce content that truly connects...",
      author: "Emily Rodriguez",
      publishDate: "2024-01-08",
      readTime: "9 min read",
      category: "Content Marketing",
      tags: ["Content Generation", "Personalization", "AI Writing"],
    },
    {
      id: "5",
      title: "Customer Journey Mapping with AI Insights",
      excerpt: "Learn how AI can help you map and optimize customer journeys for maximum engagement and conversion.",
      content: "Customer journey mapping with AI provides unprecedented insights into how customers interact with your brand across all touchpoints...",
      author: "David Thompson",
      publishDate: "2024-01-05",
      readTime: "5 min read",
      category: "Customer Experience",
      tags: ["Customer Journey", "UX", "Conversion"],
    },
    {
      id: "6",
      title: "The ROI of AI Marketing: Measuring Success",
      excerpt: "Understand how to measure and demonstrate the return on investment from your AI marketing initiatives.",
      content: "Measuring AI marketing ROI requires a comprehensive approach that goes beyond traditional metrics. It involves tracking both quantitative and qualitative improvements...",
      author: "Lisa Wang",
      publishDate: "2024-01-03",
      readTime: "6 min read",
      category: "ROI & Analytics",
      tags: ["ROI", "Metrics", "Performance"],
    },
  ];

  const categories = [
    { name: "AI Marketing", count: 2, color: "blue" },
    { name: "Campaign Management", count: 1, color: "green" },
    { name: "Analytics", count: 1, color: "purple" },
    { name: "Content Marketing", count: 1, color: "orange" },
    { name: "Customer Experience", count: 1, color: "teal" },
    { name: "ROI & Analytics", count: 1, color: "pink" },
  ];

  const featuredPost = blogPosts.find(post => post.featured);

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
            >
              DigiSol.AI{" "}
              <Text as="span" color="#FFC300">
                Blog
              </Text>
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              Insights, strategies, and expert perspectives on AI-powered marketing 
              automation and digital transformation.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              {categories.slice(0, 4).map((category, index) => (
                <Badge
                  key={index}
                  colorScheme={category.color}
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  {category.name}
                </Badge>
              ))}
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

      {/* Featured Post */}
      {featuredPost && (
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="#1F4287">
              Featured Article
            </Heading>
            <Card bg={cardBg} border="1px" borderColor={borderColor} overflow="hidden">
              <CardHeader>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3}>
                    <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                      {featuredPost.category}
                    </Badge>
                    <Badge colorScheme="yellow" variant="subtle" px={3} py={1}>
                      Featured
                    </Badge>
                  </HStack>
                  <Heading size="lg" color="#1F4287">
                    {featuredPost.title}
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    {featuredPost.excerpt}
                  </Text>
                  <HStack spacing={6} color="gray.500" fontSize="sm">
                    <HStack spacing={2}>
                      <Icon as={FiUser} />
                      <Text>{featuredPost.author}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} />
                      <Text>{new Date(featuredPost.publishDate).toLocaleDateString()}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiClock} />
                      <Text>{featuredPost.readTime}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <Text color="gray.700" lineHeight="tall">
                    {featuredPost.content}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {featuredPost.tags.map((tag, index) => (
                      <Tag key={index} size="sm" colorScheme="blue" variant="outline">
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                  <Button
                    rightIcon={<FiArrowRight />}
                    colorScheme="blue"
                    variant="outline"
                    alignSelf="flex-start"
                  >
                    Read Full Article
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      )}

      <Divider />

      {/* Blog Posts Grid */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="#1F4287">
              Latest Articles
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Stay ahead of the curve with our latest insights on AI marketing, 
              automation strategies, and digital transformation.
            </Text>
          </VStack>

          {/* Blog Posts */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Card key={post.id} bg={cardBg} border="1px" borderColor={borderColor} h="full">
                <CardHeader>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                        {post.category}
                      </Badge>
                      <HStack spacing={2} color="gray.500" fontSize="sm">
                        <Icon as={FiClock} />
                        <Text>{post.readTime}</Text>
                      </HStack>
                    </HStack>
                    <Heading size="md" color="#1F4287" noOfLines={2}>
                      {post.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" noOfLines={3}>
                      {post.excerpt}
                    </Text>
                  </VStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4} color="gray.500" fontSize="sm">
                      <HStack spacing={2}>
                        <Icon as={FiUser} />
                        <Text>{post.author}</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} />
                        <Text>{new Date(post.publishDate).toLocaleDateString()}</Text>
                      </HStack>
                    </HStack>
                    <HStack spacing={2} flexWrap="wrap">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <Tag key={index} size="sm" colorScheme="gray" variant="outline">
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                    <Button
                      rightIcon={<FiArrowRight />}
                      colorScheme="blue"
                      variant="ghost"
                      size="sm"
                      alignSelf="flex-start"
                    >
                      Read More
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Load More Button */}
          <Button
            size="lg"
            bg="#1F4287"
            color="#FFC300"
            _hover={{ bg: "#163a6f" }}
            px={8}
          >
            Load More Articles
          </Button>
        </VStack>
      </Container>

      {/* Newsletter Signup */}
      <Box bg={cardBg} borderTop="1px" borderColor={borderColor} py={16}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading size="lg" color="#1F4287">
                Stay Updated with AI Marketing Insights
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Get the latest articles, tips, and strategies delivered directly to your inbox. 
                Join thousands of marketers who are already transforming their campaigns with AI.
              </Text>
            </VStack>
            <HStack spacing={4} maxW="md" w="full">
              <Button
                size="lg"
                bg="#1F4287"
                color="#FFC300"
                _hover={{ bg: "#163a6f" }}
                flex={1}
              >
                Subscribe to Newsletter
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default BlogPage;
