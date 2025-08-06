import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiCheckCircle, FiAlertCircle, FiAward, FiZap } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface SubscriptionStatus {
  plan_name: string | null;
  subscription_status: string;
  monthly_cost: string;
  description: string;
  contact_limit: number;
  email_send_limit: number;
  ai_text_credits_per_month: number;
  ai_image_credits_per_month: number;
  ai_planning_requests_per_month: number;
  contacts_used_current_period: number;
  emails_sent_current_period: number;
  ai_text_credits_used_current_period: number;
  ai_image_credits_used_current_period: number;
  ai_planning_requests_used_current_period: number;
  remaining_text_credits: number;
  remaining_image_credits: number;
  remaining_planning_requests: number;
  remaining_contacts: number;
  remaining_emails: number;
}

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from subscription-billing first, then fallback to billing
      let response;
      try {
        response = await api.get('/subscription-billing/current-plan/');
      } catch (err) {
        // Fallback to billing endpoint
        response = await api.get('/billing/current-plan/');
      }
      
      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      setError('Failed to load subscription information');
      
      // Set default values for no subscription
      setSubscription({
        plan_name: null,
        subscription_status: 'no_subscription',
        monthly_cost: '0.00',
        description: 'No active subscription',
        contact_limit: 0,
        email_send_limit: 0,
        ai_text_credits_per_month: 0,
        ai_image_credits_per_month: 0,
        ai_planning_requests_per_month: 0,
        contacts_used_current_period: 0,
        emails_sent_current_period: 0,
        ai_text_credits_used_current_period: 0,
        ai_image_credits_used_current_period: 0,
        ai_planning_requests_used_current_period: 0,
        remaining_text_credits: 0,
        remaining_image_credits: 0,
        remaining_planning_requests: 0,
        remaining_contacts: 0,
        remaining_emails: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Navigate to billing page
    window.location.href = '/billing';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'green';
      case 'past_due':
        return 'orange';
      case 'canceled':
      case 'unpaid':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      case 'no_subscription':
        return 'No Subscription';
      default:
        return status;
    }
  };

  const formatUsage = (used: number, limit: number) => {
    if (limit === -1) return `${used} / Unlimited`;
    if (limit === 0) return `${used} / No Limit`;
    return `${used} / ${limit}`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    return 'green';
  };

  if (loading) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <Text>Loading subscription status...</Text>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const hasSubscription = subscription?.subscription_status && 
                         subscription.subscription_status !== 'no_subscription';

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" color="brand.primary">
              <Icon as={FiAward} mr={2} />
              Subscription Status
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {user?.email}
            </Text>
          </VStack>
          <Badge 
            colorScheme={getStatusColor(subscription?.subscription_status || 'no_subscription')}
            fontSize="sm"
            px={3}
            py={1}
          >
            {getStatusText(subscription?.subscription_status || 'no_subscription')}
          </Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Current Plan */}
          <Box>
            <Text fontWeight="bold" mb={2}>Current Plan</Text>
            {hasSubscription ? (
              <VStack align="start" spacing={2}>
                <Text fontSize="lg" color="brand.primary">
                  {subscription?.plan_name}
                </Text>
                <Text color="gray.600">
                  ${subscription?.monthly_cost}/month
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {subscription?.description}
                </Text>
              </VStack>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>No Active Subscription</AlertTitle>
                  <AlertDescription>
                    You're currently on the free tier. Upgrade to access all features and higher limits.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Usage Statistics */}
          <Box>
            <Text fontWeight="bold" mb={4}>Usage This Period</Text>
            <VStack spacing={4} align="stretch">
              {/* Contacts */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm">Contacts</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatUsage(subscription?.contacts_used_current_period || 0, subscription?.contact_limit || 0)}
                  </Text>
                </HStack>
                <Progress 
                  value={getUsagePercentage(subscription?.contacts_used_current_period || 0, subscription?.contact_limit || 0)}
                  colorScheme={getProgressColor(getUsagePercentage(subscription?.contacts_used_current_period || 0, subscription?.contact_limit || 0))}
                  size="sm"
                />
              </Box>

              {/* Emails */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm">Emails Sent</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatUsage(subscription?.emails_sent_current_period || 0, subscription?.email_send_limit || 0)}
                  </Text>
                </HStack>
                <Progress 
                  value={getUsagePercentage(subscription?.emails_sent_current_period || 0, subscription?.email_send_limit || 0)}
                  colorScheme={getProgressColor(getUsagePercentage(subscription?.emails_sent_current_period || 0, subscription?.email_send_limit || 0))}
                  size="sm"
                />
              </Box>

              {/* AI Text Credits */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm">AI Text Credits</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatUsage(subscription?.ai_text_credits_used_current_period || 0, subscription?.ai_text_credits_per_month || 0)}
                  </Text>
                </HStack>
                <Progress 
                  value={getUsagePercentage(subscription?.ai_text_credits_used_current_period || 0, subscription?.ai_text_credits_per_month || 0)}
                  colorScheme={getProgressColor(getUsagePercentage(subscription?.ai_text_credits_used_current_period || 0, subscription?.ai_text_credits_per_month || 0))}
                  size="sm"
                />
              </Box>

              {/* AI Image Credits */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm">AI Image Credits</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatUsage(subscription?.ai_image_credits_used_current_period || 0, subscription?.ai_image_credits_per_month || 0)}
                  </Text>
                </HStack>
                <Progress 
                  value={getUsagePercentage(subscription?.ai_image_credits_used_current_period || 0, subscription?.ai_image_credits_per_month || 0)}
                  colorScheme={getProgressColor(getUsagePercentage(subscription?.ai_image_credits_used_current_period || 0, subscription?.ai_image_credits_per_month || 0))}
                  size="sm"
                />
              </Box>
            </VStack>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <VStack spacing={3}>
            {!hasSubscription ? (
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                onClick={handleUpgrade}
                leftIcon={<FiZap />}
              >
                Upgrade Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                width="full"
                onClick={handleUpgrade}
              >
                Manage Subscription
              </Button>
            )}
            
            <Text fontSize="xs" color="gray.500" textAlign="center">
              All features are available for exploration. Upgrade for higher limits and priority support.
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
} 