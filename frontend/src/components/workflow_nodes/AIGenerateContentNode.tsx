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
  Textarea,
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
} from '@chakra-ui/react';
import {FiCpu} from 'react-icons/fi';

interface AIGenerateContentNodeData {
  label: string;
  aiType?: string;
  prompt?: string;
  contentType?: string;
  outputField?: string;
}

interface AIGenerateContentNodeProps {
  data: AIGenerateContentNodeData;
}

const AIGenerateContentNode: React.FC<AIGenerateContentNodeProps> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [config, setConfig] = useState({
    prompt: data.prompt || '',
    contentType: data.contentType || 'email',
    outputField: data.outputField || 'generated_content',
  });

  const contentTypes = [
    { value: 'email', label: 'Email Copy' },
    { value: 'social_post', label: 'Social Media Post' },
    { value: 'blog_post', label: 'Blog Post' },
    { value: 'ad_copy', label: 'Ad Copy' },
    { value: 'product_description', label: 'Product Description' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleSaveConfig = () => {
    // In a real implementation, this would update the node data
    onClose();
  };

  return (
    <>
      <Card
        minW="200px"
        bg="purple.50"
        border="2px solid"
        borderColor="purple.200"
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
          bg="purple.300"
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
            
            {data.contentType && (
              <Badge size="sm" colorScheme="purple" variant="subtle">
                {contentTypes.find(ct => ct.value === data.contentType)?.label || data.contentType}
              </Badge>
            )}
            
            {data.prompt && (
              <Text fontSize="xs" color="purple.600" noOfLines={2}>
                "{data.prompt.substring(0, 50)}..."
              </Text>
            )}
            
            {/* AI indicator */}
            <Badge size="xs" colorScheme="purple" variant="solid">
              AI Content Generation
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
          <ModalHeader>Configure AI Content Generation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Content Type</FormLabel>
                <Select
                  value={config.contentType}
                  onChange={(e) => setConfig({ ...config, contentType: e.target.value })}
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>AI Prompt</FormLabel>
                <Textarea
                  value={config.prompt}
                  onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                  placeholder="Describe the content you want AI to generate..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Output Field Name</FormLabel>
                <Input
                  value={config.outputField}
                  onChange={(e) => setConfig({ ...config, outputField: e.target.value })}
                  placeholder="generated_content"
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

export default AIGenerateContentNode; 