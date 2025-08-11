import {useEffect, useState, useRef} from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Image,
  Badge,

  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  Grid,
  GridItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { 
  FiImage, 
  FiUpload, 
  FiSave, 
  FiRefreshCw, 
  FiMonitor, 
  FiSmartphone, 
  FiTablet,
  FiInfo,
  FiX,
  FiSettings,
  FiDroplet,
  FiLayout,
  FiCode,
  FiGlobe
} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import ContextualAIChat from "../components/ContextualAIChat";
import TagInput from "../components/TagInput";
import ColorInput from "../components/ColorInput";
import api from "../services/api";
import type { AIProfile } from "../types/ai";
import { useTheme } from "../hooks/useTheme";

interface BrandingConfig {
  // Section 1: Branding Overview & Status
  tenant_name: string;
  tenant_id?: string;
  branding_status: 'active' | 'pending' | 'not_configured';
  last_updated?: string;
  last_updated_by?: string;

  // Section 2: Core Visual Identity
  main_logo_url?: string;
  dark_mode_logo_url?: string;
  favicon_url?: string;
  app_icon_url?: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  link_color: string;
  font_family: string;
  base_font_size: number;
  headings_font_family: string;
  font_weights: string[];

  // Section 3: Interface Elements & Layout
  nav_bar_bg_color: string;
  nav_bar_text_color: string;
  nav_bar_active_color: string;
  button_primary_bg: string;
  button_primary_text: string;
  button_primary_border_radius: number;
  button_primary_hover_bg: string;
  button_secondary_bg: string;
  button_secondary_text: string;
  button_secondary_border_radius: number;
  input_border_color: string;
  input_bg_color: string;
  input_focus_color: string;
  input_border_radius: number;
  scrollbar_thumb_color: string;
  scrollbar_track_color: string;

  // Section 4: Advanced Branding & Customization
  custom_css?: string;
  custom_js?: string;
  custom_css_enabled: boolean;
  custom_js_enabled: boolean;
  landing_page_bg_image?: string;
  landing_page_overlay_color: string;
  landing_page_overlay_opacity: number;
  landing_page_welcome_message?: string;
  landing_page_footer_text?: string;
  email_header_logo?: string;
  email_primary_color: string;
  email_footer_text?: string;
}

export default function BrandHubPage() {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    tenant_name: "DigiSol.AI",
    branding_status: 'not_configured',
    primary_color: "#1F4287",
    secondary_color: "#FFC300",
    background_color: "#FFFFFF",
    primary_text_color: "#1A202C",
    secondary_text_color: "#718096",
    link_color: "#3182CE",
    font_family: "Inter",
    base_font_size: 16,
    headings_font_family: "Inter",
    font_weights: ["400", "500", "600", "700"],
    nav_bar_bg_color: "#FFFFFF",
    nav_bar_text_color: "#1A202C",
    nav_bar_active_color: "#1F4287",
    button_primary_bg: "#1F4287",
    button_primary_text: "#FFFFFF",
    button_primary_border_radius: 8,
    button_primary_hover_bg: "#1A365D",
    button_secondary_bg: "#E2E8F0",
    button_secondary_text: "#1A202C",
    button_secondary_border_radius: 8,
    input_border_color: "#E2E8F0",
    input_bg_color: "#FFFFFF",
    input_focus_color: "#1F4287",
    input_border_radius: 8,
    scrollbar_thumb_color: "#CBD5E0",
    scrollbar_track_color: "#F7FAFC",
    custom_css_enabled: false,
    custom_js_enabled: false,
    landing_page_overlay_color: "#000000",
    landing_page_overlay_opacity: 0.5,
    email_primary_color: "#1F4287"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconaAgent, setIconaAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'web' | 'mobile' | 'tablet'>('web');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // State for Icona Chat Modal
  const { isOpen: isIconaChatOpen, onOpen: onIconaChatOpen, onClose: onIconaChatClose } = useDisclosure();
  const [askIconaQuestion, setAskIconaQuestion] = useState("");
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const toast = useToast();
  const { updateTheme } = useTheme();

  // Font options
  const fontOptions = [
    "Inter", "Roboto", "Open Sans", "Poppins", "Montserrat", 
    "Playfair Display", "Merriweather", "Source Sans Pro", "Lato", "Nunito",
    "Arial", "Helvetica", "Georgia", "Times New Roman", "Verdana"
  ];

  useEffect(() => {
    fetchBrandingData();
    fetchIconaAgent();
  }, []);

  async function fetchIconaAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=brand_identity&is_global=true');
      if (res.data && res.data.length > 0) {
        setIconaAgent(res.data[0]);
      } else {
        setIconaAgent({
          id: "icona",
          name: "Icona",
          specialization: "brand_identity",
          personality_description: "Creative, visually-driven, and brand-conscious. Icona helps you develop and maintain a cohesive brand identity across all touchpoints.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Icona agent:", err);
      setAgentError("Failed to load AI assistant");
      setIconaAgent({
        id: "icona",
        name: "Icona",
        specialization: "brand_identity",
        personality_description: "Creative, visually-driven, and brand-conscious. Icona helps you develop and maintain a cohesive brand identity across all touchpoints.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskIcona = (question: string) => {
    setAskIconaQuestion(question);
    onIconaChatOpen();
  };

  async function fetchBrandingData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch branding configuration
      const brandingRes = await api.get("/core/brand-profiles/");
      if (brandingRes.data) {
        const data = brandingRes.data;
        setBrandingConfig(prev => ({
          ...prev,
          tenant_name: data.name || "DigiSol.AI",
          tenant_id: data.tenant,
          branding_status: data.branding_status || 'not_configured',
          last_updated: data.updated_at,
          last_updated_by: data.last_updated_by_name,
          
          // Core Visual Identity
          main_logo_url: data.logo_url,
          dark_mode_logo_url: data.dark_mode_logo_url,
          favicon_url: data.favicon_url,
          app_icon_url: data.app_icon_url,
          primary_color: data.primary_color || "#1F4287",
          secondary_color: data.secondary_color || "#FFC300",
          background_color: data.background_color || "#FFFFFF",
          primary_text_color: data.primary_text_color || "#1A202C",
          secondary_text_color: data.secondary_text_color || "#718096",
          link_color: data.link_color || "#3182CE",
          font_family: data.font_family || "Inter",
          base_font_size: data.base_font_size || 16,
          headings_font_family: data.headings_font_family || "Inter",
          font_weights: data.font_weights || ["400", "500", "600", "700"],
          
          // Interface Elements
          nav_bar_bg_color: data.nav_bar_bg_color || "#FFFFFF",
          nav_bar_text_color: data.nav_bar_text_color || "#1A202C",
          nav_bar_active_color: data.nav_bar_active_color || "#1F4287",
          button_primary_bg: data.button_primary_bg || "#1F4287",
          button_primary_text: data.button_primary_text || "#FFFFFF",
          button_primary_border_radius: data.button_primary_border_radius || 8,
          button_primary_hover_bg: data.button_primary_hover_bg || "#1A365D",
          button_secondary_bg: data.button_secondary_bg || "#E2E8F0",
          button_secondary_text: data.button_secondary_text || "#1A202C",
          button_secondary_border_radius: data.button_secondary_border_radius || 8,
          input_border_color: data.input_border_color || "#E2E8F0",
          input_bg_color: data.input_bg_color || "#FFFFFF",
          input_focus_color: data.input_focus_color || "#1F4287",
          input_border_radius: data.input_border_radius || 8,
          scrollbar_thumb_color: data.scrollbar_thumb_color || "#CBD5E0",
          scrollbar_track_color: data.scrollbar_track_color || "#F7FAFC",
          
          // Advanced Branding
          custom_css: data.custom_css,
          custom_js: data.custom_js,
          custom_css_enabled: data.custom_css_enabled || false,
          custom_js_enabled: data.custom_js_enabled || false,
          landing_page_bg_image: data.landing_page_bg_image,
          landing_page_overlay_color: data.landing_page_overlay_color || "#000000",
          landing_page_overlay_opacity: data.landing_page_overlay_opacity || 0.5,
          landing_page_welcome_message: data.landing_page_welcome_message,
          landing_page_footer_text: data.landing_page_footer_text,
          email_header_logo: data.email_header_logo,
          email_primary_color: data.email_primary_color || "#1F4287",
          email_footer_text: data.email_footer_text
        }));
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load branding data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleConfigChange = (key: keyof BrandingConfig, value: unknown) => {
    setBrandingConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = {
        // Basic brand information
        name: brandingConfig.tenant_name,
        
        // Core Visual Identity
        logo_url: brandingConfig.main_logo_url,
        dark_mode_logo_url: brandingConfig.dark_mode_logo_url,
        favicon_url: brandingConfig.favicon_url,
        app_icon_url: brandingConfig.app_icon_url,
        primary_color: brandingConfig.primary_color,
        secondary_color: brandingConfig.secondary_color,
        background_color: brandingConfig.background_color,
        primary_text_color: brandingConfig.primary_text_color,
        secondary_text_color: brandingConfig.secondary_text_color,
        link_color: brandingConfig.link_color,
        font_family: brandingConfig.font_family,
        base_font_size: brandingConfig.base_font_size,
        headings_font_family: brandingConfig.headings_font_family,
        font_weights: brandingConfig.font_weights,
        
        // Interface Elements
        nav_bar_bg_color: brandingConfig.nav_bar_bg_color,
        nav_bar_text_color: brandingConfig.nav_bar_text_color,
        nav_bar_active_color: brandingConfig.nav_bar_active_color,
        button_primary_bg: brandingConfig.button_primary_bg,
        button_primary_text: brandingConfig.button_primary_text,
        button_primary_border_radius: brandingConfig.button_primary_border_radius,
        button_primary_hover_bg: brandingConfig.button_primary_hover_bg,
        button_secondary_bg: brandingConfig.button_secondary_bg,
        button_secondary_text: brandingConfig.button_secondary_text,
        button_secondary_border_radius: brandingConfig.button_secondary_border_radius,
        input_border_color: brandingConfig.input_border_color,
        input_bg_color: brandingConfig.input_bg_color,
        input_focus_color: brandingConfig.input_focus_color,
        input_border_radius: brandingConfig.input_border_radius,
        scrollbar_thumb_color: brandingConfig.scrollbar_thumb_color,
        scrollbar_track_color: brandingConfig.scrollbar_track_color,
        
        // Advanced Branding
        custom_css: brandingConfig.custom_css,
        custom_js: brandingConfig.custom_js,
        custom_css_enabled: brandingConfig.custom_css_enabled,
        custom_js_enabled: brandingConfig.custom_js_enabled,
        landing_page_bg_image: brandingConfig.landing_page_bg_image,
        landing_page_overlay_color: brandingConfig.landing_page_overlay_color,
        landing_page_overlay_opacity: brandingConfig.landing_page_overlay_opacity,
        landing_page_welcome_message: brandingConfig.landing_page_welcome_message,
        landing_page_footer_text: brandingConfig.landing_page_footer_text,
        email_header_logo: brandingConfig.email_header_logo,
        email_primary_color: brandingConfig.email_primary_color,
        email_footer_text: brandingConfig.email_footer_text
      };

      await api.post('/core/brand-profiles/', formData);
      
      toast({ 
        title: "Branding Saved", 
        description: "Your branding configuration has been saved successfully.", 
        status: "success", 
        duration: 5000, 
        isClosable: true 
      });

      setHasUnsavedChanges(false);
      
      // Update theme
      updateTheme({
        primary_color: brandingConfig.primary_color,
        accent_color: brandingConfig.secondary_color,
        header_font: brandingConfig.font_family,
        body_font: brandingConfig.font_family,
        brand_name: brandingConfig.tenant_name,
        logo_url: brandingConfig.main_logo_url || '',
      });

    } catch (err: unknown) {
      console.error("Error saving branding:", err);
      toast({
        title: "Error",
        description: "Failed to save branding configuration. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setBrandingConfig({
      tenant_name: "DigiSol.AI",
      branding_status: 'not_configured',
      primary_color: "#1F4287",
      secondary_color: "#FFC300",
      background_color: "#FFFFFF",
      primary_text_color: "#1A202C",
      secondary_text_color: "#718096",
      link_color: "#3182CE",
      font_family: "Inter",
      base_font_size: 16,
      headings_font_family: "Inter",
      font_weights: ["400", "500", "600", "700"],
      nav_bar_bg_color: "#FFFFFF",
      nav_bar_text_color: "#1A202C",
      nav_bar_active_color: "#1F4287",
      button_primary_bg: "#1F4287",
      button_primary_text: "#FFFFFF",
      button_primary_border_radius: 8,
      button_primary_hover_bg: "#1A365D",
      button_secondary_bg: "#E2E8F0",
      button_secondary_text: "#1A202C",
      button_secondary_border_radius: 8,
      input_border_color: "#E2E8F0",
      input_bg_color: "#FFFFFF",
      input_focus_color: "#1F4287",
      input_border_radius: 8,
      scrollbar_thumb_color: "#CBD5E0",
      scrollbar_track_color: "#F7FAFC",
      custom_css_enabled: false,
      custom_js_enabled: false,
      landing_page_overlay_color: "#000000",
      landing_page_overlay_opacity: 0.5,
      email_primary_color: "#1F4287"
    });
    setHasUnsavedChanges(true);
    setShowResetDialog(false);
  };

  const handleDiscardChanges = () => {
    fetchBrandingData();
    setHasUnsavedChanges(false);
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
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" className="text-brand-primary" mb={6}>
          <HStack>
            <FiDroplet />
            <Text>Branding & Visual Identity</Text>
          </HStack>
        </Heading>

        {/* Icona AI Agent Section */}
        <AIAgentSection
          agent={iconaAgent}
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskIcona}
        />

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Main Configuration Area */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Section 1: Branding Overview & Status */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">Branding Overview</Heading>
                    <HStack spacing={2}>
                      <Badge 
                        colorScheme={brandingConfig.branding_status === 'active' ? 'green' : 
                                   brandingConfig.branding_status === 'pending' ? 'yellow' : 'gray'}
                      >
                        {brandingConfig.branding_status === 'active' ? 'Active' : 
                         brandingConfig.branding_status === 'pending' ? 'Pending' : 'Not Configured'}
                      </Badge>
                      <Button
                        leftIcon={<FiGlobe />}
                        size="sm"
                        variant="brand"
                      >
                        View Live App
                      </Button>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Tenant Name</FormLabel>
                      <Input
                        value={brandingConfig.tenant_name}
                        onChange={(e) => handleConfigChange('tenant_name', e.target.value)}
                        placeholder="Enter tenant name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Last Updated</FormLabel>
                      <Input
                        value={brandingConfig.last_updated || "Never"}
                        isReadOnly
                        bg="gray.50"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Main Configuration Tabs */}
              <Card>
                <CardBody p={0}>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab><HStack><FiImage /><Text>Visual Identity</Text></HStack></Tab>
                      <Tab><HStack><FiLayout /><Text>Interface</Text></HStack></Tab>
                      <Tab><HStack><FiCode /><Text>Advanced</Text></HStack></Tab>
                    </TabList>

                    <TabPanels>
                      {/* Visual Identity Tab */}
                      <TabPanel>
                        <VStack spacing={6} align="stretch">
                          {/* Logo Management */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Logo Management</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel>Main Logo</FormLabel>
                                <Box
                                  border="2px dashed"
                                  borderColor="gray.300"
                                  borderRadius="md"
                                  p={6}
                                  textAlign="center"
                                  cursor="pointer"
                                  _hover={{ borderColor: "brand.primary" }}
                                >
                                  {brandingConfig.main_logo_url ? (
                                    <VStack>
                                      <Image 
                                        src={brandingConfig.main_logo_url} 
                                        alt="Main Logo" 
                                        maxH="100px" 
                                        objectFit="contain"
                                      />
                                      <Button size="sm" variant="brand">Replace Logo</Button>
                                    </VStack>
                                  ) : (
                                    <VStack>
                                      <FiUpload size={24} />
                                      <Text>Upload Main Logo</Text>
                                      <Text fontSize="sm" color="gray.500">
                                        PNG, SVG | Max 2MB | 200x50px
                                      </Text>
                                    </VStack>
                                  )}
                                </Box>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Dark Mode Logo (Optional)</FormLabel>
                                <Box
                                  border="2px dashed"
                                  borderColor="gray.300"
                                  borderRadius="md"
                                  p={6}
                                  textAlign="center"
                                  cursor="pointer"
                                  _hover={{ borderColor: "brand.primary" }}
                                >
                                  {brandingConfig.dark_mode_logo_url ? (
                                    <VStack>
                                      <Image 
                                        src={brandingConfig.dark_mode_logo_url} 
                                        alt="Dark Mode Logo" 
                                        maxH="100px" 
                                        objectFit="contain"
                                      />
                                      <Button size="sm" variant="brand">Replace Logo</Button>
                                    </VStack>
                                  ) : (
                                    <VStack>
                                      <FiUpload size={24} />
                                      <Text>Upload Dark Mode Logo</Text>
                                      <Text fontSize="sm" color="gray.500">
                                        PNG, SVG | Max 2MB | 200x50px
                                      </Text>
                                    </VStack>
                                  )}
                                </Box>
                              </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <FormControl>
                                <FormLabel>Favicon</FormLabel>
                                <Box
                                  border="2px dashed"
                                  borderColor="gray.300"
                                  borderRadius="md"
                                  p={4}
                                  textAlign="center"
                                  cursor="pointer"
                                  _hover={{ borderColor: "brand.primary" }}
                                >
                                  <VStack>
                                    <FiUpload size={20} />
                                    <Text fontSize="sm">Upload Favicon</Text>
                                    <Text fontSize="xs" color="gray.500">
                                      ICO, PNG | 32x32px
                                    </Text>
                                  </VStack>
                                </Box>
                              </FormControl>

                              <FormControl>
                                <FormLabel>App Icon</FormLabel>
                                <Box
                                  border="2px dashed"
                                  borderColor="gray.300"
                                  borderRadius="md"
                                  p={4}
                                  textAlign="center"
                                  cursor="pointer"
                                  _hover={{ borderColor: "brand.primary" }}
                                >
                                  <VStack>
                                    <FiUpload size={20} />
                                    <Text fontSize="sm">Upload App Icon</Text>
                                    <Text fontSize="xs" color="gray.500">
                                      PNG | Various sizes
                                    </Text>
                                  </VStack>
                                </Box>
                              </FormControl>
                            </SimpleGrid>
                          </Box>

                          {/* Color Palette */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Color Palette</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <ColorInput
                                label="Primary Color"
                                value={brandingConfig.primary_color}
                                onChange={(value) => handleConfigChange('primary_color', value)}
                                isRequired
                              />
                              <ColorInput
                                label="Secondary Color"
                                value={brandingConfig.secondary_color}
                                onChange={(value) => handleConfigChange('secondary_color', value)}
                                isRequired
                              />
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <ColorInput
                                label="Background Color"
                                value={brandingConfig.background_color}
                                onChange={(value) => handleConfigChange('background_color', value)}
                              />
                              <ColorInput
                                label="Primary Text Color"
                                value={brandingConfig.primary_text_color}
                                onChange={(value) => handleConfigChange('primary_text_color', value)}
                              />
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <ColorInput
                                label="Secondary Text Color"
                                value={brandingConfig.secondary_text_color}
                                onChange={(value) => handleConfigChange('secondary_text_color', value)}
                              />
                              <ColorInput
                                label="Link Color"
                                value={brandingConfig.link_color}
                                onChange={(value) => handleConfigChange('link_color', value)}
                              />
                            </SimpleGrid>
                          </Box>

                          {/* Typography */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Typography</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel>Font Family</FormLabel>
                                <Select
                                  value={brandingConfig.font_family}
                                  onChange={(e) => handleConfigChange('font_family', e.target.value)}
                                >
                                  {fontOptions.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Base Font Size</FormLabel>
                                <HStack>
                                  <Slider
                                    value={brandingConfig.base_font_size}
                                    onChange={(value) => handleConfigChange('base_font_size', value)}
                                    min={12}
                                    max={24}
                                    step={1}
                                  >
                                    <SliderTrack>
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                  </Slider>
                                  <Text w="40px" textAlign="center">{brandingConfig.base_font_size}px</Text>
                                </HStack>
                              </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <FormControl>
                                <FormLabel>Headings Font Family</FormLabel>
                                <Select
                                  value={brandingConfig.headings_font_family}
                                  onChange={(e) => handleConfigChange('headings_font_family', e.target.value)}
                                >
                                  {fontOptions.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                  ))}
                                </Select>
                              </FormControl>

                                                             <FormControl>
                                 <FormLabel>Font Weights</FormLabel>
                                 <TagInput
                                   label="Font Weights"
                                   value={brandingConfig.font_weights}
                                   onChange={(weights) => handleConfigChange('font_weights', weights)}
                                   placeholder="Add font weights (e.g., 400, 500, 600)"
                                 />
                               </FormControl>
                            </SimpleGrid>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Interface Elements Tab */}
                      <TabPanel>
                        <VStack spacing={6} align="stretch">
                          {/* Navigation Bar Styling */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Navigation Bar</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <ColorInput
                                label="Background Color"
                                value={brandingConfig.nav_bar_bg_color}
                                onChange={(value) => handleConfigChange('nav_bar_bg_color', value)}
                              />
                              <ColorInput
                                label="Text Color"
                                value={brandingConfig.nav_bar_text_color}
                                onChange={(value) => handleConfigChange('nav_bar_text_color', value)}
                              />
                            </SimpleGrid>
                            <ColorInput
                              label="Active Item Color"
                              value={brandingConfig.nav_bar_active_color}
                              onChange={(value) => handleConfigChange('nav_bar_active_color', value)}
                            />
                          </Box>

                          {/* Button Styling */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Button Styling</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <ColorInput
                                label="Primary Button Background"
                                value={brandingConfig.button_primary_bg}
                                onChange={(value) => handleConfigChange('button_primary_bg', value)}
                              />
                              <ColorInput
                                label="Primary Button Text"
                                value={brandingConfig.button_primary_text}
                                onChange={(value) => handleConfigChange('button_primary_text', value)}
                              />
                            </SimpleGrid>
                            <FormControl mt={4}>
                              <FormLabel>Primary Button Border Radius</FormLabel>
                              <HStack>
                                <Slider
                                  value={brandingConfig.button_primary_border_radius}
                                  onChange={(value) => handleConfigChange('button_primary_border_radius', value)}
                                  min={0}
                                  max={50}
                                  step={1}
                                >
                                  <SliderTrack>
                                    <SliderFilledTrack />
                                  </SliderTrack>
                                  <SliderThumb />
                                </Slider>
                                <Text w="40px" textAlign="center">{brandingConfig.button_primary_border_radius}px</Text>
                              </HStack>
                            </FormControl>
                            <ColorInput
                              label="Primary Button Hover Background"
                              value={brandingConfig.button_primary_hover_bg}
                              onChange={(value) => handleConfigChange('button_primary_hover_bg', value)}
                            />
                          </Box>

                          {/* Input Field Styling */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Input Fields</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <ColorInput
                                label="Border Color"
                                value={brandingConfig.input_border_color}
                                onChange={(value) => handleConfigChange('input_border_color', value)}
                              />
                              <ColorInput
                                label="Background Color"
                                value={brandingConfig.input_bg_color}
                                onChange={(value) => handleConfigChange('input_bg_color', value)}
                              />
                            </SimpleGrid>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <ColorInput
                                label="Focus State Color"
                                value={brandingConfig.input_focus_color}
                                onChange={(value) => handleConfigChange('input_focus_color', value)}
                              />
                              <FormControl>
                                <FormLabel>Border Radius</FormLabel>
                                <HStack>
                                  <Slider
                                    value={brandingConfig.input_border_radius}
                                    onChange={(value) => handleConfigChange('input_border_radius', value)}
                                    min={0}
                                    max={20}
                                    step={1}
                                  >
                                    <SliderTrack>
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                  </Slider>
                                  <Text w="40px" textAlign="center">{brandingConfig.input_border_radius}px</Text>
                                </HStack>
                              </FormControl>
                            </SimpleGrid>
                          </Box>

                          {/* Scrollbar Styling */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Scrollbar (Web)</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <ColorInput
                                label="Thumb Color"
                                value={brandingConfig.scrollbar_thumb_color}
                                onChange={(value) => handleConfigChange('scrollbar_thumb_color', value)}
                              />
                              <ColorInput
                                label="Track Color"
                                value={brandingConfig.scrollbar_track_color}
                                onChange={(value) => handleConfigChange('scrollbar_track_color', value)}
                              />
                            </SimpleGrid>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Advanced Tab */}
                      <TabPanel>
                        <VStack spacing={6} align="stretch">
                          {/* Custom CSS */}
                          <Box>
                            <HStack justify="space-between" mb={4}>
                              <Heading size="sm" color="brand.primary">Custom CSS</Heading>
                              <Switch
                                isChecked={brandingConfig.custom_css_enabled}
                                onChange={(e) => handleConfigChange('custom_css_enabled', e.target.checked)}
                              />
                            </HStack>
                            {brandingConfig.custom_css_enabled && (
                              <VStack align="stretch" spacing={3}>
                                <Alert status="warning" borderRadius="md">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    Use with caution! Incorrect CSS can break your application layout.
                                  </Text>
                                </Alert>
                                <Textarea
                                  value={brandingConfig.custom_css || ""}
                                  onChange={(e) => handleConfigChange('custom_css', e.target.value)}
                                  placeholder="Enter your custom CSS here..."
                                  rows={8}
                                  fontFamily="mono"
                                />
                              </VStack>
                            )}
                          </Box>

                          {/* Custom JavaScript */}
                          <Box>
                            <HStack justify="space-between" mb={4}>
                              <Heading size="sm" color="brand.primary">Custom JavaScript</Heading>
                              <Switch
                                isChecked={brandingConfig.custom_js_enabled}
                                onChange={(e) => handleConfigChange('custom_js_enabled', e.target.checked)}
                              />
                            </HStack>
                            {brandingConfig.custom_js_enabled && (
                              <VStack align="stretch" spacing={3}>
                                <Alert status="error" borderRadius="md">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    Use with extreme caution! Malicious or incorrect JavaScript can compromise security and functionality.
                                  </Text>
                                </Alert>
                                <Textarea
                                  value={brandingConfig.custom_js || ""}
                                  onChange={(e) => handleConfigChange('custom_js', e.target.value)}
                                  placeholder="Enter your custom JavaScript here..."
                                  rows={8}
                                  fontFamily="mono"
                                />
                              </VStack>
                            )}
                          </Box>

                          {/* Landing Page Customization */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Landing Page</Heading>
                            <FormControl>
                              <FormLabel>Background Image</FormLabel>
                              <Box
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                p={6}
                                textAlign="center"
                                cursor="pointer"
                                _hover={{ borderColor: "brand.primary" }}
                              >
                                <VStack>
                                  <FiUpload size={24} />
                                  <Text>Upload Background Image</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    JPG, PNG | Max 5MB
                                  </Text>
                                </VStack>
                              </Box>
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <ColorInput
                                label="Overlay Color"
                                value={brandingConfig.landing_page_overlay_color}
                                onChange={(value) => handleConfigChange('landing_page_overlay_color', value)}
                              />
                              <FormControl>
                                <FormLabel>Overlay Opacity</FormLabel>
                                <HStack>
                                  <Slider
                                    value={brandingConfig.landing_page_overlay_opacity}
                                    onChange={(value) => handleConfigChange('landing_page_overlay_opacity', value)}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                  >
                                    <SliderTrack>
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                  </Slider>
                                  <Text w="40px" textAlign="center">{brandingConfig.landing_page_overlay_opacity}</Text>
                                </HStack>
                              </FormControl>
                            </SimpleGrid>

                            <FormControl mt={4}>
                              <FormLabel>Welcome Message</FormLabel>
                              <Textarea
                                value={brandingConfig.landing_page_welcome_message || ""}
                                onChange={(e) => handleConfigChange('landing_page_welcome_message', e.target.value)}
                                placeholder="Enter your welcome message..."
                                rows={3}
                              />
                            </FormControl>

                            <FormControl mt={4}>
                              <FormLabel>Footer Text</FormLabel>
                              <Textarea
                                value={brandingConfig.landing_page_footer_text || ""}
                                onChange={(e) => handleConfigChange('landing_page_footer_text', e.target.value)}
                                placeholder="Enter footer text..."
                                rows={2}
                              />
                            </FormControl>
                          </Box>

                          {/* Email Template Branding */}
                          <Box>
                            <Heading size="sm" color="brand.primary" mb={4}>Email Templates</Heading>
                            <FormControl>
                              <FormLabel>Email Header Logo</FormLabel>
                              <Box
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                p={4}
                                textAlign="center"
                                cursor="pointer"
                                _hover={{ borderColor: "brand.primary" }}
                              >
                                <VStack>
                                  <FiUpload size={20} />
                                  <Text fontSize="sm">Upload Email Logo</Text>
                                  <Text fontSize="xs" color="gray.500">
                                    PNG | Max 1MB | 200x50px
                                  </Text>
                                </VStack>
                              </Box>
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                              <ColorInput
                                label="Email Primary Color"
                                value={brandingConfig.email_primary_color}
                                onChange={(value) => handleConfigChange('email_primary_color', value)}
                              />
                              <FormControl>
                                <FormLabel>Email Footer Text</FormLabel>
                                <Textarea
                                  value={brandingConfig.email_footer_text || ""}
                                  onChange={(e) => handleConfigChange('email_footer_text', e.target.value)}
                                  placeholder="Enter email footer text..."
                                  rows={2}
                                />
                              </FormControl>
                            </SimpleGrid>
                          </Box>
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Preview and Actions Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Preview Section */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md" color="brand.primary">Live Preview</Heading>
                    <HStack spacing={1}>
                      <IconButton
                        size="sm"
                        icon={<FiMonitor />}
                        aria-label="Web view"
                        variant={previewMode === 'web' ? 'solid' : 'outline'}
                        onClick={() => setPreviewMode('web')}
                      />
                      <IconButton
                        size="sm"
                        icon={<FiTablet />}
                        aria-label="Tablet view"
                        variant={previewMode === 'tablet' ? 'solid' : 'outline'}
                        onClick={() => setPreviewMode('tablet')}
                      />
                      <IconButton
                        size="sm"
                        icon={<FiSmartphone />}
                        aria-label="Mobile view"
                        variant={previewMode === 'mobile' ? 'solid' : 'outline'}
                        onClick={() => setPreviewMode('mobile')}
                      />
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    bg={brandingConfig.background_color}
                    minH="400px"
                    maxW={previewMode === 'mobile' ? '320px' : previewMode === 'tablet' ? '768px' : '100%'}
                    mx="auto"
                  >
                    {/* Sample Navigation */}
                    <Box
                      bg={brandingConfig.nav_bar_bg_color}
                      color={brandingConfig.nav_bar_text_color}
                      p={3}
                      borderRadius="md"
                      mb={4}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">Sample App</Text>
                        <HStack spacing={4}>
                          <Text cursor="pointer" _hover={{ color: brandingConfig.nav_bar_active_color }}>Home</Text>
                          <Text cursor="pointer" _hover={{ color: brandingConfig.nav_bar_active_color }}>About</Text>
                          <Text cursor="pointer" _hover={{ color: brandingConfig.nav_bar_active_color }}>Contact</Text>
                        </HStack>
                      </HStack>
                    </Box>

                    {/* Sample Content */}
                    <VStack spacing={4} align="stretch">
                      <Text color={brandingConfig.primary_text_color} fontSize="xl" fontWeight="bold">
                        Welcome to {brandingConfig.tenant_name}
                      </Text>
                      <Text color={brandingConfig.secondary_text_color}>
                        This is a sample preview of how your branding will look in the application.
                      </Text>
                      
                      <HStack spacing={3}>
                        <Button
                          bg="brand.primary"
                          color="brand.accent"
                          fontWeight="bold"
                          _hover={{ bg: "brand.600" }}
                          _active={{ bg: "brand.700" }}
                        >
                          Primary Button
                        </Button>
                        <Button
                          bg={brandingConfig.button_secondary_bg}
                          color={brandingConfig.button_secondary_text}
                          borderRadius={`${brandingConfig.button_secondary_border_radius}px`}
                          variant="outline"
                        >
                          Secondary Button
                        </Button>
                      </HStack>

                      <Input
                        placeholder="Sample input field"
                        borderColor={brandingConfig.input_border_color}
                        bg={brandingConfig.input_bg_color}
                        borderRadius={`${brandingConfig.input_border_radius}px`}
                        _focus={{ borderColor: brandingConfig.input_focus_color }}
                      />

                      <Text>
                        <Text as="span" color={brandingConfig.link_color} cursor="pointer">
                          Sample link
                        </Text> - This shows how links will appear.
                      </Text>
                    </VStack>
                  </Box>
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Button
                      leftIcon={<FiSave />}
                      variant="brand"
                      onClick={handleSave}
                      isLoading={saving}
                      loadingText="Saving..."
                      isDisabled={!hasUnsavedChanges}
                    >
                      Save Changes
                    </Button>
                    
                    <Button
                      leftIcon={<FiRefreshCw />}
                      variant="brand"
                      onClick={handleDiscardChanges}
                      isDisabled={!hasUnsavedChanges}
                    >
                      Discard Changes
                    </Button>
                    
                    <Button
                      leftIcon={<FiX />}
                      variant="outline"
                      colorScheme="red"
                      onClick={() => setShowResetDialog(true)}
                    >
                      Revert to Default
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <Heading size="md" color="brand.primary">Help & Support</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button
                      leftIcon={<FiInfo />}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                    >
                      Branding Guidelines
                    </Button>
                    <Button
                      leftIcon={<FiSettings />}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                    >
                      Need Help?
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>

        {/* Reset Dialog */}
        <AlertDialog
          isOpen={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          leastDestructiveRef={cancelRef}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Revert to Default Branding
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to revert all branding settings to the default DigiSol.AI branding? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setShowResetDialog(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleResetToDefault} ml={3}>
                  Revert to Default
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Icona Chat Modal */}
        <Modal isOpen={isIconaChatOpen} onClose={onIconaChatClose} size="6xl" maxW="90vw">
          <ModalOverlay />
          <ModalContent maxH="70vh">
            <ModalHeader>
              <HStack>
                <Icon as={FiImage} color="pink.500" />
                <Text>Chat with Icona - Brand Identity Specialist</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <ContextualAIChat
                agentId="icona"
                agentName="Icona"
                agentSpecialization="brand_identity"
                pageContext="brand_hub"
                pageData={{ 
                  brandingConfig,
                  iconaAgent,
                  askIconaQuestion 
                }}
                onClose={onIconaChatClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}