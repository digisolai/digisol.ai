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
import {FiLayout, FiUpload} from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface BannerDesignerProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const BannerDesigner: React.FC<BannerDesignerProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    headline: '',
    body_text: '',
    cta_text: 'Learn More',
    dimensions: '1200x628',
    style: 'modern',
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
        dimensions: form.dimensions,
        cta_text: form.cta_text,
        headline: form.headline,
        body_text: form.body_text,
        style: form.style,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a ${form.style} advertising banner with dimensions ${form.dimensions}. Headline: "${form.headline}". Body text: "${form.body_text}". Include a call-to-action button with text "${form.cta_text}". ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'ad_banner',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Banner generation request submitted successfully! Check the status in your requests.');
      setForm({
        headline: '',
        body_text: '',
        cta_text: 'Learn More',
        dimensions: '1200x628',
        style: 'modern',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating banner:', err);
      setError(err.response?.data?.detail || 'Failed to generate banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiLayout size={24} />
            <Heading size="md">Banner Designer</Heading>
          </HStack>
          
          <Text color="gray.600">
            Create eye-catching advertising banners for your campaigns.
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
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Headline</FormLabel>
                  <Input
                    name="headline"
                    value={form.headline}
                    onChange={handleInputChange}
                    placeholder="Your main headline"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Dimensions</FormLabel>
                  <Select
                    name="dimensions"
                    value={form.dimensions}
                    onChange={handleInputChange}
                  >
                    <option value="1200x628">Facebook/LinkedIn (1200x628)</option>
                    <option value="1080x1080">Instagram Square (1080x1080)</option>
                    <option value="1080x1920">Instagram Story (1080x1920)</option>
                    <option value="1200x675">Twitter (1200x675)</option>
                    <option value="728x90">Google Display (728x90)</option>
                    <option value="300x250">Google Display (300x250)</option>
                    <option value="160x600">Google Display (160x600)</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Body Text</FormLabel>
                <Textarea
                  name="body_text"
                  value={form.body_text}
                  onChange={handleInputChange}
                  placeholder="Supporting text that explains your offer or message"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Call-to-Action Text</FormLabel>
                  <Input
                    name="cta_text"
                    value={form.cta_text}
                    onChange={handleInputChange}
                    placeholder="e.g., Learn More, Get Started, Shop Now"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Style</FormLabel>
                  <Select
                    name="style"
                    value={form.style}
                    onChange={handleInputChange}
                  >
                    <option value="modern">Modern</option>
                    <option value="bold">Bold</option>
                    <option value="elegant">Elegant</option>
                    <option value="playful">Playful</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="corporate">Corporate</option>
                    <option value="tech">Tech</option>
                  </Select>
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
                  Using a brand profile will apply your brand colors and style to the banner.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific visual elements, colors, or layout preferences..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Banner..."
                w="full"
              >
                Generate Banner
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              📢 Banner Design Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Keep headlines short and impactful</Text>
              <Text fontSize="sm" color="gray.600">• Use high contrast for better readability</Text>
              <Text fontSize="sm" color="gray.600">• Make sure text is legible at small sizes</Text>
              <Text fontSize="sm" color="gray.600">• Include a clear call-to-action</Text>
              <Text fontSize="sm" color="gray.600">• Consider the platform's requirements</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BannerDesigner; 