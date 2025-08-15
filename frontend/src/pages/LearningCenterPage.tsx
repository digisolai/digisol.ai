import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Flex,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import {
  FiBook,
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiStar,
  FiClock,
  FiEye,
  FiCheck,
  FiPlay,
  FiBarChart,
  FiMail,
  FiGlobe,
  FiCpu,
  FiDollarSign,
  FiGift,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiImage,
  FiInfo,
  FiUser,
} from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import { Layout } from '../components/Layout';
import { AIAgentSection } from '../components/AIAgentSection';
import { PageLayout, SectionCard, SideCard } from '../components/PageLayout';
import api from '../services/api';
import type { AIProfile } from '../types/ai';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: string;
  progress: number;
  is_completed: boolean;
  instructor: string;
  thumbnail_url?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  is_completed: boolean;
  video_url?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  difficulty: string;
  icon_url?: string;
  token_reward: number;
  is_earned: boolean;
  earned_at?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  achievement_type: string;
  value: number;
  target_value: number;
  token_reward: number;
  earned_at?: string;
}

interface MarketingResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  category: string;
  difficulty_level: string;
  estimated_read_time: number;
  tags: string[];
  featured_image_url?: string;
  external_url?: string;
  is_featured: boolean;
  view_count: number;
  is_completed: boolean;
  progress_percentage: number;
}

interface UserStats {
  total_badges: number;
  total_achievements: number;
  tokens_earned: number;
  resources_completed: number;
  learning_streak: number;
  total_time_spent: number;
}

export default function LearningCenterPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [resources, setResources] = useState<MarketingResource[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorAgent, setMentorAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<MarketingResource | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchLearningData();
    fetchMentorAgent();
  }, []);

  async function fetchMentorAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=learning_guidance&is_global=true');
      if (res.data && res.data.length > 0) {
        setMentorAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setMentorAgent({
          id: "mentor",
          name: "Mentor",
          specialization: "learning_guidance",
          personality_description: "Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills at your own pace.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Mentor agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setMentorAgent({
        id: "mentor",
        name: "Mentor",
        specialization: "learning_guidance",
        personality_description: "Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills at your own pace.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskMentor = () => {
    toast({
      title: "Mentor is ready to help",
      description: "This will open a chat interface with Mentor to discuss your learning goals!",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all learning data
      const [coursesRes, tutorialsRes, badgesRes, achievementsRes, resourcesRes, statsRes] = await Promise.all([
        api.get('/learning/courses/'),
        api.get('/learning/tutorials/'),
        api.get('/learning/badges/'),
        api.get('/learning/achievements/'),
        api.get('/learning/resources/'),
        api.get('/learning/user-stats/'),
      ]);

      setCourses(coursesRes.data || []);
      setTutorials(tutorialsRes.data || []);
      setBadges(badgesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setResources(resourcesRes.data || []);
      setUserStats(statsRes.data || null);
    } catch (err: unknown) {
      console.error('Error fetching learning data:', err);
      setError('Failed to load learning data');
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Load sample data for demonstration
    setCourses([
      {
        id: '1',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the basics of digital marketing',
        category: 'Marketing',
        duration: 120,
        difficulty: 'Beginner',
        progress: 75,
        is_completed: false,
        instructor: 'Sarah Johnson',
        thumbnail_url: 'https://via.placeholder.com/300x200'
      },
      {
        id: '2',
        title: 'Social Media Strategy',
        description: 'Master social media marketing',
        category: 'Social Media',
        duration: 90,
        difficulty: 'Intermediate',
        progress: 100,
        is_completed: true,
        instructor: 'Mike Chen',
        thumbnail_url: 'https://via.placeholder.com/300x200'
      }
    ]);

    setTutorials([
      {
        id: '1',
        title: 'Setting Up Your First Campaign',
        description: 'Step-by-step guide to creating campaigns',
        category: 'Campaigns',
        duration: 15,
        is_completed: false,
        video_url: 'https://example.com/video1'
      }
    ]);

    setBadges([
      {
        id: '1',
        name: 'First Campaign',
        description: 'Created your first marketing campaign',
        badge_type: 'achievement',
        difficulty: 'easy',
        token_reward: 50,
        is_earned: true,
        earned_at: '2024-01-15'
      }
    ]);

    setResources([
      {
        id: '1',
        title: 'Marketing Best Practices Guide',
        description: 'Comprehensive guide to modern marketing',
        resource_type: 'guide',
        category: 'Marketing',
        difficulty_level: 'Intermediate',
        estimated_read_time: 20,
        tags: ['marketing', 'best-practices'],
        is_featured: true,
        view_count: 1250,
        is_completed: false,
        progress_percentage: 0
      }
    ]);

    setUserStats({
      total_badges: 3,
      total_achievements: 5,
      tokens_earned: 250,
      resources_completed: 8,
      learning_streak: 7,
      total_time_spent: 360
    });
  };

  const handleResourceClick = (resource: MarketingResource) => {
    setSelectedResource(resource);
    onOpen();
  };

  const handleResourceComplete = async (resourceId: string) => {
    try {
      await api.post(`/learning/resources/${resourceId}/complete/`);
      toast({
        title: 'Resource Completed!',
        description: 'Great job! You\'ve earned tokens for completing this resource.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchLearningData(); // Refresh data
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to mark resource as complete',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'video': return FiVideo;
      case 'guide': return FiBook;
      case 'article': return FiFileText;
      case 'infographic': return FiImage;
      default: return FiFileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'green';
              case 'intermediate': return 'brand.accent';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'marketing': return FiTrendingUp;
      case 'social media': return FiUsers;
      case 'automation': return FiZap;
      case 'analytics': return FiBarChart;
      case 'email': return FiMail;
      default: return FiBook;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PageLayout
        title="Learning & Info Center"
        leftColumn={
          <AIAgentSection
            agent={mentorAgent}
            loading={loadingAgent}
            error={agentError}
            onAskQuestion={handleAskMentor}
          />
        }
        centerColumn={
          <SectionCard title="Your Learning Journey">
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>
                  <Icon as={FiBookOpen} mr={2} />
                  Courses & Tutorials
                </Tab>
                <Tab>
                  <Icon as={FiAward} mr={2} />
                  Achievements
                </Tab>
                <Tab>
                  <Icon as={FiFileText} mr={2} />
                  Resources
                </Tab>
              </TabList>

              <TabPanels>
                {/* Courses & Tutorials Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Courses Section */}
                    <Box>
                                             <Heading size="md" mb={4} color="brand.primary">
                         <Icon as={FiUser} mr={2} />
                         Featured Courses
                       </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {courses.map((course) => (
                          <Card key={course.id} shadow="md" _hover={{ shadow: 'lg' }}>
                            {course.thumbnail_url && (
                              <Image
                                src={course.thumbnail_url}
                                alt={course.title}
                                height="150px"
                                objectFit="cover"
                                borderTopRadius="md"
                              />
                            )}
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <Heading size="sm" noOfLines={2}>
                                  {course.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {course.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {course.category}
                                  </Badge>
                                  <Badge colorScheme={getDifficultyColor(course.difficulty)} variant="subtle">
                                    {course.difficulty}
                                  </Badge>
                                </HStack>
                                <Box width="full">
                                  <Text fontSize="xs" color="gray.500" mb={1}>
                                    Progress: {course.progress}%
                                  </Text>
                                  <Progress value={course.progress} colorScheme="blue" size="sm" />
                                </Box>
                                <HStack justify="space-between" width="full">
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={FiClock} mr={1} />
                                    {course.duration} min
                                  </Text>
                                  <Button
                                    size="sm"
                                    colorScheme={course.is_completed ? "green" : "blue"}
                                    variant={course.is_completed ? "solid" : "outline"}
                                  >
                                    {course.is_completed ? (
                                      <>
                                        <Icon as={FiCheck} mr={1} />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <Icon as={FiPlay} mr={1} />
                                        Continue
                                      </>
                                    )}
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Tutorials Section */}
                    <Box>
                      <Heading size="md" mb={4} color="brand.primary">
                        <Icon as={FiVideo} mr={2} />
                        Quick Tutorials
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {tutorials.map((tutorial) => (
                          <Card key={tutorial.id} shadow="md" _hover={{ shadow: 'lg' }}>
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <Heading size="sm" noOfLines={2}>
                                  {tutorial.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {tutorial.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme="purple" variant="subtle">
                                    {tutorial.category}
                                  </Badge>
                                  <Badge colorScheme={tutorial.is_completed ? "green" : "gray"} variant="subtle">
                                    {tutorial.is_completed ? "Completed" : "Pending"}
                                  </Badge>
                                </HStack>
                                <HStack justify="space-between" width="full">
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={FiClock} mr={1} />
                                    {tutorial.duration} min
                                  </Text>
                                  <Button
                                    size="sm"
                                    colorScheme={tutorial.is_completed ? "green" : "blue"}
                                    variant={tutorial.is_completed ? "solid" : "outline"}
                                  >
                                    {tutorial.is_completed ? (
                                      <>
                                        <Icon as={FiCheck} mr={1} />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <Icon as={FiPlay} mr={1} />
                                        Watch
                                      </>
                                    )}
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Achievements Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Badges Section */}
                    <Box>
                      <Heading size="md" mb={4} color="brand.primary">
                        <Icon as={FiAward} mr={2} />
                        Badges Earned
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {badges.map((badge) => (
                          <Card key={badge.id} shadow="md" _hover={{ shadow: 'lg' }}>
                            <CardBody>
                              <VStack align="center" spacing={3}>
                                <Icon
                                  as={badge.is_earned ? GiTrophy : FiAward}
                                  boxSize={8}
                                  color={badge.is_earned ? "brand.accent" : "gray.400"}
                                />
                                <Heading size="sm" textAlign="center">
                                  {badge.name}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" textAlign="center">
                                  {badge.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme={badge.is_earned ? "green" : "gray"} variant="subtle">
                                    {badge.is_earned ? "Earned" : "Locked"}
                                  </Badge>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {badge.token_reward} tokens
                                  </Badge>
                                </HStack>
                                {badge.earned_at && (
                                  <Text fontSize="xs" color="gray.500">
                                    Earned: {new Date(badge.earned_at).toLocaleDateString()}
                                  </Text>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Achievements Section */}
                    <Box>
                      <Heading size="md" mb={4} color="brand.primary">
                        <Icon as={FiTarget} mr={2} />
                        Achievements
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {achievements.map((achievement) => (
                          <Card key={achievement.id} shadow="md" _hover={{ shadow: 'lg' }}>
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <HStack justify="space-between" width="full">
                                  <Heading size="sm">
                                    {achievement.title}
                                  </Heading>
                                  <Badge colorScheme={achievement.earned_at ? "green" : "gray"} variant="subtle">
                                    {achievement.earned_at ? "Completed" : "In Progress"}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {achievement.description}
                                </Text>
                                <Box width="full">
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontSize="xs" color="gray.500">
                                      Progress: {achievement.value}/{achievement.target_value}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {achievement.token_reward} tokens
                                    </Text>
                                  </HStack>
                                  <Progress
                                    value={(achievement.value / achievement.target_value) * 100}
                                    colorScheme="blue"
                                    size="sm"
                                  />
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Resources Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Featured Resources */}
                    <Box>
                      <Heading size="md" mb={4} color="brand.primary">
                        <Icon as={FiStar} mr={2} />
                        Featured Resources
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {resources.filter(r => r.is_featured).map((resource) => (
                          <Card key={resource.id} shadow="md" _hover={{ shadow: 'lg' }} cursor="pointer" onClick={() => handleResourceClick(resource)}>
                            {resource.featured_image_url && (
                              <Image
                                src={resource.featured_image_url}
                                alt={resource.title}
                                height="150px"
                                objectFit="cover"
                                borderTopRadius="md"
                              />
                            )}
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <Heading size="sm" noOfLines={2}>
                                  {resource.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {resource.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {resource.category}
                                  </Badge>
                                  <Badge colorScheme={getDifficultyColor(resource.difficulty_level)} variant="subtle">
                                    {resource.difficulty_level}
                                  </Badge>
                                  <Badge colorScheme="purple" variant="subtle">
                                    {resource.resource_type}
                                  </Badge>
                                </HStack>
                                <HStack justify="space-between" width="full">
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={FiClock} mr={1} />
                                    {resource.estimated_read_time} min
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={FiEye} mr={1} />
                                    {resource.view_count} views
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* All Resources */}
                    <Box>
                      <Heading size="md" mb={4} color="brand.primary">
                        <Icon as={FiFileText} mr={2} />
                        All Resources
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {resources.map((resource) => (
                          <Card key={resource.id} shadow="md" _hover={{ shadow: 'lg' }} cursor="pointer" onClick={() => handleResourceClick(resource)}>
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <HStack>
                                  <Icon as={getResourceIcon(resource.resource_type)} boxSize={5} color="brand.primary" />
                                  <Heading size="sm" noOfLines={2}>
                                    {resource.title}
                                  </Heading>
                                </HStack>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {resource.description}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {resource.category}
                                  </Badge>
                                  <Badge colorScheme={getDifficultyColor(resource.difficulty_level)} variant="subtle">
                                    {resource.difficulty_level}
                                  </Badge>
                                </HStack>
                                <HStack justify="space-between" width="full">
                                  <Text fontSize="sm" color="gray.500">
                                    <Icon as={FiClock} mr={1} />
                                    {resource.estimated_read_time} min
                                  </Text>
                                  <Badge colorScheme={resource.is_completed ? "green" : "gray"} variant="subtle">
                                    {resource.is_completed ? "Completed" : "Not Started"}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </SectionCard>
        }
        rightColumn={
          <>
            <SideCard title="Learning Stats">
              {userStats && (
                <StatGroup>
                  <Stat>
                    <StatLabel fontSize="xs">Badges Earned</StatLabel>
                    <StatNumber fontSize="lg">{userStats.total_badges}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="xs">Achievements</StatLabel>
                    <StatNumber fontSize="lg">{userStats.total_achievements}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="xs">Tokens Earned</StatLabel>
                    <StatNumber fontSize="lg">{userStats.tokens_earned}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="xs">Resources Completed</StatLabel>
                    <StatNumber fontSize="lg">{userStats.resources_completed}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="xs">Learning Streak</StatLabel>
                    <StatNumber fontSize="lg">{userStats.learning_streak} days</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="xs">Time Spent</StatLabel>
                    <StatNumber fontSize="lg">{Math.round(userStats.total_time_spent / 60)}h</StatNumber>
                  </Stat>
                </StatGroup>
              )}
            </SideCard>

            <SideCard title="Quick Actions">
              <VStack spacing={4}>
                <Button
                  leftIcon={<FiBookOpen />}
                  bg="brand.primary"
                  color="brand.accent"
                  fontWeight="bold"
                  _hover={{ bg: "brand.600" }}
                  _active={{ bg: "brand.700" }}
                  size="lg"
                  width="full"
                  onClick={() => setActiveTab(0)}
                >
                  Browse Courses
                </Button>
                <Button
                  leftIcon={<FiAward />}
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => setActiveTab(1)}
                >
                  View Achievements
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => setActiveTab(2)}
                >
                  Explore Resources
                </Button>
              </VStack>
            </SideCard>
          </>
        }
        showLeftColumn={!!mentorAgent}
      />

      {/* Resource Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedResource?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedResource && (
              <VStack spacing={4} align="stretch">
                {selectedResource.featured_image_url && (
                  <Image
                    src={selectedResource.featured_image_url}
                    alt={selectedResource.title}
                    borderRadius="md"
                  />
                )}
                <Text fontSize="md" color="gray.600">
                  {selectedResource.description}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" variant="subtle">
                    {selectedResource.category}
                  </Badge>
                  <Badge colorScheme={getDifficultyColor(selectedResource.difficulty_level)} variant="subtle">
                    {selectedResource.difficulty_level}
                  </Badge>
                  <Badge colorScheme="purple" variant="subtle">
                    {selectedResource.resource_type}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.500">
                    <Icon as={FiClock} mr={1} />
                    {selectedResource.estimated_read_time} min read
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    <Icon as={FiEye} mr={1} />
                    {selectedResource.view_count} views
                  </Text>
                </HStack>
                {selectedResource.tags.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Tags:</Text>
                    <HStack spacing={2}>
                      {selectedResource.tags.map((tag, index) => (
                        <Badge key={index} colorScheme="gray" variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            {selectedResource && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  if (selectedResource.external_url) {
                    window.open(selectedResource.external_url, '_blank');
                  }
                  if (!selectedResource.is_completed) {
                    handleResourceComplete(selectedResource.id);
                  }
                  onClose();
                }}
              >
                {selectedResource.external_url ? 'Open Resource' : 'Mark as Complete'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
} 