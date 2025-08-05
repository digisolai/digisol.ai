import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Select,
  Text,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  HStack,
} from '@chakra-ui/react';
import {FiImage} from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface GeneralImageCreatorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const GeneralImageCreator: React.FC<GeneralImageCreatorProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    prompt: '',
    brand_profile_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [brandProfiles] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData = {
        prompt: form.prompt,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'general',
        design_parameters: {}
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Image generation request submitted successfully! Check the status in your requests.');
      setForm({ prompt: '', brand_profile_id: '' });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.detail || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiImage size={24} />
            <Heading size="md">General Image Creator</Heading>
          </HStack>
          
          <Text color="gray.600">
            Create any type of image with AI. Simply describe what you want to see.
          </Text>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success">
              <AlertIcon />
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Image Description</FormLabel>
                <Textarea
                  name="prompt"
                  value={form.prompt}
                  onChange={handleInputChange}
                  placeholder="Describe the image you want to create... (e.g., 'A futuristic office space with AI technology, modern design, blue and white color scheme')"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Brand Profile (Optional)</FormLabel>
                <Select
                  name="brand_profile_id"
                  value={form.brand_profile_id}
                  onChange={handleInputChange}
                  placeholder="Select a brand profile to apply brand guidelines"
                >
                  {brandProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Using a brand profile will apply your brand colors and style to the generated image.
                </Text>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Image..."
                w="full"
              >
                Generate Image
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              💡 Tips for better results:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Be specific about style, colors, and mood</Text>
              <Text fontSize="sm" color="gray.600">• Include details about composition and lighting</Text>
              <Text fontSize="sm" color="gray.600">• Mention any specific elements you want included</Text>
              <Text fontSize="sm" color="gray.600">• Use descriptive adjectives for better results</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default GeneralImageCreator; 