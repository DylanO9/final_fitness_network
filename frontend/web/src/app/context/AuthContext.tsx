// src/context/AuthContext.tsx
'use client';
import { useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { ReactNode } from 'react';
import ApiClient from '../../utils/apiClient';

interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  bio: string;
  avatar_url: string;
  height: number;
  weight: number;
  age: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('Checking user authentication...');
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      if (token) {
        try {
          const { data, error } = await ApiClient.getCurrentUser();
          
          if (error) {
            throw new Error(error);
          }

          if (data) {
            console.log('User Verified:', data);
            setUser(data);
          }
        } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
          localStorage.removeItem('token');
          setUser(null);
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }
      } else {
        console.log('No token found in local storage');
        setUser(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
          console.log('No token found, redirecting to login...');
          window.location.href = '/login';
        }
      }
    };

    fetchUserData();
  }, []);

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
