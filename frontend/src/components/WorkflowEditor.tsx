// frontend/src/components/WorkflowEditor.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from 'reactflow';
import type { NodeTypes, Node, Connection, Edge } from 'reactflow';
import {Box, Text, Button, HStack, Flex, Spinner} from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';
import { TriggerNode, ActionNode, ConditionNode, AINode } from './workflow_nodes';
import AIGenerateContentNode from './workflow_nodes/AIGenerateContentNode';
import AIScoreLeadNode from './workflow_nodes/AIScoreLeadNode';
import WorkflowSidebar from './WorkflowSidebar';
import type { AutomationWorkflow } from '../types/automation';

import 'reactflow/dist/style.css'; // Import React Flow's default styles

// Define custom node types outside component to prevent React Flow warnings
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  ai_action: AINode,
  aiGenerateContent: AIGenerateContentNode,
  aiScoreLead: AIScoreLeadNode,
};

interface WorkflowEditorProps {
  workflow: AutomationWorkflow | null;
  onSave: (workflowData: { id?: string; nodes: Node[]; edges: Edge[] }) => void;
}

// Sample nodes to demonstrate all custom node types
const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Contact Created',
      triggerType: 'Contact Event'
    },
  },
  {
    id: 'ai-score-1',
    type: 'aiScoreLead',
    position: { x: 250, y: 150 },
    data: { 
      label: 'AI: Score Lead',
      scoringModel: 'engagement',
      threshold: 80
    },
  },
  {
    id: 'condition-1',
    type: 'condition',
    position: { x: 250, y: 250 },
    data: { 
      label: 'Lead Score > 80?',
      conditionType: 'Lead Scoring'
    },
  },
  {
    id: 'ai-content-1',
    type: 'aiGenerateContent',
    position: { x: 450, y: 250 },
    data: { 
      label: 'AI: Generate Content',
      contentType: 'email',
      prompt: 'Generate a personalized welcome email'
    },
  },
  {
    id: 'action-1',
    type: 'action',
    position: { x: 450, y: 350 },
    data: { 
      label: 'Send Email',
      actionType: 'Email'
    },
  },
];

// Sample edges connecting the nodes
const initialEdges: Edge[] = [
  {
    id: 'e-trigger-score',
    source: 'trigger-1',
    target: 'ai-score-1',
    type: 'smoothstep',
  },
  {
    id: 'e-score-condition',
    source: 'ai-score-1',
    target: 'condition-1',
    type: 'smoothstep',
  },
  {
    id: 'e-condition-content',
    source: 'condition-1',
    target: 'ai-content-1',
    type: 'smoothstep',
    sourceHandle: 'true', // Connect to True branch
  },
  {
    id: 'e-content-action',
    source: 'ai-content-1',
    target: 'action-1',
    type: 'smoothstep',
  },
];

const WorkflowCanvas: React.FC<WorkflowEditorProps> = ({ workflow, onSave }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { project, getNodes, getEdges } = useReactFlow();

  // Load workflow data when workflow prop changes
  useEffect(() => {
    if (workflow && workflow.steps_config) {
      try {
        const stepsConfig = workflow.steps_config as { nodes?: Node[]; edges?: Edge[] };
        if (stepsConfig.nodes && stepsConfig.edges) {
          setNodes(stepsConfig.nodes);
          setEdges(stepsConfig.edges);
          setShowDemo(false); // Hide demo controls when loading a real workflow
        }
      } catch (error) {
        console.error('Error loading workflow data:', error);
      }
    } else {
      // Reset to demo state if no workflow is selected
      setNodes(initialNodes);
      setEdges(initialEdges);
      setShowDemo(true);
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { type, data: nodeData } = JSON.parse(data);
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const resetDemo = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  const handleSaveClick = useCallback(async () => {
    setIsSaving(true);
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      
      await onSave({
        id: workflow?.id,
        nodes: currentNodes,
        edges: currentEdges,
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflow?.id, getNodes, getEdges, onSave]);

  return (
    <Box flex={1} ref={reactFlowWrapper} position="relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        style={{ background: '#f8fafc' }}
      >
        <MiniMap 
          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          nodeColor="#3182ce"
        />
        <Controls />
        <Background gap={12} size={1} color="#E2E8F0" />
        <Panel position="top-left">
          <HStack spacing={2}>
            <Text fontSize="md" fontWeight="bold" color="brand.primary">
              {workflow ? `Editing: ${workflow.name}` : 'Workflow Editor'}
            </Text>
            <Button
              size="sm"
              onClick={handleSaveClick}
              colorScheme="green"
              leftIcon={isSaving ? <Spinner size="xs" /> : <FiSave />}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Workflow
            </Button>
            {showDemo && (
              <>
                <Button size="xs" onClick={clearCanvas} colorScheme="red" variant="outline">
                  Clear
                </Button>
                <Button size="xs" onClick={resetDemo} colorScheme="blue" variant="outline">
                  Reset Demo
                </Button>
              </>
            )}
          </HStack>
        </Panel>
      </ReactFlow>
    </Box>
  );
};

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ workflow, onSave }) => {
  return (
    <ReactFlowProvider>
      <Flex h="600px" border="1px solid #E2E8F0" borderRadius="8px" overflow="hidden" boxShadow="lg">
        <WorkflowSidebar />
        <WorkflowCanvas workflow={workflow} onSave={onSave} />
      </Flex>
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;