
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Checkbox,
  SimpleGrid,
  Text,
  Box,
} from '@chakra-ui/react';

interface BudgetingModalsProps {
  // Budget Modal
  isBudgetModalOpen: boolean;
  onBudgetModalClose: () => void;
  budgetForm: unknown;
  setBudgetForm: (form: unknown) => void;
  handleBudgetSubmit: () => void;
  submitting: boolean;
  categories: unknown[];

  // Expense Modal
  isExpenseModalOpen: boolean;
  onExpenseModalClose: () => void;
  expenseForm: unknown;
  setExpenseForm: (form: unknown) => void;
  handleExpenseSubmit: () => void;
  budgets: unknown[];

  // Goal Modal
  isGoalModalOpen: boolean;
  onGoalModalClose: () => void;
  goalForm: unknown;
  setGoalForm: (form: unknown) => void;
  handleGoalSubmit: () => void;
}

export function BudgetingModals({
  isBudgetModalOpen,
  onBudgetModalClose,
  budgetForm,
  setBudgetForm,
  handleBudgetSubmit,
  submitting,
  categories,
  isExpenseModalOpen,
  onExpenseModalClose,
  expenseForm,
  setExpenseForm,
  handleExpenseSubmit,
  budgets,
  isGoalModalOpen,
  onGoalModalClose,
  goalForm,
  setGoalForm,
  handleGoalSubmit,
}: BudgetingModalsProps) {

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount) || 0);
  };

  return (
    <>
      {/* Create Budget Modal */}
      <Modal isOpen={isBudgetModalOpen} onClose={onBudgetModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiDollarSign />
              <Text>Create New Budget</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Budget Name</FormLabel>
                <Input
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  placeholder="e.g., Q4 Marketing Budget"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Budget Type</FormLabel>
                <Select
                  value={budgetForm.budget_type}
                  onChange={(e) => setBudgetForm({ ...budgetForm, budget_type: e.target.value })}
                >
                  <option value="annual">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="campaign">Campaign-Specific</option>
                  <option value="departmental">Departmental</option>
                  <option value="project">Project-Based</option>
                  <option value="custom">Custom Period</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Total Amount</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                  placeholder="25000.00"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="full">
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
              </SimpleGrid>

              <FormControl>
                <FormLabel>Category</FormLabel>
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

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                  placeholder="Brief description of this budget"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="full">
                <FormControl>
                  <FormLabel>Target ROI (%)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={budgetForm.target_roi}
                    onChange={(e) => setBudgetForm({ ...budgetForm, target_roi: e.target.value })}
                    placeholder="15.0"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Target CPA ($)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={budgetForm.target_cpa}
                    onChange={(e) => setBudgetForm({ ...budgetForm, target_cpa: e.target.value })}
                    placeholder="50.00"
                  />
                </FormControl>
              </SimpleGrid>

              <Box width="full" p={4} bg="blue.50" borderRadius="md">
                <HStack mb={2}>
                  <FiInfo color="blue" />
                  <Text fontWeight="bold" color="blue.600">Pecunia Tip</Text>
                </HStack>
                <Text fontSize="sm" color="blue.700">
                  Set realistic targets for ROI and CPA to help Pecunia provide better optimization recommendations.
                </Text>
              </Box>

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
      <Modal isOpen={isExpenseModalOpen} onClose={onExpenseModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiDollarSign />
              <Text>Add New Expense</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g., Facebook Ads Campaign"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="full">
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
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Budget</FormLabel>
                <Select
                  value={expenseForm.budget}
                  onChange={(e) => setExpenseForm({ ...expenseForm, budget: e.target.value })}
                  placeholder="Select a budget"
                >
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name} ({formatCurrency(budget.remaining_amount)} remaining)
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
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

              <SimpleGrid columns={2} spacing={4} width="full">
                <FormControl>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    value={expenseForm.payment_method}
                    onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value })}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} width="full">
                <FormControl>
                  <FormLabel>Vendor</FormLabel>
                  <Input
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    placeholder="e.g., Facebook, Google"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Invoice Number</FormLabel>
                  <Input
                    value={expenseForm.invoice_number}
                    onChange={(e) => setExpenseForm({ ...expenseForm, invoice_number: e.target.value })}
                    placeholder="INV-2024-001"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <Checkbox
                  isChecked={expenseForm.is_recurring}
                  onChange={(e) => setExpenseForm({ ...expenseForm, is_recurring: e.target.checked })}
                >
                  This is a recurring expense
                </Checkbox>
              </FormControl>

              {expenseForm.is_recurring && (
                <FormControl>
                  <FormLabel>Recurring Frequency</FormLabel>
                  <Select
                    value={expenseForm.recurring_frequency}
                    onChange={(e) => setExpenseForm({ ...expenseForm, recurring_frequency: e.target.value })}
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="Additional notes about this expense"
                  rows={3}
                />
              </FormControl>

              <Box width="full" p={4} bg="green.50" borderRadius="md">
                <HStack mb={2}>
                  <FiInfo color="green" />
                  <Text fontWeight="bold" color="green.600">Pecunia Auto-Categorization</Text>
                </HStack>
                <Text fontSize="sm" color="green.700">
                  Pecunia will automatically categorize your expense based on the description and vendor.
                </Text>
              </Box>

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

      {/* Add Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={onGoalModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiTarget />
              <Text>Add Budget Goal</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Goal Name</FormLabel>
                <Input
                  value={goalForm.goal_name}
                  onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })}
                  placeholder="e.g., Generate 1000 Leads"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Goal Type</FormLabel>
                <Select
                  value={goalForm.goal_type}
                  onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}
                >
                  <option value="leads">Lead Generation</option>
                  <option value="conversions">Conversions</option>
                  <option value="revenue">Revenue</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="engagement">Engagement</option>
                  <option value="custom">Custom</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={2} spacing={4} width="full">
                <FormControl isRequired>
                  <FormLabel>Target Value</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={goalForm.target_value}
                    onChange={(e) => setGoalForm({ ...goalForm, target_value: e.target.value })}
                    placeholder="1000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Input
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    placeholder="leads, dollars, clicks"
                  />
                </FormControl>
              </SimpleGrid>

              <Box width="full" p={4} bg="purple.50" borderRadius="md">
                <HStack mb={2}>
                  <FiInfo color="purple" />
                  <Text fontWeight="bold" color="purple.600">Pecunia Goal Assessment</Text>
                </HStack>
                <Text fontSize="sm" color="purple.700">
                  Pecunia will assess the feasibility of your goal and provide recommendations for achieving it.
                </Text>
              </Box>

              <HStack spacing={4} width="full" pt={4}>
                <Button onClick={onGoalModalClose} width="full">
                  Cancel
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleGoalSubmit}
                  isLoading={submitting}
                  width="full"
                >
                  Add Goal
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 