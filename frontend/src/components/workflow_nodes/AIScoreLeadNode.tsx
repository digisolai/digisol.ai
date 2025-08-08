import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Card,
  CardBody,
  Text,
  Icon,
  HStack,
  Badge,
  Box,
  Select,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {FiCpu, FiSettings, FiStar} from 'react-icons/fi';

interface AIScoreLeadNodeData {
  label: string;
  aiType?: string;
  scoringModel?: string;
  contextFields?: string;
  outputField?: string;
  threshold?: number;
}

interface AIScoreLeadNodeProps {
  data: AIScoreLeadNodeData;
}

const AIScoreLeadNode: React.FC<AIScoreLeadNodeProps> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [config, setConfig] = useState({
    scoringModel: data.scoringModel || 'engagement',
    contextFields: data.contextFields || '',
    outputField: data.outputField || 'lead_score',
    threshold: data.threshold || 80,
  });

  const scoringModels = [
    { value: 'engagement', label: 'Engagement-Based Scoring' },
    { value: 'behavioral', label: 'Behavioral Pattern Analysis' },
    { value: 'demographic', label: 'Demographic Scoring' },
    { value: 'intent', label: 'Purchase Intent Scoring' },
    { value: 'custom', label: 'Custom AI Model' },
  ];

  const handleSaveConfig = () => {
    // In a real implementation, this would update the node data
    onClose();
  };

  return (
    <>
      <Card
        minW="200px"
        bg="brand.50"
        border="2px solid"
                  borderColor="brand.200"
        borderRadius="lg"
        boxShadow="md"
        _hover={{ boxShadow: 'lg', transform: 'translateY(-1px)' }}
        transition="all 0.2s"
        position="relative"
        overflow="visible"
      >
        {/* AI indicator glow effect */}
        <Box
          position="absolute"
          top="-2px"
          left="-2px"
          right="-2px"
          bottom="-2px"
          bg="brand.300"
          borderRadius="lg"
          opacity="0.3"
          filter="blur(4px)"
          zIndex={-1}
        />
        
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#805ad5', width: '8px', height: '8px' }}
        />
        
        <CardBody p={3}>
          <VStack spacing={2} align="stretch">
            <HStack spacing={2} align="center">
              <Icon as={FiCpu} color="purple.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold" color="purple.700">
                {data.label}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="purple"
                onClick={onOpen}
                p={1}
                minW="auto"
                h="auto"
              >
                <Icon as={FiSettings} boxSize={3} />
              </Button>
            </HStack>
            
            {data.scoringModel && (
              <Badge size="sm" colorScheme="purple" variant="subtle">
                {scoringModels.find(sm => sm.value === data.scoringModel)?.label || data.scoringModel}
              </Badge>
            )}
            
            {data.threshold && (
              <HStack spacing={1}>
                <Icon as={FiStar} color="purple.400" boxSize={3} />
                <Text fontSize="xs" color="purple.600">
                  Threshold: {data.threshold}
                </Text>
              </HStack>
            )}
            
            {/* AI indicator */}
            <Badge size="xs" colorScheme="purple" variant="solid">
              AI Lead Scoring
            </Badge>
          </VStack>
        </CardBody>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#805ad5', width: '8px', height: '8px' }}
        />
      </Card>

      {/* Configuration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure AI Lead Scoring</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Scoring Model</FormLabel>
                <Select
                  value={config.scoringModel}
                  onChange={(e) => setConfig({ ...config, scoringModel: e.target.value })}
                >
                  {scoringModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Context Fields</FormLabel>
                <Textarea
                  value={config.contextFields}
                  onChange={(e) => setConfig({ ...config, contextFields: e.target.value })}
                  placeholder="Enter context fields to consider (e.g., email_opens, page_views, time_on_site)..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Score Threshold</FormLabel>
                <NumberInput
                  value={config.threshold}
                  onChange={(value) => setConfig({ ...config, threshold: parseInt(value) || 0 })}
                  min={0}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Output Field Name</FormLabel>
                <Input
                  value={config.outputField}
                  onChange={(e) => setConfig({ ...config, outputField: e.target.value })}
                  placeholder="lead_score"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AIScoreLeadNode; 