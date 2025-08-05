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
import { FiPlay } from 'react-icons/fi';

interface ActionNodeData {
  label: string;
  actionType?: string;
}

interface ActionNodeProps {
  data: ActionNodeData;
}

const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  return (
    <Card
      minW="180px"
      bg="green.50"
      border="2px solid"
      borderColor="green.200"
      borderRadius="lg"
      boxShadow="md"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-1px)' }}
      transition="all 0.2s"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#38a169', width: '8px', height: '8px' }}
      />
      
      <CardBody p={3}>
        <HStack spacing={2} align="center">
          <Icon as={FiPlay} color="green.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" color="green.700">
            {data.label}
          </Text>
        </HStack>
        
        {data.actionType && (
          <Badge size="sm" colorScheme="green" variant="subtle" mt={2}>
            {data.actionType}
          </Badge>
        )}
      </CardBody>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#38a169', width: '8px', height: '8px' }}
      />
    </Card>
  );
};

export default ActionNode; 