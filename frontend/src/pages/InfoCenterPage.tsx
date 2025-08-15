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
} from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import { Layout } from '../components/Layout';
import { AITutorialAgent } from '../components/AITutorialAgent';
import api from '../services/api';

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
  content: string;
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

export default function InfoCenterPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [resources, setResources] = useState<MarketingResource[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<MarketingResource | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchInfoCenterData();
  }, []);

  const fetchInfoCenterData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [badgesRes, achievementsRes, resourcesRes, statsRes] = await Promise.all([
        api.get('/learning/badges/'),
        api.get('/learning/achievements/'),
        api.get('/learning/marketing-resources/'),
        api.get('/learning/user-stats/'),
      ]);

      setBadges(badgesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setResources(resourcesRes.data || []);
      setUserStats(statsRes.data || {
        total_badges: 0,
        total_achievements: 0,
        tokens_earned: 0,
        resources_completed: 0,
        learning_streak: 0,
        total_time_spent: 0,
      });
    } catch (err) {
      console.error('Failed to fetch info center data:', err);
      setError('Failed to load info center data');
      // Load fallback data
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setBadges([
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first tutorial',
        badge_type: 'tutorial_completion',
        difficulty: 'bronze',
        token_reward: 50,
        is_earned: true,
        earned_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Marketing Pro',
        description: 'Complete 10 marketing resources',
        badge_type: 'marketing_expertise',
        difficulty: 'silver',
        token_reward: 100,
        is_earned: false,
      },
      {
        id: '3',
        name: 'AI Master',
        description: 'Interact with AI agents 50 times',
        badge_type: 'ai_mastery',
        difficulty: 'gold',
        token_reward: 200,
        is_earned: false,
      },
    ]);

    setAchievements([
      {
        id: '1',
        title: 'Learning Streak',
        description: 'Maintain a 7-day learning streak',
        achievement_type: 'streak_maintained',
        value: 3,
        target_value: 7,
        token_reward: 75,
      },
      {
        id: '2',
        title: 'Resource Explorer',
        description: 'Complete 5 marketing resources',
        achievement_type: 'resources_completed',
        value: 2,
        target_value: 5,
        token_reward: 100,
      },
    ]);

    setResources([
      {
        id: '1',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the basics of digital marketing and how to create effective campaigns',
        content: 'Digital marketing encompasses all marketing efforts that use electronic devices or the internet...',
        resource_type: 'article',
        category: 'digital_marketing',
        difficulty_level: 'bronze',
        estimated_read_time: 10,
        tags: ['basics', 'digital marketing', 'beginners'],
        is_featured: true,
        view_count: 1250,
        is_completed: true,
        progress_percentage: 100,
      },
      {
        id: '2',
        title: 'Social Media Strategy Guide',
        description: 'Develop a comprehensive social media strategy for your business',
        content: 'Social media has become an essential part of modern marketing...',
        resource_type: 'video',
        category: 'social_media',
        difficulty_level: 'silver',
        estimated_read_time: 15,
        tags: ['social media', 'strategy', 'intermediate'],
        is_featured: false,
        view_count: 890,
        is_completed: false,
        progress_percentage: 30,
      },
    ]);

    setUserStats({
      total_badges: 1,
      total_achievements: 0,
      tokens_earned: 50,
      resources_completed: 1,
      learning_streak: 3,
      total_time_spent: 45,
    });
  };

  const handleResourceClick = (resource: MarketingResource) => {
    setSelectedResource(resource);
    onOpen();
  };

  const handleResourceComplete = async (resourceId: string) => {
    try {
      await api.post(`/learning/marketing-resources/${resourceId}/complete/`);
      
      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, is_completed: true, progress_percentage: 100 }
          : r
      ));

      setUserStats(prev => prev ? {
        ...prev,
        resources_completed: prev.resources_completed + 1,
        tokens_earned: prev.tokens_earned + 25,
      } : null);

      toast({
        title: 'Resource Completed! 🎉',
        description: 'You\'ve earned 25 tokens for completing this resource',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to mark resource as complete:', error);
    }
  };

  const getResourceIcon = (resourceType: string) => {
    const icons = {
      article: FiFileText,
      video: FiVideo,
      infographic: FiImage,
      template: FiFileText,
      case_study: FiBookOpen,
      webinar: FiVideo,
      ebook: FiBook,
      checklist: FiCheck,
    };
    return icons[resourceType as keyof typeof icons] || FiFileText;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      bronze: 'orange',
      silver: 'gray',
      gold: 'yellow',
      platinum: 'blue',
      diamond: 'purple',
    };
    return colors[difficulty as keyof typeof colors] || 'gray';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      digital_marketing: FiGlobe,
      social_media: FiUsers,
      email_marketing: FiMail,
      content_marketing: FiFileText,
      seo: FiTrendingUp,
      analytics: FiBarChart,
      automation: FiZap,
      branding: FiTarget,
      lead_generation: FiUsers,
      conversion_optimization: FiTarget,
    };
    return icons[category as keyof typeof icons] || FiBook;
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
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>
          <HStack>
            <FiBook />
            <Text>Info Center</Text>
          </HStack>
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* AI Tutorial Agent */}
        <Box mb={8}>
          <AITutorialAgent
            currentPage="info-center"
            onTutorialComplete={(tutorialId) => {
              toast({
                title: 'Tutorial Completed!',
                description: 'Great job learning about the Info Center!',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }}
            onTokenEarned={(amount) => {
              setUserStats(prev => prev ? {
                ...prev,
                tokens_earned: prev.tokens_earned + amount,
              } : null);
            }}
          />
        </Box>

        {/* User Stats */}
        {userStats && (
          <Card mb={8}>
            <CardBody>
              <StatGroup>
                <Stat>
                  <StatLabel>Badges Earned</StatLabel>
                  <StatNumber color="brand.primary">{userStats.total_badges}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Achievements</StatLabel>
                  <StatNumber color="green.500">{userStats.total_achievements}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Tokens Earned</StatLabel>
                  <StatNumber color="brand.accent">{userStats.tokens_earned}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Learning Streak</StatLabel>
                  <StatNumber color="orange.500">{userStats.learning_streak} days</StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>
              <HStack>
                <FiBook />
                <Text>Marketing Resources</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiAward />
                <Text>Badges & Achievements</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <GiTrophy />
                <Text>Progress</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Marketing Resources Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" color="brand.primary" mb={4}>
                    Featured Resources
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {resources.filter(r => r.is_featured).map((resource) => (
                      <Card key={resource.id} cursor="pointer" _hover={{ shadow: 'lg' }} onClick={() => handleResourceClick(resource)}>
                        <CardHeader>
                          <HStack>
                            <Icon as={getResourceIcon(resource.resource_type)} color="brand.primary" />
                            <Box>
                              <Heading size="sm" color="brand.primary">{resource.title}</Heading>
                              <Badge colorScheme={getDifficultyColor(resource.difficulty_level)} size="sm">
                                {resource.difficulty_level}
                              </Badge>
                            </Box>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {resource.description}
                            </Text>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiClock} size="sm" />
                                <Text fontSize="xs">{resource.estimated_read_time} min</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Icon as={FiEye} size="sm" />
                                <Text fontSize="xs">{resource.view_count}</Text>
                              </HStack>
                            </HStack>
                            {resource.is_completed && (
                              <Badge colorScheme="green" size="sm" alignSelf="start">
                                Completed
                              </Badge>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Heading size="md" color="brand.primary" mb={4}>
                    All Resources
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {resources.map((resource) => (
                      <Card key={resource.id} cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => handleResourceClick(resource)}>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={getResourceIcon(resource.resource_type)} color="brand.primary" />
                                <Text fontWeight="bold">{resource.title}</Text>
                              </HStack>
                              <Badge colorScheme={getDifficultyColor(resource.difficulty_level)} size="sm">
                                {resource.difficulty_level}
                              </Badge>
                            </HStack>
                            
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {resource.description}
                            </Text>
                            
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiClock} size="sm" />
                                <Text fontSize="xs">{resource.estimated_read_time} min</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Icon as={FiGift} size="sm" />
                                <Text fontSize="xs">25 tokens</Text>
                              </HStack>
                            </HStack>
                            
                            {!resource.is_completed && resource.progress_percentage > 0 && (
                              <Box>
                                <HStack justify="space-between" mb={1}>
                                  <Text fontSize="xs">Progress</Text>
                                  <Text fontSize="xs">{resource.progress_percentage}%</Text>
                                </HStack>
                                <Progress value={resource.progress_percentage} size="sm" colorScheme="brand" />
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabPanel>

            {/* Badges & Achievements Tab */}
            <TabPanel>
              <VStack spacing={8} align="stretch">
                {/* Badges Section */}
                <Box>
                  <Heading size="md" color="brand.primary" mb={4}>
                    Badges
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {badges.map((badge) => (
                      <Card key={badge.id} bg={badge.is_earned ? 'green.50' : bgColor}>
                        <CardBody>
                          <VStack spacing={3} align="center" textAlign="center">
                            <Box
                              p={3}
                              bg={badge.is_earned ? 'green.500' : 'gray.200'}
                              color={badge.is_earned ? 'white' : 'gray.600'}
                              borderRadius="full"
                            >
                              <Icon as={FiAward} boxSize={6} />
                            </Box>
                            
                            <VStack spacing={1}>
                              <Text fontWeight="bold" color="brand.primary">
                                {badge.name}
                              </Text>
                              <Badge colorScheme={getDifficultyColor(badge.difficulty)} size="sm">
                                {badge.difficulty}
                              </Badge>
                            </VStack>
                            
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {badge.description}
                            </Text>
                            
                            <HStack spacing={2}>
                              <Icon as={FiGift} size="sm" />
                              <Text fontSize="sm" fontWeight="medium">
                                {badge.token_reward} tokens
                              </Text>
                            </HStack>
                            
                            {badge.is_earned && (
                              <Badge colorScheme="green" size="sm">
                                Earned
                              </Badge>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Achievements Section */}
                <Box>
                  <Heading size="md" color="brand.primary" mb={4}>
                    Achievements
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {achievements.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontWeight="bold" color="brand.primary">
                                {achievement.title}
                              </Text>
                              <Badge colorScheme={achievement.value >= achievement.target_value ? 'green' : 'blue'} size="sm">
                                {achievement.value}/{achievement.target_value}
                              </Badge>
                            </HStack>
                            
                            <Text fontSize="sm" color="gray.600">
                              {achievement.description}
                            </Text>
                            
                            <Box>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs">Progress</Text>
                                <Text fontSize="xs">{Math.min(100, (achievement.value / achievement.target_value) * 100)}%</Text>
                              </HStack>
                              <Progress 
                                value={Math.min(100, (achievement.value / achievement.target_value) * 100)} 
                                size="sm" 
                                colorScheme={achievement.value >= achievement.target_value ? 'green' : 'brand'} 
                              />
                            </Box>
                            
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiGift} size="sm" />
                                <Text fontSize="sm">{achievement.token_reward} tokens</Text>
                              </HStack>
                              {achievement.value >= achievement.target_value && (
                                <Badge colorScheme="green" size="sm">
                                  Completed
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabPanel>

            {/* Progress Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md" color="brand.primary">Learning Progress</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Resources Completed</Text>
                          <Text>{userStats?.resources_completed || 0} / {resources.length}</Text>
                        </HStack>
                        <Progress 
                          value={userStats ? (userStats.resources_completed / resources.length) * 100 : 0} 
                          colorScheme="brand" 
                          size="lg" 
                        />
                      </Box>
                      
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Badges Earned</Text>
                          <Text>{userStats?.total_badges || 0} / {badges.length}</Text>
                        </HStack>
                        <Progress 
                          value={userStats ? (userStats.total_badges / badges.length) * 100 : 0} 
                          colorScheme="green" 
                          size="lg" 
                        />
                      </Box>
                      
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Achievements</Text>
                          <Text>{userStats?.total_achievements || 0} / {achievements.length}</Text>
                        </HStack>
                        <Progress 
                          value={userStats ? (userStats.total_achievements / achievements.length) * 100 : 0} 
                          colorScheme="orange" 
                          size="lg" 
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md" color="brand.primary">Recent Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <List spacing={3}>
                      <ListItem>
                        <HStack>
                          <ListIcon as={FiCheck} color="green.500" />
                          <Text>Completed "Digital Marketing Fundamentals"</Text>
                          <Badge colorScheme="green" size="sm">+25 tokens</Badge>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <ListIcon as={FiAward} color="brand.accent" />
                          <Text>Earned "First Steps" badge</Text>
                          <Badge colorScheme="green" size="sm">+50 tokens</Badge>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack>
                          <ListIcon as={FiBook} color="brand.primary" />
                          <Text>Started "Social Media Strategy Guide"</Text>
                        </HStack>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Resource Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent maxW="4xl">
            <ModalHeader>
              <HStack>
                <Icon as={selectedResource ? getResourceIcon(selectedResource.resource_type) : FiBook} />
                <Text>{selectedResource?.title}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedResource && (
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Badge colorScheme={getDifficultyColor(selectedResource.difficulty_level)}>
                      {selectedResource.difficulty_level}
                    </Badge>
                    <HStack spacing={4}>
                      <HStack spacing={1}>
                        <Icon as={FiClock} size="sm" />
                        <Text fontSize="sm">{selectedResource.estimated_read_time} min read</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiEye} size="sm" />
                        <Text fontSize="sm">{selectedResource.view_count} views</Text>
                      </HStack>
                    </HStack>
                  </HStack>
                  
                  <Text fontSize="lg" color="gray.700" lineHeight="1.6">
                    {selectedResource.description}
                  </Text>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Content:</Text>
                    <Text color="gray.600" lineHeight="1.6">
                      {selectedResource.content}
                    </Text>
                  </Box>
                  
                  {selectedResource.tags.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Tags:</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {selectedResource.tags.map((tag, index) => (
                          <Badge key={index} colorScheme="brand.primary" variant="subtle">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}
                  
                  {selectedResource.external_url && (
                    <Button
                      leftIcon={<FiPlay />}
                      colorScheme="brand"
                      onClick={() => window.open(selectedResource.external_url, '_blank')}
                    >
                      View Full Resource
                    </Button>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              {selectedResource && !selectedResource.is_completed && (
                <Button
                  colorScheme="green"
                  onClick={() => {
                    handleResourceComplete(selectedResource.id);
                    onClose();
                  }}
                >
                  Mark as Complete
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
} 