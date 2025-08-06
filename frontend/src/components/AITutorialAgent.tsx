import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Progress,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiMessageCircle, 
  FiCpu, 
  FiPlay, 
  FiCheck, 
  FiBook, 
  FiTarget,
  FiAward,
  FiZap,
  FiArrowRight,
  FiClock,
  FiStar,
  FiBarChart
} from 'react-icons/fi';
import api from '../services/api';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  content_type: string;
  order: number;
  page_path?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  progress_percentage: number;
  is_completed: boolean;
}

interface AITutorialAgentProps {
  currentPage?: string;
  userContext?: any;
  onTutorialComplete?: (tutorialId: string) => void;
  onTokenEarned?: (amount: number) => void;
}

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  personality_description?: string;
  is_active: boolean;
}

export const AITutorialAgent: React.FC<AITutorialAgentProps> = ({
  currentPage,
  userContext,
  onTutorialComplete,
  onTokenEarned,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTutorials, setSuggestedTutorials] = useState<Tutorial[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchTutorialAgent();
    fetchSuggestedTutorials();
  }, [currentPage]);

  const fetchTutorialAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=learning_guidance&is_global=true');
      if (res.data && res.data.length > 0) {
        setAgent(res.data[0]);
      } else {
        // Fallback to default tutorial agent
        setAgent({
          id: "tutorial-agent",
          name: "Tutorial Guide",
          specialization: "learning_guidance",
          personality_description: "Your friendly tutorial guide! I help you master DigiSol.AI features with personalized tutorials and step-by-step guidance.",
          is_active: true
        });
      }
    } catch (err) {
      console.error("Failed to fetch tutorial agent:", err);
      setError("Failed to load tutorial assistant");
      // Fallback agent
      setAgent({
        id: "tutorial-agent",
        name: "Tutorial Guide",
        specialization: "learning_guidance",
        personality_description: "Your friendly tutorial guide! I help you master DigiSol.AI features with personalized tutorials and step-by-step guidance.",
        is_active: true
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedTutorials = async () => {
    try {
      const res = await api.get(`/learning/tutorials/?page_path=${currentPage || ''}&is_published=true`);
      setSuggestedTutorials(res.data || []);
    } catch (err) {
      console.error("Failed to fetch suggested tutorials:", err);
      // Fallback tutorials
      setSuggestedTutorials([
        {
          id: "getting-started",
          title: "Getting Started with DigiSol.AI",
          description: "Learn the basics of navigating and using DigiSol.AI effectively",
          steps: [
            {
              id: "step1",
              title: "Welcome to DigiSol.AI",
              content: "Welcome! Let's get you started with DigiSol.AI. This platform combines AI-powered marketing tools with comprehensive analytics to help you grow your business.",
              content_type: "text",
              order: 1
            },
            {
              id: "step2",
              title: "Navigating the Dashboard",
              content: "The dashboard is your command center. You'll find quick access to campaigns, analytics, AI agents, and more. Take a moment to explore the different sections.",
              content_type: "text",
              order: 2
            }
          ],
          progress_percentage: 0,
          is_completed: false
        }
      ]);
    }
  };

  const handleAskQuestion = async (questionText: string) => {
    setIsSubmitting(true);
    try {
      // Simulate AI response for now
      const response = await new Promise(resolve => 
        setTimeout(() => resolve({
          answer: `Great question! "${questionText}" - Here's what I can help you with:\n\n1. **Feature Tutorials**: I can guide you through any DigiSol.AI feature\n2. **Best Practices**: Learn effective marketing strategies\n3. **AI Agent Help**: Understand how to work with our AI assistants\n4. **Campaign Setup**: Step-by-step campaign creation guidance\n\nWould you like me to start a tutorial on any specific topic?`,
          suggested_tutorials: suggestedTutorials.slice(0, 2)
        }), 1000)
      );
      
      toast({
        title: "Tutorial Guide Response",
        description: "Check the tutorial panel for detailed guidance",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setQuestion('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from tutorial guide",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
    setShowTutorial(true);
  };

  const completeStep = async () => {
    if (!activeTutorial) return;
    
    const nextStep = currentStep + 1;
    if (nextStep >= activeTutorial.steps.length) {
      // Tutorial completed
      try {
        await api.post(`/learning/tutorials/${activeTutorial.id}/complete/`);
        
        toast({
          title: "Tutorial Completed! 🎉",
          description: `You've earned 50 tokens for completing "${activeTutorial.title}"`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        onTutorialComplete?.(activeTutorial.id);
        onTokenEarned?.(50);
        setShowTutorial(false);
        setActiveTutorial(null);
        setCurrentStep(0);
      } catch (error) {
        console.error("Failed to mark tutorial as complete:", error);
      }
    } else {
      setCurrentStep(nextStep);
    }
  };

  const getContextualSuggestions = () => {
    const suggestions = [];
    
    if (currentPage?.includes('campaign')) {
      suggestions.push({
        title: "Campaign Creation Mastery",
        description: "Learn to create effective marketing campaigns",
        icon: FiTarget,
        color: "blue"
      });
    }
    
    if (currentPage?.includes('analytics')) {
      suggestions.push({
        title: "Analytics Deep Dive",
        description: "Master your analytics dashboard",
        icon: FiBarChart,
        color: "green"
      });
    }
    
    if (currentPage?.includes('ai')) {
      suggestions.push({
        title: "AI Agent Collaboration",
        description: "Work effectively with AI assistants",
        icon: FiCpu,
        color: "purple"
      });
    }
    
    return suggestions;
  };

  if (loading) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
      >
        <HStack justify="center" spacing={3}>
          <Spinner size="sm" color="brand.accent" />
          <Text color="gray.600">Loading Tutorial Guide...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Failed to load Tutorial Guide: {error}</Text>
        </Alert>
      </Box>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <>
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <VStack align="center" spacing={4} textAlign="center">
          {/* Header */}
          <VStack spacing={3}>
            <Box
              p={3}
              bg="brand.accent"
              borderRadius="full"
            >
              <Icon as={FiBook} boxSize={5} color="brand.primary" />
            </Box>
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                {agent.name}
              </Text>
              <Badge variant="brand" colorScheme="brand">
                Tutorial Guide
              </Badge>
            </VStack>
          </VStack>

          {/* Description */}
          <Text fontSize="sm" color="gray.600" lineHeight="1.6" maxW="600px">
            {agent.personality_description}
          </Text>

          {/* Contextual Suggestions */}
          {getContextualSuggestions().length > 0 && (
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" color="brand.primary" mb={2}>
                Suggested for this page:
              </Text>
              <VStack spacing={2} align="stretch">
                {getContextualSuggestions().map((suggestion, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    leftIcon={<Icon as={suggestion.icon} />}
                    colorScheme={suggestion.color}
                    onClick={() => {
                      setQuestion(`I want to learn about ${suggestion.title.toLowerCase()}`);
                      onOpen();
                    }}
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </VStack>
            </Box>
          )}

          {/* Action Buttons */}
          <HStack spacing={3}>
            <Button
              leftIcon={<FiMessageCircle />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              onClick={onOpen}
              size="md"
            >
              Ask for Help
            </Button>
            <Button
              leftIcon={<FiPlay />}
              variant="outline"
              colorScheme="brand"
              onClick={() => setShowTutorial(true)}
              size="md"
            >
              Browse Tutorials
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Question Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ask {agent.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Ask {agent.name} about any DigiSol.AI feature or get personalized tutorial recommendations.
              </Text>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask ${agent.name} a question...`}
                rows={4}
                resize="vertical"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => handleAskQuestion(question)}
              isLoading={isSubmitting}
              loadingText="Sending..."
              isDisabled={!question.trim()}
            >
              Send Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Tutorial Browser Modal */}
      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} size="xl">
        <ModalOverlay />
        <ModalContent maxW="4xl">
          <ModalHeader>
            <HStack>
              <Icon as={FiBook} />
              <Text>Tutorial Library</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeTutorial ? (
              <VStack spacing={6} align="stretch">
                {/* Tutorial Progress */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{activeTutorial.title}</Text>
                    <Badge colorScheme="green">{activeTutorial.progress_percentage}% Complete</Badge>
                  </HStack>
                  <Progress value={activeTutorial.progress_percentage} colorScheme="green" size="sm" />
                </Box>

                {/* Current Step */}
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">
                          Step {currentStep + 1}: {activeTutorial.steps[currentStep]?.title}
                        </Text>
                        <Badge colorScheme="blue">
                          {currentStep + 1} of {activeTutorial.steps.length}
                        </Badge>
                      </HStack>
                      
                      <Text color="gray.700" lineHeight="1.6">
                        {activeTutorial.steps[currentStep]?.content}
                      </Text>
                      
                      <HStack justify="space-between">
                        <Button
                          variant="outline"
                          onClick={() => setShowTutorial(false)}
                        >
                          Back to Library
                        </Button>
                        <Button
                          colorScheme="green"
                          rightIcon={currentStep + 1 >= activeTutorial.steps.length ? <FiCheck /> : <FiArrowRight />}
                          onClick={completeStep}
                        >
                          {currentStep + 1 >= activeTutorial.steps.length ? 'Complete Tutorial' : 'Next Step'}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="brand.primary">
                  Available Tutorials
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {suggestedTutorials.map((tutorial) => (
                    <Card key={tutorial.id} cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => startTutorial(tutorial)}>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="bold">{tutorial.title}</Text>
                            <Badge colorScheme={tutorial.is_completed ? "green" : "blue"}>
                              {tutorial.is_completed ? "Completed" : "Available"}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize="sm" color="gray.600">
                            {tutorial.description}
                          </Text>
                          
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Icon as={FiClock} size="sm" />
                              <Text fontSize="xs">{tutorial.steps.length} steps</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Icon as={FiAward} size="sm" />
                              <Text fontSize="xs">50 tokens</Text>
                            </HStack>
                          </HStack>
                          
                          <Button size="sm" colorScheme="brand" rightIcon={<FiPlay />}>
                            Start Tutorial
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 