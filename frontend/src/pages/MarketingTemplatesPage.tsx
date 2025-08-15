import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Button,
  Input,
  Select,
  HStack,
  VStack,

  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  Switch,
  FormHelperText,
  useToast,
  IconButton,
  Tooltip,

  Divider,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import {FiPlus, FiCopy, FiFileText, FiEdit, FiTrash2, FiEye, FiDownload, FiShare2, FiSearch, FiFilter} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import { PageLayout, SectionCard, SideCard } from '../components/PageLayout';
import { AIAgentSection } from '../components/AIAgentSection';
import api from '../services/api';
// import { useAuth } from '../hooks/useAuth';
import type { AIProfile } from '../types/ai';

interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  is_global: boolean;
}

interface MarketingTemplate {
  id: string;
  name: string;
  template_type: string;
  template_type_display: string;
  category_name?: string;
  preview_image_url?: string;
  is_global: boolean;
  created_by_name?: string;
  created_at: string;
  content_json: unknown;
}

const TEMPLATE_TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Post' },
  { value: 'ad_creative', label: 'Ad Creative' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'other', label: 'Other' },
];

export const MarketingTemplatesPage: React.FC = () => {
  // const { user } = useAuth();
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showGlobalOnly, setShowGlobalOnly] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [formaAgent, setFormaAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    template_type: 'email',
    content_json: '',
    preview_image_url: '',
    is_global: false,
  });

  // Fetch templates and categories
  useEffect(() => {
    fetchData();
    fetchFormaAgent();
  }, []);

  async function fetchFormaAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=template_curation&is_global=true');
      if (res.data && res.data.length > 0) {
        setFormaAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setFormaAgent({
          id: "forma",
          name: "Forma",
          specialization: "template_curation",
          personality_description: "Structured, versatile, and efficiency-focused. Forma helps you find, customize, and create perfect templates for any marketing need.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Forma agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setFormaAgent({
        id: "forma",
        name: "Forma",
        specialization: "template_curation",
        personality_description: "Structured, versatile, and efficiency-focused. Forma helps you find, customize, and create perfect templates for any marketing need.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskForma = () => {
    toast({
      title: "Forma is curating your templates",
      description: "This will open a chat interface with Forma to discuss template curation!",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const categoriesResponse = await api.get('/marketing-templates/categories/');
      setCategories(categoriesResponse.data);

      // Fetch templates
      const templatesResponse = await api.get('/marketing-templates/templates/');
      setTemplates(templatesResponse.data);
    } catch (err: unknown) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
      toast({
        title: 'Error',
        description: 'Failed to load templates and categories',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category_name === selectedCategory;
    const matchesType = !selectedType || template.template_type === selectedType;
    const matchesGlobal = !showGlobalOnly || template.is_global;

    return matchesSearch && matchesCategory && matchesType && matchesGlobal;
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Parse content_json if it's a string
      let parsedContent: unknown = formData.content_json;
      if (typeof formData.content_json === 'string') {
        try {
          parsedContent = JSON.parse(formData.content_json);
        } catch {
          // If it's not valid JSON, treat it as plain text
          parsedContent = { text_content: formData.content_json };
        }
      }

      const templateData = {
        ...formData,
        content_json: parsedContent,
        category: formData.category || null,
      };

      if (editingTemplate) {
        // Update existing template
        await api.patch(`/marketing-templates/templates/${editingTemplate.id}/`, templateData);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new template
        await api.post('/marketing-templates/templates/', templateData);
        toast({
          title: 'Success',
          description: 'Template created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchData(); // Refresh the list
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.detail || 'Failed to save template';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle template deletion
  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await api.delete(`/marketing-templates/templates/${templateId}/`);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData(); // Refresh the list
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle template duplication
  const handleDuplicate = async (templateId: string) => {
    try {
      await api.post(`/marketing-templates/templates/${templateId}/duplicate/`);
      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData(); // Refresh the list
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open modal for creating new template
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: '',
      template_type: 'email',
      content_json: '',
      preview_image_url: '',
      is_global: false,
    });
    onOpen();
  };

  // Open modal for editing template
  const handleEdit = (template: MarketingTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category_name || '',
      template_type: template.template_type,
      content_json: JSON.stringify(template.content_json, null, 2),
      preview_image_url: template.preview_image_url || '',
      is_global: template.is_global,
    });
    onOpen();
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PageLayout
        title="Marketing Templates"
        leftColumn={
          <AIAgentSection
            agent={formaAgent}
            loading={loadingAgent}
            error={agentError}
            onAskQuestion={handleAskForma}
          />
        }
        centerColumn={
          <SectionCard
            title="Template Gallery"
            actionButton={
              <Button
                leftIcon={<FiPlus />}
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.700" }}
                onClick={handleCreateNew}
              >
                Create New Template
              </Button>
            }
          >
            {/* Filters */}
            <Card mb={6} variant="outline">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <Box flex={1}>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        <FiSearch style={{ display: 'inline', marginRight: '4px' }} />
                        Search Templates
                      </FormLabel>
                      <Input
                        placeholder="Search by template name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Box>
                    <Box flex={1}>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        <FiFilter style={{ display: 'inline', marginRight: '4px' }} />
                        Category
                      </FormLabel>
                      <Select
                        placeholder="All Categories"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box flex={1}>
                      <FormLabel fontSize="sm" fontWeight="medium">Template Type</FormLabel>
                      <Select
                        placeholder="All Types"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        {TEMPLATE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Global Templates</FormLabel>
                      <Switch
                        isChecked={showGlobalOnly}
                        onChange={(e) => setShowGlobalOnly(e.target.checked)}
                        colorScheme="brand.primary"
                      />
                      <FormHelperText>Show global templates only</FormHelperText>
                    </FormControl>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <Box
                border="2px dashed"
                borderColor="brand.accent"
                borderRadius="lg"
                p={16}
                textAlign="center"
                bg="brand.neutral.50"
                color="brand.neutral.300"
                fontSize="xl"
                fontWeight="bold"
                minH="300px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiFileText} boxSize={16} mb={4} color="brand.primary" />
                <Text fontSize="2xl" mb={2} color="brand.primary">Create Your First Template</Text>
                <Text fontSize="md" color="brand.neutral.400">
                  Start building your template library to streamline your marketing efforts.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredTemplates.map((template) => (
                  <Card key={template.id} shadow="md" _hover={{ shadow: 'lg' }}>
                    {template.preview_image_url && (
                      <Image
                        src={template.preview_image_url}
                        alt={template.name}
                        height="200px"
                        objectFit="cover"
                        borderTopRadius="md"
                      />
                    )}
                    <CardHeader pb={2}>
                      <VStack align="start" spacing={2}>
                        <Heading size="md" noOfLines={2}>
                          {template.name}
                        </Heading>
                        <HStack spacing={2}>
                          <Badge colorScheme="brand.primary" variant="subtle">
                            {template.template_type_display}
                          </Badge>
                          {template.is_global && (
                            <Badge colorScheme="green" variant="subtle">
                              Global
                            </Badge>
                          )}
                        </HStack>
                        {template.category_name && (
                          <Text fontSize="sm" color="gray.600">
                            {template.category_name}
                          </Text>
                        )}
                      </VStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack align="start" spacing={3}>
                        <Text fontSize="sm" color="gray.500">
                          Created by {template.created_by_name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(template.created_at).toLocaleDateString()}
                        </Text>
                        <Divider />
                        <HStack spacing={2} width="full">
                          <Tooltip label="View/Edit Template">
                            <IconButton
                              aria-label="Edit template"
                              icon={<FiEdit />}
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                              flex={1}
                            />
                          </Tooltip>
                          <Tooltip label="Duplicate Template">
                            <IconButton
                              aria-label="Duplicate template"
                              icon={<FiCopy />}
                              size="sm"
                              variant="outline"
                              onClick={() => handleDuplicate(template.id)}
                              flex={1}
                            />
                          </Tooltip>
                          <Tooltip label="Delete Template">
                            <IconButton
                              aria-label="Delete template"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => handleDelete(template.id)}
                              flex={1}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </SectionCard>
        }
        rightColumn={
          <>
            <SideCard title="Quick Actions">
              <VStack spacing={4}>
                <Button
                  leftIcon={<FiPlus />}
                  bg="brand.primary"
                  color="brand.accent"
                  fontWeight="bold"
                  _hover={{ bg: "brand.600" }}
                  _active={{ bg: "brand.700" }}
                  size="lg"
                  width="full"
                  onClick={handleCreateNew}
                >
                  Create Template
                </Button>
                <Button
                  leftIcon={<FiCopy />}
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  Import Templates
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  Browse Categories
                </Button>
              </VStack>
            </SideCard>

            <SideCard title="Template Stats">
              <StatGroup>
                <Stat>
                  <StatLabel fontSize="xs">Total</StatLabel>
                  <StatNumber fontSize="lg">{templates.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="xs">Global</StatLabel>
                  <StatNumber fontSize="lg">{templates.filter(t => t.is_global).length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="xs">Custom</StatLabel>
                  <StatNumber fontSize="lg">{templates.filter(t => !t.is_global).length}</StatNumber>
                </Stat>
              </StatGroup>
            </SideCard>
          </>
        }
        showLeftColumn={!!formaAgent}
      />

      {/* Create/Edit Template Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Select category (optional)"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Template Type</FormLabel>
                <Select
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                >
                  {TEMPLATE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Preview Image URL</FormLabel>
                <Input
                  value={formData.preview_image_url}
                  onChange={(e) => setFormData({ ...formData, preview_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Content (JSON)</FormLabel>
                <Textarea
                  value={formData.content_json}
                  onChange={(e) => setFormData({ ...formData, content_json: e.target.value })}
                  placeholder='{"html_content": "<h1>Hello World</h1>", "text_content": "Hello World"}'
                  rows={8}
                  fontFamily="mono"
                />
                <FormHelperText>
                  Enter the template content as JSON. For email templates, include "html_content" and "text_content" fields.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Global Template</FormLabel>
                <Checkbox
                  isChecked={formData.is_global}
                  onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                >
                  Make this template available to all tenants
                </Checkbox>
                <FormHelperText>
                  Only superusers and tenant admins can create global templates.
                </FormHelperText>
              </FormControl>

              <HStack spacing={4} width="full" pt={4}>
                <Button
                  onClick={onClose}
                  variant="outline"
                  flex={1}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  colorScheme="brand.primary"
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: "brand.primary" }}
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                  flex={1}
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default MarketingTemplatesPage; 