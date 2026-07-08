import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aura_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount or token changes
  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        // If it's a mock token, send corresponding mock user ID headers to help local backend
        if (token.startsWith('mock-jwt-token-')) {
          headers['x-mock-user-id'] = token.replace('mock-jwt-token-', '');
        }

        const res = await fetch(`${API_URL}/api/auth/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user session:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('aura_token', data.session.access_token);
      setToken(data.session.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('aura_token', data.session.access_token);
      setToken(data.session.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    if (token && token.startsWith('mock-jwt-token-')) {
      headers['x-mock-user-id'] = token.replace('mock-jwt-token-', '');
    }

    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    setUser(prev => ({
      ...prev,
      firstName: data.profile.first_name,
      lastName: data.profile.last_name,
      phone: data.profile.phone
    }));

    return data.profile;
  };

  const getAuthHeaders = () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    if (token && token.startsWith('mock-jwt-token-')) {
      headers['x-mock-user-id'] = token.replace('mock-jwt-token-', '');
    }
    return headers;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getAuthHeaders,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
