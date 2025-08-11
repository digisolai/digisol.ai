import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Progress,
  useToast,
  useColorModeValue,
  Spinner,
  Icon,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  ModalFooter,
} from '@chakra-ui/react';
import {
  FiPlay,
  FiZap,
  FiMessageSquare,
} from 'react-icons/fi';
import ContextualAIChat from './ContextualAIChat';

interface CatalystInsight {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  predicted_impact: unknown;
  confidence_score?: number;
  insight_type: string;
  is_actioned: boolean;
  is_dismissed: boolean;
  created_at: string;
}

interface CatalystRecommendation {
  recommendation_type: string;
  title: string;
  description: string;
  impact_score: number;
  confidence_score: number;
  action_items: string[];
  estimated_improvement: Record<string, any>;
  priority: string;
}

interface CatalystAIProps {
  campaignId?: string;
  insights?: CatalystInsight[];
  recommendations?: CatalystRecommendation[];
  healthScore?: number;
  onApplyRecommendation?: (recommendation: CatalystRecommendation) => void;
  onDismissInsight?: (insightId: string) => void;
  onActionInsight?: (insightId: string, action: string) => void;
}

export default function CatalystAI({
  insights = [],
  recommendations = [],
  healthScore,
  onApplyRecommendation,
  onDismissInsight,
  onActionInsight,
}: CatalystAIProps) {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const [selectedInsight, setSelectedInsight] = useState<CatalystInsight | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CatalystRecommendation | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { isOpen: isInsightModalOpen, onOpen: onInsightModalOpen, onClose: onInsightModalClose } = useDisclosure();
  const { isOpen: isRecommendationModalOpen, onOpen: onRecommendationModalOpen, onClose: onRecommendationModalClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const handleApplyRecommendation = async (recommendation: CatalystRecommendation) => {
    setIsOptimizing(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onApplyRecommendation) {
        onApplyRecommendation(recommendation);
      }
      
      toast({
        title: 'Recommendation Applied',
        description: 'Catalyst AI has optimized your campaign based on the recommendation.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: 'Failed to apply the recommendation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsOptimizing(false);
      onRecommendationModalClose();
    }
  };

  const handleDismissInsight = (insightId: string) => {
    if (onDismissInsight) {
      onDismissInsight(insightId);
    }
    toast({
      title: 'Insight Dismissed',
      description: 'The insight has been dismissed.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleActionInsight = (insightId: string, action: string) => {
    if (onActionInsight) {
      onActionInsight(insightId, action);
    }
    toast({
      title: 'Action Taken',
      description: `Insight marked as ${action}.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Ask Catalyst - Moved to top */}
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <HStack>
              <Icon as={FiZap} color="brand.primary" />
              <Heading size="md">Ask Catalyst</Heading>
            </HStack>
            <Text color="gray.600" textAlign="center" fontSize="sm" lineHeight="1.6">
              Catalyst AI is your intelligent campaign optimization assistant. Ask questions about your campaigns, 
              get personalized recommendations, analyze performance trends, and receive actionable insights to 
              improve your marketing ROI. Whether you need help with audience targeting, budget optimization, 
              content strategy, or performance analysis, Catalyst is here to guide you with data-driven insights.
            </Text>
            <Button
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "#1a365d" }}
              leftIcon={<Icon as={FiMessageSquare} />}
              aria-label="Ask Catalyst AI"
              onClick={onChatOpen}
            >
              Chat with Catalyst AI
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Catalyst AI Header */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <HStack>
                             <Icon as={FiZap} size={24} color="brand.primary" />
              <VStack align="start" spacing={0}>
                <Heading size="md">Catalyst AI</Heading>
                <Text color="gray.600">AI-powered campaign optimization</Text>
              </VStack>
            </HStack>
            {healthScore !== undefined && (
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.600">Campaign Health</Text>
                <Badge
                  colorScheme={getHealthScoreColor(healthScore)}
                  variant="subtle"
                  fontSize="md"
                  px={3}
                  py={1}
                >
                  {healthScore}%
                </Badge>
              </VStack>
            )}
          </HStack>
          
          <Progress
            value={healthScore || 0}
            colorScheme={getHealthScoreColor(healthScore || 0)}
            size="lg"
            borderRadius="full"
          />
        </CardBody>
      </Card>

      {/* Active Insights */}
      {insights.length > 0 && (
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Active Insights</Heading>
              <Badge colorScheme="brand" variant="subtle">
                {insights.filter(i => !i.is_dismissed && !i.is_actioned).length} Active
              </Badge>
            </HStack>
            
            <VStack spacing={3} align="stretch">
              {insights
                .filter(insight => !insight.is_dismissed && !insight.is_actioned)
                .slice(0, 3)
                .map((insight) => (
                  <Box
                    key={insight.id}
                    p={4}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={bgColor}
                    cursor="pointer"
                    _hover={{ borderColor: 'brand.primary' }}
                    onClick={() => {
                      setSelectedInsight(insight);
                      onInsightModalOpen();
                    }}
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Icon as={FiZap} color="brand.primary" />
                        <Text fontWeight="medium">{insight.title}</Text>
                      </HStack>
                      <Badge colorScheme={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
                      {insight.description}
                    </Text>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        {insight.confidence_score && (
                          <Text fontSize="xs" color="gray.500">
                            Confidence: {insight.confidence_score}%
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Tooltip label="Take Action">
                          <IconButton
                            size="sm"
                            icon={<Icon as={FiZap} color="green.500" />}
                            aria-label="Take Action"
                            colorScheme="green"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionInsight(insight.id, 'actioned');
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Dismiss">
                          <IconButton
                            size="sm"
                            icon={<Icon as={FiZap} color="red.500" />}
                            aria-label="Dismiss"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissInsight(insight.id);
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">AI Recommendations</Heading>
              <Button
                leftIcon={<Icon as={FiZap} />}
                size="sm"
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "#1a365d" }}
                aria-label="Refresh Recommendations"
              >
                Refresh
              </Button>
            </HStack>
            
            <VStack spacing={4} align="stretch">
              {recommendations.slice(0, 2).map((recommendation, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={bgColor}
                >
                  <HStack justify="space-between" mb={3}>
                    <HStack>
                      <Icon as={FiZap} color="brand.primary" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{recommendation.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {recommendation.recommendation_type.replace('_', ' ')}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </HStack>

                  <Text color="gray.700" mb={3}>
                    {recommendation.description}
                  </Text>

                  <HStack spacing={4} mb={3}>
                    <Box as="span" fontSize="sm" color="gray.500">Impact Score:</Box>
                    <Badge colorScheme="brand">{recommendation.impact_score}/10</Badge>
                    <Box as="span" fontSize="sm" color="gray.500">Confidence:</Box>
                    <Badge colorScheme="brand">{recommendation.confidence_score}%</Badge>
                  </HStack>

                  <Box mb={3}>
                    <Text fontWeight="medium" mb={2}>Action Items:</Text>
                    <VStack align="start" spacing={1}>
                      {recommendation.action_items.slice(0, 2).map((item, idx) => (
                        <HStack key={idx} spacing={1}>
                          <Icon as={FiZap} color="green.500" />
                          {item}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <HStack justify="space-between">
                    <Button
                      size="sm"
                      colorScheme="brand"
                      leftIcon={isOptimizing ? <Spinner size="sm" /> : <Icon as={FiPlay} />}
                      aria-label="Apply Recommendation"
                      onClick={() => {
                        setSelectedRecommendation(recommendation);
                        onRecommendationModalOpen();
                      }}
                      isLoading={isOptimizing}
                    >
                      Apply Recommendation
                    </Button>
                    <Button
                      size="sm"
                      bg="brand.primary"
                      color="brand.accent"
                      fontWeight="bold"
                      _hover={{ bg: "#1a365d" }}
                      onClick={() => {
                        setSelectedRecommendation(recommendation);
                        onRecommendationModalOpen();
                      }}
                      aria-label="Learn More"
                    >
                      Learn More
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Insight Detail Modal */}
      <Modal isOpen={isInsightModalOpen} onClose={onInsightModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Catalyst Insight</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInsight && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">{selectedInsight.title}</Text>
                  <Badge colorScheme={getPriorityColor(selectedInsight.priority)}>
                    {selectedInsight.priority}
                  </Badge>
                </HStack>
                
                <Text color="gray.700">{selectedInsight.description}</Text>
                
                {selectedInsight.recommendation && (
                  <Box p={3} bg="blue.50" borderRadius="md">
                    <Text fontWeight="medium" mb={2}>Recommendation:</Text>
                    <Text fontSize="sm">{selectedInsight.recommendation}</Text>
                  </Box>
                )}
                
                {selectedInsight.confidence_score && (
                  <HStack justify="space-between">
                    <Text fontSize="sm">Confidence Score:</Text>
                    <Badge colorScheme="brand">{selectedInsight.confidence_score}%</Badge>
                  </HStack>
                )}
                
                <Text fontSize="sm" color="gray.500">
                  Created: {new Date(selectedInsight.created_at).toLocaleString()}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInsightModalClose}>
              Close
            </Button>
            {selectedInsight && (
              <>
                <Button
                  colorScheme="green"
                  mr={3}
                  onClick={() => {
                    handleActionInsight(selectedInsight.id, 'actioned');
                    onInsightModalClose();
                  }}
                  aria-label="Take Action"
                >
                  Take Action
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    handleDismissInsight(selectedInsight.id);
                    onInsightModalClose();
                  }}
                  aria-label="Dismiss"
                >
                  Dismiss
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recommendation Detail Modal */}
      <Modal isOpen={isRecommendationModalOpen} onClose={onRecommendationModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI Recommendation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecommendation && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">{selectedRecommendation.title}</Text>
                  <Badge colorScheme={getPriorityColor(selectedRecommendation.priority)}>
                    {selectedRecommendation.priority}
                  </Badge>
                </HStack>
                
                <Text color="gray.700">{selectedRecommendation.description}</Text>
                
                <HStack spacing={6}>
                  <Box as="span" fontSize="sm" color="gray.500">Impact Score:</Box>
                  <Badge colorScheme="brand">{selectedRecommendation.impact_score}/10</Badge>
                  <Box as="span" fontSize="sm" color="gray.500">Confidence:</Box>
                  <Badge colorScheme="brand">{selectedRecommendation.confidence_score}%</Badge>
                </HStack>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Action Items:</Text>
                  <VStack align="start" spacing={1}>
                    {selectedRecommendation.action_items.map((item, idx) => (
                      <HStack key={idx}>
                        <Icon as={FiZap} color="green.500" />
                        {item}
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                
                {selectedRecommendation.estimated_improvement && (
                  <Box p={3} bg="green.50" borderRadius="md">
                    <Text fontWeight="medium" mb={2}>Estimated Improvements:</Text>
                    <VStack align="start" spacing={1}>
                      {Object.entries(selectedRecommendation.estimated_improvement).map(([key, value]) => (
                        <HStack key={key} spacing={1}>
                          <Icon as={FiZap} />
                          {key.replace('_', ' ')}: {String(value)}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRecommendationModalClose}>
              Cancel
            </Button>
            {selectedRecommendation && (
              <Button
                colorScheme="brand"
                leftIcon={isOptimizing ? <Spinner size="sm" /> : <Icon as={FiPlay} />}
                aria-label="Apply Recommendation"
                onClick={() => handleApplyRecommendation(selectedRecommendation)}
                isLoading={isOptimizing}
              >
                Apply Recommendation
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Catalyst AI Chat Modal */}
      <Modal isOpen={isChatOpen} onClose={onChatClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>
            <HStack>
              <Icon as={FiZap} color="brand.primary" />
              <Text>Chat with Catalyst AI</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
                      <ModalBody p={0}>
              <ContextualAIChat
                agentId="catalyst"
                agentName="Catalyst"
                agentSpecialization="campaign_optimization"
                pageContext="campaigns"
                pageData={{ insights, recommendations, healthScore }}
                onClose={onChatClose}
              />
            </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 