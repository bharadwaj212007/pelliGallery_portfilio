import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Standard API base url. If in development, points to port 5000. In production, points to local origin.
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const verifyAdminToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        } else {
          // Token expired or invalid
          localStorage.removeItem('admin_token');
          setToken(null);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Auth verification request failed:', err.message);
        // Do not discard token immediately on network issues, keep state
      } finally {
        setLoading(false);
      }
    };

    verifyAdminToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    apiUrl: API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
