// frontend/src/pages/BillingPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Grid,
  Divider,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import {FiCreditCard, FiCheck, FiImage} from 'react-icons/fi';
import { Layout } from '../components/Layout';
import api from '../services/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_cost: string;
  annual_cost: string;
  description: string;
  contact_limit: number;
  email_send_limit: number;
  ai_text_credits_per_month: number;
  ai_image_credits_per_month: number;
  ai_planning_requests_per_month: number;
  user_seats: number;
  support_level: string;
  includes_corporate_suite: boolean;
  stripe_price_id: string;
  stripe_annual_price_id: string;
  is_active: boolean;
}

interface CurrentPlan {
  plan_name: string;
  monthly_cost: string;
  annual_cost: string;
  description: string;
  contact_limit: number;
  email_send_limit: number;
  ai_text_credits_per_month: number;
  ai_image_credits_per_month: number;
  ai_planning_requests_per_month: number;
  user_seats: number;
  support_level: string;
  includes_corporate_suite: boolean;
  contacts_used_current_period: number;
  emails_sent_current_period: number;
  ai_text_credits_used_current_period: number;
  ai_image_credits_used_current_period: number;
  ai_planning_requests_used_current_period: number;
  subscription_status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  remaining_text_credits: number;
  remaining_image_credits: number;
  remaining_planning_requests: number;
  remaining_contacts: number;
  remaining_emails: number;
}

const BillingPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<string | null>(null);

  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch current plan and available plans
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current plan
        const currentPlanResponse = await api.get('/billing/current-plan/');
        setCurrentPlan(currentPlanResponse.data);

        // Fetch available plans
        const plansResponse = await api.get('/billing/plans/');
        setAvailablePlans(plansResponse.data);
      } catch (err: unknown) {
        console.error('Failed to fetch billing data:', err);
        setError(err.response?.data?.detail || 'Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Handle customer portal redirect
  const handleManageSubscription = async () => {
    try {
      setIsLoadingPortal(true);
      const response = await api.post('/billing/create-customer-portal-session/');
      window.location.href = response.data.url;
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to open customer portal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  // Handle plan selection
  const handleChoosePlan = async (plan: SubscriptionPlan) => {
    try {
      setIsLoadingCheckout(plan.id);
      const response = await api.post('/billing/create-checkout-session/', {
        price_id: plan.stripe_price_id,
        mode: 'subscription'
      });
      window.location.href = response.data.session_url;
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || 'Failed to create checkout session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingCheckout(null);
    }
  };

  // Helper function to format usage display
  const formatUsage = (used: number, limit: number) => {
    if (limit === -1) return `${used} / Unlimited`;
    return `${used} / ${limit}`;
  };

  // Helper function to calculate usage percentage
  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Helper function to get progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    return 'green';
  };

  if (loading) {
    return (
      <Layout>
        <Box p={8} textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading billing information...</Text>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box p={8}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={8} maxW="1200px" mx="auto">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              <Icon as={FiCreditCard} mr={3} />
              Subscription & Billing
            </Heading>
            <Text color="gray.600">
              Manage your subscription and view usage statistics
            </Text>
          </Box>

          {/* Current Plan Section */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Current Plan</Heading>
            </CardHeader>
            <CardBody>
              {currentPlan && currentPlan.plan_name ? (
                <VStack spacing={6} align="stretch">
                  {/* Plan Info */}
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="md" color="brand.primary">
                        {currentPlan.plan_name}
                      </Heading>
                      <Text color="gray.600" mt={1}>
                        {currentPlan.description}
                      </Text>
                      <HStack mt={2} spacing={4}>
                        <Text fontWeight="bold">
                          ${currentPlan.monthly_cost}/month
                        </Text>
                        <Text color="gray.500">
                          ${currentPlan.annual_cost}/year (20% discount)
                        </Text>
                      </HStack>
                    </Box>
                    <VStack align="end" spacing={2}>
                      <Badge
                        colorScheme={currentPlan.subscription_status === 'active' ? 'green' : 'orange'}
                        size="lg"
                      >
                        {currentPlan.subscription_status}
                      </Badge>
                                             {currentPlan.includes_corporate_suite && (
                         <Badge colorScheme="purple" size="lg">
                           <Icon as={FiStar} mr={1} />
                           Corporate Suite
                         </Badge>
                       )}
                    </VStack>
                  </HStack>

                  <Divider />

                  {/* Usage Statistics */}
                  <Box>
                    <Heading size="sm" mb={4}>Usage This Period</Heading>
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                      <Stat>
                        <StatLabel>Contacts</StatLabel>
                        <StatNumber>{formatUsage(currentPlan.contacts_used_current_period, currentPlan.contact_limit)}</StatNumber>
                        <Progress
                          value={getUsagePercentage(currentPlan.contacts_used_current_period, currentPlan.contact_limit)}
                          colorScheme={getProgressColor(getUsagePercentage(currentPlan.contacts_used_current_period, currentPlan.contact_limit))}
                          size="sm"
                          mt={2}
                        />
                      </Stat>
                      
                      <Stat>
                        <StatLabel>Emails Sent</StatLabel>
                        <StatNumber>{formatUsage(currentPlan.emails_sent_current_period, currentPlan.email_send_limit)}</StatNumber>
                        <Progress
                          value={getUsagePercentage(currentPlan.emails_sent_current_period, currentPlan.email_send_limit)}
                          colorScheme={getProgressColor(getUsagePercentage(currentPlan.emails_sent_current_period, currentPlan.email_send_limit))}
                          size="sm"
                          mt={2}
                        />
                      </Stat>
                      
                      <Stat>
                        <StatLabel>AI Text Credits</StatLabel>
                        <StatNumber>{formatUsage(currentPlan.ai_text_credits_used_current_period, currentPlan.ai_text_credits_per_month)}</StatNumber>
                        <Progress
                          value={getUsagePercentage(currentPlan.ai_text_credits_used_current_period, currentPlan.ai_text_credits_per_month)}
                          colorScheme={getProgressColor(getUsagePercentage(currentPlan.ai_text_credits_used_current_period, currentPlan.ai_text_credits_per_month))}
                          size="sm"
                          mt={2}
                        />
                      </Stat>
                      
                      <Stat>
                        <StatLabel>AI Image Credits</StatLabel>
                        <StatNumber>{formatUsage(currentPlan.ai_image_credits_used_current_period, currentPlan.ai_image_credits_per_month)}</StatNumber>
                        <Progress
                          value={getUsagePercentage(currentPlan.ai_image_credits_used_current_period, currentPlan.ai_image_credits_per_month)}
                          colorScheme={getProgressColor(getUsagePercentage(currentPlan.ai_image_credits_used_current_period, currentPlan.ai_image_credits_per_month))}
                          size="sm"
                          mt={2}
                        />
                      </Stat>
                      
                      <Stat>
                        <StatLabel>AI Planning Requests</StatLabel>
                        <StatNumber>{formatUsage(currentPlan.ai_planning_requests_used_current_period, currentPlan.ai_planning_requests_per_month)}</StatNumber>
                        <Progress
                          value={getUsagePercentage(currentPlan.ai_planning_requests_used_current_period, currentPlan.ai_planning_requests_per_month)}
                          colorScheme={getProgressColor(getUsagePercentage(currentPlan.ai_planning_requests_used_current_period, currentPlan.ai_planning_requests_per_month))}
                          size="sm"
                          mt={2}
                        />
                      </Stat>
                      
                      <Stat>
                        <StatLabel>User Seats</StatLabel>
                        <StatNumber>{currentPlan.user_seats}</StatNumber>
                        <StatHelpText>Maximum users</StatHelpText>
                      </Stat>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Action Buttons */}
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">
                      Next billing date: {new Date(currentPlan.current_period_end).toLocaleDateString()}
                    </Text>
                    <Button
                      variant="brandSolid"
                      leftIcon={<FiCreditCard />}
                      onClick={handleManageSubscription}
                      isLoading={isLoadingPortal}
                    >
                      Manage Subscription
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={FiCreditCard} size="48px" color="gray.400" mb={4} />
                  <Heading size="md" mb={2}>No Active Subscription</Heading>
                  <Text color="gray.600" mb={4}>
                    You currently have no active subscription. Choose a plan below to get started!
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Available Plans Section */}
          <Box>
            <Heading size="lg" mb={6}>Available Plans</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              {availablePlans.map((plan) => (
                <Card key={plan.id} bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md">{plan.name}</Heading>
                                                 {plan.includes_corporate_suite && (
                           <Badge colorScheme="purple">
                             <Icon as={FiStar} mr={1} />
                             Corporate Suite
                           </Badge>
                         )}
                      </HStack>
                      <Text color="gray.600">{plan.description}</Text>
                      <HStack spacing={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                          ${plan.monthly_cost}
                        </Text>
                        <Text color="gray.500">/month</Text>
                        <Text fontSize="lg" color="green.500">
                          ${plan.annual_cost}/year
                        </Text>
                      </HStack>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {/* Features */}
                      <VStack spacing={2} align="start">
                        <HStack>
                          <Icon as={FiUsers} color="green.500" />
                          <Text>Contacts: {plan.contact_limit === -1 ? 'Unlimited' : plan.contact_limit.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiMail} color="green.500" />
                          <Text>Emails: {plan.email_send_limit === -1 ? 'Unlimited' : plan.email_send_limit.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiZap} color="green.500" />
                          <Text>AI Text Credits: {plan.ai_text_credits_per_month === -1 ? 'Unlimited' : plan.ai_text_credits_per_month.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiImage} color="green.500" />
                          <Text>AI Image Credits: {plan.ai_image_credits_per_month === -1 ? 'Unlimited' : plan.ai_image_credits_per_month.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiTarget} color="green.500" />
                          <Text>AI Planning: {plan.ai_planning_requests_per_month === -1 ? 'Unlimited' : plan.ai_planning_requests_per_month.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiUsers} color="green.500" />
                          <Text>User Seats: {plan.user_seats}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiCheck} color="green.500" />
                          <Text>Support: {plan.support_level}</Text>
                        </HStack>
                      </VStack>

                      <Divider />

                      {/* Action Button */}
                      <Button
                        variant="brandSolid"
                        size="lg"
                        onClick={() => handleChoosePlan(plan)}
                        isLoading={isLoadingCheckout === plan.id}
                        loadingText="Redirecting..."
                      >
                        {currentPlan?.plan_name === plan.name ? 'Current Plan' : 'Choose Plan'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};

export default BillingPage; 