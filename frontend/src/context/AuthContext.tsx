// frontend/src/context/AuthContext.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { AuthContext, type User } from './AuthContextTypes';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start as true to check token

  // Function to refresh user profile after login/register
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/accounts/me/');
      setUser({
        id: response.data.id,
        email: response.data.email,
        name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim(),
        role: response.data.role || 'user',
        is_superuser: response.data.is_superuser || false,
        department: response.data.department,
        job_title: response.data.job_title,
        // Subscription and usage tracking fields
        contacts_used_current_period: response.data.contacts_used_current_period || 0,
        emails_sent_current_period: response.data.emails_sent_current_period || 0,
        tokens_used_current_period: response.data.tokens_used_current_period || 0,
        ai_text_credits_used_current_period: response.data.ai_text_credits_used_current_period || 0,
        ai_image_credits_used_current_period: response.data.ai_image_credits_used_current_period || 0,
        ai_planning_requests_used_current_period: response.data.ai_planning_requests_used_current_period || 0,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Don't call logout here to avoid circular dependency
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Function to check if token is valid and refresh if needed
  const checkAndRefreshToken = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setLoading(false);
      return false;
    }

    try {
      // Set the token in headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Try to fetch user profile to test if token is valid
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.log("Token validation failed, attempting refresh...");
      
      try {
        // Try to refresh the token
        const response = await api.post('/accounts/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Try to fetch user profile again
        await fetchUserProfile();
        return true;
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear tokens and set as not authenticated
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    }
  }, [fetchUserProfile]);

  // Auto-authenticate on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        await checkAndRefreshToken();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [checkAndRefreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/accounts/token/', {
        email,
        password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch user profile after successful login
      await fetchUserProfile();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [fetchUserProfile]);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await api.post('/accounts/register/', userData);
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch user profile after successful registration
      await fetchUserProfile();
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }), [user, isAuthenticated, loading, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

