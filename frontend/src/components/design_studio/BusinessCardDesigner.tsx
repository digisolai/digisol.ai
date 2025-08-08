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
import { FiUser, FiUpload } from 'react-icons/fi';
// import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface BusinessCardDesignerProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const BusinessCardDesigner: React.FC<BusinessCardDesignerProps> = ({ onImageGenerated }) => {
  // const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    style: 'professional',
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
        name: form.name,
        title: form.title,
        company: form.company,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: form.address,
        style: form.style,
        additional_notes: form.additional_notes,
      };

      const requestData = {
        prompt: `Create a ${form.style} business card for ${form.name}, ${form.title} at ${form.company}. Include contact information: ${form.phone}, ${form.email}, ${form.website}. ${form.additional_notes}`,
        brand_profile_id: form.brand_profile_id || undefined,
        design_type: 'business_card',
        design_parameters: designParameters
      };

      const response = await api.post('/ai-services/image-generation-requests/', requestData);
      
      setSuccess('Business card generation request submitted successfully! Check the status in your requests.');
      setForm({
        name: '',
        title: '',
        company: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        style: 'professional',
        brand_profile_id: '',
        additional_notes: '',
      });
      
      if (onImageGenerated && response.data.generated_image_url) {
        onImageGenerated(response.data.generated_image_url);
      }
    } catch (err: unknown) {
      console.error('Error generating business card:', err);
      setError(err.response?.data?.detail || 'Failed to generate business card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack>
            <FiUser size={24} />
            <Heading size="md">Business Card Designer</Heading>
          </HStack>
          
          <Text color="gray.600">
            Design professional business cards with your contact information.
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
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Job Title</FormLabel>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Marketing Director"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  name="company"
                  value={form.company}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="your.email@company.com"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Website (Optional)</FormLabel>
                  <Input
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    placeholder="www.yourcompany.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Style</FormLabel>
                  <Select
                    name="style"
                    value={form.style}
                    onChange={handleInputChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                    <option value="creative">Creative</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="bold">Bold</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Address (Optional)</FormLabel>
                <Textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Your business address"
                  rows={2}
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
                  Using a brand profile will apply your brand colors and style to the business card.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Any specific design preferences, logo placement, or additional elements..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                variant="brandSolid"
                size="lg"
                leftIcon={<FiUpload />}
                isLoading={loading}
                loadingText="Generating Business Card..."
                w="full"
              >
                Generate Business Card
              </Button>
            </VStack>
          </form>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              💼 Business Card Tips:
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">• Keep information clear and readable</Text>
              <Text fontSize="sm" color="gray.600">• Use professional fonts and colors</Text>
              <Text fontSize="sm" color="gray.600">• Include essential contact information</Text>
              <Text fontSize="sm" color="gray.600">• Consider your industry and target audience</Text>
              <Text fontSize="sm" color="gray.600">• Make sure it works in both digital and print formats</Text>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BusinessCardDesigner; 