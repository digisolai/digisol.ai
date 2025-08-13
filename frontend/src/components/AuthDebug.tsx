import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  const testLogin = async () => {
    try {
      const response = await api.post('/accounts/token/', {
        email: 'admin@digisolai.ca',
        password: 'admin123' // You'll need to set this password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Reload the page to trigger auth check
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const testCurrentPlan = async () => {
    try {
      const response = await api.get('/subscription-billing/current-plan/');
      console.log('Current plan response:', response.data);
    } catch (error) {
      console.error('Current plan failed:', error);
    }
  };

  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <VStack spacing={2} align="start">
        <Text fontWeight="bold">Auth Debug Info:</Text>
        <Text>Loading: {loading.toString()}</Text>
        <Text>Authenticated: {isAuthenticated.toString()}</Text>
        <Text>User: {user ? user.email : 'None'}</Text>
        <Text>Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</Text>
        
        <Button size="sm" onClick={testLogin}>
          Test Login
        </Button>
        
        <Button size="sm" onClick={testCurrentPlan}>
          Test Current Plan
        </Button>
      </VStack>
    </Box>
  );
};
