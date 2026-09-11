import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL and credentials
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const requestOtp = async (email) => {
    const response = await axios.post('/auth/request-otp', { email });
    return response.data;
  };

  const verifyOtp = async (email, otp) => {
    const response = await axios.post('/auth/verify-otp', { email, otp });
    if (response.data.success) {
      setUser(response.data.data);
      setIsAuthenticated(true);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    // Assuming there's a profile update route we should call, but let's mock the UI state change for now
    // If the API had a PUT /auth/me or PUT /users/me, we would call it here.
    // Let's implement a fallback state update.
    try {
      const response = await axios.patch('/account/profile', profileData);
      if (response.data.success) {
        setUser(response.data.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        requestOtp,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
