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
import {FiType, FiUpload} from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface LogoCreatorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const LogoCreator: React.FC<LogoCreatorProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    brand_name: '',
    style: 'modern',
    industry: '',
    slogan: '',
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
        brand_name: form.brand_name,
        style: form.style,
        industry: form.industry,
        slogan: form.slogan,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a ${form.style} logo for ${form.brand_name}${form.industry ? ` in the ${form.industry} industry` : ''}${form.slogan ? ` with the slogan "${form.slogan}"` : ''}. ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'logo',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Logo generation request submitted successfully! Check the status in your requests.');
      setForm({
        brand_name: '',
        style: 'modern',
        industry: '',
        slogan: '',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating logo:', err);
      setError(err.response?.data?.detail || 'Failed to generate logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiType size={24} />
            <Heading size="md">Logo Creator</Heading>
          </HStack>
          
          <Text color="gray.600">
            Design a professional logo for your brand with AI assistance.
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
                  <FormLabel>Brand Name</FormLabel>
                  <Input
                    name="brand_name"
                    value={form.brand_name}
                    onChange={handleInputChange}
                    placeholder="Enter your brand name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Logo Style</FormLabel>
                  <Select
                    name="style"
                    value={form.style}
                    onChange={handleInputChange}
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="playful">Playful</option>
                    <option value="elegant">Elegant</option>
                    <option value="bold">Bold</option>
                    <option value="tech">Tech</option>
                    <option value="organic">Organic</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Industry</FormLabel>
                  <Input
                    name="industry"
                    value={form.industry}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Healthcare, Food"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Slogan (Optional)</FormLabel>
                  <Input
                    name="slogan"
                    value={form.slogan}
                    onChange={handleInputChange}
                    placeholder="Your brand slogan"
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
                  Using a brand profile will apply your brand colors and style to the logo.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements, symbols, or elements you'd like to include..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                variant="brandSolid"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Logo..."
                w="full"
              >
                Generate Logo
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              🎨 Logo Design Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Choose a style that matches your brand personality</Text>
              <Text fontSize="sm" color="gray.600">• Consider how the logo will look at different sizes</Text>
              <Text fontSize="sm" color="gray.600">• Think about color psychology and your target audience</Text>
              <Text fontSize="sm" color="gray.600">• Mention any specific symbols or elements you want included</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default LogoCreator; 