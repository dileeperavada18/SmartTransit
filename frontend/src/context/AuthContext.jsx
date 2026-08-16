import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smarttransit_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smarttransit_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('smarttransit_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
          localStorage.setItem('smarttransit_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('smarttransit_token', jwtToken);
    localStorage.setItem('smarttransit_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role, phone) => {
    const res = await authService.register({ name, email, password, role, phone });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('smarttransit_token', jwtToken);
    localStorage.setItem('smarttransit_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const quickLoginAs = async (role) => {
    let email = 'admin@smarttransit.com';
    if (role === 'driver') email = 'driver@smarttransit.com';
    if (role === 'student') email = 'student@smarttransit.com';
    return await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('smarttransit_token');
    localStorage.removeItem('smarttransit_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        quickLoginAs,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDriver: user?.role === 'driver',
        isStudent: user?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
