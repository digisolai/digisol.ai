import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Card,
  CardBody,
  Text,
  Icon,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react';
import { FiCpu } from 'react-icons/fi';

interface AINodeData {
  label: string;
  aiType?: string;
}

interface AINodeProps {
  data: AINodeData;
}

const AINode: React.FC<AINodeProps> = ({ data }) => {
  return (
    <Card
      minW="180px"
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
        <HStack spacing={2} align="center">
          <Icon as={FiCpu} color="purple.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color="purple.700">
            {data.label}
          </Text>
        </HStack>
        
        {data.aiType && (
          <Badge size="sm" colorScheme="purple" variant="subtle" mt={2}>
            {data.aiType}
          </Badge>
        )}
        
        {/* AI indicator */}
        <Badge size="xs" colorScheme="purple" variant="solid" mt={1}>
          AI Powered
        </Badge>
      </CardBody>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#805ad5', width: '8px', height: '8px' }}
      />
    </Card>
  );
};

export default AINode; 