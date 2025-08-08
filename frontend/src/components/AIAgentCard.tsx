import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import {
  FiCpu,
  FiTarget,
  FiDollarSign,
  FiEdit3,
  FiTrendingUp,
  FiUsers,
  FiGrid,
  FiBarChart,
  FiUserCheck,
  FiLink,
  FiBookOpen,
} from 'react-icons/fi';

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  personality_description: string;
  is_active: boolean;
}

interface AIAgentCardProps {
  agent: AIAgent;
  onAskQuestion?: (question: string) => void;
}

const getAgentIcon = (specialization: string) => {
  const iconMap: { [key: string]: React.ElementType } = {
    'marketing_strategy': FiTarget,
    'budget_analysis': FiDollarSign,
    'content_creation': FiEdit3,
    'campaign_optimization': FiTrendingUp,
    'lead_nurturing': FiUsers,
    'general_orchestration': FiGrid,
    'data_analysis': FiBarChart,
    'hr_management': FiUserCheck,
    'integrations_management': FiLink,
    'learning_guidance': FiBookOpen,
  };
  return iconMap[specialization] || FiCpu;
};

const getSpecializationLabel = (specialization: string) => {
  const labelMap: { [key: string]: string } = {
    'marketing_strategy': 'Marketing Strategy',
    'budget_analysis': 'Budget Analysis',
    'content_creation': 'Content Creation',
    'campaign_optimization': 'Campaign Optimization',
    'lead_nurturing': 'Lead Nurturing',
    'general_orchestration': 'General Orchestration',
    'data_analysis': 'Data Analysis',
    'hr_management': 'HR Management',
    'integrations_management': 'Integrations Management',
    'learning_guidance': 'Learning Guidance',
  };
  return labelMap[specialization] || specialization;
};

const getAgentGreeting = (name: string, specialization: string) => {
  const greetings: { [key: string]: string } = {
  
    'Pecunia': "Let me analyze your budget and optimize for maximum ROI. What financial data should we review?",
    'Scriptor': "I'll help you create compelling content that resonates. What message do you want to convey?",
    'Catalyst': "Let's optimize your campaigns for better performance. What metrics are you tracking?",
    'Prospero': "I'll guide your leads through the perfect nurturing journey. What's your target audience?",
  
    'Metrika': "I'll analyze your data to uncover hidden insights. What metrics should we examine?",
  
    'Connectus': "I'll ensure seamless integration between all your tools. What systems need connecting?",
    'Mentor': "I'll guide you through mastering the DigiSol.AI platform. What would you like to learn?",
  };
  return greetings[name] || `Hello! I'm ${name}, your ${getSpecializationLabel(specialization)} specialist. How can I help you today?`;
};

export const AIAgentCard: React.FC<AIAgentCardProps> = ({ 
  agent, 
  onAskQuestion
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [question, setQuestion] = React.useState('');
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const IconComponent = getAgentIcon(agent.specialization);

  // Debug logging
  React.useEffect(() => {
    console.log(`AIAgentCard rendered for: ${agent.name} (Active: ${agent.is_active})`);
  }, [agent.name, agent.is_active]);

  const handleAskQuestion = () => {
    if (!question.trim()) {
      toast({
        title: 'Question required',
        description: 'Please enter a question for the AI agent.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onAskQuestion) {
      onAskQuestion(question);
    } else {
      // Default behavior - show a toast
      toast({
        title: `${agent.name} is processing your question`,
        description: 'Your question has been submitted to the AI agent.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
    
    setQuestion('');
    onClose();
  };

  return (
    <>
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Box
                p={2}
                bg="brand.50"
                borderRadius="full"
              >
                <Icon as={IconComponent} boxSize={5} color="brand.primary" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg">
                  {agent.name}
                </Text>
                <Badge bg="brand.accent" color="brand.primary" variant="subtle">
                  {getSpecializationLabel(agent.specialization)}
                </Badge>
              </VStack>
            </HStack>
            <Badge
              bg={agent.is_active ? 'brand.accent' : 'gray.300'}
              color={agent.is_active ? 'brand.primary' : 'gray.600'}
              variant="subtle"
            >
              {agent.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>

          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
            {getAgentGreeting(agent.name, agent.specialization)}
          </Text>

          {/* Always show the Ask Question button */}
          <HStack spacing={2} w="full">
            <Button
              size="sm"
              bg="brand.primary"
              color="white"
              variant="outline"
              onClick={onOpen}
              flex={1}
              _hover={{ bg: 'brand.600' }}
            >
              Ask Question
            </Button>
            <Tooltip label="View detailed profile">
              <Button size="sm" variant="ghost" color="brand.primary">
                <Icon as={FiCpu} />
              </Button>
            </Tooltip>
          </HStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ask {agent.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {getAgentGreeting(agent.name, agent.specialization)}
              </Text>
              <Textarea
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
              <HStack spacing={3} w="full">
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
                <Button bg="brand.primary" color="white" onClick={handleAskQuestion} flex={1} _hover={{ bg: 'brand.600' }}>
                  Ask {agent.name}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 