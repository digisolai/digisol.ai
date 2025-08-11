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
  // StatHelpText,
  Progress,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  // Table,
  // Thead,
  // Tbody,
  // Tr,
  // Th,
  // Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  // Divider,
  // IconButton,
  // Tooltip,
  useToast,
  Icon,
} from '@chakra-ui/react';
import {FiPlus, FiDollarSign, FiEdit} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import { AIAgentSection } from '../components/AIAgentSection';
import ContextualAIChat from '../components/ContextualAIChat';
import api from '../services/api';
import type { AIProfile } from '../types/ai';

interface Budget {
  id: string;
  name: string;
  amount: string;
  spent_amount: string;
  remaining_amount: string;
  spending_percentage: number;
  start_date: string;
  end_date: string;
  category: string | null;
  category_name: string | null;
  is_active: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  date: string;
  budget: string;
  budget_name: string;
  category: string | null;
  category_name: string | null;
  notes: string;
}

export default function BudgetingPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiAgent, setAiAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Modal states
  const { isOpen: isBudgetModalOpen, onOpen: onBudgetModalOpen, onClose: onBudgetModalClose } = useDisclosure();
  const { isOpen: isExpenseModalOpen, onOpen: onExpenseModalOpen, onClose: onExpenseModalClose } = useDisclosure();
  const { isOpen: isCategoryModalOpen, onOpen: onCategoryModalOpen, onClose: onCategoryModalClose } = useDisclosure();
  
  // State for Pecunia Chat Modal
  const { isOpen: isPecuniaChatOpen, onOpen: onPecuniaChatOpen, onClose: onPecuniaChatClose } = useDisclosure();
  const [askPecuniaQuestion, setAskPecuniaQuestion] = useState("");

  // Form states
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    amount: '',
    start_date: '',
    end_date: '',
    category: '',
    is_active: true,
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: '',
    budget: '',
    category: '',
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
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
      const [budgetsRes, categoriesRes, expensesRes] = await Promise.all([
        api.get('/budgeting/budgets/?is_active=true'),
        api.get('/budgeting/categories/'),
        api.get('/budgeting/expenses/'),
      ]);

      setBudgets(budgetsRes.data || []);
      setCategories(categoriesRes.data || []);
      setExpenses(expensesRes.data || []);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.detail || 'Failed to load budgeting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAgent = async () => {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=budget_analysis&is_global=true');
      if (res.data && res.data.length > 0) {
        setAiAgent(res.data[0]);
      } else {
        // Fallback to default agent
        setAiAgent({
        id: "pecunia",
        name: "Pecunia",
        specialization: "budget_analysis",
        personality_description: "Meticulous, cost-conscious, optimization-focused. Provides financial breakdowns and ROI projections.",
        is_active: true
      });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Pecunia agent:", err);
      setAgentError("Failed to load AI assistant");
      // Fallback to default agent
      setAiAgent({
        id: "pecunia",
        name: "Pecunia",
        specialization: "budget_analysis",
        personality_description: "Meticulous, cost-conscious, optimization-focused. Provides financial breakdowns and ROI projections.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleBudgetSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/budgeting/budgets/', budgetForm);
      setBudgets([...budgets, response.data]);
      setBudgetForm({ name: '', amount: '', start_date: '', end_date: '', category: '', is_active: true });
      onBudgetModalClose();
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
      setExpenseForm({ description: '', amount: '', date: '', budget: '', category: '', notes: '' });
      onExpenseModalClose();
      fetchData(); // Refresh budgets to update spent amounts
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

  const handleCategorySubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/budgeting/categories/', categoryForm);
      setCategories([...categories, response.data]);
      setCategoryForm({ name: '', description: '' });
      onCategoryModalClose();
      toast({
        title: 'Category created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error creating category',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskAIAgent = (question: string) => {
    setAskPecuniaQuestion(question);
    onPecuniaChatOpen();
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    if (percentage >= 50) return 'yellow';
    return 'green';
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
      <Box p={6}>
        <Heading size="lg" mb={6} color="brand.primary">
          <HStack>
            <FiDollarSign />
            <Text>Budgeting</Text>
          </HStack>
        </Heading>

        {/* AI Budget Assistant */}
        <AIAgentSection
              agent={aiAgent} 
          loading={loadingAgent}
          error={agentError}
              onAskQuestion={handleAskAIAgent}
            />

        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Budget Overview Section */}
          <GridItem>
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Budget Overview</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    size="sm"
                    onClick={onBudgetModalOpen}
                  >
                    Add New Budget
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                {budgets.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No active budgets found. Create your first budget to get started.
                  </Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {budgets.map((budget) => (
                      <Card key={budget.id} variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{budget.name}</Text>
                                {budget.category_name && (
                                  <Badge colorScheme="blue" size="sm">
                                    {budget.category_name}
                                  </Badge>
                                )}
                              </VStack>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                              </Text>
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

                            <Box>
                              <HStack justify="space-between" mb={1}>
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
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Quick Actions Section */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Quick Actions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="green"
                      size="lg"
                      width="full"
                      onClick={onExpenseModalOpen}
                    >
                      Add New Expense
                    </Button>
                    <Button
                      leftIcon={<FiEdit />}
                      variant="outline"
                      size="lg"
                      width="full"
                      onClick={onCategoryModalOpen}
                    >
                      Manage Categories
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Recent Expenses</Heading>
                </CardHeader>
                <CardBody>
                  {expenses.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No expenses recorded yet.
                    </Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {expenses.slice(0, 5).map((expense) => (
                        <Box key={expense.id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{expense.description}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {expense.budget_name} • {new Date(expense.date).toLocaleDateString()}
                              </Text>
                            </VStack>
                            <Text fontWeight="bold" color="red.500">
                              {formatCurrency(expense.amount)}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>

        {/* Add Budget Modal */}
        <Modal isOpen={isBudgetModalOpen} onClose={onBudgetModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Budget</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Budget Name</FormLabel>
                  <Input
                    value={budgetForm.name}
                    onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                    placeholder="e.g., Q3 Marketing Budget"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                    placeholder="5000.00"
                  />
                </FormControl>

                <HStack spacing={4} width="full">
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={budgetForm.start_date}
                      onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={budgetForm.end_date}
                      onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    placeholder="Select a category"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack spacing={4} width="full" pt={4}>
                  <Button onClick={onBudgetModalClose} width="full">
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleBudgetSubmit}
                    isLoading={submitting}
                    width="full"
                  >
                    Create Budget
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Add Expense Modal */}
        <Modal isOpen={isExpenseModalOpen} onClose={onExpenseModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Expense</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="e.g., Facebook Ads Campaign"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="250.00"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Budget</FormLabel>
                  <Select
                    value={expenseForm.budget}
                    onChange={(e) => setExpenseForm({ ...expenseForm, budget: e.target.value })}
                    placeholder="Select a budget"
                  >
                    {budgets.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    placeholder="Select a category"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Textarea
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    placeholder="Additional notes about this expense"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4} width="full" pt={4}>
                  <Button onClick={onExpenseModalClose} width="full">
                    Cancel
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleExpenseSubmit}
                    isLoading={submitting}
                    width="full"
                  >
                    Add Expense
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Add Category Modal */}
        <Modal isOpen={isCategoryModalOpen} onClose={onCategoryModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Category</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Content Marketing"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4} width="full" pt={4}>
                  <Button onClick={onCategoryModalClose} width="full">
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleCategorySubmit}
                    isLoading={submitting}
                    width="full"
                  >
                    Create Category
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Pecunia Chat Modal */}
        <Modal isOpen={isPecuniaChatOpen} onClose={onPecuniaChatClose} size="6xl" maxW="90vw">
          <ModalOverlay />
          <ModalContent maxH="70vh">
            <ModalHeader>
              <HStack>
                <Icon as={FiDollarSign} color="green.500" />
                <Text>Chat with Pecunia - Budget Analysis Specialist</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <ContextualAIChat
                agentId="pecunia"
                agentName="Pecunia"
                agentSpecialization="budget_analysis"
                pageContext="budgeting"
                pageData={{ 
                  budgets,
                  categories,
                  expenses,
                  aiAgent,
                  askPecuniaQuestion 
                }}
                onClose={onPecuniaChatClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

      </Box>
    </Layout>
  );
} 