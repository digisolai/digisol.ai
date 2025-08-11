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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
} from "@chakra-ui/react";
import {FiBook, FiPlay, FiCheck, FiClock} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import ContextualAIChat from "../components/ContextualAIChat";
import api from "../services/api";
import type { AIProfile } from "../types/ai";

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

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorAgent, setMentorAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // State for Mentor Chat Modal
  const { isOpen: isMentorChatOpen, onOpen: onMentorChatOpen, onClose: onMentorChatClose } = useDisclosure();
  const [askMentorQuestion, setAskMentorQuestion] = useState("");
  
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

  const handleAskMentor = (question: string) => {
    setAskMentorQuestion(question);
    onMentorChatOpen();
  };

  async function fetchLearningData() {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, tutorialsRes] = await Promise.all([
        api.get("/learning/courses/"),
        api.get("/learning/tutorials/"),
      ]);
      setCourses(coursesRes.data || []);
      setTutorials(tutorialsRes.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load learning data.";
      setError(errorMessage);
      // Placeholder data if API fails
      setCourses([
        {
          id: "1",
          title: "Digital Marketing Fundamentals",
          description: "Learn the basics of digital marketing including SEO, social media, and email marketing.",
          category: "Marketing",
          duration: 120,
          difficulty: "Beginner",
          progress: 75,
          is_completed: false,
          instructor: "Sarah Johnson",
          thumbnail_url: "/placeholder-course.jpg"
        },
        {
          id: "2",
          title: "Advanced Analytics",
          description: "Master data analysis and reporting techniques for better decision making.",
          category: "Analytics",
          duration: 180,
          difficulty: "Advanced",
          progress: 30,
          is_completed: false,
          instructor: "Mike Chen",
          thumbnail_url: "/placeholder-course.jpg"
        }
      ]);
      setTutorials([
        {
          id: "1",
          title: "Setting Up Your First Campaign",
          description: "Step-by-step guide to creating your first marketing campaign.",
          category: "Campaigns",
          duration: 15,
          is_completed: true,
          video_url: "/placeholder-video.mp4"
        },
        {
          id: "2",
          title: "Understanding Analytics Dashboard",
          description: "Learn how to read and interpret your analytics dashboard.",
          category: "Analytics",
          duration: 20,
          is_completed: false,
          video_url: "/placeholder-video.mp4"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

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
            <Text>Learning Center</Text>
          </HStack>
        </Heading>

        {/* Mentor AI Agent Section */}
        <AIAgentSection
          agent={mentorAgent}
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskMentor}
        />

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <VStack spacing={6} align="stretch">
          {/* Learning Stats */}
          <Card>
            <CardBody>
              <StatGroup>
                <Stat>
                  <StatLabel>Courses in Progress</StatLabel>
                  <StatNumber color="brand.primary">
                    {courses.filter(c => !c.is_completed && c.progress > 0).length}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Completed Courses</StatLabel>
                  <StatNumber color="green.500">
                    {courses.filter(c => c.is_completed).length}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Total Learning Hours</StatLabel>
                  <StatNumber color="brand.accent">
                    {courses.reduce((total, c) => total + (c.progress / 100) * c.duration, 0).toFixed(1)}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>

          {/* Courses Section */}
          <Box>
            <Heading size="md" color="brand.primary" mb={4}>Your Courses</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {courses.map((course) => (
                <Card key={course.id} boxShadow="md">
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" color="brand.primary">{course.title}</Heading>
                      <Badge colorScheme={course.is_completed ? "green" : "blue"} variant="subtle">
                        {course.difficulty}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color="brand.neutral.600">
                        {course.description}
                      </Text>
                      <Text fontSize="xs" color="brand.neutral.500">
                        Instructor: {course.instructor}
                      </Text>
                      <Box>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs">Progress</Text>
                          <Text fontSize="xs">{course.progress}%</Text>
                        </Flex>
                        <Progress value={course.progress} colorScheme="brand" size="sm" />
                      </Box>
                      <HStack spacing={2} justify="flex-end">
                        <Button size="sm" variant="outline" leftIcon={<FiClock />}>
                          {course.duration} min
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          leftIcon={course.is_completed ? <FiCheck /> : <FiPlay />}
                        >
                          {course.is_completed ? "Completed" : "Continue"}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Tutorials Section */}
          <Box>
            <Heading size="md" color="brand.primary" mb={4}>Quick Tutorials</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} variant="outline">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="full">
                        <Heading size="sm" color="brand.primary">{tutorial.title}</Heading>
                        <Badge colorScheme={tutorial.is_completed ? "green" : "gray"} size="sm">
                          {tutorial.is_completed ? "Completed" : "Pending"}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="brand.neutral.600">
                        {tutorial.description}
                      </Text>
                      <HStack spacing={2} justify="flex-end" w="full">
                        <Button size="sm" variant="outline" leftIcon={<FiClock />}>
                          {tutorial.duration} min
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          leftIcon={tutorial.is_completed ? <FiCheck /> : <FiPlay />}
                        >
                          {tutorial.is_completed ? "Review" : "Start"}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>

        {/* Mentor Chat Modal */}
        <Modal isOpen={isMentorChatOpen} onClose={onMentorChatClose} size="6xl" maxW="90vw">
          <ModalOverlay />
          <ModalContent maxH="70vh">
            <ModalHeader>
              <HStack>
                <Icon as={FiBook} color="teal.500" />
                <Text>Chat with Mentor - Learning Guidance Specialist</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <ContextualAIChat
                agentId="mentor"
                agentName="Mentor"
                agentSpecialization="learning_guidance"
                pageContext="learning"
                pageData={{ 
                  courses,
                  tutorials,
                  mentorAgent,
                  askMentorQuestion 
                }}
                onClose={onMentorChatClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
} 