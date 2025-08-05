import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Image,
} from "@chakra-ui/react";
import {FiCheck, FiArrowRight} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import api from "../services/api";

interface TutorialStep {
  id: string;
  title: string;
  content_type: 'text' | 'video' | 'image' | 'interactive';
  content: string;
  order: number;
  page_path: string | null;
  created_at: string;
}

interface TutorialSection {
  id: string;
  title: string;
  description: string;
  order: number;
  steps: TutorialStep[];
  step_count: number;
  created_at: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  sections: TutorialSection[];
  section_count: number;
  step_count: number;
  is_global: boolean;
  created_at: string;
}

interface UserTutorialProgress {
  id: string;
  tutorial: string;
  tutorial_title: string;
  is_completed: boolean;
  progress_percentage: number;
  next_step_id: string | null;
  next_step_title: string | null;
  last_completed_step: string | null;
  started_at: string;
  completed_at: string | null;
}

export default function TutorialDetailPage() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [userProgress, setUserProgress] = useState<UserTutorialProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchTutorial = useCallback(async () => {
    if (!tutorialId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/learning/tutorials/${tutorialId}/`);
      setTutorial(res.data);
    } catch (err: unknown) {
      console.error("API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load tutorial.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tutorialId]);

  const fetchUserProgress = useCallback(async () => {
    if (!tutorialId) return;
    
    try {
      const res = await api.get(`/learning/tutorials/${tutorialId}/progress/`);
      setUserProgress(res.data);
    } catch (err: unknown) {
      console.error("API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load progress.";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [tutorialId, toast]);

  useEffect(() => {
    if (tutorialId) {
      fetchTutorial();
      fetchUserProgress();
    }
  }, [tutorialId, fetchTutorial, fetchUserProgress]);

  async function handleMarkStepComplete(stepId: string) {
    setCompletingStep(stepId);
    try {
      await api.post(`/learning/steps/${stepId}/mark_completed/`);
      
      // Refresh progress
      await fetchUserProgress();
      
      toast({
        title: "Step completed!",
        description: "Great job! You've completed this step.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      console.error("API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to mark step as complete.";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCompletingStep(null);
    }
  }

  function handleStartWalkthrough(pagePath: string) {
    if (pagePath) {
      window.location.href = pagePath;
    }
  }

  function renderStepContent(step: TutorialStep) {
    switch (step.content_type) {
      case 'video':
        return (
          <Box>
            <Text mb={3} color="brand.neutral.700">
              {step.content}
            </Text>
            <Box
              as="iframe"
              src={step.content}
              width="100%"
              height="315"
              borderRadius="md"
              allowFullScreen
            />
          </Box>
        );
      
      case 'image':
        return (
          <Box>
            <Text mb={3} color="brand.neutral.700">
              {step.content}
            </Text>
            <Image
              src={step.content}
              alt={step.title}
              borderRadius="md"
              maxH="400px"
              objectFit="contain"
            />
          </Box>
        );
      
      case 'interactive':
        return (
          <Box>
            <Text mb={3} color="brand.neutral.700">
              {step.content}
            </Text>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              This is an interactive step. Follow the instructions above to complete it.
            </Alert>
          </Box>
        );
      
      default: // text
        return (
          <Text color="brand.neutral.700" lineHeight="1.6" whiteSpace="pre-wrap">
            {step.content}
          </Text>
        );
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box textAlign="center" py={20}>
          <Spinner size="xl" color="brand.primary" />
          <Text mt={4} color="brand.neutral.600">Loading tutorial...</Text>
        </Box>
      </Layout>
    );
  }

  if (error || !tutorial) {
    return (
      <Layout>
        <Box py={4} px={{ base: 0, md: 4 }}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error || "Tutorial not found"}
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Button
              variant="ghost"
              leftIcon={<Icon as={FiArrowRight} />}
              onClick={() => navigate('/learning')}
              mb={4}
            >
              Back to Learning Center
            </Button>
            
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack spacing={3} mb={2}>
                  <Heading size="xl" color="brand.primary">
                    {tutorial.title}
                  </Heading>
                  {tutorial.is_global && (
                    <Badge colorScheme="blue" variant="subtle">
                      Global
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="lg" color="brand.neutral.600" lineHeight="1.6">
                  {tutorial.description}
                </Text>
              </Box>

              {/* Progress Overview */}
              {userProgress && (
                <Card bg="brand.neutral.50" border="1px solid" borderColor="brand.neutral.200">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="semibold" color="brand.primary">
                          Your Progress
                        </Text>
                        <Badge
                          colorScheme={userProgress.is_completed ? "green" : "orange"}
                          variant="subtle"
                        >
                          {userProgress.is_completed ? "Completed" : "In Progress"}
                        </Badge>
                      </Flex>
                      
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" color="brand.neutral.600">
                            {userProgress.progress_percentage}% Complete
                          </Text>
                          <Text fontSize="sm" color="brand.neutral.600">
                            {tutorial.step_count} total steps
                          </Text>
                        </HStack>
                        <Progress
                          value={userProgress.progress_percentage}
                          colorScheme="brand"
                          size="lg"
                          borderRadius="full"
                        />
                      </Box>

                      {userProgress.next_step_title && !userProgress.is_completed && (
                        <Text fontSize="sm" color="brand.neutral.600">
                          Next step: <Text as="span" fontWeight="semibold">{userProgress.next_step_title}</Text>
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </Box>

          {/* Tutorial Content */}
          <Box>
            <Heading size="lg" color="brand.primary" mb={6}>
              Tutorial Content ({tutorial.section_count} sections, {tutorial.step_count} steps)
            </Heading>

            <Accordion allowMultiple defaultIndex={[0]}>
              {tutorial.sections.map((section, sectionIndex) => (
                <AccordionItem key={section.id} border="1px solid" borderColor="brand.neutral.200" mb={4}>
                  <AccordionButton
                    py={4}
                    _expanded={{ bg: "brand.neutral.50" }}
                    _hover={{ bg: "brand.neutral.50" }}
                  >
                    <Box flex="1" textAlign="left">
                      <HStack spacing={3}>
                        <Badge colorScheme="brand" variant="subtle">
                          Section {sectionIndex + 1}
                        </Badge>
                        <Heading size="md" color="brand.primary">
                          {section.title}
                        </Heading>
                      </HStack>
                      {section.description && (
                        <Text fontSize="sm" color="brand.neutral.600" mt={1}>
                          {section.description}
                        </Text>
                      )}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  
                  <AccordionPanel pb={4}>
                    <VStack spacing={6} align="stretch">
                      {section.steps.map((step, stepIndex) => (
                        <Card key={step.id} border="1px solid" borderColor="brand.neutral.200">
                          <CardHeader bg="brand.neutral.50" borderBottom="1px solid" borderColor="brand.neutral.100">
                            <Flex justify="space-between" align="start">
                              <Box flex={1}>
                                <HStack spacing={3} mb={2}>
                                  <Badge colorScheme="gray" variant="subtle">
                                    Step {stepIndex + 1}
                                  </Badge>
                                  <Badge
                                    colorScheme={step.content_type === 'video' ? 'red' : 
                                               step.content_type === 'image' ? 'green' : 
                                               step.content_type === 'interactive' ? 'purple' : 'blue'}
                                    variant="subtle"
                                  >
                                    {step.content_type.charAt(0).toUpperCase() + step.content_type.slice(1)}
                                  </Badge>
                                </HStack>
                                <Heading size="sm" color="brand.primary">
                                  {step.title}
                                </Heading>
                              </Box>
                            </Flex>
                          </CardHeader>
                          
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              {renderStepContent(step)}
                              
                              <HStack spacing={3} justify="flex-end">
                                {step.page_path && (
                                  <Button
                                    size="sm"
                                    colorScheme="brand"
                                    variant="outline"
                                    leftIcon={<Icon as={FiExternalLink} />}
                                    onClick={() => handleStartWalkthrough(step.page_path!)}
                                  >
                                    Start Walkthrough
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  colorScheme="brand"
                                  leftIcon={<Icon as={FiCheck} />}
                                  isLoading={completingStep === step.id}
                                  loadingText="Marking..."
                                  onClick={() => handleMarkStepComplete(step.id)}
                                >
                                  Mark as Complete
                                </Button>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          {/* Completion Message */}
          {userProgress?.is_completed && (
            <Card bg="green.50" border="1px solid" borderColor="green.200">
              <CardBody>
                <VStack spacing={3} align="center">
                  <Icon as={FiCheck} boxSize={8} color="green.500" />
                  <Heading size="md" color="green.700">
                    Congratulations!
                  </Heading>
                  <Text color="green.600" textAlign="center">
                    You've completed "{tutorial.title}". Great job!
                  </Text>
                  <Button
                    colorScheme="brand"
                    onClick={() => navigate('/learning')}
                  >
                    Back to Learning Center
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Layout>
  );
} 