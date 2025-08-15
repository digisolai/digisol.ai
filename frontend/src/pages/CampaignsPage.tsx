import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiPlay,
  FiPause,
  FiEdit,
  FiCopy,
  FiTrash2,
  FiBarChart,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiSettings,
  FiEye,
  FiArchive,
  FiRefreshCw,
  FiMail,
  FiShare2,
  FiFileText,
  FiPackage,
  FiHeart,
  FiLayers,
  FiZap,
} from 'react-icons/fi';
import api from '../services/api';
import type { MarketingCampaign, CampaignCreateData, CampaignFilters, CampaignStats } from '../types/campaigns';
import { useAuth } from '../hooks/useAuth';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Layout } from '../components/Layout';
import { PageLayout, SectionCard, SideCard } from '../components/PageLayout';
import { AIAgentSection } from '../components/AIAgentSection';
import ContextualAIChat from '../components/ContextualAIChat';
import CampaignAnalytics from '../components/CampaignAnalytics';
import type { AIProfile } from '../types/ai';
import { getAgentConfig, AI_BRAND_COLORS } from '../utils/aiAgentConfig';

const CAMPAIGN_TYPES = {
  email: { label: 'Email Campaign', icon: FiMail, color: 'brand.primary' },
  social: { label: 'Social Media', icon: FiShare2, color: 'brand.accent' },
  paid_ads: { label: 'Paid Advertising', icon: FiDollarSign, color: 'brand.primary' },
  content: { label: 'Content Marketing', icon: FiFileText, color: 'brand.accent' },
  event: { label: 'Event Marketing', icon: FiCalendar, color: 'brand.primary' },
  product_launch: { label: 'Product Launch', icon: FiPackage, color: 'brand.accent' },
  lead_nurturing: { label: 'Lead Nurturing', icon: FiUsers, color: 'brand.primary' },
  retention: { label: 'Customer Retention', icon: FiHeart, color: 'brand.accent' },
  multi_channel: { label: 'Multi-Channel', icon: FiLayers, color: 'brand.primary' },
};

const STATUS_COLORS = {
  Draft: 'gray',
  Active: 'brand.primary',
  Paused: 'brand.accent',
  Completed: 'brand.primary',
  Archived: 'gray',
};

export default function CampaignsPage() {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureAccess();
  const toast = useToast();
  
  // State
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // AI Agent State
  const [optimizerAgent, setOptimizerAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isOptimizerChatOpen, onOpen: onOptimizerChatOpen, onClose: onOptimizerChatClose } = useDisclosure();

  // Load Optimizer AI Agent
  const loadOptimizerAgent = useCallback(async () => {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=campaign_optimization&is_global=true');
      if (res.data && res.data.length > 0) {
        setOptimizerAgent(res.data[0]);
      } else {
        const optimizerConfig = getAgentConfig('Optimizer');
        setOptimizerAgent({
          id: "optimizer",
          name: "Optimizer",
          specialization: "campaign_optimization",
          personality_description: optimizerConfig.personality_description,
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Optimizer agent:", err);
      setAgentError("Failed to load AI assistant");
      const optimizerConfig = getAgentConfig('Optimizer');
      setOptimizerAgent({
        id: "optimizer",
        name: "Optimizer",
        specialization: "campaign_optimization",
        personality_description: optimizerConfig.personality_description,
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }, []);

  const handleAskOptimizer = (question: string) => {
    onOptimizerChatOpen();
  };

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/campaigns/');
      
      // Handle the new response structure from backend
      const campaignsData = response.data?.campaigns || [];
      
      // Ensure campaigns is always an array
      if (Array.isArray(campaignsData)) {
        setCampaigns(campaignsData);
        setFilteredCampaigns(campaignsData);
      } else {
        console.warn('Expected campaigns array but got:', campaignsData);
        setCampaigns([]);
        setFilteredCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Set empty arrays on error
      setCampaigns([]);
      setFilteredCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/campaigns/campaigns/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  // Filter campaigns
  const filterCampaigns = useCallback(() => {
    // Ensure campaigns is always an array
    if (!Array.isArray(campaigns)) {
      console.warn('Campaigns is not an array:', campaigns);
      setFilteredCampaigns([]);
      return;
    }

    let filtered = campaigns;

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === activeTab);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Additional filters
    if (filters.campaign_type) {
      filtered = filtered.filter(campaign => campaign.campaign_type === filters.campaign_type);
    }
    if (filters.objective) {
      filtered = filtered.filter(campaign => campaign.objective === filters.objective);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, activeTab, searchTerm, filters]);

  // Helper function to safely filter campaigns
  const safeFilterCampaigns = useCallback((filterFn: (campaign: MarketingCampaign) => boolean) => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.filter(filterFn);
  }, [campaigns]);

  // Apply filters when they change
  useEffect(() => {
    filterCampaigns();
  }, [filterCampaigns]);

  // Load data on mount
  useEffect(() => {
    loadCampaigns();
    loadStats();
    loadOptimizerAgent();
  }, [loadCampaigns, loadStats, loadOptimizerAgent]);

  // Create campaign
  const handleCreateCampaign = async (data: CampaignCreateData) => {
    try {
      const response = await api.post('/campaigns/campaigns/', data);
      setCampaigns(prev => [response.data, ...prev]);
      onCreateClose();
      toast({
        title: 'Success',
        description: 'Campaign created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Update campaign
  const handleUpdateCampaign = async (campaignId: string, data: CampaignCreateData) => {
    try {
      const response = await api.patch(`/campaigns/campaigns/${campaignId}/`, data);
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId ? response.data : campaign
      ));
      onEditClose();
      toast({
        title: 'Success',
        description: 'Campaign updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Update campaign status
  const handleStatusChange = async (campaignId: string, status: MarketingCampaign['status']) => {
    try {
      await api.patch(`/campaigns/campaigns/${campaignId}/`, { status });
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status } : campaign
      ));
      toast({
        title: 'Success',
        description: `Campaign ${status.toLowerCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Duplicate campaign
  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      const response = await api.post(`/campaigns/campaigns/${campaignId}/duplicate/`);
      setCampaigns(prev => [response.data, ...prev]);
      toast({
        title: 'Success',
        description: 'Campaign duplicated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate campaign',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await api.delete(`/campaigns/campaigns/${campaignId}/`);
      setCampaigns(prev => Array.isArray(prev) ? prev.filter(campaign => campaign.id !== campaignId) : []);
      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Campaign card component
  const CampaignCard = ({ campaign }: { campaign: MarketingCampaign }) => {
    const typeInfo = CAMPAIGN_TYPES[campaign.campaign_type];
    const TypeIcon = typeInfo.icon;

    return (
      <Card boxShadow="md" _hover={{ boxShadow: "lg" }} transition="all 0.2s ease-in-out">
        <CardHeader pb={2}>
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <HStack>
                <Icon as={TypeIcon} color={`${typeInfo.color}.500`} />
                <Badge colorScheme={typeInfo.color} variant="subtle">
                  {typeInfo.label}
                </Badge>
              </HStack>
              <Heading size="md" noOfLines={1}>
                {campaign.name}
              </Heading>
              {campaign.description && (
                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                  {campaign.description}
                </Text>
              )}
            </VStack>
            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                aria-label="Campaign options"
              />
              <MenuList zIndex={9999}>
                <MenuItem icon={<FiEye />} onClick={() => {
                  setSelectedCampaign(campaign);
                  onViewOpen();
                }}>
                  View Details
                </MenuItem>
                <MenuItem icon={<FiEdit />} onClick={() => {
                  setSelectedCampaign(campaign);
                  onEditOpen();
                }}>
                  Edit
                </MenuItem>
                <MenuItem icon={<FiCopy />} onClick={() => handleDuplicateCampaign(campaign.id)}>
                  Duplicate
                </MenuItem>
                {campaign.status === 'Active' && (
                  <MenuItem icon={<FiPause />} onClick={() => handleStatusChange(campaign.id, 'Paused')}>
                    Pause
                  </MenuItem>
                )}
                {campaign.status === 'Paused' && (
                  <MenuItem icon={<FiPlay />} onClick={() => handleStatusChange(campaign.id, 'Active')}>
                    Resume
                  </MenuItem>
                )}
                <MenuItem icon={<FiArchive />} onClick={() => handleStatusChange(campaign.id, 'Archived')}>
                  Archive
                </MenuItem>
                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleDeleteCampaign(campaign.id)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Badge colorScheme={STATUS_COLORS[campaign.status]} variant="solid">
                {campaign.status}
              </Badge>
              {campaign.optimizer_health_score && (
                <HStack>
                  <Text fontSize="sm" color="gray.500">Health:</Text>
                  <Progress
                    value={campaign.optimizer_health_score}
                    size="sm"
                    width="60px"
                    colorScheme={campaign.optimizer_health_score > 70 ? 'brand.primary' : campaign.optimizer_health_score > 40 ? 'brand.accent' : 'red'}
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    {campaign.optimizer_health_score}%
                  </Text>
                </HStack>
              )}
            </HStack>
            
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.500">Budget:</Text>
              <Text fontWeight="medium">
                ${campaign.spent_budget.toFixed(2)}
                {campaign.budget && ` / $${campaign.budget.toFixed(2)}`}
              </Text>
            </HStack>
            
            {campaign.budget && (
              <Progress
                value={(campaign.spent_budget / campaign.budget) * 100}
                size="sm"
                colorScheme={campaign.spent_budget > campaign.budget * 0.9 ? 'red' : 'brand.primary'}
              />
            )}
            
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.500">Created:</Text>
              <Text>{new Date(campaign.created_at).toLocaleDateString()}</Text>
            </HStack>
            
            {campaign.steps && campaign.steps.length > 0 && (
              <HStack justify="space-between" fontSize="sm">
                <Text color="gray.500">Steps:</Text>
                <Text fontWeight="medium">{campaign.steps.length}</Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Stats cards
  const StatsCard = ({ label, value, icon: Icon, color, helpText }: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    helpText?: string;
  }) => (
    <Card boxShadow="md">
      <CardBody>
        <Stat>
          <HStack>
            <Icon color={`${color}.500`} />
            <StatLabel>{label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );

  // Left Column - Optimizer AI Assistant
  const leftColumn = (
    <AIAgentSection
      agent={optimizerAgent}
      loading={loadingAgent}
      error={agentError}
      onAskQuestion={handleAskOptimizer}
    />
  );

  // Center Column - Main Content
  const centerColumn = (
    <VStack spacing={6} align="stretch">
      {/* Stats Overview */}
      {stats && (
        <SectionCard title="Campaign Overview">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <StatsCard
              label="Total Campaigns"
              value={stats.total_campaigns}
              icon={FiBarChart}
              color="brand.primary"
            />
            <StatsCard
              label="Active Campaigns"
              value={stats.active_campaigns}
              icon={FiPlay}
              color="brand.primary"
            />
            <StatsCard
              label="Total Budget"
              value={`$${stats.total_budget.toFixed(2)}`}
              icon={FiDollarSign}
              color="brand.accent"
            />
            <StatsCard
              label="Average ROI"
              value={`${stats.average_roi.toFixed(1)}%`}
              icon={FiTrendingUp}
              color="brand.accent"
              helpText={stats.average_roi > 0 ? "Positive return" : "Negative return"}
            />
          </SimpleGrid>
        </SectionCard>
      )}

      {/* Filters and Search */}
      <SectionCard title="Search & Filters">
        <VStack spacing={4}>
          <HStack w="full" spacing={4}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              placeholder="Campaign Type"
              value={filters.campaign_type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, campaign_type: e.target.value as any }))}
              maxW="200px"
              zIndex={9999}
            >
              {Object.entries(CAMPAIGN_TYPES).map(([value, info]) => (
                <option key={value} value={value}>
                  {info.label}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Objective"
              value={filters.objective || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, objective: e.target.value as any }))}
              maxW="200px"
              zIndex={9999}
            >
              <option value="awareness">Brand Awareness</option>
              <option value="traffic">Drive Traffic</option>
              <option value="leads">Generate Leads</option>
              <option value="sales">Increase Sales</option>
              <option value="engagement">Boost Engagement</option>
              <option value="conversion">Improve Conversion</option>
              <option value="retention">Customer Retention</option>
              <option value="loyalty">Build Loyalty</option>
            </Select>
            <IconButton
              icon={<FiRefreshCw />}
              onClick={() => {
                setFilters({});
                setSearchTerm('');
                setActiveTab('all');
              }}
              aria-label="Clear filters"
            />
          </HStack>
        </VStack>
      </SectionCard>

      {/* Campaigns Tabs */}
      <SectionCard title="Campaigns">
        <Tabs index={activeTab === 'all' ? 0 : ['Draft', 'Active', 'Paused', 'Completed', 'Archived'].indexOf(activeTab) + 1} onChange={(index) => {
          const tabs = ['all', 'Draft', 'Active', 'Paused', 'Completed', 'Archived'];
          setActiveTab(tabs[index]);
        }}>
          <TabList>
                          <Tab value="all">All ({Array.isArray(campaigns) ? campaigns.length : 0})</Tab>
            <Tab value="Draft">Draft ({safeFilterCampaigns(c => c.status === 'Draft').length})</Tab>
            <Tab value="Active">Active ({safeFilterCampaigns(c => c.status === 'Active').length})</Tab>
            <Tab value="Paused">Paused ({safeFilterCampaigns(c => c.status === 'Paused').length})</Tab>
            <Tab value="Completed">Completed ({safeFilterCampaigns(c => c.status === 'Completed').length})</Tab>
            <Tab value="Archived">Archived ({safeFilterCampaigns(c => c.status === 'Archived').length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {loading ? (
                <VStack spacing={4} py={8}>
                  <Spinner size="lg" color="brand.primary" />
                  <Text>Loading campaigns...</Text>
                </VStack>
              ) : filteredCampaigns.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Text color="gray.500">No campaigns found</Text>
                  <Button 
                    bg="brand.primary" 
                    color="brand.accent" 
                    fontWeight="bold" 
                    _hover={{ bg: "brand.600" }}
                    onClick={onCreateOpen}
                  >
                    Create Your First Campaign
                  </Button>
                </VStack>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
            {['Draft', 'Active', 'Paused', 'Completed', 'Archived'].map(status => (
              <TabPanel key={status} px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredCampaigns.map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </SimpleGrid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </SectionCard>
    </VStack>
  );

  // Right Column - Quick Actions & Stats
  const rightColumn = (
    <>
      <SideCard title="Quick Actions">
        <VStack spacing={3} align="stretch">
          <Button
            leftIcon={<FiPlus />}
            bg="brand.primary"
            color="brand.accent"
            fontWeight="bold"
            _hover={{ bg: "brand.600" }}
            _active={{ bg: "brand.700" }}
            onClick={onCreateOpen}
            isDisabled={!hasFeatureAccess('campaign_management')}
            size="lg"
          >
            Create Campaign
          </Button>
          <Button
            leftIcon={<FiBarChart />}
            variant="outline"
            colorScheme="brand"
            onClick={() => window.location.href = '/analytics'}
            size="lg"
          >
            View Analytics
          </Button>
          <Button
            leftIcon={<FiUsers />}
            variant="outline"
            colorScheme="brand"
            onClick={() => window.location.href = '/contacts'}
            size="lg"
          >
            Manage Contacts
          </Button>
        </VStack>
      </SideCard>

      <SideCard title="Campaign Status">
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text>Draft</Text>
            <Badge colorScheme="gray">{safeFilterCampaigns(c => c.status === 'Draft').length}</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Active</Text>
            <Badge colorScheme="brand.primary">{safeFilterCampaigns(c => c.status === 'Active').length}</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Paused</Text>
            <Badge colorScheme="brand.accent">{safeFilterCampaigns(c => c.status === 'Paused').length}</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Completed</Text>
            <Badge colorScheme="brand.primary">{safeFilterCampaigns(c => c.status === 'Completed').length}</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text>Archived</Text>
            <Badge colorScheme="gray">{safeFilterCampaigns(c => c.status === 'Archived').length}</Badge>
          </HStack>
        </VStack>
      </SideCard>
    </>
  );

  return (
    <Layout>
      <PageLayout
        title="Campaigns"
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
        showLeftColumn={true}
        showRightColumn={true}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSubmit={handleCreateCampaign}
      />

      {/* Edit Campaign Modal */}
      {selectedCampaign && (
        <EditCampaignModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          campaign={selectedCampaign}
          onSubmit={(data) => handleUpdateCampaign(selectedCampaign.id, data)}
        />
      )}

      {/* View Campaign Modal */}
      {selectedCampaign && (
        <ViewCampaignModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          campaign={selectedCampaign}
        />
      )}

             {/* Optimizer AI Chat Modal */}
       <Modal isOpen={isOptimizerChatOpen} onClose={onOptimizerChatClose} size="6xl">
         <ModalOverlay />
         <ModalContent maxH="70vh">
           <ModalHeader>
             <HStack>
               <Icon as={getAgentConfig('Optimizer').icon} color={AI_BRAND_COLORS.primary} />
               <Text>Chat with Optimizer AI</Text>
             </HStack>
           </ModalHeader>
           <ModalCloseButton />
           <ModalBody p={0}>
             <ContextualAIChat
               agentId="optimizer"
               agentName="Optimizer"
               agentSpecialization="campaign_optimization"
               pageContext="campaigns"
               pageData={{ 
                 campaigns,
                 selectedCampaign,
                 stats
               }}
               onClose={onOptimizerChatClose}
             />
           </ModalBody>
         </ModalContent>
       </Modal>
     </Layout>
   );
 }

// Modal Components
function CreateCampaignModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignCreateData) => void;
}) {
  const toast = useToast();
  const [formData, setFormData] = useState<CampaignCreateData>({
    name: '',
    description: '',
    campaign_type: 'email',
    objective: 'leads',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Campaign name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onSubmit(formData);
    // Reset form after submission
    setFormData({
      name: '',
      description: '',
      campaign_type: 'email',
      objective: 'leads',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Campaign</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Campaign Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter campaign description"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Campaign Type</FormLabel>
                <Select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_type: e.target.value as any }))}
                >
                  {Object.entries(CAMPAIGN_TYPES).map(([value, info]) => (
                    <option key={value} value={value}>
                      {info.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Objective</FormLabel>
                <Select
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value as any }))}
                >
                  <option value="awareness">Brand Awareness</option>
                  <option value="traffic">Drive Traffic</option>
                  <option value="leads">Generate Leads</option>
                  <option value="sales">Increase Sales</option>
                  <option value="engagement">Boost Engagement</option>
                  <option value="conversion">Improve Conversion</option>
                  <option value="retention">Customer Retention</option>
                  <option value="loyalty">Build Loyalty</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Budget</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
                    placeholder="Enter budget amount"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Target ROI (%)</FormLabel>
                <NumberInput min={0} max={1000}>
                  <NumberInputField
                    value={formData.target_roi || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_roi: parseFloat(e.target.value) || undefined }))}
                    placeholder="Enter target ROI"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              type="submit"
              ml={3}
            >
              Create Campaign
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function EditCampaignModal({ isOpen, onClose, campaign, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  campaign: MarketingCampaign;
  onSubmit: (data: CampaignCreateData) => void;
}) {
  const toast = useToast();
  const [formData, setFormData] = useState<CampaignCreateData>({
    name: campaign.name,
    description: campaign.description || '',
    campaign_type: campaign.campaign_type,
    objective: campaign.objective,
    budget: campaign.budget,
    target_roi: campaign.target_roi,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Campaign name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Campaign</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Campaign Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Campaign Type</FormLabel>
                <Select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_type: e.target.value as any }))}
                >
                  {Object.entries(CAMPAIGN_TYPES).map(([value, info]) => (
                    <option key={value} value={value}>
                      {info.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Objective</FormLabel>
                <Select
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value as any }))}
                >
                  <option value="awareness">Brand Awareness</option>
                  <option value="traffic">Drive Traffic</option>
                  <option value="leads">Generate Leads</option>
                  <option value="sales">Increase Sales</option>
                  <option value="engagement">Boost Engagement</option>
                  <option value="conversion">Improve Conversion</option>
                  <option value="retention">Customer Retention</option>
                  <option value="loyalty">Build Loyalty</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Budget</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Target ROI (%)</FormLabel>
                <NumberInput min={0} max={1000}>
                  <NumberInputField
                    value={formData.target_roi || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_roi: parseFloat(e.target.value) || undefined }))}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "brand.600" }}
              type="submit"
              ml={3}
            >
              Update Campaign
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function ViewCampaignModal({ isOpen, onClose, campaign }: {
  isOpen: boolean;
  onClose: () => void;
  campaign: MarketingCampaign;
}) {
  const typeInfo = CAMPAIGN_TYPES[campaign.campaign_type];
  const TypeIcon = typeInfo.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={TypeIcon} color={`${typeInfo.color}.500`} />
            <Text>{campaign.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <Heading size="md">Campaign Details</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Status:</Text>
                    <Badge colorScheme={STATUS_COLORS[campaign.status]} variant="solid">
                      {campaign.status}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Type:</Text>
                    <Text>{typeInfo.label}</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Objective:</Text>
                    <Text>{campaign.objective}</Text>
                  </HStack>
                  
                  {campaign.description && (
                    <Box>
                      <Text fontWeight="medium" mb={2}>Description:</Text>
                      <Text>{campaign.description}</Text>
                    </Box>
                  )}
                  
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Created:</Text>
                    <Text>{new Date(campaign.created_at).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <Heading size="md">Performance</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Budget Spent:</Text>
                    <Text>${campaign.spent_budget.toFixed(2)}</Text>
                  </HStack>
                  
                  {campaign.budget && (
                    <>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Total Budget:</Text>
                        <Text>${campaign.budget.toFixed(2)}</Text>
                      </HStack>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">Budget Utilization</Text>
                          <Text fontSize="sm">{((campaign.spent_budget / campaign.budget) * 100).toFixed(1)}%</Text>
                        </HStack>
                        <Progress
                          value={(campaign.spent_budget / campaign.budget) * 100}
                          colorScheme={campaign.spent_budget > campaign.budget * 0.9 ? 'red' : 'brand.primary'}
                        />
                      </Box>
                    </>
                  )}
                  
                  {campaign.optimizer_health_score && (
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="medium">Health Score:</Text>
                        <Text>{campaign.optimizer_health_score}%</Text>
                      </HStack>
                      <Progress
                        value={campaign.optimizer_health_score}
                        colorScheme={campaign.optimizer_health_score > 70 ? 'brand.primary' : campaign.optimizer_health_score > 40 ? 'brand.accent' : 'red'}
                      />
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Campaign Analytics */}
            <CampaignAnalytics campaignId={campaign.id} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
