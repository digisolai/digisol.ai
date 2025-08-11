import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function AuthDebug() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const toast = useToast();

  const checkAuthStatus = async () => {
    try {
      setAuthStatus('Checking authentication...');
      
      // Check if tokens exist
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken || !refreshToken) {
        setAuthStatus('No tokens found');
        setTokenInfo({ accessToken: !!accessToken, refreshToken: !!refreshToken });
        return;
      }

      // Check if token is valid
      try {
        const response = await api.get('/accounts/me/');
        setAuthStatus('Authenticated');
        setTokenInfo({
          user: response.data,
          accessToken: 'Present',
          refreshToken: 'Present'
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          setAuthStatus('Token expired, attempting refresh...');
          
          try {
            const refreshResponse = await api.post('/accounts/token/refresh/', {
              refresh: refreshToken
            });
            
            const { access } = refreshResponse.data;
            localStorage.setItem('access_token', access);
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            // Try again
            const userResponse = await api.get('/accounts/me/');
            setAuthStatus('Token refreshed successfully');
            setTokenInfo({
              user: userResponse.data,
              accessToken: 'Refreshed',
              refreshToken: 'Present'
            });
          } catch (refreshError: any) {
            setAuthStatus('Token refresh failed');
            setTokenInfo({
              error: refreshError.response?.data || refreshError.message,
              accessToken: 'Expired',
              refreshToken: 'Present'
            });
          }
        } else {
          setAuthStatus('Authentication error');
          setTokenInfo({
            error: error.response?.data || error.message,
            accessToken: 'Present',
            refreshToken: 'Present'
          });
        }
      }
    } catch (error: any) {
      setAuthStatus('Unexpected error');
      setTokenInfo({
        error: error.message,
        accessToken: 'Unknown',
        refreshToken: 'Unknown'
      });
    }
  };

  const testAIChat = async () => {
    try {
      setAuthStatus('Testing AI chat...');
      const response = await api.post('/ai-services/gemini-chat/', {
        message: 'Hello, this is a test message',
        agent_name: 'Test Agent',
        agent_specialization: 'general'
      });
      
      setAuthStatus('AI chat test successful');
      setTokenInfo({
        aiResponse: response.data,
        accessToken: 'Working',
        refreshToken: 'Working'
      });
      
      toast({
        title: 'AI Chat Test Successful',
        description: 'The AI chat endpoint is working correctly',
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      setAuthStatus('AI chat test failed');
      setTokenInfo({
        error: error.response?.data || error.message,
        status: error.response?.status,
        accessToken: 'Failed',
        refreshToken: 'Failed'
      });
      
      toast({
        title: 'AI Chat Test Failed',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">Authentication Debug</Text>
          
          <Box>
            <Text fontWeight="semibold">Status: <Badge colorScheme={authStatus.includes('successful') || authStatus === 'Authenticated' ? 'green' : 'red'}>{authStatus}</Badge></Text>
          </Box>
          
          <Box>
            <Text fontWeight="semibold">Auth Context:</Text>
            <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
            <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
            <Text>User: {user ? `${user.name} (${user.email})` : 'None'}</Text>
          </Box>
          
          {tokenInfo && (
            <Box>
              <Text fontWeight="semibold">Token Info:</Text>
              <Text fontSize="sm" fontFamily="mono" bg="gray.100" p={2} borderRadius="md">
                {JSON.stringify(tokenInfo, null, 2)}
              </Text>
            </Box>
          )}
          
          <Button onClick={checkAuthStatus} colorScheme="blue">
            Check Auth Status
          </Button>
          
          <Button onClick={testAIChat} colorScheme="green">
            Test AI Chat
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
