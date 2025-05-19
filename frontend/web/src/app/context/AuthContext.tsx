// src/context/AuthContext.tsx
'use client';
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

import { useEffect } from 'react';
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Everytime the app is refreshed grab the local storage token and check if the user is logged in
  useEffect(() => {
    console.log('Checking user authentication...');
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
        console.log('Token:', token);
      if (token) {
          // Hit API to get user data
          try {
            const response = await fetch('http://localhost:5001/api/users/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('User Verified:', data);
            // Set user data in state
            setUser(data.user);
          } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            // If there is an error, clear the token
            localStorage.removeItem('token');
            setUser(null);
            // Optionally, you can redirect to login page
            window.location.href = '/login';
          }
      } else {
        console.log('No token found in local storage');
        // If there is no token, set user to null
        setUser(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
          // Optionally, you can redirect to login page
          console.log('No token found, redirecting to login...');
          window.location.href = '/login';
        }
      }
    };

    fetchUserData();
  }, []);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
