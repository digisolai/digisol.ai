import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Card,
  CardBody,
  Text,
  Icon,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FiZap } from 'react-icons/fi';

interface TriggerNodeData {
  label: string;
  triggerType?: string;
}

interface TriggerNodeProps {
  data: TriggerNodeData;
}

const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  return (
    <Card
      minW="180px"
      bg="brand.50"
      border="2px solid"
              borderColor="brand.200"
      borderRadius="lg"
      boxShadow="md"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-1px)' }}
      transition="all 0.2s"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#3182ce', width: '8px', height: '8px' }}
      />
      
      <CardBody p={3}>
        <HStack spacing={2} align="center">
          <Icon as={FiZap} color="brand.primary" boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color="brand.primary">
            {data.label}
          </Text>
        </HStack>
        
        {data.triggerType && (
          <Badge size="sm" colorScheme="brand" variant="subtle" mt={2}>
            {data.triggerType}
          </Badge>
        )}
      </CardBody>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3182ce', width: '8px', height: '8px' }}
      />
    </Card>
  );
};

export default TriggerNode; 