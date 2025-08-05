import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  FiZap,
  FiMail,
  FiClock,
  FiGitBranch,
  FiCpu,
  FiMessageSquare,
  FiDatabase,
} from 'react-icons/fi';

interface NodeTemplate {
  type: string;
  label: string;
  icon: React.ComponentType<Record<string, unknown>>;
  description: string;
  category: string;
  color: string;
}

const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    label: 'Contact Created',
    icon: FiZap,
    description: 'Trigger when a new contact is created',
    category: 'Triggers',
    color: 'blue',
  },
  {
    type: 'trigger',
    label: 'Email Opened',
    icon: FiZap,
    description: 'Trigger when an email is opened',
    category: 'Triggers',
    color: 'blue',
  },
  {
    type: 'trigger',
    label: 'Form Submitted',
    icon: FiZap,
    description: 'Trigger when a form is submitted',
    category: 'Triggers',
    color: 'blue',
  },

  // Actions
  {
    type: 'action',
    label: 'Send Email',
    icon: FiMail,
    description: 'Send an email to the contact',
    category: 'Actions',
    color: 'green',
  },
  {
    type: 'action',
    label: 'Send SMS',
    icon: FiMessageSquare,
    description: 'Send an SMS message',
    category: 'Actions',
    color: 'green',
  },
  {
    type: 'action',
    label: 'Update CRM',
    icon: FiDatabase,
    description: 'Update contact in CRM',
    category: 'Actions',
    color: 'green',
  },

  // Delays
  {
    type: 'action',
    label: 'Wait 3 Days',
    icon: FiClock,
    description: 'Wait for 3 days before continuing',
    category: 'Delays',
    color: 'orange',
  },
  {
    type: 'action',
    label: 'Wait 1 Week',
    icon: FiClock,
    description: 'Wait for 1 week before continuing',
    category: 'Delays',
    color: 'orange',
  },

  // Conditions
  {
    type: 'condition',
    label: 'Lead Score > 80?',
    icon: FiGitBranch,
    description: 'Check if lead score is above 80',
    category: 'Conditions',
    color: 'orange',
  },
  {
    type: 'condition',
    label: 'Email Opened?',
    icon: FiGitBranch,
    description: 'Check if email was opened',
    category: 'Conditions',
    color: 'orange',
  },
  {
    type: 'condition',
    label: 'Contact in Segment?',
    icon: FiGitBranch,
    description: 'Check if contact is in specific segment',
    category: 'Conditions',
    color: 'orange',
  },

  // AI Actions
  {
    type: 'aiGenerateContent',
    label: 'AI: Generate Content',
    icon: FiCpu,
    description: 'Generate email copy, social posts, and more',
    category: 'AI Actions',
    color: 'purple',
  },
  {
    type: 'aiScoreLead',
    label: 'AI: Score Lead',
    icon: FiCpu,
    description: 'AI-powered lead scoring and qualification',
    category: 'AI Actions',
    color: 'purple',
  },
  {
    type: 'ai_action',
    label: 'Generate Social Post',
    icon: FiCpu,
    description: 'AI-generated social media content',
    category: 'AI Actions',
    color: 'purple',
  },
  {
    type: 'ai_action',
    label: 'Personalize Content',
    icon: FiCpu,
    description: 'AI content personalization',
    category: 'AI Actions',
    color: 'purple',
  },
];

const WorkflowSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: Record<string, unknown>) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: nodeData }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedTemplates = nodeTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);

  return (
    <Box
      w="300px"
      h="100%"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      overflowY="auto"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="brand.primary">
          Workflow Nodes
        </Text>
        <Text fontSize="sm" color="gray.600">
          Drag nodes to the canvas to build your workflow
        </Text>
        
        <Divider />
        
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <Box key={category}>
            <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={3}>
              {category}
            </Text>
            <VStack spacing={2} align="stretch">
              {templates.map((template, index) => (
                <Box
                  key={`${template.type}-${index}`}
                  draggable
                  className="dndnode"
                  onDragStart={(event) => onDragStart(event, template.type, { 
                    label: template.label,
                    [template.type === 'trigger' ? 'triggerType' : 
                     template.type === 'action' ? 'actionType' : 
                     template.type === 'condition' ? 'conditionType' : 'aiType']: template.category
                  })}
                  p={3}
                  bg={`${template.color}.50`}
                  border="1px solid"
                  borderColor={`${template.color}.200`}
                  borderRadius="md"
                  cursor="grab"
                  _hover={{
                    bg: `${template.color}.100`,
                    transform: 'translateY(-1px)',
                    boxShadow: 'md',
                  }}
                  transition="all 0.2s"
                  _active={{
                    cursor: 'grabbing',
                    transform: 'translateY(0px)',
                  }}
                >
                  <HStack spacing={3}>
                    <Icon 
                      as={template.icon} 
                      color={`${template.color}.500`} 
                      boxSize={4} 
                    />
                    <VStack spacing={1} align="start" flex={1}>
                      <Text fontSize="sm" fontWeight="medium" color={`${template.color}.700`}>
                        {template.label}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {template.description}
                      </Text>
                    </VStack>
                    <Badge size="sm" colorScheme={template.color} variant="subtle">
                      {template.type}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
            <Divider mt={4} />
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default WorkflowSidebar; 