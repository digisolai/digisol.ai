import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  is_superuser?: boolean;
  
  // Profile fields
  department?: string;
  job_title?: string;
  
  // Subscription and usage tracking fields
  contacts_used_current_period?: number;
  emails_sent_current_period?: number;
  tokens_used_current_period?: number;
  ai_text_credits_used_current_period?: number;
  ai_image_credits_used_current_period?: number;
  ai_planning_requests_used_current_period?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 