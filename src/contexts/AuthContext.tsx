import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar: string | null;
  role: string;
}

interface ImpersonatedUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  impersonatedUser: ImpersonatedUser | null;
  impersonateUser: (userId: string, email: string, name: string) => Promise<void>;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('admin_token');
  });
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(() => {
    const info = localStorage.getItem('impersonated_user_info');
    return info ? JSON.parse(info) : null;
  });

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = response.data;
      
      const userRole = userData?.role;
      const isSuperuser = userData?.is_superuser;
      
      const isCurrentlyImpersonating = !!localStorage.getItem('impersonate_token');
      
      // If we are impersonating, we don't demand the impersonated user be a SUPERUSER or ADMIN.
      if (!isCurrentlyImpersonating && userRole !== "SUPERUSER" && userRole !== "ADMIN" && isSuperuser !== true) {
        logout();
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Если 401, интерцептор api.ts сам сделает logout и редирект
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated, impersonatedUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('impersonate_token');
    localStorage.removeItem('impersonated_user_info');
    setIsAuthenticated(false);
    setUser(null);
    setImpersonatedUser(null);
  };

  const impersonateUser = async (userId: string, email: string, name: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/impersonate`);
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('impersonate_token', token);
        const userInfo = { id: userId, email, name };
        localStorage.setItem('impersonated_user_info', JSON.stringify(userInfo));
        setImpersonatedUser(userInfo);
      }
    } catch (error) {
      console.error("Failed to impersonate:", error);
      throw error;
    }
  };

  const stopImpersonating = () => {
    localStorage.removeItem('impersonate_token');
    localStorage.removeItem('impersonated_user_info');
    setImpersonatedUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      impersonatedUser, 
      impersonateUser, 
      stopImpersonating 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
