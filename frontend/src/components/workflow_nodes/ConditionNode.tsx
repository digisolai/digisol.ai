import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Box,
  Text,
  Icon,
  HStack,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { FiGitBranch } from 'react-icons/fi';

interface ConditionNodeData {
  label: string;
  conditionType?: string;
}

interface ConditionNodeProps {
  data: ConditionNodeData;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  return (
    <Box
      position="relative"
      width="200px"
      height="120px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Diamond shape using CSS transform */}
      <Box
        position="absolute"
        width="160px"
        height="160px"
        bg="orange.50"
        border="2px solid"
        borderColor="orange.200"
        borderRadius="md"
        transform="rotate(45deg)"
        boxShadow="md"
        _hover={{ boxShadow: 'lg', transform: 'rotate(45deg) scale(1.05)' }}
        transition="all 0.2s"
      />
      
      {/* Content container */}
      <VStack
        position="relative"
        zIndex={1}
        spacing={2}
        align="center"
        justify="center"
        width="140px"
        height="140px"
        transform="rotate(-45deg)"
      >
        <HStack spacing={2} align="center">
          <Icon as={FiGitBranch} color="orange.500" boxSize={4} />
          <Text fontSize="xs" fontWeight="bold" color="orange.700" textAlign="center">
            {data.label}
          </Text>
        </HStack>
        
        {data.conditionType && (
          <Badge size="sm" colorScheme="orange" variant="subtle">
            {data.conditionType}
          </Badge>
        )}
      </VStack>

      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          background: '#ed8936', 
          width: '8px', 
          height: '8px',
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />

      {/* Output handle for True (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ 
          background: '#38a169', 
          width: '8px', 
          height: '8px',
          right: '-4px',
          top: '35%'
        }}
      />

      {/* Output handle for False (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ 
          background: '#e53e3e', 
          width: '8px', 
          height: '8px',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />

      {/* Labels for True/False outputs */}
      <Text
        position="absolute"
        right="-30px"
        top="30%"
        fontSize="xs"
        color="green.600"
        fontWeight="bold"
      >
        True
      </Text>
      
      <Text
        position="absolute"
        bottom="-20px"
        left="50%"
        transform="translateX(-50%)"
        fontSize="xs"
        color="red.600"
        fontWeight="bold"
      >
        False
      </Text>
    </Box>
  );
};

export default ConditionNode; 