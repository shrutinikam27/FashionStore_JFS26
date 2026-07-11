import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_URL = 'http://localhost:8080/api';

// Create custom axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('fs_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fs_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Set theme from localStorage or default to light
  const [theme, setTheme] = useState(localStorage.getItem('fs_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Configure request interceptor to append authorization token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only force-logout on 401 Unauthorized (expired/invalid token)
        // Do NOT logout on 403 - that can happen on public endpoints due to security config
        if (error.response && error.response.status === 401) {
          if (!error.config.url.includes('/auth/login')) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const data = response.data;
      
      setToken(data.token);
      setUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        id: data.userId
      });

      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_user', JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        id: data.userId
      }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  };

  const register = async (email, password, firstName, lastName, phone) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, { idToken: credential });
      const data = response.data;
      
      setToken(data.token);
      setUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        id: data.userId
      });

      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_user', JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        id: data.userId
      }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Google authentication failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
  };

  const value = {
    token,
    user,
    loading,
    theme,
    toggleTheme,
    login,
    register,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
