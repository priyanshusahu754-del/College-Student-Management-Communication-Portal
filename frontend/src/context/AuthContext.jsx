// React hooks aur Context API import kar rahe hain
import React, { createContext, useContext, useState, useEffect } from 'react';
// Backend API service axios instance
import api from '../services/api';

// Authentication State ke liye global React Context create kar rahe hain
const AuthContext = createContext(null);

// AuthProvider component jo poore app me user authentication state distribute karta hai
export const AuthProvider = ({ children }) => {
  // User state initialize kar rahe hain (LocalStorage se persisted user data load karte hain)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // JWT Token state initialize kar rahe hain
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  // Initial loading state jab tak token session verify nahi hota
  const [loading, setLoading] = useState(true);

  // App load hone par token verify karke user profile fetch karne ka effect
  useEffect(() => {
    const verifySession = async () => {
      // Agar token hai toh backend se fresh profile mangwate hain
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data.user) {
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          // Token expire hone ya invalid hone par user ko logout kar dete hain
          console.error("Session verification failed", err);
          logout();
        }
      }
      // Loading screen band kar rahe hain
      setLoading(false);
    };

    verifySession();
  }, [token]);

  // Login action function: Backend API par email aur password bhejkar JWT token aur profile receive karta hai
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { access_token, user: loggedUser } = res.data.data;
      // LocalStorage me token aur user data persist kar rahe hain
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      // React state update kar rahe hain
      setToken(access_token);
      setUser(loggedUser);
      return loggedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Logout action function: Backend token invalidate karta hai aur local state clear karta hai
  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Network error ko ignore kar rahe hain
    } finally {
      // Local storage clear kar rahe hain
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // State reset kar rahe hain
      setToken(null);
      setUser(null);
    }
  };

  // Profile update hone par state synchronize karne ka method
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Role check helper function (e.g. isRole('admin'), isRole('teacher'))
  const isRole = (role) => {
    return user && user.role === role;
  };

  // Context value object render kar rahe hain
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook: Kisi bhi React component me directly auth state access karne ke liye
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

