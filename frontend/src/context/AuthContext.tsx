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
        tenant_id: response.data.tenant,
        is_tenant_admin: response.data.is_tenant_admin,
        is_hr_admin: response.data.is_hr_admin || false,
        is_superuser: response.data.is_superuser || false,
        role: response.data.role,
        // Subscription and usage tracking fields
        has_corporate_suite: response.data.has_corporate_suite || false,
        contacts_used_current_period: response.data.contacts_used_current_period || 0,
        emails_sent_current_period: response.data.emails_sent_current_period || 0,
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
    console.log('AuthContext: Login attempt for', email); // Debug log
    try {
      console.log('AuthContext: Making API request to /accounts/token/'); // Debug log
      const response = await api.post('/accounts/token/', { email, password });
      console.log('AuthContext: Login API response received'); // Debug log
      const { access, refresh } = response.data;
      console.log('AuthContext: Storing tokens in localStorage'); // Debug log
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      console.log('AuthContext: Fetching user profile...'); // Debug log
      await fetchUserProfile();
      console.log('AuthContext: Login process completed successfully'); // Debug log
      return response.data; // Return data so calling component can navigate
    } catch (error: unknown) {
      console.error("AuthContext: Login failed:", error instanceof Error ? error.message : 'Unknown error');
      console.error("AuthContext: Full error object:", error); // Debug log
      throw error;
    }
  }, [fetchUserProfile]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string, confirmPassword: string) => {
    try {
      await api.post('/accounts/register/', {
        email,
        password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });
      // Directly call login after successful registration, then return its data
      const loginResponse = await login(email, password); // Auto-login after register
      return loginResponse;
    } catch (error: unknown) {
      console.error("Registration failed:", error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login'; // Use window.location for full page redirect
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  }), [user, isAuthenticated, loading, login, logout, register]);

  console.log("AuthProvider rendering - loading:", loading, "isAuthenticated:", isAuthenticated);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

