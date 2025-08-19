import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicUser, SignupInput, LoginInput } from '@archoops/types';

interface AuthContextType {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // Fetch current user
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<PublicUser | null> => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null; // Not authenticated
          }
          throw new Error('Failed to fetch user');
        }
        
        return response.json();
      } catch (error) {
        // Only log non-401 errors since 401 is expected when not logged in
        if (error instanceof Error && error.message !== 'Failed to fetch user') {
          console.error('Auth check failed:', error);
        }
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Set the user data immediately from the login response
      queryClient.setQueryData(['auth', 'me'], data.user);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        // Log response details for debugging
        console.log('Signup response status:', response.status);
        console.log('Signup response headers:', response.headers);

        if (!response.ok) {
          // Try to parse error response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
          } else {
            // If not JSON, get text response for debugging
            const errorText = await response.text();
            console.error('Non-JSON error response:', errorText);
            throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
          }
        }

        // Try to parse successful response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          // If not JSON, log the response for debugging
          const responseText = await response.text();
          console.error('Non-JSON success response:', responseText);
          throw new Error('Server returned invalid response format');
        }
      } catch (error) {
        console.error('Signup error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Set the user data immediately from the signup response
      queryClient.setQueryData(['auth', 'me'], data.user);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const login = async (credentials: LoginInput) => {
    await loginMutation.mutateAsync(credentials);
  };

  const signup = async (data: SignupInput) => {
    await signupMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || signupMutation.isPending,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
