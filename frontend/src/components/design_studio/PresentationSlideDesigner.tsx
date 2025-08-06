import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
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
  SimpleGrid,
} from '@chakra-ui/react';
import { FiUpload, FiMonitor } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface PresentationSlideDesignerProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const PresentationSlideDesigner: React.FC<PresentationSlideDesignerProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    topic: '',
    slide_type: 'title',
    key_points: '',
    layout_style: 'clean',
    color_scheme: 'professional',
    brand_profile_id: '',
    additional_notes: '',
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
      const designParameters = {
        topic: form.topic,
        slide_type: form.slide_type,
        key_points: form.key_points,
        layout_style: form.layout_style,
        color_scheme: form.color_scheme,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a ${form.layout_style} presentation slide for topic: ${form.topic}. Slide type: ${form.slide_type}. Key points: ${form.key_points}. Color scheme: ${form.color_scheme}. ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'presentation_slide',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Presentation slide generation request submitted successfully! Check the status in your requests.');
      setForm({
        topic: '',
        slide_type: 'title',
        key_points: '',
        layout_style: 'clean',
        color_scheme: 'professional',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating presentation slide:', err);
      setError(err.response?.data?.detail || 'Failed to generate presentation slide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiMonitor size={24} />
            <Heading size="md">Presentation Slide Designer</Heading>
          </HStack>
          
          <Text color="gray.600">
            Create professional presentation slides with AI assistance.
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
                <FormLabel>Slide Topic</FormLabel>
                <Input
                  name="topic"
                  value={form.topic}
                  onChange={handleInputChange}
                  placeholder="What is this slide about?"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Slide Type</FormLabel>
                  <Select
                    name="slide_type"
                    value={form.slide_type}
                    onChange={handleInputChange}
                  >
                    <option value="title">Title Slide</option>
                    <option value="content">Content Slide</option>
                    <option value="bullet_points">Bullet Points</option>
                    <option value="chart">Chart/Graph</option>
                    <option value="image">Image Focus</option>
                    <option value="quote">Quote</option>
                    <option value="conclusion">Conclusion</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Layout Style</FormLabel>
                  <Select
                    name="layout_style"
                    value={form.layout_style}
                    onChange={handleInputChange}
                  >
                    <option value="clean">Clean</option>
                    <option value="modern">Modern</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="bold">Bold</option>
                    <option value="elegant">Elegant</option>
                    <option value="creative">Creative</option>
                    <option value="corporate">Corporate</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Key Points/Content</FormLabel>
                <Textarea
                  name="key_points"
                  value={form.key_points}
                  onChange={handleInputChange}
                  placeholder="Main points, data, or content to include on the slide..."
                  rows={4}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Color Scheme</FormLabel>
                  <Select
                    name="color_scheme"
                    value={form.color_scheme}
                    onChange={handleInputChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="high_contrast">High Contrast</option>
                  </Select>
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
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific visual elements, charts, or design preferences..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Slide..."
                w="full"
              >
                Generate Presentation Slide
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              📊 Presentation Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Keep text minimal and impactful</Text>
              <Text fontSize="sm" color="gray.600">• Use consistent fonts and colors</Text>
              <Text fontSize="sm" color="gray.600">• Ensure good contrast for readability</Text>
              <Text fontSize="sm" color="gray.600">• Include visual elements when appropriate</Text>
              <Text fontSize="sm" color="gray.600">• Consider your audience and presentation context</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PresentationSlideDesigner; 