import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string; // Assuming tenant is a string ID
  is_tenant_admin: boolean;
  is_hr_admin: boolean;
  role: string;
  // Subscription and usage tracking fields
  has_corporate_suite: boolean;
  contacts_used_current_period: number;
  emails_sent_current_period: number;
  ai_text_credits_used_current_period: number;
  ai_image_credits_used_current_period: number;
  ai_planning_requests_used_current_period: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ access: string; refresh: string }>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string, confirmPassword: string) => Promise<{ access: string; refresh: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 