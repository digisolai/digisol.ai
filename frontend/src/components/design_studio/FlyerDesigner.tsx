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
import { FiUpload, FiFileText } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface FlyerDesignerProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const FlyerDesigner: React.FC<FlyerDesignerProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    event_name: '',
    event_type: 'promotional',
    date_time: '',
    location: '',
    headline: '',
    body_text: '',
    contact_info: '',
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
        event_name: form.event_name,
        event_type: form.event_type,
        date_time: form.date_time,
        location: form.location,
        headline: form.headline,
        body_text: form.body_text,
        contact_info: form.contact_info,
        style: form.style,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a ${form.style} promotional flyer for ${form.event_name} (${form.event_type}). Event: ${form.headline}. Date/Time: ${form.date_time}. Location: ${form.location}. Details: ${form.body_text}. Contact: ${form.contact_info}. ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'flyer',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Flyer generation request submitted successfully! Check the status in your requests.');
      setForm({
        event_name: '',
        event_type: 'promotional',
        date_time: '',
        location: '',
        headline: '',
        body_text: '',
        contact_info: '',
        style: 'modern',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating flyer:', err);
      setError(err.response?.data?.detail || 'Failed to generate flyer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiFileText size={24} />
            <Heading size="md">Flyer Designer</Heading>
          </HStack>
          
          <Text color="gray.600">
            Create promotional flyers for events, products, or services.
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
                  <FormLabel>Event/Product Name</FormLabel>
                  <Input
                    name="event_name"
                    value={form.event_name}
                    onChange={handleInputChange}
                    placeholder="Name of your event, product, or service"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select
                    name="event_type"
                    value={form.event_type}
                    onChange={handleInputChange}
                  >
                    <option value="promotional">Promotional</option>
                    <option value="event">Event</option>
                    <option value="product">Product Launch</option>
                    <option value="service">Service</option>
                    <option value="sale">Sale/Discount</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Date & Time</FormLabel>
                  <Input
                    name="date_time"
                    value={form.date_time}
                    onChange={handleInputChange}
                    placeholder="e.g., March 15, 2024 at 2:00 PM"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="Event location or venue"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Headline</FormLabel>
                <Input
                  name="headline"
                  value={form.headline}
                  onChange={handleInputChange}
                  placeholder="Main headline or tagline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Body Text</FormLabel>
                <Textarea
                  name="body_text"
                  value={form.body_text}
                  onChange={handleInputChange}
                  placeholder="Detailed description, benefits, or event details..."
                  rows={4}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Contact Information</FormLabel>
                  <Input
                    name="contact_info"
                    value={form.contact_info}
                    onChange={handleInputChange}
                    placeholder="Phone, email, website, or social media"
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
                    <option value="creative">Creative</option>
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
                  Using a brand profile will apply your brand colors and style to the flyer.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific visual elements, colors, or design preferences..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Flyer..."
                w="full"
              >
                Generate Flyer
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              📄 Flyer Design Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Use a clear hierarchy with headline, body, and contact info</Text>
              <Text fontSize="sm" color="gray.600">• Include a strong call-to-action</Text>
              <Text fontSize="sm" color="gray.600">• Make sure text is readable at a distance</Text>
              <Text fontSize="sm" color="gray.600">• Use high contrast for better visibility</Text>
              <Text fontSize="sm" color="gray.600">• Consider both digital and print formats</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default FlyerDesigner; 