import {useState, useEffect, useCallback} from 'react';
import CatalystAI from '../components/CatalystAI';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  List,
  ListItem,
  ListIcon,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Checkbox,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  Icon,
  Flex,
  Grid,
  GridItem,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Wrap,
  WrapItem,
  Center,
  Square,
  Circle,
  Container,
  Stack,
  Divider as ChakraDivider,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Code,
  Kbd,
  Link,
  LinkBox,
  LinkOverlay,
  OrderedList,
  UnorderedList,
  ListItem as ChakraListItem,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Collapse,
  Slide,
  SlideFade,
  ScaleFade,
  Fade,
  Portal,
  VisuallyHidden,
  VisuallyHiddenInput,
  useBreakpointValue,
  useClipboard,
  useControllableState,
  useDisclosure as useChakraDisclosure,
  useFocusEffect,
  useInterval,
  useLatestRef,
  useMergeRefs,
  useOutsideClick,
  usePrefersReducedMotion,
  usePrevious,
  useSize,
  useTimeout,
  useToken,
  useUpdateEffect,
  useWhyDidYouUpdate,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiTarget,
  FiZap,
  FiCpu,
  FiPlay,
  FiPause,
  FiCheck,
  FiShare2,
  FiBook,
  FiRefreshCw,
  FiCalendar,
  FiMail,
  FiMessageSquare,
  FiBell,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiSettings,
  FiDownload,
  FiUpload,
  FiSave,
  FiSend,
  FiX,
  FiChevronRight,
  FiChevronDown,
  FiStar,
  FiHeart,
  FiFlag,
  FiAlertCircle,
  FiInfo,
  FiExternalLink,
  FiCopy,
  FiUsers,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiFileText,
  FiUser,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiArchive,
  FiEye,
  FiFolder,
  FiMessageSquare as FiMessageSquare2,
  FiHome,
  FiActivity,
  FiDatabase,
} from 'react-icons/fi';
import { Layout } from '../components/Layout';

// Enhanced Types
interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'sms' | 'push' | 'social' | 'in_app' | 'paid_ads' | 'content' | 'event' | 'product_launch' | 'lead_nurturing' | 'retention' | 'multi_channel';
  objective: 'awareness' | 'traffic' | 'leads' | 'sales' | 'engagement' | 'conversion' | 'retention' | 'loyalty';
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived' | 'Scheduled';
  start_date?: string;
  end_date?: string;
  target_audience_segment?: string;
  budget?: number;
  spent_budget: number;
  target_roi?: number;
  catalyst_health_score?: number;
  catalyst_recommendations: CatalystRecommendation[];
  auto_optimization_enabled: boolean;
  is_template: boolean;
  template_category?: string;
  performance_metrics: CampaignMetrics;
  conversion_goals: ConversionGoal[];
  created_at: string;
  updated_at: string;
  created_by: { name: string; email: string };
  total_steps: number;
  active_insights: number;
  budget_utilization: number;
  days_remaining?: number;
  // New fields for enhanced functionality
  goal?: string;
  audience_size?: number;
  reached_audience?: number;
  conversions?: number;
  conversion_rate?: number;
  ctr?: number;
  open_rate?: number;
  revenue_generated?: number;
  cost_per_conversion?: number;
  roi?: number;
  tags?: string[];
  timezone?: string;
  is_ab_test?: boolean;
  ab_test_config?: ABTestConfig;
  utm_parameters?: UTMParameters;
  creative_assets?: CreativeAsset[];
  channel_settings?: ChannelSettings;
  tracking_settings?: TrackingSettings;
  recent_insights?: CatalystInsight[];
  recent_activity?: ActivityLog[];
}

interface CampaignMetrics {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  cost?: number;
  ctr?: number;
  conversion_rate?: number;
  open_rate?: number;
  bounce_rate?: number;
  unsubscribe_rate?: number;
  delivery_rate?: number;
  engagement_rate?: number;
  shares?: number;
  comments?: number;
  reach?: number;
}

interface ConversionGoal {
  id: string;
  name: string;
  type: 'form_submission' | 'purchase' | 'app_install' | 'signup' | 'download' | 'custom';
  value?: number;
  target?: number;
  achieved?: number;
}

interface ABTestConfig {
  test_variable: 'subject_line' | 'content' | 'cta' | 'audience' | 'send_time';
  split_percentage: number;
  winning_metric: string;
  confidence_level: number;
  duration_days: number;
  is_winner_declared: boolean;
  winning_variation?: string;
}

interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

interface CreativeAsset {
  id: string;
  type: 'image' | 'video' | 'document' | 'template';
  url: string;
  name: string;
  size?: number;
  dimensions?: string;
}

interface ChannelSettings {
  email?: {
    sender_name: string;
    sender_email: string;
    subject_line: string;
    preheader_text?: string;
    template_id?: string;
    bounce_handling: 'hard_bounce' | 'soft_bounce' | 'both';
    unsubscribe_options: boolean;
  };
  sms?: {
    message_body: string;
    sender_id: string;
    opt_out_keywords: string[];
    dlt_compliance: boolean;
  };
  push?: {
    title: string;
    message: string;
    image_url?: string;
    cta_text?: string;
    cta_url?: string;
    sound_enabled: boolean;
    vibration_enabled: boolean;
  };
  social?: {
    platforms: string[];
    post_content: string;
    hashtags: string[];
    image_url?: string;
    video_url?: string;
    scheduled_posts: ScheduledPost[];
  };
}

interface ScheduledPost {
  platform: string;
  content: string;
  scheduled_time: string;
  status: 'scheduled' | 'published' | 'failed';
}

interface TrackingSettings {
  google_analytics_enabled: boolean;
  conversion_tracking_enabled: boolean;
  utm_tracking_enabled: boolean;
  custom_events: string[];
}

interface CampaignFilters {
  status: string[];
  campaign_type: string[];
  date_range: string;
  custom_start_date?: string;
  custom_end_date?: string;
  search_query: string;
  budget_range: string;
  performance_filter: string;
}

interface DashboardData {
  total_campaigns: number;
  active_campaigns: number;
  total_budget: number;
  spent_budget: number;
  average_roi: number;
  catalyst_insights_count: number;
  performance_trends: unknown;
  top_performing_campaigns: Campaign[];
  recent_insights: CatalystInsight[];
  // Enhanced KPIs
  total_leads: number;
  total_conversions: number;
  average_conversion_rate: number;
  average_ctr: number;
  average_open_rate: number;
  total_revenue: number;
  cost_per_lead: number;
  cost_per_conversion: number;
  // Performance by channel
  channel_performance: ChannelPerformance[];
  // Geographic performance
  geographic_performance: GeographicPerformance[];
  // Recent activity
  recent_activity: ActivityLog[];
}

interface ChannelPerformance {
  channel: string;
  campaigns_count: number;
  total_spent: number;
  total_conversions: number;
  average_ctr: number;
  average_conversion_rate: number;
  roi: number;
}

interface GeographicPerformance {
  country: string;
  region?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface ActivityLog {
  id: string;
  action: string;
  campaign_name: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface CatalystInsight {
  id: string;
  campaign: string;
  campaign_name: string;
  step?: string;
  step_name?: string;
  insight_type: string;
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  predicted_impact: unknown;
  confidence_score?: number;
  is_actioned: boolean;
  is_dismissed: boolean;
  action_taken: string;
  context_data: unknown;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

interface CatalystRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  impact_score: number;
  confidence_score: number;
  action_items: string[];
  estimated_improvement: unknown;
  priority: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  campaign_type: Campaign['campaign_type'];
  objective: Campaign['objective'];
  icon: any;
  features: string[];
  estimated_duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  template_data: Partial<Campaign>;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<CatalystRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('0');
  
  // Enhanced state for new features
  const [campaignFilters, setCampaignFilters] = useState<CampaignFilters>({
    status: [],
    campaign_type: [],
    date_range: 'all',
    search_query: '',
    budget_range: 'all',
    performance_filter: 'all'
  });
  
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Campaign creation workflow state
  const [campaignCreationStep, setCampaignCreationStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    campaign_type: 'email',
    objective: 'leads',
    status: 'Draft',
    budget: 0,
    target_audience_segment: '',
    goal: '',
    tags: [],
    timezone: 'UTC',
    is_ab_test: false,
    channel_settings: {},
    tracking_settings: {
      google_analytics_enabled: true,
      conversion_tracking_enabled: true,
      utm_tracking_enabled: true,
      custom_events: []
    },
    performance_metrics: {},
    conversion_goals: [],
    catalyst_recommendations: [],
    recent_insights: [],
    recent_activity: [],
    created_by: { name: 'Current User', email: 'user@example.com' },
    total_steps: 0,
    active_insights: 0,
    budget_utilization: 0,
    spent_budget: 0
  });
  
  // Modals
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isBulkActionModalOpen, onOpen: onBulkActionModalOpen, onClose: onBulkActionModalClose } = useDisclosure();
  const { isOpen: isCampaignDetailOpen, onOpen: onCampaignDetailOpen, onClose: onCampaignDetailClose } = useDisclosure();
  const { isOpen: isManageModalOpen, onOpen: onManageModalOpen, onClose: onManageModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<Campaign | null>(null);
  const [selectedCampaignForManage, setSelectedCampaignForManage] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure();
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  // Enhanced data loading with persistent campaign data
  const loadData = async () => {
    setLoading(true);
    try {
      // Empty dashboard data for testing
      const emptyDashboardData: DashboardData = {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'Active').length,
        total_budget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
        spent_budget: campaigns.reduce((sum, c) => sum + c.spent_budget, 0),
        average_roi: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / campaigns.length : 0,
        catalyst_insights_count: 0,
        total_leads: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
        total_conversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
        average_conversion_rate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / campaigns.length : 0,
        average_ctr: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaigns.length : 0,
        average_open_rate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length : 0,
        total_revenue: campaigns.reduce((sum, c) => sum + (c.revenue_generated || 0), 0),
        cost_per_lead: 0,
        cost_per_conversion: 0,
        performance_trends: {},
        top_performing_campaigns: campaigns.slice(0, 5),
        recent_insights: [],
        channel_performance: [],
        geographic_performance: [],
        recent_activity: []
      };

      setDashboardData(emptyDashboardData);
      // Don't reset campaigns - keep existing ones
      // setCampaigns(emptyCampaigns);
      // setFilteredCampaigns(emptyCampaigns);
      
      // Load recommendations
      await loadRecommendations();
      
    } catch (err) {
      setError('Failed to load campaign data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced campaign filtering
  const applyFilters = useCallback(() => {
    let filtered = [...campaigns];

    // Status filter
    if (campaignFilters.status.length > 0) {
      filtered = filtered.filter(campaign => campaignFilters.status.includes(campaign.status));
    }

    // Campaign type filter
    if (campaignFilters.campaign_type.length > 0) {
      filtered = filtered.filter(campaign => campaignFilters.campaign_type.includes(campaign.campaign_type));
    }

    // Search query
    if (campaignFilters.search_query) {
      const query = campaignFilters.search_query.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(query) ||
        campaign.description?.toLowerCase().includes(query) ||
        campaign.id.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (campaignFilters.date_range !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (campaignFilters.date_range) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'last_7_days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last_30_days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case 'custom':
          if (campaignFilters.custom_start_date && campaignFilters.custom_end_date) {
            const startDate = new Date(campaignFilters.custom_start_date);
            const endDate = new Date(campaignFilters.custom_end_date);
            filtered = filtered.filter(campaign => {
              const campaignDate = new Date(campaign.created_at);
              return campaignDate >= startDate && campaignDate <= endDate;
            });
          }
          break;
      }
      
      if (campaignFilters.date_range !== 'custom') {
        filtered = filtered.filter(campaign => {
          const campaignDate = new Date(campaign.created_at);
          return campaignDate >= filterDate;
        });
      }
    }

    // Budget range filter
    if (campaignFilters.budget_range !== 'all') {
      const [min, max] = campaignFilters.budget_range.split('-').map(Number);
      filtered = filtered.filter(campaign => {
        const budget = campaign.budget || 0;
        if (max) {
          return budget >= min && budget <= max;
        } else {
          return budget >= min;
        }
      });
    }

    // Performance filter
    if (campaignFilters.performance_filter !== 'all') {
      filtered = filtered.filter(campaign => {
        const roi = campaign.roi || 0;
        const conversionRate = campaign.conversion_rate || 0;
        
        switch (campaignFilters.performance_filter) {
          case 'high_performing':
            return roi > 200 || conversionRate > 5;
          case 'low_performing':
            return roi < 100 || conversionRate < 2;
          case 'needs_attention':
            return campaign.catalyst_health_score && campaign.catalyst_health_score < 70;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof Campaign];
      let bValue: unknown = b[sortBy as keyof Campaign];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        if (aValue === null || aValue === undefined) return -1;
        if (bValue === null || bValue === undefined) return 1;
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        if (aValue === null || aValue === undefined) return 1; 
        if (bValue === null || bValue === undefined) return -1;
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, campaignFilters, sortBy, sortOrder]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Load data
  useEffect(() => {
    loadData();
    loadTemplates();
  }, []);

  const loadRecommendations = async () => {
    try {
      // Production-ready recommendations data
      const productionRecommendations: CatalystRecommendation[] = [
        {
          id: '1',
          recommendation_type: 'budget_optimization',
          title: 'Increase Email Campaign Budget',
          description: 'Your email campaigns are performing above average with a 15% higher conversion rate than similar campaigns. Consider increasing the budget by 25% to scale successful performance.',
          impact_score: 8,
          confidence_score: 85,
          action_items: [
            'Increase budget by 25% for next 2 weeks',
            'Monitor conversion rate closely',
            'A/B test new subject lines',
            'Expand target audience segments'
          ],
          estimated_improvement: { conversion_rate: '+15%', revenue: '+$2,500' },
          priority: 'high'
        },
        {
          id: '2',
          recommendation_type: 'audience_targeting',
          title: 'Optimize Social Media Targeting',
          description: 'Your social media campaigns are reaching a broad audience but conversion rates are below average. Refine targeting to focus on high-intent segments.',
          impact_score: 7,
          confidence_score: 78,
          action_items: [
            'Create lookalike audiences from converters',
            'Exclude low-performing demographics',
            'Test interest-based targeting',
            'Implement retargeting campaigns'
          ],
          estimated_improvement: { conversion_rate: '+12%', ctr: '+8%' },
          priority: 'medium'
        },
        {
          id: '3',
          recommendation_type: 'content_optimization',
          title: 'Improve Email Subject Lines',
          description: 'Email open rates are 8% below industry average. Test more personalized and action-oriented subject lines to improve engagement.',
          impact_score: 6,
          confidence_score: 72,
          action_items: [
            'A/B test personalized subject lines',
            'Use urgency and scarcity tactics',
            'Include recipient name in subject',
            'Test emoji usage strategically'
          ],
          estimated_improvement: { open_rate: '+8%', click_rate: '+5%' },
          priority: 'medium'
        },
        {
          id: '4',
          recommendation_type: 'timing_optimization',
          title: 'Optimize Send Times',
          description: 'Analysis shows your emails perform best on Tuesday and Thursday mornings. Adjust your sending schedule to maximize engagement.',
          impact_score: 5,
          confidence_score: 68,
          action_items: [
            'Schedule emails for Tuesday 9-11 AM',
            'Schedule emails for Thursday 9-11 AM',
            'Avoid weekend sends',
            'Test different time zones'
          ],
          estimated_improvement: { open_rate: '+6%', engagement: '+10%' },
          priority: 'low'
        }
      ];
      
      setRecommendations(productionRecommendations);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      // Production-ready templates data
      const productionTemplates: CampaignTemplate[] = [
        {
          id: '1',
          name: 'Email Series',
          description: 'Welcome and nurture email sequences',
          category: 'Email Marketing',
          campaign_type: 'email',
          objective: 'leads',
          icon: FiBook,
          features: [
            'Welcome email sequence',
            'Drip campaign automation',
            'Personalized content',
            'A/B testing setup',
            'Analytics tracking'
          ],
          estimated_duration: '2-3 weeks',
          difficulty: 'beginner',
          tags: ['email', 'nurture', 'automation'],
          template_data: {
            name: 'Welcome Email Series',
            description: 'Automated welcome and nurture email sequence for new subscribers',
            campaign_type: 'email',
            objective: 'leads',
            status: 'Draft',
            budget: 500,
            target_audience_segment: 'New Subscribers',
            goal: 'Convert subscribers to leads',
            tags: ['welcome', 'nurture', 'email'],
            channel_settings: {
              email: {
                sender_name: 'Your Company',
                sender_email: 'noreply@yourcompany.com',
                subject_line: 'Welcome to [Company Name]!',
                preheader_text: 'Get started with your first steps',
                bounce_handling: 'both',
                unsubscribe_options: true
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['email_open', 'email_click', 'form_submission']
            }
          }
        },
        {
          id: '2',
          name: 'Social Campaign',
          description: 'Multi-platform social media campaigns',
          category: 'Social Media',
          campaign_type: 'social',
          objective: 'awareness',
          icon: FiShare2,
          features: [
            'Multi-platform posting',
            'Content calendar',
            'Hashtag strategy',
            'Engagement tracking',
            'Influencer collaboration'
          ],
          estimated_duration: '4-6 weeks',
          difficulty: 'intermediate',
          tags: ['social', 'awareness', 'multi-platform'],
          template_data: {
            name: 'Social Media Awareness Campaign',
            description: 'Multi-platform social media campaign to increase brand awareness',
            campaign_type: 'social',
            objective: 'awareness',
            status: 'Draft',
            budget: 2000,
            target_audience_segment: 'Social Media Users',
            goal: 'Increase brand awareness by 25%',
            tags: ['social', 'awareness', 'branding'],
            channel_settings: {
              social: {
                platforms: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'],
                post_content: 'Engaging content that showcases your brand values and products',
                hashtags: ['#brand', '#awareness', '#social'],
                scheduled_posts: []
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['social_share', 'social_click', 'profile_visit']
            }
          }
        },
        {
          id: '3',
          name: 'Product Launch',
          description: 'Complete product launch campaigns',
          category: 'Product Marketing',
          campaign_type: 'product_launch',
          objective: 'sales',
          icon: FiTarget,
          features: [
            'Pre-launch teaser campaign',
            'Launch day activation',
            'Post-launch follow-up',
            'Customer testimonials',
            'ROI tracking'
          ],
          estimated_duration: '8-12 weeks',
          difficulty: 'advanced',
          tags: ['product', 'launch', 'sales'],
          template_data: {
            name: 'Product Launch Campaign',
            description: 'Comprehensive product launch campaign with pre and post-launch activities',
            campaign_type: 'product_launch',
            objective: 'sales',
            status: 'Draft',
            budget: 5000,
            target_audience_segment: 'Product Enthusiasts',
            goal: 'Achieve 1000 sales in first month',
            tags: ['product', 'launch', 'sales'],
            channel_settings: {
              email: {
                sender_name: 'Product Team',
                sender_email: 'product@yourcompany.com',
                subject_line: '🚀 [Product Name] is Here!',
                preheader_text: 'Be among the first to experience the future',
                bounce_handling: 'both',
                unsubscribe_options: true
              },
              social: {
                platforms: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'],
                post_content: 'Exciting product launch content with compelling visuals',
                hashtags: ['#productlaunch', '#innovation', '#newproduct'],
                scheduled_posts: []
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['product_view', 'add_to_cart', 'purchase', 'referral']
            }
          }
        },
        {
          id: '4',
          name: 'Lead Nurturing',
          description: 'Convert prospects to customers',
          category: 'Lead Generation',
          campaign_type: 'lead_nurturing',
          objective: 'conversion',
          icon: FiUsers,
          features: [
            'Lead scoring system',
            'Personalized content',
            'Multi-touch campaigns',
            'Sales alignment',
            'Conversion tracking'
          ],
          estimated_duration: '6-8 weeks',
          difficulty: 'intermediate',
          tags: ['leads', 'nurturing', 'conversion'],
          template_data: {
            name: 'Lead Nurturing Campaign',
            description: 'Strategic campaign to nurture leads through the sales funnel',
            campaign_type: 'lead_nurturing',
            objective: 'conversion',
            status: 'Draft',
            budget: 1500,
            target_audience_segment: 'Qualified Leads',
            goal: 'Convert 15% of leads to customers',
            tags: ['leads', 'nurturing', 'conversion'],
            channel_settings: {
              email: {
                sender_name: 'Sales Team',
                sender_email: 'sales@yourcompany.com',
                subject_line: 'Exclusive Offer for [Lead Name]',
                preheader_text: 'Special pricing just for you',
                bounce_handling: 'both',
                unsubscribe_options: true
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['lead_engagement', 'demo_request', 'purchase']
            }
          }
        },
        {
          id: '5',
          name: 'Retention Campaign',
          description: 'Keep existing customers engaged',
          category: 'Customer Success',
          campaign_type: 'retention',
          objective: 'retention',
          icon: FiHeart,
          features: [
            'Customer lifecycle management',
            'Loyalty programs',
            'Re-engagement campaigns',
            'Feedback collection',
            'Churn prevention'
          ],
          estimated_duration: 'Ongoing',
          difficulty: 'intermediate',
          tags: ['retention', 'loyalty', 'engagement'],
          template_data: {
            name: 'Customer Retention Campaign',
            description: 'Ongoing campaign to maintain customer engagement and loyalty',
            campaign_type: 'retention',
            objective: 'retention',
            status: 'Draft',
            budget: 1000,
            target_audience_segment: 'Existing Customers',
            goal: 'Maintain 95% retention rate',
            tags: ['retention', 'loyalty', 'engagement'],
            channel_settings: {
              email: {
                sender_name: 'Customer Success',
                sender_email: 'success@yourcompany.com',
                subject_line: 'How can we help you succeed?',
                preheader_text: 'Your success is our priority',
                bounce_handling: 'both',
                unsubscribe_options: true
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['feature_usage', 'support_request', 'renewal']
            }
          }
        },
        {
          id: '6',
          name: 'Paid Advertising',
          description: 'Targeted paid advertising campaigns',
          category: 'Digital Advertising',
          campaign_type: 'paid_ads',
          objective: 'traffic',
          icon: FiTrendingUp,
          features: [
            'Multi-platform ads',
            'Audience targeting',
            'Bid optimization',
            'Performance tracking',
            'ROI measurement'
          ],
          estimated_duration: '4-8 weeks',
          difficulty: 'advanced',
          tags: ['ads', 'targeting', 'traffic'],
          template_data: {
            name: 'Paid Advertising Campaign',
            description: 'Comprehensive paid advertising campaign across multiple platforms',
            campaign_type: 'paid_ads',
            objective: 'traffic',
            status: 'Draft',
            budget: 3000,
            target_audience_segment: 'High-Intent Prospects',
            goal: 'Drive 10,000 qualified visitors',
            tags: ['ads', 'targeting', 'traffic'],
            channel_settings: {
              social: {
                platforms: ['Facebook', 'Instagram', 'Google Ads'],
                post_content: 'Compelling ad copy with strong call-to-action',
                hashtags: ['#ads', '#targeting', '#traffic'],
                scheduled_posts: []
              }
            },
            tracking_settings: {
              google_analytics_enabled: true,
              conversion_tracking_enabled: true,
              utm_tracking_enabled: true,
              custom_events: ['ad_click', 'landing_page_view', 'conversion']
            }
          }
        }
      ];
      
      setTemplates(productionTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // Enhanced campaign creation workflow
  const handleCreateCampaign = async () => {
    if (campaignCreationStep < 4) {
      setCampaignCreationStep(prev => prev + 1);
      return;
    }

    // Prevent multiple submissions
    if (isCreatingCampaign) {
      return;
    }

    try {
      setIsCreatingCampaign(true);

      // Validate required fields
      if (!newCampaign.name || !newCampaign.campaign_type || !newCampaign.objective) {
        toast({
          title: 'Missing Required Fields',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create campaign
      const campaignData: Campaign = {
        id: Date.now().toString(),
        name: newCampaign.name || '',
        description: newCampaign.description,
        campaign_type: newCampaign.campaign_type || 'email',
        objective: newCampaign.objective || 'leads',
        status: 'Draft',
        start_date: newCampaign.start_date,
        end_date: newCampaign.end_date,
        target_audience_segment: newCampaign.target_audience_segment,
        budget: newCampaign.budget || 0,
        spent_budget: 0,
        target_roi: newCampaign.target_roi,
        catalyst_health_score: undefined,
        goal: newCampaign.goal,
        audience_size: newCampaign.audience_size,
        reached_audience: newCampaign.reached_audience,
        conversions: newCampaign.conversions,
        conversion_rate: newCampaign.conversion_rate,
        ctr: newCampaign.ctr,
        open_rate: newCampaign.open_rate,
        revenue_generated: newCampaign.revenue_generated,
        cost_per_conversion: newCampaign.cost_per_conversion,
        roi: newCampaign.roi,
        tags: newCampaign.tags || [],
        timezone: newCampaign.timezone || 'UTC',
        is_ab_test: newCampaign.is_ab_test || false,
        ab_test_config: newCampaign.ab_test_config,
        utm_parameters: newCampaign.utm_parameters,
        creative_assets: newCampaign.creative_assets || [],
        channel_settings: newCampaign.channel_settings || {},
        tracking_settings: newCampaign.tracking_settings || {
          google_analytics_enabled: true,
          conversion_tracking_enabled: true,
          utm_tracking_enabled: true,
          custom_events: []
        },
        performance_metrics: {},
        conversion_goals: [],
        catalyst_recommendations: [],
        auto_optimization_enabled: true,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: { name: 'Current User', email: 'user@example.com' },
        total_steps: 0,
        active_insights: 0,
        budget_utilization: 0,
      };

      setCampaigns(prev => [campaignData, ...prev]);
      setFilteredCampaigns(prev => [campaignData, ...prev]);

      // Auto-update dashboard data
      await loadData();

      toast({
        title: 'Campaign Created',
        description: `${newCampaign.name} has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setNewCampaign({
        name: '',
        description: '',
        campaign_type: 'email' as const,
        objective: 'leads' as const,
        status: 'Draft',
        budget: 0,
        target_audience_segment: '',
        goal: '',
        tags: [],
        timezone: 'UTC',
        is_ab_test: false,
        channel_settings: {},
        tracking_settings: {
          google_analytics_enabled: true,
          conversion_tracking_enabled: true,
          utm_tracking_enabled: true,
          custom_events: []
        }
      });
      setCampaignCreationStep(1);
      onCreateModalClose();

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      let updatedCampaign = { ...campaign };

      switch (action) {
        case 'activate':
          updatedCampaign.status = 'Active';
          break;
        case 'pause':
          updatedCampaign.status = 'Paused';
          break;
        case 'resume':
          updatedCampaign.status = 'Active';
          break;
        case 'archive':
          updatedCampaign.status = 'Archived';
          break;
        case 'duplicate':
          const duplicatedCampaign = {
            ...campaign,
            id: Date.now().toString(),
            name: `${campaign.name} (Copy)`,
            status: 'Draft' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCampaigns(prev => [duplicatedCampaign, ...prev]);
          setFilteredCampaigns(prev => [duplicatedCampaign, ...prev]);
          toast({
            title: 'Campaign Duplicated',
            description: `${campaign.name} has been duplicated`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          return;
        case 'delete':
          setCampaigns(prev => prev.filter(c => c.id !== campaignId));
          setFilteredCampaigns(prev => prev.filter(c => c.id !== campaignId));
          toast({
            title: 'Campaign Deleted',
            description: `${campaign.name} has been deleted`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          return;
        default:
          return;
      }

      updatedCampaign.updated_at = new Date().toISOString();
      
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c));
      setFilteredCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c));

      toast({
        title: 'Campaign Updated',
        description: `${campaign.name} has been ${action}d successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Paused': return 'yellow';
      case 'Draft': return 'gray';
      case 'Completed': return 'blue';
      case 'Archived': return 'gray';
      case 'Scheduled': return 'purple';
      default: return 'gray';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return FiMail;
      case 'sms': return FiMessageSquare;
      case 'push': return FiBell;
      case 'social': return FiShare2;
      case 'in_app': return FiSmartphone;
      case 'paid_ads': return FiTrendingUp;
      case 'content': return FiBook;
      case 'event': return FiCalendar;
      case 'product_launch': return FiTarget;
      case 'lead_nurturing': return FiUsers;
      case 'retention': return FiHeart;
      case 'multi_channel': return FiGlobe;
      default: return FiTarget;
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'push': return 'Push Notification';
      case 'social': return 'Social Media';
      case 'in_app': return 'In-App Message';
      case 'paid_ads': return 'Paid Advertising';
      case 'content': return 'Content Marketing';
      case 'event': return 'Event Marketing';
      case 'product_launch': return 'Product Launch';
      case 'lead_nurturing': return 'Lead Nurturing';
      case 'retention': return 'Customer Retention';
      case 'multi_channel': return 'Multi-Channel';
      default: return type;
    }
  };

  const getObjectiveLabel = (objective: string) => {
    switch (objective) {
      case 'awareness': return 'Brand Awareness';
      case 'traffic': return 'Drive Traffic';
      case 'leads': return 'Generate Leads';
      case 'sales': return 'Increase Sales';
      case 'engagement': return 'Boost Engagement';
      case 'conversion': return 'Improve Conversion';
      case 'retention': return 'Customer Retention';
      case 'loyalty': return 'Build Loyalty';
      default: return objective;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (selectedCampaigns.length === 0) {
      toast({
        title: 'No Campaigns Selected',
        description: 'Please select campaigns to perform bulk actions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      selectedCampaigns.forEach(campaignId => {
        handleCampaignAction(campaignId, bulkAction);
      });

      setSelectedCampaigns([]);
      setBulkAction('');
      onBulkActionModalClose();

      toast({
        title: 'Bulk Action Completed',
        description: `${bulkAction} applied to ${selectedCampaigns.length} campaigns`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleUseTemplate = (template: CampaignTemplate) => {
    try {
      // Create a new campaign from the template
      const campaignData: Campaign = {
        id: Date.now().toString(),
        name: template.template_data.name || template.name,
        description: template.template_data.description || template.description,
        campaign_type: template.campaign_type,
        objective: template.objective,
        status: 'Draft',
        start_date: template.template_data.start_date,
        end_date: template.template_data.end_date,
        target_audience_segment: template.template_data.target_audience_segment,
        budget: template.template_data.budget || 0,
        spent_budget: 0,
        target_roi: template.template_data.target_roi,
        catalyst_health_score: undefined,
        goal: template.template_data.goal,
        audience_size: template.template_data.audience_size,
        reached_audience: template.template_data.reached_audience,
        conversions: template.template_data.conversions,
        conversion_rate: template.template_data.conversion_rate,
        ctr: template.template_data.ctr,
        open_rate: template.template_data.open_rate,
        revenue_generated: template.template_data.revenue_generated,
        cost_per_conversion: template.template_data.cost_per_conversion,
        roi: template.template_data.roi,
        tags: template.template_data.tags || template.tags,
        timezone: template.template_data.timezone || 'UTC',
        is_ab_test: template.template_data.is_ab_test || false,
        ab_test_config: template.template_data.ab_test_config,
        utm_parameters: template.template_data.utm_parameters,
        creative_assets: template.template_data.creative_assets || [],
        channel_settings: template.template_data.channel_settings || {},
        tracking_settings: template.template_data.tracking_settings || {
          google_analytics_enabled: true,
          conversion_tracking_enabled: true,
          utm_tracking_enabled: true,
          custom_events: []
        },
        performance_metrics: template.template_data.performance_metrics || {},
        conversion_goals: template.template_data.conversion_goals || [],
        catalyst_recommendations: [],
        auto_optimization_enabled: true,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: { name: 'Current User', email: 'user@example.com' },
        total_steps: 0,
        active_insights: 0,
        budget_utilization: 0,
        recent_insights: [],
        recent_activity: []
      };

      setCampaigns(prev => [campaignData, ...prev]);
      setFilteredCampaigns(prev => [campaignData, ...prev]);

      toast({
        title: 'Campaign Created from Template',
        description: `${template.name} campaign has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close template modal if open
      onTemplateModalClose();
      setSelectedTemplate(null);

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign from template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Campaign detail view
  const openCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaignForDetail(campaign);
    onCampaignDetailOpen();
  };

  // Filter management
  const clearFilters = () => {
    setCampaignFilters({
      status: [],
      campaign_type: [],
      date_range: 'all',
      search_query: '',
      budget_range: 'all',
      performance_filter: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (campaignFilters.status.length > 0) count++;
    if (campaignFilters.campaign_type.length > 0) count++;
    if (campaignFilters.date_range !== 'all') count++;
    if (campaignFilters.search_query) count++;
    if (campaignFilters.budget_range !== 'all') count++;
    if (campaignFilters.performance_filter !== 'all') count++;
    return count;
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

  if (error) {
    return (
      <Layout>
        <Alert status="error" borderRadius="md" mt={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Failed to load campaigns</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={6} px={{ base: 4, md: 6 }}>
                  {/* Header */}
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg" color="brand.primary">
                  Campaign Management
                </Heading>
                <Text color="gray.600">
                  AI-powered campaign optimization with Catalyst
                </Text>
              </VStack>
                          <Button
              leftIcon={<FiPlus />}
              bg="brand.primary"
              color="brand.accent"
              fontWeight="bold"
              _hover={{ bg: "#1a365d" }}
              onClick={onCreateModalOpen}
            >
              Create Campaign
            </Button>
            </HStack>

            {/* Catalyst AI Component - Moved to top */}
            <CatalystAI 
              insights={dashboardData?.recent_insights || []}
              recommendations={recommendations}
              healthScore={dashboardData?.average_roi || 0}
              onApplyRecommendation={(recommendation) => {
                toast({
                  title: 'Recommendation Applied',
                  description: `Applied: ${recommendation.title}`,
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              onDismissInsight={(insightId) => {
                toast({
                  title: 'Insight Dismissed',
                  description: 'Insight has been dismissed',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              onActionInsight={(insightId, action) => {
                toast({
                  title: 'Action Taken',
                  description: `Action "${action}" applied to insight`,
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            />

            {/* Project Manager Section */}
            <Box>
              <Heading size="md" color="brand.primary" mb={4}>
                Project Manager
              </Heading>
            </Box>

            {/* Tabs */}
          <Tabs index={parseInt(activeTab)} onChange={(index) => setActiveTab(index.toString())}>
            <TabList>
              <Tab>Dashboard</Tab>
              <Tab>Campaigns</Tab>
              <Tab>Catalyst Insights</Tab>
              <Tab>Templates</Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel>
                {dashboardData && (
                  <VStack spacing={6} align="stretch">
                    {/* Key Metrics */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Campaigns</StatLabel>
                            <StatNumber>{dashboardData.total_campaigns}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              12% from last month
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Active Campaigns</StatLabel>
                            <StatNumber>{dashboardData.active_campaigns}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              8% from last month
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Budget</StatLabel>
                            <StatNumber>${dashboardData.total_budget.toLocaleString()}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="decrease" />
                              5% from last month
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Avg ROI</StatLabel>
                            <StatNumber>{dashboardData.average_roi.toFixed(1)}%</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              15% from last month
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Catalyst Insights Summary */}
                    <Card>
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <HStack>
                            <FiCpu color="brand.primary" />
                            <Heading size="md">Catalyst AI Insights</Heading>
                          </HStack>
                          <Badge colorScheme="brand" variant="subtle">
                            {dashboardData.catalyst_insights_count} Active
                          </Badge>
                        </HStack>
                        <Text color="gray.600" mb={4}>
                          AI-powered recommendations to optimize your campaigns
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {dashboardData.recent_insights.slice(0, 4).map((insight) => (
                            <Box
                              key={insight.id}
                              p={3}
                              border="1px solid"
                              borderColor={borderColor}
                              borderRadius="md"
                              bg={bgColor}
                            >
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {insight.title}
                                </Text>
                                <Badge
                                  size="sm"
                                  colorScheme={
                                    insight.priority === 'critical' ? 'red' :
                                    insight.priority === 'high' ? 'orange' :
                                    insight.priority === 'medium' ? 'yellow' : 'green'
                                  }
                                >
                                  {insight.priority}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {insight.description}
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Top Performing Campaigns */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Top Performing Campaigns</Heading>
                        <VStack spacing={3} align="stretch">
                          {dashboardData.top_performing_campaigns.map((campaign) => (
                            <HStack
                              key={campaign.id}
                              p={3}
                              border="1px solid"
                              borderColor={borderColor}
                              borderRadius="md"
                              justify="space-between"
                            >
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{campaign.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {campaign.campaign_type} • {campaign.objective}
                                </Text>
                              </VStack>
                              <HStack spacing={3}>
                                <Badge colorScheme="green">
                                  Health: {campaign.catalyst_health_score || 0}%
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  View Details
                                </Button>
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                )}
              </TabPanel>

              {/* Campaigns Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Campaign Grid */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredCampaigns.map((campaign) => (
                      <Card key={campaign.id} _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all 0.2s">
                        <CardBody>
                          <VStack align="start" spacing={4}>
                            {/* Header */}
                            <HStack justify="space-between" w="full">
                              <VStack align="start" spacing={1}>
                                <Heading size="md" color="brand.primary">
                                  {campaign.name}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                  {campaign.description || 'No description'}
                                </Text>
                              </VStack>
                              <Badge colorScheme={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </HStack>

                            {/* Campaign Info */}
                            <VStack align="start" spacing={2} w="full">
                              <HStack spacing={2}>
                                <Badge size="sm" variant="outline">
                                  {campaign.campaign_type}
                                </Badge>
                                <Badge size="sm" variant="outline">
                                  {campaign.objective}
                                </Badge>
                              </HStack>
                              
                              {campaign.budget && (
                                <Box w="full">
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm">Budget Utilization</Text>
                                    <Text fontSize="sm">{campaign.budget_utilization.toFixed(1)}%</Text>
                                  </HStack>
                                  <Progress
                                    value={campaign.budget_utilization}
                                    colorScheme={campaign.budget_utilization > 80 ? 'red' : 'green'}
                                    size="sm"
                                  />
                                </Box>
                              )}

                              {campaign.catalyst_health_score && (
                                <HStack spacing={2}>
                                  <FiCpu color="brand.primary" />
                                  <Text fontSize="sm">
                                    Health Score: {campaign.catalyst_health_score}%
                                  </Text>
                                </HStack>
                              )}
                            </VStack>

                            {/* Actions */}
                            <HStack spacing={2} w="full">
                              <Button
                                size="sm"
                                colorScheme="brand"
                                variant="outline"
                                flex={1}
                                onClick={() => {
                                  setSelectedCampaignForManage(campaign);
                                  onManageModalOpen();
                                }}
                              >
                                Manage
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCampaignForDetail(campaign);
                                  onCampaignDetailOpen();
                                }}
                              >
                                <FiInfo />
                              </Button>
                            </HStack>
                            
                            {/* Status Actions */}
                            <HStack spacing={2} w="full">
                              {campaign.status === 'Draft' && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  flex={1}
                                  onClick={() => handleCampaignAction(campaign.id, 'activate')}
                                >
                                  <FiPlay />
                                  Activate
                                </Button>
                              )}
                              {campaign.status === 'Active' && (
                                <Button
                                  size="sm"
                                  colorScheme="yellow"
                                  flex={1}
                                  onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                >
                                  <FiPause />
                                  Pause
                                </Button>
                              )}
                              {campaign.status === 'Paused' && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  flex={1}
                                  onClick={() => handleCampaignAction(campaign.id, 'resume')}
                                >
                                  <FiPlay />
                                  Resume
                                </Button>
                              )}
                              <Button
                                size="sm"
                                colorScheme="purple"
                                variant="outline"
                                flex={1}
                                onClick={() => handleCampaignAction(campaign.id, 'duplicate')}
                              >
                                <FiCopy />
                                Duplicate
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => {
                                  setCampaignToDelete(campaign);
                                  onDeleteModalOpen();
                                }}
                              >
                                <FiX />
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>

                  {/* Empty State */}
                  {filteredCampaigns.length === 0 && (
                    <Box textAlign="center" py={12}>
                      <FiTarget size={48} color="gray.400" />
                      <Heading size="md" color="gray.500" mt={4}>
                        No campaigns yet - Ready for testing!
                      </Heading>
                      <Text color="gray.400" mt={2}>
                        All mock data has been cleared. Create your first campaign to test the functionality.
                      </Text>
                      <Button
                        leftIcon={<FiPlus />}
                        bg="brand.accent"
                        color="brand.primary"
                        fontWeight="bold"
                        _hover={{ bg: "#FFD700" }}
                        mt={4}
                        onClick={onCreateModalOpen}
                      >
                        Create Campaign
                      </Button>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Catalyst Insights Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                          <Heading size="md">Catalyst AI Recommendations</Heading>
                          <Text color="gray.600">
                            AI-powered insights to optimize your campaigns
                          </Text>
                        </VStack>
                        <Button
                          leftIcon={<FiRefreshCw />}
                          bg="brand.primary"
                          color="brand.accent"
                          fontWeight="bold"
                          _hover={{ bg: "#1a365d" }}
                          onClick={loadRecommendations}
                        >
                          Refresh
                        </Button>
                      </HStack>

                      <VStack spacing={4} align="stretch">
                        {recommendations.map((recommendation, index) => (
                          <Box
                            key={index}
                            p={4}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="lg"
                            bg={bgColor}
                          >
                            <HStack justify="space-between" mb={3}>
                              <HStack>
                                <FiZap color="brand.primary" />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold">{recommendation.title}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {recommendation.recommendation_type.replace('_', ' ')}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge
                                colorScheme={
                                  recommendation.priority === 'high' ? 'red' :
                                  recommendation.priority === 'medium' ? 'yellow' : 'green'
                                }
                              >
                                {recommendation.priority}
                              </Badge>
                            </HStack>

                            <Text color="gray.700" mb={3}>
                              {recommendation.description}
                            </Text>

                            <HStack spacing={4} mb={3}>
                              <Stat size="sm">
                                <StatLabel>Impact Score</StatLabel>
                                <StatNumber>{recommendation.impact_score}/10</StatNumber>
                              </Stat>
                              <Stat size="sm">
                                <StatLabel>Confidence</StatLabel>
                                <StatNumber>{recommendation.confidence_score}%</StatNumber>
                              </Stat>
                            </HStack>

                            <Box mb={3}>
                              <Text fontWeight="medium" mb={2}>Action Items:</Text>
                              <List spacing={1}>
                                {recommendation.action_items.map((item, idx) => (
                                  <ChakraListItem key={idx} fontSize="sm">
                                    <ListIcon as={FiCheck} color="green.500" />
                                    {item}
                                  </ChakraListItem>
                                ))}
                              </List>
                            </Box>

                            <HStack justify="space-between">
                              <Button 
                                size="sm" 
                                bg="brand.primary"
                                color="brand.accent"
                                fontWeight="bold"
                                _hover={{ bg: "#1a365d" }}
                              >
                                Apply Recommendation
                              </Button>
                              <Button 
                                size="sm" 
                                bg="brand.primary"
                                color="brand.accent"
                                fontWeight="bold"
                                _hover={{ bg: "#1a365d" }}
                              >
                                Learn More
                              </Button>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Templates Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Campaign Templates</Heading>
                      <Text color="gray.600" mb={6}>
                        Pre-built campaign templates to get you started quickly
                      </Text>
                      
                      {templates.length === 0 ? (
                        <Box textAlign="center" py={12}>
                          <FiBook size={48} color="gray.400" />
                          <Heading size="md" color="gray.500" mt={4}>
                            No templates available
                          </Heading>
                          <Text color="gray.400" mt={2}>
                            Templates have been cleared for testing. You can create campaigns manually.
                          </Text>
                        </Box>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {templates.map((template) => (
                            <Card 
                              key={template.id}
                              variant="outline" 
                              cursor="pointer" 
                              _hover={{ borderColor: 'brand.primary', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                              transition="all 0.2s"
                              onClick={() => {
                                setSelectedTemplate(template);
                                onTemplateModalOpen();
                              }}
                            >
                              <CardBody>
                                <VStack spacing={4} align="center">
                                  <Box color="brand.primary">
                                    <template.icon size={48} />
                                  </Box>
                                  <VStack spacing={2} align="center">
                                    <Heading size="sm">{template.name}</Heading>
                                    <Text fontSize="sm" color="gray.600" textAlign="center">
                                      {template.description}
                                    </Text>
                                  </VStack>
                                  
                                  <HStack spacing={2} wrap="wrap" justify="center">
                                    <Badge size="sm" colorScheme="blue" variant="subtle">
                                      {template.category}
                                    </Badge>
                                    <Badge 
                                      size="sm" 
                                      colorScheme={
                                        template.difficulty === 'beginner' ? 'green' :
                                        template.difficulty === 'intermediate' ? 'yellow' : 'red'
                                      }
                                      variant="subtle"
                                    >
                                      {template.difficulty}
                                    </Badge>
                                  </HStack>
                                  
                                  <VStack spacing={2} align="start" w="full">
                                    <Text fontSize="xs" fontWeight="medium" color="gray.700">
                                      Features:
                                    </Text>
                                    <List spacing={1} fontSize="xs">
                                      {template.features.slice(0, 3).map((feature, idx) => (
                                        <ChakraListItem key={idx}>
                                          <ListIcon as={FiCheck} color="green.500" />
                                          {feature}
                                        </ChakraListItem>
                                      ))}
                                      {template.features.length > 3 && (
                                        <Text fontSize="xs" color="gray.500">
                                          +{template.features.length - 3} more features
                                        </Text>
                                      )}
                                    </List>
                                  </VStack>
                                  
                                  <HStack justify="space-between" w="full">
                                    <Text fontSize="xs" color="gray.600">
                                      Duration: {template.estimated_duration}
                                    </Text>
                                    <Button
                                      size="sm"
                                      colorScheme="brand"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUseTemplate(template);
                                      }}
                                    >
                                      Use Template
                                    </Button>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Create Campaign Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Campaign</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Campaign Name</FormLabel>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                    rows={3}
                  />
                </FormControl>
                
                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select
                      value={newCampaign.campaign_type}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, campaign_type: e.target.value as Campaign['campaign_type'] }))}
                    >
                      <option value="email">Email Campaign</option>
                      <option value="social">Social Media Campaign</option>
                      <option value="paid_ads">Paid Advertising</option>
                      <option value="content">Content Marketing</option>
                      <option value="event">Event Marketing</option>
                      <option value="product_launch">Product Launch</option>
                      <option value="lead_nurturing">Lead Nurturing</option>
                      <option value="retention">Customer Retention</option>
                      <option value="multi_channel">Multi-Channel</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Objective</FormLabel>
                    <Select
                      value={newCampaign.objective}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, objective: e.target.value as Campaign['objective'] }))}
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
                </HStack>
                
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Target Audience</FormLabel>
                    <Input
                      value={newCampaign.target_audience_segment}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, target_audience_segment: e.target.value }))}
                      placeholder="e.g., New customers, Existing customers"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Budget</FormLabel>
                    <NumberInput
                      value={newCampaign.budget}
                      onChange={(value) => setNewCampaign(prev => ({ ...prev, budget: Number(value) }))}
                    >
                      <NumberInputField placeholder="Enter budget" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
                Cancel
              </Button>
              <Button
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "#1a365d" }}
                onClick={handleCreateCampaign}
                isDisabled={!newCampaign.name || isCreatingCampaign}
                isLoading={isCreatingCampaign}
                loadingText="Creating Campaign..."
              >
                Create Campaign
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Campaign Detail Modal */}
        <Modal isOpen={isCampaignDetailOpen} onClose={onCampaignDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedCampaignForDetail?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="start" spacing={4}>
                <Box w="full">
                  <Heading size="md" mb={2}>Campaign Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Stat>
                      <StatLabel>Campaign Type</StatLabel>
                      <StatNumber>{getCampaignTypeLabel(selectedCampaignForDetail?.campaign_type || '')}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Objective</StatLabel>
                      <StatNumber>{getObjectiveLabel(selectedCampaignForDetail?.objective || '')}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Status</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.status}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Start Date</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.start_date ? formatDate(selectedCampaignForDetail.start_date) : 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>End Date</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.end_date ? formatDate(selectedCampaignForDetail.end_date) : 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Budget</StatLabel>
                      <StatNumber>{formatCurrency(selectedCampaignForDetail?.budget || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Spent Budget</StatLabel>
                      <StatNumber>{formatCurrency(selectedCampaignForDetail?.spent_budget || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Target Audience</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.target_audience_segment || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Goal</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.goal || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Catalyst Health Score</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.catalyst_health_score || 0}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Days Remaining</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.days_remaining || 0}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Performance Metrics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Stat>
                      <StatLabel>Impressions</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.impressions || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Clicks</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.clicks || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Conversions</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.conversions || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Revenue</StatLabel>
                      <StatNumber>{formatCurrency(selectedCampaignForDetail?.performance_metrics?.revenue || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Cost</StatLabel>
                      <StatNumber>{formatCurrency(selectedCampaignForDetail?.performance_metrics?.cost || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Conversion Rate</StatLabel>
                      <StatNumber>{formatPercentage(selectedCampaignForDetail?.conversion_rate || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Open Rate</StatLabel>
                      <StatNumber>{formatPercentage(selectedCampaignForDetail?.open_rate || 0)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Bounce Rate</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.bounce_rate || 0}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Unsubscribe Rate</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.unsubscribe_rate || 0}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Delivery Rate</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.delivery_rate || 0}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Engagement Rate</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.engagement_rate || 0}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Shares</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.shares || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Comments</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.comments || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Reach</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.performance_metrics?.reach || 0}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Conversion Goals</Heading>
                  <List spacing={2}>
                    {selectedCampaignForDetail?.conversion_goals.map((goal) => (
                      <ChakraListItem key={goal.id}>
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium">{goal.name}</Text>
                          <Badge colorScheme="purple" variant="subtle">
                            {goal.type}
                          </Badge>
                          <Stat size="sm">
                            <StatLabel>Value</StatLabel>
                            <StatNumber>{goal.value || 0}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Target</StatLabel>
                            <StatNumber>{goal.target || 0}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Achieved</StatLabel>
                            <StatNumber>{goal.achieved || 0}</StatNumber>
                          </Stat>
                        </HStack>
                      </ChakraListItem>
                    ))}
                  </List>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Catalyst Recommendations</Heading>
                  <List spacing={2}>
                    {selectedCampaignForDetail?.catalyst_recommendations.map((recommendation) => (
                      <ChakraListItem key={recommendation.id}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{recommendation.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {recommendation.recommendation_type.replace('_', ' ')}
                            </Text>
                          </VStack>
                          <Badge
                            colorScheme={
                              recommendation.priority === 'high' ? 'red' :
                              recommendation.priority === 'medium' ? 'yellow' : 'green'
                            }
                          >
                            {recommendation.priority}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.700" mt={1}>
                          {recommendation.description}
                        </Text>
                        <HStack spacing={2} mt={2}>
                          <Stat size="sm">
                            <StatLabel>Impact Score</StatLabel>
                            <StatNumber>{recommendation.impact_score}/10</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Confidence</StatLabel>
                            <StatNumber>{recommendation.confidence_score}%</StatNumber>
                          </Stat>
                        </HStack>
                        <Box mt={2}>
                          <Text fontWeight="medium" mb={1}>Action Items:</Text>
                          <List spacing={1}>
                            {recommendation.action_items.map((item, idx) => (
                              <ChakraListItem key={idx} fontSize="sm">
                                <ListIcon as={FiCheck} color="green.500" />
                                {item}
                              </ChakraListItem>
                            ))}
                          </List>
                        </Box>
                      </ChakraListItem>
                    ))}
                  </List>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Creative Assets</Heading>
                  <List spacing={2}>
                    {selectedCampaignForDetail?.creative_assets?.map((asset) => (
                      <ChakraListItem key={asset.id}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{asset.name}</Text>
                            <Text fontSize="sm" color="gray.600">{asset.type}</Text>
                          </VStack>
                          <Button size="sm" variant="ghost" colorScheme="brand">
                            <FiDownload />
                          </Button>
                        </HStack>
                      </ChakraListItem>
                    ))}
                  </List>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Channel Settings</Heading>
                  <VStack align="start" spacing={4}>
                    {selectedCampaignForDetail?.channel_settings?.email && (
                      <Box w="full">
                        <Heading size="md" mb={2}>Email Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          <Stat>
                            <StatLabel>Sender Name</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.sender_name}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Sender Email</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.sender_email}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Subject Line</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.subject_line}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Preheader Text</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.preheader_text || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Template ID</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.template_id || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Bounce Handling</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.bounce_handling}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Unsubscribe Options</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.email.unsubscribe_options ? 'Enabled' : 'Disabled'}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    )}
                    {selectedCampaignForDetail?.channel_settings?.sms && (
                      <Box w="full">
                        <Heading size="md" mb={2}>SMS Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          <Stat>
                            <StatLabel>Message Body</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.sms.message_body}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Sender ID</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.sms.sender_id}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Opt-out Keywords</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.sms.opt_out_keywords.join(', ')}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>DLT Compliance</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.sms.dlt_compliance ? 'Yes' : 'No'}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    )}
                    {selectedCampaignForDetail?.channel_settings?.push && (
                      <Box w="full">
                        <Heading size="md" mb={2}>Push Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          <Stat>
                            <StatLabel>Title</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.title}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Message</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.message}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Image URL</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.image_url || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>CTA Text</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.cta_text || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>CTA URL</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.cta_url || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Sound Enabled</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.sound_enabled ? 'Yes' : 'No'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Vibration Enabled</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.push.vibration_enabled ? 'Yes' : 'No'}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    )}
                    {selectedCampaignForDetail?.channel_settings?.social && (
                      <Box w="full">
                        <Heading size="md" mb={2}>Social Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          <Stat>
                            <StatLabel>Platforms</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.platforms.join(', ')}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Post Content</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.post_content}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Hashtags</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.hashtags.join(', ')}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Image URL</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.image_url || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Video URL</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.video_url || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Scheduled Posts</StatLabel>
                            <StatNumber>{selectedCampaignForDetail.channel_settings.social.scheduled_posts.length}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Tracking Settings</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    <Stat>
                      <StatLabel>Google Analytics Enabled</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.tracking_settings?.google_analytics_enabled ? 'Yes' : 'No'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Conversion Tracking Enabled</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.tracking_settings?.conversion_tracking_enabled ? 'Yes' : 'No'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>UTM Tracking Enabled</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.tracking_settings?.utm_tracking_enabled ? 'Yes' : 'No'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Custom Events</StatLabel>
                      <StatNumber>{selectedCampaignForDetail?.tracking_settings?.custom_events.length || 0}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Insights</Heading>
                  <List spacing={2}>
                    {selectedCampaignForDetail?.active_insights > 0 && (
                      <ChakraListItem>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">Active Insights</Text>
                            <Text fontSize="sm" color="gray.600">
                              {selectedCampaignForDetail.active_insights} insights available
                            </Text>
                          </VStack>
                          <Badge colorScheme="purple" variant="subtle">
                            {selectedCampaignForDetail.active_insights}
                          </Badge>
                        </HStack>
                      </ChakraListItem>
                    )}
                    {selectedCampaignForDetail?.recent_insights.map((insight) => (
                      <ChakraListItem key={insight.id}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{insight.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {insight.insight_type}
                            </Text>
                          </VStack>
                          <Badge
                            colorScheme={
                              insight.priority === 'critical' ? 'red' :
                              insight.priority === 'high' ? 'orange' :
                              insight.priority === 'medium' ? 'yellow' : 'green'
                            }
                          >
                            {insight.priority}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.700" mt={1}>
                          {insight.description}
                        </Text>
                        <HStack spacing={2} mt={2}>
                          <Stat size="sm">
                            <StatLabel>Priority</StatLabel>
                            <StatNumber>{insight.priority}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Confidence Score</StatLabel>
                            <StatNumber>{insight.confidence_score || 0}%</StatNumber>
                          </Stat>
                        </HStack>
                        <Box mt={2}>
                          <Text fontWeight="medium" mb={1}>Recommendation:</Text>
                          <Text fontSize="sm" color="gray.800">{insight.recommendation}</Text>
                        </Box>
                        <HStack spacing={2} mt={2}>
                          <Stat size="sm">
                            <StatLabel>Predicted Impact</StatLabel>
                            <StatNumber>{insight.predicted_impact || 'N/A'}</StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel>Action Taken</StatLabel>
                            <StatNumber>{insight.action_taken || 'N/A'}</StatNumber>
                          </Stat>
                        </HStack>
                      </ChakraListItem>
                    ))}
                  </List>
                </Box>

                <Box w="full">
                  <Heading size="md" mb={2}>Activity Log</Heading>
                  <List spacing={2}>
                    {selectedCampaignForDetail?.recent_activity.map((log) => (
                      <ChakraListItem key={log.id}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{log.action}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {log.campaign_name} by {log.user} on {formatDate(log.timestamp)}
                            </Text>
                          </VStack>
                          <Badge colorScheme="blue" variant="subtle">
                            {log.timestamp}
                          </Badge>
                        </HStack>
                        {log.details && (
                          <Text fontSize="sm" color="gray.700" mt={1}>
                            Details: {log.details}
                          </Text>
                        )}
                      </ChakraListItem>
                    ))}
                  </List>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCampaignDetailClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Campaign Management Modal */}
        <Modal isOpen={isManageModalOpen} onClose={onManageModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Manage Campaign: {selectedCampaignForManage?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="start" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Campaign Name</FormLabel>
                  <Input
                    value={selectedCampaignForManage?.name}
                    onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={selectedCampaignForManage?.description}
                    onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                    rows={3}
                  />
                </FormControl>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select
                      value={selectedCampaignForManage?.campaign_type}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, campaign_type: e.target.value }))}
                    >
                      <option value="email">Email Campaign</option>
                      <option value="social">Social Media Campaign</option>
                      <option value="paid_ads">Paid Advertising</option>
                      <option value="content">Content Marketing</option>
                      <option value="event">Event Marketing</option>
                      <option value="product_launch">Product Launch</option>
                      <option value="lead_nurturing">Lead Nurturing</option>
                      <option value="retention">Customer Retention</option>
                      <option value="multi_channel">Multi-Channel</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Objective</FormLabel>
                    <Select
                      value={selectedCampaignForManage?.objective}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, objective: e.target.value }))}
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
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Target Audience</FormLabel>
                    <Input
                      value={selectedCampaignForManage?.target_audience_segment}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, target_audience_segment: e.target.value }))}
                      placeholder="e.g., New customers, Existing customers"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Budget</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.budget}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, budget: value }))}
                    >
                      <NumberInputField placeholder="Enter budget" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={selectedCampaignForManage?.start_date}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={selectedCampaignForManage?.end_date}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Goal</FormLabel>
                    <Input
                      value={selectedCampaignForManage?.goal}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, goal: e.target.value }))}
                      placeholder="e.g., Increase sales by 25%"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Audience Size</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.audience_size}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, audience_size: value }))}
                    >
                      <NumberInputField placeholder="Enter audience size" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Reached Audience</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.reached_audience}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, reached_audience: value }))}
                    >
                      <NumberInputField placeholder="Enter reached audience" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Conversions</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.conversions}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, conversions: value }))}
                    >
                      <NumberInputField placeholder="Enter conversions" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Conversion Rate</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.conversion_rate}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, conversion_rate: value }))}
                    >
                      <NumberInputField placeholder="Enter conversion rate" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTR</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.ctr}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, ctr: value }))}
                    >
                      <NumberInputField placeholder="Enter CTR" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Open Rate</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.open_rate}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, open_rate: value }))}
                    >
                      <NumberInputField placeholder="Enter open rate" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Revenue Generated</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.revenue_generated}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, revenue_generated: value }))}
                    >
                      <NumberInputField placeholder="Enter revenue generated" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Cost Per Conversion</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.cost_per_conversion}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, cost_per_conversion: value }))}
                    >
                      <NumberInputField placeholder="Enter cost per conversion" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>ROI</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.roi}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, roi: value }))}
                    >
                      <NumberInputField placeholder="Enter ROI" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Budget Utilization</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.budget_utilization}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, budget_utilization: value }))}
                    >
                      <NumberInputField placeholder="Enter budget utilization" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Days Remaining</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.days_remaining}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, days_remaining: value }))}
                    >
                      <NumberInputField placeholder="Enter days remaining" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Is A/B Test</FormLabel>
                    <Select
                      value={selectedCampaignForManage?.is_ab_test ? 'yes' : 'no'}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, is_ab_test: e.target.value === 'yes' }))}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </FormControl>
                  {selectedCampaignForManage?.is_ab_test && (
                    <FormControl>
                      <FormLabel>AB Test Config</FormLabel>
                      <Textarea
                        value={JSON.stringify(selectedCampaignForManage?.ab_test_config, null, 2)}
                        onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, ab_test_config: JSON.parse(e.target.value) }))}
                        placeholder="Enter AB Test Config (JSON)"
                        rows={3}
                      />
                    </FormControl>
                  )}
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>UTM Parameters</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.utm_parameters, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, utm_parameters: JSON.parse(e.target.value) }))}
                      placeholder="Enter UTM Parameters (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Creative Assets</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.creative_assets, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, creative_assets: JSON.parse(e.target.value) }))}
                      placeholder="Enter Creative Assets (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Channel Settings</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.channel_settings, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, channel_settings: JSON.parse(e.target.value) }))}
                      placeholder="Enter Channel Settings (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Tracking Settings</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.tracking_settings, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, tracking_settings: JSON.parse(e.target.value) }))}
                      placeholder="Enter Tracking Settings (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Performance Metrics</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.performance_metrics, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, performance_metrics: JSON.parse(e.target.value) }))}
                      placeholder="Enter Performance Metrics (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Conversion Goals</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.conversion_goals, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, conversion_goals: JSON.parse(e.target.value) }))}
                      placeholder="Enter Conversion Goals (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Catalyst Recommendations</FormLabel>
                    <Textarea
                      value={JSON.stringify(selectedCampaignForManage?.catalyst_recommendations, null, 2)}
                      onChange={(e) => setSelectedCampaignForManage(prev => prev ? { ...prev, catalyst_recommendations: JSON.parse(e.target.value) } : null)}
                      placeholder="Enter Catalyst Recommendations (JSON)"
                      rows={3}
                    />
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Active Insights</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.active_insights}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, active_insights: value }))}
                    >
                      <NumberInputField placeholder="Enter active insights" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Total Steps</FormLabel>
                    <NumberInput
                      value={selectedCampaignForManage?.total_steps}
                      onChange={(value) => setSelectedCampaignForManage(prev => ({ ...prev, total_steps: value }))}
                    >
                      <NumberInputField placeholder="Enter total steps" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Auto Optimization Enabled</FormLabel>
                    <Select
                      value={selectedCampaignForManage?.auto_optimization_enabled ? 'yes' : 'no'}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, auto_optimization_enabled: e.target.value === 'yes' }))}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </FormControl>
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Is Template</FormLabel>
                    <Select
                      value={selectedCampaignForManage?.is_template ? 'yes' : 'no'}
                      onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, is_template: e.target.value === 'yes' }))}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </FormControl>
                  {selectedCampaignForManage?.is_template && (
                    <FormControl>
                      <FormLabel>Template Category</FormLabel>
                      <Input
                        value={selectedCampaignForManage?.template_category}
                        onChange={(e) => setSelectedCampaignForManage(prev => ({ ...prev, template_category: e.target.value }))}
                        placeholder="e.g., Email, Social, Paid Ads"
                      />
                    </FormControl>
                  )}
                </HStack>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Created By</FormLabel>
                    <Text>{selectedCampaignForManage?.created_by?.name || 'N/A'}</Text>
                    <Text fontSize="sm" color="gray.600">{selectedCampaignForManage?.created_by?.email || 'N/A'}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Created At</FormLabel>
                    <Text>{formatDate(selectedCampaignForManage?.created_at || '')}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Updated At</FormLabel>
                    <Text>{formatDate(selectedCampaignForManage?.updated_at || '')}</Text>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onManageModalClose}>
                Cancel
              </Button>
              <Button
                bg="brand.primary"
                color="brand.accent"
                fontWeight="bold"
                _hover={{ bg: "#1a365d" }}
                onClick={() => {
                  const updatedCampaign = selectedCampaignForManage;
                  if (updatedCampaign) {
                    handleCampaignAction(updatedCampaign.id, 'update'); // Assuming 'update' is the action for saving changes
                  }
                  onManageModalClose();
                }}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
                 </Modal>

         {/* Delete Confirmation Modal */}
         <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
           <ModalOverlay />
           <ModalContent>
             <ModalHeader>Delete Campaign</ModalHeader>
             <ModalCloseButton />
             <ModalBody>
               <VStack spacing={4}>
                 <Alert status="warning">
                   <AlertIcon />
                   <Box>
                     <AlertTitle>Are you sure?</AlertTitle>
                     <AlertDescription>
                       This action cannot be undone. The campaign "{campaignToDelete?.name}" will be permanently deleted.
                     </AlertDescription>
                   </Box>
                 </Alert>
                 <Text>
                   This will remove all campaign data, performance metrics, and associated assets.
                 </Text>
               </VStack>
             </ModalBody>
             <ModalFooter>
               <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
                 Cancel
               </Button>
               <Button
                 colorScheme="red"
                 onClick={() => {
                   if (campaignToDelete) {
                     handleCampaignAction(campaignToDelete.id, 'delete');
                     onDeleteModalClose();
                     setCampaignToDelete(null);
                   }
                 }}
               >
                 Delete Campaign
               </Button>
             </ModalFooter>
           </ModalContent>
         </Modal>

         {/* Template Preview Modal */}
         <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose} size="xl">
           <ModalOverlay />
           <ModalContent>
             <ModalHeader>
               <HStack>
                 <Box color="brand.primary">
                   {selectedTemplate && <selectedTemplate.icon size={24} />}
                 </Box>
                 <Text>{selectedTemplate?.name} Template</Text>
               </HStack>
             </ModalHeader>
             <ModalCloseButton />
             <ModalBody>
               {selectedTemplate && (
                 <VStack spacing={6} align="stretch">
                   {/* Template Overview */}
                   <Box>
                     <Heading size="md" mb={3}>Template Overview</Heading>
                     <Text color="gray.600" mb={4}>
                       {selectedTemplate.description}
                     </Text>
                     
                     <HStack spacing={4} mb={4}>
                       <Badge colorScheme="blue" variant="subtle">
                         {selectedTemplate.category}
                       </Badge>
                       <Badge 
                         colorScheme={
                           selectedTemplate.difficulty === 'beginner' ? 'green' :
                           selectedTemplate.difficulty === 'intermediate' ? 'yellow' : 'red'
                         }
                         variant="subtle"
                       >
                         {selectedTemplate.difficulty}
                       </Badge>
                       <Badge colorScheme="purple" variant="subtle">
                         {selectedTemplate.estimated_duration}
                       </Badge>
                     </HStack>
                   </Box>

                   {/* Features */}
                   <Box>
                     <Heading size="md" mb={3}>Features Included</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                       {selectedTemplate.features.map((feature, idx) => (
                         <HStack key={idx} spacing={2}>
                           <FiCheck color="green.500" />
                           <Text fontSize="sm">{feature}</Text>
                         </HStack>
                       ))}
                     </SimpleGrid>
                   </Box>

                   {/* Campaign Details */}
                   <Box>
                     <Heading size="md" mb={3}>Campaign Details</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                       <Stat>
                         <StatLabel>Campaign Type</StatLabel>
                         <StatNumber>{getCampaignTypeLabel(selectedTemplate.campaign_type)}</StatNumber>
                       </Stat>
                       <Stat>
                         <StatLabel>Objective</StatLabel>
                         <StatNumber>{getObjectiveLabel(selectedTemplate.objective)}</StatNumber>
                       </Stat>
                       <Stat>
                         <StatLabel>Target Audience</StatLabel>
                         <StatNumber>{selectedTemplate.template_data.target_audience_segment || 'N/A'}</StatNumber>
                       </Stat>
                       <Stat>
                         <StatLabel>Budget</StatLabel>
                         <StatNumber>{formatCurrency(selectedTemplate.template_data.budget || 0)}</StatNumber>
                       </Stat>
                       <Stat>
                         <StatLabel>Goal</StatLabel>
                         <StatNumber>{selectedTemplate.template_data.goal || 'N/A'}</StatNumber>
                       </Stat>
                       <Stat>
                         <StatLabel>Tags</StatLabel>
                         <StatNumber>{selectedTemplate.tags.join(', ')}</StatNumber>
                       </Stat>
                     </SimpleGrid>
                   </Box>

                   {/* Channel Settings Preview */}
                   {selectedTemplate.template_data.channel_settings && (
                     <Box>
                       <Heading size="md" mb={3}>Channel Settings</Heading>
                       <VStack spacing={3} align="stretch">
                         {selectedTemplate.template_data.channel_settings.email && (
                           <Box p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                             <HStack mb={2}>
                               <FiMail color="brand.primary" />
                               <Text fontWeight="medium">Email Settings</Text>
                             </HStack>
                             <VStack align="start" spacing={1}>
                               <Text fontSize="sm"><strong>Sender:</strong> {selectedTemplate.template_data.channel_settings.email.sender_name}</Text>
                               <Text fontSize="sm"><strong>Subject:</strong> {selectedTemplate.template_data.channel_settings.email.subject_line}</Text>
                               <Text fontSize="sm"><strong>Preheader:</strong> {selectedTemplate.template_data.channel_settings.email.preheader_text}</Text>
                             </VStack>
                           </Box>
                         )}
                         
                         {selectedTemplate.template_data.channel_settings.social && (
                           <Box p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                             <HStack mb={2}>
                               <FiShare2 color="brand.primary" />
                               <Text fontWeight="medium">Social Media Settings</Text>
                             </HStack>
                             <VStack align="start" spacing={1}>
                               <Text fontSize="sm"><strong>Platforms:</strong> {selectedTemplate.template_data.channel_settings.social.platforms.join(', ')}</Text>
                               <Text fontSize="sm"><strong>Hashtags:</strong> {selectedTemplate.template_data.channel_settings.social.hashtags.join(', ')}</Text>
                             </VStack>
                           </Box>
                         )}
                       </VStack>
                     </Box>
                   )}

                   {/* Tracking Settings */}
                   {selectedTemplate.template_data.tracking_settings && (
                     <Box>
                       <Heading size="md" mb={3}>Tracking & Analytics</Heading>
                       <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                         <HStack>
                           <FiCheck color={selectedTemplate.template_data.tracking_settings.google_analytics_enabled ? "green.500" : "gray.400"} />
                           <Text fontSize="sm">Google Analytics</Text>
                         </HStack>
                         <HStack>
                           <FiCheck color={selectedTemplate.template_data.tracking_settings.conversion_tracking_enabled ? "green.500" : "gray.400"} />
                           <Text fontSize="sm">Conversion Tracking</Text>
                         </HStack>
                         <HStack>
                           <FiCheck color={selectedTemplate.template_data.tracking_settings.utm_tracking_enabled ? "green.500" : "gray.400"} />
                           <Text fontSize="sm">UTM Tracking</Text>
                         </HStack>
                         <HStack>
                           <FiCheck color="green.500" />
                           <Text fontSize="sm">{selectedTemplate.template_data.tracking_settings.custom_events.length} Custom Events</Text>
                         </HStack>
                       </SimpleGrid>
                     </Box>
                   )}
                 </VStack>
               )}
             </ModalBody>
             <ModalFooter>
               <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
                 Cancel
               </Button>
               <Button
                 bg="brand.primary"
                 color="brand.accent"
                 fontWeight="bold"
                 _hover={{ bg: "#1a365d" }}
                 onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
                 leftIcon={<FiPlus />}
               >
                 Use This Template
               </Button>
             </ModalFooter>
           </ModalContent>
         </Modal>
        </Box>
      </Layout>
    );
  }

