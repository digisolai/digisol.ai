// frontend/src/pages/DesignStudioPage.tsx
import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Icon,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,

  Spinner,
  Image,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import api from "../services/api";
import {FiImage, FiType, FiLayout, FiShare2, FiUser, FiFileText, FiMonitor} from "react-icons/fi";
import type { AIProfile } from "../types/ai";

// Import specialized design components
import GeneralImageCreator from "../components/design_studio/GeneralImageCreator";
import LogoCreator from "../components/design_studio/LogoCreator";
import BannerDesigner from "../components/design_studio/BannerDesigner";
import SocialPostDesigner from "../components/design_studio/SocialPostDesigner";
import BusinessCardDesigner from "../components/design_studio/BusinessCardDesigner";
import FlyerDesigner from "../components/design_studio/FlyerDesigner";
import PresentationSlideDesigner from "../components/design_studio/PresentationSlideDesigner";

interface ImageRequest {
  id: string;
  prompt_text: string;
  generated_image_url: string;
  status: string;
  created_at: string;
  design_type?: string;
}

export default function DesignStudioPage() {
  const [imageRequests, setImageRequests] = useState<ImageRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAgent, setAiAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [, setSelectedTab] = useState(0);
  const toast = useToast();

  useEffect(() => {
    fetchImageRequests();
    fetchAIAgent();
  }, []);

  async function fetchImageRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/ai-services/image-generation-requests/");
      setImageRequests(res.data);
    } catch (err: unknown) {
      setError(err.response?.data?.detail || err.message || "Failed to load image requests.");
      // Placeholder data if API fails
      setImageRequests([
        { 
          id: "1", 
          prompt_text: "Modern logo design for tech startup", 
          generated_image_url: "https://via.placeholder.com/400x300", 
          status: "completed", 
          created_at: "2024-06-01",
          design_type: "logo"
        },
        { 
          id: "2", 
          prompt_text: "Professional business card design", 
          generated_image_url: "https://via.placeholder.com/400x300", 
          status: "completed", 
          created_at: "2024-06-10",
          design_type: "business_card"
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAIAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=content_creation&is_global=true');
      if (res.data && res.data.length > 0) {
        setAiAgent(res.data[0]);
      } else {
        setAiAgent({
          id: '1',
          name: 'Scriptor',
          specialization: 'content_creation',
          personality_description: 'Your creative design assistant, specializing in visual content creation and brand design.',
          tenant: undefined,
          is_global: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      console.error('Error fetching AI agent:', err);
      setAgentError('Failed to load AI agent');
      setAiAgent({
        id: '1',
        name: 'Scriptor',
        specialization: 'content_creation',
        personality_description: 'Your creative design assistant, specializing in visual content creation and brand design.',
        tenant: undefined,
        is_global: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskAIAgent = (question: string) => {
    toast({
      title: "AI Assistant",
      description: `Scriptor says: "I'd be happy to help you with ${question}! Let me guide you through the design process."`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleImageGenerated = () => {
    toast({
      title: "Image Generated!",
      description: "Your design has been created successfully. Check your requests below.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    // Refresh the image requests list
    fetchImageRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getDesignTypeIcon = (designType?: string) => {
    switch (designType) {
      case 'logo': return FiType;
      case 'ad_banner': return FiLayout;
      case 'social_post': return FiShare2;
      case 'business_card': return FiUser;
      case 'flyer': return FiFileText;
      case 'presentation_slide': return FiMonitor;
      default: return FiImage;
    }
  };

  const getDesignTypeLabel = (designType?: string) => {
    switch (designType) {
      case 'logo': return 'Logo';
      case 'ad_banner': return 'Ad Banner';
      case 'social_post': return 'Social Post';
      case 'business_card': return 'Business Card';
      case 'flyer': return 'Flyer';
      case 'presentation_slide': return 'Presentation Slide';
      default: return 'General Image';
    }
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>Design Studio</Heading>
        
        <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={6}>
          {/* Main Content Column */}
          <GridItem>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text color="gray.600">
                      Create stunning visuals with AI-powered design tools. Choose from specialized design types or create general images.
                    </Text>
                  </Box>

                  <AIAgentSection 
                    agent={aiAgent} 
                    loading={loadingAgent} 
                    error={agentError} 
                    onAskQuestion={handleAskAIAgent} 
                  />

                  <Tabs variant="enclosed" onChange={(index) => setSelectedTab(index)}>
                    <TabList>
                      <Tab>
                        <HStack spacing={2}>
                          <FiImage />
                          <Text>General</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiType />
                          <Text>Logo</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiLayout />
                          <Text>Banner</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiShare2 />
                          <Text>Social Post</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiUser />
                          <Text>Business Card</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiFileText />
                          <Text>Flyer</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <FiMonitor />
                          <Text>Presentation</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <GeneralImageCreator onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <LogoCreator onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <BannerDesigner onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <SocialPostDesigner onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <BusinessCardDesigner onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <FlyerDesigner onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                      <TabPanel>
                        <PresentationSlideDesigner onImageGenerated={handleImageGenerated} />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Sidebar Column */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Recent Designs</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {loading ? (
                    <VStack spacing={4}>
                      <Spinner size="lg" />
                      <Text>Loading your designs...</Text>
                    </VStack>
                  ) : error ? (
                    <Alert status="error">
                      <AlertIcon />
                      {error}
                    </Alert>
                  ) : imageRequests.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={8}>
                      No designs yet. Create your first design using the tools above!
                    </Text>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {imageRequests.slice(0, 5).map((request) => {
                        const IconComponent = getDesignTypeIcon(request.design_type);
                        return (
                          <Card key={request.id} size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <HStack justify="space-between">
                                  <HStack>
                                    <Icon as={IconComponent} color="blue.500" />
                                    <Badge colorScheme="blue" variant="subtle">
                                      {getDesignTypeLabel(request.design_type)}
                                    </Badge>
                                  </HStack>
                                  <Badge colorScheme={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </HStack>
                                
                                <Text fontSize="sm" noOfLines={2}>
                                  {request.prompt_text}
                                </Text>
                                
                                {request.generated_image_url && (
                                  <Image
                                    src={request.generated_image_url}
                                    alt="Generated design"
                                    borderRadius="md"
                                    objectFit="cover"
                                    height="120px"
                                    width="100%"
                                  />
                                )}
                                
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                      
                      {imageRequests.length > 5 && (
                        <Button variant="outline" size="sm" onClick={fetchImageRequests}>
                          View All Designs
                        </Button>
                      )}
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </Layout>
  );
}