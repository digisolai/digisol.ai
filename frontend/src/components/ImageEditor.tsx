import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Select,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {FiRotateCcw, FiType, FiEdit3, FiCrop, FiDownload, FiX, FiSave} from 'react-icons/fi';
import api from '../services/api';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  requestId: string;
  promptText: string;
}

interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
}

export default function ImageEditor({ isOpen, onClose, imageUrl, requestId, promptText }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  });
  const [tool, setTool] = useState<'draw' | 'text' | 'crop'>('draw');
  const [textInput, setTextInput] = useState('');

  const [isAddingText, setIsAddingText] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isSaving, setIsSaving] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetTags, setAssetTags] = useState<string[]>(['edited', 'ai-generated']);
  const toast = useToast();

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvasElement = canvasRef.current;
      const context = canvasElement.getContext('2d');
      
      if (context) {
        setCanvas(canvasElement);
        setCtx(context);
        
        // Load image onto canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvasElement.width = img.width;
          canvasElement.height = img.height;
          context.drawImage(img, 0, 0);
        };
        img.src = imageUrl;
      }
    }
  }, [isOpen, imageUrl]);

  // Drawing functionality
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !ctx || tool !== 'draw') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawingState({
      isDrawing: true,
      lastX: x,
      lastY: y,
    });
  }, [canvas, ctx, tool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !ctx || !drawingState.isDrawing || tool !== 'draw') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(drawingState.lastX, drawingState.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setDrawingState(prev => ({
      ...prev,
      lastX: x,
      lastY: y,
    }));
  }, [canvas, ctx, drawingState, tool, brushColor, brushSize]);

  const stopDrawing = useCallback(() => {
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
  }, []);

  // Text functionality
  const addText = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvas || !ctx || tool !== 'text' || !textInput.trim()) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.font = '24px Arial';
    ctx.fillStyle = brushColor;
    ctx.fillText(textInput, x, y);
    
    setTextInput('');
    setIsAddingText(false);
  }, [canvas, ctx, tool, textInput, brushColor]);

  // Handle canvas click for text placement
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text' && isAddingText) {
      addText(e);
    }
  }, [tool, isAddingText, addText]);

  // Save edited image
  const saveEditedImage = async () => {
    if (!canvas) return;
    
    setIsSaving(true);
    try {
      // Get image data from canvas
      const imageData = canvas.toDataURL('image/png');
      
      // Generate asset name if not provided
      const finalAssetName = assetName || `Edited ${promptText.substring(0, 30)}...`;
      
      // Save to backend
      await api.post(`/ai-services/image-requests/${requestId}/save_edited_image/`, {
        image_data: imageData,
        save_as_asset: true,
        asset_name: finalAssetName,
        asset_description: assetDescription || `Edited version of: ${promptText}`,
        asset_tags: assetTags,
      });
      
      toast({
        title: 'Image saved successfully!',
        description: 'Your edited image has been saved to the brand asset library.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error: unknown) {
      console.error('Failed to save edited image:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to save edited image.'
        : 'Failed to save edited image.';
      toast({
        title: 'Save failed',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `edited-image-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Undo functionality (simple implementation)
  const undo = () => {
    if (!canvas || !ctx) return;
    
    // For a simple undo, we'll reload the original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Toolbar */}
            <HStack spacing={4} p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">Tools:</Text>
              
              <Tooltip label="Draw/Brush Tool">
                <IconButton
                  aria-label="Draw"
                  icon={<FiEdit3 />}
                  colorScheme={tool === 'draw' ? 'blue' : 'gray'}
                  onClick={() => setTool('draw')}
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Add Text">
                <IconButton
                  aria-label="Add Text"
                  icon={<FiType />}
                  colorScheme={tool === 'text' ? 'blue' : 'gray'}
                  onClick={() => {
                    setTool('text');
                    setIsAddingText(true);
                  }}
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Crop Tool (Coming Soon)">
                <IconButton
                  aria-label="Crop"
                  icon={<FiCrop />}
                  colorScheme="gray"
                  isDisabled
                  size="sm"
                />
              </Tooltip>
              
              <Text fontWeight="bold" ml={4}>Brush:</Text>
              <Input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                w="40px"
                h="32px"
                p={0}
                border="none"
              />
              <Select
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                w="80px"
                size="sm"
              >
                <option value={2}>2px</option>
                <option value={5}>5px</option>
                <option value={10}>10px</option>
                <option value={20}>20px</option>
              </Select>
              
              <Tooltip label="Undo">
                <IconButton
                  aria-label="Undo"
                  icon={<FiRotateCcw />}
                  onClick={undo}
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Download">
                <IconButton
                  aria-label="Download"
                  icon={<FiDownload />}
                  onClick={downloadImage}
                  size="sm"
                />
              </Tooltip>
            </HStack>

            {/* Text Input */}
            {tool === 'text' && isAddingText && (
              <HStack spacing={2} p={4} bg="blue.50" borderRadius="md">
                <Text>Click on canvas to place text:</Text>
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  size="sm"
                  w="200px"
                />
                <Button
                  size="sm"
                  onClick={() => setIsAddingText(false)}
                  leftIcon={<FiX />}
                >
                  Cancel
                </Button>
              </HStack>
            )}

            {/* Canvas */}
            <Box
              border="2px solid"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
              display="flex"
              justifyContent="center"
              bg="gray.100"
              minH="400px"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onClick={handleCanvasClick}
                style={{
                  cursor: tool === 'draw' ? 'crosshair' : tool === 'text' ? 'text' : 'default',
                  maxWidth: '100%',
                  maxHeight: '600px',
                }}
              />
            </Box>

            {/* Asset Details */}
            <VStack spacing={3} p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">Save as Brand Asset:</Text>
              
              <FormControl>
                <FormLabel>Asset Name</FormLabel>
                <Input
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name..."
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  value={assetTags.join(', ')}
                  onChange={(e) => setAssetTags(e.target.value.split(',').map(tag => tag.trim()))}
                  placeholder="Enter tags separated by commas..."
                />
              </FormControl>
              
              <HStack spacing={2}>
                {assetTags.map((tag, index) => (
                  <Badge key={index} colorScheme="brand" variant="subtle">
                    {tag}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              variant="brandSolid"
              onClick={saveEditedImage}
              isLoading={isSaving}
              loadingText="Saving..."
              leftIcon={<FiSave />}
            >
              Save to Assets
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 