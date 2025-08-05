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
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface SocialPostDesignerProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const SocialPostDesigner: React.FC<SocialPostDesignerProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    topic: '',
    platform: 'instagram',
    aspect_ratio: '1:1',
    tone: 'professional',
    hashtags: '',
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
        platform: form.platform,
        aspect_ratio: form.aspect_ratio,
        topic: form.topic,
        tone: form.tone,
        hashtags: form.hashtags,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a social media post for ${form.platform} platform with aspect ratio ${form.aspect_ratio}. Topic: ${form.topic}. Tone: ${form.tone}. ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'social_post',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Social post generation request submitted successfully! Check the status in your requests.');
      setForm({
        topic: '',
        platform: 'instagram',
        aspect_ratio: '1:1',
        tone: 'professional',
        hashtags: '',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating social post:', err);
      setError(err.response?.data?.detail || 'Failed to generate social post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiShare2 size={24} />
            <Heading size="md">Social Post Designer</Heading>
          </HStack>
          
          <Text color="gray.600">
            Create engaging social media posts optimized for different platforms.
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
                <FormLabel>Post Topic/Content</FormLabel>
                <Textarea
                  name="topic"
                  value={form.topic}
                  onChange={handleInputChange}
                  placeholder="What's your post about? Describe the content, message, or theme..."
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    name="platform"
                    value={form.platform}
                    onChange={handleInputChange}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="pinterest">Pinterest</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Aspect Ratio</FormLabel>
                  <Select
                    name="aspect_ratio"
                    value={form.aspect_ratio}
                    onChange={handleInputChange}
                  >
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="4:5">Portrait (4:5)</option>
                    <option value="2:1">Landscape (2:1)</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Tone</FormLabel>
                  <Select
                    name="tone"
                    value={form.tone}
                    onChange={handleInputChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                    <option value="promotional">Promotional</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Hashtags (Optional)</FormLabel>
                  <Input
                    name="hashtags"
                    value={form.hashtags}
                    onChange={handleInputChange}
                    placeholder="#marketing #business #ai"
                  />
                </FormControl>
              </SimpleGrid>

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
                  Using a brand profile will apply your brand colors and style to the post.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific visual elements, colors, or style preferences..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Social Post..."
                w="full"
              >
                Generate Social Post
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              📱 Social Media Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Use platform-specific best practices</Text>
              <Text fontSize="sm" color="gray.600">• Keep text minimal and impactful</Text>
              <Text fontSize="sm" color="gray.600">• Use high-quality visuals</Text>
              <Text fontSize="sm" color="gray.600">• Include relevant hashtags</Text>
              <Text fontSize="sm" color="gray.600">• Consider your audience's preferences</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default SocialPostDesigner; 