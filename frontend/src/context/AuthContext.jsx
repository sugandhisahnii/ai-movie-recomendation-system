import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:5001';

const persistAuth = (payload) => {
  localStorage.setItem('token', payload.token);
  const userData = { _id: payload._id, name: payload.name, email: payload.email };
  localStorage.setItem('user', JSON.stringify(userData));
  axios.defaults.headers.common.Authorization = `Bearer ${payload.token}`;
  return userData;
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    const userData = persistAuth(res.data);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
    const userData = persistAuth(res.data);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
