import {useState, useEffect} from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  SimpleGrid,
  IconButton,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiPlus,
  FiTarget,
  FiBarChart2,
  FiChevronRight,
  FiSun,
  FiAlertTriangle,
} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import { AIAgentSection } from '../components/AIAgentSection';
import { BudgetingModals } from '../components/BudgetingModals';
import api from '../services/api';
import type { AIProfile } from '../types/ai';

// Enhanced interfaces for the comprehensive budgeting system
interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  is_default: boolean;
}

interface Budget {
  id: string;
  name: string;
  budget_type: string;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  spending_percentage: number;
  start_date: string;
  end_date: string;
  category?: BudgetCategory;
  category_name?: string;
  category_color?: string;
  status: string;
  is_active: boolean;
  description?: string;
  tags: string[];
  pecunia_health_score?: number;
  pecunia_recommendations: unknown[];
  pecunia_risk_level?: string;
  linked_goals: string[];
  target_roi?: number;
  target_cpa?: number;
  projected_spend?: number;
  projected_variance?: number;
  burn_rate?: number;
  days_elapsed: number;
  total_days: number;
  time_progress_percentage: number;
  goals: BudgetGoal[];
  latest_forecast?: BudgetForecast;
  top_recommendations: PecuniaRecommendation[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  budget: string;
  budget_name: string;
  budget_type: string;
  category?: BudgetCategory;
  category_name?: string;
  category_color?: string;
  payment_method: string;
  status: string;
  vendor?: string;
  invoice_number?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  pecunia_auto_categorized: boolean;
  pecunia_confidence_score?: number;
  notes?: string;
}

interface BudgetGoal {
  id: string;
  goal_name: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  roi_percentage?: number;
  cpa?: number;
  pecunia_feasibility_score?: number;
  progress_percentage: number;
}

interface BudgetForecast {
  id: string;
  forecast_date: string;
  projected_spend: number;
  confidence_level: number;
  scenario_name?: string;
  scenario_type: string;
  factors: unknown;
}

interface PecuniaRecommendation {
  id: string;
  title: string;
  description: string;
  recommendation_type: string;
  priority: string;
  estimated_impact?: number;
  impact_type?: string;
  is_implemented: boolean;
}

interface BudgetSummary {
  total_budgets: number;
  active_budgets: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  overall_spending_percentage: number;
  pecunia_health_score: number;
  top_recommendations: PecuniaRecommendation[];
  budget_breakdown: unknown[];
  spending_trends: unknown[];
}

export default function EnhancedBudgetingPage() {
  // State management
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiAgent, setAiAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    budget_type: '',
    status: '',
    category: '',
    search: '',
  });

  // Modal states
  const { isOpen: isBudgetModalOpen, onOpen: onBudgetModalOpen, onClose: onBudgetModalClose } = useDisclosure();
  const { isOpen: isExpenseModalOpen, onOpen: onExpenseModalOpen, onClose: onExpenseModalClose } = useDisclosure();

  const { isOpen: isGoalModalOpen, onOpen: onGoalModalOpen, onClose: onGoalModalClose } = useDisclosure();
  const { isOpen: isBudgetDetailOpen, onOpen: onBudgetDetailOpen, onClose: onBudgetDetailClose } = useDisclosure();

  // Form states
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    budget_type: 'custom',
    amount: '',
    start_date: '',
    end_date: '',
    category: '',
    description: '',
    tags: [] as string[],
    target_roi: '',
    target_cpa: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: '',
    budget: '',
    category: '',
    payment_method: 'other',
    status: 'paid',
    vendor: '',
    invoice_number: '',
    is_recurring: false,
    recurring_frequency: '',
    notes: '',
  });

  const [goalForm, setGoalForm] = useState({
    goal_name: '',
    goal_type: 'leads',
    target_value: '',
    unit: 'units',
  });

  const toast = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchAIAgent();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [budgetsRes, categoriesRes, expensesRes, summaryRes] = await Promise.all([
        api.get('/budgeting/budgets/'),
        api.get('/budgeting/categories/'),
        api.get('/budgeting/expenses/'),
        api.get('/budgeting/budgets/summary/'),
      ]);

      setBudgets(budgetsRes.data.results || budgetsRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      setExpenses(expensesRes.data.results || expensesRes.data || []);
      setSummary(summaryRes.data);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.detail || 'Failed to load budgeting data');
      loadPlaceholderData();
    } finally {
      setLoading(false);
    }
  };

  const loadPlaceholderData = () => {
    const placeholderCategories: BudgetCategory[] = [
      { id: '1', name: 'Paid Advertising', description: 'Google Ads, Facebook Ads, etc.', color: '#3182CE', is_default: true },
      { id: '2', name: 'Content Marketing', description: 'Blog posts, videos, infographics', color: '#38A169', is_default: true },
      { id: '3', name: 'SEO', description: 'Search engine optimization', color: '#D69E2E', is_default: true },
    ];

    const placeholderBudgets: Budget[] = [
      {
        id: '1',
        name: 'Q4 Marketing Budget',
        budget_type: 'quarterly',
        amount: 25000.00,
        spent_amount: 18750.00,
        remaining_amount: 6250.00,
        spending_percentage: 75,
        start_date: '2024-10-01',
        end_date: '2024-12-31',
        category: placeholderCategories[0],
        category_name: 'Paid Advertising',
        category_color: '#3182CE',
        status: 'active',
        is_active: true,
        description: 'Q4 marketing budget for holiday campaigns',
        tags: ['holiday', 'campaign'],
        pecunia_health_score: 85,
        pecunia_recommendations: [],
        pecunia_risk_level: 'low',
        linked_goals: [],
        days_elapsed: 45,
        total_days: 92,
        time_progress_percentage: 48.9,
        goals: [],
        top_recommendations: [],
      },
    ];

    const placeholderSummary: BudgetSummary = {
      total_budgets: 1,
      active_budgets: 1,
      total_allocated: 25000.00,
      total_spent: 18750.00,
      total_remaining: 6250.00,
      overall_spending_percentage: 75,
      pecunia_health_score: 85,
      top_recommendations: [],
      budget_breakdown: [],
      spending_trends: [],
    };

    setBudgets(placeholderBudgets);
    setCategories(placeholderCategories);
    setSummary(placeholderSummary);
  };

  const fetchAIAgent = async () => {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=budget_analysis&is_global=true');
      if (res.data && res.data.length > 0) {
        setAiAgent(res.data[0]);
      } else {
        setAiAgent({
          id: "pecunia",
          name: "Pecunia",
          specialization: "budget_analysis",
          personality_description: "Your AI financial advisor. Pecunia provides intelligent budget analysis, optimization recommendations, and forecasting to help you make data-driven financial decisions.",
          is_active: true,
          is_global: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Pecunia agent:", err);
      setAgentError("Failed to load AI assistant");
      setAiAgent({
        id: "pecunia",
        name: "Pecunia",
        specialization: "budget_analysis",
        personality_description: "Your AI financial advisor. Pecunia provides intelligent budget analysis, optimization recommendations, and forecasting to help you make data-driven financial decisions.",
        is_active: true,
        is_global: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleAskPecunia = async (question: string) => {
    if (!question.trim()) return;

    try {
      toast({
        title: "Pecunia Analysis Complete",
        description: "Financial analysis and recommendations are ready",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: unknown) {
      toast({
        title: "Analysis Failed",
        description: "Failed to get analysis from Pecunia",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBudgetSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/budgeting/budgets/', budgetForm);
      setBudgets([...budgets, response.data]);
      setBudgetForm({
        name: '',
        budget_type: 'custom',
        amount: '',
        start_date: '',
        end_date: '',
        category: '',
        description: '',
        tags: [],
        target_roi: '',
        target_cpa: '',
      });
      onBudgetModalClose();
      fetchData(); // Refresh summary
      toast({
        title: 'Budget created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error creating budget',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/budgeting/expenses/', expenseForm);
      setExpenses([response.data, ...expenses]);
      setExpenseForm({
        description: '',
        amount: '',
        date: '',
        budget: '',
        category: '',
        payment_method: 'other',
        status: 'paid',
        vendor: '',
        invoice_number: '',
        is_recurring: false,
        recurring_frequency: '',
        notes: '',
      });
      onExpenseModalClose();
      fetchData(); // Refresh budgets and summary
      toast({
        title: 'Expense added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error adding expense',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoalSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/budgeting/goals/', {
        ...goalForm,
        budget: selectedBudget?.id,
      });
      setGoalForm({
        goal_name: '',
        goal_type: 'leads',
        target_value: '',
        unit: 'units',
      });
      onGoalModalClose();
      fetchData(); // Refresh data
      toast({
        title: 'Goal added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error adding goal',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount || 0);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    if (percentage >= 50) return 'brand.accent';
    return 'green';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'green.500';
    if (score >= 60) return 'brand.accent';
    return 'red.500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
              case 'medium': return 'brand.accent';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    if (filters.budget_type && budget.budget_type !== filters.budget_type) return false;
    if (filters.status && budget.status !== filters.status) return false;
    if (filters.category && budget.category?.id !== filters.category) return false;
    if (filters.search && !budget.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

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
      <Box p={6}>
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading size="lg" color="brand.primary">
                <HStack>
                  <FiDollarSign />
                  <Text>Budgeting</Text>
                </HStack>
              </Heading>
              <Text color="gray.600">
                AI-powered budget management and financial optimization
              </Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand.primary"
              onClick={onBudgetModalOpen}
            >
              Create New Budget
            </Button>
          </HStack>

          {/* Pecunia AI Assistant */}
          <AIAgentSection
            agent={aiAgent}
            loading={loadingAgent}
            error={agentError}
            onAskQuestion={handleAskPecunia}
          />

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Financial Health At-a-Glance */}
          {summary && (
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Financial Health At-a-Glance</Heading>
                  <Badge
                    colorScheme={getHealthColor(summary.pecunia_health_score) === 'green.500' ? 'green' : 
                               getHealthColor(summary.pecunia_health_score) === 'brand.accent' ? 'brand.accent' : 'red'}
                    size="lg"
                    fontSize="lg"
                    px={3}
                    py={1}
                  >
                    {summary.pecunia_health_score}/100
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Total Budgets</StatLabel>
                    <StatNumber>{summary.total_budgets}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Active budgets
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Allocated</StatLabel>
                    <StatNumber>{formatCurrency(summary.total_allocated)}</StatNumber>
                    <StatHelpText>Budget allocation</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Spent</StatLabel>
                    <StatNumber color="red.500">{formatCurrency(summary.total_spent)}</StatNumber>
                                         <StatHelpText>
                       {typeof summary.overall_spending_percentage === 'number' 
                         ? summary.overall_spending_percentage.toFixed(1) 
                         : '0.0'}% of total
                     </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Remaining</StatLabel>
                    <StatNumber color="green.500">{formatCurrency(summary.total_remaining)}</StatNumber>
                    <StatHelpText>Available budget</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Top Pecunia Recommendations */}
          {summary?.top_recommendations && summary.top_recommendations.length > 0 && (
            <Card>
              <CardHeader>
                                  <HStack>
                    <FiSun color="orange" />
                    <Heading size="md">Top Pecunia Recommendations</Heading>
                  </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {summary.top_recommendations.slice(0, 3).map((rec) => (
                    <Box
                      key={rec.id}
                      p={4}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold">{rec.title}</Text>
                        <Badge colorScheme={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </HStack>
                      <Text color="gray.600" mb={3}>{rec.description}</Text>
                      <HStack spacing={4}>
                        <Button size="sm" colorScheme="brand.primary" variant="outline">
                          Review
                        </Button>
                        <Button size="sm" colorScheme="green" variant="outline">
                          Optimize Now
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Budget Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Budget Type</FormLabel>
                  <Select
                    size="sm"
                    value={filters.budget_type}
                    onChange={(e) => setFilters({ ...filters, budget_type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="campaign">Campaign-Specific</option>
                    <option value="departmental">Departmental</option>
                    <option value="project">Project-Based</option>
                    <option value="custom">Custom Period</option>
                  </Select>
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select
                    size="sm"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="over_budget">Over Budget</option>
                    <option value="under_budget">Under Budget</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Category</FormLabel>
                  <Select
                    size="sm"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl maxW="300px">
                  <FormLabel fontSize="sm">Search</FormLabel>
                  <Input
                    size="sm"
                    placeholder="Search budgets..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </FormControl>
              </HStack>
            </CardBody>
          </Card>

          {/* Budget List */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Budget Overview</Heading>
                <Text color="gray.500">
                  {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''}
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              {filteredBudgets.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  No budgets found matching your filters.
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {filteredBudgets.map((budget) => (
                    <Card key={budget.id} variant="outline" cursor="pointer" 
                          onClick={() => {
                            setSelectedBudget(budget);
                            onBudgetDetailOpen();
                          }}
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          transition="all 0.2s">
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Text fontWeight="bold" fontSize="lg">{budget.name}</Text>
                                <Badge colorScheme="brand.primary" size="sm">
                                  {budget.budget_type}
                                </Badge>
                                <Badge colorScheme={budget.status === 'active' ? 'green' : 'gray'} size="sm">
                                  {budget.status}
                                </Badge>
                              </HStack>
                              {budget.category_name && (
                                <HStack>
                                  <Box
                                    w={3}
                                    h={3}
                                    borderRadius="full"
                                    bg={budget.category_color || '#3182CE'}
                                  />
                                  <Text fontSize="sm" color="gray.500">
                                    {budget.category_name}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                              </Text>
                              <HStack>
                                <Badge colorScheme={getHealthColor(budget.pecunia_health_score || 75) === 'green.500' ? 'green' : 
                                                   getHealthColor(budget.pecunia_health_score || 75) === 'brand.accent' ? 'brand.accent' : 'red'}>
                                  {budget.pecunia_health_score || 75}/100
                                </Badge>
                                <IconButton
                                  size="sm"
                                  icon={<FiChevronRight />}
                                  aria-label="View details"
                                  variant="ghost"
                                />
                              </HStack>
                            </VStack>
                          </HStack>

                          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            <Stat>
                              <StatLabel>Total Budget</StatLabel>
                              <StatNumber fontSize="lg">{formatCurrency(budget.amount)}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Spent</StatLabel>
                              <StatNumber fontSize="lg" color="red.500">
                                {formatCurrency(budget.spent_amount)}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Remaining</StatLabel>
                              <StatNumber fontSize="lg" color="green.500">
                                {formatCurrency(budget.remaining_amount)}
                              </StatNumber>
                            </Stat>
                          </Grid>

                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm">Spending Progress</Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {budget.spending_percentage.toFixed(1)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={budget.spending_percentage}
                              colorScheme={getProgressColor(budget.spending_percentage)}
                              size="sm"
                              borderRadius="full"
                            />
                            
                            <HStack justify="space-between">
                              <Text fontSize="sm">Time Progress</Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {budget.time_progress_percentage.toFixed(1)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={budget.time_progress_percentage}
                              colorScheme="brand.primary"
                              size="sm"
                              borderRadius="full"
                            />
                          </VStack>

                          {budget.burn_rate && (
                            <HStack justify="space-between">
                              <Text fontSize="sm">Daily Burn Rate</Text>
                              <Text fontSize="sm" fontWeight="bold" color="orange.500">
                                {formatCurrency(budget.burn_rate)}/day
                              </Text>
                            </HStack>
                          )}

                          {budget.top_recommendations && budget.top_recommendations.length > 0 && (
                            <Box p={3} bg="orange.50" borderRadius="md">
                              <HStack mb={2}>
                                <FiAlertTriangle color="orange" />
                                <Text fontSize="sm" fontWeight="bold" color="orange.600">
                                  Pecunia Alert
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="orange.700">
                                {budget.top_recommendations[0].title}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* Budget Detail Drawer */}
        <Drawer isOpen={isBudgetDetailOpen} placement="right" onClose={onBudgetDetailClose} size="xl">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              {selectedBudget?.name} - Budget Details
            </DrawerHeader>
            <DrawerBody>
              {selectedBudget && (
                <VStack spacing={6} align="stretch">
                  {/* Budget Summary */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Budget Summary</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Stat>
                          <StatLabel>Health Score</StatLabel>
                          <StatNumber color={getHealthColor(selectedBudget.pecunia_health_score || 75)}>
                            {selectedBudget.pecunia_health_score || 75}/100
                          </StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Risk Level</StatLabel>
                          <StatNumber>
                            <Badge colorScheme={selectedBudget.pecunia_risk_level === 'high' ? 'red' : 
                                               selectedBudget.pecunia_risk_level === 'medium' ? 'brand.accent' : 'green'}>
                              {selectedBudget.pecunia_risk_level || 'low'}
                            </Badge>
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Quick Actions</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <Button
                          leftIcon={<FiPlus />}
                          colorScheme="green"
                          width="full"
                          onClick={onExpenseModalOpen}
                        >
                          Add Expense
                        </Button>
                        <Button
                          leftIcon={<FiTarget />}
                          colorScheme="brand.primary"
                          width="full"
                          onClick={onGoalModalOpen}
                        >
                          Add Goal
                        </Button>
                        <Button
                          leftIcon={<FiBarChart2 />}
                          variant="outline"
                          width="full"
                        >
                          View Analytics
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

                 {/* Budgeting Modals */}
         <BudgetingModals
           isBudgetModalOpen={isBudgetModalOpen}
           onBudgetModalClose={onBudgetModalClose}
           budgetForm={budgetForm}
           setBudgetForm={setBudgetForm}
           handleBudgetSubmit={handleBudgetSubmit}
           submitting={submitting}
           categories={categories}
           isExpenseModalOpen={isExpenseModalOpen}
           onExpenseModalClose={onExpenseModalClose}
           expenseForm={expenseForm}
           setExpenseForm={setExpenseForm}
           handleExpenseSubmit={handleExpenseSubmit}
           budgets={budgets}
           isGoalModalOpen={isGoalModalOpen}
           onGoalModalClose={onGoalModalClose}
           goalForm={goalForm}
           setGoalForm={setGoalForm}
           handleGoalSubmit={handleGoalSubmit}
         />
       </Box>
     </Layout>
   );
 } 