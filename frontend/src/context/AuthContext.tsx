import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'freshmart_auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          
          // Set axios default header if token exists
          if (parsedUser.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          }
        }
      } catch (err) {
        console.error('Error loading auth data:', err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // LOGIN
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      const res = await axios.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (res.data.success && res.data.user) {
        const userData: User = {
          _id: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          token: res.data.token
        };

        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

        // Clear previous cart for different user
        localStorage.removeItem('freshmart_cart'); // optional: use user-specific cart key later

        // Set axios default header
        if (userData.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }

        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }

        toast({ 
          title: 'Welcome back!', 
          description: `Logged in as ${userData.name}` 
        });
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: res.data.message || 'Invalid credentials',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err: any) {
      console.error('LOGIN ERROR DETAILS:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      let errorMessage = 'Invalid credentials';
      if (err.response?.status === 401) errorMessage = 'Invalid email or password';
      else if (err.response?.status === 500) errorMessage = 'Server error. Please try again later.';
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (!err.response) errorMessage = 'Cannot connect to server. Make sure backend is running.';

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration with:', { name, email });
      const res = await axios.post('/auth/register', { name, email, password });
      console.log('Registration response:', res.data);
      
      if (res.data.success && res.data.user) {
        const userData: User = {
          ...res.data.user,
          token: res.data.token || res.data.user.token || ''
        };

        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

        // Clear previous cart
        localStorage.removeItem('freshmart_cart');

        // Set axios default header
        if (userData.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }

        toast({ 
          title: 'Welcome!', 
          description: 'Account created successfully' 
        });

        // Redirect to dashboard
        navigate('/dashboard');
        return true;
      } else {
        toast({
          title: 'Registration failed',
          description: res.data.message || 'Could not create account',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err: any) {
      console.error('REGISTER ERROR DETAILS:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      let errorMessage = 'Could not create account';
      if (err.response?.status === 400) errorMessage = err.response.data.message || 'Invalid registration data';
      else if (err.response?.status === 500) errorMessage = 'Server error. Please try again later.';
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (!err.response) errorMessage = 'Cannot connect to server. Make sure backend is running.';

      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('freshmart_cart'); // clear cart on logout
    delete axios.defaults.headers.common['Authorization'];
    toast({ 
      title: 'Logged out', 
      description: 'You have been logged out successfully' 
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile: async () => {} // keep for now
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
